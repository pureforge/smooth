import { existsSync } from 'fs';
import { join } from 'path';
import { resolveGraph, getTaskProgress, formatStatus } from './graph.js';
import { discoverChanges, findChange } from './changes.js';

export function status(targetPath, changeName) {
  const changesDir = join(targetPath, 'smooth');

  if (!existsSync(changesDir)) {
    console.log('smooth: 尚未初始化。请先运行 `smooth init`。');
    return;
  }

  const active = discoverChanges(changesDir);

  if (!changeName) {
    if (active.length === 0) {
      console.log('没有活跃变更。');
      return;
    }
    if (active.length === 1) {
      changeName = active[0].id;
    } else {
      console.log('有多个活跃变更，请指定一个：\n');
      for (const c of active) console.log(`  smooth status ${c.id}`);
      return;
    }
  }

  const change = findChange(changesDir, changeName);
  if (!change) {
    console.log(`未找到变更：“${changeName}”。`);
    return;
  }

  console.log(`\n  变更：${change.id}\n`);
  console.log(formatStatus(change.dir));
  console.log();
}

export function list(targetPath) {
  const changesDir = join(targetPath, 'smooth');

  if (!existsSync(changesDir)) {
    console.log('smooth: 尚未初始化。请先运行 `smooth init`。');
    return;
  }

  const active = discoverChanges(changesDir);

  if (active.length === 0) {
    console.log('没有活跃变更。\n');
    console.log('可以先调研：/smooth:research "你的主题"');
    console.log('也可以直接定义需求：/smooth:product "你的想法"');
    return;
  }

  console.log(`活跃变更（${active.length}）：\n`);
  for (const { id, dir } of active) {
    const graph = resolveGraph(dir);
    const done = graph.filter((a) => a.status === 'done').map((a) => a.id);
    const progress = getTaskProgress(dir);
    const taskInfo = progress ? ` [${progress.done}/${progress.total}]` : '';
    console.log(`  ${id}  (${done.join(' → ') || '空'})${taskInfo}`);
  }
  console.log();
}
