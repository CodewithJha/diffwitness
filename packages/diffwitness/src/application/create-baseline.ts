import path from "node:path";
import { DiffWitnessError } from "../domain/errors.js";
import {
  asBaselineId,
  type Baseline,
  type Evidence,
  type Execution,
} from "../domain/types.js";
import { configPathForRepo, loadConfig } from "../infrastructure/config/load.js";
import { DIFFWITNESS_DIR } from "../infrastructure/config/defaults.js";
import {
  envFingerprintForWorkflows,
  selectWorkflows,
  workflowFromConfigEntry,
} from "../infrastructure/evidence/build-evidence.js";
import { EvidenceStore } from "../infrastructure/evidence/evidence-store.js";
import { DeterministicNormalizer } from "../infrastructure/evidence/normalize.js";
import type { Clock } from "../ports/clock.js";
import { SystemClock } from "../ports/clock.js";
import type { GitPort } from "../ports/git.js";
import type { IdGenerator } from "../ports/id-generator.js";
import { UuidIdGenerator } from "../ports/id-generator.js";
import type { ProcessExecutor } from "../ports/process-executor.js";
import type { StoragePort } from "../ports/storage.js";
import type { Interruption } from "../ports/interruption.js";
import { captureWorkflows } from "./capture-workflows.js";
import { assertNotInterrupted } from "./interruption-guard.js";

export interface CreateBaselineInput {
  readonly cwd: string;
  readonly repoPath?: string;
  readonly configPath?: string;
  readonly workflowIds?: readonly string[];
  readonly force?: boolean;
}

export interface CreateBaselineDeps {
  readonly storage: StoragePort;
  readonly git: GitPort;
  readonly executor: ProcessExecutor;
  readonly clock?: Clock;
  readonly ids?: IdGenerator;
  readonly normalizer?: DeterministicNormalizer;
  /** When interrupted, nothing is persisted and the active baseline is left untouched. */
  readonly interruption?: Interruption;
}

export interface CreateBaselineResult {
  readonly repoRoot: string;
  readonly baseline: Baseline;
  readonly evidence: readonly Evidence[];
  readonly executions: readonly Execution[];
  readonly changedFiles: readonly string[];
}

/**
 * `diffwitness baseline` use case:
 * config → repo/git → workflow → execute → bound → normalize → digest → Evidence → Baseline → persist
 * No AI. No Findings / DiffEngine.
 */
export async function createBaseline(
  deps: CreateBaselineDeps,
  input: CreateBaselineInput,
): Promise<CreateBaselineResult> {
  const clock = deps.clock ?? new SystemClock();
  const ids = deps.ids ?? new UuidIdGenerator();
  const normalizer = deps.normalizer ?? new DeterministicNormalizer();

  const start = path.resolve(input.repoPath ?? input.cwd);
  const repoRoot = await deps.git.resolveRoot(start);

  const configFile = configPathForRepo(repoRoot, input.configPath);
  const config = await loadConfig(deps.storage, configFile);

  if (config.execution.allowCommands !== true) {
    throw new DiffWitnessError(
      "config",
      "execution.allowCommands is false — refusing to run workflows",
      { exitClass: "user_error" },
    );
  }

  if (config.workflows.length === 0) {
    throw new DiffWitnessError("config", "No workflows configured", {
      exitClass: "user_error",
    });
  }

  const workflows = selectWorkflows(
    config.workflows.map(workflowFromConfigEntry),
    input.workflowIds,
  );

  const gitIdentity = await deps.git.getIdentity(repoRoot, { baseRef: config.baseRef });
  const changedFiles = await deps.git.listChangedFiles(repoRoot, {
    baseRef: config.baseRef,
  });

  const store = new EvidenceStore(deps.storage, repoRoot);

  // Fail early on active baseline without --force (before executing workflows).
  const activeId = await store.getActiveBaselineId();
  if (activeId !== null && input.force !== true) {
    throw new DiffWitnessError(
      "storage",
      "Active baseline already exists (pass --force to supersede)",
      {
        exitClass: "user_error",
        details: { code: "baseline_exists", activeId },
      },
    );
  }

  await deps.storage.ensureDir(path.join(repoRoot, DIFFWITNESS_DIR, "evidence"));
  await deps.storage.ensureDir(path.join(repoRoot, DIFFWITNESS_DIR, "blobs"));
  await deps.storage.ensureDir(path.join(repoRoot, DIFFWITNESS_DIR, "baselines"));
  await deps.storage.ensureDir(path.join(repoRoot, DIFFWITNESS_DIR, "runs"));

  const captured = await captureWorkflows({
    repoRoot,
    config,
    workflows,
    gitIdentity,
    executor: deps.executor,
    storage: deps.storage,
    clock,
    ids,
    normalizer,
  });

  const evidenceList: Evidence[] = [];
  const executions: Execution[] = [];
  const guard = (): void => assertNotInterrupted(deps.interruption, "baseline persistence");

  for (const item of captured) {
    guard();
    for (const blob of item.blobPayloads) {
      await store.putBlob(blob.digest, blob.bytes);
    }
    await store.putEvidence(item.evidence);
    evidenceList.push(item.evidence);
    executions.push(item.execution);
  }

  const baseline: Baseline = {
    id: asBaselineId(ids.next("bl")),
    createdAt: clock.now().toISOString(),
    git: gitIdentity,
    envFingerprint: envFingerprintForWorkflows(workflows),
    workflowIds: workflows.map((w) => w.id),
    evidenceIds: evidenceList.map((e) => e.id),
  };

  await store.putBaseline(baseline, {
    force: input.force === true || activeId === null,
    beforeWrite: guard,
  });

  return {
    repoRoot,
    baseline,
    evidence: evidenceList,
    executions,
    changedFiles,
  };
}

export function formatBaselineHuman(result: CreateBaselineResult): string {
  const lines = [
    "Baseline captured.",
    `Repository:  ${result.repoRoot}`,
    `Baseline:    ${result.baseline.id}`,
    `HEAD:        ${result.baseline.git.headSha ?? "(unknown)"}`,
    `Dirty:       ${result.baseline.git.dirty}`,
    `Workflows:   ${result.baseline.workflowIds.join(", ")}`,
    `Evidence:    ${result.baseline.evidenceIds.join(", ")}`,
  ];
  for (const ev of result.evidence) {
    lines.push(
      `  - ${ev.workflowId}: exit=${ev.exitCode} durationMs=${ev.durationMs} observations=${ev.observations.length}`,
    );
  }
  return lines.join("\n");
}

export function formatBaselineJson(result: CreateBaselineResult): string {
  return `${JSON.stringify(
    {
      schemaVersion: 1,
      command: "baseline",
      status: "ok",
      repoRoot: result.repoRoot,
      baseline: result.baseline,
      evidenceIds: result.baseline.evidenceIds,
      changedFiles: result.changedFiles,
    },
    null,
    2,
  )}\n`;
}
