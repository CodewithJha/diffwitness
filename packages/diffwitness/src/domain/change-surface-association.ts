import {
  withAssociationStatus,
  type AssociationStatus,
  type ChangeSurface,
} from "./change-surface.js";
import type { BehavioralDiff, EvidenceId, Finding } from "./types.js";

/**
 * Finding ↔ ChangeSurface association (M6). Deterministic, no AI.
 *
 * "associated" means only: the finding cites Evidence captured while executing the repository
 * state described by this change surface. It is co-occurrence — never causality.
 *
 * Never changes which findings exist, their ids, severity, type, or evidenceIds, and never
 * changes BehavioralDiff.id / status.
 */
export function associateChangeSurface(
  diff: BehavioralDiff,
  surface: ChangeSurface,
): BehavioralDiff {
  const effective =
    diff.status === "analysis_error" && surface.associationStatus === "associated"
      ? withAssociationStatus(
          surface,
          "unavailable",
          "Analysis status is analysis_error — no trustworthy findings to associate.",
        )
      : surface;
  const currentEvidence = new Set<EvidenceId>(diff.currentEvidenceIds);
  const findings = diff.findings.map((f) => annotate(f, effective, currentEvidence));
  return { ...diff, findings, changeSurface: effective };
}

function annotate(
  finding: Finding,
  surface: ChangeSurface,
  currentEvidence: ReadonlySet<EvidenceId>,
): Finding {
  const status = findingAssociationStatus(finding, surface, currentEvidence);
  return {
    ...finding,
    associationStatus: status,
    changeSurfaceRefs: status === "associated" ? [surface.id] : [],
  };
}

function findingAssociationStatus(
  finding: Finding,
  surface: ChangeSurface,
  currentEvidence: ReadonlySet<EvidenceId>,
): AssociationStatus {
  if (surface.associationStatus !== "associated") {
    return surface.associationStatus;
  }
  // Finding must come from this execution's evidence (e.g. not a baseline-only disappearance
  // for a workflow that was not run).
  return finding.evidenceIds.some((id) => currentEvidence.has(id)) ? "associated" : "unavailable";
}
