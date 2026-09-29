import type { AnalysisStatus } from "./analysis-status.js";
import type {
  AssociationStatus,
  Causality,
  ChangeSurface,
  ChangeSurfaceId,
  ChangedFile,
} from "./change-surface.js";

/** Branded identifiers — opaque strings at runtime. */
export type EvidenceId = string & { readonly __brand: "EvidenceId" };
export type FindingId = string & { readonly __brand: "FindingId" };
export type BaselineId = string & { readonly __brand: "BaselineId" };
export type BehavioralDiffId = string & { readonly __brand: "BehavioralDiffId" };
export type ExecutionId = string & { readonly __brand: "ExecutionId" };
export type WorkflowId = string & { readonly __brand: "WorkflowId" };

export function asEvidenceId(value: string): EvidenceId {
  return value as EvidenceId;
}

export function asFindingId(value: string): FindingId {
  return value as FindingId;
}

export function asBaselineId(value: string): BaselineId {
  return value as BaselineId;
}

export function asBehavioralDiffId(value: string): BehavioralDiffId {
  return value as BehavioralDiffId;
}

export function asExecutionId(value: string): ExecutionId {
  return value as ExecutionId;
}

export function asWorkflowId(value: string): WorkflowId {
  return value as WorkflowId;
}

/** Local repository context (tech-spec RepoContext). */
export interface Repository {
  readonly rootPath: string;
  readonly git: GitIdentity;
}

export interface GitIdentity {
  readonly headSha?: string;
  readonly baseSha?: string;
  readonly dirty: boolean;
  readonly mergeBase?: string;
}

/** Declared workflow from config (execution policy applied later). */
export interface Workflow {
  readonly id: WorkflowId;
  readonly name: string;
  readonly command: readonly string[];
  readonly cwd?: string;
  readonly timeoutMs: number;
  readonly env?: Readonly<Record<string, string>>;
  readonly artifactGlobs?: readonly string[];
  readonly normalize?: NormalizeSpec;
}

/** Normalization knobs — engine deferred; types only in M0. */
export interface NormalizeSpec {
  readonly stripAnsi?: boolean;
  readonly redactEnv?: readonly string[];
  readonly stableSortLines?: boolean;
  readonly ignoreLinePatterns?: readonly string[];
  readonly maxBytes?: number;
}

/**
 * Bounded normalized representation of captured content.
 * Full normalization engine is deferred; digests + bounded reps are the Evidence contract.
 */
export interface BoundedNormalizedRep {
  readonly digest: string;
  readonly preview: string;
  readonly maxChars: number;
  readonly truncated: boolean;
  readonly byteLength: number;
}

export type ObservationKind =
  | "exit"
  | "stdout"
  | "stderr"
  | "artifact"
  | "metric"
  | "structured";

export interface BehavioralObservation {
  readonly key: string;
  readonly kind: ObservationKind;
  /** Content-addressed digest of normalized bytes (source of truth for compare). */
  readonly valueDigest: string;
  /** Optional bounded normalized text/bytes preview — never unbounded. */
  readonly normalized?: BoundedNormalizedRep;
  readonly rawPreview?: string;
  readonly severityHint?: FindingSeverity;
}

export interface ArtifactRef {
  readonly digest: string;
  readonly path: string;
  readonly kind?: string;
}

export interface BlobRef {
  readonly digest: string;
}

/**
 * Evidence packet persisted after workflow capture.
 * Digests are authoritative; normalized reps are bounded and optional.
 */
export interface Evidence {
  readonly id: EvidenceId;
  readonly workflowId: WorkflowId;
  readonly capturedAt: string;
  readonly git: GitIdentity;
  readonly exitCode: number;
  readonly durationMs: number;
  readonly stdoutRef?: BlobRef;
  readonly stderrRef?: BlobRef;
  readonly artifactRefs: readonly ArtifactRef[];
  readonly observations: readonly BehavioralObservation[];
  readonly redactionApplied: boolean;
}

export type FindingChange = "changed" | "appeared" | "disappeared";
export type FindingSeverity = "info" | "warn" | "error";

/**
 * Small finding vocabulary (M2). Not automatic "regression" / bug labels —
 * only observable evidence deltas.
 */
export type FindingType =
  | "exit_code_changed"
  | "stdout_changed"
  | "stderr_changed"
  | "artifact_changed"
  | "truncation_changed"
  | "observation_changed";

export type ObservationComparisonStatus =
  | "unchanged"
  | "changed"
  | "added"
  | "removed";

/** Per-key observation compare row (deterministic DiffEngine output). */
export interface ObservationComparison {
  readonly workflowId: WorkflowId;
  readonly key: string;
  readonly status: ObservationComparisonStatus;
  readonly beforeDigest?: string;
  readonly afterDigest?: string;
}

export interface Finding {
  readonly id: FindingId;
  readonly workflowId: WorkflowId;
  readonly observationKey: string;
  readonly findingType: FindingType;
  readonly change: FindingChange;
  readonly beforeDigest?: string;
  readonly afterDigest?: string;
  readonly summary: string;
  readonly evidenceIds: readonly EvidenceId[];
  readonly severity: FindingSeverity;
  /** M6: co-occurrence with a change surface (never causality). Absent on pre-M6 diffs. */
  readonly associationStatus?: AssociationStatus;
  readonly changeSurfaceRefs?: readonly ChangeSurfaceId[];
}

/**
 * Deterministic behavioral compare result.
 * Compares observable Evidence only — not causality, not "bugs".
 */
export interface BehavioralDiff {
  readonly schemaVersion: 1;
  readonly id: BehavioralDiffId;
  readonly baselineId: BaselineId;
  readonly baselineEvidenceIds: readonly EvidenceId[];
  readonly currentEvidenceIds: readonly EvidenceId[];
  readonly against: GitIdentity;
  readonly status: AnalysisStatus;
  /** Grouped observation rows — source of truth for what moved. */
  readonly observations: {
    readonly unchanged: readonly ObservationComparison[];
    readonly changed: readonly ObservationComparison[];
    readonly added: readonly ObservationComparison[];
    readonly removed: readonly ObservationComparison[];
  };
  readonly findings: readonly Finding[];
  readonly affectedWorkflows: readonly string[];
  readonly affectedAssumptions: readonly string[];
  readonly evidencePacketRef?: string;
  /**
   * M6: bounded Git change surface attached after DiffEngine. Additive + optional, so
   * schemaVersion stays 1 and pre-M6 persisted diffs still parse. Not part of BehavioralDiff.id.
   */
  readonly changeSurface?: ChangeSurface;
}

/** Versioned local baseline record. */
export interface Baseline {
  readonly id: BaselineId;
  readonly createdAt: string;
  readonly git: GitIdentity;
  readonly envFingerprint: string;
  readonly workflowIds: readonly WorkflowId[];
  readonly evidenceIds: readonly EvidenceId[];
}

/** Single workflow execution attempt (pre- or post-persist). */
export interface Execution {
  readonly id: ExecutionId;
  readonly workflowId: WorkflowId;
  readonly startedAt: string;
  readonly finishedAt?: string;
  readonly exitCode?: number;
  readonly durationMs?: number;
  readonly evidenceId?: EvidenceId;
  readonly errorMessage?: string;
}

/**
 * Top-level analysis outcome. status discrimination is mandatory:
 * analysis_error ≠ empty findings / clean.
 */
export interface AnalysisResult {
  readonly status: AnalysisStatus;
  readonly behavioralDiff?: BehavioralDiff;
  readonly message?: string;
  readonly errorCategory?: string;
}

/** EvidencePacket wire version. v2 (M6) replaced v1's untyped `changeSurface.paths`. */
export const EVIDENCE_PACKET_SCHEMA_VERSION = 2 as const;

/**
 * Reduced bundle for AI explain — never invents observations.
 * Application / CLI may call this ExplanationPacket; wire schema is EvidencePacket.v2.
 */
export interface EvidencePacket {
  readonly schemaVersion: typeof EVIDENCE_PACKET_SCHEMA_VERSION;
  readonly behavioralDiffId: BehavioralDiffId;
  readonly status: AnalysisStatus;
  readonly findings: readonly EvidencePacketFinding[];
  /** Changed observation rows preserved for explain context (capped). */
  readonly changedObservations: readonly PacketChangedObservation[];
  readonly evidenceExcerpts: readonly EvidenceExcerpt[];
  readonly assumptions: readonly AssumptionRef[];
  /** Git co-occurrence context. Membership is not evidence of causality. */
  readonly changeSurface?: PacketChangeSurface;
  readonly budgets: PacketBudgets;
  /** True when preview/path text was redacted before provider handoff. */
  readonly redactionApplied: boolean;
}

/** Alias used by the application layer (same artifact as EvidencePacket.v2). */
export type ExplanationPacket = EvidencePacket;

/** Reduced change surface for AI: file list only (no line locations, no file contents). */
export interface PacketChangeSurface {
  readonly id: ChangeSurfaceId;
  readonly associationStatus: AssociationStatus;
  readonly causality: Causality;
  readonly baseRevision: string | null;
  readonly currentRevision: string | null;
  readonly workingTreeIncluded: boolean;
  readonly limitation: string | null;
  readonly files: readonly ChangedFile[];
  /** Files in the full (already bounded) surface; files.length may be smaller. */
  readonly filesTotal: number;
  readonly truncated: boolean;
}

export interface PacketBudgets {
  readonly maxChars: number;
  readonly maxFindings: number;
  readonly maxExcerpts: number;
  readonly maxExcerptChars: number;
  readonly maxPaths: number;
}

export interface EvidencePacketFinding {
  readonly id: FindingId;
  readonly severity: FindingSeverity;
  readonly workflowId: WorkflowId;
  readonly observationKey: string;
  readonly findingType: FindingType;
  readonly change: FindingChange;
  readonly summary: string;
  /** Supporting EvidenceIds — never truncated or dropped during reduction. */
  readonly evidenceIds: readonly EvidenceId[];
  readonly associationStatus?: AssociationStatus;
}

export interface PacketChangedObservation {
  readonly workflowId: WorkflowId;
  readonly key: string;
  readonly beforeDigest?: string;
  readonly afterDigest?: string;
}

export interface EvidenceExcerpt {
  readonly evidenceId: EvidenceId;
  readonly observationKey: string;
  readonly preview: string;
  readonly digest: string;
}

export interface AssumptionRef {
  readonly id: string;
  readonly description: string;
}

export interface ExplanationCitation {
  readonly findingId?: FindingId;
  readonly evidenceId?: EvidenceId;
  readonly claim: string;
}

/** Observed fact bound to packet findings/evidence — not speculative. */
export interface ExplanationFact {
  readonly claim: string;
  readonly findingId?: FindingId;
  readonly evidenceIds: readonly EvidenceId[];
}

/**
 * Speculative interpretation. Never labeled as fact.
 * Confidence is categorical only (never numeric scores).
 */
export type HypothesisConfidence = "low" | "medium" | "high";

export interface ExplanationHypothesis {
  readonly claim: string;
  readonly confidence: HypothesisConfidence;
  readonly findingId?: FindingId;
  readonly evidenceIds: readonly EvidenceId[];
}

export interface Explanation {
  readonly schemaVersion: 1;
  readonly promptVersion: string;
  readonly narrative: string;
  readonly facts: readonly ExplanationFact[];
  readonly hypotheses: readonly ExplanationHypothesis[];
  readonly citations: readonly ExplanationCitation[];
  readonly caveats: readonly string[];
  readonly modelId?: string;
  readonly provider: string;
}
