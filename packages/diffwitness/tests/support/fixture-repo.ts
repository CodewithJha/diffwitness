import { cp, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { runCli } from "../../src/cli/program.js";
import { FsStorage } from "../../src/infrastructure/storage/fs-storage.js";
import type { AiProvider } from "../../src/ports/ai-provider.js";
import type { ProcessExecutor, ProcessExecuteResult } from "../../src/ports/process-executor.js";
import { afterInit } from "./demo-config.js";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const fixtureSrc = path.join(packageRoot, "fixtures", "demo");

export async function git(repo: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd: repo });
  return stdout;
}

/** Temp repo with the demo fixture committed. */
export async function makeFixtureRepo(prefix: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix));
  await git(root, ["init"]);
  await git(root, ["config", "user.email", "test@example.com"]);
  await git(root, ["config", "user.name", "Test"]);
  await mkdir(path.join(root, "fixtures"), { recursive: true });
  await cp(fixtureSrc, path.join(root, "fixtures", "demo"), { recursive: true });
  await writeFile(path.join(root, "README.md"), "fixture repo\n", "utf8");
  await git(root, ["add", "."]);
  await git(root, ["commit", "-m", "init"]);
  return root;
}

/** init + commit config so the baseline is captured from a clean, comparable commit. */
export async function initAndBaseline(repo: string): Promise<void> {
  await cli(repo, ["init"]);
  await git(repo, ["add", ".diffwitness/config.yaml", ".diffwitness/.gitignore"]);
  await git(repo, ["commit", "-m", "diffwitness config"]);
  const baseline = await cli(repo, ["baseline"]);
  if (baseline.code !== 0) {
    throw new Error(`baseline failed: ${baseline.err}`);
  }
}

export async function setRank(repo: string, rank: number): Promise<void> {
  await writeFile(
    path.join(repo, "fixtures", "demo", "behavior.json"),
    `${JSON.stringify({ message: "diffwitness-demo", rank, stable: true }, null, 2)}\n`,
    "utf8",
  );
}

export async function cli(
  repo: string,
  argv: string[],
  extras?: { executor?: ProcessExecutor; aiProvider?: AiProvider },
): Promise<{ code: number; out: string; err: string }> {
  let out = "";
  let err = "";
  const code = await runCli({
    argv,
    cwd: repo,
    storage: new FsStorage(),
    ...(extras?.executor !== undefined ? { executor: extras.executor } : {}),
    ...(extras?.aiProvider !== undefined ? { aiProvider: extras.aiProvider } : {}),
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

/** Executor that prints fixed stdout without touching the repo (behavior change, no source change). */
export function fixedStdoutExecutor(stdout: string, onExecute?: () => Promise<void>): ProcessExecutor {
  return {
    async execute(): Promise<ProcessExecuteResult> {
      if (onExecute !== undefined) {
        await onExecute();
      }
      return {
        outcome: "exited",
        exitCode: 0,
        stdout: Buffer.from(stdout, "utf8"),
        stderr: Buffer.alloc(0),
        stdoutTruncated: false,
        stderrTruncated: false,
        durationMs: 1,
      };
    },
  };
}
