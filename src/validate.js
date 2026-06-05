import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { resolveGraph } from './graph.js';
import { discoverChanges, findChange } from './changes.js';

export function validate(targetPath, changeName) {
  const smoothDir = join(targetPath, 'smooth');

  if (!existsSync(smoothDir)) {
    console.log('smooth: not initialized. Run `smooth init` first.');
    return;
  }

  let targets;
  if (changeName) {
    const change = findChange(smoothDir, changeName);
    targets = change ? [change] : [{ id: changeName, dir: null }];
  } else {
    targets = discoverChanges(smoothDir);
  }

  if (targets.length === 0) {
    console.log('No active changes to validate.');
    return;
  }

  let allValid = true;

  for (const { id, dir } of targets) {
    if (!dir || !existsSync(dir)) {
      console.log(`  ✗ ${id} — not found`);
      allValid = false;
      continue;
    }

    const { errors, warnings } = validateChange(dir, id);
    const valid = errors.length === 0;
    if (!valid) allValid = false;

    const icon = valid ? '✓' : '✗';
    const counts = [];
    if (errors.length) counts.push(`${errors.length} error${errors.length > 1 ? 's' : ''}`);
    if (warnings.length) counts.push(`${warnings.length} warning${warnings.length > 1 ? 's' : ''}`);

    console.log(`  ${icon} ${id}${counts.length ? ' — ' + counts.join(', ') : ''}`);
    for (const e of errors) console.log(`      ✗ ${e}`);
    for (const w of warnings) console.log(`      ⚠ ${w}`);
  }

  console.log();
  if (allValid) {
    console.log('  All changes valid.');
  } else {
    console.log('  Some changes have errors.');
  }
}

function validateChange(changeDir, name) {
  const errors = [];
  const warnings = [];

  // Check graph ordering violations
  const graph = resolveGraph(changeDir);
  for (const node of graph) {
    if (node.status === 'done') {
      // Check if any of its deps are NOT done (ordering violation)
      for (const dep of node.deps) {
        const depNode = graph.find((n) => n.id === dep);
        if (depNode && depNode.status !== 'done') {
          warnings.push(`${node.id} exists but dependency "${dep}" is missing`);
        }
      }
    }
  }

  // product.md is required
  const productPath = join(changeDir, 'product.md');
  if (!existsSync(productPath)) {
    errors.push('Missing product.md — every change needs requirements');
  } else {
    const content = readFileSync(productPath, 'utf-8').trim();
    if (content.length < 20) {
      warnings.push('product.md looks too short (< 20 chars)');
    }
  }

  // tasks.md format check
  const tasksPath = join(changeDir, 'tasks.md');
  if (existsSync(tasksPath)) {
    const content = readFileSync(tasksPath, 'utf-8');
    const taskLines = (content.match(/^- \[[ x]\].+/gm) || []);
    if (taskLines.length === 0) {
      warnings.push('tasks.md has no task items (expected `- [ ]` or `- [x]`)');
    }
  }

  // Unexpected files (subdirectories are allowed — e.g. nested phases)
  const expected = new Set(['product.md', 'technical.md', 'tasks.md', 'verify.md']);
  const entries = readdirSync(changeDir);
  for (const entry of entries) {
    if (expected.has(entry) || entry.startsWith('.')) continue;
    if (statSync(join(changeDir, entry)).isDirectory()) continue;
    warnings.push(`Unexpected file: ${entry}`);
  }

  return { errors, warnings };
}
