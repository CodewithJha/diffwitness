import {
  DEFAULT_CHANGE_SURFACE_LIMITS,
  buildChangeSurface,
  isCommitSha,
  unrelatedChangeSurface,
  withAssociationStatus,
  type ChangeSurface,
  type ChangeSurfaceLimits,
} from "../domain/change-surface.js";
import type { Baseline, GitIdentity } from "../domain/types.js";
import type { GitPort } from "../ports/git.js";
import { isDiffwitnessOperationalPath } from "./dirty-policy.js";

export interface CaptureChangeSurfaceInput {
  readonly git: GitPort;
  readonly repoRoot: string;
  readonly baseline: Baseline;
  readonly current: GitIdentity;
  readonly limits?: ChangeSurfaceLimits;
}

/**
 * Git → ChangeSurfaceBuilder. Base is always the active baseline's commit (local-active model);
 * no merge-base / PR inference. Returns an explicit not_comparable / unavailable surface
 * instead of fabricating relationships.
 */
export async function captureChangeSurface(input: CaptureChangeSurfaceInput): Promise<ChangeSurface> {
  const limits = input.limits ?? DEFAULT_CHANGE_SURFACE_LIMITS;
  const base = input.baseline.git.headSha ?? null;
  const current = input.current.headSha ?? null;
  const unrelated = (status: "unavailable" | "not_comparable", limitation: string) =>
    unrelatedChangeSurface({
      status,
      limitation,
      baseRevision: base,
      currentRevision: current,
      workingTreeIncluded: input.current.dirty,
      limits,
    });

  if (!isCommitSha(base)) {
    return unrelated("not_comparable", "Active baseline has no Git commit SHA.");
  }
  if (input.baseline.git.dirty) {
    return unrelated(
      "not_comparable",
      "Active baseline was captured from a dirty working tree; its exact source state is not recoverable from Git. Commit, then re-run `diffwitness baseline`.",
    );
  }
  if (!isCommitSha(current)) {
    return unrelated("not_comparable", "Current repository state has no HEAD commit SHA.");
  }
  try {
    const resolvedBase = await input.git.resolveCommit(input.repoRoot, base);
    if (resolvedBase === null) {
      return unrelated(
        "not_comparable",
        `Baseline commit ${base} is not present in this repository (rewritten history or shallow clone?).`,
      );
    }
    const raw = await input.git.diffWorkingTree(input.repoRoot, resolvedBase, {
      maxOutputBytes: limits.maxGitOutputBytes,
    });
    const files = raw.files.filter((f) => !isDiffwitnessOperationalPath(f.path));
    const keptPaths = new Set(files.map((f) => f.path));
    return buildChangeSurface({
      baseRevision: resolvedBase,
      currentRevision: current,
      workingTreeIncluded: input.current.dirty,
      files,
      locations: raw.locations.filter((l) => keptPaths.has(l.path)),
      locationsComplete: raw.locationsComplete,
      gitOutputCapped: raw.outputCapped,
      excludedOperationalPaths: raw.files.length - files.length,
      limits,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return unrelated("unavailable", `Change surface could not be computed from Git: ${message}`);
  }
}

/**
 * The executed state must equal the surface: compare surfaces captured before and after
 * workflow execution. Any difference (HEAD moved, workflow edited tracked files) → unavailable.
 */
export function confirmExecutedState(before: ChangeSurface, after: ChangeSurface): ChangeSurface {
  if (before.associationStatus !== "associated") {
    return before;
  }
  if (after.associationStatus !== "associated" || after.id !== before.id) {
    return withAssociationStatus(
      before,
      "unavailable",
      "Repository state changed during workflow execution (change surface before and after capture differ); findings cannot be tied to a single source state.",
    );
  }
  return before;
}
