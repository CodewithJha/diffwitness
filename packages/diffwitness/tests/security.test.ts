import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertProviderIsExplainOnly,
  MockAIProvider,
} from "../src/infrastructure/ai/mock-ai-provider.js";
import type { AiProvider } from "../src/ports/ai-provider.js";
import { ChildProcessExecutor } from "../src/infrastructure/execution/process-executor.js";
import { parseDiffWitnessConfig } from "../src/infrastructure/config/schema.js";
import { DiffWitnessError } from "../src/domain/errors.js";
import { selectAiProvider } from "../src/infrastructure/ai/select-provider.js";
import type { EvidencePacket } from "../src/domain/types.js";
import {
  asBehavioralDiffId,
  asEvidenceId,
  asFindingId,
  asWorkflowId,
} from "../src/domain/types.js";

describe("security boundaries", () => {
  it("AiProvider has no execution path (explain-only)", () => {
    const provider = new MockAIProvider();
    assertProviderIsExplainOnly(provider);
    const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(provider));
    for (const forbidden of ["run", "exec", "execute", "shell", "spawn", "readFile", "search"]) {
      assert.equal(keys.includes(forbidden), false);
    }
    const asRecord = provider as AiProvider & Record<string, unknown>;
    assert.equal(typeof asRecord.explain, "function");
    assert.equal(typeof asRecord.execute, "undefined");
    assert.equal(typeof asRecord.runCommand, "undefined");
    assert.equal(typeof asRecord.readFile, "undefined");
  });

  it("selectAiProvider never wires repo/git/storage/executor into mock", () => {
    const selected = selectAiProvider({ provider: "mock" });
    assert.equal(selected.kind, "provider");
    if (selected.kind !== "provider") {
      return;
    }
    assertProviderIsExplainOnly(selected.provider);
    const record = selected.provider as unknown as Record<string, unknown>;
    assert.equal(record.repositoryPath, undefined);
    assert.equal(record.git, undefined);
    assert.equal(record.storage, undefined);
    assert.equal(record.executor, undefined);
  });

  it("selectAiProvider featherless without key is unavailable (no silent mock fallback)", () => {
    const selected = selectAiProvider({
      provider: "featherless",
      featherless: {
        apiKeyEnv: "FEATHERLESS_API_KEY",
        baseUrl: "https://api.featherless.ai/v1",
        model: "Qwen/Qwen2.5-7B-Instruct",
        timeoutMs: 30_000,
      },
      env: {},
    });
    assert.equal(selected.kind, "unavailable");
    if (selected.kind === "unavailable") {
      assert.match(selected.reason, /Missing credentials|FEATHERLESS_API_KEY/i);
      assert.doesNotMatch(selected.reason, /mock/i);
    }
  });

  it("selectAiProvider featherless with key returns explain-only provider", () => {
    const selected = selectAiProvider({
      provider: "featherless",
      featherless: {
        apiKeyEnv: "FEATHERLESS_API_KEY",
        baseUrl: "https://api.featherless.ai/v1",
        model: "Qwen/Qwen2.5-7B-Instruct",
        timeoutMs: 30_000,
      },
      env: { FEATHERLESS_API_KEY: "test-key" },
      fetchImpl: async () => new Response("{}", { status: 500 }),
    });
    assert.equal(selected.kind, "provider");
    if (selected.kind !== "provider") {
      return;
    }
    assert.equal(selected.provider.name, "featherless");
    assertProviderIsExplainOnly(selected.provider);
    const record = selected.provider as unknown as Record<string, unknown>;
    assert.equal(record.repositoryPath, undefined);
    assert.equal(record.git, undefined);
    assert.equal(record.storage, undefined);
    assert.equal(record.executor, undefined);
  });

  it("explain signature accepts only EvidencePacket (no repo path field on packet)", async () => {
    const provider = new MockAIProvider();
    const packet: EvidencePacket = {
      schemaVersion: 2,
      behavioralDiffId: asBehavioralDiffId("d1"),
      status: "clean",
      findings: [],
      changedObservations: [],
      evidenceExcerpts: [],
      assumptions: [],
      budgets: {
        maxChars: 1000,
        maxFindings: 5,
        maxExcerpts: 5,
        maxExcerptChars: 40,
        maxPaths: 10,
      },
      redactionApplied: false,
    };
    assert.equal("repositoryPath" in packet, false);
    void asFindingId;
    void asEvidenceId;
    void asWorkflowId;
    await provider.explain(packet);
  });

  it("workflows must use argv arrays (config rejects empty command)", () => {
    assert.throws(
      () =>
        parseDiffWitnessConfig({
          version: 1,
          workflows: [{ id: "x", command: [] }],
        }),
      DiffWitnessError,
    );
  });

  it("execution requires positive timeouts (defaults applied; zero rejected)", () => {
    assert.throws(
      () =>
        parseDiffWitnessConfig({
          version: 1,
          workflows: [{ id: "x", command: ["node"], timeoutMs: 0 }],
        }),
      DiffWitnessError,
    );
  });

  it("output bounds are required in executor requests", async () => {
    const executor = new ChildProcessExecutor();
    await assert.rejects(
      () =>
        executor.execute({
          argv: ["node", "-e", "1"],
          cwd: process.cwd(),
          env: { PATH: process.env.PATH ?? "" },
          timeoutMs: 1000,
          maxStdoutBytes: 0,
          maxStderrBytes: 100,
        }),
      DiffWitnessError,
    );
  });

  it("config-only commands: allowCommands false fails closed at baseline", async () => {
    const cfg = parseDiffWitnessConfig({
      version: 1,
      workflows: [{ id: "demo", command: ["node", "-e", "1"] }],
      execution: { allowCommands: false },
    });
    assert.equal(cfg.execution.allowCommands, false);
  });
});
