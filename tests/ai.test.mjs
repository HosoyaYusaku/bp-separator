import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const modulePath = path.resolve(import.meta.dirname, '../src/ai.ts');
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const schema = { type: 'object', properties: { label: { type: 'string' } }, required: ['label'], additionalProperties: false };
const request = provider => ({ provider, apiKey: `unit-test-${provider}-key`, systemPrompt: 'Classify the task.', input: '日程を調整する', schema, schemaName: 'classification', maxOutputTokens: 4096 });
async function api() {
  assert.ok(existsSync(modulePath), 'Three-provider JSON transport has not been implemented');
  return import(pathToFileURL(modulePath).href);
}
const payload = {
  openai: { status: 'completed', output: [{ type: 'reasoning', summary: [] }, { type: 'message', content: [{ type: 'output_text', text: '{"label":"日程管理"}' }] }] },
  gemini: { candidates: [{ finishReason: 'STOP', content: { parts: [{ thought: true, text: 'not JSON reasoning' }, { text: '{"label":"日程管理"}' }] } }] },
  anthropic: { stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: 'not JSON reasoning' }, { type: 'text', text: '{"label":"日程管理"}' }] },
};
function mockResponse(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
}

test('OpenAI uses its own key, strict Responses output and no response storage', async () => {
  const { generateJson } = await api();
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    calls++;
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const headers = new Headers(init.headers);
    assert.equal(headers.get('authorization'), 'Bearer unit-test-openai-key');
    assert.equal(headers.has('x-api-key'), false);
    assert.equal(headers.has('x-goog-api-key'), false);
    const body = JSON.parse(init.body);
    assert.equal(body.model, 'gpt-6-luna');
    assert.equal(body.store, false);
    assert.equal(body.reasoning.effort, 'low');
    assert.equal(body.text.format.type, 'json_schema');
    assert.equal(body.text.format.strict, true);
    assert.deepEqual(body.text.format.schema, schema);
    assert.equal(body.instructions, 'Classify the task.');
    assert.equal(init.credentials, 'omit');
    assert.equal(init.referrerPolicy, 'no-referrer');
    return mockResponse(payload.openai);
  };
  assert.deepEqual(await generateJson(request('openai')), { label: '日程管理' });
  assert.equal(calls, 1);
});

test('Gemini uses current REST structured output and excludes thought parts', async () => {
  const { generateJson } = await api();
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent');
    assert.equal(new Headers(init.headers).get('x-goog-api-key'), 'unit-test-gemini-key');
    const body = JSON.parse(init.body);
    assert.equal(body.generationConfig.responseFormat.text.mimeType, 'APPLICATION_JSON');
    assert.deepEqual(body.generationConfig.responseFormat.text.schema, schema);
    assert.equal(body.generationConfig.maxOutputTokens, 4096);
    return mockResponse(payload.gemini);
  };
  assert.deepEqual(await generateJson(request('gemini')), { label: '日程管理' });
});

test('Claude opts in to browser BYOK with current API version and JSON schema', async () => {
  const { generateJson } = await api();
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://api.anthropic.com/v1/messages');
    const headers = new Headers(init.headers);
    assert.equal(headers.get('x-api-key'), 'unit-test-anthropic-key');
    assert.equal(headers.get('anthropic-version'), '2026-10-21');
    assert.equal(headers.get('anthropic-dangerous-direct-browser-access'), 'true');
    assert.equal(headers.has('authorization'), false);
    const body = JSON.parse(init.body);
    assert.equal(body.model, 'claude-haiku-5-5');
    assert.equal(body.thinking.type, 'disabled');
    assert.equal(body.output_config.effort, 'low');
    assert.deepEqual(body.output_config.format.schema, schema);
    assert.equal(body.max_tokens, 4096);
    return mockResponse(payload.anthropic);
  };
  assert.deepEqual(await generateJson(request('anthropic')), { label: '日程管理' });
});

for (const provider of ['openai', 'gemini', 'anthropic']) {
  test(`${provider} rejects truncated output before parsing partial JSON`, async () => {
    const { generateJson } = await api();
    const truncated = {
      openai: { status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output: [] },
      gemini: { candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: '{' }] } }] },
      anthropic: { stop_reason: 'max_tokens', content: [{ type: 'text', text: '{' }] },
    };
    globalThis.fetch = async () => mockResponse(truncated[provider]);
    await assert.rejects(generateJson(request(provider)), /cut short/i);
  });
  test(`${provider} rejects a refusal or blocked request`, async () => {
    const { generateJson } = await api();
    const refused = {
      openai: { status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'Cannot assist' }] }] },
      gemini: { promptFeedback: { blockReason: 'SAFETY' } },
      anthropic: { stop_reason: 'refusal', content: [] },
    };
    globalThis.fetch = async () => mockResponse(refused[provider]);
    await assert.rejects(generateJson(request(provider)), /declined|blocked/i);
  });
}

test('HTTP rate limits do not retry or expose provider error contents', async () => {
  const { generateJson } = await api();
  let calls = 0;
  globalThis.fetch = async () => { calls++; return mockResponse({ error: { message: request('openai').apiKey } }, 429); };
  await assert.rejects(generateJson(request('openai')), error => /429/.test(error.message) && !error.message.includes('unit-test-openai-key'));
  assert.equal(calls, 1);
});

test('missing credentials are rejected before any network request', async () => {
  const { generateJson } = await api();
  globalThis.fetch = async () => { assert.fail('Missing credentials reached the network'); };
  await assert.rejects(generateJson({ ...request('gemini'), apiKey: '  ' }), /API key/i);
});

test('unknown providers cannot direct a key to a custom endpoint', async () => {
  const { generateJson } = await api();
  globalThis.fetch = async () => { assert.fail('Unknown provider reached the network'); };
  await assert.rejects(generateJson(request('unknown')), /provider/i);
});

test('network errors do not echo credentials from an exception', async () => {
  const { generateJson } = await api();
  globalThis.fetch = async () => { throw new Error(`Network failed ${request('anthropic').apiKey}`); };
  await assert.rejects(generateJson(request('anthropic')), error => /reach/i.test(error.message) && !error.message.includes('unit-test-anthropic-key'));
});

test('malformed JSON does not become a renderable result', async () => {
  const { generateJson } = await api();
  globalThis.fetch = async () => mockResponse({ ...payload.anthropic, content: [{ type: 'text', text: '{invalid' }] });
  await assert.rejects(generateJson(request('anthropic')), /JSON/i);
});

test('a successful response without usable text is rejected', async () => {
  const { generateJson } = await api();
  globalThis.fetch = async () => mockResponse({ status: 'completed', output: [{ type: 'reasoning', summary: [] }] });
  await assert.rejects(generateJson(request('openai')), /output/i);
});

test('aborted requests report a timeout rather than rendering a partial result', async () => {
  const { generateJson } = await api();
  globalThis.fetch = async () => { throw new DOMException('Aborted', 'AbortError'); };
  await assert.rejects(generateJson(request('gemini')), /timed out/i);
});
