import path from "node:path";
import { interruptedError, DiffWitnessError } from "../domain/errors.js";
import type { Evidence, Execution, GitIdentity, Workflow } from "../domain/types.js";
import { TEMPLATE_PLACEHOLDER_ARG } from "../infrastructure/config/defaults.js";
import type { DiffWitnessConfig } from "../infrastructure/config/schema.js";
import {
  buildEvidenceFromCapture,
  resolveArtifactPaths,
} from "../infrastructure/evidence/build-evidence.js";
import type { DeterministicNormalizer } from "../infrastructure/evidence/normalize.js";
import { buildProcessEnv, resolveWorkflowCwd } from "../infrastructure/execution/env-policy.js";
import type { Clock } from "../ports/clock.js";
import type { IdGenerator } from "../ports/id-generator.js";
import type { ProcessExecutor } from "../ports/process-executor.js";
import type { StoragePort } from "../ports/storage.js";

export interface CaptureWorkflowsInput {
  readonly repoRoot: string;
  readonly config: DiffWitnessConfig;
  readonly workflows: readonly Workflow[];
  readonly gitIdentity: GitIdentity;
  readonly executor: ProcessExecutor;
  readonly storage: StoragePort;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly normalizer: DeterministicNormalizer;
}

export interface CapturedWorkflow {
  readonly evidence: Evidence;
  readonly execution: Execution;
  readonly blobPayloads: ReadonlyArray<{ digest: string; bytes: Buffer }>;
}

/**
 * Shared M1 execution path used by `baseline` and `check`.
 * No second executor — argv process → normalize → digest → Evidence.
 */
export async function captureWorkflows(
  input: CaptureWorkflowsInput,
): Promise<readonly CapturedWorkflow[]> {
  assertNoTemplatePlaceholders(input.workflows);
  const results: CapturedWorkflow[] = [];
  for (const workflow of input.workflows) {
    results.push(await runOneWorkflow({ ...input, workflow }));
  }
  return results;
}

/** Refuse to run the untouched `diffwitness init` example before anything executes. */
function assertNoTemplatePlaceholders(workflows: readonly Workflow[]): void {
  const placeholder = workflows.find((w) => w.command.includes(TEMPLATE_PLACEHOLDER_ARG));
  if (placeholder !== undefined) {
    throw new DiffWitnessError(
      "config",
      `Workflow ${placeholder.id} still uses the template command (${placeholder.command.join(" ")}). ` +
        "Edit .diffwitness/config.yaml so each workflow runs a real command, then run the command again.",
      { exitClass: "user_error", details: { code: "template_placeholder", workflowId: placeholder.id } },
    );
  }
}

function spawnFailedMessage(workflow: Workflow, errorMessage: string | undefined): string {
  const program = workflow.command[0] ?? "";
  if (errorMessage !== undefined && /\bENOENT\b/.test(errorMessage)) {
    return (
      `Workflow ${workflow.id}: could not start \`${program}\` (command not found). ` +
      "Install it or put it on PATH, or fix workflows[].command in .diffwitness/config.yaml."
    );
  }
  if (errorMessage !== undefined && /\bEACCES\b/.test(errorMessage)) {
    return `Workflow ${workflow.id}: \`${program}\` is not executable (permission denied). Fix workflows[].command in .diffwitness/config.yaml.`;
  }
  return `Workflow ${workflow.id}: failed to start \`${program}\`${errorMessage !== undefined ? ` (${errorMessage})` : ""}.`;
}

async function runOneWorkflow(
  args: CaptureWorkflowsInput & { workflow: Workflow },
): Promise<CapturedWorkflow> {
  const { workflow, config, repoRoot } = args;
  const cwd = resolveWorkflowCwd(repoRoot, workflow.cwd);
  const env = buildProcessEnv(config.execution.envPolicy, workflow.env);
  const entry = config.workflows.find((w) => w.id === workflow.id);
  const stdoutLimit = entry?.maxStdoutBytes ?? config.execution.maxStdoutBytes;
  const stderrLimit = entry?.maxStderrBytes ?? config.execution.maxStderrBytes;

  const result = await args.executor.execute({
    argv: workflow.command,
    cwd,
    env,
    timeoutMs: workflow.timeoutMs,
    maxStdoutBytes: stdoutLimit,
    maxStderrBytes: stderrLimit,
  });

  if (result.outcome === "interrupted") {
    if (result.interruptedBy !== undefined) {
      throw interruptedError(result.interruptedBy, `workflow ${workflow.id}`);
    }
    throw new DiffWitnessError(
      "execution",
      `Workflow ${workflow.id} was stopped by DiffWitness before completion — not recorded as Evidence`,
      { details: { workflowId: workflow.id, outcome: "interrupted" } },
    );
  }
  if (result.outcome === "signaled") {
    throw new DiffWitnessError(
      "execution",
      `Workflow ${workflow.id} was terminated by signal ${result.terminatingSignal ?? "unknown"} — not recorded as Evidence`,
      {
        details: {
          workflowId: workflow.id,
          outcome: "signaled",
          signal: result.terminatingSignal ?? null,
        },
      },
    );
  }
  if (result.outcome === "timed_out") {
    throw new DiffWitnessError(
      "execution",
      result.errorMessage ?? `Workflow ${workflow.id} timed out`,
      { details: { workflowId: workflow.id, outcome: "timed_out" } },
    );
  }
  if (result.outcome === "spawn_failed") {
    throw new DiffWitnessError("execution", spawnFailedMessage(workflow, result.errorMessage), {
      details: { workflowId: workflow.id, outcome: "spawn_failed" },
    });
  }

  const artifactPaths = resolveArtifactPaths(repoRoot, workflow.artifactGlobs);
  const artifactBytes: { path: string; bytes: Buffer }[] = [];
  for (const abs of artifactPaths) {
    const rel = path.relative(repoRoot, abs);
    if (!(await args.storage.exists(abs))) {
      const why =
        result.exitCode !== 0
          ? `the command exited with code ${result.exitCode} and did not produce it`
          : "the command exited 0 but did not produce it";
      throw new DiffWitnessError(
        "execution",
        `Workflow ${workflow.id}: expected artifact ${rel} is missing — ${why}. ` +
          "Check workflows[].command and artifactGlobs in .diffwitness/config.yaml.",
        { details: { workflowId: workflow.id, exitCode: result.exitCode, artifact: rel } },
      );
    }
    const bytes = await args.storage.readBytes(abs);
    artifactBytes.push({ path: rel.split(path.sep).join("/"), bytes });
  }

  return buildEvidenceFromCapture({
    workflow,
    git: args.gitIdentity,
    processResult: result,
    artifactBytes,
    clock: args.clock,
    ids: args.ids,
    normalizer: args.normalizer,
  });
}
