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
import { normalizeCiReportForCompare } from "../src/application/run-ci.js";
import type { ProcessExecutor } from "../src/ports/process-executor.js";
import { ChildProcessExecutor } from "../src/infrastructure/execution/process-executor.js";
import { afterInit } from "./support/demo-config.js";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureSrc = path.join(packageRoot, "fixtures", "demo");

async function makeFixtureRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-ci-"));
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

async function commitDiffwitnessConfig(repo: string): Promise<void> {
  await execFileAsync("git", ["add", ".diffwitness/config.yaml", ".diffwitness/.gitignore"], {
    cwd: repo,
  });
  await execFileAsync("git", ["commit", "-m", "diffwitness config"], { cwd: repo });
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

describe("ci integration", () => {
  it("clean → findings fail-on matrix; AI off; never analysis_error→clean; baseline immutable", async () => {
    const repo = await makeFixtureRepo();
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      await commitDiffwitnessConfig(repo);
      assert.equal((await cli(repo, ["baseline"])).code, 0);

      const storage = new FsStorage();
      const store = new EvidenceStore(storage, repo);
      const activeBefore = await readFile(store.activePath(), "utf8");
      const baselineId = await store.getActiveBaselineId();
      assert.ok(baselineId);
      const baselineJsonBefore = await readFile(store.baselinePath(baselineId!), "utf8");

      const clean = await cli(repo, ["ci"]);
      assert.equal(clean.code, EXIT_CODES.success);
      const cleanJson = JSON.parse(clean.out);
      assert.equal(cleanJson.schemaVersion, 2);
      assert.equal(cleanJson.limitations.causality, "not_established");
      assert.equal(cleanJson.command, "ci");
      assert.equal(cleanJson.status, "clean");
      assert.equal(cleanJson.findings.length, 0);
      assert.equal(cleanJson.ai.enabled, false);
      assert.equal(cleanJson.ai.status, "disabled");
      assert.equal(cleanJson.baseline.model, "local-active");
      assert.equal(cleanJson.limitations.baselineModel, "local-active");
      assert.equal(cleanJson.metadata.generatedAt.volatile, true);
      assert.ok(!/\u001b\[/.test(clean.out), "CI JSON must not contain ANSI");

      // Mutate + commit so CI sees a clean tree with behavioral change
      const behaviorPath = path.join(repo, "fixtures", "demo", "behavior.json");
      await writeFile(
        behaviorPath,
        `${JSON.stringify({ message: "diffwitness-demo", rank: 2, stable: true }, null, 2)}\n`,
        "utf8",
      );
      await execFileAsync("git", ["add", "fixtures/demo/behavior.json"], { cwd: repo });
      await execFileAsync("git", ["commit", "-m", "mutate"], { cwd: repo });

      const never = await cli(repo, ["ci", "--fail-on", "never"]);
      assert.equal(never.code, EXIT_CODES.success);
      const neverJson = JSON.parse(never.out);
      assert.equal(neverJson.status, "findings");
      assert.ok(neverJson.findings.length >= 1);

      const warn = await cli(repo, ["ci", "--fail-on", "warn"]);
      assert.equal(warn.code, EXIT_CODES.findings);

      const errorGate = await cli(repo, ["ci", "--fail-on", "error"]);
      // DiffEngine findings are typically warn severity — error gate may exit 0
      assert.ok(
        errorGate.code === EXIT_CODES.success || errorGate.code === EXIT_CODES.findings,
      );
      const errorJson = JSON.parse(errorGate.out);
      assert.equal(errorJson.status, "findings");
      assert.notEqual(errorJson.status, "clean");

      // Default fail-on error with findings that are warn → exit 0 but status findings
      const defaultCi = await cli(repo, ["ci"]);
      assert.equal(JSON.parse(defaultCi.out).status, "findings");

      // Baseline immutable
      assert.equal(await readFile(store.activePath(), "utf8"), activeBefore);
      assert.equal(await readFile(store.baselinePath(baselineId!), "utf8"), baselineJsonBefore);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("missing baseline / malformed / analysis_error never report clean", async () => {
    const repo = await makeFixtureRepo();
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      await commitDiffwitnessConfig(repo);

      const noBaseline = await cli(repo, ["ci"]);
      assert.equal(noBaseline.code, EXIT_CODES.user_error);
      assert.ok(noBaseline.err.includes("baseline"));
      assert.ok(!noBaseline.out.includes('"status": "clean"'));

      assert.equal((await cli(repo, ["baseline"])).code, 0);

      // Corrupt active pointer
      const storage = new FsStorage();
      const store = new EvidenceStore(storage, repo);
      await writeFile(store.activePath(), "{not-json", "utf8");
      const corrupt = await cli(repo, ["ci", "--allow-dirty"]);
      assert.equal(corrupt.code, EXIT_CODES.analysis_error);
      assert.ok(!corrupt.out.includes('"status": "clean"') || corrupt.out.length === 0);

      // Restore usable baseline then force analysis_error via timeout executor
      await writeFile(
        store.activePath(),
        `${JSON.stringify({
          schemaVersion: 1,
          kind: "active_baseline",
          baselineId: "missing-bl",
        })}\n`,
        "utf8",
      );
      const missingBl = await cli(repo, ["ci", "--allow-dirty"]);
      assert.equal(missingBl.code, EXIT_CODES.analysis_error);

      // Fresh repo path for timeout
      const repo2 = await makeFixtureRepo();
      try {
        assert.equal((await cli(repo2, ["init"])).code, 0);
        await commitDiffwitnessConfig(repo2);
        assert.equal((await cli(repo2, ["baseline"])).code, 0);

        const timeoutExecutor: ProcessExecutor = {
          async execute() {
            return {
              outcome: "timed_out",
              exitCode: null,
              stdout: Buffer.alloc(0),
              stderr: Buffer.alloc(0),
              stdoutTruncated: false,
              stderrTruncated: false,
              durationMs: 1,
              errorMessage: "forced timeout",
            };
          },
        };
        const timed = await cli(repo2, ["ci"], { executor: timeoutExecutor });
        assert.equal(timed.code, EXIT_CODES.analysis_error);
        assert.ok(!timed.out.includes('"status": "clean"') || timed.out.length === 0);
      } finally {
        await rm(repo2, { recursive: true, force: true });
      }
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("refuses source-dirty unless --allow-dirty; ignores .diffwitness operational dirt", async () => {
    const repo = await makeFixtureRepo();
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      await commitDiffwitnessConfig(repo);
      assert.equal((await cli(repo, ["baseline"])).code, 0);

      // Operational .diffwitness dirt alone should not block (gitignored or filtered)
      const cleanOps = await cli(repo, ["ci"]);
      assert.equal(cleanOps.code, EXIT_CODES.success);

      await writeFile(path.join(repo, "extra.txt"), "dirty source\n", "utf8");
      const dirty = await cli(repo, ["ci"]);
      assert.equal(dirty.code, EXIT_CODES.user_error);
      assert.ok(dirty.err.includes("source-clean") || dirty.err.includes("source-dirty"));

      const allowed = await cli(repo, ["ci", "--allow-dirty"]);
      assert.equal(allowed.code, EXIT_CODES.success);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("invalid config is user_error; AI not required", async () => {
    const repo = await makeFixtureRepo();
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      await writeFile(
        path.join(repo, ".diffwitness", "config.yaml"),
        "version: 99\nworkflows: []\n",
        "utf8",
      );
      await commitDiffwitnessConfig(repo);
      const bad = await cli(repo, ["ci"]);
      assert.equal(bad.code, EXIT_CODES.user_error);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("golden CI JSON: normalize only known volatiles", async () => {
    const repo = await makeFixtureRepo();
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      await commitDiffwitnessConfig(repo);
      assert.equal((await cli(repo, ["baseline"])).code, 0);

      const a = JSON.parse((await cli(repo, ["ci"])).out);
      const b = JSON.parse((await cli(repo, ["ci"])).out);
      const na = normalizeCiReportForCompare(a);
      const nb = normalizeCiReportForCompare(b);
      assert.equal((na as { metadata: { generatedAt: { value: string } } }).metadata.generatedAt.value, "<volatile>");
      assert.equal(
        (na as { status: string }).status,
        (nb as { status: string }).status,
      );
      assert.equal((na as { command: string }).command, "ci");
      assert.deepEqual(
        (na as { findings: unknown[] }).findings,
        (nb as { findings: unknown[] }).findings,
      );
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("supports --json-out file write", async () => {
    const repo = await makeFixtureRepo();
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      await commitDiffwitnessConfig(repo);
      assert.equal((await cli(repo, ["baseline"])).code, 0);
      const outPath = path.join(repo, "ci-report.json");
      const result = await cli(repo, ["ci", "--json-out", outPath]);
      assert.equal(result.code, 0);
      const disk = await readFile(outPath, "utf8");
      assert.equal(disk, result.out);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });
});

void ChildProcessExecutor;
