import { z } from "zod";
import type { DemoSummary } from "./demo-summary.js";

/** v2: `summary`, per-finding `before`/`after`, and `scenario.config` added. */
export const DEMO_RESPONSE_SCHEMA_VERSION = 2 as const;

export type StageId = "init" | "baseline" | "change" | "check" | "explain" | "explain-json";

export interface StageRecord {
  readonly id: StageId;
  readonly label: string;
  /** Display string only (the real argv also carries `--repo <workspace>`). */
  readonly command: string;
  readonly outcome: "exited" | "signaled" | "timed_out" | "aborted" | "spawn_failed";
  readonly exitCode: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly truncated: boolean;
  /** Parsed real CLI JSON (explain-json stage only). */
  readonly json: unknown;
  readonly durationMs: number;
}

export type FailureKind =
  | "stage_failed"
  | "analysis_error"
  | "explain_error"
  | "unexpected_result"
  | "stage_timeout"
  | "request_timeout"
  | "interrupted"
  | "internal_error";

export interface DemoFailure {
  readonly kind: FailureKind;
  readonly stage: StageId | "setup" | null;
  readonly message: string;
}

export interface FindingsSummary {
  readonly source: string;
  readonly status: string;
  readonly behavioralDiffId: string;
  readonly items: readonly {
    readonly id: string;
    readonly severity: string;
    readonly workflowId: string;
    readonly observationKey: string;
    readonly findingType: string;
    readonly summary: string;
    readonly evidenceIds: readonly string[];
    readonly associationStatus: string | null;
    /** Stored evidence previews (from the CLI's redacted EvidencePacket excerpts). */
    readonly before: EvidenceSide | null;
    readonly after: EvidenceSide | null;
  }[];
  readonly changeSurface: {
    readonly baseRevision: string | null;
    readonly currentRevision: string | null;
    readonly workingTreeIncluded: boolean;
    readonly associationStatus: string;
    readonly causality: string;
    readonly files: readonly {
      readonly status: string;
      readonly path: string;
      readonly additions: number | null;
      readonly deletions: number | null;
    }[];
  } | null;
}

export interface EvidenceSide {
  readonly evidenceId: string;
  /** Bounded, redacted preview; null when the packet carried no excerpt for this side. */
  readonly preview: string | null;
}

export interface ExplanationSummary {
  readonly status: string;
  readonly provider: string | null;
  readonly promptVersion: string | null;
  readonly narrative: string | null;
  readonly facts: readonly { readonly claim: string; readonly evidenceIds: readonly string[] }[];
  readonly hypotheses: readonly { readonly claim: string; readonly confidence: string }[];
  readonly caveats: readonly string[];
  readonly citedEvidenceIds: readonly string[];
  readonly error: string | null;
}

export interface DemoResult {
  readonly schemaVersion: typeof DEMO_RESPONSE_SCHEMA_VERSION;
  readonly scenario: {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly change: string;
    /** The trusted workflow config the run installed (static fixture file). */
    readonly config: string | null;
  };
  readonly status: "completed" | "failed";
  readonly failure: DemoFailure | null;
  readonly stages: readonly StageRecord[];
  readonly summary: DemoSummary | null;
  readonly findings: FindingsSummary | null;
  readonly explanation: ExplanationSummary | null;
  readonly durationMs: number;
}

/**
 * Shape of `diffwitness explain --json` fields the page displays. Validates CLI output at the
 * server boundary; values are copied verbatim, never recomputed.
 */
const observationRowSchema = z.object({
  workflowId: z.string(),
  key: z.string(),
  beforeDigest: z.string().optional(),
  afterDigest: z.string().optional(),
});

const explainJsonSchema = z.object({
  schemaVersion: z.literal(2),
  command: z.literal("explain"),
  status: z.string(),
  behavioralDiff: z.object({
    id: z.string(),
    status: z.string(),
    baselineEvidenceIds: z.array(z.string()),
    currentEvidenceIds: z.array(z.string()),
    affectedWorkflows: z.array(z.string()),
    observations: z.object({
      unchanged: z.array(observationRowSchema),
      changed: z.array(observationRowSchema),
      added: z.array(observationRowSchema),
      removed: z.array(observationRowSchema),
    }),
    findings: z.array(
      z.object({
        id: z.string(),
        severity: z.string(),
        workflowId: z.string(),
        observationKey: z.string(),
        findingType: z.string(),
        summary: z.string(),
        evidenceIds: z.array(z.string()),
        associationStatus: z.string().optional(),
      }),
    ),
    changeSurface: z
      .object({
        baseRevision: z.string().nullable(),
        currentRevision: z.string().nullable(),
        workingTreeIncluded: z.boolean(),
        associationStatus: z.string(),
        causality: z.string(),
        files: z.array(
          z.object({
            status: z.string(),
            path: z.string(),
            additions: z.number().optional(),
            deletions: z.number().optional(),
          }),
        ),
      })
      .optional(),
  }),
  explanation: z
    .object({
      provider: z.string(),
      promptVersion: z.string(),
      narrative: z.string(),
      facts: z.array(z.object({ claim: z.string(), evidenceIds: z.array(z.string()) })),
      hypotheses: z.array(
        z.object({ claim: z.string(), confidence: z.string(), evidenceIds: z.array(z.string()) }),
      ),
      caveats: z.array(z.string()),
      citations: z.array(z.object({ evidenceId: z.string().optional() })),
    })
    .nullable(),
  packet: z
    .object({
      evidenceExcerpts: z.array(
        z.object({ evidenceId: z.string(), observationKey: z.string(), preview: z.string() }),
      ),
    })
    .nullable(),
  explainError: z.string().nullable(),
  metadata: z.object({
    provider: z.string().nullable(),
    promptVersion: z.string().nullable(),
    explanationStatus: z.string(),
  }),
});

export type ExplainJson = z.infer<typeof explainJsonSchema>;

export function parseExplainJson(value: unknown): ExplainJson | null {
  const parsed = explainJsonSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function summarizeFindings(json: ExplainJson, source: string): FindingsSummary {
  const diff = json.behavioralDiff;
  const cs = diff.changeSurface;
  const baselineIds = new Set(diff.baselineEvidenceIds);
  return {
    source,
    status: diff.status,
    behavioralDiffId: diff.id,
    items: diff.findings.map((f) => ({
      id: f.id,
      severity: f.severity,
      workflowId: f.workflowId,
      observationKey: f.observationKey,
      findingType: f.findingType,
      summary: f.summary,
      evidenceIds: f.evidenceIds,
      associationStatus: f.associationStatus ?? null,
      before: evidenceSide(json, f.evidenceIds.find((id) => baselineIds.has(id)), f.observationKey),
      after: evidenceSide(json, f.evidenceIds.find((id) => !baselineIds.has(id)), f.observationKey),
    })),
    changeSurface:
      cs === undefined
        ? null
        : {
            baseRevision: cs.baseRevision,
            currentRevision: cs.currentRevision,
            workingTreeIncluded: cs.workingTreeIncluded,
            associationStatus: cs.associationStatus,
            causality: cs.causality,
            files: cs.files.map((f) => ({
              status: f.status,
              path: f.path,
              additions: f.additions ?? null,
              deletions: f.deletions ?? null,
            })),
          },
  };
}

/** Look up the packet excerpt the CLI produced for one side of a finding (never recomputed). */
function evidenceSide(json: ExplainJson, evidenceId: string | undefined, key: string): EvidenceSide | null {
  if (evidenceId === undefined) return null;
  const excerpt = json.packet?.evidenceExcerpts.find(
    (e) => e.evidenceId === evidenceId && e.observationKey === key,
  );
  return { evidenceId, preview: excerpt?.preview ?? null };
}

export function summarizeExplanation(json: ExplainJson): ExplanationSummary {
  const e = json.explanation;
  return {
    status: json.metadata.explanationStatus,
    provider: e?.provider ?? json.metadata.provider,
    promptVersion: e?.promptVersion ?? json.metadata.promptVersion,
    narrative: e?.narrative ?? null,
    facts: e?.facts.map((f) => ({ claim: f.claim, evidenceIds: f.evidenceIds })) ?? [],
    hypotheses: e?.hypotheses.map((h) => ({ claim: h.claim, confidence: h.confidence })) ?? [],
    caveats: e?.caveats ?? [],
    citedEvidenceIds: citedEvidenceIds(e),
    error: json.explainError,
  };
}

function citedEvidenceIds(e: ExplainJson["explanation"]): string[] {
  if (e === null) return [];
  const ids = [
    ...e.facts.flatMap((f) => f.evidenceIds),
    ...e.hypotheses.flatMap((h) => h.evidenceIds),
    ...e.citations.flatMap((c) => (c.evidenceId !== undefined ? [c.evidenceId] : [])),
  ];
  return [...new Set(ids)];
}
