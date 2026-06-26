import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { resolveGraph } from './graph.js';
import { discoverChanges, findChange } from './changes.js';

export function validate(targetPath, changeName) {
  const smoothDir = join(targetPath, 'smooth');

  if (!existsSync(smoothDir)) {
    console.log('smooth: 尚未初始化。请先运行 `smooth init`。');
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
    console.log('没有可校验的活跃变更。');
    return;
  }

  let allValid = true;

  for (const { id, dir } of targets) {
    if (!dir || !existsSync(dir)) {
      console.log(`  ✗ ${id} — 未找到`);
      allValid = false;
      continue;
    }

    const { errors, warnings } = validateChange(dir);
    const valid = errors.length === 0;
    if (!valid) allValid = false;

    const icon = valid ? '✓' : '✗';
    const counts = [];
    if (errors.length) counts.push(`${errors.length} 个错误`);
    if (warnings.length) counts.push(`${warnings.length} 个提醒`);

    console.log(`  ${icon} ${id}${counts.length ? ' — ' + counts.join(', ') : ''}`);
    for (const e of errors) console.log(`      ✗ ${e}`);
    for (const w of warnings) console.log(`      ⚠ ${w}`);
  }

  console.log();
  if (allValid) {
    console.log('  所有变更结构有效。');
  } else {
    console.log('  有些变更存在错误。');
  }
}

export function validateChange(changeDir) {
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

  // product.md is required after optional research.
  const researchPath = join(changeDir, 'research.md');
  const hasResearch = existsSync(researchPath);
  const productPath = join(changeDir, 'product.md');
  if (!existsSync(productPath)) {
    if (hasResearch) {
      warnings.push('已有 research.md，但还没有 product.md — 前置调研完成后应继续 `/smooth:product`');
    } else {
      errors.push('缺少 product.md — 每个变更都需要需求说明');
    }
  } else {
    const content = readFileSync(productPath, 'utf-8').trim();
    if (content.length < 20) {
      warnings.push('product.md 看起来太短（少于 20 个字符）');
    }
  }

  if (!existsSync(join(changeDir, 'workpad.md'))) {
    warnings.push('缺少 workpad.md — harness 过程记录还没有开始');
  }

  // tasks.md format check
  const tasksPath = join(changeDir, 'tasks.md');
  if (existsSync(tasksPath)) {
    const content = readFileSync(tasksPath, 'utf-8');
    const taskLines = (content.match(/^- \[[ x]\].+/gm) || []);
    if (taskLines.length === 0) {
      warnings.push('tasks.md 没有任务项（应使用 `- [ ]` 或 `- [x]`）');
    }
  }

  const lessonsPath = join(changeDir, 'lessons.md');
  if (existsSync(lessonsPath)) {
    const content = readFileSync(lessonsPath, 'utf-8');
    const usesOldCheckFormat = /Candidate check:/i.test(content);
    if (usesOldCheckFormat) {
      warnings.push('lessons.md 使用旧的 `Candidate check` 格式 — 请改用 `Harness improvement` 或 `Harness 改进`，并写清 Type/Target/Idea');
    }
    if (!usesOldCheckFormat && hasLessonContent(content) && !(/Harness improvement:|Harness 改进：?/i.test(content))) {
      warnings.push('lessons.md 有经验内容，但缺少 `Harness improvement` 或 `Harness 改进` 目标');
    }
  }

  // Unexpected files (subdirectories are allowed — e.g. nested phases)
  const expected = new Set([
    'research.md',
    'product.md',
    'technical.md',
    'tasks.md',
    'workpad.md',
    'verify.md',
    'pitfalls.md',
    'lessons.md',
  ]);
  const entries = readdirSync(changeDir);
  for (const entry of entries) {
    if (expected.has(entry) || entry.startsWith('.')) continue;
    if (statSync(join(changeDir, entry)).isDirectory()) continue;
    warnings.push(`未预期的文件：${entry}`);
  }

  return { errors, warnings };
}

function hasLessonContent(content) {
  const body = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .join('\n');

  if (!body) return false;
  return !/no notable (pitfalls?|lessons?)|没有(明显|可复用|值得记录)(的)?(踩坑|经验)|无(明显|可复用|值得记录)?(踩坑|经验)/i.test(body);
}
