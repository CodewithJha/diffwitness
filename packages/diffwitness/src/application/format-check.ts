import type { ChangeSurface } from "../domain/change-surface.js";
import type { AnalysisResult, BehavioralDiff, Evidence, Finding } from "../domain/types.js";
import { formatChangeSurfaceHuman } from "./format-change-surface.js";
import { formatPreviewForDisplay } from "./format-preview.js";

/** What the human `check` report reads. Presentation only — never recomputes the diff. */
export interface CheckReportView {
  readonly analysis: AnalysisResult;
  readonly behavioralDiff?: BehavioralDiff;
  readonly baselineEvidence: readonly Evidence[];
  readonly currentEvidence: readonly Evidence[];
}

const MAX_ALONGSIDE_FILES = 5;

const VERDICT: Record<AnalysisResult["status"], string> = {
  findings: "BEHAVIOR CHANGED (status: findings)",
  clean: "NO BEHAVIOR CHANGE (status: clean)",
  analysis_error: "ANALYSIS ERROR (status: analysis_error) — this is not a clean result",
};

/**
 * Human `check` report: verdict, per-workflow status, and per-finding Before/After values taken
 * from the stored evidence previews, followed by the Git change-surface block.
 */
export function formatCheckHuman(view: CheckReportView): string {
  const status = view.analysis.status;
  const diff = view.behavioralDiff;
  const lines = [VERDICT[status]];

  if (view.analysis.message !== undefined) {
    lines.push(view.analysis.message);
  }
  if (diff === undefined || status === "analysis_error") {
    if (diff?.changeSurface !== undefined) {
      lines.push(...formatChangeSurfaceHuman(diff.changeSurface, diff.findings));
    }
    return lines.join("\n");
  }

  lines.push(observationSummary(diff));
  lines.push("", ...workflowTable(diff, view));

  if (diff.findings.length === 0) {
    lines.push("", "No behavioral observation deltas.");
  } else {
    diff.findings.forEach((finding, index) => {
      lines.push("", ...formatFinding(finding, index, diff, view));
    });
  }

  lines.push("", `Baseline: ${diff.baselineId}`);
  lines.push(
    `Evidence: baseline=${diff.baselineEvidenceIds.join(",")} current=${diff.currentEvidenceIds.join(",")}`,
  );
  if (diff.changeSurface !== undefined) {
    lines.push(...formatChangeSurfaceHuman(diff.changeSurface, diff.findings));
  }
  return lines.join("\n");
}

function observationSummary(diff: BehavioralDiff): string {
  const o = diff.observations;
  return (
    `Observations: ${o.unchanged.length} unchanged · ${o.changed.length} changed · ` +
    `${o.added.length} appeared · ${o.removed.length} disappeared`
  );
}

function workflowTable(diff: BehavioralDiff, view: CheckReportView): string[] {
  const ids = [
    ...new Set([
      ...view.baselineEvidence.map((e) => e.workflowId as string),
      ...view.currentEvidence.map((e) => e.workflowId as string),
    ]),
  ].sort((a, b) => a.localeCompare(b));
  const width = Math.max(0, ...ids.map((id) => id.length));
  const affected = new Set(diff.affectedWorkflows);
  const rows = ids.map((id) => {
    const count = diff.findings.filter((f) => f.workflowId === id).length;
    const state = affected.has(id) ? "CHANGED  " : "unchanged";
    const exit = exitSummary(
      view.baselineEvidence.find((e) => e.workflowId === id),
      view.currentEvidence.find((e) => e.workflowId === id),
    );
    const detail = affected.has(id) ? `  ${count} finding(s)` : "";
    return `  ${id.padEnd(width)}  ${state}  ${exit}${detail}`;
  });
  return [`Workflows (${ids.length}):`, ...rows];
}

function exitSummary(before: Evidence | undefined, after: Evidence | undefined): string {
  if (before === undefined || after === undefined) {
    return `exit ${before?.exitCode ?? "—"} → ${after?.exitCode ?? "—"}`;
  }
  if (before.exitCode === after.exitCode) {
    return `exit ${after.exitCode}${after.exitCode === 0 ? " (pass)" : ""}`;
  }
  return `exit ${before.exitCode} → ${after.exitCode}`;
}

function formatFinding(
  finding: Finding,
  index: number,
  diff: BehavioralDiff,
  view: CheckReportView,
): string[] {
  const baselineIds = new Set<string>(diff.baselineEvidenceIds);
  const beforeId = finding.evidenceIds.find((id) => baselineIds.has(id));
  const afterId = finding.evidenceIds.find((id) => !baselineIds.has(id));
  const before = view.baselineEvidence.find((e) => e.id === beforeId);
  const after = view.currentEvidence.find((e) => e.id === afterId);

  return [
    `Finding ${index + 1}/${diff.findings.length}  [${finding.severity}] ${finding.workflowId} · ${finding.observationKey} — ${finding.summary} (${finding.findingType})`,
    `  Before:   ${sideValue(before, finding.observationKey)}`,
    `  After:    ${sideValue(after, finding.observationKey)}`,
    `  Evidence: baseline ${beforeId ?? "(none)"} → current ${afterId ?? "(none)"}`,
    `  Changed alongside (Git): ${alongside(finding, diff.changeSurface)}`,
    "  Causality: not established",
  ];
}

function sideValue(evidence: Evidence | undefined, key: string): string {
  if (evidence === undefined) {
    return "(absent)";
  }
  const obs = evidence.observations.find((o) => o.key === key);
  if (obs === undefined) {
    return "(absent)";
  }
  return formatPreviewForDisplay(obs.normalized?.preview ?? obs.rawPreview, {
    sourceTruncated: obs.normalized?.truncated === true,
  });
}

function alongside(finding: Finding, surface: ChangeSurface | undefined): string {
  if (surface === undefined) {
    return "not captured";
  }
  if (finding.associationStatus !== "associated") {
    return `none listed (${finding.associationStatus ?? surface.associationStatus})`;
  }
  if (surface.files.length === 0) {
    return "no source changes vs baseline commit";
  }
  const shown = surface.files.slice(0, MAX_ALONGSIDE_FILES).map((f) => `${f.path} (${f.status})`);
  const hidden = surface.truncation.filesTotal - shown.length;
  return `${shown.join(", ")}${hidden > 0 ? `, +${hidden} more` : ""}`;
}
