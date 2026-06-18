import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { formatStatus } from './graph.js';

function fixture() {
  const change = mkdtempSync(join(tmpdir(), 'smooth-graph-'));
  mkdirSync(change, { recursive: true });
  writeFileSync(join(change, 'product.md'), '# Product\n\nBuild foo.\n');
  writeFileSync(join(change, 'tasks.md'), '# Tasks\n\n- [x] Build foo\n');
  return change;
}

test('formatStatus sends completed tasks to verify before archive', () => {
  const change = fixture();
  const status = formatStatus(change);

  assert.match(status, /Next: \/smooth:verify/);
  assert.match(status, /ready to verify/);
  assert.doesNotMatch(status, /Next: \/smooth:product/);
});

test('formatStatus allows archive after verify exists', () => {
  const change = fixture();
  writeFileSync(join(change, 'verify.md'), '# Verify\n\nChecks passed.\n');
  const status = formatStatus(change);

  assert.match(status, /Next: \/smooth:archive/);
  assert.match(status, /ready to archive/);
});
