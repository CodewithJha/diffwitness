import { z } from "zod";

/**
 * Hosted demo configuration. Operator-controlled via environment variables only;
 * nothing here is ever derived from a visitor request.
 */
export interface HostedConfig {
  readonly port: number;
  readonly host: string;
  /** Max demo runs executing at once; further requests get 503 + Retry-After. */
  readonly maxConcurrent: number;
  /** Hard wall-clock limit for one POST /api/demo (all stages + setup). */
  readonly requestTimeoutMs: number;
  /** Per child process (CLI stage or git setup command) timeout. */
  readonly stageTimeoutMs: number;
  /** Tracked workspaces older than this are force-removed by the sweeper. */
  readonly workspaceTtlMs: number;
  /** Cap on captured stdout and on captured stderr, per child process. */
  readonly maxOutputBytes: number;
  /** Cap on the POST body. */
  readonly maxBodyBytes: number;
  /** On SIGINT/SIGTERM: how long active runs get to stop and clean up. */
  readonly shutdownGraceMs: number;
}

export const DEFAULT_HOSTED_CONFIG: HostedConfig = {
  port: 3000,
  // 0.0.0.0: PaaS hosts route external traffic to the container interface, not loopback.
  host: "0.0.0.0",
  maxConcurrent: 2,
  requestTimeoutMs: 30_000,
  stageTimeoutMs: 15_000,
  workspaceTtlMs: 120_000,
  maxOutputBytes: 256 * 1024,
  maxBodyBytes: 1024,
  shutdownGraceMs: 10_000,
};

const ENV_KEYS = {
  port: "PORT",
  host: "HOST",
  maxConcurrent: "DEMO_MAX_CONCURRENT",
  requestTimeoutMs: "DEMO_REQUEST_TIMEOUT_MS",
  stageTimeoutMs: "DEMO_STAGE_TIMEOUT_MS",
  workspaceTtlMs: "DEMO_WORKSPACE_TTL_MS",
  maxOutputBytes: "DEMO_MAX_OUTPUT_BYTES",
  maxBodyBytes: "DEMO_MAX_BODY_BYTES",
  shutdownGraceMs: "DEMO_SHUTDOWN_GRACE_MS",
} as const satisfies Record<keyof HostedConfig, string>;

const intFromEnv = (min: number, max: number) =>
  z
    .string()
    .regex(/^\d+$/, "must be a non-negative integer")
    .transform(Number)
    .pipe(z.number().int().min(min).max(max));

const envSchema = z.object({
  port: intFromEnv(0, 65_535),
  host: z.string().min(1).max(255).regex(/^[A-Za-z0-9.:\-\[\]]+$/, "invalid host"),
  maxConcurrent: intFromEnv(1, 16),
  requestTimeoutMs: intFromEnv(500, 300_000),
  stageTimeoutMs: intFromEnv(200, 300_000),
  workspaceTtlMs: intFromEnv(1_000, 3_600_000),
  maxOutputBytes: intFromEnv(1024, 8 * 1024 * 1024),
  maxBodyBytes: intFromEnv(64, 64 * 1024),
  shutdownGraceMs: intFromEnv(0, 120_000),
});

export class HostedConfigError extends Error {
  override readonly name = "HostedConfigError";
}

/** Parse config from env; unset keys use defaults; invalid values fail startup. */
export function loadHostedConfig(env: NodeJS.ProcessEnv = process.env): HostedConfig {
  const merged: Record<string, string> = {};
  for (const [field, key] of Object.entries(ENV_KEYS)) {
    const raw = env[key];
    merged[field] =
      raw !== undefined && raw.trim().length > 0
        ? raw.trim()
        : String(DEFAULT_HOSTED_CONFIG[field as keyof HostedConfig]);
  }
  const parsed = envSchema.safeParse(merged);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path[0] as keyof HostedConfig | undefined;
    const key = field !== undefined ? ENV_KEYS[field] : "config";
    throw new HostedConfigError(`Invalid ${key}: ${issue?.message ?? "invalid value"}`);
  }
  return validateHostedConfig(parsed.data);
}

/** Headroom over the request timeout for stopping children (SIGTERM → SIGKILL) and cleanup. */
const TTL_HEADROOM_MS = 5_000;

export function validateHostedConfig(config: HostedConfig): HostedConfig {
  if (config.workspaceTtlMs < config.requestTimeoutMs + TTL_HEADROOM_MS) {
    throw new HostedConfigError(
      `${ENV_KEYS.workspaceTtlMs} must be >= ${ENV_KEYS.requestTimeoutMs} + ${TTL_HEADROOM_MS} (active runs must not be swept)`,
    );
  }
  return config;
}
