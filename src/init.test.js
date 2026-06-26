import test from 'node:test';
import assert from 'node:assert/strict';
import { closeSync, existsSync, mkdtempSync, openSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';
import { detectTools, init } from './init.js';

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
  assert.match(proc.stderr, /没有初始化任何有效 AI 工具/);
  assert.equal(existsSync(join(root, 'smooth')), false);
});

test('help describes auto-detected tools and smooth check', () => {
  const proc = spawnSync(process.execPath, ['bin/smooth.js', 'help'], {
    cwd: process.cwd(),
    encoding: 'utf-8',
  });

  assert.equal(proc.status, 0);
  assert.match(proc.stdout, /默认：自动检测/);
  assert.match(proc.stdout, /smooth check \[name\] \[--no-record\]/);
});

test('init creates conversation memory plus research and learn commands and skills', async () => {
  const root = mkdtempSync(join(tmpdir(), 'smooth-init-'));

  await captureLog(() => init(root, ['claude']));

  assert.ok(existsSync(join(root, 'smooth', 'memory', 'user.md')));
  assert.ok(existsSync(join(root, 'smooth', 'memory', 'pitfalls.md')));
  assert.ok(existsSync(join(root, 'smooth', 'memory', 'domains', 'README.md')));
  assert.ok(existsSync(join(root, 'smooth', 'changes')));
  assert.ok(existsSync(join(root, 'smooth', 'archive')));
  assert.ok(existsSync(join(root, '.claude', 'commands', 'smooth', 'research.md')));
  assert.ok(existsSync(join(root, '.claude', 'commands', 'smooth', 'learn.md')));
  assert.ok(existsSync(join(root, '.claude', 'skills', 'smooth-research', 'SKILL.md')));
  assert.ok(existsSync(join(root, '.claude', 'skills', 'smooth-learn', 'SKILL.md')));

  const userMemory = readFileSync(join(root, 'smooth', 'memory', 'user.md'), 'utf-8');
  assert.match(userMemory, /用户记忆/);
  assert.match(userMemory, /纠正与反驳/);
});

async function captureLog(fn) {
  const originalLog = console.log;
  const originalError = console.error;
  console.log = () => {};
  console.error = () => {};
  try {
    return await fn();
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}
