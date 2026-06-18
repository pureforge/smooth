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
    console.log('smooth: not initialized. Run `smooth init` first.');
    return false;
  }

  const change = selectChange(smoothDir, changeName);
  if (changeName && !change) {
    console.log(`Change "${changeName}" not found.`);
    return false;
  }

  if (change) console.log(`\n  Change: ${change.id}`);

  const checks = [
    ...(change ? [artifactCheck(change)] : []),
    ...loadProjectChecks(targetPath),
  ];

  if (checks.length === 0) {
    console.log('No checks configured or detected.');
    console.log(`Add ${CONFIG_FILE} with a "checks" array, define make verify, or add package scripts like lint/test/typecheck/build.`);
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
    console.log(`\n  Evidence recorded in smooth/${change.id}/verify.md`);
  }

  console.log();
  if (failed) {
    console.log('  Some checks failed.');
  } else if (warned) {
    console.log('  Checks passed with warnings.');
  } else {
    console.log('  All checks passed.');
  }
  return !failed;
}

function selectChange(smoothDir, changeName) {
  if (changeName) return findChange(smoothDir, changeName);

  const active = discoverChanges(smoothDir);
  if (active.length === 1) return active[0];
  if (active.length > 1) {
    console.log('Multiple active changes. Running project checks without recording evidence.');
    console.log('Specify one to record check results:\n');
    for (const c of active) console.log(`  smooth check ${c.id}`);
    console.log();
  }
  return null;
}

function artifactCheck(change) {
  return {
    id: 'smooth-artifacts',
    description: 'Validate smooth change artifact structure',
    run: () => {
      const { errors, warnings } = validateChange(change.dir, change.id);
      const lines = [];
      for (const e of errors) lines.push(`ERROR: ${e}`);
      for (const w of warnings) lines.push(`WARN: ${w}`);
      return {
        status: errors.length ? 'fail' : warnings.length ? 'warn' : 'pass',
        output: lines.join('\n') || 'Artifact structure is valid.',
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
      description: `Parse ${CONFIG_FILE}`,
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
      return [{ id: 'verify', command: 'make verify', description: 'Project verification target' }];
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
          description: `Detected package script: ${script}`,
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
    command: spec.command || '(built-in)',
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
    writeFileSync(verifyPath, '# Verify\n\n');
  }

  const timestamp = new Date().toISOString();
  const lines = [];
  lines.push(`\n## Automated Check Run - ${timestamp}\n`);
  lines.push('| Check | Result | Command |');
  lines.push('|---|---|---|');
  for (const r of results) {
    lines.push(`| ${escapeCell(r.id)} | ${r.status} | \`${escapeCell(r.command)}\` |`);
  }

  const interesting = results.filter((r) => r.status !== 'pass' || r.output);
  for (const r of interesting) {
    lines.push(`\n### ${r.id}`);
    if (r.description) lines.push(`\n${r.description}`);
    lines.push(`\nResult: **${r.status}** (${r.durationMs}ms)`);
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
  return `${output.slice(0, OUTPUT_LIMIT)}\n... output truncated ...`;
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'check';
}

function escapeCell(s) {
  return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
