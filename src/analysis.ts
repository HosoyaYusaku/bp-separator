export type Category = 'AI_OPTIMAL' | 'HYBRID' | 'HUMAN_ESSENTIAL';

export interface AnalysisResult {
  task: string;
  category: Category;
  reason: string;
  prescription: string;
}

// All providers return the same report structure; validate it before rendering.
export const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          task: { type: 'string' },
          category: { type: 'string', enum: ['AI_OPTIMAL', 'HYBRID', 'HUMAN_ESSENTIAL'] },
          reason: { type: 'string' },
          prescription: { type: 'string' }
        },
        required: ['task', 'category', 'reason', 'prescription'],
        additionalProperties: false
      }
    }
  },
  required: ['items'],
  additionalProperties: false
};

export function readAnalysis(value: unknown, tasks: string[]): AnalysisResult[] {
  const items = value !== null && typeof value === 'object' && 'items' in value ? value.items : null;
  if (!Array.isArray(items) || items.length !== tasks.length) {
    throw new Error('The analysis did not return one result per task. Try again with fewer tasks.');
  }
  return items.map((value: unknown, index) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('The analysis returned an invalid task result.');
    }
    const item = value as Record<string, unknown>;
    if (!['task', 'category', 'reason', 'prescription'].every(key => typeof item[key] === 'string' && (item[key] as string).trim()) ||
        !['AI_OPTIMAL', 'HYBRID', 'HUMAN_ESSENTIAL'].includes(item.category as string)) {
      throw new Error('The analysis returned an invalid task category or report field.');
    }
    if ((item.task as string).trim() !== tasks[index].trim()) {
      throw new Error('The returned task order or task text differs from the input. Try the analysis again.');
    }
    // Display a result only after its task text matches the original input.
    return { task: tasks[index], category: item.category as Category, reason: item.reason as string, prescription: item.prescription as string };
  });
}
