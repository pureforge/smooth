import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { formatStatus } from './graph.js';

function fixture() {
  const change = mkdtempSync(join(tmpdir(), 'smooth-graph-'));
  mkdirSync(change, { recursive: true });
  writeFileSync(join(change, 'product.md'), '# 产品需求\n\n构建 foo。\n');
  writeFileSync(join(change, 'tasks.md'), '# 任务\n\n- [x] 构建 foo\n');
  return change;
}

test('formatStatus sends completed tasks to verify before archive', () => {
  const change = fixture();
  const status = formatStatus(change);

  assert.match(status, /下一步：\/smooth:verify/);
  assert.match(status, /可以验证/);
  assert.doesNotMatch(status, /下一步：\/smooth:product/);
  assert.doesNotMatch(status, /research（前置调研）/);
});

test('formatStatus allows archive after verify exists', () => {
  const change = fixture();
  writeFileSync(join(change, 'verify.md'), '# 验证\n\n检查通过。\n');
  const status = formatStatus(change);

  assert.match(status, /下一步：\/smooth:archive/);
  assert.match(status, /可以归档/);
});

test('formatStatus shows research as optional before product exists', () => {
  const change = mkdtempSync(join(tmpdir(), 'smooth-graph-'));
  mkdirSync(change, { recursive: true });
  writeFileSync(join(change, 'research.md'), '# 前置调研\n\n已验证事实。\n');

  const status = formatStatus(change);

  assert.match(status, /research（前置调研）/);
  assert.match(status, /下一步：\/smooth:product/);
});
