import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { resolveGraph, isReadyForApply, getTaskProgress, formatStatus } from './graph.js';

export function status(targetPath, changeName) {
  const changesDir = join(targetPath, 'smooth', 'changes');

  if (!existsSync(changesDir)) {
    console.log('smooth: not initialized. Run `smooth init` first.');
    return;
  }

  const active = readdirSync(changesDir).filter((name) => {
    return name !== 'archive' && statSync(join(changesDir, name)).isDirectory();
  });

  if (!changeName) {
    if (active.length === 0) {
      console.log('No active changes.');
      return;
    }
    if (active.length === 1) {
      changeName = active[0];
    } else {
      console.log('Multiple active changes. Specify one:\n');
      for (const name of active) console.log(`  smooth status ${name}`);
      return;
    }
  }

  const changeDir = join(changesDir, changeName);
  if (!existsSync(changeDir)) {
    console.log(`Change "${changeName}" not found.`);
    return;
  }

  console.log(`\n  Change: ${changeName}\n`);
  console.log(formatStatus(changeDir));
  console.log();
}

export function list(targetPath) {
  const changesDir = join(targetPath, 'smooth', 'changes');

  if (!existsSync(changesDir)) {
    console.log('smooth: not initialized. Run `smooth init` first.');
    return;
  }

  const active = readdirSync(changesDir).filter((name) => {
    return name !== 'archive' && statSync(join(changesDir, name)).isDirectory();
  });

  if (active.length === 0) {
    console.log('No active changes.\n');
    console.log('Start one with: /smooth:product "your idea"');
    return;
  }

  console.log(`Active changes (${active.length}):\n`);
  for (const name of active) {
    const changeDir = join(changesDir, name);
    const graph = resolveGraph(changeDir);
    const done = graph.filter((a) => a.status === 'done').map((a) => a.id);
    const progress = getTaskProgress(changeDir);
    const taskInfo = progress ? ` [${progress.done}/${progress.total}]` : '';
    console.log(`  ${name}  (${done.join(' → ') || 'empty'})${taskInfo}`);
  }
  console.log();
}
