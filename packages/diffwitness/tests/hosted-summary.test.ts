import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseExplainJson, summarizeFindings, type ExplainJson } from "../src/hosted/demo-result.js";
import { summarizeDemo } from "../src/hosted/demo-summary.js";
import { digestUtf8 } from "../src/infrastructure/evidence/digest.js";

const ROLES = { testsWorkflowId: "tests", behaviorWorkflowId: "pricing" };
const d = (v: string) => digestUtf8(v);

function explainJson(overrides: {
  status?: string;
  testsExit?: { before: string; after: string };
  findings?: unknown[];
  excerpts?: unknown[];
}): ExplainJson {
  const testsExit = overrides.testsExit ?? { before: "0", after: "0" };
  const exitRow = { workflowId: "tests", key: "exit_code", beforeDigest: d(testsExit.before), afterDigest: d(testsExit.after) };
  const findings = overrides.findings ?? [
    {
      id: "f_pricing_stdout_changed",
      severity: "warn",
      workflowId: "pricing",
      observationKey: "stdout",
      findingType: "stdout_changed",
      summary: "Normalized stdout changed",
      evidenceIds: ["ev_b1", "ev_c1"],
      associationStatus: "associated",
    },
  ];
  const parsed = parseExplainJson({
    schemaVersion: 2,
    command: "explain",
    status: overrides.status ?? "findings",
    behavioralDiff: {
      id: "bd_x",
      status: overrides.status ?? "findings",
      baselineEvidenceIds: ["ev_b1", "ev_b2"],
      currentEvidenceIds: ["ev_c1", "ev_c2"],
      affectedWorkflows: [
        ...new Set((findings as { workflowId: string }[]).map((f) => f.workflowId)),
      ],
      observations: {
        unchanged: testsExit.before === testsExit.after ? [exitRow] : [],
        changed: testsExit.before === testsExit.after ? [{ workflowId: "pricing", key: "stdout" }] : [exitRow],
        added: [],
        removed: [],
      },
      findings,
    },
    explanation: null,
    packet: {
      evidenceExcerpts: overrides.excerpts ?? [
        { evidenceId: "ev_b1", observationKey: "stdout", preview: '{"total":315}\n' },
        { evidenceId: "ev_c1", observationKey: "stdout", preview: '{"total":280}\n' },
      ],
    },
    explainError: null,
    metadata: { provider: "mock", promptVersion: "explain.v2", explanationStatus: "ok" },
  });
  assert.ok(parsed, "fixture must match the explain JSON schema");
  return parsed;
}

describe("hosted summary derivation (from CLI JSON only)", () => {
  it("tests PASS unchanged + behavior CHANGED with before → after", () => {
    const s = summarizeDemo(explainJson({}), ROLES);
    assert.equal(s.verdict, "BEHAVIOR CHANGED");
    assert.deepEqual(s.tests, { workflowId: "tests", result: "PASS", changed: false });
    assert.deepEqual(s.behavior, { workflowId: "pricing", changed: true });
    assert.equal(s.headline, 'Tests: PASS (unchanged) · Behavior: CHANGED · {"total":315} → {"total":280} · 1 unchanged · 1 changed');
  });

  it("tests FAIL when the tests exit code changed to non-zero", () => {
    const json = explainJson({
      testsExit: { before: "0", after: "1" },
      findings: [
        {
          id: "f_tests_exit_code_changed",
          severity: "error",
          workflowId: "tests",
          observationKey: "exit_code",
          findingType: "exit_code_changed",
          summary: "Exit code changed",
          evidenceIds: ["ev_b2", "ev_c2"],
        },
      ],
      excerpts: [],
    });
    const s = summarizeDemo(json, ROLES);
    assert.deepEqual(s.tests, { workflowId: "tests", result: "FAIL", changed: true });
    assert.deepEqual(s.behavior, { workflowId: "pricing", changed: false });
    assert.equal(s.output, null);
  });

  it("clean diff → NO BEHAVIOR CHANGE, no output line", () => {
    const s = summarizeDemo(explainJson({ status: "clean", findings: [], excerpts: [] }), ROLES);
    assert.equal(s.verdict, "NO BEHAVIOR CHANGE");
    assert.equal(s.output, null);
    assert.equal(s.findingCount, 0);
  });

  it("missing excerpts are shown as such, never invented", () => {
    const s = summarizeDemo(explainJson({ excerpts: [] }), ROLES);
    assert.deepEqual(s.output, { workflowId: "pricing", observationKey: "stdout", before: "(no preview stored)", after: "(no preview stored)" });
    const items = summarizeFindings(explainJson({ excerpts: [] }), "src").items;
    assert.deepEqual(items[0]?.before, { evidenceId: "ev_b1", preview: null });
  });
});
