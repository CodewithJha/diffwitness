import { cp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildChildEnv,
  buildGitEnv,
  gitArgv,
  scrubWorkspacePaths,
} from "./cli-invocation.js";
import {
  DEMO_RESPONSE_SCHEMA_VERSION,
  parseExplainJson,
  summarizeExplanation,
  summarizeFindings,
  type DemoFailure,
  type DemoResult,
  type ExplainJson,
  type FailureKind,
  type StageId,
  type StageRecord,
} from "./demo-result.js";
import { summarizeDemo } from "./demo-summary.js";
import { describeError, type HostedLogger } from "./logger.js";
import { runProcess, type RunProcessResult } from "./process-runner.js";
import type { DemoScenario } from "./scenarios.js";
import type { Workspace, WorkspaceTracker } from "./workspace.js";

/** Why a run's AbortSignal fired (passed as `AbortController.abort(reason)`). */
export type DemoAbortReason = "request_timeout" | "client_disconnected" | "shutdown";

export interface RunDemoDeps {
  readonly workspaces: WorkspaceTracker;
  /** argv prefix of the real CLI entry point (see defaultCliCommand). */
  readonly cliCommand: readonly string[];
  readonly stageTimeoutMs: number;
  readonly maxOutputBytes: number;
  readonly log: HostedLogger;
}

interface StageSpec {
  readonly id: StageId;
  readonly label: string;
  readonly command: string;
  readonly cliArgs: readonly string[];
}

const STAGES = {
  init: { id: "init", label: "Initialize DiffWitness", command: "diffwitness init", cliArgs: ["init"] },
  baseline: {
    id: "baseline",
    label: "Capture baseline",
    command: "diffwitness baseline",
    cliArgs: ["baseline"],
  },
  check: { id: "check", label: "Check behavior", command: "diffwitness check", cliArgs: ["check"] },
  explain: {
    id: "explain",
    label: "Explain with MockAI",
    command: "diffwitness explain --provider mock",
    cliArgs: ["explain", "--provider", "mock"],
  },
  explainJson: {
    id: "explain-json",
    label: "Machine-readable result",
    command: "diffwitness explain --provider mock --json",
    cliArgs: ["explain", "--provider", "mock", "--json"],
  },
} as const satisfies Record<string, StageSpec>;

const CHECK_ANALYSIS_ERROR_EXIT = 3;

class DemoStop extends Error {
  constructor(readonly failure: DemoFailure) {
    super(failure.message);
  }
}

/**
 * Execute one trusted scenario end to end against the real CLI and return its outputs.
 * The workspace is always removed before this resolves.
 */
export async function runDemo(
  deps: RunDemoDeps,
  scenario: DemoScenario,
  signal: AbortSignal,
): Promise<DemoResult> {
  const started = Date.now();
  const run = new DemoRun(deps, scenario, signal);
  let workspace: Workspace | undefined;
  let failure: DemoFailure | null = null;
  let explainJson: ExplainJson | null = null;
  try {
    workspace = await deps.workspaces.create();
    explainJson = await run.execute(workspace);
  } catch (error) {
    if (error instanceof DemoStop) {
      failure = error.failure;
    } else {
      deps.log("demo_internal_error", { scenario: scenario.id, error: describeError(error) });
      failure = run.abortFailure("setup") ?? internal("setup");
    }
  } finally {
    if (workspace !== undefined && !(await deps.workspaces.remove(workspace))) {
      deps.log("workspace_cleanup_failed", { scenario: scenario.id });
    }
  }

  const source = STAGES.explainJson.command;
  return {
    schemaVersion: DEMO_RESPONSE_SCHEMA_VERSION,
    scenario: {
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      change: scenario.change.summary,
      config: run.installedConfig,
    },
    status: failure === null ? "completed" : "failed",
    failure,
    stages: run.stages,
    summary: explainJson !== null ? summarizeDemo(explainJson, scenario.roles) : null,
    findings: explainJson !== null ? summarizeFindings(explainJson, source) : null,
    explanation: explainJson !== null ? summarizeExplanation(explainJson) : null,
    durationMs: Date.now() - started,
  };
}

class DemoRun {
  readonly stages: StageRecord[] = [];
  installedConfig: string | null = null;

  constructor(
    private readonly deps: RunDemoDeps,
    private readonly scenario: DemoScenario,
    private readonly signal: AbortSignal,
  ) {}

  async execute(ws: Workspace): Promise<ExplainJson> {
    await this.prepareRepository(ws);

    this.expectExit(await this.cli(ws, STAGES.init), [0], "stage_failed");
    await this.installConfig(ws);
    await this.git(ws, ["add", ".diffwitness/config.yaml", ".diffwitness/.gitignore"]);
    await this.git(ws, ["commit", "-q", "-m", "diffwitness config"]);

    this.expectExit(await this.cli(ws, STAGES.baseline), [0], "stage_failed");

    await this.guard("change", () => this.scenario.change.apply(ws.repoDir));
    const diff = await this.process(ws, gitArgv(["diff", "--no-color", "--no-ext-diff"]), buildGitEnv(ws));
    this.record(ws, { id: "change", label: "Apply trusted change", command: "git diff" }, diff);
    this.expectExit(this.stages.at(-1)!, [0], "stage_failed");

    const check = await this.cli(ws, STAGES.check);
    if (check.outcome === "exited" && check.exitCode === CHECK_ANALYSIS_ERROR_EXIT) {
      throw new DemoStop({ kind: "analysis_error", stage: "check", message: "Check reported an analysis error (exit 3)" });
    }
    this.expectExit(check, [0], "stage_failed");

    if (this.scenario.beforeExplain !== undefined) {
      await this.guard("explain", () => this.scenario.beforeExplain!(ws.repoDir));
    }
    this.expectExit(await this.cli(ws, STAGES.explain), [0], "explain_error");

    const jsonStage = await this.cli(ws, STAGES.explainJson);
    this.expectExit(jsonStage, [0], "explain_error");
    return this.interpretExplainJson(jsonStage);
  }

  abortFailure(stage: StageId | "setup"): DemoFailure | null {
    if (!this.signal.aborted) return null;
    const reason = this.signal.reason as DemoAbortReason;
    if (reason === "request_timeout") {
      return { kind: "request_timeout", stage, message: "Demo exceeded the request time limit" };
    }
    const why = reason === "shutdown" ? "server shutting down" : "client disconnected";
    return { kind: "interrupted", stage, message: `Demo interrupted (${why})` };
  }

  private interpretExplainJson(stage: StageRecord): ExplainJson {
    const json = parseExplainJson(stage.json);
    if (json === null) {
      throw new DemoStop({
        kind: "stage_failed",
        stage: stage.id,
        message: "CLI JSON output did not match the expected explain schema",
      });
    }
    if (json.metadata.explanationStatus !== "ok" || json.explanation === null) {
      throw new DemoStop({ kind: "explain_error", stage: stage.id, message: "MockAI explanation did not succeed" });
    }
    if (json.behavioralDiff.status !== this.scenario.expectedCheckStatus) {
      throw new DemoStop({
        kind: "unexpected_result",
        stage: "check",
        message: `Expected check status ${this.scenario.expectedCheckStatus}, got ${json.behavioralDiff.status}`,
      });
    }
    return json;
  }

  /** Copy the trusted project (minus its DiffWitness config) and create the initial commit. */
  private async prepareRepository(ws: Workspace): Promise<void> {
    await this.guard("setup", async () => {
      const fixtureRoot = this.scenario.fixtureDir;
      await cp(fixtureRoot, ws.repoDir, {
        recursive: true,
        filter: (src) => {
          const rel = path.relative(fixtureRoot, src);
          return rel !== this.scenario.configFile && rel.split(path.sep)[0] !== "out";
        },
      });
    });
    // Empty --template: no sample hooks are copied into the new repository.
    await this.git(ws, ["init", "-q", "--template=", "-b", "main", "."]);
    await this.git(ws, ["add", "-A"]);
    await this.git(ws, ["commit", "-q", "-m", "init"]);
  }

  /** Replace the `init` template with the scenario's trusted workflow config. */
  private async installConfig(ws: Workspace): Promise<void> {
    await this.guard("setup", async () => {
      const config = await readFile(path.join(this.scenario.fixtureDir, this.scenario.configFile), "utf8");
      await writeFile(path.join(ws.repoDir, ".diffwitness", "config.yaml"), config, "utf8");
      this.installedConfig = config;
    });
  }

  private async git(ws: Workspace, args: readonly string[]): Promise<void> {
    const result = await this.process(ws, gitArgv(args), buildGitEnv(ws));
    if (result.outcome !== "exited" || result.exitCode !== 0) {
      throw new DemoStop(this.outcomeFailure(result, "setup") ?? internal("setup"));
    }
  }

  private async cli(ws: Workspace, spec: StageSpec): Promise<StageRecord> {
    const argv = [...this.deps.cliCommand, "--repo", ws.repoDir, ...spec.cliArgs];
    const result = await this.process(ws, argv, buildChildEnv(ws));
    return this.record(ws, spec, result);
  }

  private async process(
    ws: Workspace,
    argv: readonly string[],
    env: Record<string, string>,
  ): Promise<RunProcessResult> {
    const stop = this.abortFailure("setup");
    if (stop !== null) throw new DemoStop(stop);
    return runProcess({
      argv,
      cwd: ws.repoDir,
      env,
      timeoutMs: this.deps.stageTimeoutMs,
      maxOutputBytes: this.deps.maxOutputBytes,
      signal: this.signal,
    });
  }

  private record(
    ws: Workspace,
    spec: Pick<StageSpec, "id" | "label" | "command">,
    result: RunProcessResult,
  ): StageRecord {
    const stdout = scrubWorkspacePaths(result.stdout, ws);
    const json = spec.id === "explain-json" && !result.truncated ? parseJsonOrNull(stdout) : null;
    const record: StageRecord = {
      id: spec.id,
      label: spec.label,
      command: spec.command,
      outcome: result.outcome,
      exitCode: result.exitCode,
      // Parsed JSON stages carry their stdout as `json` only (same content, sent once).
      stdout: json !== null ? "" : stdout,
      stderr: scrubWorkspacePaths(result.stderr, ws),
      truncated: result.truncated,
      json,
      durationMs: result.durationMs,
    };
    this.stages.push(record);
    const failure = this.outcomeFailure(result, spec.id);
    if (failure !== null) throw new DemoStop(failure);
    return record;
  }

  private expectExit(stage: StageRecord, allowed: readonly number[], kind: FailureKind): void {
    if (stage.exitCode !== null && allowed.includes(stage.exitCode) && !stage.truncated) return;
    const detail = stage.truncated ? "output exceeded the size cap" : `exit ${stage.exitCode ?? "none"}`;
    throw new DemoStop({ kind, stage: stage.id, message: `\`${stage.command}\` failed (${detail})` });
  }

  /** Map a non-exited outcome to a failure; `null` when the process exited on its own. */
  private outcomeFailure(result: RunProcessResult, stage: StageId | "setup"): DemoFailure | null {
    switch (result.outcome) {
      case "exited":
        return null;
      case "aborted":
        return this.abortFailure(stage) ?? internal(stage);
      case "timed_out":
        return { kind: "stage_timeout", stage, message: "A demo step exceeded its time limit" };
      case "signaled":
      case "spawn_failed":
        return internal(stage);
    }
  }

  private async guard(stage: StageId | "setup", fn: () => Promise<void>): Promise<void> {
    const stop = this.abortFailure(stage);
    if (stop !== null) throw new DemoStop(stop);
    try {
      await fn();
    } catch (error) {
      if (error instanceof DemoStop) throw error;
      this.deps.log("demo_step_error", { scenario: this.scenario.id, stage, error: describeError(error) });
      throw new DemoStop(this.abortFailure(stage) ?? internal(stage));
    }
  }
}

function internal(stage: StageId | "setup"): DemoFailure {
  return { kind: "internal_error", stage, message: "Internal demo failure" };
}

function parseJsonOrNull(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
