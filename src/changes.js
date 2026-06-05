import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const PRODUCT = 'product.md';

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Discover all active changes under smooth/, supporting one level of
 * nesting for phased big requirements.
 *
 * A "change" is any directory that directly contains product.md:
 *   smooth/foo/product.md           → change "foo"           (flat)
 *   smooth/big/phase-1/product.md   → change "big/phase-1"   (big is a container)
 *
 * A directory that has product.md is a change and is not descended into.
 * A directory without product.md is treated as a container, and its
 * immediate subdirectories are scanned for changes. Nesting stops there.
 *
 * Returns [{ id, dir }] sorted by id, where id is the smooth-relative
 * path (may contain "/") and dir is the absolute path to the change.
 */
export function discoverChanges(smoothDir) {
  if (!existsSync(smoothDir)) return [];

  const changes = [];
  const topLevel = readdirSync(smoothDir).filter(
    (name) => name !== 'archive' && isDir(join(smoothDir, name))
  );

  for (const name of topLevel) {
    const dir = join(smoothDir, name);

    if (existsSync(join(dir, PRODUCT))) {
      changes.push({ id: name, dir });
      continue;
    }

    // No product.md here — treat as a container of phases.
    const sub = readdirSync(dir).filter((s) => isDir(join(dir, s)));
    for (const s of sub) {
      const subDir = join(dir, s);
      if (existsSync(join(subDir, PRODUCT))) {
        changes.push({ id: `${name}/${s}`, dir: subDir });
      }
    }
  }

  return changes.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Resolve a change id (flat "foo" or nested "big/phase-1") to { id, dir },
 * or null if no such change exists.
 */
export function findChange(smoothDir, id) {
  return discoverChanges(smoothDir).find((c) => c.id === id) || null;
}
