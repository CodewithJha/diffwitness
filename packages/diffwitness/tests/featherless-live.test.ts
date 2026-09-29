/**
 * Opt-in live Featherless integration.
 * SKIP unless DIFFWITNESS_FEATHERLESS_LIVE=1 and FEATHERLESS_API_KEY are set.
 * Not part of normal CI.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FeatherlessAIProvider } from "../src/infrastructure/ai/featherless-ai-provider.js";
import { EXPLAIN_PROMPT_VERSION } from "../src/infrastructure/ai/prompts/explain.v2.js";
import { assertExplanationCitationsInPacket } from "../src/domain/schemas.js";
import {
  asBehavioralDiffId,
  asEvidenceId,
  asFindingId,
  asWorkflowId,
  type EvidencePacket,
} from "../src/domain/types.js";

const liveEnabled =
  process.env.DIFFWITNESS_FEATHERLESS_LIVE === "1" &&
  typeof process.env.FEATHERLESS_API_KEY === "string" &&
  process.env.FEATHERLESS_API_KEY.length > 0;

const model =
  process.env.DIFFWITNESS_FEATHERLESS_MODEL ?? "Qwen/Qwen2.5-7B-Instruct";

function packet(): EvidencePacket {
  return {
    schemaVersion: 2,
    behavioralDiffId: asBehavioralDiffId("live-diff-1"),
    status: "findings",
    findings: [
      {
        id: asFindingId("f-live-1"),
        severity: "warn",
        workflowId: asWorkflowId("demo"),
        observationKey: "stdout",
        findingType: "stdout_changed",
        change: "changed",
        summary: "stdout digest changed in live test",
        evidenceIds: [asEvidenceId("ev-live-1")],
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
        evidenceId: asEvidenceId("ev-live-1"),
        observationKey: "stdout",
        preview: "hello-live",
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

describe("Featherless live integration (opt-in)", () => {
  it(
    liveEnabled
      ? "calls Featherless chat/completions and validates Explanation"
      : "SKIPPED — set DIFFWITNESS_FEATHERLESS_LIVE=1 and FEATHERLESS_API_KEY",
    { skip: !liveEnabled },
    async () => {
      const provider = FeatherlessAIProvider.fromConfig({
        apiKeyEnv: "FEATHERLESS_API_KEY",
        baseUrl: "https://api.featherless.ai/v1",
        model,
        timeoutMs: 60_000,
        maxResponseBytes: 512_000,
        preferJsonObjectFormat: true,
        xTitle: "DiffWitness",
      });
      const p = packet();
      const explanation = await provider.explain(p);
      assert.equal(explanation.provider, "featherless");
      assert.equal(explanation.promptVersion, EXPLAIN_PROMPT_VERSION);
      assertExplanationCitationsInPacket(explanation, p);
      assert.ok(explanation.narrative.length > 0);
    },
  );
});
