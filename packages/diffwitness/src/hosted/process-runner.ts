import { spawn, type ChildProcess } from "node:child_process";

/**
 * Runs one trusted child process (the DiffWitness CLI or a git setup command) for the hosted demo.
 *
 * Differs from the CLI's ChildProcessExecutor in its stop policy: the CLI puts each workflow in
 * its own process group, so SIGKILLing the CLI's group would orphan the workflow. Stops therefore
 * send SIGTERM first (the CLI kills its workflow groups and exits 143), then SIGKILL after a grace.
 */
const USE_PROCESS_GROUPS = process.platform !== "win32";
const KILL_GRACE_MS = 2_000;

export interface RunProcessRequest {
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
  readonly maxOutputBytes: number;
  readonly signal?: AbortSignal;
}

/**
 * exited: exited on its own · signaled: killed by a signal we did not send ·
 * timed_out: we stopped it after timeoutMs · aborted: we stopped it because `signal` fired ·
 * spawn_failed: could not start.
 */
export type RunOutcome = "exited" | "signaled" | "timed_out" | "aborted" | "spawn_failed";

export interface RunProcessResult {
  readonly outcome: RunOutcome;
  readonly exitCode: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly truncated: boolean;
  readonly durationMs: number;
}

export async function runProcess(request: RunProcessRequest): Promise<RunProcessResult> {
  const [file, ...args] = request.argv;
  if (file === undefined || request.argv.some((a) => a.includes("\0"))) {
    throw new Error("invalid argv");
  }
  const started = Date.now();
  const stdout = new Capture(request.maxOutputBytes);
  const stderr = new Capture(request.maxOutputBytes);

  if (request.signal?.aborted === true) {
    return { outcome: "aborted", exitCode: null, stdout: "", stderr: "", truncated: false, durationMs: 0 };
  }

  return new Promise((resolve) => {
    let child: ChildProcess;
    let stopReason: "timed_out" | "aborted" | null = null;
    let killTimer: NodeJS.Timeout | undefined;
    let settled = false;

    const finish = (outcome: RunOutcome, exitCode: number | null): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (killTimer !== undefined) clearTimeout(killTimer);
      request.signal?.removeEventListener("abort", onAbort);
      resolve({
        outcome,
        exitCode,
        stdout: stdout.text(),
        stderr: stderr.text(),
        truncated: stdout.truncated || stderr.truncated,
        durationMs: Date.now() - started,
      });
    };

    const stop = (reason: "timed_out" | "aborted"): void => {
      if (settled || stopReason !== null) return;
      stopReason = reason;
      signalTree(child, "SIGTERM");
      killTimer = setTimeout(() => {
        signalTree(child, "SIGKILL");
        child.stdout?.destroy();
        child.stderr?.destroy();
        // Pipes may be held by a descendant that escaped the group; do not wait on them.
        setTimeout(() => finish(reason, null), 200).unref();
      }, KILL_GRACE_MS);
    };

    const onAbort = (): void => stop("aborted");
    const timer = setTimeout(() => stop("timed_out"), request.timeoutMs);

    try {
      child = spawn(file, args, {
        cwd: request.cwd,
        env: { ...request.env },
        shell: false,
        detached: USE_PROCESS_GROUPS,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });
    } catch {
      finish("spawn_failed", null);
      return;
    }

    child.stdout?.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr?.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", () => finish("spawn_failed", null));
    child.on("close", (code) => {
      if (stopReason !== null) {
        finish(stopReason, null);
      } else if (code === null) {
        finish("signaled", null);
      } else {
        finish("exited", code);
      }
    });
    request.signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function signalTree(child: ChildProcess, signal: NodeJS.Signals): void {
  const pid = child.pid;
  if (pid === undefined) return;
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
    // Already exited.
  }
}

class Capture {
  private readonly chunks: Buffer[] = [];
  private size = 0;
  truncated = false;

  constructor(private readonly max: number) {}

  push(chunk: Buffer): void {
    const room = this.max - this.size;
    if (room <= 0) {
      this.truncated = true;
      return;
    }
    const kept = chunk.byteLength > room ? chunk.subarray(0, room) : chunk;
    if (kept !== chunk) this.truncated = true;
    this.chunks.push(kept);
    this.size += kept.byteLength;
  }

  text(): string {
    return Buffer.concat(this.chunks).toString("utf8");
  }
}
