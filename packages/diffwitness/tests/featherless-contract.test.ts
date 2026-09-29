import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MockAIProvider, assertProviderIsExplainOnly } from "../src/infrastructure/ai/mock-ai-provider.js";
import { FeatherlessAIProvider } from "../src/infrastructure/ai/featherless-ai-provider.js";
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
  type Explanation,
} from "../src/domain/types.js";
import type { AiProvider } from "../src/ports/ai-provider.js";

function findingsPacket(): EvidencePacket {
  return {
    schemaVersion: 2,
    behavioralDiffId: asBehavioralDiffId("diff-1"),
    status: "findings",
    findings: [
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
    ],
    changedObservations: [
      {
        workflowId: asWorkflowId("demo"),
        key: "stdout",
        beforeDigest: "sha256:aaa",
        afterDigest: "sha256:bbb",
      },
    ],
    evidenceExcerpts: [
      {
        evidenceId: asEvidenceId("ev-1"),
        observationKey: "stdout",
        preview: "hello",
        digest: "sha256:bbb",
      },
    ],
    assumptions: [],
    budgets: {
      maxChars: 4000,
      maxFindings: 20,
      maxExcerpts: 10,
      maxExcerptChars: 200,
      maxPaths: 40,
    },
    redactionApplied: true,
  };
}

function assertExplanationContract(explanation: Explanation, packet: EvidencePacket): void {
  parseExplanation(explanation);
  assert.equal(explanation.schemaVersion, 1);
  assert.equal(typeof explanation.promptVersion, "string");
  assert.ok(explanation.promptVersion.length > 0);
  assert.equal(typeof explanation.narrative, "string");
  assert.ok(Array.isArray(explanation.facts));
  assert.ok(Array.isArray(explanation.hypotheses));
  assert.ok(Array.isArray(explanation.citations));
  assert.ok(Array.isArray(explanation.caveats));
  assert.equal(typeof explanation.provider, "string");
  for (const h of explanation.hypotheses) {
    assert.ok(["low", "medium", "high"].includes(h.confidence));
  }
  assertExplanationCitationsInPacket(explanation, packet);
}

describe("Mock vs Featherless Explanation contract", () => {
  it("both providers satisfy AiProvider.explain-only and Explanation.v1 shape", async () => {
    const packet = findingsPacket();
    const mock = new MockAIProvider();
    assertProviderIsExplainOnly(mock);

    const featherless = new FeatherlessAIProvider({
      apiKey: "k",
      baseUrl: "https://api.featherless.ai/v1",
      model: "Qwen/Qwen2.5-7B-Instruct",
      timeoutMs: 5_000,
      maxResponseBytes: 64_000,
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    schemaVersion: 1,
                    promptVersion: EXPLAIN_PROMPT_VERSION,
                    narrative:
                      "FACT:\n- stdout changed\nEVIDENCE:\n- ev-1\nINTERPRETATION:\n- edit",
                    facts: [
                      {
                        claim: "stdout digest changed",
                        findingId: "f-1",
                        evidenceIds: ["ev-1"],
                      },
                    ],
                    hypotheses: [
                      {
                        claim: "May relate to edits",
                        confidence: "medium",
                        findingId: "f-1",
                        evidenceIds: ["ev-1"],
                      },
                    ],
                    citations: [
                      { findingId: "f-1", evidenceId: "ev-1", claim: "stdout digest changed" },
                    ],
                    caveats: ["packet-bound"],
                    provider: "featherless",
                    modelId: "Qwen/Qwen2.5-7B-Instruct",
                  }),
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    });
    assertProviderIsExplainOnly(featherless);

    const providers: AiProvider[] = [mock, featherless];
    for (const provider of providers) {
      const explanation = await provider.explain(packet);
      assertExplanationContract(explanation, packet);
      assert.equal(explanation.promptVersion, EXPLAIN_PROMPT_VERSION);
    }

    const mockExpl = await mock.explain(packet);
    const featherExpl = await featherless.explain(packet);
    assert.equal(mockExpl.provider, "mock");
    assert.equal(featherExpl.provider, "featherless");
    // Same wire schema keys — providers differ only in narrative/provider/modelId.
    assert.deepEqual(Object.keys(mockExpl).sort(), Object.keys(featherExpl).sort());
  });
});
