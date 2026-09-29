import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { ciExitCode } from "../src/application/run-ci.js";
import { EXIT_CODES } from "../src/domain/errors.js";
import type { EvidencePacket, Explanation } from "../src/domain/types.js";
import type { AiProvider } from "../src/ports/ai-provider.js";
import {
  forceNormalizerMismatch,
  makeWorkflowRepo,
  runInProcess,
  setMode,
  type WorkflowRepo,
} from "./support/workflow-repo.js";

const failingProvider: AiProvider = {
  name: "fail",
  async explain(_p: EvidencePacket): Promise<Explanation> {
    throw new Error("simulated provider failure");
  },
};

interface CiJson {
  status: string;
  findings: Array<{ severity: string }>;
  ai: { enabled: boolean; status: string };
  metadata: { failOn: string };
}

async function ci(repo: string, argv: string[], aiProvider?: AiProvider) {
  const r = await runInProcess(repo, ["ci", ...argv], aiProvider !== undefined ? { aiProvider } : {});
  return { ...r, json: JSON.parse(r.out) as CiJson };
}

describe("P1-3 ciExitCode precedence table (3 > 1 > 4 > 0)", () => {
  const rows: Array<[number, boolean, number]> = [
    [EXIT_CODES.analysis_error, false, EXIT_CODES.analysis_error],
    [EXIT_CODES.analysis_error, true, EXIT_CODES.analysis_error],
    [EXIT_CODES.findings, false, EXIT_CODES.findings],
    [EXIT_CODES.findings, true, EXIT_CODES.findings],
    [EXIT_CODES.success, true, EXIT_CODES.explain_error],
    [EXIT_CODES.success, false, EXIT_CODES.success],
  ];
  for (const [check, explainFailed, expected] of rows) {
    it(`check=${check} explainFailed=${explainFailed} → ${expected}`, () => {
      assert.equal(ciExitCode(check, explainFailed), expected);
    });
  }
});

describe("P1-3 ci --explain exit precedence (integration, no network)", () => {
  let savedKey: string | undefined;
  before(() => {
    savedKey = process.env.FEATHERLESS_API_KEY;
    delete process.env.FEATHERLESS_API_KEY;
  });
  after(() => {
    if (savedKey !== undefined) process.env.FEATHERLESS_API_KEY = savedKey;
  });

  async function repo(prefix: string): Promise<WorkflowRepo> {
    const w = await makeWorkflowRepo(prefix, [{ id: "w" }]);
    await setMode(w, "fast");
    assert.equal((await runInProcess(w.repo, ["baseline"])).code, 0);
    return w;
  }

  it("analysis_error + --explain featherless without key → 3 (audit repro); status preserved", async () => {
    const w = await repo("sd-prec-ae-fl-");
    try {
      await forceNormalizerMismatch(w.repo);
      const r = await ci(w.repo, ["--explain", "--provider", "featherless"]);
      assert.equal(r.code, EXIT_CODES.analysis_error);
      assert.equal(r.json.status, "analysis_error");
      assert.equal(r.json.ai.status, "error");
    } finally {
      await w.cleanup();
    }
  });

  it("analysis_error + --explain success (mock) → 3; injected failing provider → 3", async () => {
    const w = await repo("sd-prec-ae-ok-");
    try {
      await forceNormalizerMismatch(w.repo);
      const ok = await ci(w.repo, ["--explain"]);
      assert.equal(ok.code, EXIT_CODES.analysis_error);
      assert.equal(ok.json.ai.status, "ok");
      const failed = await ci(w.repo, ["--explain"], failingProvider);
      assert.equal(failed.code, EXIT_CODES.analysis_error);
      assert.equal(failed.json.ai.status, "error");
    } finally {
      await w.cleanup();
    }
  });

  it("findings ≥ --fail-on warn + explain failure → 1 (audit repro); findings preserved", async () => {
    const w = await repo("sd-prec-warn-");
    try {
      await setMode(w, "alt");
      const r = await ci(w.repo, ["--fail-on", "warn", "--explain", "--provider", "featherless"]);
      assert.equal(r.code, EXIT_CODES.findings);
      assert.equal(r.json.status, "findings");
      assert.ok(r.json.findings.length > 0);
      assert.equal(r.json.ai.status, "error");
      const ok = await ci(w.repo, ["--fail-on", "warn", "--explain"]);
      assert.equal(ok.code, EXIT_CODES.findings);
      assert.equal(ok.json.ai.status, "ok");
    } finally {
      await w.cleanup();
    }
  });

  it("error-severity finding + --fail-on error + explain failure → 1", async () => {
    const w = await repo("sd-prec-error-");
    try {
      await setMode(w, "exit1");
      const r = await ci(w.repo, ["--fail-on", "error", "--explain"], failingProvider);
      assert.equal(r.code, EXIT_CODES.findings);
      assert.ok(r.json.findings.some((f) => f.severity === "error"));
    } finally {
      await w.cleanup();
    }
  });

  it("findings below threshold (warn under --fail-on error / never) + explain failure → 4", async () => {
    const w = await repo("sd-prec-below-");
    try {
      await setMode(w, "alt");
      for (const failOn of ["error", "never"]) {
        const r = await ci(w.repo, ["--fail-on", failOn, "--explain", "--provider", "featherless"]);
        assert.equal(r.code, EXIT_CODES.explain_error, `fail-on ${failOn}`);
        assert.equal(r.json.status, "findings");
      }
      const ok = await ci(w.repo, ["--fail-on", "error", "--explain"]);
      assert.equal(ok.code, EXIT_CODES.success);
    } finally {
      await w.cleanup();
    }
  });

  it("clean + provider failure → 4; clean + explain success → 0; clean without --explain → 0", async () => {
    const w = await repo("sd-prec-clean-");
    try {
      const failed = await ci(w.repo, ["--explain"], failingProvider);
      assert.equal(failed.code, EXIT_CODES.explain_error);
      assert.equal(failed.json.status, "clean");
      assert.equal((await ci(w.repo, ["--explain"])).code, EXIT_CODES.success);
      const off = await ci(w.repo, []);
      assert.equal(off.code, EXIT_CODES.success);
      assert.equal(off.json.ai.enabled, false);
    } finally {
      await w.cleanup();
    }
  });
});
