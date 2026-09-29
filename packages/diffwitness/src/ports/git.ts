import type { ChangeLocation, ChangedFile } from "../domain/change-surface.js";
import type { GitIdentity } from "../domain/types.js";

/** Raw Git changes from a base commit to the current working tree (unsorted, unbounded by count). */
export interface WorkingTreeDiff {
  readonly files: readonly ChangedFile[];
  readonly locations: readonly ChangeLocation[];
  readonly locationsComplete: boolean;
  /** True when any git output hit the byte cap — lists are prefixes. */
  readonly outputCapped: boolean;
}

/**
 * Local Git identity port. No remotes, no hosting providers — argv-controlled git only.
 */
export interface GitPort {
  /** Resolve repository root; fails closed outside a git work tree. */
  resolveRoot(startPath: string): Promise<string>;
  /** HEAD SHA, dirty flag, and optional merge-base hint. */
  getIdentity(repoRoot: string, options?: { baseRef?: string }): Promise<GitIdentity>;
  /** Paths changed vs base...HEAD (or working tree when dirty). */
  listChangedFiles(repoRoot: string, options?: { baseRef?: string }): Promise<readonly string[]>;
  /** Working-tree / index changes only (porcelain). Empty when clean. */
  listWorkingTreeChanges(repoRoot: string): Promise<readonly string[]>;
  /** Full commit SHA when `sha` names a commit present locally; null otherwise. */
  resolveCommit(repoRoot: string, sha: string): Promise<string | null>;
  /**
   * Changes from commit `baseSha` to the working tree: tracked (committed, staged, unstaged)
   * plus untracked files not excluded by gitignore. Throws on git failure.
   */
  diffWorkingTree(
    repoRoot: string,
    baseSha: string,
    options: { maxOutputBytes: number },
  ): Promise<WorkingTreeDiff>;
}
