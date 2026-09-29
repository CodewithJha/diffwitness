import path from "node:path";
import { EXIT_CODES, DiffWitnessError } from "../domain/errors.js";
import {
  assertExplanationCitationsInPacket,
  parseEvidencePacket,
  parseExplanation,
} from "../domain/schemas.js";
import type {
  AssumptionRef,
  BehavioralDiff,
  Evidence,
  EvidencePacket,
  Explanation,
  PacketBudgets,
} from "../domain/types.js";
import { validateExplanationSemantics } from "../domain/validate-explanation-semantics.js";
import { configPathForRepo, loadConfig } from "../infrastructure/config/load.js";
import type { DiffWitnessConfig } from "../infrastructure/config/schema.js";
import { EvidenceStore } from "../infrastructure/evidence/evidence-store.js";
import { selectAiProvider } from "../infrastructure/ai/select-provider.js";
import { assertProviderIsExplainOnly } from "../infrastructure/ai/mock-ai-provider.js";
import type { FeatherlessConfigInput } from "../infrastructure/ai/featherless-ai-provider.js";
import {
  DEFAULT_FEATHERLESS_BASE_URL,
  DEFAULT_FEATHERLESS_MAX_RESPONSE_BYTES,
  DEFAULT_FEATHERLESS_TIMEOUT_MS,
} from "../infrastructure/ai/featherless/http-client.js";
import { EXPLAIN_PROMPT_VERSION } from "../infrastructure/ai/prompts/explain.v2.js";
import type { AiProvider } from "../ports/ai-provider.js";
import type { GitPort } from "../ports/git.js";
import type { StoragePort } from "../ports/storage.js";
import { buildExplanationPacket } from "./build-explanation-packet.js";
import { formatChangeSurfaceHuman } from "./format-change-surface.js";
import { redactExplanationPacket } from "./redact-packet.js";

export interface RunExplainInput {
  readonly cwd: string;
  readonly repoPath?: string;
  readonly configPath?: string;
  /** Override config ai.provider */
  readonly provider?: "mock" | "featherless" | "none";
  readonly runId?: string;
}

export interface RunExplainDeps {
  readonly storage: StoragePort;
  readonly git: GitPort;
  /** Injectable for tests — must still be explain-only. */
  readonly aiProvider?: AiProvider;
}

export type ExplanationStatus = "ok" | "unavailable" | "error" | "skipped";

export interface ExplainMetadata {
  readonly provider: string | null;
  readonly model: string | null;
  readonly promptVersion: string | null;
  readonly explanationStatus: ExplanationStatus;
}

export interface RunExplainResult {
  readonly repoRoot: string;
  readonly behavioralDiff: BehavioralDiff;
  readonly packet: EvidencePacket | null;
  readonly explanation: Explanation | null;
  readonly explanationUnavailableReason: string | null;
  readonly explainError: string | null;
  readonly exitCode: number;
  readonly metadata: ExplainMetadata;
}

/**
 * `diffwitness explain` — load last BehavioralDiff, build/redact packet, call AiProvider.explain.
 * Never mutates DiffEngine status. Provider never receives repo/git/storage/executor.
 */
export async function runExplain(
  deps: RunExplainDeps,
  input: RunExplainInput,
): Promise<RunExplainResult> {
  const start = path.resolve(input.repoPath ?? input.cwd);
  const repoRoot = await deps.git.resolveRoot(start);

  const configFile = configPathForRepo(repoRoot, input.configPath);
  const config = await loadConfig(deps.storage, configFile);

  const store = new EvidenceStore(deps.storage, repoRoot);
  const diff = await loadBehavioralDiff(store, input.runId);
  if (diff === null) {
    throw new DiffWitnessError(
      "storage",
      "No BehavioralDiff found — run `diffwitness check` first",
      { exitClass: "user_error", details: { code: "check_missing" } },
    );
  }
  await assertDiffMatchesActiveBaseline(store, diff);

  // analysis_error: do not narrate as ordinary findings; still may produce refuse explanation.
  // clean: no fabricated "why it broke" — honest empty explain.
  // findings: full packet → provider path.

  const providerName = input.provider ?? config.ai.provider;
  const modelId = resolveModelId(config);
  const featherless = resolveFeatherlessConfig(config);

  if (deps.aiProvider === undefined) {
    const selected = selectAiProvider({
      provider: providerName,
      ...(modelId !== undefined ? { modelId } : {}),
      featherless,
    });
    if (selected.kind === "none") {
      return {
        repoRoot,
        behavioralDiff: diff,
        packet: null,
        explanation: null,
        explanationUnavailableReason: selected.reason,
        explainError: null,
        exitCode: EXIT_CODES.success,
        metadata: {
          provider: "none",
          model: modelId ?? null,
          promptVersion: null,
          explanationStatus: "skipped",
        },
      };
    }
    if (selected.kind === "unavailable") {
      return {
        repoRoot,
        behavioralDiff: diff,
        packet: null,
        explanation: null,
        explanationUnavailableReason: null,
        explainError: selected.reason,
        exitCode: EXIT_CODES.explain_error,
        metadata: {
          provider: providerName,
          model: modelId ?? null,
          promptVersion: null,
          explanationStatus: "error",
        },
      };
    }
    return explainWithProvider(deps, {
      repoRoot,
      diff,
      store,
      configAssumptions: config.assumptions,
      budgets: budgetsFromConfig(config.ai),
      provider: selected.provider,
      ...(modelId !== undefined ? { modelId } : {}),
    });
  }

  assertProviderIsExplainOnly(deps.aiProvider);
  return explainWithProvider(deps, {
    repoRoot,
    diff,
    store,
    configAssumptions: config.assumptions,
    budgets: budgetsFromConfig(config.ai),
    provider: deps.aiProvider,
    ...(modelId !== undefined ? { modelId } : {}),
  });
}

async function explainWithProvider(
  deps: RunExplainDeps,
  args: {
    readonly repoRoot: string;
    readonly diff: BehavioralDiff;
    readonly store: EvidenceStore;
    readonly configAssumptions: readonly AssumptionRef[];
    readonly budgets: PacketBudgets;
    readonly provider: AiProvider;
    readonly modelId?: string;
  },
): Promise<RunExplainResult> {
  assertProviderIsExplainOnly(args.provider);

  const evidence = await loadEvidenceForDiff(args.store, args.diff);

  let packet: EvidencePacket;
  try {
    packet = buildExplanationPacket({
      diff: args.diff,
      evidence,
      assumptions: args.configAssumptions,
      budgets: args.budgets,
    });
    packet = redactExplanationPacket(packet);
    packet = parseEvidencePacket(packet);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      repoRoot: args.repoRoot,
      behavioralDiff: args.diff,
      packet: null,
      explanation: null,
      explanationUnavailableReason: null,
      explainError: message,
      exitCode: EXIT_CODES.explain_error,
      metadata: {
        provider: args.provider.name,
        model: args.modelId ?? null,
        promptVersion: null,
        explanationStatus: "error",
      },
    };
  }

  try {
    // Boundary: only the redacted packet crosses into the provider.
    const raw = await args.provider.explain(packet, {
      ...(args.modelId !== undefined ? { modelId: args.modelId } : {}),
    });
    const explanation = parseExplanation(raw);
    assertExplanationCitationsInPacket(explanation, packet);
    validateExplanationSemantics(explanation, packet);
    return {
      repoRoot: args.repoRoot,
      behavioralDiff: args.diff,
      packet,
      explanation,
      explanationUnavailableReason: null,
      explainError: null,
      exitCode: EXIT_CODES.success,
      metadata: {
        provider: explanation.provider,
        model: explanation.modelId ?? args.modelId ?? null,
        promptVersion: explanation.promptVersion,
        explanationStatus: "ok",
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      repoRoot: args.repoRoot,
      behavioralDiff: args.diff,
      packet,
      explanation: null,
      explanationUnavailableReason: null,
      explainError: message,
      exitCode: EXIT_CODES.explain_error,
      metadata: {
        provider: args.provider.name,
        model: args.modelId ?? null,
        promptVersion: EXPLAIN_PROMPT_VERSION,
        explanationStatus: "error",
      },
    };
  }
}

async function loadBehavioralDiff(
  store: EvidenceStore,
  runId: string | undefined,
): Promise<BehavioralDiff | null> {
  if (runId === undefined) {
    return store.getLastBehavioralDiff();
  }
  return store.getBehavioralDiffById(runId);
}

/** A BehavioralDiff computed against a superseded (or missing) baseline is stale — never explain it. */
async function assertDiffMatchesActiveBaseline(
  store: EvidenceStore,
  diff: BehavioralDiff,
): Promise<void> {
  const activeId = await store.getActiveBaselineId();
  if (activeId === diff.baselineId) {
    return;
  }
  throw new DiffWitnessError(
    "storage",
    `BehavioralDiff ${diff.id} was computed against baseline ${diff.baselineId}, but the active baseline is ${activeId ?? "(none)"} — stale result; re-run \`diffwitness check\` (code: check_stale)`,
    {
      exitClass: "user_error",
      details: {
        code: "check_stale",
        behavioralDiffId: diff.id,
        diffBaselineId: diff.baselineId,
        activeBaselineId: activeId,
      },
    },
  );
}

async function loadEvidenceForDiff(
  store: EvidenceStore,
  diff: BehavioralDiff,
): Promise<Evidence[]> {
  const ids = new Set<string>([
    ...diff.baselineEvidenceIds,
    ...diff.currentEvidenceIds,
  ]);
  const out: Evidence[] = [];
  for (const id of ids) {
    try {
      out.push(await store.getEvidence(id));
    } catch {
      // Excerpts may be missing; findings still carry evidenceIds for citation.
    }
  }
  return out;
}

function budgetsFromConfig(ai: {
  maxChars: number;
  maxFindings: number;
  maxExcerpts: number;
  maxExcerptChars: number;
  maxPaths: number;
}): PacketBudgets {
  return {
    maxChars: ai.maxChars,
    maxFindings: ai.maxFindings,
    maxExcerpts: ai.maxExcerpts,
    maxExcerptChars: ai.maxExcerptChars,
    maxPaths: ai.maxPaths,
  };
}

export function formatExplainHuman(result: RunExplainResult): string {
  const lines: string[] = [];
  const diff = result.behavioralDiff;

  lines.push(`BehavioralDiff: ${diff.status} (${diff.id})`);
  if (diff.findings.length > 0) {
    lines.push(`Findings (${diff.findings.length}):`);
    for (const f of diff.findings) {
      lines.push(
        `  - [${f.severity}] ${f.workflowId} ${f.observationKey}: ${f.summary} (evidence ${f.evidenceIds.join(", ")})`,
      );
    }
  } else if (diff.status === "clean") {
    lines.push("No behavioral findings.");
  } else if (diff.status === "analysis_error") {
    lines.push("Analysis error — findings are not a trustworthy behavioral bill of health.");
  }
  if (diff.changeSurface !== undefined) {
    lines.push(...formatChangeSurfaceHuman(diff.changeSurface, diff.findings));
  }

  if (result.explanationUnavailableReason !== null) {
    lines.push("");
    lines.push(`Explanation: unavailable (${result.explanationUnavailableReason})`);
    return lines.join("\n");
  }

  if (result.explainError !== null) {
    lines.push("");
    lines.push(`Explanation: error — ${result.explainError}`);
    lines.push("Findings above remain authoritative; DiffEngine status unchanged.");
    return lines.join("\n");
  }

  const explanation = result.explanation;
  if (explanation === null) {
    lines.push("");
    lines.push("Explanation: (none)");
    return lines.join("\n");
  }

  lines.push("");
  lines.push(`Explanation (${explanation.provider}; ${explanation.promptVersion}):`);
  lines.push(explanation.narrative);
  if (explanation.hypotheses.length > 0) {
    lines.push("");
    lines.push("Hypotheses (not facts):");
    for (const h of explanation.hypotheses) {
      lines.push(`  - [${h.confidence}] ${h.claim}`);
    }
  }
  if (explanation.caveats.length > 0) {
    lines.push("");
    lines.push("Caveats:");
    for (const c of explanation.caveats) {
      lines.push(`  - ${c}`);
    }
  }
  return lines.join("\n");
}

/** v2 (M6): packet is EvidencePacket.v2; behavioralDiff may carry changeSurface. */
export const EXPLAIN_JSON_SCHEMA_VERSION = 2 as const;

export function formatExplainJson(result: RunExplainResult): string {
  return `${JSON.stringify(
    {
      schemaVersion: EXPLAIN_JSON_SCHEMA_VERSION,
      command: "explain",
      status: result.behavioralDiff.status,
      behavioralDiff: result.behavioralDiff,
      explanation: result.explanation,
      packet: result.packet,
      explanationUnavailableReason: result.explanationUnavailableReason,
      explainError: result.explainError,
      metadata: result.metadata,
      repoRoot: result.repoRoot,
    },
    null,
    2,
  )}\n`;
}

/** Resolve Featherless adapter config from DiffWitness config (defaults filled; no secrets). */
export function resolveFeatherlessConfig(config: DiffWitnessConfig): FeatherlessConfigInput {
  const fl = config.ai.featherless;
  const model = fl?.model ?? config.ai.model ?? "";
  return {
    apiKeyEnv: fl?.apiKeyEnv ?? "FEATHERLESS_API_KEY",
    baseUrl: fl?.baseUrl ?? DEFAULT_FEATHERLESS_BASE_URL,
    model,
    timeoutMs: fl?.timeoutMs ?? DEFAULT_FEATHERLESS_TIMEOUT_MS,
    maxResponseBytes: fl?.maxResponseBytes ?? DEFAULT_FEATHERLESS_MAX_RESPONSE_BYTES,
    preferJsonObjectFormat: fl?.preferJsonObjectFormat ?? true,
    ...(fl?.httpReferer !== undefined ? { httpReferer: fl.httpReferer } : {}),
    ...(fl?.xTitle !== undefined ? { xTitle: fl.xTitle } : {}),
  };
}

function resolveModelId(config: DiffWitnessConfig): string | undefined {
  if (config.ai.provider === "featherless") {
    const fromFl = config.ai.featherless?.model;
    if (fromFl !== undefined && fromFl.trim().length > 0) {
      return fromFl;
    }
  }
  return config.ai.model;
}
