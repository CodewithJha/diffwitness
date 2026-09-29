import type { ChangeSurface } from "../domain/change-surface.js";
import { DiffWitnessError } from "../domain/errors.js";
import { parseEvidencePacket } from "../domain/schemas.js";
import {
  EVIDENCE_PACKET_SCHEMA_VERSION,
  type AssumptionRef,
  type BehavioralDiff,
  type Evidence,
  type EvidenceExcerpt,
  type EvidencePacket,
  type EvidencePacketFinding,
  type PacketBudgets,
  type PacketChangeSurface,
  type PacketChangedObservation,
} from "../domain/types.js";

export interface BuildExplanationPacketInput {
  readonly diff: BehavioralDiff;
  readonly evidence: readonly Evidence[];
  readonly assumptions: readonly AssumptionRef[];
  readonly budgets: PacketBudgets;
}

const SEVERITY_RANK: Record<"info" | "warn" | "error", number> = {
  error: 3,
  warn: 2,
  info: 1,
};

/**
 * Build EvidencePacket.v2 (ExplanationPacket) with progressive reduction.
 * Deterministic. Never truncates Finding/Evidence IDs or drops supporting evidenceIds.
 * Change-surface files are reduced first; the surface header (association status +
 * causality marker) is never dropped. Fails clearly when the packet cannot fit under maxChars.
 */
export function buildExplanationPacket(input: BuildExplanationPacketInput): EvidencePacket {
  const { diff, budgets } = input;
  const evidenceById = new Map(input.evidence.map((e) => [e.id as string, e]));
  const surface = diff.changeSurface;

  const sortedFindings = [...diff.findings].sort((a, b) => {
    const sev = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (sev !== 0) {
      return sev;
    }
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  let findingCap = Math.min(budgets.maxFindings, sortedFindings.length);
  let excerptCharCap = budgets.maxExcerptChars;
  let includeAssumptions = true;
  let surfaceFileCap = Math.min(budgets.maxPaths, surface?.files.length ?? 0);
  let includeChangedObs = true;
  let excerptCap = budgets.maxExcerpts;

  // Progressive reduction passes until under budget or impossible.
  for (let pass = 0; pass < 64; pass++) {
    const selected = sortedFindings.slice(0, findingCap);
    const findings: EvidencePacketFinding[] = selected.map((f) => ({
      id: f.id,
      severity: f.severity,
      workflowId: f.workflowId,
      observationKey: f.observationKey,
      findingType: f.findingType,
      change: f.change,
      summary: f.summary,
      evidenceIds: [...f.evidenceIds],
      ...(f.associationStatus !== undefined ? { associationStatus: f.associationStatus } : {}),
    }));

    const changedObservations: PacketChangedObservation[] = includeChangedObs
      ? selectChangedObservations(diff, findings, budgets.maxFindings)
      : [];

    const evidenceExcerpts = buildExcerpts({
      findings,
      evidenceById,
      maxExcerpts: excerptCap,
      maxExcerptChars: excerptCharCap,
    });

    const assumptions = includeAssumptions
      ? input.assumptions.map((a) => ({ id: a.id, description: a.description }))
      : input.assumptions.map((a) => ({ id: a.id, description: "" }));

    const changeSurface =
      surface !== undefined ? packetChangeSurface(surface, surfaceFileCap) : undefined;

    const candidate: EvidencePacket = {
      schemaVersion: EVIDENCE_PACKET_SCHEMA_VERSION,
      behavioralDiffId: diff.id,
      status: diff.status,
      findings,
      changedObservations,
      evidenceExcerpts,
      assumptions,
      ...(changeSurface !== undefined ? { changeSurface } : {}),
      budgets: { ...budgets },
      redactionApplied: false,
    };

    parseEvidencePacket(candidate);
    const size = serializedSize(candidate);
    if (size <= budgets.maxChars) {
      return candidate;
    }

    // Reduction ladder — never drop evidenceIds or truncate IDs.
    if (surfaceFileCap > 0) {
      surfaceFileCap = Math.floor(surfaceFileCap / 2);
      continue;
    }
    if (includeAssumptions && input.assumptions.some((a) => a.description.length > 0)) {
      includeAssumptions = false;
      continue;
    }
    if (includeChangedObs) {
      includeChangedObs = false;
      continue;
    }
    if (excerptCharCap > 32) {
      excerptCharCap = Math.max(32, Math.floor(excerptCharCap / 2));
      continue;
    }
    if (excerptCap > 0) {
      excerptCap = Math.max(0, excerptCap - 1);
      continue;
    }
    if (findingCap > 1) {
      // Drop lowest-severity finding (end of sorted list) only when still over budget.
      findingCap -= 1;
      excerptCap = budgets.maxExcerpts;
      excerptCharCap = budgets.maxExcerptChars;
      includeChangedObs = true;
      continue;
    }

    // Single finding still too large — cannot reduce safely.
    throw new DiffWitnessError(
      "provider",
      `Cannot reduce ExplanationPacket under maxChars=${budgets.maxChars} without truncating IDs or dropping supporting evidence citations (serialized=${size})`,
      { exitClass: "explain_error", details: { size, budgets } },
    );
  }

  throw new DiffWitnessError(
    "provider",
    "ExplanationPacket reduction exhausted without fitting budget",
    { exitClass: "explain_error" },
  );
}

function packetChangeSurface(surface: ChangeSurface, fileCap: number): PacketChangeSurface {
  const files = surface.files.slice(0, fileCap).map((f) => ({ ...f }));
  return {
    id: surface.id,
    associationStatus: surface.associationStatus,
    causality: surface.causality,
    baseRevision: surface.baseRevision,
    currentRevision: surface.currentRevision,
    workingTreeIncluded: surface.workingTreeIncluded,
    limitation: surface.limitation,
    files,
    filesTotal: surface.truncation.filesTotal,
    truncated: surface.truncation.truncated || files.length < surface.truncation.filesTotal,
  };
}

function selectChangedObservations(
  diff: BehavioralDiff,
  findings: readonly EvidencePacketFinding[],
  maxRows: number,
): PacketChangedObservation[] {
  const keys = new Set(findings.map((f) => `${f.workflowId}\0${f.observationKey}`));
  const rows = [
    ...diff.observations.changed,
    ...diff.observations.added,
    ...diff.observations.removed,
  ]
    .filter((row) => keys.has(`${row.workflowId}\0${row.key}`))
    .map((row) => ({
      workflowId: row.workflowId,
      key: row.key,
      ...(row.beforeDigest !== undefined ? { beforeDigest: row.beforeDigest } : {}),
      ...(row.afterDigest !== undefined ? { afterDigest: row.afterDigest } : {}),
    }))
    .sort((a, b) => {
      const wa = `${a.workflowId}:${a.key}`;
      const wb = `${b.workflowId}:${b.key}`;
      return wa < wb ? -1 : wa > wb ? 1 : 0;
    });
  return rows.slice(0, maxRows);
}

function buildExcerpts(args: {
  readonly findings: readonly EvidencePacketFinding[];
  readonly evidenceById: Map<string, Evidence>;
  readonly maxExcerpts: number;
  readonly maxExcerptChars: number;
}): EvidenceExcerpt[] {
  const out: EvidenceExcerpt[] = [];
  const seen = new Set<string>();

  for (const finding of args.findings) {
    for (const evidenceId of finding.evidenceIds) {
      if (out.length >= args.maxExcerpts) {
        return out;
      }
      const evidence = args.evidenceById.get(evidenceId);
      if (evidence === undefined) {
        continue;
      }
      const obs =
        evidence.observations.find((o) => o.key === finding.observationKey) ??
        evidence.observations[0];
      if (obs === undefined) {
        continue;
      }
      const dedupeKey = `${evidenceId}\0${obs.key}`;
      if (seen.has(dedupeKey)) {
        continue;
      }
      seen.add(dedupeKey);
      const previewSource = obs.normalized?.preview ?? obs.rawPreview ?? "";
      out.push({
        evidenceId: evidence.id,
        observationKey: obs.key,
        preview: truncatePreview(previewSource, args.maxExcerptChars),
        digest: obs.valueDigest,
      });
    }
  }
  return out;
}

function truncatePreview(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxChars - 1))}…`;
}

function serializedSize(packet: EvidencePacket): number {
  return JSON.stringify(packet).length;
}
