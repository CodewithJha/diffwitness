import { formatPreviewForDisplay } from "../application/format-preview.js";
import { digestUtf8 } from "../infrastructure/evidence/digest.js";
import type { ExplainJson } from "./demo-result.js";
import type { DemoScenario } from "./scenarios.js";

export type TestsResult = "PASS" | "FAIL" | "UNKNOWN";

/** Summary card data. Every value is read from the real CLI JSON; nothing is recomputed. */
export interface DemoSummary {
  readonly verdict: "BEHAVIOR CHANGED" | "NO BEHAVIOR CHANGE" | "ANALYSIS ERROR";
  readonly status: string;
  readonly tests: { readonly workflowId: string; readonly result: TestsResult; readonly changed: boolean };
  readonly behavior: { readonly workflowId: string; readonly changed: boolean };
  readonly output: {
    readonly workflowId: string;
    readonly observationKey: string;
    readonly before: string;
    readonly after: string;
  } | null;
  readonly observations: {
    readonly unchanged: number;
    readonly changed: number;
    readonly appeared: number;
    readonly disappeared: number;
  };
  readonly findingCount: number;
  readonly evidence: { readonly baseline: readonly string[]; readonly current: readonly string[] };
  readonly causality: string;
  readonly headline: string;
}

const EXIT_ZERO_DIGEST = digestUtf8("0");

export function summarizeDemo(json: ExplainJson, roles: DemoScenario["roles"]): DemoSummary {
  const diff = json.behavioralDiff;
  const o = diff.observations;
  const affected = new Set(diff.affectedWorkflows);
  const tests = {
    workflowId: roles.testsWorkflowId,
    result: testsResult(json, roles.testsWorkflowId),
    changed: affected.has(roles.testsWorkflowId),
  };
  const behavior = { workflowId: roles.behaviorWorkflowId, changed: affected.has(roles.behaviorWorkflowId) };
  const output = outputChange(json, roles.behaviorWorkflowId);
  const observations = {
    unchanged: o.unchanged.length,
    changed: o.changed.length,
    appeared: o.added.length,
    disappeared: o.removed.length,
  };
  const verdict =
    diff.status === "findings" ? "BEHAVIOR CHANGED" : diff.status === "clean" ? "NO BEHAVIOR CHANGE" : "ANALYSIS ERROR";
  const headline = [
    `Tests: ${tests.result} (${tests.changed ? "changed" : "unchanged"})`,
    `Behavior: ${behavior.changed ? "CHANGED" : "unchanged"}`,
    ...(output !== null ? [`${output.before} → ${output.after}`] : []),
    `${observations.unchanged} unchanged`,
    `${observations.changed + observations.appeared + observations.disappeared} changed`,
  ].join(" · ");
  return {
    verdict,
    status: diff.status,
    tests,
    behavior,
    output,
    observations,
    findingCount: diff.findings.length,
    evidence: { baseline: diff.baselineEvidenceIds, current: diff.currentEvidenceIds },
    causality: diff.changeSurface?.causality ?? "not_established",
    headline,
  };
}

/**
 * PASS/FAIL of the tests workflow from its exit_code observation: an unchanged row whose digest
 * is the digest of "0", or the "after" excerpt of an exit_code finding.
 */
function testsResult(json: ExplainJson, workflowId: string): TestsResult {
  const diff = json.behavioralDiff;
  const unchanged = diff.observations.unchanged.find((r) => r.workflowId === workflowId && r.key === "exit_code");
  if (unchanged !== undefined) {
    return unchanged.afterDigest === EXIT_ZERO_DIGEST ? "PASS" : "FAIL";
  }
  const changed = diff.observations.changed.find((r) => r.workflowId === workflowId && r.key === "exit_code");
  if (changed !== undefined) {
    return changed.afterDigest === EXIT_ZERO_DIGEST ? "PASS" : "FAIL";
  }
  return "UNKNOWN";
}

function outputChange(json: ExplainJson, workflowId: string): DemoSummary["output"] {
  const diff = json.behavioralDiff;
  const finding =
    diff.findings.find((f) => f.workflowId === workflowId && f.observationKey === "stdout") ??
    diff.findings.find((f) => f.workflowId === workflowId);
  if (finding === undefined) return null;
  const baselineIds = new Set(diff.baselineEvidenceIds);
  const preview = (evidenceId: string | undefined): string => {
    if (evidenceId === undefined) return "(absent)";
    const excerpt = json.packet?.evidenceExcerpts.find(
      (e) => e.evidenceId === evidenceId && e.observationKey === finding.observationKey,
    );
    return formatPreviewForDisplay(excerpt?.preview, { maxChars: 80 });
  };
  return {
    workflowId,
    observationKey: finding.observationKey,
    before: preview(finding.evidenceIds.find((id) => baselineIds.has(id))),
    after: preview(finding.evidenceIds.find((id) => !baselineIds.has(id))),
  };
}
