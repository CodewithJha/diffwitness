import path from "node:path";
import { realpath } from "node:fs/promises";
import { DiffWitnessError } from "../../domain/errors.js";
import type { StoragePort } from "../../ports/storage.js";

/**
 * Safely detect a Git repository by walking parents for a `.git` entry.
 * No shell, no ref parsing — used by `init` when full LocalGit is not required.
 */
export async function detectRepositoryRoot(
  storage: StoragePort,
  startPath: string,
): Promise<string> {
  const absoluteStart = path.resolve(startPath);
  let current = absoluteStart;

  for (;;) {
    const gitEntry = path.join(current, ".git");
    if (await storage.exists(gitEntry)) {
      return realpath(current);
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new DiffWitnessError(
        "repo",
        `Not a Git repository (no .git found from ${absoluteStart})`,
      );
    }
    current = parent;
  }
}
