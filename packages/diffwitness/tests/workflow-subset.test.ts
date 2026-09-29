import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { baselineEvidenceForSelection } from "../src/application/run-check.js";
import { EXIT_CODES, DiffWitnessError } from "../src/domain/errors.js";
import type { Evidence } from "../src/domain/types.js";
import { git } from "./support/fixture-repo.js";
import { makeWorkflowRepo, runInProcess, setMode, type WorkflowRepo } from "./support/workflow-repo.js";

interface CheckJson {
  status: string;
  behavioralDiff: {
    baselineEvidenceIds: string[];
    currentEvidenceIds: string[];
    findings: Array<{
      workflowId: string;
      summary: string;
      evidenceIds: string[];
      associationStatus?: string;
      changeSurfaceRefs?: string[];
    }>;
  };
}

async function twoWorkflowRepo(prefix: string): Promise<WorkflowRepo> {
  const w = await makeWorkflowRepo(prefix, [{ id: "a" }, { id: "b" }]);
  await setMode(w, "fast");
  const bl = await runInProcess(w.repo, ["baseline"]);
  assert.equal(bl.code, 0, bl.err);
  return w;
}

async function baselineEvidenceByWorkflow(repo: string): Promise<Map<string, string>> {
  const out = await runInProcess(repo, ["--json", "check"]);
  const json = JSON.parse(out.out) as CheckJson;
  // Full clean check: baseline evidence ids are all baseline evidence.
  const map = new Map<string, string>();
  const { readFile } = await import("node:fs/promises");
  for (const id of json.behavioralDiff.baselineEvidenceIds) {
    const env = JSON.parse(
      await readFile(path.join(repo, ".diffwitness", "evidence", `${id}.json`), "utf8"),
    ) as { evidence: { workflowId: string } };
    map.set(env.evidence.workflowId, id);
  }
  return map;
}

describe("P0-2 --workflow subset compares only selected workflows", () => {
  it("baseline {a,b}; check --workflow a (unchanged) → clean; no b disappearance findings", async () => {
    const w = await twoWorkflowRepo("sd-sub-clean-");
    try {
      const r = await runInProcess(w.repo, ["--json", "check", "--workflow", "a", "--fail-on", "warn"]);
      assert.equal(r.code, EXIT_CODES.success, r.err);
      const json = JSON.parse(r.out) as CheckJson;
      assert.equal(json.status, "clean");
      assert.equal(json.behavioralDiff.findings.length, 0);
      assert.equal(json.behavioralDiff.baselineEvidenceIds.length, 1);
      assert.equal(json.behavioralDiff.currentEvidenceIds.length, 1);
    } finally {
      await w.cleanup();
    }
  });

  it("changed behavior: --workflow a reports only a; --workflow b only b; evidence refs belong to the workflow", async () => {
    const w = await twoWorkflowRepo("sd-sub-chg-");
    try {
      const baselineIds = await baselineEvidenceByWorkflow(w.repo);
      await setMode(w, "exit1");
      for (const id of ["a", "b"]) {
        const r = await runInProcess(w.repo, ["--json", "check", "--workflow", id]);
        assert.equal(r.code, EXIT_CODES.success, r.err);
        const json = JSON.parse(r.out) as CheckJson;
        assert.equal(json.status, "findings");
        assert.ok(json.behavioralDiff.findings.length > 0);
        assert.deepEqual(json.behavioralDiff.baselineEvidenceIds, [baselineIds.get(id)]);
        const allowed = new Set([baselineIds.get(id), ...json.behavioralDiff.currentEvidenceIds]);
        for (const f of json.behavioralDiff.findings) {
          assert.equal(f.workflowId, id);
          assert.doesNotMatch(f.summary, /disappeared/);
          for (const ev of f.evidenceIds) assert.ok(allowed.has(ev), `foreign evidence ${ev}`);
        }
      }
    } finally {
      await w.cleanup();
    }
  });

  it("full check (no --workflow) still compares all workflows", async () => {
    const w = await twoWorkflowRepo("sd-sub-full-");
    try {
      await setMode(w, "exit1");
      const r = await runInProcess(w.repo, ["--json", "check"]);
      const json = JSON.parse(r.out) as CheckJson;
      assert.equal(json.behavioralDiff.baselineEvidenceIds.length, 2);
      const wfs = new Set(json.behavioralDiff.findings.map((f) => f.workflowId));
      assert.deepEqual([...wfs].sort(), ["a", "b"]);
    } finally {
      await w.cleanup();
    }
  });

  it("unknown workflow id → exit 2", async () => {
    const w = await twoWorkflowRepo("sd-sub-unknown-");
    try {
      const r = await runInProcess(w.repo, ["check", "--workflow", "nope"]);
      assert.equal(r.code, EXIT_CODES.user_error);
      assert.match(r.err, /Unknown workflow id\(s\): nope/);
    } finally {
      await w.cleanup();
    }
  });

  it("configured workflow absent from the baseline → exit 2 (never 'appeared'/'disappeared')", async () => {
    const w = await makeWorkflowRepo("sd-sub-notinbl-", [{ id: "a" }, { id: "b" }]);
    try {
      await setMode(w, "fast");
      assert.equal((await runInProcess(w.repo, ["baseline", "--workflow", "a"])).code, 0);
      const r = await runInProcess(w.repo, ["check", "--workflow", "b"]);
      assert.equal(r.code, EXIT_CODES.user_error);
      assert.match(r.err, /not captured in the active baseline: b/);
      const ci = await runInProcess(w.repo, ["ci", "--workflow", "b"]);
      assert.equal(ci.code, EXIT_CODES.user_error);
    } finally {
      await w.cleanup();
    }
  });

  it("ci --workflow a does not fail because of b (audit repro)", async () => {
    const w = await twoWorkflowRepo("sd-sub-ci-");
    try {
      const r = await runInProcess(w.repo, ["ci", "--workflow", "a", "--fail-on", "warn"]);
      assert.equal(r.code, EXIT_CODES.success, r.out + r.err);
      const json = JSON.parse(r.out) as { status: string; findings: unknown[] };
      assert.equal(json.status, "clean");
      assert.equal(json.findings.length, 0);
    } finally {
      await w.cleanup();
    }
  });

  it("change-surface association still works with a subset", async () => {
    const w = await twoWorkflowRepo("sd-sub-surface-");
    try {
      await writeFile(path.join(w.repo, "README.md"), "changed\n", "utf8");
      await git(w.repo, ["add", "README.md"]);
      await git(w.repo, ["commit", "-m", "readme"]);
      await setMode(w, "exit1");
      const r = await runInProcess(w.repo, ["--json", "check", "--workflow", "a"]);
      const json = JSON.parse(r.out) as CheckJson;
      assert.ok(json.behavioralDiff.findings.length > 0);
      for (const f of json.behavioralDiff.findings) {
        assert.equal(f.workflowId, "a");
        assert.equal(f.associationStatus, "associated");
        assert.equal(f.changeSurfaceRefs?.length, 1);
      }
    } finally {
      await w.cleanup();
    }
  });
});

describe("baselineEvidenceForSelection (application boundary)", () => {
  const ev = (id: string, workflowId: string) => ({ id, workflowId }) as unknown as Evidence;
  const all = [ev("e-a", "a"), ev("e-b", "b")];

  it("no explicit subset → all baseline evidence (full comparison unchanged)", () => {
    assert.deepEqual(
      baselineEvidenceForSelection(all, ["a", "b"], undefined).map((e) => e.id),
      ["e-a", "e-b"],
    );
  });

  it("explicit subset → only selected workflows", () => {
    assert.deepEqual(
      baselineEvidenceForSelection(all, ["b"], ["b"]).map((e) => e.id),
      ["e-b"],
    );
  });

  it("selected workflow missing from baseline → user_error", () => {
    assert.throws(
      () => baselineEvidenceForSelection(all, ["c"], ["c"]),
      (err: unknown) =>
        err instanceof DiffWitnessError &&
        err.exitCode === EXIT_CODES.user_error &&
        err.details?.code === "workflow_not_in_baseline",
    );
  });
});
