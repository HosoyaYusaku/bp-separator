import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readAnalysis } from '../src/analysis.ts';

const tasks = ['Print the forms', 'Approve the policy'];
function result() {
  return { items: [
    { task: tasks[0], category: 'HYBRID', reason: 'Physical handling', prescription: 'Use automation support' },
    { task: tasks[1], category: 'HUMAN_ESSENTIAL', reason: 'Final responsibility', prescription: 'Human approval' },
  ] };
}

test('keeps valid task analyses paired with the original labels', () => {
  const actual = readAnalysis(result(), tasks);
  assert.equal(actual[0].task, tasks[0]);
  assert.equal(actual[0].category, 'HYBRID');
  assert.equal(actual[1].task, tasks[1]);
  assert.equal(actual[1].category, 'HUMAN_ESSENTIAL');
});

test('rejects reordered task analyses rather than relabeling them', () => {
  const value = result();
  value.items.reverse();
  assert.throws(() => readAnalysis(value, tasks), /task order|task text/i);
});

test('rejects duplicated task results even when the count matches', () => {
  const value = result();
  value.items[1] = value.items[0];
  assert.throws(() => readAnalysis(value, tasks), /task order|task text/i);
});

test('rejects missing results and unsupported categories before rendering', () => {
  const value = result();
  assert.throws(() => readAnalysis({ items: [value.items[0]] }, tasks), /one result per task/i);
  value.items[0].category = 'NOT_A_CATEGORY';
  assert.throws(() => readAnalysis(value, tasks), /category/i);
});

test('rejects empty report fields while tolerating surrounding task whitespace', () => {
  const value = result();
  value.items[0].reason = ' ';
  assert.throws(() => readAnalysis(value, tasks), /report field/i);
  value.items[0].reason = 'Physical handling';
  value.items[0].task = '  ' + tasks[0] + '  ';
  assert.equal(readAnalysis(value, tasks)[0].task, tasks[0]);
});
