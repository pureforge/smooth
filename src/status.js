import { existsSync } from 'fs';
import { join } from 'path';
import { resolveGraph, getTaskProgress, formatStatus } from './graph.js';
import { discoverChanges, findChange } from './changes.js';

export function status(targetPath, changeName) {
  const changesDir = join(targetPath, 'smooth');

  if (!existsSync(changesDir)) {
    console.log('smooth: not initialized. Run `smooth init` first.');
    return;
  }

  const active = discoverChanges(changesDir);

  if (!changeName) {
    if (active.length === 0) {
      console.log('No active changes.');
      return;
    }
    if (active.length === 1) {
      changeName = active[0].id;
    } else {
      console.log('Multiple active changes. Specify one:\n');
      for (const c of active) console.log(`  smooth status ${c.id}`);
      return;
    }
  }

  const change = findChange(changesDir, changeName);
  if (!change) {
    console.log(`Change "${changeName}" not found.`);
    return;
  }

  console.log(`\n  Change: ${change.id}\n`);
  console.log(formatStatus(change.dir));
  console.log();
}

export function list(targetPath) {
  const changesDir = join(targetPath, 'smooth');

  if (!existsSync(changesDir)) {
    console.log('smooth: not initialized. Run `smooth init` first.');
    return;
  }

  const active = discoverChanges(changesDir);

  if (active.length === 0) {
    console.log('No active changes.\n');
    console.log('Start one with: /smooth:product "your idea"');
    return;
  }

  console.log(`Active changes (${active.length}):\n`);
  for (const { id, dir } of active) {
    const graph = resolveGraph(dir);
    const done = graph.filter((a) => a.status === 'done').map((a) => a.id);
    const progress = getTaskProgress(dir);
    const taskInfo = progress ? ` [${progress.done}/${progress.total}]` : '';
    console.log(`  ${id}  (${done.join(' → ') || 'empty'})${taskInfo}`);
  }
  console.log();
}
