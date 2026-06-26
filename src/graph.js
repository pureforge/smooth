import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Default schema: the artifact dependency graph.
 *
 * Each node has:
 *   id         — artifact identifier
 *   file       — filename inside smooth/changes/<name>/
 *   required   — must exist before apply
 *   deps       — which artifacts must be "done" before this one is "ready"
 *   command    — the slash command that produces this artifact
 */
const DEFAULT_SCHEMA = {
  id: 'harness',
  artifacts: [
    { id: 'research',  file: 'research.md',  required: false, optional: true, deps: [],          command: '/smooth:research' },
    { id: 'product',   file: 'product.md',   required: true,  deps: [],          command: '/smooth:product' },
    { id: 'workpad',   file: 'workpad.md',   required: false, optional: true, deps: ['product'], command: '/smooth:product' },
    { id: 'technical', file: 'technical.md', required: false, optional: true, deps: ['product'], command: '/smooth:technical' },
    { id: 'tasks',     file: 'tasks.md',     required: true,  deps: ['product'], command: '/smooth:tasks' },
    { id: 'verify',    file: 'verify.md',    required: false, deps: ['tasks'],   command: '/smooth:verify' },
    { id: 'pitfalls',  file: 'pitfalls.md',  required: false, optional: true, deps: ['verify'],  command: '/smooth:verify' },
    { id: 'lessons',   file: 'lessons.md',   required: false, optional: true, deps: ['pitfalls'], command: '/smooth:archive' },
  ],
  applyRequires: ['product', 'tasks'],
};

/**
 * Resolve the state of every artifact in a change directory.
 *
 * Returns an array of { id, file, status, blockedBy, command }
 * where status is one of: "done" | "ready" | "blocked"
 */
export function resolveGraph(changeDir, schema = DEFAULT_SCHEMA) {
  const present = new Set();

  for (const artifact of schema.artifacts) {
    const filePath = join(changeDir, artifact.file);
    if (existsSync(filePath)) {
      present.add(artifact.id);
    }
  }

  return schema.artifacts.map((artifact) => {
    if (present.has(artifact.id)) {
      return { ...artifact, status: 'done', blockedBy: [] };
    }

    const missing = artifact.deps.filter((d) => !present.has(d));
    if (missing.length === 0) {
      return { ...artifact, status: 'ready', blockedBy: [] };
    }

    return { ...artifact, status: 'blocked', blockedBy: missing };
  });
}

/**
 * Get the next artifact to work on, preferring non-optional ready nodes.
 */
export function getNext(changeDir, schema = DEFAULT_SCHEMA) {
  const graph = resolveGraph(changeDir, schema);
  return graph.find((a) => a.status === 'ready' && !a.optional)
    || graph.find((a) => a.status === 'ready')
    || null;
}

/**
 * Check if a change is ready for apply (all required artifacts done).
 */
export function isReadyForApply(changeDir, schema = DEFAULT_SCHEMA) {
  const graph = resolveGraph(changeDir, schema);
  const done = new Set(graph.filter((a) => a.status === 'done').map((a) => a.id));
  return schema.applyRequires.every((id) => done.has(id));
}

/**
 * Get task progress from tasks.md.
 * Returns { total, done, remaining, items } or null if no tasks.md.
 */
export function getTaskProgress(changeDir) {
  const tasksPath = join(changeDir, 'tasks.md');
  if (!existsSync(tasksPath)) return null;

  const content = readFileSync(tasksPath, 'utf-8');
  const items = [];

  for (const line of content.split('\n')) {
    const match = line.match(/^- \[([ x])\]\s+(.+)/);
    if (match) {
      items.push({ done: match[1] === 'x', title: match[2].replace(/\*\*/g, '') });
    }
  }

  const total = items.length;
  const done = items.filter((i) => i.done).length;
  return { total, done, remaining: total - done, items };
}

/**
 * Format graph state as a human-readable summary.
 */
export function formatStatus(changeDir, schema = DEFAULT_SCHEMA) {
  const graph = resolveGraph(changeDir, schema);
  const lines = [];

  for (const node of graph) {
    if (node.id === 'research' && node.status !== 'done' && graph.some((a) => a.id === 'product' && a.status === 'done')) {
      continue;
    }
    const icon = node.status === 'done' ? '✓' : node.status === 'ready' ? '○' : '·';
    let suffix = '';
    if (node.status === 'blocked') {
      suffix = `（被 ${node.blockedBy.join(', ')} 阻塞）`;
    } else if (node.optional) {
      suffix = '（可选）';
    }
    lines.push(`  ${icon} ${formatArtifactLabel(node.id)}${suffix}`);
  }

  const next = chooseNextAction(graph, changeDir);
  if (next) {
    lines.push('');
    lines.push(`  下一步：${next.command}`);
  }

  const ready = isReadyForApply(changeDir, schema);
  if (ready) {
    const progress = getTaskProgress(changeDir);
    if (progress && progress.remaining > 0) {
      lines.push(`  可以开始实现（${progress.done}/${progress.total} 个任务已完成）`);
    } else if (progress && progress.remaining === 0) {
      const verify = graph.find((a) => a.id === 'verify');
      if (verify?.status === 'done') {
        lines.push('  所有任务已完成 — 可以归档');
      } else {
        lines.push('  所有任务已完成 — 可以验证');
      }
    }
  }

  return lines.join('\n');
}

function chooseNextAction(graph, changeDir) {
  const byId = new Map(graph.map((node) => [node.id, node]));
  const done = (id) => byId.get(id)?.status === 'done';

  if (!done('product')) return byId.get('product');

  const progress = getTaskProgress(changeDir);
  if (progress) {
    if (progress.remaining > 0) return { command: '/smooth:apply' };
    if (!done('verify')) return byId.get('verify');
    return { command: '/smooth:archive' };
  }

  if (!done('tasks')) return byId.get('tasks');
  if (!done('verify')) return byId.get('verify');

  return null;
}

function formatArtifactLabel(id) {
  const labels = {
    research: 'research（前置调研）',
    product: 'product（产品需求）',
    workpad: 'workpad（工作台）',
    technical: 'technical（技术设计）',
    tasks: 'tasks（任务）',
    verify: 'verify（验证）',
    pitfalls: 'pitfalls（踩坑）',
    lessons: 'lessons（经验）',
  };
  return labels[id] || id;
}

export { DEFAULT_SCHEMA };
