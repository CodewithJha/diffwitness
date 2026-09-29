import { spawn, type ChildProcess } from "node:child_process";
import { realpath, stat } from "node:fs/promises";
import path from "node:path";
import { DiffWitnessError } from "../../domain/errors.js";
import type { Interruption } from "../../ports/interruption.js";
import type {
  ProcessExecuteRequest,
  ProcessExecuteResult,
  ProcessExecutor,
} from "../../ports/process-executor.js";

/**
 * POSIX: each workflow runs in its own process group (`detached: true`) so timeout / interrupt
 * cleanup can SIGKILL the whole group (grandchildren included). Windows has no process groups
 * here: only the direct child is killed, and descendants may outlive a timeout.
 */
const USE_PROCESS_GROUPS = process.platform !== "win32";

export interface ChildProcessExecutorOptions {
  /** When set, an interrupt kills running workflows and refuses new spawns. */
  readonly interruption?: Interruption;
}

type Stopper = (outcome: "interrupted", message: string) => void;

/**
 * Argv-based process executor — never uses shell interpolation.
 * Distinguishes exited / signaled / timed_out / interrupted / spawn_failed.
 *
 * Security / reliability:
 * - argv-only (`shell: false`)
 * - required timeouts and stdout/stderr bounds
 * - cwd must exist and be a directory (caller should keep cwd under repo root)
 * - timeout / interrupt / dispose SIGKILL the workflow's process group and release its pipes
 */
export class ChildProcessExecutor implements ProcessExecutor {
  private readonly running = new Map<ChildProcess, Stopper>();
  private readonly interruption: Interruption | undefined;
  private readonly unsubscribe: (() => void) | undefined;

  constructor(options: ChildProcessExecutorOptions = {}) {
    this.interruption = options.interruption;
    this.unsubscribe = options.interruption?.onInterrupt((signal) => {
      this.stopAll(`Interrupted by ${signal}`);
    });
  }

  /** Kill all running workflow process groups; their executions resolve as `interrupted`. */
  killAllChildren(signal: NodeJS.Signals = "SIGKILL"): void {
    for (const child of [...this.running.keys()]) {
      killProcessTree(child, signal);
    }
    this.stopAll("Stopped by DiffWitness");
  }

  async dispose(): Promise<void> {
    this.stopAll("Stopped by DiffWitness");
    this.unsubscribe?.();
  }

  private stopAll(message: string): void {
    for (const stop of [...this.running.values()]) {
      stop("interrupted", message);
    }
  }

  async execute(request: ProcessExecuteRequest): Promise<ProcessExecuteResult> {
    validateRequest(request);
    await assertValidCwd(request.cwd);

    const [file, ...args] = request.argv;
    if (file === undefined) {
      throw new DiffWitnessError("execution", "Process argv must be non-empty");
    }

    const started = Date.now();
    const interruptedBy = this.interruption?.signal ?? null;
    if (interruptedBy !== null) {
      return emptyResult("interrupted", started, `Interrupted by ${interruptedBy} before spawn`, {
        interruptedBy,
      });
    }

    return new Promise((resolve) => {
      const capture = new BoundedCapture(request.maxStdoutBytes, request.maxStderrBytes);
      const abortSignal = request.signal;
      let settled = false;
      let timer: NodeJS.Timeout | undefined;
      let child: ChildProcess | undefined;

      const finish = (
        result: Omit<ProcessExecuteResult, "stdout" | "stderr" | "stdoutTruncated" | "stderrTruncated" | "durationMs">,
      ): void => {
        if (settled) return;
        settled = true;
        if (timer !== undefined) clearTimeout(timer);
        abortSignal?.removeEventListener("abort", onAbort);
        if (child !== undefined) this.running.delete(child);
        resolve({ ...result, ...capture.snapshot(), durationMs: Date.now() - started });
      };

      /** DiffWitness-initiated stop: kill the whole group and release pipes so we resolve promptly. */
      const stop = (
        outcome: "timed_out" | "interrupted",
        message: string,
      ): void => {
        if (settled) return;
        if (child !== undefined) {
          killProcessTree(child, "SIGKILL");
          child.stdout?.destroy();
          child.stderr?.destroy();
        }
        const by = outcome === "interrupted" ? this.interruption?.signal ?? null : null;
        finish({
          outcome,
          exitCode: null,
          errorMessage: message,
          ...(by !== null ? { interruptedBy: by } : {}),
        });
      };

      const onAbort = (): void => stop("timed_out", "Process aborted (signal)");

      try {
        child = spawn(file, args, {
          cwd: request.cwd,
          env: { ...request.env },
          shell: false,
          detached: USE_PROCESS_GROUPS,
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (cause) {
        finish({
          outcome: "spawn_failed",
          exitCode: null,
          errorMessage: cause instanceof Error ? cause.message : String(cause),
        });
        return;
      }

      const spawned = child;
      this.running.set(spawned, stop);
      spawned.stdout?.on("data", (chunk: Buffer) => capture.stdout(chunk));
      spawned.stderr?.on("data", (chunk: Buffer) => capture.stderr(chunk));

      spawned.on("error", (cause) => {
        // A spawn error after a DiffWitness-initiated stop is already settled.
        finish({
          outcome: "spawn_failed",
          exitCode: null,
          errorMessage: cause instanceof Error ? cause.message : String(cause),
        });
      });

      spawned.on("close", (code, signal) => {
        if (settled) return;
        const by = this.interruption?.signal ?? null;
        if (by !== null) {
          // Parent was interrupted while (or just as) the child finished: never evidence.
          finish({
            outcome: "interrupted",
            exitCode: null,
            errorMessage: `Interrupted by ${by}`,
            interruptedBy: by,
          });
          return;
        }
        if (code === null) {
          finish({
            outcome: "signaled",
            exitCode: null,
            errorMessage: `Process terminated by signal ${signal ?? "unknown"}`,
            ...(signal !== null ? { terminatingSignal: signal } : {}),
          });
          return;
        }
        finish({ outcome: "exited", exitCode: code });
      });

      if (abortSignal !== undefined) {
        if (abortSignal.aborted) {
          onAbort();
          return;
        }
        abortSignal.addEventListener("abort", onAbort, { once: true });
      }

      timer = setTimeout(() => {
        stop("timed_out", `Process timed out after ${request.timeoutMs}ms`);
      }, request.timeoutMs);

      // Interrupt could have been recorded while spawn() ran.
      const lateInterrupt = this.interruption?.signal ?? null;
      if (lateInterrupt !== null) {
        stop("interrupted", `Interrupted by ${lateInterrupt}`);
      }
    });
  }
}

/** SIGKILL/SIGTERM the child's process group (POSIX) or the child itself (Windows / fallback). */
function killProcessTree(child: ChildProcess, signal: NodeJS.Signals): void {
  const pid = child.pid;
  if (pid === undefined) {
    return;
  }
  if (USE_PROCESS_GROUPS) {
    try {
      process.kill(-pid, signal);
      return;
    } catch {
      // Group already gone — fall through to the direct child.
    }
  }
  try {
    child.kill(signal);
  } catch {
    // Child may already be gone.
  }
}

class BoundedCapture {
  private readonly out: Buffer[] = [];
  private readonly err: Buffer[] = [];
  private outSize = 0;
  private errSize = 0;
  private outTruncated = false;
  private errTruncated = false;

  constructor(
    private readonly maxOut: number,
    private readonly maxErr: number,
  ) {}

  stdout(chunk: Buffer): void {
    const room = this.maxOut - this.outSize;
    if (room <= 0) {
      this.outTruncated = true;
      return;
    }
    const kept = chunk.byteLength > room ? chunk.subarray(0, room) : chunk;
    this.out.push(kept);
    this.outSize += kept.byteLength;
    if (kept !== chunk) this.outTruncated = true;
  }

  stderr(chunk: Buffer): void {
    const room = this.maxErr - this.errSize;
    if (room <= 0) {
      this.errTruncated = true;
      return;
    }
    const kept = chunk.byteLength > room ? chunk.subarray(0, room) : chunk;
    this.err.push(kept);
    this.errSize += kept.byteLength;
    if (kept !== chunk) this.errTruncated = true;
  }

  snapshot(): Pick<ProcessExecuteResult, "stdout" | "stderr" | "stdoutTruncated" | "stderrTruncated"> {
    return {
      stdout: Buffer.concat(this.out),
      stderr: Buffer.concat(this.err),
      stdoutTruncated: this.outTruncated,
      stderrTruncated: this.errTruncated,
    };
  }
}

function emptyResult(
  outcome: ProcessExecuteResult["outcome"],
  started: number,
  errorMessage: string,
  extra: Partial<ProcessExecuteResult> = {},
): ProcessExecuteResult {
  return {
    outcome,
    exitCode: null,
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
    stdoutTruncated: false,
    stderrTruncated: false,
    durationMs: Date.now() - started,
    errorMessage,
    ...extra,
  };
}

function validateRequest(request: ProcessExecuteRequest): void {
  if (request.argv.length === 0) {
    throw new DiffWitnessError("execution", "Process argv must be non-empty");
  }
  if (!Number.isFinite(request.timeoutMs) || request.timeoutMs <= 0) {
    throw new DiffWitnessError("execution", "timeoutMs must be a positive number");
  }
  if (request.maxStdoutBytes <= 0 || request.maxStderrBytes <= 0) {
    throw new DiffWitnessError("execution", "stdout/stderr byte limits must be positive");
  }
  for (const part of request.argv) {
    if (part.includes("\0")) {
      throw new DiffWitnessError("execution", "Process argv must not contain NUL bytes");
    }
  }
}

async function assertValidCwd(cwd: string): Promise<void> {
  if (cwd.includes("\0")) {
    throw new DiffWitnessError("execution", "cwd must not contain NUL bytes", {
      exitClass: "user_error",
    });
  }
  const absolute = path.resolve(cwd);
  let st;
  try {
    st = await stat(absolute);
  } catch (cause) {
    throw new DiffWitnessError("execution", `Workflow cwd does not exist: ${absolute}`, {
      cause,
      exitClass: "user_error",
    });
  }
  if (!st.isDirectory()) {
    throw new DiffWitnessError("execution", `Workflow cwd is not a directory: ${absolute}`, {
      exitClass: "user_error",
    });
  }
  // Resolve symlinks for clearer errors; do not rewrite caller cwd.
  try {
    await realpath(absolute);
  } catch (cause) {
    throw new DiffWitnessError("execution", `Workflow cwd is not resolvable: ${absolute}`, {
      cause,
      exitClass: "user_error",
    });
  }
}
