import { DiffWitnessError } from "../../domain/errors.js";
import { isCommitSha, type ChangedFile } from "../../domain/change-surface.js";
import type { WorkingTreeDiff } from "../../ports/git.js";
import {
  parseNameStatusZ,
  parseNumstatZ,
  parseUnifiedZeroHunks,
  parseUntrackedZ,
} from "./parse-diff.js";
import { runGit, type GitCommandResult } from "./run-git.js";

export async function resolveCommit(repoRoot: string, sha: string): Promise<string | null> {
  if (!isCommitSha(sha)) {
    return null;
  }
  const type = await runGit(repoRoot, ["cat-file", "-t", sha]);
  if (type.exitCode !== 0 || type.stdout.trim() !== "commit") {
    return null;
  }
  const full = await runGit(repoRoot, ["rev-parse", "--verify", "--quiet", sha]);
  const value = full.stdout.trim();
  return full.exitCode === 0 && isCommitSha(value) ? value : null;
}

/**
 * Base commit → working tree. argv-only git; fixed prefixes and no external diff / textconv
 * so repo config cannot change the parsed format. Line hunks are best-effort; files are not.
 */
export async function diffWorkingTree(
  repoRoot: string,
  baseSha: string,
  maxOutputBytes: number,
): Promise<WorkingTreeDiff> {
  if (!isCommitSha(baseSha)) {
    throw new DiffWitnessError("repo", `Invalid base commit SHA: ${baseSha}`);
  }
  const opts = { maxStdoutBytes: maxOutputBytes };
  const common = ["-M", "--no-color", "--no-ext-diff", "--no-textconv"];

  const nameStatus = requireOk(
    await runGit(repoRoot, ["diff", "--name-status", "-z", ...common, baseSha, "--"], opts),
    "git diff --name-status",
  );
  const numstat = requireOk(
    await runGit(repoRoot, ["diff", "--numstat", "-z", ...common, baseSha, "--"], opts),
    "git diff --numstat",
  );
  const untracked = requireOk(
    await runGit(repoRoot, ["ls-files", "--others", "--exclude-standard", "-z"], opts),
    "git ls-files --others",
  );
  const hunks = await runGit(
    repoRoot,
    ["diff", "--unified=0", ...common, "--src-prefix=a/", "--dst-prefix=b/", baseSha, "--"],
    opts,
  );

  const counts = parseNumstatZ(numstat.stdout);
  const tracked: ChangedFile[] = parseNameStatusZ(nameStatus.stdout).map((f) => ({
    ...f,
    ...(counts.get(f.path) ?? {}),
  }));
  const trackedPaths = new Set(tracked.map((f) => f.path));
  const untrackedFiles: ChangedFile[] = parseUntrackedZ(untracked.stdout)
    .filter((p) => !trackedPaths.has(p))
    .map((p) => ({ path: p, status: "added", untracked: true }));

  const hunksOk = hunks.exitCode === 0 || hunks.stdoutTruncated === true;
  const parsedHunks = hunksOk
    ? parseUnifiedZeroHunks(hunks.stdout, hunks.stdoutTruncated === true)
    : { locations: [], complete: false };

  return {
    files: [...tracked, ...untrackedFiles],
    locations: parsedHunks.locations,
    locationsComplete: parsedHunks.complete,
    outputCapped:
      nameStatus.stdoutTruncated === true ||
      numstat.stdoutTruncated === true ||
      untracked.stdoutTruncated === true,
  };
}

function requireOk(result: GitCommandResult, label: string): GitCommandResult {
  if (result.stdoutTruncated === true || result.exitCode === 0) {
    return result;
  }
  throw new DiffWitnessError("repo", `${label} failed`, {
    details: { stderr: result.stderr.trim().slice(0, 500) },
  });
}
