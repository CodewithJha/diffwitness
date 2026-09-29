import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
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

const lastCheck = (repo: string) => path.join(repo, ".diffwitness", "runs", "last-check.json");

/** Baseline + one successful check whose diff is explainable. */
async function repoWithExplainableCheck(
  prefix: string,
  timeoutMs?: number,
): Promise<WorkflowRepo> {
  const w = await makeWorkflowRepo(prefix, [{ id: "w", ...(timeoutMs !== undefined ? { timeoutMs } : {}) }]);
  await setMode(w, "fast");
  assert.equal((await runInProcess(w.repo, ["baseline"])).code, 0);
  assert.equal((await runInProcess(w.repo, ["check"])).code, 0);
  assert.equal((await runInProcess(w.repo, ["explain"])).code, EXIT_CODES.success);
  return w;
}

async function explainJson(repo: string, extras: { aiProvider?: AiProvider } = {}) {
  const r = await runInProcess(repo, ["--json", "explain"], extras);
  return { ...r, json: r.out.length > 0 ? (JSON.parse(r.out) as { status: string; behavioralDiff: { id: string } }) : null };
}

describe("P1-1 explain never presents a stale BehavioralDiff", () => {
  it("successful check → explain works; last-check equals the run file", async () => {
    const w = await repoWithExplainableCheck("sd-stale-ok-");
    try {
      const { code, json } = await explainJson(w.repo);
      assert.equal(code, EXIT_CODES.success);
      const runFile = path.join(w.repo, ".diffwitness", "runs", `${json!.behavioralDiff.id}.json`);
      assert.equal(await readFile(runFile, "utf8"), await readFile(lastCheck(w.repo), "utf8"));
    } finally {
      await w.cleanup();
    }
  });

  it("check timed out (exit 3) → explain exit 2 check_incomplete (audit repro)", async () => {
    const w = await repoWithExplainableCheck("sd-stale-timeout-", 800);
    try {
      await setMode(w, "sleep");
      const check = await runInProcess(w.repo, ["check"]);
      assert.equal(check.code, EXIT_CODES.analysis_error);
      const r = await explainJson(w.repo);
      assert.equal(r.code, EXIT_CODES.user_error);
      assert.equal(r.out, "");
      assert.match(r.err, /did not complete.*check_incomplete/);
    } finally {
      await w.cleanup();
    }
  });

  it("check failed with an execution error (signal-killed workflow) → no previous result", async () => {
    const w = await repoWithExplainableCheck("sd-stale-exec-");
    try {
      await setMode(w, "selfkill");
      assert.equal((await runInProcess(w.repo, ["check"])).code, EXIT_CODES.analysis_error);
      const r = await explainJson(w.repo);
      assert.equal(r.code, EXIT_CODES.user_error);
      assert.match(r.err, /check_incomplete/);
    } finally {
      await w.cleanup();
    }
  });

  it("check ending in DiffEngine analysis_error → explain shows analysis_error, never the previous clean diff", async () => {
    const w = await repoWithExplainableCheck("sd-stale-ae-");
    try {
      await forceNormalizerMismatch(w.repo);
      assert.equal((await runInProcess(w.repo, ["check"])).code, EXIT_CODES.analysis_error);
      const r = await explainJson(w.repo);
      assert.equal(r.code, EXIT_CODES.success, r.err);
      assert.equal(r.json!.status, "analysis_error");
    } finally {
      await w.cleanup();
    }
  });

  it("check failing on user error (unknown --workflow) also invalidates the previous result", async () => {
    const w = await repoWithExplainableCheck("sd-stale-user-");
    try {
      assert.equal((await runInProcess(w.repo, ["check", "--workflow", "nope"])).code, EXIT_CODES.user_error);
      const r = await explainJson(w.repo);
      assert.equal(r.code, EXIT_CODES.user_error);
      assert.match(r.err, /check_incomplete/);
    } finally {
      await w.cleanup();
    }
  });

  it("ci preflight failure (source-dirty) invalidates the previous result", async () => {
    const w = await repoWithExplainableCheck("sd-stale-ci-");
    try {
      await writeFile(path.join(w.repo, "dirty.txt"), "x\n", "utf8");
      assert.equal((await runInProcess(w.repo, ["ci"])).code, EXIT_CODES.user_error);
      const r = await explainJson(w.repo);
      assert.equal(r.code, EXIT_CODES.user_error);
      assert.match(r.err, /check_incomplete/);
    } finally {
      await w.cleanup();
    }
  });

  it("baseline --force replaces the baseline → old diff is not explained as current (check_stale)", async () => {
    const w = await repoWithExplainableCheck("sd-stale-force-");
    try {
      assert.equal((await runInProcess(w.repo, ["baseline", "--force"])).code, 0);
      const r = await explainJson(w.repo);
      assert.equal(r.code, EXIT_CODES.user_error);
      assert.equal(r.out, "");
      assert.match(r.err, /stale result.*check_stale/);
      // --run <id> of the old diff is equally refused.
      const runs = await import("node:fs/promises").then((fs) =>
        fs.readdir(path.join(w.repo, ".diffwitness", "runs")),
      );
      const oldId = runs.find((n) => n.startsWith("bd_"))!.replace(/\.json$/, "");
      const byId = await runInProcess(w.repo, ["explain", "--run", oldId]);
      assert.equal(byId.code, EXIT_CODES.user_error);
      assert.match(byId.err, /check_stale/);
      // A fresh check restores explain.
      assert.equal((await runInProcess(w.repo, ["check"])).code, 0);
      assert.equal((await runInProcess(w.repo, ["explain"])).code, EXIT_CODES.success);
    } finally {
      await w.cleanup();
    }
  });

  it("new baseline created without --force (after removing the old one) → check_stale", async () => {
    const w = await repoWithExplainableCheck("sd-stale-new-");
    try {
      await rm(path.join(w.repo, ".diffwitness", "baselines"), { recursive: true, force: true });
      assert.equal((await runInProcess(w.repo, ["baseline"])).code, 0);
      const r = await explainJson(w.repo);
      assert.equal(r.code, EXIT_CODES.user_error);
      assert.match(r.err, /check_stale/);
    } finally {
      await w.cleanup();
    }
  });

  it("no active baseline at all → check_stale, never explained", async () => {
    const w = await repoWithExplainableCheck("sd-stale-noactive-");
    try {
      await rm(path.join(w.repo, ".diffwitness", "baselines", "active.json"));
      const r = await explainJson(w.repo);
      assert.equal(r.code, EXIT_CODES.user_error);
      assert.match(r.err, /active baseline is \(none\)/);
    } finally {
      await w.cleanup();
    }
  });

  it("repeated valid unchanged checks → explain keeps working", async () => {
    const w = await repoWithExplainableCheck("sd-stale-repeat-");
    try {
      const first = await explainJson(w.repo);
      assert.equal((await runInProcess(w.repo, ["check"])).code, 0);
      const second = await explainJson(w.repo);
      assert.equal(second.code, EXIT_CODES.success);
      assert.equal(second.json!.status, "clean");
      // The newest check (fresh current Evidence ids) is the one explained.
      assert.notEqual(second.json!.behavioralDiff.id, first.json!.behavioralDiff.id);
    } finally {
      await w.cleanup();
    }
  });

  it("provider failure does not destroy the valid diff", async () => {
    const w = await repoWithExplainableCheck("sd-stale-provider-");
    try {
      const failing: AiProvider = {
        name: "fail",
        async explain(_p: EvidencePacket): Promise<Explanation> {
          throw new Error("simulated provider failure");
        },
      };
      const before = await readFile(lastCheck(w.repo), "utf8");
      const failed = await explainJson(w.repo, { aiProvider: failing });
      assert.equal(failed.code, EXIT_CODES.explain_error);
      assert.equal(await readFile(lastCheck(w.repo), "utf8"), before);
      assert.equal((await explainJson(w.repo)).code, EXIT_CODES.success);
    } finally {
      await w.cleanup();
    }
  });
});
