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
import { createBaseline } from "../src/application/create-baseline.js";
import { LocalGitPort } from "../src/infrastructure/git/local-git.js";
import { ChildProcessExecutor } from "../src/infrastructure/execution/process-executor.js";
import type { Clock } from "../src/ports/clock.js";
import type { IdGenerator } from "../src/ports/id-generator.js";
import { installDemoConfig } from "./support/demo-config.js";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureSrc = path.join(packageRoot, "fixtures", "demo");

async function makeFixtureRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-fixture-"));
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

describe("baseline integration", () => {
  it("init + baseline persists real evidence on fixture", async () => {
    const repo = await makeFixtureRepo();
    try {
      const storage = new FsStorage();
      const initCode = await runCli({
        argv: ["init"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: () => {},
      });
      await installDemoConfig(repo);
      assert.equal(initCode, 0);

      let out = "";
      const baselineCode = await runCli({
        argv: ["baseline"],
        cwd: repo,
        storage,
        stdout: (c) => {
          out += c;
        },
        stderr: () => {},
      });
      assert.equal(baselineCode, 0);
      assert.match(out, /Baseline captured/);

      const store = new EvidenceStore(storage, repo);
      const activeId = await store.getActiveBaselineId();
      assert.ok(activeId);
      const baseline = await store.getBaseline(activeId!);
      assert.equal(baseline.workflowIds.length, 1);
      assert.equal(baseline.evidenceIds.length, 1);

      const evidence = await store.getEvidence(baseline.evidenceIds[0]!);
      assert.equal(evidence.exitCode, 0);
      assert.ok(evidence.observations.some((o) => o.key === "stdout"));
      assert.ok(evidence.stdoutRef?.digest.startsWith("sha256:"));

      const blob = await storage.readBytes(
        store.blobPath(evidence.stdoutRef!.digest),
      );
      const parsed = JSON.parse(blob.toString("utf8"));
      assert.equal(parsed.fixture, "diffwitness-demo");
      assert.equal(parsed.behavior.rank, 1);

      // Artifact observation present
      assert.ok(evidence.observations.some((o) => o.key.startsWith("artifact:")));
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("second baseline without --force fails; with --force supersedes", async () => {
    const repo = await makeFixtureRepo();
    try {
      const storage = new FsStorage();
      await runCli({
        argv: ["init"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: () => {},
      });
      await installDemoConfig(repo);
      assert.equal(
        await runCli({
          argv: ["baseline"],
          cwd: repo,
          storage,
          stdout: () => {},
          stderr: () => {},
        }),
        0,
      );
      let err = "";
      const second = await runCli({
        argv: ["baseline"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: (c) => {
          err += c;
        },
      });
      assert.equal(second, EXIT_CODES.user_error);
      assert.match(err, /force/i);

      assert.equal(
        await runCli({
          argv: ["baseline", "--force"],
          cwd: repo,
          storage,
          stdout: () => {},
          stderr: () => {},
        }),
        0,
      );
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("same fixture twice yields equivalent behavioral evidence (excluding volatile ids/timestamps)", async () => {
    const repo = await makeFixtureRepo();
    try {
      const storage = new FsStorage();
      await runCli({
        argv: ["init"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: () => {},
      });
      await installDemoConfig(repo);

      const clock: Clock = { now: () => new Date("2026-09-22T12:00:00.000Z") };
      let n = 0;
      const idsA: IdGenerator = { next: (p) => `${p}_A${++n}` };
      const idsB: IdGenerator = {
        next: (p) => {
          // separate sequence but we compare digests not ids
          return `${p}_B${++n}`;
        },
      };

      const git = new LocalGitPort();
      const executor = new ChildProcessExecutor();

      const first = await createBaseline(
        { storage, git, executor, clock, ids: idsA },
        { cwd: repo },
      );
      // Wipe active pointer + evidence for second run with force path:
      // use --force on second createBaseline
      n = 0;
      const second = await createBaseline(
        { storage, git, executor, clock, ids: idsB },
        { cwd: repo, force: true },
      );

      const strip = (ev: (typeof first.evidence)[0]) => ({
        workflowId: ev.workflowId,
        exitCode: ev.exitCode,
        git: { dirty: ev.git.dirty, headSha: ev.git.headSha },
        observations: ev.observations.map((o) => ({
          key: o.key,
          kind: o.kind,
          valueDigest: o.valueDigest,
          normalizedDigest: o.normalized?.digest,
          normalizedBytes: o.normalized?.byteLength,
        })),
        artifactDigests: ev.artifactRefs.map((a) => a.digest),
        stdoutDigest: ev.stdoutRef?.digest,
        stderrDigest: ev.stderrRef?.digest,
        redactionApplied: ev.redactionApplied,
      });

      assert.deepEqual(strip(first.evidence[0]!), strip(second.evidence[0]!));
      assert.equal(first.baseline.envFingerprint, second.baseline.envFingerprint);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("unknown workflow fails closed", async () => {
    const repo = await makeFixtureRepo();
    try {
      const storage = new FsStorage();
      await runCli({
        argv: ["init"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: () => {},
      });
      await installDemoConfig(repo);
      let err = "";
      const code = await runCli({
        argv: ["baseline", "--workflow", "missing"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: (c) => {
          err += c;
        },
      });
      assert.equal(code, EXIT_CODES.user_error);
      assert.match(err, /Unknown workflow/i);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("non-zero workflow exit is recorded and baseline still succeeds", async () => {
    const repo = await makeFixtureRepo();
    try {
      const storage = new FsStorage();
      await runCli({
        argv: ["init"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: () => {},
      });
      await installDemoConfig(repo);
      const configPath = path.join(repo, ".diffwitness", "config.yaml");
      await writeFile(
        configPath,
        `version: 1
workflows:
  - id: fail
    name: fail
    command: ["node", "-e", "process.exit(3)"]
    timeoutMs: 5000
execution:
  allowCommands: true
  maxStdoutBytes: 1024
  maxStderrBytes: 1024
  envPolicy: path
`,
        "utf8",
      );
      const code = await runCli({
        argv: ["baseline"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: () => {},
      });
      assert.equal(code, 0);
      const store = new EvidenceStore(storage, repo);
      const activeId = await store.getActiveBaselineId();
      const baseline = await store.getBaseline(activeId!);
      const evidence = await store.getEvidence(baseline.evidenceIds[0]!);
      assert.equal(evidence.exitCode, 3);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("timeout is not a successful baseline", async () => {
    const repo = await makeFixtureRepo();
    try {
      const storage = new FsStorage();
      await runCli({
        argv: ["init"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: () => {},
      });
      await installDemoConfig(repo);
      const configPath = path.join(repo, ".diffwitness", "config.yaml");
      await writeFile(
        configPath,
        `version: 1
workflows:
  - id: slow
    name: slow
    command: ["node", "-e", "setTimeout(() => {}, 60000)"]
    timeoutMs: 100
execution:
  allowCommands: true
  maxStdoutBytes: 1024
  maxStderrBytes: 1024
  envPolicy: path
`,
        "utf8",
      );
      let err = "";
      const code = await runCli({
        argv: ["baseline"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: (c) => {
          err += c;
        },
      });
      assert.equal(code, EXIT_CODES.analysis_error);
      assert.match(err, /timed out/i);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });
});
