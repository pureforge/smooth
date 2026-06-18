import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { validateChange } from './validate.js';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'smooth-validate-'));
  const change = join(root, 'smooth', 'foo');
  mkdirSync(change, { recursive: true });
  writeFileSync(join(change, 'product.md'), '# Product Requirements\n\nBuild foo.\n');
  writeFileSync(join(change, 'tasks.md'), '# Tasks\n\n- [x] Build foo\n');
  return change;
}

test('validate warns on old Candidate check lessons format', () => {
  const change = fixture();
  writeFileSync(join(change, 'lessons.md'), `# Lessons

- Search existing utilities before adding a new helper.
  - Source: pitfalls.md#duplicate-helper
  - Candidate check: duplicate utility detection
`);

  const { warnings } = validateChange(change, 'foo');

  assert.ok(warnings.some((w) => w.includes('Candidate check')));
  assert.equal(warnings.filter((w) => w.includes('lessons.md')).length, 1);
});

test('validate accepts lessons with harness improvement target', () => {
  const change = fixture();
  writeFileSync(join(change, 'lessons.md'), `# Lessons

## Search existing utilities before adding a new helper
- Source: pitfalls.md#duplicate-helper
- Applies to: code-generation
- Harness improvement:
  - Type: generation-rule
  - Target: smooth-apply template
  - Idea: Search existing utilities before creating new helpers.
- Mechanical option: duplicate code check
`);

  const { warnings } = validateChange(change, 'foo');

  assert.equal(warnings.some((w) => w.includes('Candidate check')), false);
  assert.equal(warnings.some((w) => w.includes('no `Harness improvement`')), false);
});

test('validate warns when lesson content has no harness improvement target', () => {
  const change = fixture();
  writeFileSync(join(change, 'lessons.md'), `# Lessons

## Search existing utilities before adding a new helper
- Source: pitfalls.md#duplicate-helper
- Applies to: code-generation
`);

  const { warnings } = validateChange(change, 'foo');

  assert.ok(warnings.some((w) => w.includes('no `Harness improvement`')));
});

test('validate allows explicit no notable lessons note', () => {
  const change = fixture();
  writeFileSync(join(change, 'lessons.md'), `# Lessons

No notable lessons.
`);

  const { warnings } = validateChange(change, 'foo');

  assert.equal(warnings.some((w) => w.includes('lessons.md')), false);
});
