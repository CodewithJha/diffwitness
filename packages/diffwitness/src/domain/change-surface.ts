import { createHash } from "node:crypto";

/**
 * Change surface (M6): files that differ between the active baseline's commit and the
 * repository state that was executed. Git metadata only — never behavioral evidence,
 * never a cause. Association with findings means co-occurrence, not causality.
 */

export type ChangeSurfaceId = string & { readonly __brand: "ChangeSurfaceId" };

export type ChangedFileStatus = "added" | "modified" | "deleted" | "renamed";

export interface ChangedFile {
  readonly path: string;
  readonly status: ChangedFileStatus;
  /** Present only when git reported a rename (`--name-status -M`). */
  readonly oldPath?: string;
  /** Change metadata from `--numstat` (tracked text files only). Not behavioral evidence. */
  readonly additions?: number;
  readonly deletions?: number;
  /** Untracked, not-ignored file in the working tree (no numstat / hunks available). */
  readonly untracked?: boolean;
}

/** Raw hunk-header ranges from `git diff --unified=0` — no interpretation beyond git's numbers. */
export interface ChangeLocation {
  readonly path: string;
  readonly baseStart: number;
  readonly baseLines: number;
  readonly currentStart: number;
  readonly currentLines: number;
}

/**
 * associated     — findings from this execution may be listed as co-occurring with this surface
 * unavailable    — surface could not be computed or does not correspond to the executed state
 * not_comparable — baseline/current Git identities cannot be related (no SHA, dirty baseline, unreachable commit)
 */
export const ASSOCIATION_STATUSES = ["associated", "unavailable", "not_comparable"] as const;
export type AssociationStatus = (typeof ASSOCIATION_STATUSES)[number];

/** Literal marker carried through domain, JSON, and AI packet. DiffWitness never establishes causality. */
export const CAUSALITY_NOT_ESTABLISHED = "not_established" as const;
export type Causality = typeof CAUSALITY_NOT_ESTABLISHED;

export interface ChangeSurfaceLimits {
  readonly maxChangedFiles: number;
  readonly maxLocations: number;
  readonly maxPathLength: number;
  readonly maxSerializedChars: number;
  readonly maxGitOutputBytes: number;
}

/**
 * Owned by the domain: hard bounds on change-surface size.
 * Change surface is context, so it is reduced before anything else and marked truncated.
 */
export const DEFAULT_CHANGE_SURFACE_LIMITS: ChangeSurfaceLimits = {
  maxChangedFiles: 200,
  maxLocations: 500,
  maxPathLength: 512,
  maxSerializedChars: 64_000,
  maxGitOutputBytes: 4 * 1024 * 1024,
};

export interface ChangeSurfaceTruncation {
  readonly truncated: boolean;
  /** Totals are lower bounds when gitOutputCapped is true. */
  readonly filesTotal: number;
  readonly filesIncluded: number;
  readonly locationsTotal: number;
  readonly locationsIncluded: number;
  readonly omittedLongPaths: number;
  readonly gitOutputCapped: boolean;
  readonly limits: ChangeSurfaceLimits;
}

export interface ChangeSurface {
  readonly schemaVersion: 1;
  readonly id: ChangeSurfaceId;
  /** Commit recorded by the active baseline (GitIdentity.headSha). */
  readonly baseRevision: string | null;
  /** HEAD of the executed repository state. */
  readonly currentRevision: string | null;
  /** True when uncommitted / untracked working-tree changes are part of the surface. */
  readonly workingTreeIncluded: boolean;
  readonly associationStatus: AssociationStatus;
  readonly causality: Causality;
  /** Human-readable reason when associationStatus is not `associated`, or a location caveat. */
  readonly limitation: string | null;
  readonly files: readonly ChangedFile[];
  readonly locations: readonly ChangeLocation[];
  /** False when some hunks could not be attributed (quoted paths, capped output, git failure). */
  readonly locationsComplete: boolean;
  /** Paths under DiffWitness operational dirs (.diffwitness/evidence, runs, …) removed from the surface. */
  readonly excludedOperationalPaths: number;
  readonly truncation: ChangeSurfaceTruncation;
}

export interface ChangeSurfaceBuildInput {
  readonly baseRevision: string;
  readonly currentRevision: string;
  readonly workingTreeIncluded: boolean;
  readonly files: readonly ChangedFile[];
  readonly locations: readonly ChangeLocation[];
  readonly locationsComplete: boolean;
  readonly gitOutputCapped: boolean;
  readonly excludedOperationalPaths: number;
  readonly limits?: ChangeSurfaceLimits;
}

/**
 * Deterministic ChangeSurfaceBuilder: sort by path, enforce limits, mark truncation.
 * Never invents files or locations; only removes entries (and says so).
 */
export function buildChangeSurface(input: ChangeSurfaceBuildInput): ChangeSurface {
  const limits = input.limits ?? DEFAULT_CHANGE_SURFACE_LIMITS;
  const withinLength = (p: string | undefined): boolean =>
    p === undefined || p.length <= limits.maxPathLength;

  const allFiles = [...input.files].sort(compareFiles);
  const keptFiles = allFiles.filter((f) => withinLength(f.path) && withinLength(f.oldPath));
  const omittedLongPaths = allFiles.length - keptFiles.length;

  let files = keptFiles.slice(0, limits.maxChangedFiles);
  const includedPaths = new Set(files.map((f) => f.path));
  const candidateLocations = [...input.locations]
    .filter((l) => includedPaths.has(l.path))
    .sort(compareLocations);
  let locations = candidateLocations.slice(0, limits.maxLocations);

  let surface = assemble(input, limits, files, locations, allFiles.length, input.locations.length, omittedLongPaths);
  while (serializedLength(surface) > limits.maxSerializedChars) {
    if (locations.length > 0) {
      locations = locations.slice(0, Math.floor(locations.length / 2));
    } else if (files.length > 0) {
      files = files.slice(0, Math.floor(files.length / 2));
    } else {
      break;
    }
    surface = assemble(input, limits, files, locations, allFiles.length, input.locations.length, omittedLongPaths);
  }
  return surface;
}

function assemble(
  input: ChangeSurfaceBuildInput,
  limits: ChangeSurfaceLimits,
  files: readonly ChangedFile[],
  locations: readonly ChangeLocation[],
  filesTotal: number,
  locationsTotal: number,
  omittedLongPaths: number,
): ChangeSurface {
  const truncation: ChangeSurfaceTruncation = {
    truncated:
      files.length < filesTotal || locations.length < locationsTotal || input.gitOutputCapped,
    filesTotal,
    filesIncluded: files.length,
    locationsTotal,
    locationsIncluded: locations.length,
    omittedLongPaths,
    gitOutputCapped: input.gitOutputCapped,
    limits: { ...limits },
  };
  // Identity covers the source state only — excludedOperationalPaths varies as DiffWitness writes
  // its own artifacts during a run and must not make the executed state look different.
  const body = {
    baseRevision: input.baseRevision,
    currentRevision: input.currentRevision,
    workingTreeIncluded: input.workingTreeIncluded,
    files,
    locations,
    locationsComplete: input.locationsComplete && !input.gitOutputCapped,
    truncation,
  };
  return {
    schemaVersion: 1,
    id: changeSurfaceId(body),
    baseRevision: body.baseRevision,
    currentRevision: body.currentRevision,
    workingTreeIncluded: body.workingTreeIncluded,
    associationStatus: "associated",
    causality: CAUSALITY_NOT_ESTABLISHED,
    limitation: body.locationsComplete
      ? null
      : "Line locations are incomplete (some hunks could not be attributed); file list is authoritative.",
    files: body.files,
    locations: body.locations,
    locationsComplete: body.locationsComplete,
    excludedOperationalPaths: input.excludedOperationalPaths,
    truncation,
  };
}

/** Surface that carries no file data — used when Git cannot relate baseline and current state. */
export function unrelatedChangeSurface(args: {
  readonly status: Exclude<AssociationStatus, "associated">;
  readonly limitation: string;
  readonly baseRevision: string | null;
  readonly currentRevision: string | null;
  readonly workingTreeIncluded: boolean;
  readonly limits?: ChangeSurfaceLimits;
}): ChangeSurface {
  const limits = args.limits ?? DEFAULT_CHANGE_SURFACE_LIMITS;
  const truncation: ChangeSurfaceTruncation = {
    truncated: false,
    filesTotal: 0,
    filesIncluded: 0,
    locationsTotal: 0,
    locationsIncluded: 0,
    omittedLongPaths: 0,
    gitOutputCapped: false,
    limits: { ...limits },
  };
  return {
    schemaVersion: 1,
    id: changeSurfaceId({ status: args.status, limitation: args.limitation, base: args.baseRevision, current: args.currentRevision }),
    baseRevision: args.baseRevision,
    currentRevision: args.currentRevision,
    workingTreeIncluded: args.workingTreeIncluded,
    associationStatus: args.status,
    causality: CAUSALITY_NOT_ESTABLISHED,
    limitation: args.limitation,
    files: [],
    locations: [],
    locationsComplete: false,
    excludedOperationalPaths: 0,
    truncation,
  };
}

/** Downgrade a computed surface (e.g. repo state changed during execution) while keeping its data. */
export function withAssociationStatus(
  surface: ChangeSurface,
  status: Exclude<AssociationStatus, "associated">,
  limitation: string,
): ChangeSurface {
  return { ...surface, associationStatus: status, limitation };
}

function changeSurfaceId(body: unknown): ChangeSurfaceId {
  const digest = createHash("sha256").update(JSON.stringify(body), "utf8").digest("hex");
  return `cs_${digest.slice(0, 24)}` as ChangeSurfaceId;
}

function serializedLength(surface: ChangeSurface): number {
  return JSON.stringify(surface).length;
}

const COMMIT_SHA = /^[0-9a-f]{7,64}$/i;

/** Hex commit id (abbreviated or full, SHA-1 or SHA-256). */
export function isCommitSha(value: string | null | undefined): value is string {
  return typeof value === "string" && COMMIT_SHA.test(value);
}

/** Code-unit ordering (locale-independent) for deterministic output. */
export function comparePaths(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareFiles(a: ChangedFile, b: ChangedFile): number {
  return comparePaths(a.path, b.path) || comparePaths(a.oldPath ?? "", b.oldPath ?? "");
}

function compareLocations(a: ChangeLocation, b: ChangeLocation): number {
  return (
    comparePaths(a.path, b.path) ||
    a.currentStart - b.currentStart ||
    a.baseStart - b.baseStart ||
    a.currentLines - b.currentLines ||
    a.baseLines - b.baseLines
  );
}
