import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, it } from "node:test";
import { runCli } from "../src/cli/program.js";
import { FsStorage } from "../src/infrastructure/storage/fs-storage.js";
import type { Clock } from "../src/ports/clock.js";
import { createBaseline } from "../src/application/create-baseline.js";
import { runCheck } from "../src/application/run-check.js";
import { LocalGitPort } from "../src/infrastructure/git/local-git.js";
import { ChildProcessExecutor } from "../src/infrastructure/execution/process-executor.js";
import { DeterministicNormalizer } from "../src/infrastructure/evidence/normalize.js";
import { UuidIdGenerator } from "../src/ports/id-generator.js";
import { installDemoConfig } from "./support/demo-config.js";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureSrc = path.join(packageRoot, "fixtures", "demo");

class FixedClock implements Clock {
  constructor(private readonly fixed: Date) {}
  now(): Date {
    return this.fixed;
  }
}

async function makeFixtureRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-repro-"));
  await execFileAsync("git", ["init"], { cwd: root });
  await execFileAsync("git", ["config", "user.email", "test@example.com"], { cwd: root });
  await execFileAsync("git", ["config", "user.name", "Test"], { cwd: root });
  await mkdir(path.join(root, "fixtures"), { recursive: true });
  await cp(fixtureSrc, path.join(root, "fixtures", "demo"), { recursive: true });
  await writeFile(path.join(root, "README.md"), "fixture\n", "utf8");
  await execFileAsync("git", ["add", "."], { cwd: root });
  await execFileAsync("git", ["commit", "-m", "init"], { cwd: root });
  return root;
}

describe("reproducibility", () => {
  it("identical check runs produce identical observation digests", async () => {
    const repo = await makeFixtureRepo();
    try {
      const storage = new FsStorage();
      await runCli({
        argv: ["init"],
        cwd: repo,
        storage,
        stdout: () => undefined,
        stderr: () => undefined,
      });
      await installDemoConfig(repo);
      await execFileAsync("git", ["add", ".diffwitness/config.yaml", ".diffwitness/.gitignore"], {
        cwd: repo,
      });
      await execFileAsync("git", ["commit", "-m", "cfg"], { cwd: repo });

      const git = new LocalGitPort();
      const executor = new ChildProcessExecutor();
      const clock = new FixedClock(new Date("2026-09-22T12:00:00.000Z"));
      const normalizer = new DeterministicNormalizer();

      await createBaseline(
        { storage, git, executor, clock, ids: new UuidIdGenerator(), normalizer },
        { cwd: repo },
      );

      const a = await runCheck(
        { storage, git, executor, clock, ids: new UuidIdGenerator(), normalizer },
        { cwd: repo, failOn: "never", allowDirty: true },
      );
      const b = await runCheck(
        { storage, git, executor, clock, ids: new UuidIdGenerator(), normalizer },
        { cwd: repo, failOn: "never", allowDirty: true },
      );

      assert.equal(a.analysis.status, "clean");
      assert.equal(b.analysis.status, "clean");
      const digestsA = a.currentEvidence.flatMap((e) =>
        e.observations.map((o) => `${o.key}:${o.valueDigest}`),
      );
      const digestsB = b.currentEvidence.flatMap((e) =>
        e.observations.map((o) => `${o.key}:${o.valueDigest}`),
      );
      assert.deepEqual([...digestsA].sort(), [...digestsB].sort());
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });
});
