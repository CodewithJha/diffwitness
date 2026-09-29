import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MockAIProvider, assertProviderIsExplainOnly } from "../src/infrastructure/ai/mock-ai-provider.js";
import { EXPLAIN_PROMPT_VERSION } from "../src/infrastructure/ai/prompts/explain.v2.js";
import {
  assertExplanationCitationsInPacket,
  parseExplanation,
} from "../src/domain/schemas.js";
import {
  asBehavioralDiffId,
  asEvidenceId,
  asFindingId,
  asWorkflowId,
  type EvidencePacket,
} from "../src/domain/types.js";

function samplePacket(status: EvidencePacket["status"], withFindings: boolean): EvidencePacket {
  return {
    schemaVersion: 2,
    behavioralDiffId: asBehavioralDiffId("diff-1"),
    status,
    findings: withFindings
      ? [
          {
            id: asFindingId("f-1"),
            severity: "warn",
            workflowId: asWorkflowId("demo"),
            observationKey: "stdout",
            findingType: "stdout_changed",
            change: "changed",
            summary: "stdout digest changed",
            evidenceIds: [asEvidenceId("ev-1")],
          },
        ]
      : [],
    changedObservations: withFindings
      ? [
          {
            workflowId: asWorkflowId("demo"),
            key: "stdout",
            beforeDigest: "sha256:aaa",
            afterDigest: "sha256:bbb",
          },
        ]
      : [],
    evidenceExcerpts: withFindings
      ? [
          {
            evidenceId: asEvidenceId("ev-1"),
            observationKey: "stdout",
            preview: "hello",
            digest: "sha256:bbb",
          },
        ]
      : [],
    assumptions: [],
    budgets: {
      maxChars: 4000,
      maxFindings: 20,
      maxExcerpts: 10,
      maxExcerptChars: 200,
      maxPaths: 40,
    },
    redactionApplied: false,
  };
}

describe("MockAIProvider", () => {
  it("explains findings deterministically and cites evidence", async () => {
    const provider = new MockAIProvider();
    assertProviderIsExplainOnly(provider);
    const first = await provider.explain(samplePacket("findings", true));
    const second = await provider.explain(samplePacket("findings", true));
    assert.equal(first.provider, "mock");
    assert.equal(first.promptVersion, EXPLAIN_PROMPT_VERSION);
    assert.equal(first.narrative, second.narrative);
    assert.deepEqual(first, second);
    assert.equal(first.citations[0]?.findingId, asFindingId("f-1"));
    assert.equal(first.citations[0]?.evidenceId, asEvidenceId("ev-1"));
    assert.match(first.narrative, /FACT:/);
    assert.match(first.narrative, /EVIDENCE:/);
    assert.match(first.narrative, /INTERPRETATION:/);
    assert.match(first.narrative, /ev-1/);
    assert.ok(first.facts.length >= 1);
    assert.ok(first.hypotheses.length >= 1);
    assert.ok(["low", "medium", "high"].includes(first.hypotheses[0]!.confidence));
    assertExplanationCitationsInPacket(first, samplePacket("findings", true));
  });

  it("refuses clean bill of health on analysis_error packets", async () => {
    const provider = new MockAIProvider();
    const explanation = await provider.explain(samplePacket("analysis_error", false));
    assert.match(explanation.narrative, /analysis_error/i);
    assert.ok(explanation.caveats.some((c) => c.includes("analysis_error")));
    assert.equal(explanation.hypotheses.length, 0);
  });

  it("does not fabricate findings explanation on clean packets", async () => {
    const provider = new MockAIProvider();
    const explanation = await provider.explain(samplePacket("clean", false));
    assert.match(explanation.narrative, /No behavioral findings/i);
    assert.equal(explanation.citations.length, 0);
  });

  it("exposes no execution API", () => {
    const provider = new MockAIProvider();
    assert.equal(typeof (provider as unknown as { run?: unknown }).run, "undefined");
    assert.equal(typeof (provider as unknown as { exec?: unknown }).exec, "undefined");
    assert.equal(typeof (provider as unknown as { readFile?: unknown }).readFile, "undefined");
  });

  it("rejects explanations with unknown citations", () => {
    const packet = samplePacket("findings", true);
    const bad = parseExplanation({
      schemaVersion: 1,
      promptVersion: EXPLAIN_PROMPT_VERSION,
      narrative: "invented",
      facts: [],
      hypotheses: [],
      citations: [{ findingId: "missing-f", claim: "nope" }],
      caveats: [],
      provider: "mock",
    });
    assert.throws(
      () => assertExplanationCitationsInPacket(bad, packet),
      (err: unknown) => err instanceof Error && /absent from EvidencePacket/.test(err.message),
    );
  });
});
