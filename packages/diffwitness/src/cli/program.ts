import { Command, CommanderError } from "commander";
import {
  createBaseline,
  formatBaselineHuman,
  formatBaselineJson,
} from "../application/create-baseline.js";
import {
  formatInitHuman,
  formatInitJson,
  initProject,
} from "../application/init-project.js";
import {
  formatCheckHuman,
  formatCheckJson,
  runCheck,
  type FailOnSeverity,
} from "../application/run-check.js";
import {
  formatExplainHuman,
  formatExplainJson,
  runExplain,
} from "../application/run-explain.js";
import {
  formatCiHuman,
  formatCiJson,
  runCi,
} from "../application/run-ci.js";
import {
  EXIT_CODES,
  exitCodeForError,
  exitCodeForSignal,
  interruptedError,
  isInterruptionExitCode,
  isDiffWitnessError,
  DiffWitnessError,
} from "../domain/errors.js";
import { assertNotInterrupted } from "../application/interruption-guard.js";
import { InterruptController } from "../infrastructure/execution/interrupt-controller.js";
import { ChildProcessExecutor } from "../infrastructure/execution/process-executor.js";
import { LocalGitPort } from "../infrastructure/git/local-git.js";
import { FsStorage } from "../infrastructure/storage/fs-storage.js";
import type { AiProvider } from "../ports/ai-provider.js";
import type { GitPort } from "../ports/git.js";
import type { Interruption } from "../ports/interruption.js";
import type { ProcessExecutor } from "../ports/process-executor.js";
import type { StoragePort } from "../ports/storage.js";

export const CLI_VERSION = "0.1.0";

export interface RunCliOptions {
  /** Injected interruption (tests). Without it, runCli installs SIGINT/SIGTERM handlers. */
  readonly interruption?: InterruptController;
  readonly argv?: readonly string[];
  readonly cwd?: string;
  readonly stdout?: (chunk: string) => void;
  readonly stderr?: (chunk: string) => void;
  readonly storage?: StoragePort;
  readonly git?: GitPort;
  readonly executor?: ProcessExecutor;
  readonly aiProvider?: AiProvider;
}

interface GlobalOpts {
  repo?: string;
  json?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  config?: string;
}

/**
 * Build the Commander program.
 */
export function createProgram(deps: {
  storage: StoragePort;
  git: GitPort;
  executor: ProcessExecutor;
  cwd: string;
  writeOut: (chunk: string) => void;
  writeErr: (chunk: string) => void;
  setExitCode: (code: number) => void;
  interruption: Interruption;
  aiProvider?: AiProvider;
}): Command {
  const program = new Command();

  program
    .name("diffwitness")
    .description(
      "DiffWitness — detect behavioral changes that tests and Git diffs can miss, with execution evidence",
    )
    .version(CLI_VERSION, "-V, --version")
    .option("--config <path>", "Config file (default: .diffwitness/config.yaml)")
    .option("--repo <path>", "Repository root (default: cwd)")
    .option("--json", "Machine-readable JSON on stdout")
    .option("--verbose", "Extra diagnostics on stderr")
    .option("--quiet", "Summary only")
    .configureOutput({
      writeOut: (str) => deps.writeOut(str),
      writeErr: (str) => deps.writeErr(str),
    })
    .showHelpAfterError("(run `diffwitness --help` or `diffwitness <command> --help` for usage)")
    .allowExcessArguments(false)
    .exitOverride();

  program
    .command("init")
    .description("Create .diffwitness/ config and local metadata layout")
    .option("--force", "Overwrite config (keep evidence unless --wipe)")
    .option("--wipe", "With --force, reset evidence layout directories")
    .action(async (cmdOpts: { force?: boolean; wipe?: boolean }, command: Command) => {
      const global = command.optsWithGlobals() as GlobalOpts;
      const result = await initProject(deps.storage, {
        cwd: deps.cwd,
        ...(global.repo !== undefined ? { repoPath: global.repo } : {}),
        force: cmdOpts.force === true,
        wipe: cmdOpts.wipe === true,
      });
      if (global.json === true) {
        deps.writeOut(formatInitJson(result));
      } else {
        deps.writeOut(`${formatInitHuman(result)}\n`);
      }
      deps.setExitCode(EXIT_CODES.success);
    });

  program
    .command("baseline")
    .description("Run configured workflows and persist Baseline + Evidence (no AI)")
    .option("--workflow <id>", "Workflow id to run (repeatable)", collect, [])
    .option("--force", "Supersede active baseline explicitly")
    .action(
      async (
        cmdOpts: { workflow?: string[]; force?: boolean },
        command: Command,
      ) => {
        const global = command.optsWithGlobals() as GlobalOpts;
        const result = await createBaseline(
          {
            storage: deps.storage,
            git: deps.git,
            executor: deps.executor,
            interruption: deps.interruption,
          },
          {
            cwd: deps.cwd,
            ...(global.repo !== undefined ? { repoPath: global.repo } : {}),
            ...(global.config !== undefined ? { configPath: global.config } : {}),
            ...(cmdOpts.workflow !== undefined && cmdOpts.workflow.length > 0
              ? { workflowIds: cmdOpts.workflow }
              : {}),
            force: cmdOpts.force === true,
          },
        );
        assertNotInterrupted(deps.interruption, "baseline output");
        if (global.json === true) {
          deps.writeOut(formatBaselineJson(result));
        } else {
          deps.writeOut(`${formatBaselineHuman(result)}\n`);
        }
        deps.setExitCode(EXIT_CODES.success);
      },
    );

  program
    .command("check")
    .description(
      "Compare current Evidence vs active baseline (deterministic BehavioralDiff; no AI)",
    )
    .option("--base <ref>", "Git base hint (identity only; compare uses stored baseline)")
    .option("--workflow <id>", "Workflow id to run (repeatable)", collect, [])
    .option(
      "--fail-on <severity|error|never>",
      "Severity gate for exit 1 (default: never — local prints findings, exit 0)",
      "never",
    )
    .option("--allow-dirty", "Permit dirty working tree (default: allowed)")
    .action(
      async (
        cmdOpts: {
          base?: string;
          workflow?: string[];
          failOn?: string;
          allowDirty?: boolean;
        },
        command: Command,
      ) => {
        const global = command.optsWithGlobals() as GlobalOpts;
        const failOn = parseFailOn(cmdOpts.failOn);
        const result = await runCheck(
          {
            storage: deps.storage,
            git: deps.git,
            executor: deps.executor,
            interruption: deps.interruption,
          },
          {
            cwd: deps.cwd,
            ...(global.repo !== undefined ? { repoPath: global.repo } : {}),
            ...(global.config !== undefined ? { configPath: global.config } : {}),
            ...(cmdOpts.workflow !== undefined && cmdOpts.workflow.length > 0
              ? { workflowIds: cmdOpts.workflow }
              : {}),
            ...(cmdOpts.base !== undefined ? { baseRef: cmdOpts.base } : {}),
            failOn,
            // Default: dirty allowed for local check. --allow-dirty is explicit no-op affirm.
            // Only refuse dirty when a future strict mode is added; M2 does not invent --deny-dirty.
            allowDirty: true,
          },
        );
        assertNotInterrupted(deps.interruption, "check output");
        if (global.json === true) {
          deps.writeOut(formatCheckJson(result));
        } else if (global.quiet === true) {
          deps.writeOut(`${result.analysis.status}\n`);
        } else {
          deps.writeOut(`${formatCheckHuman(result)}\n`);
        }
        deps.setExitCode(result.exitCode);
      },
    );

  program
    .command("explain")
    .description(
      "Evidence-backed explanation of last BehavioralDiff via AiProvider (default: mock)",
    )
    .option("--provider <mock|featherless|none>", "Override config ai.provider")
    .option("--run <id>", "BehavioralDiff / run id (default: last check)")
    .action(
      async (
        cmdOpts: { provider?: string; run?: string },
        command: Command,
      ) => {
        const global = command.optsWithGlobals() as GlobalOpts;
        const provider = parseExplainProvider(cmdOpts.provider);
        const result = await runExplain(
          {
            storage: deps.storage,
            git: deps.git,
            ...(deps.aiProvider !== undefined ? { aiProvider: deps.aiProvider } : {}),
          },
          {
            cwd: deps.cwd,
            ...(global.repo !== undefined ? { repoPath: global.repo } : {}),
            ...(global.config !== undefined ? { configPath: global.config } : {}),
            ...(provider !== undefined ? { provider } : {}),
            ...(cmdOpts.run !== undefined ? { runId: cmdOpts.run } : {}),
          },
        );
        assertNotInterrupted(deps.interruption, "explain output");
        if (global.json === true) {
          deps.writeOut(formatExplainJson(result));
        } else if (global.quiet === true) {
          deps.writeOut(
            `${result.explanation !== null ? "explained" : result.explainError !== null ? "explain_error" : "unavailable"}\n`,
          );
        } else {
          deps.writeOut(`${formatExplainHuman(result)}\n`);
        }
        deps.setExitCode(result.exitCode);
      },
    );

  program
    .command("ci")
    .description(
      "Non-interactive CI gate: check vs local-active baseline; AI off by default; JSON on stdout",
    )
    .option("--base <ref>", "Git base hint (identity only; compare uses stored baseline)")
    .option("--workflow <id>", "Workflow id to run (repeatable)", collect, [])
    .option(
      "--fail-on <warn|error|never>",
      "Severity gate for exit 1 (CI default: error)",
      "error",
    )
    .option(
      "--allow-dirty",
      "Permit source-dirty working tree (CI default: refuse source-dirty)",
    )
    .option(
      "--explain",
      "Optionally run explain after check (AI still never decides status)",
    )
    .option("--provider <mock|featherless|none>", "Provider when --explain (default: mock)")
    .option("--json-out <file>", "Also write CI JSON report to a file")
    .action(
      async (
        cmdOpts: {
          base?: string;
          workflow?: string[];
          failOn?: string;
          allowDirty?: boolean;
          explain?: boolean;
          provider?: string;
          jsonOut?: string;
        },
        command: Command,
      ) => {
        const global = command.optsWithGlobals() as GlobalOpts;
        const failOn = parseFailOn(cmdOpts.failOn ?? "error");
        const explainProvider = parseExplainProvider(cmdOpts.provider);
        const result = await runCi(
          {
            storage: deps.storage,
            git: deps.git,
            executor: deps.executor,
            interruption: deps.interruption,
            ...(deps.aiProvider !== undefined ? { aiProvider: deps.aiProvider } : {}),
          },
          {
            cwd: deps.cwd,
            ...(global.repo !== undefined ? { repoPath: global.repo } : {}),
            ...(global.config !== undefined ? { configPath: global.config } : {}),
            ...(cmdOpts.workflow !== undefined && cmdOpts.workflow.length > 0
              ? { workflowIds: cmdOpts.workflow }
              : {}),
            ...(cmdOpts.base !== undefined ? { baseRef: cmdOpts.base } : {}),
            failOn,
            allowDirty: cmdOpts.allowDirty === true,
            explain: cmdOpts.explain === true,
            ...(explainProvider !== undefined ? { explainProvider } : {}),
          },
        );

        assertNotInterrupted(deps.interruption, "ci output");
        const json = formatCiJson(result);
        deps.writeOut(json);
        if (cmdOpts.jsonOut !== undefined && cmdOpts.jsonOut.length > 0) {
          await deps.storage.writeText(cmdOpts.jsonOut, json, { overwrite: true });
        }
        if (global.quiet !== true && global.json !== true) {
          deps.writeErr(`${formatCiHuman(result)}\n`);
        }
        deps.setExitCode(result.exitCode);
      },
    );

  return program;
}

function parseExplainProvider(
  value: string | undefined,
): "mock" | "featherless" | "none" | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === "mock" || value === "featherless" || value === "none") {
    return value;
  }
  throw new DiffWitnessError(
    "config",
    `Invalid --provider value: ${value} (expected mock|featherless|none)`,
    { exitClass: "user_error" },
  );
}

function parseFailOn(value: string | undefined): FailOnSeverity {
  if (value === undefined || value === "never") {
    return "never";
  }
  if (value === "warn" || value === "error") {
    return value;
  }
  throw new DiffWitnessError(
    "config",
    `Invalid --fail-on value: ${value} (expected warn|error|never)`,
    { exitClass: "user_error" },
  );
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

export async function runCli(options: RunCliOptions = {}): Promise<number> {
  const argv = [...(options.argv ?? process.argv.slice(2))];
  const cwd = options.cwd ?? process.cwd();
  const writeOut = options.stdout ?? ((c: string) => process.stdout.write(c));
  const writeErr = options.stderr ?? ((c: string) => process.stderr.write(c));
  const storage = options.storage ?? new FsStorage();
  const git = options.git ?? new LocalGitPort();
  const interruption = options.interruption ?? new InterruptController();
  // Process-level handlers only for real CLI runs (no injected executor / interruption).
  const ownsSignals = options.interruption === undefined && options.executor === undefined;
  const ownsExecutor = options.executor === undefined;
  const executor = options.executor ?? new ChildProcessExecutor({ interruption });
  if (ownsSignals) {
    interruption.install();
  }

  let exitCode = EXIT_CODES.success;
  const program = createProgram({
    storage,
    git,
    executor,
    cwd,
    writeOut,
    writeErr,
    setExitCode: (code) => {
      exitCode = code;
    },
    interruption,
    ...(options.aiProvider !== undefined ? { aiProvider: options.aiProvider } : {}),
  });

  let code: number;
  try {
    await program.parseAsync(["node", "diffwitness", ...argv]);
    code = exitCode;
  } catch (error) {
    code = reportError(error, writeErr);
  } finally {
    if (ownsExecutor && executor instanceof ChildProcessExecutor) {
      await executor.dispose();
    }
    if (ownsSignals) {
      interruption.uninstall();
    }
  }

  // An interrupted run never reports success, findings, or an analysis result.
  const signal = interruption.signal;
  if (signal !== null && !isInterruptionExitCode(code)) {
    writeErr(`error: ${interruptedError(signal, "run").message}\n`);
    return exitCodeForSignal(signal);
  }
  return code;
}

function reportError(error: unknown, writeErr: (chunk: string) => void): number {
  if (isCommanderHelpOrVersion(error)) {
    return EXIT_CODES.success;
  }
  if (isCommanderUsageError(error)) {
    // Commander already printed its own "error: …" line; usage mistakes are user errors.
    return EXIT_CODES.user_error;
  }
  if (isDiffWitnessError(error)) {
    writeErr(`error: ${error.message}\n`);
    return error.exitCode;
  }
  const message = error instanceof Error ? error.message : String(error);
  writeErr(`error: ${message}\n`);
  return exitCodeForError(error);
}

function isCommanderHelpOrVersion(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const code = (error as { code?: string }).code;
  return code === "commander.helpDisplayed" || code === "commander.version";
}

function isCommanderUsageError(error: unknown): boolean {
  if (!(error instanceof CommanderError)) {
    return false;
  }
  return error.code.startsWith("commander.");
}
