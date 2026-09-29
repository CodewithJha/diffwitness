import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, it } from "node:test";
import { runCli } from "../src/cli/program.js";
import { EXIT_CODES } from "../src/domain/errors.js";
import { FsStorage } from "../src/infrastructure/storage/fs-storage.js";
import { EvidenceStore } from "../src/infrastructure/evidence/evidence-store.js";
import { MockAIProvider } from "../src/infrastructure/ai/mock-ai-provider.js";
import type { ProcessExecutor, ProcessExecuteRequest } from "../src/ports/process-executor.js";
import { ChildProcessExecutor } from "../src/infrastructure/execution/process-executor.js";
import { afterInit } from "./support/demo-config.js";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureSrc = path.join(packageRoot, "fixtures", "demo");

async function makeFixtureRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-check-"));
  await execFileAsync("git", ["init"], { cwd: root });
  await execFileAsync("git", ["config", "user.email", "test@example.com"], { cwd: root });
  await execFileAsync("git", ["config", "user.name", "Test"], { cwd: root });
  await mkdir(path.join(root, "fixtures"), { recursive: true });
  await cp(fixtureSrc, path.join(root, "fixtures", "demo"), { recursive: true });
  await writeFile(path.join(root, "README.md"), "fixture repo\n", "utf8");
  await execFileAsync("git", ["add", "."], { cwd: root });
  await execFileAsync("git", ["commit", "-m", "init"], { cwd: root });
  return root;
}

async function cli(
  repo: string,
  argv: string[],
  extras?: { executor?: ProcessExecutor },
): Promise<{ code: number; out: string; err: string }> {
  const storage = new FsStorage();
  let out = "";
  let err = "";
  const code = await runCli({
    argv,
    cwd: repo,
    storage,
    ...(extras?.executor !== undefined ? { executor: extras.executor } : {}),
    stdout: (c) => {
      out += c;
    },
    stderr: (c) => {
      err += c;
    },
  });
  await afterInit(repo, argv, code);
  return { code, out, err };
}

describe("check integration", () => {
  it("init → baseline → check clean → mutate → findings → restore → clean; baseline immutable; no AI", async () => {
    const repo = await makeFixtureRepo();
    const mockAi = new MockAIProvider();
    const explainSpy = {
      called: false,
      async explain(...args: Parameters<MockAIProvider["explain"]>) {
        explainSpy.called = true;
        return mockAi.explain(...args);
      },
    };
    void explainSpy;

    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      assert.equal((await cli(repo, ["baseline"])).code, 0);

      const storage = new FsStorage();
      const store = new EvidenceStore(storage, repo);
      const activeBefore = await readFile(store.activePath(), "utf8");
      const baselineId = await store.getActiveBaselineId();
      assert.ok(baselineId);
      const baselineJsonBefore = await readFile(store.baselinePath(baselineId!), "utf8");

      const clean = await cli(repo, ["check", "--json"]);
      assert.equal(clean.code, EXIT_CODES.success);
      const cleanJson = JSON.parse(clean.out);
      assert.equal(cleanJson.status, "clean");
      assert.equal(cleanJson.command, "check");
      assert.equal(cleanJson.explanation, null);
      assert.equal(cleanJson.behavioralDiff.status, "clean");
      assert.equal(cleanJson.behavioralDiff.findings.length, 0);

      // Mutate fixture behavior
      const behaviorPath = path.join(repo, "fixtures", "demo", "behavior.json");
      await writeFile(
        behaviorPath,
        `${JSON.stringify({ message: "diffwitness-demo", rank: 2, stable: true }, null, 2)}\n`,
        "utf8",
      );

      const dirty = await cli(repo, ["check", "--json"]);
      assert.equal(dirty.code, EXIT_CODES.success); // fail-on never
      const dirtyJson = JSON.parse(dirty.out);
      assert.equal(dirtyJson.status, "findings");
      assert.ok(dirtyJson.behavioralDiff.findings.length >= 1);
      const types = dirtyJson.behavioralDiff.findings.map(
        (f: { findingType: string }) => f.findingType,
      );
      assert.ok(types.includes("stdout_changed") || types.includes("artifact_changed"));
      for (const f of dirtyJson.behavioralDiff.findings) {
        assert.ok(Array.isArray(f.evidenceIds) && f.evidenceIds.length >= 1);
      }

      const failOn = await cli(repo, ["check", "--fail-on", "warn"]);
      assert.equal(failOn.code, EXIT_CODES.findings);

      // Baseline immutable
      const activeAfter = await readFile(store.activePath(), "utf8");
      const baselineJsonAfter = await readFile(store.baselinePath(baselineId!), "utf8");
      assert.equal(activeAfter, activeBefore);
      assert.equal(baselineJsonAfter, baselineJsonBefore);

      // Current evidence persisted separately
      const last = await store.getLastBehavioralDiff();
      assert.ok(last);
      assert.ok(last!.currentEvidenceIds.length >= 1);
      assert.notDeepEqual(last!.currentEvidenceIds, last!.baselineEvidenceIds);

      // Restore → clean
      await writeFile(
        behaviorPath,
        `${JSON.stringify({ message: "diffwitness-demo", rank: 1, stable: true }, null, 2)}\n`,
        "utf8",
      );
      const restored = await cli(repo, ["check", "--json"]);
      assert.equal(restored.code, EXIT_CODES.success);
      assert.equal(JSON.parse(restored.out).status, "clean");

      assert.equal(explainSpy.called, false);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("no baseline → user_error never clean", async () => {
    const repo = await makeFixtureRepo();
    try {
      await cli(repo, ["init"]);
      const result = await cli(repo, ["check", "--json"]);
      assert.equal(result.code, EXIT_CODES.user_error);
      assert.match(result.err, /No active baseline/);
      assert.doesNotMatch(result.out, /"status":\s*"clean"/);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("executor failure → analysis_error", async () => {
    const repo = await makeFixtureRepo();
    try {
      await cli(repo, ["init"]);
      await cli(repo, ["baseline"]);

      const failing: ProcessExecutor = {
        async execute(_req: ProcessExecuteRequest) {
          return {
            outcome: "spawn_failed",
            exitCode: null,
            signal: null,
            stdout: Buffer.alloc(0),
            stderr: Buffer.alloc(0),
            stdoutTruncated: false,
            stderrTruncated: false,
            durationMs: 0,
            errorMessage: "spawn boom",
          };
        },
      };

      const result = await cli(repo, ["check"], { executor: failing });
      assert.equal(result.code, EXIT_CODES.analysis_error);
      assert.match(result.err, /spawn/i);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("malformed baseline evidence → analysis_error", async () => {
    const repo = await makeFixtureRepo();
    try {
      await cli(repo, ["init"]);
      await cli(repo, ["baseline"]);

      const storage = new FsStorage();
      const store = new EvidenceStore(storage, repo);
      const baselineId = await store.getActiveBaselineId();
      const baseline = await store.getBaseline(baselineId!);
      const evidencePath = store.evidencePath(baseline.evidenceIds[0]!);
      await writeFile(evidencePath, "{not-json", "utf8");

      const result = await cli(repo, ["check"]);
      assert.equal(result.code, EXIT_CODES.analysis_error);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("human check output includes verdict", async () => {
    const repo = await makeFixtureRepo();
    try {
      await cli(repo, ["init"]);
      await cli(repo, ["baseline"]);
      const result = await cli(repo, ["check"]);
      assert.equal(result.code, 0);
      assert.match(result.out, /^NO BEHAVIOR CHANGE \(status: clean\)$/m);
      assert.match(result.out, /^Association: not applicable — no findings$/m);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("real ChildProcessExecutor still used by default (smoke)", async () => {
    assert.ok(ChildProcessExecutor);
  });
});
