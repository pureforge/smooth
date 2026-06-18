import test from 'node:test';
import assert from 'node:assert/strict';
import { closeSync, mkdtempSync, openSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';
import { detectTools } from './init.js';

test('detectTools recognizes Cursor legacy .cursorrules file', () => {
  const root = mkdtempSync(join(tmpdir(), 'smooth-init-'));
  closeSync(openSync(join(root, '.cursorrules'), 'w'));

  assert.ok(detectTools(root).includes('cursor'));
});

test('init exits non-zero when no valid tool is provided', () => {
  const root = mkdtempSync(join(tmpdir(), 'smooth-init-'));
  const proc = spawnSync(process.execPath, ['bin/smooth.js', 'init', root, '--tool', 'unknown'], {
    cwd: process.cwd(),
    encoding: 'utf-8',
  });

  assert.notEqual(proc.status, 0);
  assert.match(proc.stderr, /No valid AI tools were initialized/);
});
