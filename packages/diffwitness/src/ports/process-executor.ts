import type { InterruptSignal } from "../domain/errors.js";

/**
 * Controlled process execution. Argv-only (no shell interpolation).
 * Timeout and stream bounds are mandatory.
 */
export interface ProcessExecuteRequest {
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
  readonly maxStdoutBytes: number;
  readonly maxStderrBytes: number;
  /** Optional abort — executor kills the child and reports timed_out/aborted. */
  readonly signal?: AbortSignal;
}

/**
 * - exited: child exited on its own with an exit code (any value, including 1 or 130)
 * - signaled: child was terminated by a signal DiffWitness did not send (e.g. crash / external kill)
 * - timed_out: DiffWitness killed the child's process group after timeoutMs (or AbortSignal)
 * - interrupted: DiffWitness killed the child's process group because the CLI was interrupted/disposed
 * - spawn_failed: the child could not be started
 */
export type ProcessOutcomeKind =
  | "exited"
  | "signaled"
  | "timed_out"
  | "interrupted"
  | "spawn_failed";

export interface ProcessExecuteResult {
  readonly outcome: ProcessOutcomeKind;
  /** Present (non-null) only when outcome === "exited". */
  readonly exitCode: number | null;
  readonly stdout: Buffer;
  readonly stderr: Buffer;
  readonly stdoutTruncated: boolean;
  readonly stderrTruncated: boolean;
  readonly durationMs: number;
  /** Failure detail for non-exited outcomes. */
  readonly errorMessage?: string;
  /** Signal that terminated the child when outcome === "signaled". */
  readonly terminatingSignal?: NodeJS.Signals;
  /** Signal the CLI received when outcome === "interrupted" (absent when stopped by dispose). */
  readonly interruptedBy?: InterruptSignal;
}

export interface ProcessExecutor {
  execute(request: ProcessExecuteRequest): Promise<ProcessExecuteResult>;
}
