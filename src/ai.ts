export type AIProvider = 'openai' | 'gemini' | 'anthropic';

export const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', model: 'gpt-6-luna', modelLabel: 'GPT-6 Luna' },
  { id: 'gemini', name: 'Google Gemini', model: 'gemini-3.5-flash-lite', modelLabel: 'Gemini 3.5 Flash-Lite' },
  { id: 'anthropic', name: 'Anthropic Claude', model: 'claude-haiku-5-5', modelLabel: 'Claude Haiku 5.5' },
] as const;

export function getAIProvider(provider: AIProvider) {
  const configuration = AI_PROVIDERS.find(item => item.id === provider);
  if (!configuration) throw new Error('Choose one of the supported AI providers.');
  return configuration;
}

interface GenerateJsonRequest {
  provider: AIProvider;
  apiKey: string;
  systemPrompt: string;
  input: string;
  schema: Record<string, unknown>;
  schemaName: string;
  maxOutputTokens?: number;
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readOutput(provider: AIProvider, payload: unknown): string {
  const data = record(payload);
  const cutShort = () => new Error('The output was cut short. Try fewer tasks or a shorter input.');
  const blocked = () => new Error('The provider declined or blocked this request. Review the input.');
  let text = '';

  if (provider === 'openai') {
    if (data.status === 'incomplete') {
      if (record(data.incomplete_details).reason === 'content_filter') throw blocked();
      throw cutShort();
    }
    if (data.status !== 'completed') throw new Error('The provider did not complete the output.');
    for (const item of list(data.output)) {
      const message = record(item);
      if (message.type !== 'message') continue;
      for (const item of list(message.content)) {
        const part = record(item);
        if (part.type === 'refusal') throw blocked();
        if (part.type === 'output_text' && typeof part.text === 'string') text += part.text;
      }
    }
  } else if (provider === 'gemini') {
    if (record(data.promptFeedback).blockReason) throw blocked();
    const candidate = record(list(data.candidates)[0]);
    if (candidate.finishReason === 'MAX_TOKENS') throw cutShort();
    if (candidate.finishReason !== 'STOP') throw blocked();
    for (const item of list(record(candidate.content).parts)) {
      const part = record(item);
      if (part.thought !== true && typeof part.text === 'string') text += part.text;
    }
  } else {
    if (data.stop_reason === 'max_tokens') throw cutShort();
    if (data.stop_reason === 'refusal') throw blocked();
    if (data.stop_reason !== 'end_turn') throw new Error('The provider did not complete the output.');
    for (const item of list(data.content)) {
      const part = record(item);
      if (part.type === 'text' && typeof part.text === 'string') text += part.text;
    }
  }

  if (!text.trim()) throw new Error('The provider returned no usable output.');
  return text;
}

// Send the supplied credential only to the selected provider's official endpoint.
export async function generateJson(request: GenerateJsonRequest): Promise<unknown> {
  const configuration = getAIProvider(request.provider);
  const apiKey = request.apiKey.trim();
  if (!apiKey) throw new Error(`Enter your ${configuration.name} API key.`);
  const maxOutputTokens = Math.min(8192, Math.max(256, request.maxOutputTokens ?? 8192));
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let url: string;
  let body: Record<string, unknown>;

  if (request.provider === 'openai') {
    url = 'https://api.openai.com/v1/responses';
    headers.Authorization = `Bearer ${apiKey}`;
    body = {
      model: configuration.model,
      instructions: request.systemPrompt,
      input: request.input,
      store: false,
      reasoning: { effort: 'low' },
      max_output_tokens: maxOutputTokens,
      text: { format: { type: 'json_schema', name: request.schemaName, strict: true, schema: request.schema } },
    };
  } else if (request.provider === 'gemini') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${configuration.model}:generateContent`;
    headers['x-goog-api-key'] = apiKey;
    body = {
      systemInstruction: { parts: [{ text: request.systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: request.input }] }],
      generationConfig: {
        maxOutputTokens,
        responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema: request.schema } },
      },
    };
  } else {
    url = 'https://api.anthropic.com/v1/messages';
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2026-10-21';
    // Anthropic requires an explicit opt-in for user-supplied keys in browsers.
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
    body = {
      model: configuration.model,
      max_tokens: maxOutputTokens,
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.input }],
      thinking: { type: 'disabled' },
      output_config: { effort: 'low', format: { type: 'json_schema', schema: request.schema } },
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal,
        credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store',
      });
    } catch (error) {
      if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
        throw new Error('The request timed out. Try a shorter input.');
      }
      throw new Error(`Could not reach ${configuration.name}. Check network access and browser API access.`);
    }

    // Avoid displaying raw provider errors, which can contain credential details.
    if (!response.ok) {
      const advice = response.status === 401 || response.status === 403
        ? 'Check this provider\'s API key and model access.'
        : response.status === 429 ? 'Check quota, billing and rate limits.'
          : response.status === 404 ? 'Check model availability for this account.'
            : 'Try again later.';
      throw new Error(`${configuration.name}: HTTP ${response.status}. ${advice}`);
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      if (controller.signal.aborted) throw new Error('The request timed out. Try a shorter input.');
      throw new Error('The provider returned an invalid JSON response.');
    }
    const text = readOutput(request.provider, payload);
    try {
      const result: unknown = JSON.parse(text);
      if (result === null || typeof result !== 'object' || Array.isArray(result)) throw new Error('Expected an object.');
      return result;
    } catch {
      throw new Error('The provider output was not a valid JSON object.');
    }
  } finally {
    clearTimeout(timer);
  }
}
