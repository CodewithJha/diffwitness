import { z } from "zod";
import {
  ASSOCIATION_STATUSES,
  CAUSALITY_NOT_ESTABLISHED,
  type ChangeLocation,
  type ChangeSurface,
  type ChangeSurfaceId,
  type ChangedFile,
} from "./change-surface.js";

const nonEmpty = z.string().min(1);
const count = z.number().int().nonnegative();
const lineNumber = z.number().int().nonnegative();

export const associationStatusSchema = z.enum(ASSOCIATION_STATUSES);
export const causalitySchema = z.literal(CAUSALITY_NOT_ESTABLISHED);

export const changedFileSchema = z.object({
  path: nonEmpty,
  status: z.enum(["added", "modified", "deleted", "renamed"]),
  oldPath: nonEmpty.optional(),
  additions: count.optional(),
  deletions: count.optional(),
  untracked: z.boolean().optional(),
});

const changeLocationSchema = z.object({
  path: nonEmpty,
  baseStart: lineNumber,
  baseLines: count,
  currentStart: lineNumber,
  currentLines: count,
});

const limitsSchema = z.object({
  maxChangedFiles: z.number().int().positive(),
  maxLocations: z.number().int().positive(),
  maxPathLength: z.number().int().positive(),
  maxSerializedChars: z.number().int().positive(),
  maxGitOutputBytes: z.number().int().positive(),
});

export const changeSurfaceSchema = z.object({
  schemaVersion: z.literal(1),
  id: nonEmpty,
  baseRevision: z.string().nullable(),
  currentRevision: z.string().nullable(),
  workingTreeIncluded: z.boolean(),
  associationStatus: associationStatusSchema,
  causality: causalitySchema,
  limitation: z.string().nullable(),
  files: z.array(changedFileSchema),
  locations: z.array(changeLocationSchema),
  locationsComplete: z.boolean(),
  excludedOperationalPaths: count,
  truncation: z.object({
    truncated: z.boolean(),
    filesTotal: count,
    filesIncluded: count,
    locationsTotal: count,
    locationsIncluded: count,
    omittedLongPaths: count,
    gitOutputCapped: z.boolean(),
    limits: limitsSchema,
  }),
});

export function mapChangedFile(f: z.infer<typeof changedFileSchema>): ChangedFile {
  return {
    path: f.path,
    status: f.status,
    ...(f.oldPath !== undefined ? { oldPath: f.oldPath } : {}),
    ...(f.additions !== undefined ? { additions: f.additions } : {}),
    ...(f.deletions !== undefined ? { deletions: f.deletions } : {}),
    ...(f.untracked !== undefined ? { untracked: f.untracked } : {}),
  };
}

export function mapChangeSurface(d: z.infer<typeof changeSurfaceSchema>): ChangeSurface {
  const locations: ChangeLocation[] = d.locations.map((l) => ({ ...l }));
  return {
    schemaVersion: 1,
    id: d.id as ChangeSurfaceId,
    baseRevision: d.baseRevision,
    currentRevision: d.currentRevision,
    workingTreeIncluded: d.workingTreeIncluded,
    associationStatus: d.associationStatus,
    causality: d.causality,
    limitation: d.limitation,
    files: d.files.map(mapChangedFile),
    locations,
    locationsComplete: d.locationsComplete,
    excludedOperationalPaths: d.excludedOperationalPaths,
    truncation: { ...d.truncation, limits: { ...d.truncation.limits } },
  };
}
