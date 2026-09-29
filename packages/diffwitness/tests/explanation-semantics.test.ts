import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildChangeSurface } from "../src/domain/change-surface.js";
import { EXIT_CODES, isDiffWitnessError } from "../src/domain/errors.js";
import { parseEvidencePacket } from "../src/domain/schemas.js";
import {
  asBehavioralDiffId,
  asEvidenceId,
  asFindingId,
  asWorkflowId,
  type EvidencePacket,
  type Explanation,
} from "../src/domain/types.js";
import { validateExplanationSemantics } from "../src/domain/validate-explanation-semantics.js";
import { FeatherlessAIProvider } from "../src/infrastructure/ai/featherless-ai-provider.js";
import type { FetchLike } from "../src/infrastructure/ai/featherless/http-client.js";
import { MockAIProvider } from "../src/infrastructure/ai/mock-ai-provider.js";
import { EXPLAIN_PROMPT_VERSION } from "../src/infrastructure/ai/prompts/explain.v2.js";
import type { AiProvider } from "../src/ports/ai-provider.js";
import { makeWorkflowRepo, runInProcess, setMode } from "./support/workflow-repo.js";

type Status = EvidencePacket["status"];

function packet(status: Status, opts: { surface?: boolean; preview?: string } = {}): EvidencePacket {
  const withFindings = status === "findings";
  const surface = opts.surface === true
    ? (() => {
        const s = buildChangeSurface({
          baseRevision: "a".repeat(40),
          currentRevision: "b".repeat(40),
          workingTreeIncluded: false,
          files: [{ path: "README.md", status: "modified" }],
          locations: [],
          locationsComplete: true,
          gitOutputCapped: false,
          excludedOperationalPaths: 0,
        });
        return {
          id: s.id,
          associationStatus: s.associationStatus,
          causality: s.causality,
          baseRevision: s.baseRevision,
          currentRevision: s.currentRevision,
          workingTreeIncluded: s.workingTreeIncluded,
          limitation: s.limitation,
          files: s.files,
          filesTotal: s.files.length,
          truncated: false,
        };
      })()
    : undefined;
  return parseEvidencePacket({
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
            summary: "Normalized stdout changed",
            evidenceIds: [asEvidenceId("ev-1")],
          },
        ]
      : [],
    changedObservations: [],
    evidenceExcerpts: withFindings
      ? [
          {
            evidenceId: asEvidenceId("ev-1"),
            observationKey: "stdout",
            preview: opts.preview ?? "hello",
            digest: "sha256:bbb",
          },
        ]
      : [],
    assumptions: [],
    ...(surface !== undefined ? { changeSurface: surface } : {}),
    budgets: { maxChars: 8000, maxFindings: 20, maxExcerpts: 10, maxExcerptChars: 200, maxPaths: 40 },
    redactionApplied: true,
  });
}

function base(p: EvidencePacket): Explanation {
  const hasFinding = p.findings.length > 0;
  return {
    schemaVersion: 1,
    promptVersion: EXPLAIN_PROMPT_VERSION,
    narrative: "FACT:\n- stdout digest changed\nINTERPRETATION:\n- co-occurred with edits",
    facts: [
      {
        claim: hasFinding ? "stdout digest changed" : `status is ${p.status}`,
        ...(hasFinding ? { findingId: asFindingId("f-1") } : {}),
        evidenceIds: hasFinding ? [asEvidenceId("ev-1")] : [],
      },
    ],
    hypotheses: hasFinding
      ? [
          {
            claim: "May relate to recent edits",
            confidence: "medium",
            findingId: asFindingId("f-1"),
            evidenceIds: [asEvidenceId("ev-1")],
          },
        ]
      : [],
    citations: hasFinding
      ? [{ findingId: asFindingId("f-1"), evidenceId: asEvidenceId("ev-1"), claim: "stdout digest changed" }]
      : [],
    caveats: ["Bound to packet"],
    provider: "test",
  };
}

type Field = "narrative" | "fact" | "hypothesis" | "citation" | "caveat";

function withText(e: Explanation, field: Field, text: string): Explanation {
  switch (field) {
    case "narrative":
      return { ...e, narrative: `${e.narrative}\n${text}` };
    case "fact":
      return { ...e, facts: [...e.facts, { claim: text, evidenceIds: [] }] };
    case "hypothesis":
      return { ...e, hypotheses: [...e.hypotheses, { claim: text, confidence: "high", evidenceIds: [] }] };
    case "citation":
      return {
        ...e,
        citations: [...e.citations, { findingId: asFindingId("f-1"), claim: text }],
      };
    case "caveat":
      return { ...e, caveats: [...e.caveats, text] };
  }
}

const FIELDS: Field[] = ["narrative", "fact", "hypothesis", "citation", "caveat"];

const CAUSAL_CLAIMS = [
  "README.md caused the stdout change.",
  "The stdout change was caused by README.md",
  "README.md is the cause of the stdout change",
  "Root cause: README.md",
  "The regression is due to the README edit",
  "stdout changed because README.md was edited",
  "The stdout change resulted from the README edit",
  "The README edit resulted in the stdout change",
  "The README edit triggered the stdout change",
  "The README edit led to the stdout change",
  "README.md is responsible for the change",
  "The change was introduced by README.md",
  "The stdout change occurred as a result of the README edit",
  "The change is attributable to README.md",
  "The difference stems from README.md",
  "The difference originates from the README edit",
  "This explains why stdout changed",
  "It is not surprising that README.md caused the change",
  "We did not verify this but README.md caused the change",
];

function assertRejected(e: Explanation, p: EvidencePacket, pattern: RegExp, label: string): void {
  assert.throws(
    () => validateExplanationSemantics(e, p),
    (err: unknown) =>
      isDiffWitnessError(err) && err.exitClass === "explain_error" && pattern.test(err.message),
    label,
  );
}

describe("P1-4 causal language is rejected in every model-generated field", () => {
  for (const withSurface of [true, false]) {
    for (const field of FIELDS) {
      it(`${field} (${withSurface ? "with" : "without"} change surface): all causal variants rejected`, () => {
        const p = packet("findings", { surface: withSurface });
        for (const claim of CAUSAL_CLAIMS) {
          assertRejected(withText(base(p), field, claim), p, /must not claim causality/, `${field}: ${claim}`);
        }
      });
    }
  }

  it("clean and analysis_error packets reject causal claims too", () => {
    for (const status of ["clean", "analysis_error"] as const) {
      const p = packet(status);
      assertRejected(withText(base(p), "narrative", "README.md caused this"), p, /causality/, status);
    }
  });

  it("hypotheses may hedge; flat causal assertions in hypotheses are rejected", () => {
    const p = packet("findings", { surface: true });
    for (const hedged of [
      "The stdout change may have been caused by the README edit",
      "Possibly due to the README edit (unverified)",
      "The README edit might have triggered the change",
      "It is unclear whether README.md caused the change",
    ]) {
      assert.doesNotThrow(() => validateExplanationSemantics(withText(base(p), "hypothesis", hedged), p), hedged);
    }
    assertRejected(withText(base(p), "hypothesis", "README.md caused the change"), p, /causality/, "flat");
  });

  it("hedging outside hypotheses is still rejected", () => {
    const p = packet("findings", { surface: true });
    assertRejected(
      withText(base(p), "narrative", "The README edit may have caused the change"),
      p,
      /causality/,
      "narrative hedge",
    );
  });

  it("legitimate non-causal language is accepted in every field", () => {
    const p = packet("findings", { surface: true });
    const ok = [
      "Causality: not established",
      "causality: not_established",
      "DiffWitness cannot determine the cause of this change.",
      "It is not established that the README edit caused the stdout change.",
      "There is no evidence that README.md caused the finding.",
      "DiffWitness does not claim any of them caused a finding.",
      "The stdout change co-occurred with edits to README.md.",
      "The stdout change was not caused by any recorded source change.",
      "Git change surface: 1 file(s) differ. Co-occurrence only.",
    ];
    for (const field of FIELDS) {
      for (const text of ok) {
        assert.doesNotThrow(() => validateExplanationSemantics(withText(base(p), field, text), p), `${field}: ${text}`);
      }
    }
  });

  it("verbatim evidence previews that contain causal words are not mistaken for claims", async () => {
    const p = packet("findings", { preview: "Error: build failed because config.json is missing" });
    const mock = await new MockAIProvider().explain(p);
    assert.match(mock.narrative, /because config\.json/);
    assert.doesNotThrow(() => validateExplanationSemantics(mock, p));
    // A model claim is still rejected even when the quote is present.
    assertRejected(withText(mock, "narrative", "README.md caused the change"), p, /causality/, "quote+claim");
  });
});

describe("P1-4 analysis_error packets never get a clean bill of health", () => {
  const CLEAN_CLAIMS = [
    "There are no regressions and the change is safe to merge.",
    "The change is safe to merge",
    "No issues found",
    "No known problems",
    "All checks passed",
    "The analysis was successful",
    "Behavior is clean",
    "Verified",
    "The build looks good",
    "Nothing changed",
    "No behavioral changes",
  ];

  it("every clean/pass/safe claim is rejected in every field", () => {
    const p = packet("analysis_error");
    for (const field of FIELDS) {
      for (const claim of CLEAN_CLAIMS) {
        assertRejected(withText(base(p), field, claim), p, /clean bill of health/, `${field}: ${claim}`);
      }
    }
  });

  it("honest analysis_error language is accepted", () => {
    const p = packet("analysis_error");
    for (const text of [
      "Analysis did not complete successfully (status=analysis_error).",
      "DiffWitness refuses to claim a clean behavioral bill of health.",
      "Treat as incomplete analysis, not absence of regressions.",
      "This is not a clean result.",
      "It cannot be verified that behavior is unchanged.",
    ]) {
      assert.doesNotThrow(() => validateExplanationSemantics(withText(base(p), "narrative", text), p), text);
    }
  });

  it("the same claims are fine when the packet is clean", () => {
    const p = packet("clean");
    assert.doesNotThrow(() => validateExplanationSemantics(withText(base(p), "narrative", "No issues found"), p));
  });
});

describe("P1-4 MockAI output always passes the shared gate", () => {
  for (const [label, p] of [
    ["findings + surface", packet("findings", { surface: true })],
    ["findings, no surface", packet("findings")],
    ["clean", packet("clean")],
    ["analysis_error", packet("analysis_error")],
  ] as const) {
    it(label, async () => {
      const e = await new MockAIProvider().explain(p);
      assert.doesNotThrow(() => validateExplanationSemantics(e, p));
    });
  }
});

function causalFetch(payload: Record<string, unknown>): FetchLike {
  return async () =>
    new Response(
      JSON.stringify({ choices: [{ message: { content: JSON.stringify(payload) } }] }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
}

function featherless(payload: Record<string, unknown>): FeatherlessAIProvider {
  return new FeatherlessAIProvider({
    apiKey: "test-key",
    baseUrl: "https://api.featherless.ai/v1",
    model: "m",
    timeoutMs: 5_000,
    maxResponseBytes: 64_000,
    fetchImpl: causalFetch(payload),
  });
}

const CAUSAL_PAYLOAD = {
  schemaVersion: 1,
  promptVersion: EXPLAIN_PROMPT_VERSION,
  narrative: "README.md caused the stdout change.",
  facts: [{ claim: "stdout digest changed", evidenceIds: [] }],
  hypotheses: [],
  citations: [],
  caveats: [],
};

describe("P1-4 simulated Featherless output (injected fetch, no network)", () => {
  it("provider rejects causal narrative as explain_error", async () => {
    const p = packet("findings");
    await assert.rejects(
      () => featherless(CAUSAL_PAYLOAD).explain(p),
      (err: unknown) => isDiffWitnessError(err) && err.exitClass === "explain_error",
    );
  });

  it("provider rejects a causal caveat, citation claim, or model-echoed promptVersion/modelId", async () => {
    const p = packet("findings");
    for (const payload of [
      { ...CAUSAL_PAYLOAD, narrative: "ok", promptVersion: "README.md caused this" },
      { ...CAUSAL_PAYLOAD, narrative: "ok", modelId: "root cause: README.md" },
      { ...CAUSAL_PAYLOAD, narrative: "ok", caveats: ["Root cause: README.md"] },
      {
        ...CAUSAL_PAYLOAD,
        narrative: "ok",
        citations: [{ findingId: "f-1", evidenceId: "ev-1", claim: "stdout changed because of README.md" }],
      },
    ]) {
      await assert.rejects(() => featherless(payload).explain(p), isDiffWitnessError);
    }
  });

  it("application boundary: explain exit 4, no causal text in JSON or terminal, findings preserved", async () => {
    const w = await makeWorkflowRepo("sd-sem-app-", [{ id: "w" }]);
    try {
      await setMode(w, "fast");
      assert.equal((await runInProcess(w.repo, ["baseline"])).code, 0);
      await setMode(w, "alt");
      assert.equal((await runInProcess(w.repo, ["check"])).code, 0);
      const provider: AiProvider = featherless(CAUSAL_PAYLOAD);
      const json = await runInProcess(w.repo, ["--json", "explain"], { aiProvider: provider });
      assert.equal(json.code, EXIT_CODES.explain_error);
      const parsed = JSON.parse(json.out) as { status: string; explanation: unknown; behavioralDiff: { findings: unknown[] } };
      assert.equal(parsed.explanation, null);
      assert.equal(parsed.status, "findings");
      assert.ok(parsed.behavioralDiff.findings.length > 0);
      assert.doesNotMatch(json.out, /README\.md caused/);
      const human = await runInProcess(w.repo, ["explain"], { aiProvider: provider });
      assert.equal(human.code, EXIT_CODES.explain_error);
      assert.doesNotMatch(human.out + human.err, /README\.md caused/);

      // Same gate for a non-Featherless injected provider (no provider-level validation at all).
      const raw: AiProvider = {
        name: "raw",
        async explain() {
          return { ...CAUSAL_PAYLOAD, provider: "raw" } as unknown as Explanation;
        },
      };
      const rawRun = await runInProcess(w.repo, ["--json", "explain"], { aiProvider: raw });
      assert.equal(rawRun.code, EXIT_CODES.explain_error);
      assert.doesNotMatch(rawRun.out, /README\.md caused/);

      // ci --explain: explanation dropped, findings kept; below-threshold findings → 4.
      const ci = await runInProcess(w.repo, ["ci", "--explain", "--fail-on", "never"], { aiProvider: raw });
      assert.equal(ci.code, EXIT_CODES.explain_error);
      const report = JSON.parse(ci.out) as { explanation: unknown; ai: { status: string }; findings: unknown[] };
      assert.equal(report.explanation, null);
      assert.equal(report.ai.status, "error");
      assert.ok(report.findings.length > 0);
      assert.doesNotMatch(ci.out, /README\.md caused/);
    } finally {
      await w.cleanup();
    }
  });
});
