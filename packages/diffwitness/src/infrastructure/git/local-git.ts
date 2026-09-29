import { realpath } from "node:fs/promises";
import path from "node:path";
import { DiffWitnessError } from "../../domain/errors.js";
import type { GitIdentity } from "../../domain/types.js";
import type { GitPort, WorkingTreeDiff } from "../../ports/git.js";
import { assertSafeGitToken, runGit } from "./run-git.js";
import { diffWorkingTree, resolveCommit } from "./working-tree-diff.js";

/**
 * LocalGitPort — controlled git CLI only; no GitHub/GitLab remotes API.
 */
export class LocalGitPort implements GitPort {
  async resolveRoot(startPath: string): Promise<string> {
    const absolute = path.resolve(startPath);
    const result = await runGit(absolute, ["rev-parse", "--show-toplevel"]);
    if (result.exitCode !== 0) {
      throw new DiffWitnessError(
        "repo",
        `Not a Git repository (git rev-parse failed from ${absolute})`,
        { details: { stderr: result.stderr.trim() } },
      );
    }
    const root = result.stdout.trim();
    if (root.length === 0) {
      throw new DiffWitnessError("repo", "git rev-parse returned empty toplevel");
    }
    // Canonicalize (e.g. macOS /var → /private/var) for stable path comparisons.
    return realpath(root);
  }

  async getIdentity(
    repoRoot: string,
    options?: { baseRef?: string },
  ): Promise<GitIdentity> {
    const head = await runGit(repoRoot, ["rev-parse", "HEAD"]);
    if (head.exitCode !== 0) {
      throw new DiffWitnessError("repo", "Failed to resolve HEAD SHA", {
        details: { stderr: head.stderr.trim() },
      });
    }
    const headSha = head.stdout.trim();
    if (!/^[0-9a-f]{40}$/i.test(headSha) && !/^[0-9a-f]{64}$/i.test(headSha)) {
      // Accept abbreviated only if non-empty; prefer full.
      if (headSha.length < 7) {
        throw new DiffWitnessError("repo", `Unexpected HEAD SHA: ${headSha}`);
      }
    }

    const dirty = await this.isDirty(repoRoot);

    const identity: GitIdentity = {
      headSha,
      dirty,
    };

    if (options?.baseRef !== undefined && options.baseRef.length > 0) {
      const baseRef = assertSafeGitToken(options.baseRef, "baseRef");
      const mb = await runGit(repoRoot, ["merge-base", baseRef, "HEAD"]);
      if (mb.exitCode === 0) {
        const mergeBase = mb.stdout.trim();
        return {
          ...identity,
          baseSha: baseRef,
          mergeBase,
        };
      }
      // baseRef may be unresolved locally (e.g. origin/main) — leave optional fields unset.
    }

    return identity;
  }

  async listChangedFiles(
    repoRoot: string,
    options?: { baseRef?: string },
  ): Promise<readonly string[]> {
    if (await this.isDirty(repoRoot)) {
      return this.listWorkingTreeChanges(repoRoot);
    }
    if (options?.baseRef !== undefined && options.baseRef.length > 0) {
      const baseRef = assertSafeGitToken(options.baseRef, "baseRef");
      const diff = await runGit(repoRoot, ["diff", "--name-only", `${baseRef}...HEAD`]);
      if (diff.exitCode !== 0) {
        // Fall back to empty when base cannot be resolved — caller still has identity.
        return [];
      }
      return diff.stdout
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    }
    return [];
  }

  async listWorkingTreeChanges(repoRoot: string): Promise<readonly string[]> {
    const status = await runGit(repoRoot, ["status", "--porcelain"]);
    if (status.exitCode !== 0) {
      throw new DiffWitnessError("repo", "git status failed", {
        details: { stderr: status.stderr.trim() },
      });
    }
    const files: string[] = [];
    for (const line of status.stdout.split("\n")) {
      if (line.trim().length === 0) continue;
      // porcelain: XY PATH or XY ORIG -> PATH
      const renamed = line.slice(3).split(" -> ");
      const filePath = (renamed[renamed.length - 1] ?? "").trim().replace(/^"|"$/g, "");
      if (filePath.length > 0) {
        files.push(filePath);
      }
    }
    return files;
  }

  resolveCommit(repoRoot: string, sha: string): Promise<string | null> {
    return resolveCommit(repoRoot, sha);
  }

  diffWorkingTree(
    repoRoot: string,
    baseSha: string,
    options: { maxOutputBytes: number },
  ): Promise<WorkingTreeDiff> {
    return diffWorkingTree(repoRoot, baseSha, options.maxOutputBytes);
  }

  private async isDirty(repoRoot: string): Promise<boolean> {
    const status = await runGit(repoRoot, ["status", "--porcelain"]);
    if (status.exitCode !== 0) {
      throw new DiffWitnessError("repo", "git status failed", {
        details: { stderr: status.stderr.trim() },
      });
    }
    return status.stdout.trim().length > 0;
  }
}
