import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const COMMANDS_DIR = join(process.cwd(), 'templates', 'commands');
const SKILLS_DIR = join(process.cwd(), 'templates', 'skills');

test('command and skill template bodies stay in sync', () => {
  const drifted = [];
  for (const file of templateFiles()) {
    if (file === 'learn.md') continue;

    const commandBody = readTemplateBody(join(COMMANDS_DIR, file));
    const skillBody = readTemplateBody(join(SKILLS_DIR, file));
    if (commandBody !== skillBody) drifted.push(file);
  }

  assert.deepEqual(drifted, []);
});

test('learn command remains fallback while learn skill remains proactive', () => {
  const commandBody = readTemplateBody(join(COMMANDS_DIR, 'learn.md'));
  const skillBody = readTemplateBody(join(SKILLS_DIR, 'learn.md'));

  assert.notEqual(commandBody, skillBody);
  assert.match(commandBody, /兜底命令/);
  assert.match(skillBody, /主动判断/);
});

test('workflow templates include memory and output guardrails', () => {
  for (const file of templateFiles()) {
    if (file === 'learn.md') continue;

    const commandBody = readTemplateBody(join(COMMANDS_DIR, file));
    assert.match(commandBody, /记忆意识/, `${file} should include memory awareness`);
    assert.match(commandBody, /对话输出/, `${file} should include output guidance`);
  }
});

function templateFiles() {
  return readdirSync(COMMANDS_DIR)
    .filter((file) => file.endsWith('.md'))
    .sort();
}

function readTemplateBody(filePath) {
  return readFileSync(filePath, 'utf-8').replace(/^---\n[\s\S]*?\n---\n/, '');
}
