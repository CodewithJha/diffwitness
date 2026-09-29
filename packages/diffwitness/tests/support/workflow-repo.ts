import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCli } from "../../src/cli/program.js";
import type { InterruptController } from "../../src/infrastructure/execution/interrupt-controller.js";
import { FsStorage } from "../../src/infrastructure/storage/fs-storage.js";
import type { AiProvider } from "../../src/ports/ai-provider.js";
import type { ProcessExecutor } from "../../src/ports/process-executor.js";
import type { StoragePort } from "../../src/ports/storage.js";
import { git } from "./fixture-repo.js";

export const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const mainTs = path.join(packageRoot, "src", "cli", "main.ts");

/**
 * Controllable workflow script. Mode comes from `$MODE_FILE` (outside the repo, so switching
 * modes never dirties the tree):
 * - fast (default): prints `ok-<id>`
 * - sleep: writes its pid to `$MARKER`, then sleeps 8s
 * - grandchild: spawns a 30s grandchild sharing stdout, writes the grandchild pid to `$MARKER`, sleeps
 * - exit1: prints `ok-<id>` and exits 1
 * - exit130: prints `ok-<id>` and exits 130 on its own
 * - selfkill: SIGKILLs itself
 * - alt: prints `alt-<id>` (stdout-only change → warn finding)
 */
const WORKFLOW_SCRIPT = `import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
const id = process.argv[2] ?? "w";
const modeFile = process.env.MODE_FILE ?? "";
const mode = modeFile !== "" && existsSync(modeFile) ? readFileSync(modeFile, "utf8").trim() : "fast";
if (mode === "sleep") {
  writeFileSync(process.env.MARKER, String(process.pid));
  setTimeout(() => process.stdout.write("late\\n"), 8000);
} else if (mode === "grandchild") {
  const gc = spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"], { stdio: ["ignore", "inherit", "inherit"] });
  writeFileSync(process.env.MARKER, String(gc.pid));
  setTimeout(() => {}, 30000);
} else if (mode === "exit1") {
  process.stdout.write("ok-" + id + "\\n");
  process.exitCode = 1;
} else if (mode === "exit130") {
  process.stdout.write("ok-" + id + "\\n");
  process.exitCode = 130;
} else if (mode === "selfkill") {
  process.kill(process.pid, "SIGKILL");
} else if (mode === "alt") {
  process.stdout.write("alt-" + id + "\\n");
} else {
  process.stdout.write("ok-" + id + "\\n");
}
`;

export interface WorkflowRepo {
  readonly repo: string;
  /** Control dir outside the repo (mode file + marker). */
  readonly control: string;
  readonly modeFile: string;
  readonly marker: string;
  cleanup(): Promise<void>;
}

export interface WorkflowSpec {
  readonly id: string;
  readonly timeoutMs?: number;
  /** Override argv (default: node wf.mjs <id>). */
  readonly command?: readonly string[];
}

/** Git repo with committed `.diffwitness/config.yaml` (JSON is valid YAML) and wf.mjs. */
export async function makeWorkflowRepo(
  prefix: string,
  workflows: readonly WorkflowSpec[],
): Promise<WorkflowRepo> {
  const repo = await mkdtemp(path.join(os.tmpdir(), `${prefix}repo-`));
  const control = await mkdtemp(path.join(os.tmpdir(), `${prefix}ctl-`));
  const modeFile = path.join(control, "mode");
  const marker = path.join(control, "marker");
  await git(repo, ["init"]);
  await git(repo, ["config", "user.email", "test@example.com"]);
  await git(repo, ["config", "user.name", "Test"]);
  await writeFile(path.join(repo, "wf.mjs"), WORKFLOW_SCRIPT, "utf8");
  await mkdir(path.join(repo, ".diffwitness"), { recursive: true });
  const config = {
    version: 1,
    baseRef: "HEAD",
    workflows: workflows.map((w) => ({
      id: w.id,
      command: w.command ?? ["node", "wf.mjs", w.id],
      timeoutMs: w.timeoutMs ?? 20_000,
      env: { MODE_FILE: modeFile, MARKER: marker },
    })),
    assumptions: [],
    execution: { allowCommands: true, envPolicy: "path" },
  };
  await writeFile(
    path.join(repo, ".diffwitness", "config.yaml"),
    `${JSON.stringify(config, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(repo, ".diffwitness", ".gitignore"),
    "cache/\nevidence/\nblobs/\nbaselines/\nruns/\n",
    "utf8",
  );
  await git(repo, ["add", "."]);
  await git(repo, ["commit", "-m", "init"]);
  return {
    repo,
    control,
    modeFile,
    marker,
    cleanup: async () => {
      await rm(repo, { recursive: true, force: true });
      await rm(control, { recursive: true, force: true });
    },
  };
}

export async function setMode(w: WorkflowRepo, mode: string): Promise<void> {
  await writeFile(w.modeFile, mode, "utf8");
  await rm(w.marker, { force: true });
}

export interface CliResult {
  readonly code: number;
  readonly out: string;
  readonly err: string;
}

/** In-process CLI with optional injected interruption / executor / storage / provider. */
export async function runInProcess(
  repo: string,
  argv: string[],
  extras: {
    interruption?: InterruptController;
    executor?: ProcessExecutor;
    storage?: StoragePort;
    aiProvider?: AiProvider;
  } = {},
): Promise<CliResult> {
  let out = "";
  let err = "";
  const code = await runCli({
    argv: ["--repo", repo, ...argv],
    cwd: repo,
    storage: extras.storage ?? new FsStorage(),
    ...(extras.interruption !== undefined ? { interruption: extras.interruption } : {}),
    ...(extras.executor !== undefined ? { executor: extras.executor } : {}),
    ...(extras.aiProvider !== undefined ? { aiProvider: extras.aiProvider } : {}),
    stdout: (c) => {
      out += c;
    },
    stderr: (c) => {
      err += c;
    },
  });
  return { code, out, err };
}

/** Real CLI subprocess (`node --import tsx src/cli/main.ts`), so real signals can be delivered. */
export function spawnCli(
  repo: string,
  argv: string[],
  env: NodeJS.ProcessEnv = process.env,
): {
  readonly pid: number;
  readonly done: Promise<{ code: number | null; signal: NodeJS.Signals | null; out: string; err: string; ms: number }>;
  kill(signal: NodeJS.Signals): void;
} {
  const started = Date.now();
  const child = spawn(process.execPath, ["--import", "tsx", mainTs, "--repo", repo, ...argv], {
    cwd: packageRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let out = "";
  let err = "";
  child.stdout.on("data", (c: Buffer) => {
    out += c.toString("utf8");
  });
  child.stderr.on("data", (c: Buffer) => {
    err += c.toString("utf8");
  });
  const done = new Promise<{ code: number | null; signal: NodeJS.Signals | null; out: string; err: string; ms: number }>(
    (resolve) => {
      child.on("close", (code, signal) => resolve({ code, signal, out, err, ms: Date.now() - started }));
    },
  );
  if (child.pid === undefined) {
    throw new Error("failed to spawn CLI");
  }
  return { pid: child.pid, done, kill: (signal) => child.kill(signal) };
}

export async function waitForFile(file: string, timeoutMs = 20_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const text = await readFile(file, "utf8");
      if (text.length > 0) return text;
    } catch {
      // not yet
    }
    await sleep(25);
  }
  throw new Error(`timed out waiting for ${file}`);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** Poll until pid is gone (bounded). */
export async function waitForExit(pid: number, timeoutMs = 3_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isAlive(pid)) return true;
    await sleep(25);
  }
  return !isAlive(pid);
}

/** Byte snapshot of every file under .diffwitness/{baselines,runs,evidence}. */
export async function snapshotState(repo: string): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const dir of ["baselines", "runs", "evidence"]) {
    const abs = path.join(repo, ".diffwitness", dir);
    let names: string[] = [];
    try {
      names = await readdir(abs);
    } catch {
      continue;
    }
    for (const name of names.sort()) {
      out.set(`${dir}/${name}`, await readFile(path.join(abs, name), "utf8"));
    }
  }
  return out;
}

/**
 * Tamper the active baseline's `normalizer_version` observations so the next check is an honest
 * DiffEngine `analysis_error` (normalizer mismatch) that is persisted as a BehavioralDiff.
 */
export async function forceNormalizerMismatch(repo: string): Promise<void> {
  const diffwitness = path.join(repo, ".diffwitness");
  const active = JSON.parse(await readFile(path.join(diffwitness, "baselines", "active.json"), "utf8")) as {
    baselineId: string;
  };
  const baseline = JSON.parse(
    await readFile(path.join(diffwitness, "baselines", `${active.baselineId}.json`), "utf8"),
  ) as { baseline: { evidenceIds: string[] } };
  for (const id of baseline.baseline.evidenceIds) {
    const file = path.join(diffwitness, "evidence", `${id}.json`);
    const env = JSON.parse(await readFile(file, "utf8")) as {
      evidence: { observations: Array<{ key: string; rawPreview?: string }> };
    };
    for (const obs of env.evidence.observations) {
      if (obs.key === "normalizer_version") obs.rawPreview = "normalizer-v0-tampered";
    }
    await writeFile(file, `${JSON.stringify(env, null, 2)}\n`, "utf8");
  }
}

export async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8")) as unknown;
}
