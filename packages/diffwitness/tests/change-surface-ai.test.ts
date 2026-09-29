import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildExplanationPacket } from "../src/application/build-explanation-packet.js";
import { redactExplanationPacket } from "../src/application/redact-packet.js";
import { buildChangeSurface, type ChangedFile } from "../src/domain/change-surface.js";
import { associateChangeSurface } from "../src/domain/change-surface-association.js";
import { isDiffWitnessError } from "../src/domain/errors.js";
import {
  assertExplanationCitationsInPacket,
  parseEvidencePacket,
} from "../src/domain/schemas.js";
import {
  asBaselineId,
  asBehavioralDiffId,
  asEvidenceId,
  asFindingId,
  asWorkflowId,
  type BehavioralDiff,
  type EvidencePacket,
  type PacketBudgets,
} from "../src/domain/types.js";
import { validateExplanationSemantics } from "../src/domain/validate-explanation-semantics.js";
import { FeatherlessAIProvider } from "../src/infrastructure/ai/featherless-ai-provider.js";
import type { FetchLike } from "../src/infrastructure/ai/featherless/http-client.js";
import { MockAIProvider } from "../src/infrastructure/ai/mock-ai-provider.js";
import { EXPLAIN_PROMPT_VERSION, EXPLAIN_SYSTEM_PROMPT } from "../src/infrastructure/ai/prompts/explain.v2.js";

const budgets: PacketBudgets = { maxChars: 8_000, maxFindings: 20, maxExcerpts: 10, maxExcerptChars: 200, maxPaths: 40 };
const CAUSAL = /\b(caused|causes|root cause|because of|due to|introduced by|responsible for|led to|resulted in)\b/i;

function diffWithSurface(files: ChangedFile[]): BehavioralDiff {
  const base: BehavioralDiff = {
    schemaVersion: 1,
    id: asBehavioralDiffId("bd-1"),
    baselineId: asBaselineId("bl-1"),
    baselineEvidenceIds: [asEvidenceId("ev-base")],
    currentEvidenceIds: [asEvidenceId("ev-cur")],
    against: { dirty: true, headSha: "b".repeat(40) },
    status: "findings",
    observations: { unchanged: [], changed: [], added: [], removed: [] },
    findings: [
      {
        id: asFindingId("f_demo_stdout_changed"),
        workflowId: asWorkflowId("demo"),
        observationKey: "stdout",
        findingType: "stdout_changed",
        change: "changed",
        summary: "Normalized stdout changed",
        evidenceIds: [asEvidenceId("ev-base"), asEvidenceId("ev-cur")],
        severity: "warn",
      },
    ],
    affectedWorkflows: ["demo"],
    affectedAssumptions: [],
  };
  const surface = buildChangeSurface({
    baseRevision: "a".repeat(40),
    currentRevision: "b".repeat(40),
    workingTreeIncluded: true,
    files,
    locations: [],
    locationsComplete: true,
    gitOutputCapped: false,
    excludedOperationalPaths: 0,
  });
  return associateChangeSurface(base, surface);
}

function packetFor(files: ChangedFile[], b: PacketBudgets = budgets): EvidencePacket {
  return redactExplanationPacket(
    buildExplanationPacket({ diff: diffWithSurface(files), evidence: [], assumptions: [], budgets: b }),
  );
}

describe("EvidencePacket.v2 change surface", () => {
  it("carries association + causality marker; schema-valid; per-finding associationStatus", () => {
    const packet = parseEvidencePacket(packetFor([{ path: "README.md", status: "modified", additions: 1, deletions: 0 }]));
    assert.equal(packet.schemaVersion, 2);
    assert.equal(packet.changeSurface?.causality, "not_established");
    assert.equal(packet.changeSurface?.associationStatus, "associated");
    assert.deepEqual(packet.changeSurface?.files.map((f) => f.path), ["README.md"]);
    assert.equal(packet.findings[0]?.associationStatus, "associated");
  });

  it("rejects v1 packets explicitly", () => {
    assert.throws(
      () => parseEvidencePacket({ ...packetFor([]), schemaVersion: 1 }),
      (e: unknown) => isDiffWitnessError(e) && /Unsupported EvidencePacket schemaVersion 1/.test(e.message),
    );
  });

  it("budget reduction shrinks surface files first, keeps header, never drops Finding/Evidence IDs", () => {
    const files: ChangedFile[] = Array.from({ length: 40 }, (_, i) => ({
      path: `src/${"deep/".repeat(10)}module-${String(i).padStart(2, "0")}.ts`,
      status: "modified",
    }));
    const packet = packetFor(files, { ...budgets, maxChars: 2_500 });
    assert.ok(JSON.stringify(packet).length <= 2_500);
    assert.ok((packet.changeSurface?.files.length ?? 0) < 40);
    assert.equal(packet.changeSurface?.truncated, true);
    assert.equal(packet.changeSurface?.filesTotal, 40);
    assert.equal(packet.changeSurface?.causality, "not_established");
    assert.deepEqual(packet.findings[0]?.evidenceIds, ["ev-base", "ev-cur"]);
  });

  it("maxPaths caps packet files", () => {
    const files: ChangedFile[] = Array.from({ length: 10 }, (_, i) => ({ path: `f${i}.txt`, status: "added" }));
    const packet = packetFor(files, { ...budgets, maxPaths: 3 });
    assert.equal(packet.changeSurface?.files.length, 3);
    assert.equal(packet.changeSurface?.truncated, true);
  });

  it("redacts secret-looking paths", () => {
    const packet = packetFor([{ path: "config/token=abcdef123456.txt", status: "added" }]);
    assert.equal(packet.redactionApplied, true);
    assert.ok(!JSON.stringify(packet.changeSurface).includes("abcdef123456"));
  });
});

describe("MockAI with change surface", () => {
  it("mentions files as co-occurrence, says causality not established, cites valid IDs, deterministic", async () => {
    const packet = packetFor([
      { path: "README.md", status: "modified" },
      { path: "fixtures/demo/behavior.json", status: "modified" },
    ]);
    const mock = new MockAIProvider();
    const a = await mock.explain(packet);
    const b = await mock.explain(packet);
    assert.deepEqual(a, b);
    assert.equal(a.promptVersion, EXPLAIN_PROMPT_VERSION);
    assertExplanationCitationsInPacket(a, packet);
    validateExplanationSemantics(a, packet);
    assert.match(a.narrative, /CHANGE SURFACE \(Git; co-occurrence only\)/);
    assert.match(a.narrative, /modified README\.md/);
    assert.match(a.narrative, /CAUSALITY: not established/);
    assert.ok(a.caveats.some((c) => c.startsWith("Causality: not established")));
    for (const f of a.facts) {
      assert.ok(!CAUSAL.test(f.claim), `causal wording in fact: ${f.claim}`);
    }
    assert.ok(a.facts.some((f) => /Co-occurrence only/.test(f.claim)));
  });

  it("empty surface: says no source change and does not guess why", async () => {
    const explanation = await new MockAIProvider().explain(packetFor([]));
    assert.ok(explanation.facts.some((f) => /no source change detected/.test(f.claim)));
    assert.ok(explanation.facts.some((f) => /does not infer why/.test(f.claim)));
  });

  it("semantic guard rejects causal facts when a change surface is present", async () => {
    const packet = packetFor([{ path: "README.md", status: "modified" }]);
    const good = await new MockAIProvider().explain(packet);
    const bad = {
      ...good,
      facts: [{ claim: "The stdout change was caused by README.md", evidenceIds: [] }],
    };
    assert.throws(() => validateExplanationSemantics(bad, packet), /must not claim causality/);
  });
});

describe("Featherless boundary with change surface", () => {
  it("sends only the reduced packet (schema-valid, no repo context) with the explain.v2 rules", async () => {
    const packet = packetFor([{ path: "fixtures/demo/behavior.json", status: "modified", additions: 1, deletions: 1 }]);
    let body: { messages: { role: string; content: string }[] } | undefined;
    const fetchImpl: FetchLike = async (_input, init) => {
      body = JSON.parse(String(init?.body));
      const explanation = await new MockAIProvider().explain(packet);
      return new Response(
        JSON.stringify({
          choices: [{ index: 0, message: { role: "assistant", content: JSON.stringify({ ...explanation, provider: "featherless" }) } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };
    const provider = new FeatherlessAIProvider({
      apiKey: "test-key",
      baseUrl: "https://api.featherless.ai/v1",
      model: "test-model",
      timeoutMs: 5_000,
      maxResponseBytes: 64_000,
      fetchImpl,
    });
    const explanation = await provider.explain(packet);
    assert.equal(explanation.provider, "featherless");

    assert.ok(body);
    assert.equal(body.messages.length, 2);
    assert.equal(body.messages[0]?.content, EXPLAIN_SYSTEM_PROMPT);
    assert.match(EXPLAIN_SYSTEM_PROMPT, /co-occurrence only/);
    assert.match(EXPLAIN_SYSTEM_PROMPT, /never proof of causality/);
    const user = body.messages[1]!.content;
    const sent = JSON.parse(user.slice(user.indexOf("\n{\"schemaVersion\"") + 1));
    assert.deepEqual(parseEvidencePacket(sent), packet);
    assert.deepEqual(sent, JSON.parse(JSON.stringify(packet)), "exactly the reduced packet — nothing added");
    assert.ok(!/repoRoot|repositoryPath|locations|diff --git/.test(user));
  });
});
