import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYSIS_STATUSES,
  isAnalysisFailure,
  isSuccessfulAnalysis,
} from "../src/domain/analysis-status.js";
import { parseEvidence, parseFinding, analysisResultSchema } from "../src/domain/schemas.js";
import { DiffWitnessError } from "../src/domain/errors.js";
import { asEvidenceId, asFindingId, asWorkflowId } from "../src/domain/types.js";

describe("AnalysisStatus", () => {
  it("enumerates clean | findings | analysis_error", () => {
    assert.deepEqual([...ANALYSIS_STATUSES], ["clean", "findings", "analysis_error"]);
  });

  it("discriminates failure from successful analysis", () => {
    assert.equal(isSuccessfulAnalysis("clean"), true);
    assert.equal(isSuccessfulAnalysis("findings"), true);
    assert.equal(isSuccessfulAnalysis("analysis_error"), false);
    assert.equal(isAnalysisFailure("analysis_error"), true);
    assert.equal(isAnalysisFailure("clean"), false);
  });

  it("rejects analysis_error paired with clean BehavioralDiff via schema", () => {
    const bad = analysisResultSchema.safeParse({
      status: "analysis_error",
      behavioralDiff: { status: "clean", findings: [] },
    });
    assert.equal(bad.success, false);
  });
});

describe("Evidence schema", () => {
  it("accepts digests and bounded normalized reps", () => {
    const evidence = parseEvidence({
      id: "ev-1",
      workflowId: "demo",
      capturedAt: "2026-09-22T00:00:00.000Z",
      git: { dirty: false, headSha: "abc" },
      exitCode: 0,
      durationMs: 12,
      artifactRefs: [],
      observations: [
        {
          key: "stdout",
          kind: "stdout",
          valueDigest: "sha256:deadbeef",
          normalized: {
            digest: "sha256:deadbeef",
            preview: "hello",
            maxChars: 256,
            truncated: false,
            byteLength: 5,
          },
        },
      ],
      redactionApplied: false,
    });
    assert.equal(evidence.id, asEvidenceId("ev-1"));
    assert.equal(evidence.observations[0]?.normalized?.preview, "hello");
  });

  it("fails on malformed Evidence", () => {
    assert.throws(
      () =>
        parseEvidence({
          id: "ev-1",
          // missing required fields
        }),
      (err: unknown) => err instanceof DiffWitnessError && err.category === "analysis",
    );
  });
});

describe("Finding schema", () => {
  it("requires EvidenceId references", () => {
    const finding = parseFinding({
      id: "f-1",
      workflowId: "demo",
      observationKey: "stdout",
      findingType: "stdout_changed",
      change: "changed",
      summary: "Normalized stdout changed",
      evidenceIds: ["ev-1", "ev-2"],
      severity: "warn",
    });
    assert.equal(finding.id, asFindingId("f-1"));
    assert.equal(finding.workflowId, asWorkflowId("demo"));
    assert.equal(finding.findingType, "stdout_changed");
    assert.deepEqual(finding.evidenceIds, [asEvidenceId("ev-1"), asEvidenceId("ev-2")]);
  });

  it("rejects findings without evidenceIds", () => {
    assert.throws(() =>
      parseFinding({
        id: "f-1",
        workflowId: "demo",
        observationKey: "stdout",
        findingType: "stdout_changed",
        change: "changed",
        summary: "x",
        evidenceIds: [],
        severity: "info",
      }),
    );
  });
});
