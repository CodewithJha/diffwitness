import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isDiffWitnessError } from "../src/domain/errors.js";
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
import { FeatherlessAIProvider } from "../src/infrastructure/ai/featherless-ai-provider.js";
import { EXPLAIN_PROMPT_VERSION } from "../src/infrastructure/ai/prompts/explain.v2.js";
import type { FetchLike } from "../src/infrastructure/ai/featherless/http-client.js";
import { redactSecrets } from "../src/infrastructure/ai/featherless/http-client.js";

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
    redactionApplied: true,
  };
}

function validExplanationJson(packet: EvidencePacket): Explanation {
  return {
    schemaVersion: 1,
    promptVersion: EXPLAIN_PROMPT_VERSION,
    narrative: "FACT:\n- stdout changed\nEVIDENCE:\n- ev-1\nINTERPRETATION:\n- possible edit",
    facts: [
      {
        claim: "stdout digest changed",
        findingId: asFindingId("f-1"),
        evidenceIds: [asEvidenceId("ev-1")],
      },
    ],
    hypotheses: [
      {
        claim: "May relate to recent edits",
        confidence: "medium",
        findingId: asFindingId("f-1"),
        evidenceIds: [asEvidenceId("ev-1")],
      },
    ],
    citations: [
      {
        findingId: asFindingId("f-1"),
        evidenceId: asEvidenceId("ev-1"),
        claim: "stdout digest changed",
      },
    ],
    caveats: ["Bound to packet"],
    modelId: "Qwen/Qwen2.5-7B-Instruct",
    provider: "featherless",
  };
}

function mockFetch(handler: (url: string, init?: RequestInit) => Promise<Response>): FetchLike {
  return async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return handler(url, init);
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("FeatherlessAIProvider HTTP", () => {
  it("success path returns schema-valid Explanation citing packet IDs", async () => {
    const packet = samplePacket("findings", true);
    let sawAuth = false;
    let requestBody: unknown;
    const provider = new FeatherlessAIProvider({
      apiKey: "test-secret-key-do-not-log",
      baseUrl: "https://api.featherless.ai/v1",
      model: "Qwen/Qwen2.5-7B-Instruct",
      timeoutMs: 5_000,
      maxResponseBytes: 64_000,
      fetchImpl: mockFetch(async (url, init) => {
        assert.match(url, /\/chat\/completions$/);
        const headers = init?.headers as Record<string, string>;
        assert.equal(headers.Authorization, "Bearer test-secret-key-do-not-log");
        sawAuth = true;
        requestBody = JSON.parse(String(init?.body));
        return jsonResponse(200, {
          id: "cmpl-1",
          object: "chat.completion",
          model: "Qwen/Qwen2.5-7B-Instruct",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: JSON.stringify(validExplanationJson(packet)),
              },
              finish_reason: "stop",
            },
          ],
        });
      }),
    });

    const explanation = await provider.explain(packet);
    assert.equal(sawAuth, true);
    assert.equal(explanation.provider, "featherless");
    assert.equal(explanation.promptVersion, EXPLAIN_PROMPT_VERSION);
    assertExplanationCitationsInPacket(explanation, packet);
    const body = requestBody as {
      model: string;
      messages: { role: string; content: string }[];
      response_format?: { type: string };
    };
    assert.equal(body.model, "Qwen/Qwen2.5-7B-Instruct");
    assert.equal(body.response_format?.type, "json_object");
    assert.ok(body.messages.some((m) => m.role === "system"));
    assert.ok(body.messages.some((m) => m.content.includes("diff-1")));
    // Redacted packet still reaches transport (findings present).
    assert.ok(body.messages.some((m) => m.content.includes('"redactionApplied":true')));
  });

  it("maps HTTP failure modes to taxonomy codes", async () => {
    const cases: { status: number; code: string }[] = [
      { status: 401, code: "authentication_error" },
      { status: 403, code: "authorization_error" },
      { status: 408, code: "timeout" },
      { status: 429, code: "rate_limited" },
      { status: 400, code: "provider_unavailable" },
      { status: 500, code: "provider_unavailable" },
      { status: 503, code: "provider_unavailable" },
    ];

    for (const { status, code } of cases) {
      const provider = new FeatherlessAIProvider({
        apiKey: "k",
        baseUrl: "https://api.featherless.ai/v1",
        model: "m",
        timeoutMs: 5_000,
        maxResponseBytes: 64_000,
        fetchImpl: mockFetch(async () =>
          jsonResponse(status, { error: { message: `status ${status}` } }),
        ),
      });
      await assert.rejects(
        () => provider.explain(samplePacket("clean", false)),
        (err: unknown) => {
          assert.ok(isDiffWitnessError(err));
          assert.equal(err.details?.code, code);
          assert.equal(err.exitClass, "explain_error");
          assert.doesNotMatch(err.message, /Bearer /);
          return true;
        },
      );
    }
  });

  it("maps network and timeout failures", async () => {
    const network = new FeatherlessAIProvider({
      apiKey: "k",
      baseUrl: "https://api.featherless.ai/v1",
      model: "m",
      timeoutMs: 5_000,
      maxResponseBytes: 64_000,
      fetchImpl: mockFetch(async () => {
        throw new TypeError("fetch failed");
      }),
    });
    await assert.rejects(
      () => network.explain(samplePacket("clean", false)),
      (err: unknown) => isDiffWitnessError(err) && err.details?.code === "network_error",
    );

    const timed = new FeatherlessAIProvider({
      apiKey: "k",
      baseUrl: "https://api.featherless.ai/v1",
      model: "m",
      timeoutMs: 5_000,
      maxResponseBytes: 64_000,
      fetchImpl: mockFetch(async () => {
        const err = new Error("aborted");
        err.name = "AbortError";
        throw err;
      }),
    });
    await assert.rejects(
      () => timed.explain(samplePacket("clean", false)),
      (err: unknown) => isDiffWitnessError(err) && err.details?.code === "timeout",
    );
  });

  it("rejects invalid / oversized / bad citation responses", async () => {
    const packet = samplePacket("findings", true);

    const invalid = new FeatherlessAIProvider({
      apiKey: "k",
      baseUrl: "https://api.featherless.ai/v1",
      model: "m",
      timeoutMs: 5_000,
      maxResponseBytes: 64_000,
      fetchImpl: mockFetch(async () =>
        jsonResponse(200, {
          choices: [{ message: { content: "not-json" } }],
        }),
      ),
    });
    await assert.rejects(
      () => invalid.explain(packet),
      (err: unknown) => isDiffWitnessError(err) && err.details?.code === "invalid_response",
    );

    const badSchema = new FeatherlessAIProvider({
      apiKey: "k",
      baseUrl: "https://api.featherless.ai/v1",
      model: "m",
      timeoutMs: 5_000,
      maxResponseBytes: 64_000,
      fetchImpl: mockFetch(async () =>
        jsonResponse(200, {
          choices: [
            {
              message: {
                content: JSON.stringify({ schemaVersion: 1, narrative: "x" }),
              },
            },
          ],
        }),
      ),
    });
    await assert.rejects(
      () => badSchema.explain(packet),
      (err: unknown) =>
        isDiffWitnessError(err) && err.details?.code === "schema_validation_error",
    );

    const badCite = new FeatherlessAIProvider({
      apiKey: "k",
      baseUrl: "https://api.featherless.ai/v1",
      model: "m",
      timeoutMs: 5_000,
      maxResponseBytes: 64_000,
      fetchImpl: mockFetch(async () => {
        const expl = validExplanationJson(packet);
        const poisoned = {
          ...expl,
          citations: [{ findingId: "missing-f", claim: "nope" }],
        };
        return jsonResponse(200, {
          choices: [{ message: { content: JSON.stringify(poisoned) } }],
        });
      }),
    });
    await assert.rejects(
      () => badCite.explain(packet),
      (err: unknown) =>
        isDiffWitnessError(err) && err.details?.code === "citation_validation_error",
    );

    const oversized = new FeatherlessAIProvider({
      apiKey: "k",
      baseUrl: "https://api.featherless.ai/v1",
      model: "m",
      timeoutMs: 5_000,
      maxResponseBytes: 32,
      fetchImpl: mockFetch(async () =>
        new Response(`{"choices":[{"message":{"content":"${"x".repeat(200)}"}}]}`, {
          status: 200,
        }),
      ),
    });
    await assert.rejects(
      () => oversized.explain(packet),
      (err: unknown) => isDiffWitnessError(err) && err.details?.code === "invalid_response",
    );
  });

  it("fromConfig missing credentials / model", () => {
    assert.throws(
      () =>
        FeatherlessAIProvider.fromConfig(
          {
            apiKeyEnv: "FEATHERLESS_API_KEY",
            baseUrl: "https://api.featherless.ai/v1",
            model: "m",
            timeoutMs: 30_000,
          },
          {},
        ),
      (err: unknown) =>
        isDiffWitnessError(err) && err.details?.code === "missing_credentials",
    );

    assert.throws(
      () =>
        FeatherlessAIProvider.fromConfig(
          {
            apiKeyEnv: "FEATHERLESS_API_KEY",
            baseUrl: "https://api.featherless.ai/v1",
            model: "",
            timeoutMs: 30_000,
          },
          { FEATHERLESS_API_KEY: "k" },
        ),
      (err: unknown) =>
        isDiffWitnessError(err) && err.details?.code === "configuration_error",
    );
  });

  it("never puts API key in error messages; redactSecrets strips Bearer", () => {
    const redacted = redactSecrets("Authorization Bearer test-secret-key-do-not-log failed");
    assert.doesNotMatch(redacted, /test-secret-key/);
    assert.match(redacted, /REDACTED/);
  });

  it("provider has no repo/process/storage surface", () => {
    const provider = new FeatherlessAIProvider({
      apiKey: "k",
      baseUrl: "https://api.featherless.ai/v1",
      model: "m",
      timeoutMs: 5_000,
      maxResponseBytes: 64_000,
      fetchImpl: mockFetch(async () =>
        jsonResponse(200, {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  schemaVersion: 1,
                  promptVersion: EXPLAIN_PROMPT_VERSION,
                  narrative: "FACT:\nnothing\nEVIDENCE:\nn/a\nINTERPRETATION:\nclean",
                  facts: [{ claim: "No findings", evidenceIds: [] }],
                  hypotheses: [],
                  citations: [],
                  caveats: [],
                  provider: "featherless",
                }),
              },
            },
          ],
        }),
      ),
    });
    const record = provider as unknown as Record<string, unknown>;
    for (const key of ["git", "storage", "executor", "repositoryPath", "run", "exec"]) {
      assert.equal(record[key], undefined);
    }
    void parseExplanation;
  });
});
