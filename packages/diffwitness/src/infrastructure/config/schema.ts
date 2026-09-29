import { z } from "zod";
import { DiffWitnessError } from "../../domain/errors.js";

const normalizeSpecSchema = z
  .object({
    stripAnsi: z.boolean().optional(),
    redactEnv: z.array(z.string()).optional(),
    stableSortLines: z.boolean().optional(),
    ignoreLinePatterns: z.array(z.string()).optional(),
    maxBytes: z.number().int().positive().optional(),
  })
  .strict();

const workflowSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).optional(),
    /** Argv only — never a shell string. */
    command: z.array(z.string().min(1)).min(1),
    cwd: z.string().optional(),
    timeoutMs: z.number().int().positive().default(60_000),
    env: z.record(z.string()).optional(),
    artifactGlobs: z.array(z.string()).optional(),
    normalize: normalizeSpecSchema.optional(),
    maxStdoutBytes: z.number().int().positive().optional(),
    maxStderrBytes: z.number().int().positive().optional(),
  })
  .strict();

const assumptionSchema = z
  .object({
    id: z.string().min(1),
    description: z.string().min(1),
  })
  .strict();

/**
 * Env policy for workflow processes:
 * - `none`: only workflow.env
 * - `path`: PATH (from host) + workflow.env (default — needed to find node/git tools)
 * - `all`: full process.env with workflow.env overrides (least deterministic)
 */
export const envPolicySchema = z.enum(["none", "path", "all"]);

export const diffWitnessConfigSchema = z
  .object({
    version: z.literal(1),
    baseRef: z.string().min(1).default("origin/main"),
    workflows: z.array(workflowSchema).default([]),
    assumptions: z.array(assumptionSchema).default([]),
    ai: z
      .object({
        provider: z.enum(["mock", "featherless", "none"]).default("mock"),
        model: z.string().optional(),
        /** Hard char budget for serialized ExplanationPacket (EvidencePacket.v1). */
        maxChars: z.number().int().positive().default(8_000),
        maxFindings: z.number().int().positive().default(20),
        maxExcerpts: z.number().int().positive().default(10),
        maxExcerptChars: z.number().int().positive().default(200),
        maxPaths: z.number().int().positive().default(40),
        /**
         * Featherless live provider (M5). Optional until provider=featherless.
         * Keys never live in config — only the env var *name*.
         */
        featherless: z
          .object({
            apiKeyEnv: z.string().min(1).default("FEATHERLESS_API_KEY"),
            baseUrl: z.string().url().default("https://api.featherless.ai/v1"),
            /** Model id; falls back to ai.model when omitted. */
            model: z.string().min(1).optional(),
            timeoutMs: z.number().int().positive().default(30_000),
            maxResponseBytes: z.number().int().positive().default(512_000),
            /** Prefer OpenAI-compat response_format json_object when supported. */
            preferJsonObjectFormat: z.boolean().default(true),
            httpReferer: z.string().url().optional(),
            xTitle: z.string().min(1).optional(),
          })
          .strict()
          .optional(),
      })
      .default({
        provider: "mock",
        maxChars: 8_000,
        maxFindings: 20,
        maxExcerpts: 10,
        maxExcerptChars: 200,
        maxPaths: 40,
      }),
    privacy: z
      .object({
        sendCodeBodies: z.boolean().default(false),
      })
      .default({ sendCodeBodies: false }),
    execution: z
      .object({
        allowCommands: z.boolean().default(true),
        maxConcurrent: z.number().int().positive().default(1),
        maxStdoutBytes: z.number().int().positive().default(1_048_576),
        maxStderrBytes: z.number().int().positive().default(1_048_576),
        envPolicy: envPolicySchema.default("path"),
      })
      .default({
        allowCommands: true,
        maxConcurrent: 1,
        maxStdoutBytes: 1_048_576,
        maxStderrBytes: 1_048_576,
        envPolicy: "path",
      }),
  })
  .strict();

export type DiffWitnessConfig = z.infer<typeof diffWitnessConfigSchema>;
export type EnvPolicy = z.infer<typeof envPolicySchema>;

export function parseDiffWitnessConfig(input: unknown): DiffWitnessConfig {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new DiffWitnessError("config", "Invalid DiffWitness config: root must be a mapping", {
      exitClass: "user_error",
    });
  }
  const record = input as Record<string, unknown>;
  if (!("version" in record)) {
    throw new DiffWitnessError("config", "Invalid DiffWitness config: missing version", {
      exitClass: "user_error",
    });
  }
  if (record.version !== 1) {
    throw new DiffWitnessError(
      "config",
      `Unsupported config version ${String(record.version)} (expected 1) — fail closed`,
      { exitClass: "user_error", details: { code: "unsupported_config_version" } },
    );
  }

  const parsed = diffWitnessConfigSchema.safeParse(input);
  if (!parsed.success) {
    throw new DiffWitnessError("config", "Invalid DiffWitness config", {
      exitClass: "user_error",
      details: { issues: parsed.error.issues },
    });
  }

  // Extra argv hardening: reject NUL and empty after trim is already schema-min(1).
  for (const workflow of parsed.data.workflows) {
    for (const part of workflow.command) {
      if (part.includes("\0")) {
        throw new DiffWitnessError(
          "config",
          `Workflow ${workflow.id}: command argv must not contain NUL bytes`,
          { exitClass: "user_error" },
        );
      }
    }
    if (workflow.cwd !== undefined && workflow.cwd.includes("\0")) {
      throw new DiffWitnessError(
        "config",
        `Workflow ${workflow.id}: cwd must not contain NUL bytes`,
        { exitClass: "user_error" },
      );
    }
  }

  return parsed.data;
}
