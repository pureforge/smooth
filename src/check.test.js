import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { check } from './check.js';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'smooth-check-'));
  const change = join(root, 'smooth', 'foo');
  mkdirSync(change, { recursive: true });
  writeFileSync(join(change, 'product.md'), '# Product Requirements\n\nBuild foo.\n');
  writeFileSync(join(change, 'tasks.md'), '# Tasks\n\n- [x] Build foo\n');
  return root;
}

test('check runs configured commands and records evidence', () => {
  const root = fixture();
  writeFileSync(join(root, 'smooth.config.json'), JSON.stringify({
    checks: [{ id: 'ok', command: 'node -e "console.log(42)"' }],
  }));

  captureLog(() => {
    assert.equal(check(root, 'foo'), true);
  });

  const verify = readFileSync(join(root, 'smooth', 'foo', 'verify.md'), 'utf-8');
  assert.match(verify, /Automated Check Run/);
  assert.match(verify, /\| ok \| pass \|/);
  assert.match(verify, /42/);
});

test('check reports configured command failures', () => {
  const root = fixture();
  writeFileSync(join(root, 'smooth.config.json'), JSON.stringify({
    checks: [{ id: 'fail', command: 'node -e "process.exit(2)"' }],
  }));

  captureLog(() => {
    assert.equal(check(root, 'foo', { record: false }), false);
  });
});

test('check prefers make verify over package scripts when both exist', () => {
  const root = fixture();
  writeFileSync(join(root, 'Makefile'), 'verify:\n\t@echo make-verify\n');
  writeFileSync(join(root, 'package.json'), JSON.stringify({
    scripts: {
      test: 'node -e "process.exit(2)"',
    },
  }));

  captureLog(() => {
    assert.equal(check(root, 'foo', { record: false }), true);
  });
});

test('check summarizes warnings separately from clean passes', () => {
  const root = fixture();
  const lines = captureLog(() => {
    assert.equal(check(root, 'foo', { record: false }), true);
  });

  assert.ok(lines.some((line) => line.includes('Checks passed with warnings.')));
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
