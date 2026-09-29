import { z } from "zod";
import { DiffWitnessError } from "./errors.js";
import { ANALYSIS_STATUSES } from "./analysis-status.js";
import type { ChangeSurfaceId } from "./change-surface.js";
import {
  associationStatusSchema,
  causalitySchema,
  changedFileSchema,
  changeSurfaceSchema,
  mapChangeSurface,
  mapChangedFile,
} from "./change-surface-schema.js";
import {
  EVIDENCE_PACKET_SCHEMA_VERSION,
  asBaselineId,
  asBehavioralDiffId,
  asEvidenceId,
  asFindingId,
  asWorkflowId,
  type BehavioralDiff,
  type BehavioralObservation,
  type Evidence,
  type EvidencePacket,
  type Explanation,
  type Finding,
  type FindingType,
  type ObservationComparison,
} from "./types.js";

const nonEmpty = z.string().min(1);

const blobRefSchema = z.object({
  digest: nonEmpty,
});

const artifactRefSchema = z.object({
  digest: nonEmpty,
  path: nonEmpty,
  kind: z.string().optional(),
});

const boundedNormalizedRepSchema = z.object({
  digest: nonEmpty,
  preview: z.string(),
  maxChars: z.number().int().positive(),
  truncated: z.boolean(),
  byteLength: z.number().int().nonnegative(),
});

const observationKindSchema = z.enum([
  "exit",
  "stdout",
  "stderr",
  "artifact",
  "metric",
  "structured",
]);

export const behavioralObservationSchema = z.object({
  key: nonEmpty,
  kind: observationKindSchema,
  valueDigest: nonEmpty,
  normalized: boundedNormalizedRepSchema.optional(),
  rawPreview: z.string().optional(),
  severityHint: z.enum(["info", "warn", "error"]).optional(),
});

const gitIdentitySchema = z.object({
  headSha: z.string().optional(),
  baseSha: z.string().optional(),
  dirty: z.boolean(),
  mergeBase: z.string().optional(),
});

export const evidenceSchema = z.object({
  id: nonEmpty,
  workflowId: nonEmpty,
  capturedAt: nonEmpty,
  git: gitIdentitySchema,
  exitCode: z.number().int(),
  durationMs: z.number().nonnegative(),
  stdoutRef: blobRefSchema.optional(),
  stderrRef: blobRefSchema.optional(),
  artifactRefs: z.array(artifactRefSchema),
  observations: z.array(behavioralObservationSchema),
  redactionApplied: z.boolean(),
});

export const FINDING_TYPES = [
  "exit_code_changed",
  "stdout_changed",
  "stderr_changed",
  "artifact_changed",
  "truncation_changed",
  "observation_changed",
] as const satisfies readonly FindingType[];

export const findingTypeSchema = z.enum(FINDING_TYPES);

export const findingSchema = z.object({
  id: nonEmpty,
  workflowId: nonEmpty,
  observationKey: nonEmpty,
  findingType: findingTypeSchema,
  change: z.enum(["changed", "appeared", "disappeared"]),
  beforeDigest: z.string().optional(),
  afterDigest: z.string().optional(),
  summary: nonEmpty,
  evidenceIds: z.array(nonEmpty).min(1),
  severity: z.enum(["info", "warn", "error"]),
  associationStatus: associationStatusSchema.optional(),
  changeSurfaceRefs: z.array(nonEmpty).optional(),
});

const observationComparisonSchema = z.object({
  workflowId: nonEmpty,
  key: nonEmpty,
  status: z.enum(["unchanged", "changed", "added", "removed"]),
  beforeDigest: z.string().optional(),
  afterDigest: z.string().optional(),
});

export const behavioralDiffSchema = z.object({
  schemaVersion: z.literal(1),
  id: nonEmpty,
  baselineId: nonEmpty,
  baselineEvidenceIds: z.array(nonEmpty),
  currentEvidenceIds: z.array(nonEmpty),
  against: gitIdentitySchema,
  status: z.enum(ANALYSIS_STATUSES),
  observations: z.object({
    unchanged: z.array(observationComparisonSchema),
    changed: z.array(observationComparisonSchema),
    added: z.array(observationComparisonSchema),
    removed: z.array(observationComparisonSchema),
  }),
  findings: z.array(findingSchema),
  affectedWorkflows: z.array(z.string()),
  affectedAssumptions: z.array(z.string()),
  evidencePacketRef: z.string().optional(),
  changeSurface: changeSurfaceSchema.optional(),
});

export const analysisStatusSchema = z.enum(ANALYSIS_STATUSES);

export const analysisResultSchema = z
  .object({
    status: analysisStatusSchema,
    behavioralDiff: z.unknown().optional(),
    message: z.string().optional(),
    errorCategory: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "analysis_error" && value.behavioralDiff != null) {
      const diff = value.behavioralDiff as { status?: string };
      if (diff.status === "clean") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "analysis_error must not embed BehavioralDiff.status clean",
        });
      }
    }
  });

export function parseEvidence(input: unknown): Evidence {
  const parsed = evidenceSchema.safeParse(input);
  if (!parsed.success) {
    throw new DiffWitnessError("analysis", "Malformed Evidence payload", {
      details: { issues: parsed.error.issues },
    });
  }
  const d = parsed.data;
  const git = {
    dirty: d.git.dirty,
    ...(d.git.headSha !== undefined ? { headSha: d.git.headSha } : {}),
    ...(d.git.baseSha !== undefined ? { baseSha: d.git.baseSha } : {}),
    ...(d.git.mergeBase !== undefined ? { mergeBase: d.git.mergeBase } : {}),
  };
  const artifactRefs = d.artifactRefs.map((ref) => ({
    digest: ref.digest,
    path: ref.path,
    ...(ref.kind !== undefined ? { kind: ref.kind } : {}),
  }));
  return {
    id: asEvidenceId(d.id),
    workflowId: asWorkflowId(d.workflowId),
    capturedAt: d.capturedAt,
    git,
    exitCode: d.exitCode,
    durationMs: d.durationMs,
    ...(d.stdoutRef !== undefined ? { stdoutRef: d.stdoutRef } : {}),
    ...(d.stderrRef !== undefined ? { stderrRef: d.stderrRef } : {}),
    artifactRefs,
    observations: d.observations as BehavioralObservation[],
    redactionApplied: d.redactionApplied,
  };
}

export function parseFinding(input: unknown): Finding {
  const parsed = findingSchema.safeParse(input);
  if (!parsed.success) {
    throw new DiffWitnessError("analysis", "Malformed Finding payload", {
      details: { issues: parsed.error.issues },
    });
  }
  const d = parsed.data;
  return {
    id: asFindingId(d.id),
    workflowId: asWorkflowId(d.workflowId),
    observationKey: d.observationKey,
    findingType: d.findingType,
    change: d.change,
    ...(d.beforeDigest !== undefined ? { beforeDigest: d.beforeDigest } : {}),
    ...(d.afterDigest !== undefined ? { afterDigest: d.afterDigest } : {}),
    summary: d.summary,
    evidenceIds: d.evidenceIds.map(asEvidenceId),
    severity: d.severity,
    ...(d.associationStatus !== undefined ? { associationStatus: d.associationStatus } : {}),
    ...(d.changeSurfaceRefs !== undefined
      ? { changeSurfaceRefs: d.changeSurfaceRefs.map((r) => r as ChangeSurfaceId) }
      : {}),
  };
}

function mapObservationComparison(row: z.infer<typeof observationComparisonSchema>): ObservationComparison {
  return {
    workflowId: asWorkflowId(row.workflowId),
    key: row.key,
    status: row.status,
    ...(row.beforeDigest !== undefined ? { beforeDigest: row.beforeDigest } : {}),
    ...(row.afterDigest !== undefined ? { afterDigest: row.afterDigest } : {}),
  };
}

export function parseBehavioralDiff(input: unknown): BehavioralDiff {
  const parsed = behavioralDiffSchema.safeParse(input);
  if (!parsed.success) {
    throw new DiffWitnessError("analysis", "Malformed BehavioralDiff payload", {
      details: { issues: parsed.error.issues },
    });
  }
  const d = parsed.data;
  const against = {
    dirty: d.against.dirty,
    ...(d.against.headSha !== undefined ? { headSha: d.against.headSha } : {}),
    ...(d.against.baseSha !== undefined ? { baseSha: d.against.baseSha } : {}),
    ...(d.against.mergeBase !== undefined ? { mergeBase: d.against.mergeBase } : {}),
  };
  return {
    schemaVersion: 1,
    id: asBehavioralDiffId(d.id),
    baselineId: asBaselineId(d.baselineId),
    baselineEvidenceIds: d.baselineEvidenceIds.map(asEvidenceId),
    currentEvidenceIds: d.currentEvidenceIds.map(asEvidenceId),
    against,
    status: d.status,
    observations: {
      unchanged: d.observations.unchanged.map(mapObservationComparison),
      changed: d.observations.changed.map(mapObservationComparison),
      added: d.observations.added.map(mapObservationComparison),
      removed: d.observations.removed.map(mapObservationComparison),
    },
    findings: d.findings.map((f) => parseFinding(f)),
    affectedWorkflows: [...d.affectedWorkflows],
    affectedAssumptions: [...d.affectedAssumptions],
    ...(d.evidencePacketRef !== undefined ? { evidencePacketRef: d.evidencePacketRef } : {}),
    ...(d.changeSurface !== undefined ? { changeSurface: mapChangeSurface(d.changeSurface) } : {}),
  };
}

const packetFindingSchema = z.object({
  id: nonEmpty,
  severity: z.enum(["info", "warn", "error"]),
  workflowId: nonEmpty,
  observationKey: nonEmpty,
  findingType: findingTypeSchema,
  change: z.enum(["changed", "appeared", "disappeared"]),
  summary: nonEmpty,
  evidenceIds: z.array(nonEmpty).min(1),
  associationStatus: associationStatusSchema.optional(),
});

const packetChangeSurfaceSchema = z.object({
  id: nonEmpty,
  associationStatus: associationStatusSchema,
  causality: causalitySchema,
  baseRevision: z.string().nullable(),
  currentRevision: z.string().nullable(),
  workingTreeIncluded: z.boolean(),
  limitation: z.string().nullable(),
  files: z.array(changedFileSchema),
  filesTotal: z.number().int().nonnegative(),
  truncated: z.boolean(),
});

const packetChangedObservationSchema = z.object({
  workflowId: nonEmpty,
  key: nonEmpty,
  beforeDigest: z.string().optional(),
  afterDigest: z.string().optional(),
});

const evidenceExcerptSchema = z.object({
  evidenceId: nonEmpty,
  observationKey: nonEmpty,
  preview: z.string(),
  digest: nonEmpty,
});

const assumptionRefSchema = z.object({
  id: nonEmpty,
  description: z.string(),
});

export const evidencePacketSchema = z.object({
  schemaVersion: z.literal(EVIDENCE_PACKET_SCHEMA_VERSION),
  behavioralDiffId: nonEmpty,
  status: z.enum(ANALYSIS_STATUSES),
  findings: z.array(packetFindingSchema),
  changedObservations: z.array(packetChangedObservationSchema),
  evidenceExcerpts: z.array(evidenceExcerptSchema),
  assumptions: z.array(assumptionRefSchema),
  changeSurface: packetChangeSurfaceSchema.optional(),
  budgets: z.object({
    maxChars: z.number().int().positive(),
    maxFindings: z.number().int().positive(),
    maxExcerpts: z.number().int().positive(),
    maxExcerptChars: z.number().int().positive(),
    maxPaths: z.number().int().positive(),
  }),
  redactionApplied: z.boolean(),
});

const explanationCitationSchema = z
  .object({
    findingId: z.string().min(1).optional(),
    evidenceId: z.string().min(1).optional(),
    claim: nonEmpty,
  })
  .refine((c) => c.findingId !== undefined || c.evidenceId !== undefined, {
    message: "citation requires findingId and/or evidenceId",
  });

const explanationFactSchema = z.object({
  claim: nonEmpty,
  findingId: z.string().min(1).optional(),
  evidenceIds: z.array(nonEmpty),
});

const explanationHypothesisSchema = z.object({
  claim: nonEmpty,
  confidence: z.enum(["low", "medium", "high"]),
  findingId: z.string().min(1).optional(),
  evidenceIds: z.array(nonEmpty),
});

export const explanationSchema = z.object({
  schemaVersion: z.literal(1),
  promptVersion: nonEmpty,
  narrative: z.string(),
  facts: z.array(explanationFactSchema),
  hypotheses: z.array(explanationHypothesisSchema),
  citations: z.array(explanationCitationSchema),
  caveats: z.array(z.string()),
  modelId: z.string().optional(),
  provider: nonEmpty,
});

export function parseEvidencePacket(input: unknown): EvidencePacket {
  const version = (input as { schemaVersion?: unknown } | null)?.schemaVersion;
  if (version !== undefined && version !== EVIDENCE_PACKET_SCHEMA_VERSION) {
    throw new DiffWitnessError(
      "provider",
      `Unsupported EvidencePacket schemaVersion ${String(version)} (expected ${EVIDENCE_PACKET_SCHEMA_VERSION}); packets are rebuilt per explain run — re-run \`diffwitness explain\``,
      { exitClass: "explain_error", details: { code: "unsupported_packet_version" } },
    );
  }
  const parsed = evidencePacketSchema.safeParse(input);
  if (!parsed.success) {
    throw new DiffWitnessError("provider", "Malformed EvidencePacket / ExplanationPacket", {
      details: { issues: parsed.error.issues },
      exitClass: "explain_error",
    });
  }
  const d = parsed.data;
  return {
    schemaVersion: EVIDENCE_PACKET_SCHEMA_VERSION,
    behavioralDiffId: asBehavioralDiffId(d.behavioralDiffId),
    status: d.status,
    findings: d.findings.map((f) => ({
      id: asFindingId(f.id),
      severity: f.severity,
      workflowId: asWorkflowId(f.workflowId),
      observationKey: f.observationKey,
      findingType: f.findingType,
      change: f.change,
      summary: f.summary,
      evidenceIds: f.evidenceIds.map(asEvidenceId),
      ...(f.associationStatus !== undefined ? { associationStatus: f.associationStatus } : {}),
    })),
    changedObservations: d.changedObservations.map((row) => ({
      workflowId: asWorkflowId(row.workflowId),
      key: row.key,
      ...(row.beforeDigest !== undefined ? { beforeDigest: row.beforeDigest } : {}),
      ...(row.afterDigest !== undefined ? { afterDigest: row.afterDigest } : {}),
    })),
    evidenceExcerpts: d.evidenceExcerpts.map((e) => ({
      evidenceId: asEvidenceId(e.evidenceId),
      observationKey: e.observationKey,
      preview: e.preview,
      digest: e.digest,
    })),
    assumptions: d.assumptions.map((a) => ({ id: a.id, description: a.description })),
    ...(d.changeSurface !== undefined
      ? {
          changeSurface: {
            ...d.changeSurface,
            id: d.changeSurface.id as ChangeSurfaceId,
            files: d.changeSurface.files.map(mapChangedFile),
          },
        }
      : {}),
    budgets: { ...d.budgets },
    redactionApplied: d.redactionApplied,
  };
}

export function parseExplanation(input: unknown): Explanation {
  const parsed = explanationSchema.safeParse(input);
  if (!parsed.success) {
    throw new DiffWitnessError("provider", "Malformed Explanation payload", {
      details: { issues: parsed.error.issues },
      exitClass: "explain_error",
    });
  }
  const d = parsed.data;
  return {
    schemaVersion: 1,
    promptVersion: d.promptVersion,
    narrative: d.narrative,
    facts: d.facts.map((f) => ({
      claim: f.claim,
      ...(f.findingId !== undefined ? { findingId: asFindingId(f.findingId) } : {}),
      evidenceIds: f.evidenceIds.map(asEvidenceId),
    })),
    hypotheses: d.hypotheses.map((h) => ({
      claim: h.claim,
      confidence: h.confidence,
      ...(h.findingId !== undefined ? { findingId: asFindingId(h.findingId) } : {}),
      evidenceIds: h.evidenceIds.map(asEvidenceId),
    })),
    citations: d.citations.map((c) => ({
      claim: c.claim,
      ...(c.findingId !== undefined ? { findingId: asFindingId(c.findingId) } : {}),
      ...(c.evidenceId !== undefined ? { evidenceId: asEvidenceId(c.evidenceId) } : {}),
    })),
    caveats: [...d.caveats],
    ...(d.modelId !== undefined ? { modelId: d.modelId } : {}),
    provider: d.provider,
  };
}

/**
 * Reject explanations that cite Finding/Evidence IDs absent from the packet.
 */
export function assertExplanationCitationsInPacket(
  explanation: Explanation,
  packet: EvidencePacket,
): void {
  const findingIds = new Set(packet.findings.map((f) => f.id));
  const evidenceIds = new Set<string>();
  for (const f of packet.findings) {
    for (const id of f.evidenceIds) {
      evidenceIds.add(id);
    }
  }
  for (const e of packet.evidenceExcerpts) {
    evidenceIds.add(e.evidenceId);
  }

  const unknown: string[] = [];

  for (const c of explanation.citations) {
    if (c.findingId !== undefined && !findingIds.has(c.findingId)) {
      unknown.push(`citation.findingId=${c.findingId}`);
    }
    if (c.evidenceId !== undefined && !evidenceIds.has(c.evidenceId)) {
      unknown.push(`citation.evidenceId=${c.evidenceId}`);
    }
  }
  for (const f of explanation.facts) {
    if (f.findingId !== undefined && !findingIds.has(f.findingId)) {
      unknown.push(`fact.findingId=${f.findingId}`);
    }
    for (const id of f.evidenceIds) {
      if (!evidenceIds.has(id)) {
        unknown.push(`fact.evidenceId=${id}`);
      }
    }
  }
  for (const h of explanation.hypotheses) {
    if (h.findingId !== undefined && !findingIds.has(h.findingId)) {
      unknown.push(`hypothesis.findingId=${h.findingId}`);
    }
    for (const id of h.evidenceIds) {
      if (!evidenceIds.has(id)) {
        unknown.push(`hypothesis.evidenceId=${id}`);
      }
    }
  }

  if (unknown.length > 0) {
    throw new DiffWitnessError(
      "provider",
      `Explanation cites IDs absent from EvidencePacket: ${unknown.join(", ")}`,
      { exitClass: "explain_error", details: { unknown } },
    );
  }
}
