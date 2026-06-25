import { existsSync, readFileSync, appendFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { discoverChanges, findChange } from './changes.js';
import { validateChange } from './validate.js';

const CONFIG_FILE = 'smooth.config.json';
const DEFAULT_SCRIPT_ORDER = ['lint', 'typecheck', 'test', 'build'];
const OUTPUT_LIMIT = 6000;

export function check(targetPath, changeName, options = {}) {
  const smoothDir = join(targetPath, 'smooth');
  const record = options.record !== false;

  if (!existsSync(smoothDir)) {
    console.log('smooth: 尚未初始化。请先运行 `smooth init`。');
    return false;
  }

  const change = selectChange(smoothDir, changeName);
  if (changeName && !change) {
    console.log(`未找到变更：“${changeName}”。`);
    return false;
  }

  if (change) console.log(`\n  变更：${change.id}`);

  const checks = [
    ...(change ? [artifactCheck(change)] : []),
    ...loadProjectChecks(targetPath),
  ];

  if (checks.length === 0) {
    console.log('没有配置或检测到检查。');
    console.log(`可以添加带 "checks" 数组的 ${CONFIG_FILE}，定义 make verify，或添加 lint/test/typecheck/build 等 package scripts。`);
    return true;
  }

  const results = [];
  for (const spec of checks) {
    const result = runCheck(targetPath, spec);
    results.push(result);
    printResult(result);
  }

  const failed = results.some((r) => r.status === 'fail');
  const warned = results.some((r) => r.status === 'warn');
  if (change && record) {
    recordResults(change, results);
    console.log(`\n  证据已记录到 smooth/${change.id}/verify.md`);
  }

  console.log();
  if (failed) {
    console.log('  有检查失败。');
  } else if (warned) {
    console.log('  检查通过，但有提醒。');
  } else {
    console.log('  所有检查通过。');
  }
  return !failed;
}

function selectChange(smoothDir, changeName) {
  if (changeName) return findChange(smoothDir, changeName);

  const active = discoverChanges(smoothDir);
  if (active.length === 1) return active[0];
  if (active.length > 1) {
    console.log('有多个活跃变更。将只运行项目检查，不记录到某个变更里。');
    console.log('如需记录检查结果，请指定一个变更：\n');
    for (const c of active) console.log(`  smooth check ${c.id}`);
    console.log();
  }
  return null;
}

function artifactCheck(change) {
  return {
    id: 'smooth-artifacts',
    description: '校验 Smooth 变更产物结构',
    run: () => {
      const { errors, warnings } = validateChange(change.dir, change.id);
      const lines = [];
      for (const e of errors) lines.push(`ERROR: ${e}`);
      for (const w of warnings) lines.push(`WARN: ${w}`);
      return {
        status: errors.length ? 'fail' : warnings.length ? 'warn' : 'pass',
        output: lines.join('\n') || '变更产物结构有效。',
      };
    },
  };
}

function loadProjectChecks(targetPath) {
  const configured = loadConfiguredChecks(targetPath);
  if (configured.length > 0) return configured;
  return detectChecks(targetPath);
}

function loadConfiguredChecks(targetPath) {
  const path = join(targetPath, CONFIG_FILE);
  if (!existsSync(path)) return [];

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf-8'));
  } catch (err) {
    return [{
      id: 'smooth-config',
      description: `解析 ${CONFIG_FILE}`,
      run: () => ({ status: 'fail', output: err.message }),
    }];
  }

  if (!Array.isArray(parsed.checks)) return [];
  return parsed.checks
    .map((entry) => normalizeCheck(entry))
    .filter(Boolean);
}

function normalizeCheck(entry) {
  if (typeof entry === 'string') {
    return { id: slug(entry), command: entry };
  }
  if (!entry || typeof entry !== 'object' || !entry.command) return null;
  return {
    id: entry.id || slug(entry.command),
    command: entry.command,
    description: entry.description || '',
  };
}

function detectChecks(targetPath) {
  const checks = [];

  const makefile = join(targetPath, 'Makefile');
  if (existsSync(makefile)) {
    const body = readFileSync(makefile, 'utf-8');
    if (/^verify:/m.test(body)) {
      return [{ id: 'verify', command: 'make verify', description: '项目验证目标' }];
    }
  }

  const packageJson = join(targetPath, 'package.json');
  if (existsSync(packageJson)) {
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
    } catch {
      pkg = null;
    }
    const scripts = pkg?.scripts || {};
    const runner = packageRunner(targetPath, pkg);
    for (const script of DEFAULT_SCRIPT_ORDER) {
      if (scripts[script]) {
        checks.push({
          id: script,
          command: `${runner} run ${script}`,
          description: `检测到 package script：${script}`,
        });
      }
    }
  }

  return dedupeChecks(checks);
}

function packageRunner(targetPath, pkg) {
  const declared = typeof pkg?.packageManager === 'string' ? pkg.packageManager.split('@')[0] : '';
  if (declared === 'pnpm' || declared === 'yarn' || declared === 'bun') return declared;
  if (existsSync(join(targetPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(targetPath, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(targetPath, 'bun.lockb'))) return 'bun';
  return 'npm';
}

function dedupeChecks(checks) {
  const seen = new Set();
  const out = [];
  for (const check of checks) {
    if (seen.has(check.id)) continue;
    seen.add(check.id);
    out.push(check);
  }
  return out;
}

function runCheck(targetPath, spec) {
  const started = Date.now();
  let status;
  let output;

  if (spec.run) {
    const result = spec.run();
    status = result.status;
    output = result.output || '';
  } else {
    const proc = spawnSync(spec.command, {
      cwd: targetPath,
      shell: true,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 20,
    });
    status = proc.status === 0 ? 'pass' : 'fail';
    output = [proc.stdout, proc.stderr].filter(Boolean).join('\n').trim();
    if (!output && proc.error) output = proc.error.message;
  }

  return {
    id: spec.id,
    description: spec.description || '',
    command: spec.command || '（内置）',
    status,
    durationMs: Date.now() - started,
    output: trimOutput(output),
  };
}

function printResult(result) {
  const icon = result.status === 'pass' ? '✓' : result.status === 'warn' ? '⚠' : '✗';
  console.log(`  ${icon} ${result.id}  ${result.command}`);
}

function recordResults(change, results) {
  const verifyPath = join(change.dir, 'verify.md');
  if (!existsSync(verifyPath)) {
    writeFileSync(verifyPath, '# 验证\n\n');
  }

  const timestamp = new Date().toISOString();
  const lines = [];
  lines.push(`\n## 自动化检查记录 - ${timestamp}\n`);
  lines.push('| 检查 | 结果 | 命令 |');
  lines.push('|---|---|---|');
  for (const r of results) {
    lines.push(`| ${escapeCell(r.id)} | ${r.status} | \`${escapeCell(r.command)}\` |`);
  }

  const interesting = results.filter((r) => r.status !== 'pass' || r.output);
  for (const r of interesting) {
    lines.push(`\n### ${r.id}`);
    if (r.description) lines.push(`\n${r.description}`);
    lines.push(`\n结果：**${r.status}**（${r.durationMs}ms）`);
    if (r.output) {
      lines.push('\n```text');
      lines.push(r.output);
      lines.push('```');
    }
  }

  appendFileSync(verifyPath, `${lines.join('\n')}\n`);
}

function trimOutput(output) {
  if (!output) return '';
  if (output.length <= OUTPUT_LIMIT) return output;
  return `${output.slice(0, OUTPUT_LIMIT)}\n... 输出已截断 ...`;
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'check';
}

function escapeCell(s) {
  return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
