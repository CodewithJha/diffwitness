import path from "node:path";
import { DiffWitnessError } from "../../domain/errors.js";
import type { NormalizeSpec, Workflow } from "../../domain/types.js";
import {
  asEvidenceId,
  asExecutionId,
  asWorkflowId,
  type BehavioralObservation,
  type Evidence,
  type Execution,
  type GitIdentity,
  type WorkflowId,
} from "../../domain/types.js";
import type { Clock } from "../../ports/clock.js";
import type { IdGenerator } from "../../ports/id-generator.js";
import type { ProcessExecuteResult } from "../../ports/process-executor.js";
import type { DiffWitnessConfig } from "../config/schema.js";
import { digestUtf8 } from "./digest.js";
import type { Normalizer } from "./normalize.js";
import { NORMALIZER_VERSION } from "./normalize.js";

export interface CaptureContext {
  readonly workflow: Workflow;
  readonly git: GitIdentity;
  readonly processResult: ProcessExecuteResult;
  readonly artifactBytes: ReadonlyArray<{ path: string; bytes: Buffer }>;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly normalizer: Normalizer;
}

/**
 * Build Evidence from a completed process result (outcome === "exited").
 * Timeout / spawn_failed must not call this — they are analysis failures.
 * Non-zero exitCode is recorded as a factual observation — not auto analysis_error.
 */
export function buildEvidenceFromCapture(ctx: CaptureContext): {
  evidence: Evidence;
  execution: Execution;
  blobPayloads: ReadonlyArray<{ digest: string; bytes: Buffer }>;
} {
  if (ctx.processResult.outcome !== "exited") {
    throw new DiffWitnessError(
      "execution",
      `Cannot build Evidence for outcome=${ctx.processResult.outcome}`,
    );
  }
  if (ctx.processResult.exitCode === null) {
    throw new DiffWitnessError("execution", "Exited process missing exitCode");
  }

  const evidenceId = asEvidenceId(ctx.ids.next("ev"));
  const executionId = asExecutionId(ctx.ids.next("ex"));
  const capturedAt = ctx.clock.now().toISOString();
  const spec = ctx.workflow.normalize;

  const observations: BehavioralObservation[] = [];
  const blobPayloads: { digest: string; bytes: Buffer }[] = [];
  let redactionApplied = false;

  const exitDigest = digestUtf8(String(ctx.processResult.exitCode));
  observations.push({
    key: "exit_code",
    kind: "exit",
    valueDigest: exitDigest,
    rawPreview: String(ctx.processResult.exitCode),
  });

  observations.push({
    key: "stdout_truncated",
    kind: "structured",
    valueDigest: digestUtf8(String(ctx.processResult.stdoutTruncated)),
    rawPreview: String(ctx.processResult.stdoutTruncated),
  });
  observations.push({
    key: "stderr_truncated",
    kind: "structured",
    valueDigest: digestUtf8(String(ctx.processResult.stderrTruncated)),
    rawPreview: String(ctx.processResult.stderrTruncated),
  });
  observations.push({
    key: "normalizer_version",
    kind: "structured",
    valueDigest: digestUtf8(NORMALIZER_VERSION),
    rawPreview: NORMALIZER_VERSION,
  });

  const stdoutNorm = ctx.normalizer.apply(ctx.processResult.stdout, spec);
  redactionApplied = redactionApplied || stdoutNorm.redactionApplied;
  blobPayloads.push({ digest: stdoutNorm.rep.digest, bytes: stdoutNorm.bytes });
  observations.push({
    key: "stdout",
    kind: "stdout",
    valueDigest: stdoutNorm.rep.digest,
    normalized: stdoutNorm.rep,
  });

  const stderrNorm = ctx.normalizer.apply(ctx.processResult.stderr, spec);
  redactionApplied = redactionApplied || stderrNorm.redactionApplied;
  blobPayloads.push({ digest: stderrNorm.rep.digest, bytes: stderrNorm.bytes });
  observations.push({
    key: "stderr",
    kind: "stderr",
    valueDigest: stderrNorm.rep.digest,
    normalized: stderrNorm.rep,
  });

  const artifactRefs: { digest: string; path: string; kind?: string }[] = [];
  for (const artifact of ctx.artifactBytes) {
    const artNorm = ctx.normalizer.apply(artifact.bytes, artifactNormalizeSpec(spec));
    redactionApplied = redactionApplied || artNorm.redactionApplied;
    blobPayloads.push({ digest: artNorm.rep.digest, bytes: artNorm.bytes });
    artifactRefs.push({
      digest: artNorm.rep.digest,
      path: artifact.path,
      kind: "file",
    });
    observations.push({
      key: `artifact:${artifact.path}`,
      kind: "artifact",
      valueDigest: artNorm.rep.digest,
      normalized: artNorm.rep,
    });
  }

  const evidence: Evidence = {
    id: evidenceId,
    workflowId: ctx.workflow.id,
    capturedAt,
    git: ctx.git,
    exitCode: ctx.processResult.exitCode,
    durationMs: ctx.processResult.durationMs,
    stdoutRef: { digest: stdoutNorm.rep.digest },
    stderrRef: { digest: stderrNorm.rep.digest },
    artifactRefs,
    observations,
    redactionApplied,
  };

  const execution: Execution = {
    id: executionId,
    workflowId: ctx.workflow.id,
    startedAt: new Date(ctx.clock.now().getTime() - ctx.processResult.durationMs).toISOString(),
    finishedAt: capturedAt,
    exitCode: ctx.processResult.exitCode,
    durationMs: ctx.processResult.durationMs,
    evidenceId,
  };

  return { evidence, execution, blobPayloads };
}

function artifactNormalizeSpec(spec: NormalizeSpec | undefined): NormalizeSpec | undefined {
  // Artifacts: still strip ANSI / line rules when configured; digests remain factual.
  return spec;
}

export function workflowFromConfigEntry(entry: DiffWitnessConfig["workflows"][number]): Workflow {
  return {
    id: asWorkflowId(entry.id),
    name: entry.name ?? entry.id,
    command: entry.command,
    ...(entry.cwd !== undefined ? { cwd: entry.cwd } : {}),
    timeoutMs: entry.timeoutMs,
    ...(entry.env !== undefined ? { env: entry.env } : {}),
    ...(entry.artifactGlobs !== undefined ? { artifactGlobs: entry.artifactGlobs } : {}),
    ...(entry.normalize !== undefined ? { normalize: toNormalizeSpec(entry.normalize) } : {}),
  };
}

function toNormalizeSpec(raw: NonNullable<DiffWitnessConfig["workflows"][number]["normalize"]>): NormalizeSpec {
  return {
    ...(raw.stripAnsi !== undefined ? { stripAnsi: raw.stripAnsi } : {}),
    ...(raw.redactEnv !== undefined ? { redactEnv: raw.redactEnv } : {}),
    ...(raw.stableSortLines !== undefined ? { stableSortLines: raw.stableSortLines } : {}),
    ...(raw.ignoreLinePatterns !== undefined ? { ignoreLinePatterns: raw.ignoreLinePatterns } : {}),
    ...(raw.maxBytes !== undefined ? { maxBytes: raw.maxBytes } : {}),
  };
}

export function selectWorkflows(
  workflows: Workflow[],
  filterIds: readonly string[] | undefined,
): Workflow[] {
  if (filterIds === undefined || filterIds.length === 0) {
    return workflows;
  }
  const set = new Set(filterIds);
  const selected = workflows.filter((w) => set.has(w.id));
  const missing = filterIds.filter((id) => !workflows.some((w) => w.id === id));
  if (missing.length > 0) {
    throw new DiffWitnessError("config", `Unknown workflow id(s): ${missing.join(", ")}`, {
      exitClass: "user_error",
    });
  }
  if (selected.length === 0) {
    throw new DiffWitnessError("config", "No workflows selected", { exitClass: "user_error" });
  }
  return selected;
}

export function resolveArtifactPaths(
  repoRoot: string,
  globs: readonly string[] | undefined,
): string[] {
  if (globs === undefined || globs.length === 0) {
    return [];
  }
  // M1: only exact relative paths (no recursive glob expansion). Fail closed on `**`.
  const paths: string[] = [];
  for (const pattern of globs) {
    if (pattern.includes("*") || pattern.includes("?")) {
      throw new DiffWitnessError(
        "config",
        `M1 artifact paths must be exact relative paths (no globs yet): ${pattern}`,
        { exitClass: "user_error" },
      );
    }
    const resolved = path.resolve(repoRoot, pattern);
    const rootWithSep = repoRoot.endsWith(path.sep) ? repoRoot : `${repoRoot}${path.sep}`;
    if (!resolved.startsWith(rootWithSep) && resolved !== repoRoot) {
      throw new DiffWitnessError("config", `Artifact path escapes repo: ${pattern}`, {
        exitClass: "user_error",
      });
    }
    paths.push(resolved);
  }
  return paths;
}

export function envFingerprintForWorkflows(workflows: readonly Workflow[]): string {
  // Config-derived only — no host paths, timestamps, or random values.
  const payload = workflows.map((w) => ({
    id: w.id as string,
    command: [...w.command],
    timeoutMs: w.timeoutMs,
    cwd: w.cwd ?? ".",
    env: w.env ?? {},
  }));
  return digestUtf8(JSON.stringify(payload));
}

export type { WorkflowId };
