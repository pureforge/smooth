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
