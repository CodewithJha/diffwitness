import { DIFFWITNESS_DIR } from "../infrastructure/config/defaults.js";

/**
 * Dirty-tree policy for DiffWitness.
 *
 * Local `check`: dirty trees allowed (developer may have uncommitted work).
 * `ci`: requires a source-clean tree unless `--allow-dirty`.
 *
 * DiffWitness operational artifacts under `.diffwitness/` must not be misclassified as
 * "source changes". Config edits under `.diffwitness/config.yaml` *do* count as source-relevant.
 */

const OPERATIONAL_PREFIXES = [
  `${DIFFWITNESS_DIR}/evidence/`,
  `${DIFFWITNESS_DIR}/blobs/`,
  `${DIFFWITNESS_DIR}/baselines/`,
  `${DIFFWITNESS_DIR}/runs/`,
  `${DIFFWITNESS_DIR}/cache/`,
] as const;

export type DirtyPolicy = "allow" | "refuse_source_dirty" | "refuse_any_dirty";

export function normalizeRepoRelativePath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}

/** True when the path is DiffWitness-generated operational state (not operator config). */
export function isDiffwitnessOperationalPath(filePath: string): boolean {
  const normalized = normalizeRepoRelativePath(filePath);
  if (normalized === DIFFWITNESS_DIR) {
    return true;
  }
  for (const prefix of OPERATIONAL_PREFIXES) {
    if (normalized.startsWith(prefix) || normalized === prefix.slice(0, -1)) {
      return true;
    }
  }
  // Bare layout dirs without trailing slash
  for (const name of ["evidence", "blobs", "baselines", "runs", "cache"] as const) {
    if (normalized === `${DIFFWITNESS_DIR}/${name}`) {
      return true;
    }
  }
  return false;
}

/**
 * Paths that count toward "source dirty" for CI:
 * everything except DiffWitness operational artifact dirs.
 * `.diffwitness/config.yaml` and `.diffwitness/.gitignore` count as source-relevant.
 */
export function isSourceRelevantPath(filePath: string): boolean {
  return !isDiffwitnessOperationalPath(filePath);
}

export function sourceDirtyFiles(changedFiles: readonly string[]): string[] {
  return changedFiles
    .map(normalizeRepoRelativePath)
    .filter((p) => p.length > 0 && isSourceRelevantPath(p))
    .sort((a, b) => a.localeCompare(b));
}

export function isSourceDirty(changedFiles: readonly string[]): boolean {
  return sourceDirtyFiles(changedFiles).length > 0;
}

export function isAnyDirty(changedFiles: readonly string[]): boolean {
  return changedFiles.some((p) => normalizeRepoRelativePath(p).length > 0);
}
