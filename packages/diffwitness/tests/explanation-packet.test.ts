import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildExplanationPacket } from "../src/application/build-explanation-packet.js";
import { redactExplanationPacket } from "../src/application/redact-packet.js";
import { DiffWitnessError } from "../src/domain/errors.js";
import {
  asBaselineId,
  asBehavioralDiffId,
  asEvidenceId,
  asFindingId,
  asWorkflowId,
  type BehavioralDiff,
  type Evidence,
  type Finding,
  type PacketBudgets,
} from "../src/domain/types.js";

const budgets: PacketBudgets = {
  maxChars: 8_000,
  maxFindings: 20,
  maxExcerpts: 10,
  maxExcerptChars: 200,
  maxPaths: 40,
};

function makeFinding(overrides: Partial<Finding> & Pick<Finding, "id" | "summary">): Finding {
  return {
    id: overrides.id,
    workflowId: overrides.workflowId ?? asWorkflowId("demo"),
    observationKey: overrides.observationKey ?? "stdout",
    findingType: overrides.findingType ?? "stdout_changed",
    change: overrides.change ?? "changed",
    summary: overrides.summary,
    evidenceIds: overrides.evidenceIds ?? [asEvidenceId("ev-cur")],
    severity: overrides.severity ?? "warn",
    ...(overrides.beforeDigest !== undefined ? { beforeDigest: overrides.beforeDigest } : {}),
    ...(overrides.afterDigest !== undefined ? { afterDigest: overrides.afterDigest } : {}),
  };
}

function makeDiff(findings: Finding[]): BehavioralDiff {
  return {
    schemaVersion: 1,
    id: asBehavioralDiffId("diff-1"),
    baselineId: asBaselineId("base-1"),
    baselineEvidenceIds: [asEvidenceId("ev-base")],
    currentEvidenceIds: [asEvidenceId("ev-cur")],
    against: { dirty: false, headSha: "abc" },
    status: findings.length > 0 ? "findings" : "clean",
    observations: {
      unchanged: [],
      changed: findings.map((f) => ({
        workflowId: f.workflowId,
        key: f.observationKey,
        status: "changed" as const,
        beforeDigest: "sha256:before",
        afterDigest: "sha256:after",
      })),
      added: [],
      removed: [],
    },
    findings,
    affectedWorkflows: findings.length > 0 ? ["demo"] : [],
    affectedAssumptions: [],
  };
}

function makeEvidence(id: string, preview: string): Evidence {
  return {
    id: asEvidenceId(id),
    workflowId: asWorkflowId("demo"),
    capturedAt: "2026-09-22T00:00:00.000Z",
    git: { dirty: false },
    exitCode: 0,
    durationMs: 1,
    artifactRefs: [],
    observations: [
      {
        key: "stdout",
        kind: "stdout",
        valueDigest: "sha256:after",
        normalized: {
          digest: "sha256:after",
          preview,
          maxChars: 256,
          truncated: false,
          byteLength: preview.length,
        },
        rawPreview: preview,
      },
    ],
    redactionApplied: false,
  };
}

describe("buildExplanationPacket", () => {
  it("preserves finding ids, evidenceIds, and changed observations", () => {
    const finding = makeFinding({
      id: asFindingId("f-1"),
      summary: "stdout changed",
      evidenceIds: [asEvidenceId("ev-cur"), asEvidenceId("ev-base")],
    });
    const packet = buildExplanationPacket({
      diff: makeDiff([finding]),
      evidence: [makeEvidence("ev-cur", "hello"), makeEvidence("ev-base", "hi")],
      assumptions: [{ id: "a1", description: "stable stdout" }],
      budgets,
    });
    assert.equal(packet.findings[0]?.id, asFindingId("f-1"));
    assert.deepEqual(packet.findings[0]?.evidenceIds, [
      asEvidenceId("ev-cur"),
      asEvidenceId("ev-base"),
    ]);
    assert.ok(packet.changedObservations.some((r) => r.key === "stdout"));
    assert.ok(packet.evidenceExcerpts.length >= 1);
    assert.equal(packet.redactionApplied, false);
  });

  it("is deterministic for the same inputs", () => {
    const finding = makeFinding({ id: asFindingId("f-1"), summary: "x" });
    const input = {
      diff: makeDiff([finding]),
      evidence: [makeEvidence("ev-cur", "hello")],
      assumptions: [] as const,
      budgets,
    };
    const a = buildExplanationPacket(input);
    const b = buildExplanationPacket(input);
    assert.deepEqual(a, b);
  });

  it("reduces by dropping low-severity findings before truncating IDs", () => {
    const findings = [
      makeFinding({ id: asFindingId("f-err"), summary: "err", severity: "error" }),
      makeFinding({ id: asFindingId("f-info"), summary: "info", severity: "info" }),
    ];
    const packet = buildExplanationPacket({
      diff: makeDiff(findings),
      evidence: [makeEvidence("ev-cur", "x")],
      assumptions: [],
      budgets: { ...budgets, maxFindings: 1 },
    });
    assert.equal(packet.findings.length, 1);
    assert.equal(packet.findings[0]?.id, asFindingId("f-err"));
  });

  it("fails clearly when packet cannot fit without dropping citations", () => {
    const hugeId = asEvidenceId(`ev-${"x".repeat(200)}`);
    const finding = makeFinding({
      id: asFindingId("f-1"),
      summary: "x",
      evidenceIds: [hugeId],
    });
    assert.throws(
      () =>
        buildExplanationPacket({
          diff: makeDiff([finding]),
          evidence: [],
          assumptions: [],
          budgets: { ...budgets, maxChars: 80 },
        }),
      (err: unknown) =>
        err instanceof DiffWitnessError &&
        err.exitClass === "explain_error" &&
        /Cannot reduce ExplanationPacket/.test(err.message),
    );
  });
});

describe("redactExplanationPacket", () => {
  it("redacts secrets in previews without mutating IDs", () => {
    const finding = makeFinding({ id: asFindingId("f-1"), summary: "stdout changed" });
    const packet = buildExplanationPacket({
      diff: makeDiff([finding]),
      evidence: [makeEvidence("ev-cur", "auth header Bearer SUPERSECRETTOKEN123 end")],
      assumptions: [],
      budgets,
    });
    const redacted = redactExplanationPacket(packet);
    assert.equal(redacted.findings[0]?.id, packet.findings[0]?.id);
    assert.deepEqual(redacted.findings[0]?.evidenceIds, packet.findings[0]?.evidenceIds);
    assert.equal(redacted.redactionApplied, true);
    assert.ok(redacted.evidenceExcerpts[0]?.preview.includes("[REDACTED:bearer]"));
    assert.equal(redacted.evidenceExcerpts[0]?.preview.includes("SUPERSECRETTOKEN123"), false);
  });
});
