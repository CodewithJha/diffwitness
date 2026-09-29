import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCheckHuman } from "../src/application/format-check.js";
import { formatPreviewForDisplay } from "../src/application/format-preview.js";
import { compareEvidence } from "../src/domain/diff-engine.js";
import {
  asBaselineId,
  asEvidenceId,
  asWorkflowId,
  type BehavioralObservation,
  type Evidence,
} from "../src/domain/types.js";
import { digestUtf8 } from "../src/infrastructure/evidence/digest.js";

function textObs(key: "stdout" | "stderr", text: string, truncated = false): BehavioralObservation {
  return {
    key,
    kind: key,
    valueDigest: digestUtf8(text),
    normalized: { digest: digestUtf8(text), preview: text, maxChars: 256, truncated, byteLength: text.length },
  };
}

function evidence(id: string, workflowId: string, stdout: string, exitCode = 0, truncated = false): Evidence {
  return {
    id: asEvidenceId(id),
    workflowId: asWorkflowId(workflowId),
    capturedAt: "2026-10-01T00:00:00.000Z",
    git: { dirty: false },
    exitCode,
    durationMs: 1,
    artifactRefs: [],
    redactionApplied: false,
    observations: [
      { key: "exit_code", kind: "exit", valueDigest: digestUtf8(String(exitCode)), rawPreview: String(exitCode) },
      textObs("stdout", stdout, truncated),
      textObs("stderr", ""),
    ],
  };
}

function report(baseline: Evidence[], current: Evidence[]): string {
  const outcome = compareEvidence({
    baselineId: asBaselineId("bl_test"),
    baselineEvidence: baseline,
    currentEvidence: current,
    against: { dirty: false },
  });
  assert.equal(outcome.ok, true);
  return formatCheckHuman({
    analysis: { status: outcome.diff.status, behavioralDiff: outcome.diff },
    behavioralDiff: outcome.diff,
    baselineEvidence: baseline,
    currentEvidence: current,
  });
}

describe("check human output (Before/After)", () => {
  const baseline = [evidence("ev_b_pricing", "pricing", '{"total":315}\n'), evidence("ev_b_tests", "tests", "....\n")];
  const current = [evidence("ev_c_pricing", "pricing", '{"total":280}\n'), evidence("ev_c_tests", "tests", "....\n")];

  it("leads with the verdict and per-workflow status", () => {
    const out = report(baseline, current);
    assert.match(out, /^BEHAVIOR CHANGED \(status: findings\)\n/);
    assert.match(out, /^Observations: \d+ unchanged · 1 changed · 0 appeared · 0 disappeared$/m);
    assert.match(out, /^ {2}pricing {2}CHANGED {4}exit 0 \(pass\) {2}1 finding\(s\)$/m);
    assert.match(out, /^ {2}tests {4}unchanged {2}exit 0 \(pass\)$/m);
  });

  it("shows Before/After values, both evidence ids, and the causality line per finding", () => {
    const out = report(baseline, current);
    assert.match(out, /^Finding 1\/1 {2}\[warn\] pricing · stdout — Normalized stdout changed \(stdout_changed\)$/m);
    assert.match(out, /^ {2}Before: {3}\{"total":315\}$/m);
    assert.match(out, /^ {2}After: {4}\{"total":280\}$/m);
    assert.match(out, /^ {2}Evidence: baseline ev_b_pricing → current ev_c_pricing$/m);
    assert.match(out, /^ {2}Changed alongside \(Git\): not captured$/m);
    assert.match(out, /^ {2}Causality: not established$/m);
  });

  it("reports a clean run without findings", () => {
    const out = report(baseline, baseline);
    assert.match(out, /^NO BEHAVIOR CHANGE \(status: clean\)\n/);
    assert.match(out, /No behavioral observation deltas\./);
    assert.doesNotMatch(out, /Before:/);
  });

  it("shows exit code transitions", () => {
    const failing = [evidence("ev_c_pricing", "pricing", '{"total":315}\n', 1), current[1]!];
    const out = report(baseline, failing);
    assert.match(out, /^ {2}pricing {2}CHANGED {4}exit 0 → 1 {2}1 finding\(s\)$/m);
    assert.match(out, /\[error\] pricing · exit_code/);
    assert.match(out, /^ {2}Before: {3}0$/m);
    assert.match(out, /^ {2}After: {4}1$/m);
  });

  it("marks previews that were truncated at capture time", () => {
    const long = [evidence("ev_c_pricing", "pricing", "x".repeat(40), 0, true), current[1]!];
    const out = report(baseline, long);
    assert.match(out, /^ {2}After: {4}x{40}…$/m);
  });
});

describe("formatPreviewForDisplay", () => {
  it("drops one trailing newline and escapes control characters", () => {
    assert.equal(formatPreviewForDisplay("a\tb\nc\n"), "a\\tb\\nc");
    assert.equal(formatPreviewForDisplay("\u001b[31mred"), "\\u001b[31mred");
  });

  it("bounds output with a truncation marker", () => {
    const out = formatPreviewForDisplay("y".repeat(500), { maxChars: 20 });
    assert.equal(out.length, 20);
    assert.ok(out.endsWith("…"));
  });

  it("labels empty and missing previews", () => {
    assert.equal(formatPreviewForDisplay("\n"), "(empty)");
    assert.equal(formatPreviewForDisplay(undefined), "(no preview stored)");
  });
});
