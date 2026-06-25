import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const CHANGE_MARKERS = ['product.md', 'research.md'];

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
 * A "change" is any directory that directly contains product.md or research.md:
 *   smooth/foo/product.md           → change "foo"           (flat)
 *   smooth/foo/research.md          → change "foo"           (pre-product research)
 *   smooth/big/phase-1/product.md   → change "big/phase-1"   (big is a container)
 *
 * A directory that has a change marker is a change and is not descended into.
 * A directory without a marker is treated as a container, and its
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
    const sub = readdirSync(dir).filter((s) => isDir(join(dir, s)));
    const subChanges = [];
    for (const s of sub) {
      const subDir = join(dir, s);
      if (hasChangeMarker(subDir)) {
        subChanges.push({ id: `${name}/${s}`, dir: subDir });
      }
    }

    if (existsSync(join(dir, 'product.md'))) {
      changes.push({ id: name, dir });
      continue;
    }

    if (subChanges.length > 0) {
      changes.push(...subChanges);
      continue;
    }

    if (existsSync(join(dir, 'research.md'))) {
      changes.push({ id: name, dir });
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

function hasChangeMarker(dir) {
  return CHANGE_MARKERS.some((file) => existsSync(join(dir, file)));
}
