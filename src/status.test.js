import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { list } from './status.js';

test('list suggests research or product when no active changes exist', () => {
  const root = mkdtempSync(join(tmpdir(), 'smooth-status-'));
  mkdirSync(join(root, 'smooth', 'changes'), { recursive: true });
  mkdirSync(join(root, 'smooth', 'memory'), { recursive: true });
  mkdirSync(join(root, 'smooth', 'archive'), { recursive: true });

  const lines = captureLog(() => list(root));

  assert.ok(lines.some((line) => line.includes('/smooth:research "你的主题"')));
  assert.ok(lines.some((line) => line.includes('/smooth:product "你的想法"')));
});

function captureLog(fn) {
  const original = console.log;
  const lines = [];
  console.log = (...args) => lines.push(args.join(' '));
  try {
    fn();
  } finally {
    console.log = original;
  }
  return lines;
}
