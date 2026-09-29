import path from "node:path";
import { CAUSALITY_NOT_ESTABLISHED, type Causality } from "../domain/change-surface.js";
import { EXIT_CODES, DiffWitnessError } from "../domain/errors.js";
import type {
  AnalysisResult,
  Baseline,
  BehavioralDiff,
  Evidence,
  Explanation,
  Finding,
  GitIdentity,
} from "../domain/types.js";
import { EvidenceStore } from "../infrastructure/evidence/evidence-store.js";
import type { AiProvider } from "../ports/ai-provider.js";
import type { Clock } from "../ports/clock.js";
import { SystemClock } from "../ports/clock.js";
import type { GitPort } from "../ports/git.js";
import type { ProcessExecutor } from "../ports/process-executor.js";
import type { StoragePort } from "../ports/storage.js";
import {
  isSourceDirty,
  sourceDirtyFiles,
  type DirtyPolicy,
} from "./dirty-policy.js";
import {
  exitCodeForCheck,
  runCheck,
  type FailOnSeverity,
  type RunCheckDeps,
  type RunCheckResult,
} from "./run-check.js";
import { runExplain } from "./run-explain.js";
import { assertNotInterrupted } from "./interruption-guard.js";
import { formatChangeSurfaceHuman } from "./format-change-surface.js";

/**
 * CI JSON contract schema version (machine-readable).
 * v2 (M6): behavioralDiff.changeSurface, per-finding associationStatus / changeSurfaceRefs,
 * limitations.causality. Exit semantics unchanged from v1.
 */
export const CI_REPORT_SCHEMA_VERSION = 2 as const;

export interface RunCiInput {
  readonly cwd: string;
  readonly repoPath?: string;
  readonly configPath?: string;
  readonly workflowIds?: readonly string[];
  readonly baseRef?: string;
  /** Default for CI: `error`. */
  readonly failOn?: FailOnSeverity;
  /** Default for CI: refuse source-dirty trees. */
  readonly allowDirty?: boolean;
  /** Optional explain after check — AI off by default. */
  readonly explain?: boolean;
  readonly explainProvider?: "mock" | "featherless" | "none";
}

export interface RunCiDeps extends RunCheckDeps {
  readonly aiProvider?: AiProvider;
}

export interface CiBaselineRef {
  readonly id: string;
  readonly model: "local-active";
  readonly git: GitIdentity;
  readonly createdAt: string;
  readonly evidenceIds: readonly string[];
}

export interface CiCurrentRef {
  readonly git: GitIdentity;
  readonly evidenceIds: readonly string[];
}

export interface CiEvidenceRef {
  readonly evidenceId: string;
  readonly workflowId: string;
  readonly role: "baseline" | "current";
}

export interface CiReport {
  readonly schemaVersion: typeof CI_REPORT_SCHEMA_VERSION;
  readonly command: "ci";
  readonly status: AnalysisResult["status"];
  readonly baseline: CiBaselineRef | null;
  readonly current: CiCurrentRef | null;
  readonly behavioralDiff: BehavioralDiff | null;
  readonly findings: readonly Finding[];
  readonly evidenceRefs: readonly CiEvidenceRef[];
  readonly ai: {
    readonly enabled: boolean;
    readonly status: "disabled" | "ok" | "unavailable" | "error";
    readonly note: string;
    readonly provider: string | null;
    readonly model: string | null;
    readonly promptVersion: string | null;
  };
  readonly limitations: {
    readonly baselineModel: "local-active";
    readonly note: string;
    readonly causality: Causality;
    readonly changeSurfaceNote: string;
  };
  readonly metadata: {
    readonly generatedAt: { readonly value: string; readonly volatile: true };
    readonly repoRoot: string;
    readonly failOn: FailOnSeverity;
    readonly dirtyPolicy: DirtyPolicy;
    readonly sourceDirtyFiles: readonly string[];
    readonly message: string | null;
    readonly errorCategory: string | null;
  };
  readonly explanation: Explanation | null;
}

export interface RunCiResult {
  readonly report: CiReport;
  readonly check: RunCheckResult;
  readonly exitCode: number;
  readonly explainError: string | null;
}

/**
 * `diffwitness ci` — non-interactive check with CI defaults.
 *
 * - AI disabled by default (never decides status)
 * - Baseline model: local active baseline only (no PR / merge-base inference)
 * - Dirty policy: refuse source-dirty unless `--allow-dirty`
 * - Exit codes: 0 acceptable; 1 findings≥fail-on; 2 user/config; 3 analysis; 4 explain failure
 *   (precedence 3 > 1 > 4 > 0 — see `ciExitCode`)
 */
export async function runCi(deps: RunCiDeps, input: RunCiInput): Promise<RunCiResult> {
  const clock = deps.clock ?? new SystemClock();
  const failOn: FailOnSeverity = input.failOn ?? "error";
  const dirtyPolicy: DirtyPolicy =
    input.allowDirty === true ? "allow" : "refuse_source_dirty";

  const start = path.resolve(input.repoPath ?? input.cwd);
  const repoRoot = await deps.git.resolveRoot(start);

  // Preflight: identifiable active baseline must exist (never treat missing as clean).
  const store = new EvidenceStore(deps.storage, repoRoot);
  await store.invalidateLastBehavioralDiff("ci started");
  const activeId = await store.getActiveBaselineId();
  if (activeId === null) {
    throw new DiffWitnessError(
      "storage",
      "No active baseline — run `diffwitness baseline` first (CI cannot invent a clean result)",
      {
        exitClass: "user_error",
        details: { code: "baseline_missing", baselineModel: "local-active" },
      },
    );
  }

  let baseline: Baseline;
  try {
    baseline = await store.getBaseline(activeId);
  } catch (cause) {
    if (cause instanceof DiffWitnessError) {
      throw cause;
    }
    throw new DiffWitnessError(
      "analysis",
      `Failed to load identifiable baseline ${activeId}`,
      { cause, details: { code: "malformed_baseline" } },
    );
  }

  const changedFiles = await deps.git.listWorkingTreeChanges(repoRoot);
  const dirtySourceFiles = sourceDirtyFiles(changedFiles);

  if (dirtyPolicy === "refuse_source_dirty" && isSourceDirty(changedFiles)) {
    throw new DiffWitnessError(
      "repo",
      `CI requires a source-clean working tree (excluding DiffWitness operational .diffwitness/ artifacts). Source-dirty paths: ${dirtySourceFiles.join(", ")}. Pass --allow-dirty to override.`,
      {
        exitClass: "user_error",
        details: {
          code: "source_dirty",
          sourceDirtyFiles: dirtySourceFiles,
        },
      },
    );
  }

  const check = await runCheck(
    {
      storage: deps.storage,
      git: deps.git,
      executor: deps.executor,
      ...(deps.clock !== undefined ? { clock: deps.clock } : {}),
      ...(deps.ids !== undefined ? { ids: deps.ids } : {}),
      ...(deps.normalizer !== undefined ? { normalizer: deps.normalizer } : {}),
      ...(deps.interruption !== undefined ? { interruption: deps.interruption } : {}),
    },
    {
      cwd: input.cwd,
      ...(input.repoPath !== undefined ? { repoPath: input.repoPath } : {}),
      ...(input.configPath !== undefined ? { configPath: input.configPath } : {}),
      ...(input.workflowIds !== undefined ? { workflowIds: input.workflowIds } : {}),
      ...(input.baseRef !== undefined ? { baseRef: input.baseRef } : {}),
      failOn,
      // Dirty already enforced above for CI; allow local check path through.
      allowDirty: true,
    },
  );

  let explanation: Explanation | null = null;
  let explainError: string | null = null;
  let aiStatus: CiReport["ai"]["status"] = "disabled";
  let aiProvider: string | null = null;
  let aiModel: string | null = null;
  let aiPromptVersion: string | null = null;
  const aiEnabled = input.explain === true;

  if (aiEnabled) {
    assertNotInterrupted(deps.interruption, "ci explain");
    try {
      const explainResult = await runExplain(
        {
          storage: deps.storage,
          git: deps.git,
          ...(deps.aiProvider !== undefined ? { aiProvider: deps.aiProvider } : {}),
        },
        {
          cwd: input.cwd,
          ...(input.repoPath !== undefined ? { repoPath: input.repoPath } : {}),
          ...(input.configPath !== undefined ? { configPath: input.configPath } : {}),
          ...(input.explainProvider !== undefined
            ? { provider: input.explainProvider }
            : { provider: "mock" }),
        },
      );
      explanation = explainResult.explanation;
      explainError = explainResult.explainError;
      aiProvider = explainResult.metadata.provider;
      aiModel = explainResult.metadata.model;
      aiPromptVersion = explainResult.metadata.promptVersion;
      if (explainResult.exitCode === EXIT_CODES.explain_error) {
        aiStatus = "error";
      } else if (explanation === null) {
        aiStatus = "unavailable";
      } else {
        aiStatus = "ok";
      }
    } catch (error) {
      // Explain failure must never collapse to clean.
      explanation = null;
      explainError = error instanceof Error ? error.message : String(error);
      aiStatus = "error";
    }
  }

  const report = buildCiReport({
    check,
    baseline,
    failOn,
    dirtyPolicy,
    sourceDirtyFiles: dirtySourceFiles,
    clock,
    explanation,
    aiEnabled,
    aiStatus,
    explainError,
    aiProvider,
    aiModel,
    aiPromptVersion,
  });

  return {
    report,
    check,
    exitCode: ciExitCode(exitCodeForCheck(check.analysis, failOn), aiStatus === "error"),
    explainError,
  };
}

/**
 * CI exit precedence: 3 (analysis error) > 1 (findings ≥ fail-on) > 4 (explain failure) > 0.
 * An explain failure never masks an analysis error or a gating finding.
 */
export function ciExitCode(checkExitCode: number, explainFailed: boolean): number {
  if (checkExitCode !== EXIT_CODES.success) {
    return checkExitCode;
  }
  return explainFailed ? EXIT_CODES.explain_error : EXIT_CODES.success;
}

function buildCiReport(args: {
  check: RunCheckResult;
  baseline: Baseline;
  failOn: FailOnSeverity;
  dirtyPolicy: DirtyPolicy;
  sourceDirtyFiles: readonly string[];
  clock: Clock;
  explanation: Explanation | null;
  aiEnabled: boolean;
  aiStatus: CiReport["ai"]["status"];
  explainError: string | null;
  aiProvider: string | null;
  aiModel: string | null;
  aiPromptVersion: string | null;
}): CiReport {
  const { check, baseline } = args;
  const diff = check.behavioralDiff ?? null;
  const findings = sortFindings(diff?.findings ?? []);
  const evidenceRefs = buildEvidenceRefs(check.baselineEvidence, check.currentEvidence);
  const currentGit: GitIdentity =
    check.currentEvidence[0]?.git ??
    ({ dirty: false } satisfies GitIdentity);

  return {
    schemaVersion: CI_REPORT_SCHEMA_VERSION,
    command: "ci",
    status: check.analysis.status,
    baseline: {
      id: baseline.id,
      model: "local-active",
      git: baseline.git,
      createdAt: baseline.createdAt,
      evidenceIds: [...baseline.evidenceIds].sort((a, b) => a.localeCompare(b)),
    },
    current: {
      git: currentGit,
      evidenceIds: [...check.currentEvidence.map((e) => e.id)].sort((a, b) =>
        a.localeCompare(b),
      ),
    },
    behavioralDiff: diff,
    findings,
    evidenceRefs,
    ai: {
      enabled: args.aiEnabled,
      status: args.aiStatus,
      note: args.aiEnabled
        ? args.explainError ??
          "Optional explain ran; AI never decides analysis status."
        : "AI disabled by default in CI; DiffEngine status is authoritative.",
      provider: args.aiProvider,
      model: args.aiModel,
      promptVersion: args.aiPromptVersion,
    },
    limitations: {
      baselineModel: "local-active",
      note: "CI compares against the stored active baseline in .diffwitness/baselines/active.json. No PR base, merge-base, or remote branch inference.",
      causality: CAUSALITY_NOT_ESTABLISHED,
      changeSurfaceNote:
        "behavioralDiff.changeSurface lists Git changes between the baseline commit and the executed state. Association means co-occurrence, never causality; it never affects status or exit code.",
    },
    metadata: {
      generatedAt: {
        value: args.clock.now().toISOString(),
        volatile: true,
      },
      repoRoot: check.repoRoot,
      failOn: args.failOn,
      dirtyPolicy: args.dirtyPolicy,
      sourceDirtyFiles: [...args.sourceDirtyFiles],
      message: check.analysis.message ?? null,
      errorCategory: check.analysis.errorCategory ?? null,
    },
    explanation: args.explanation,
  };
}

function sortFindings(findings: readonly Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const byId = a.id.localeCompare(b.id);
    if (byId !== 0) return byId;
    const byWf = a.workflowId.localeCompare(b.workflowId);
    if (byWf !== 0) return byWf;
    return a.observationKey.localeCompare(b.observationKey);
  });
}

function buildEvidenceRefs(
  baselineEvidence: readonly Evidence[],
  currentEvidence: readonly Evidence[],
): CiEvidenceRef[] {
  const refs: CiEvidenceRef[] = [];
  for (const e of baselineEvidence) {
    refs.push({ evidenceId: e.id, workflowId: e.workflowId, role: "baseline" });
  }
  for (const e of currentEvidence) {
    refs.push({ evidenceId: e.id, workflowId: e.workflowId, role: "current" });
  }
  return refs.sort((a, b) => {
    const byRole = a.role.localeCompare(b.role);
    if (byRole !== 0) return byRole;
    const byWf = a.workflowId.localeCompare(b.workflowId);
    if (byWf !== 0) return byWf;
    return a.evidenceId.localeCompare(b.evidenceId);
  });
}

export function formatCiJson(result: RunCiResult): string {
  // Deterministic key order via explicit object construction above; stringify as-is.
  return `${JSON.stringify(result.report, null, 2)}\n`;
}

export function formatCiHuman(result: RunCiResult): string {
  const lines = [
    `ci ${result.report.status}`,
    `baseline: ${result.report.baseline?.id ?? "(none)"} (local-active)`,
    `fail-on: ${result.report.metadata.failOn}`,
    `findings: ${result.report.findings.length}`,
    `ai: ${result.report.ai.status}`,
  ];
  if (result.report.metadata.message) {
    lines.push(result.report.metadata.message);
  }
  const diff = result.report.behavioralDiff;
  if (diff?.changeSurface !== undefined) {
    lines.push(...formatChangeSurfaceHuman(diff.changeSurface, diff.findings));
  }
  return lines.join("\n");
}

/** Normalize CI JSON for golden / reproducibility tests (strip known volatiles only). */
export function normalizeCiReportForCompare(report: CiReport): unknown {
  const clone = structuredClone(report) as CiReport & {
    metadata: CiReport["metadata"] & {
      generatedAt?: { value: string; volatile: true };
    };
  };
  if (clone.metadata.generatedAt !== undefined) {
    clone.metadata.generatedAt = {
      value: "<volatile>",
      volatile: true,
    };
  }
  // Evidence / BehavioralDiff IDs may include capture-time UUIDs for current evidence.
  // Normalize only labeled volatile metadata here; callers may further strip evidence IDs.
  return clone;
}
