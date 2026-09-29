import { createHash } from "node:crypto";
import { DiffWitnessError } from "./errors.js";
import {
  asBehavioralDiffId,
  asFindingId,
  asWorkflowId,
  type BaselineId,
  type BehavioralDiff,
  type BehavioralObservation,
  type Evidence,
  type EvidenceId,
  type Finding,
  type FindingChange,
  type FindingSeverity,
  type FindingType,
  type GitIdentity,
  type ObservationComparison,
  type WorkflowId,
} from "./types.js";

export interface DiffEngineInput {
  readonly baselineId: BaselineId;
  readonly baselineEvidence: readonly Evidence[];
  readonly currentEvidence: readonly Evidence[];
  readonly against: GitIdentity;
  /** Declared assumption ids from config (included when findings exist). */
  readonly assumptionIds?: readonly string[];
}

export type DiffEngineOutcome =
  | { readonly ok: true; readonly diff: BehavioralDiff }
  | {
      readonly ok: false;
      readonly status: "analysis_error";
      readonly message: string;
      readonly errorCategory: string;
      /** Partial diff with analysis_error status — never clean. */
      readonly diff: BehavioralDiff;
    };

const NORMALIZER_KEY = "normalizer_version";

/**
 * Deterministic DiffEngine (M2).
 * Same Evidence inputs → same BehavioralDiff. No LLM, network, randomness, or machine heuristics.
 * Compares keyed observations only — not causality.
 */
export function compareEvidence(input: DiffEngineInput): DiffEngineOutcome {
  const baselineByWorkflow = indexByWorkflow(input.baselineEvidence);
  const currentByWorkflow = indexByWorkflow(input.currentEvidence);

  const baselineEvidenceIds = sortIds(input.baselineEvidence.map((e) => e.id));
  const currentEvidenceIds = sortIds(input.currentEvidence.map((e) => e.id));

  const allWorkflowIds = sortStrings([
    ...new Set([...baselineByWorkflow.keys(), ...currentByWorkflow.keys()]),
  ]);

  // normalizer_version mismatch → analysis_error (never silent compare)
  for (const workflowId of allWorkflowIds) {
    const before = baselineByWorkflow.get(workflowId);
    const after = currentByWorkflow.get(workflowId);
    if (before === undefined || after === undefined) {
      continue;
    }
    const beforeNorm = observationPreview(before, NORMALIZER_KEY);
    const afterNorm = observationPreview(after, NORMALIZER_KEY);
    if (beforeNorm !== undefined && afterNorm !== undefined && beforeNorm !== afterNorm) {
      const message =
        `normalizer_version mismatch for workflow ${workflowId}: ` +
        `baseline=${beforeNorm} current=${afterNorm} — refusing silent compare`;
      const diff = emptyErrorDiff(input, baselineEvidenceIds, currentEvidenceIds, message);
      return {
        ok: false,
        status: "analysis_error",
        message,
        errorCategory: "normalizer_mismatch",
        diff,
      };
    }
    if (
      (beforeNorm === undefined && afterNorm !== undefined) ||
      (beforeNorm !== undefined && afterNorm === undefined)
    ) {
      const message = `normalizer_version observation missing on one side for workflow ${workflowId}`;
      const diff = emptyErrorDiff(input, baselineEvidenceIds, currentEvidenceIds, message);
      return {
        ok: false,
        status: "analysis_error",
        message,
        errorCategory: "normalizer_mismatch",
        diff,
      };
    }
  }

  const unchanged: ObservationComparison[] = [];
  const changed: ObservationComparison[] = [];
  const added: ObservationComparison[] = [];
  const removed: ObservationComparison[] = [];
  const findings: Finding[] = [];
  const affectedWorkflows = new Set<string>();

  for (const workflowId of allWorkflowIds) {
    const beforeEv = baselineByWorkflow.get(workflowId);
    const afterEv = currentByWorkflow.get(workflowId);
    const beforeMap = observationMap(beforeEv);
    const afterMap = observationMap(afterEv);
    const keys = sortStrings([...new Set([...beforeMap.keys(), ...afterMap.keys()])]);

    for (const key of keys) {
      // normalizer_version is compared for compatibility above; not a behavioral finding.
      if (key === NORMALIZER_KEY) {
        const b = beforeMap.get(key);
        const a = afterMap.get(key);
        if (b !== undefined && a !== undefined && b.valueDigest === a.valueDigest) {
          unchanged.push(row(workflowId, key, "unchanged", b.valueDigest, a.valueDigest));
        }
        continue;
      }

      const b = beforeMap.get(key);
      const a = afterMap.get(key);

      if (b !== undefined && a !== undefined) {
        if (b.valueDigest === a.valueDigest) {
          unchanged.push(row(workflowId, key, "unchanged", b.valueDigest, a.valueDigest));
        } else {
          changed.push(row(workflowId, key, "changed", b.valueDigest, a.valueDigest));
          affectedWorkflows.add(workflowId);
          findings.push(
            buildFinding({
              workflowId: asWorkflowId(workflowId),
              key,
              change: "changed",
              before: b,
              after: a,
              beforeEvidenceId: beforeEv!.id,
              afterEvidenceId: afterEv!.id,
              truncationAware: truncationContext(beforeMap, afterMap, key),
            }),
          );
        }
      } else if (b === undefined && a !== undefined) {
        added.push(row(workflowId, key, "added", undefined, a.valueDigest));
        affectedWorkflows.add(workflowId);
        findings.push(
          buildFinding({
            workflowId: asWorkflowId(workflowId),
            key,
            change: "appeared",
            before: undefined,
            after: a,
            beforeEvidenceId: beforeEv?.id,
            afterEvidenceId: afterEv!.id,
            truncationAware: truncationContext(beforeMap, afterMap, key),
          }),
        );
      } else if (b !== undefined && a === undefined) {
        removed.push(row(workflowId, key, "removed", b.valueDigest, undefined));
        affectedWorkflows.add(workflowId);
        findings.push(
          buildFinding({
            workflowId: asWorkflowId(workflowId),
            key,
            change: "disappeared",
            before: b,
            after: undefined,
            beforeEvidenceId: beforeEv!.id,
            afterEvidenceId: afterEv?.id,
            truncationAware: truncationContext(beforeMap, afterMap, key),
          }),
        );
      }
    }
  }

  sortComparisons(unchanged);
  sortComparisons(changed);
  sortComparisons(added);
  sortComparisons(removed);
  sortFindings(findings);

  const status = findings.length === 0 ? "clean" : "findings";
  const affectedAssumptionIds =
    findings.length > 0 ? sortStrings([...(input.assumptionIds ?? [])]) : [];

  const diff: BehavioralDiff = {
    schemaVersion: 1,
    id: asBehavioralDiffId(deterministicDiffId(input.baselineId, baselineEvidenceIds, currentEvidenceIds, findings)),
    baselineId: input.baselineId,
    baselineEvidenceIds,
    currentEvidenceIds,
    against: input.against,
    status,
    observations: { unchanged, changed, added, removed },
    findings,
    affectedWorkflows: sortStrings([...affectedWorkflows]),
    affectedAssumptions: affectedAssumptionIds,
  };

  return { ok: true, diff };
}

function emptyErrorDiff(
  input: DiffEngineInput,
  baselineEvidenceIds: readonly EvidenceId[],
  currentEvidenceIds: readonly EvidenceId[],
  message: string,
): BehavioralDiff {
  return {
    schemaVersion: 1,
    id: asBehavioralDiffId(
      deterministicDiffId(input.baselineId, baselineEvidenceIds, currentEvidenceIds, []),
    ),
    baselineId: input.baselineId,
    baselineEvidenceIds,
    currentEvidenceIds,
    against: input.against,
    status: "analysis_error",
    observations: { unchanged: [], changed: [], added: [], removed: [] },
    findings: [],
    affectedWorkflows: [],
    affectedAssumptions: [],
  };
  void message;
}

function indexByWorkflow(list: readonly Evidence[]): Map<string, Evidence> {
  const map = new Map<string, Evidence>();
  for (const ev of list) {
    const key = ev.workflowId as string;
    if (map.has(key)) {
      throw new DiffWitnessError(
        "analysis",
        `Duplicate Evidence for workflow ${key} in DiffEngine input`,
      );
    }
    map.set(key, ev);
  }
  return map;
}

function observationMap(evidence: Evidence | undefined): Map<string, BehavioralObservation> {
  const map = new Map<string, BehavioralObservation>();
  if (evidence === undefined) {
    return map;
  }
  for (const obs of evidence.observations) {
    if (map.has(obs.key)) {
      throw new DiffWitnessError(
        "analysis",
        `Duplicate observation key ${obs.key} on evidence ${evidence.id}`,
      );
    }
    map.set(obs.key, obs);
  }
  return map;
}

function observationPreview(evidence: Evidence, key: string): string | undefined {
  const obs = evidence.observations.find((o) => o.key === key);
  return obs?.rawPreview ?? obs?.normalized?.preview;
}

function row(
  workflowId: string,
  key: string,
  status: ObservationComparison["status"],
  beforeDigest: string | undefined,
  afterDigest: string | undefined,
): ObservationComparison {
  return {
    workflowId: asWorkflowId(workflowId),
    key,
    status,
    ...(beforeDigest !== undefined ? { beforeDigest } : {}),
    ...(afterDigest !== undefined ? { afterDigest } : {}),
  };
}

function truncationContext(
  beforeMap: Map<string, BehavioralObservation>,
  afterMap: Map<string, BehavioralObservation>,
  key: string,
): { streamTruncated: boolean } {
  if (key === "stdout") {
    return {
      streamTruncated:
        isTrueFlag(beforeMap.get("stdout_truncated")) ||
        isTrueFlag(afterMap.get("stdout_truncated")),
    };
  }
  if (key === "stderr") {
    return {
      streamTruncated:
        isTrueFlag(beforeMap.get("stderr_truncated")) ||
        isTrueFlag(afterMap.get("stderr_truncated")),
    };
  }
  return { streamTruncated: false };
}

function isTrueFlag(obs: BehavioralObservation | undefined): boolean {
  return obs?.rawPreview === "true";
}

function buildFinding(args: {
  workflowId: WorkflowId;
  key: string;
  change: FindingChange;
  before: BehavioralObservation | undefined;
  after: BehavioralObservation | undefined;
  beforeEvidenceId: EvidenceId | undefined;
  afterEvidenceId: EvidenceId | undefined;
  truncationAware: { streamTruncated: boolean };
}): Finding {
  const findingType = findingTypeForKey(args.key);
  const summary = summaryFor(args.key, args.change, args.truncationAware.streamTruncated);
  const evidenceIds: EvidenceId[] = [];
  if (args.beforeEvidenceId !== undefined) {
    evidenceIds.push(args.beforeEvidenceId);
  }
  if (args.afterEvidenceId !== undefined && args.afterEvidenceId !== args.beforeEvidenceId) {
    evidenceIds.push(args.afterEvidenceId);
  }
  if (evidenceIds.length === 0 && args.afterEvidenceId !== undefined) {
    evidenceIds.push(args.afterEvidenceId);
  }

  return {
    id: asFindingId(`f_${args.workflowId}_${args.key}_${args.change}`),
    workflowId: args.workflowId,
    observationKey: args.key,
    findingType,
    change: args.change,
    ...(args.before !== undefined ? { beforeDigest: args.before.valueDigest } : {}),
    ...(args.after !== undefined ? { afterDigest: args.after.valueDigest } : {}),
    summary,
    evidenceIds,
    severity: severityFor(findingType),
  };
}

export function findingTypeForKey(key: string): FindingType {
  if (key === "exit_code") {
    return "exit_code_changed";
  }
  if (key === "stdout") {
    return "stdout_changed";
  }
  if (key === "stderr") {
    return "stderr_changed";
  }
  if (key === "stdout_truncated" || key === "stderr_truncated") {
    return "truncation_changed";
  }
  if (key.startsWith("artifact:")) {
    return "artifact_changed";
  }
  return "observation_changed";
}

function summaryFor(key: string, change: FindingChange, streamTruncated: boolean): string {
  if (change === "appeared") {
    return `Observation appeared: ${key}`;
  }
  if (change === "disappeared") {
    return `Observation disappeared: ${key}`;
  }

  if (key === "exit_code") {
    return "Exit code changed";
  }
  if (key === "stdout") {
    return streamTruncated
      ? "Normalized stdout digest changed (one or both captures truncated)"
      : "Normalized stdout changed";
  }
  if (key === "stderr") {
    return streamTruncated
      ? "Normalized stderr digest changed (one or both captures truncated)"
      : "Normalized stderr changed";
  }
  if (key === "stdout_truncated") {
    return "Stdout capture truncation flag changed";
  }
  if (key === "stderr_truncated") {
    return "Stderr capture truncation flag changed";
  }
  if (key.startsWith("artifact:")) {
    const path = key.slice("artifact:".length);
    return `Artifact hash changed: ${path}`;
  }
  return `Observation changed: ${key}`;
}

function severityFor(type: FindingType): FindingSeverity {
  switch (type) {
    case "exit_code_changed":
      return "error";
    case "stdout_changed":
    case "stderr_changed":
    case "artifact_changed":
    case "truncation_changed":
      return "warn";
    case "observation_changed":
      return "info";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function deterministicDiffId(
  baselineId: BaselineId,
  baselineEvidenceIds: readonly EvidenceId[],
  currentEvidenceIds: readonly EvidenceId[],
  findings: readonly Finding[],
): string {
  const payload = JSON.stringify({
    baselineId,
    baselineEvidenceIds,
    currentEvidenceIds,
    findings: findings.map((f) => ({
      id: f.id,
      observationKey: f.observationKey,
      change: f.change,
      beforeDigest: f.beforeDigest ?? null,
      afterDigest: f.afterDigest ?? null,
    })),
  });
  const digest = createHash("sha256").update(payload, "utf8").digest("hex");
  return `bd_${digest.slice(0, 24)}`;
}

function sortComparisons(rows: ObservationComparison[]): void {
  rows.sort((a, b) => {
    const w = (a.workflowId as string).localeCompare(b.workflowId as string);
    if (w !== 0) {
      return w;
    }
    return a.key.localeCompare(b.key);
  });
}

function sortFindings(findings: Finding[]): void {
  findings.sort((a, b) => {
    const w = (a.workflowId as string).localeCompare(b.workflowId as string);
    if (w !== 0) {
      return w;
    }
    const k = a.observationKey.localeCompare(b.observationKey);
    if (k !== 0) {
      return k;
    }
    return a.change.localeCompare(b.change);
  });
}

function sortStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sortIds(ids: readonly EvidenceId[]): EvidenceId[] {
  return [...ids].sort((a, b) => (a as string).localeCompare(b as string));
}
