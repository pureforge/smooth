import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { discoverChanges, findChange } from './changes.js';

test('discoverChanges recognizes research-only changes', () => {
  const root = mkdtempSync(join(tmpdir(), 'smooth-changes-'));
  const change = join(root, 'smooth', 'foo');
  mkdirSync(change, { recursive: true });
  writeFileSync(join(change, 'research.md'), '# 前置调研\n');

  const changes = discoverChanges(join(root, 'smooth'));

  assert.deepEqual(changes.map((c) => c.id), ['foo']);
  assert.equal(findChange(join(root, 'smooth'), 'foo')?.id, 'foo');
});

test('discoverChanges does not let container research hide phased changes', () => {
  const root = mkdtempSync(join(tmpdir(), 'smooth-changes-'));
  const container = join(root, 'smooth', 'big');
  const phase = join(container, 'phase-1');
  mkdirSync(phase, { recursive: true });
  writeFileSync(join(container, 'research.md'), '# 前置调研\n');
  writeFileSync(join(phase, 'product.md'), '# 产品需求\n\n第一阶段。\n');

  const changes = discoverChanges(join(root, 'smooth'));

  assert.deepEqual(changes.map((c) => c.id), ['big/phase-1']);
  assert.equal(findChange(join(root, 'smooth'), 'big/phase-1')?.id, 'big/phase-1');
});
