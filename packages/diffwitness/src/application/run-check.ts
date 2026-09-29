import path from "node:path";
import { associateChangeSurface } from "../domain/change-surface-association.js";
import { compareEvidence } from "../domain/diff-engine.js";
import { EXIT_CODES, DiffWitnessError } from "../domain/errors.js";
import type { AnalysisResult, BehavioralDiff, Evidence, Execution } from "../domain/types.js";
import { configPathForRepo, loadConfig } from "../infrastructure/config/load.js";
import { DIFFWITNESS_DIR } from "../infrastructure/config/defaults.js";
import {
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
import type { Interruption } from "../ports/interruption.js";
import type { StoragePort } from "../ports/storage.js";
import { captureChangeSurface, confirmExecutedState } from "./capture-change-surface.js";
import { captureWorkflows } from "./capture-workflows.js";
import { assertNotInterrupted } from "./interruption-guard.js";

export type FailOnSeverity = "warn" | "error" | "never";

export interface RunCheckInput {
  readonly cwd: string;
  readonly repoPath?: string;
  readonly configPath?: string;
  readonly workflowIds?: readonly string[];
  /** Optional Git base hint — does not dual-run; compare still uses active baseline Evidence. */
  readonly baseRef?: string;
  readonly failOn?: FailOnSeverity;
  readonly allowDirty?: boolean;
}

export interface RunCheckDeps {
  readonly storage: StoragePort;
  readonly git: GitPort;
  readonly executor: ProcessExecutor;
  readonly clock?: Clock;
  readonly ids?: IdGenerator;
  readonly normalizer?: DeterministicNormalizer;
  /** When interrupted, no Evidence or BehavioralDiff from this run is persisted. */
  readonly interruption?: Interruption;
}

export interface RunCheckResult {
  readonly repoRoot: string;
  readonly analysis: AnalysisResult;
  readonly behavioralDiff?: BehavioralDiff;
  readonly baselineId: string | null;
  readonly currentEvidence: readonly Evidence[];
  readonly baselineEvidence: readonly Evidence[];
  readonly executions: readonly Execution[];
  readonly activeBaselineSnapshot: string | null;
  readonly exitCode: number;
}

/**
 * `diffwitness check` use case:
 * active baseline (immutable) → capture current Evidence via M1 pipeline → DiffEngine → AnalysisResult.
 * Never mutates baseline. No AI.
 */
export async function runCheck(
  deps: RunCheckDeps,
  input: RunCheckInput,
): Promise<RunCheckResult> {
  const clock = deps.clock ?? new SystemClock();
  const ids = deps.ids ?? new UuidIdGenerator();
  const normalizer = deps.normalizer ?? new DeterministicNormalizer();
  const failOn: FailOnSeverity = input.failOn ?? "never";

  const start = path.resolve(input.repoPath ?? input.cwd);
  const repoRoot = await deps.git.resolveRoot(start);

  const store = new EvidenceStore(deps.storage, repoRoot);
  // Until this check persists its own BehavioralDiff, there is no current result to explain.
  await store.invalidateLastBehavioralDiff("check started");

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

  const baseRef = input.baseRef ?? config.baseRef;
  const gitIdentity = await deps.git.getIdentity(repoRoot, { baseRef });

  if (gitIdentity.dirty && input.allowDirty === false) {
    throw new DiffWitnessError("repo", "Working tree is dirty (pass --allow-dirty)", {
      exitClass: "user_error",
    });
  }

  const activeId = await store.getActiveBaselineId();
  if (activeId === null) {
    throw new DiffWitnessError(
      "storage",
      "No active baseline — run `diffwitness baseline` first",
      {
        exitClass: "user_error",
        details: { code: "baseline_missing" },
      },
    );
  }

  const activeBaselineSnapshot = await deps.storage.readText(store.activePath());
  const baseline = await store.getBaseline(activeId);

  const allBaselineEvidence: Evidence[] = [];
  for (const evidenceId of baseline.evidenceIds) {
    try {
      allBaselineEvidence.push(await store.getEvidence(evidenceId));
    } catch (cause) {
      throw new DiffWitnessError(
        "analysis",
        `Failed to load baseline evidence ${evidenceId}`,
        { cause, details: { code: "malformed_baseline_evidence" } },
      );
    }
  }
  const baselineEvidence = baselineEvidenceForSelection(
    allBaselineEvidence,
    workflows.map((w) => w.id),
    input.workflowIds,
  );

  await deps.storage.ensureDir(path.join(repoRoot, DIFFWITNESS_DIR, "evidence"));
  await deps.storage.ensureDir(path.join(repoRoot, DIFFWITNESS_DIR, "blobs"));
  await deps.storage.ensureDir(path.join(repoRoot, DIFFWITNESS_DIR, "runs"));

  const surfaceInput = { git: deps.git, repoRoot, baseline, current: gitIdentity };
  const surfaceBefore = await captureChangeSurface(surfaceInput);

  let captured;
  try {
    captured = await captureWorkflows({
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
  } catch (error) {
    if (error instanceof DiffWitnessError) {
      throw error;
    }
    throw new DiffWitnessError(
      "execution",
      error instanceof Error ? error.message : String(error),
      { cause: error },
    );
  }

  const guard = (): void => assertNotInterrupted(deps.interruption, "check persistence");
  const currentEvidence: Evidence[] = [];
  const executions: Execution[] = [];
  for (const item of captured) {
    guard();
    for (const blob of item.blobPayloads) {
      await store.putBlob(blob.digest, blob.bytes);
    }
    await store.putEvidence(item.evidence);
    currentEvidence.push(item.evidence);
    executions.push(item.execution);
  }

  // Baseline must remain immutable — verify active pointer unchanged.
  const activeAfter = await deps.storage.readText(store.activePath());
  if (activeAfter !== activeBaselineSnapshot) {
    throw new DiffWitnessError(
      "storage",
      "Active baseline mutated during check — refusing dishonest result",
    );
  }

  const surfaceAfter = await captureChangeSurface(surfaceInput);

  const assumptionIds = config.assumptions.map((a) => a.id);
  const outcome = compareEvidence({
    baselineId: baseline.id,
    baselineEvidence,
    currentEvidence,
    against: gitIdentity,
    assumptionIds,
  });
  // Association runs strictly after DiffEngine and cannot alter findings or status.
  const diff = associateChangeSurface(
    outcome.diff,
    confirmExecutedState(surfaceBefore, surfaceAfter),
  );

  await store.putBehavioralDiff(diff, { beforeWrite: guard });

  const analysis: AnalysisResult = outcome.ok
    ? {
        status: diff.status,
        behavioralDiff: diff,
      }
    : {
        status: "analysis_error",
        behavioralDiff: diff,
        message: outcome.message,
        errorCategory: outcome.errorCategory,
      };

  // Re-verify baseline immutability after persist.
  const activeFinal = await deps.storage.readText(store.activePath());
  if (activeFinal !== activeBaselineSnapshot) {
    throw new DiffWitnessError(
      "storage",
      "Active baseline mutated during check persist — refusing dishonest result",
    );
  }

  return {
    repoRoot,
    analysis,
    behavioralDiff: diff,
    baselineId: activeId,
    currentEvidence,
    baselineEvidence,
    executions,
    activeBaselineSnapshot,
    exitCode: exitCodeForCheck(analysis, failOn),
  };
}

/**
 * `--workflow` subset: compare only the selected workflows' baseline Evidence, so unselected
 * workflows are never reported as "disappeared". Without an explicit subset, all baseline
 * Evidence is compared (unchanged full-check semantics).
 */
export function baselineEvidenceForSelection(
  baselineEvidence: readonly Evidence[],
  selectedWorkflowIds: readonly string[],
  requestedWorkflowIds: readonly string[] | undefined,
): Evidence[] {
  if (requestedWorkflowIds === undefined || requestedWorkflowIds.length === 0) {
    return [...baselineEvidence];
  }
  const selected = new Set(selectedWorkflowIds);
  const inBaseline = new Set(baselineEvidence.map((e) => e.workflowId as string));
  const missing = selectedWorkflowIds.filter((id) => !inBaseline.has(id));
  if (missing.length > 0) {
    throw new DiffWitnessError(
      "config",
      `Workflow(s) not captured in the active baseline: ${missing.join(", ")} — run \`diffwitness baseline --force\` including them`,
      {
        exitClass: "user_error",
        details: { code: "workflow_not_in_baseline", workflowIds: missing },
      },
    );
  }
  return baselineEvidence.filter((e) => selected.has(e.workflowId as string));
}

export function exitCodeForCheck(
  analysis: AnalysisResult,
  failOn: FailOnSeverity,
): number {
  if (analysis.status === "analysis_error") {
    return EXIT_CODES.analysis_error;
  }
  if (analysis.status === "clean") {
    return EXIT_CODES.success;
  }
  // findings
  if (failOn === "never") {
    return EXIT_CODES.success;
  }
  const findings = analysis.behavioralDiff?.findings ?? [];
  const threshold = failOn === "error" ? "error" : "warn";
  const shouldFail = findings.some((f) => severityMeets(f.severity, threshold));
  return shouldFail ? EXIT_CODES.findings : EXIT_CODES.success;
}

function severityMeets(
  severity: "info" | "warn" | "error",
  threshold: "warn" | "error",
): boolean {
  const rank = { info: 0, warn: 1, error: 2 } as const;
  return rank[severity] >= rank[threshold];
}

export { formatCheckHuman } from "./format-check.js";

/** v2 (M6): behavioralDiff.changeSurface + per-finding associationStatus / changeSurfaceRefs. */
export const CHECK_JSON_SCHEMA_VERSION = 2 as const;

export function formatCheckJson(result: RunCheckResult): string {
  return `${JSON.stringify(
    {
      schemaVersion: CHECK_JSON_SCHEMA_VERSION,
      command: "check",
      status: result.analysis.status,
      behavioralDiff: result.behavioralDiff ?? null,
      explanation: null,
      message: result.analysis.message ?? null,
      errorCategory: result.analysis.errorCategory ?? null,
      repoRoot: result.repoRoot,
      baselineId: result.baselineId,
      currentEvidenceIds: result.currentEvidence.map((e) => e.id),
    },
    null,
    2,
  )}\n`;
}
