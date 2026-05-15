import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Default schema: the artifact dependency graph.
 *
 * Each node has:
 *   id         — artifact identifier
 *   file       — filename inside smooth/<name>/
 *   required   — must exist before apply
 *   deps       — which artifacts must be "done" before this one is "ready"
 *   command    — the slash command that produces this artifact
 */
const DEFAULT_SCHEMA = {
  id: 'spec-driven',
  artifacts: [
    { id: 'product',   file: 'product.md',   required: true,  deps: [],          command: '/smooth:product' },
    { id: 'technical', file: 'technical.md', required: false, deps: ['product'], command: '/smooth:technical' },
    { id: 'tasks',     file: 'tasks.md',     required: true,  deps: ['product'], command: '/smooth:tasks' },
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
 * Get the next artifact to work on (first "ready" node).
 */
export function getNext(changeDir, schema = DEFAULT_SCHEMA) {
  const graph = resolveGraph(changeDir, schema);
  return graph.find((a) => a.status === 'ready') || null;
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
    const icon = node.status === 'done' ? '✓' : node.status === 'ready' ? '○' : '·';
    let suffix = '';
    if (node.status === 'blocked') {
      suffix = ` (blocked by: ${node.blockedBy.join(', ')})`;
    }
    lines.push(`  ${icon} ${node.id}${suffix}`);
  }

  const next = graph.find((a) => a.status === 'ready');
  if (next) {
    lines.push('');
    lines.push(`  Next: ${next.command}`);
  }

  const ready = isReadyForApply(changeDir, schema);
  if (ready) {
    const progress = getTaskProgress(changeDir);
    if (progress && progress.remaining > 0) {
      lines.push(`  Ready for apply (${progress.done}/${progress.total} tasks done)`);
    } else if (progress && progress.remaining === 0) {
      lines.push(`  All tasks complete — ready to archive`);
    }
  }

  return lines.join('\n');
}

export { DEFAULT_SCHEMA };
