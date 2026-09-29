import { spawn } from "node:child_process";
import { DiffWitnessError } from "../../domain/errors.js";

const SAFE_REF = /^[A-Za-z0-9][A-Za-z0-9._/\-]*$/;

/** Validate git refs / paths tokens — refuse shell metacharacters and path traversal. */
export function assertSafeGitToken(token: string, label: string): string {
  // Allow git range notation (a...b) while rejecting path traversal (.. as a segment).
  const hasTraversal = /(^|\/)\.\.(\/|$)/.test(token);
  if (!SAFE_REF.test(token) || hasTraversal) {
    throw new DiffWitnessError("repo", `Unsafe git ${label}: ${token}`);
  }
  return token;
}

export interface GitCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
  /** True when stdout hit maxStdoutBytes; git was killed and stdout is a prefix. */
  readonly stdoutTruncated?: boolean;
}

/**
 * Run `git` with argv only (no shell). Fails closed on spawn errors.
 * With `maxStdoutBytes`, output beyond the cap is discarded and git is stopped.
 */
export async function runGit(
  cwd: string,
  args: readonly string[],
  options?: { timeoutMs?: number; maxStdoutBytes?: number },
): Promise<GitCommandResult> {
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const maxStdoutBytes = options?.maxStdoutBytes;
  for (const arg of args) {
    // Allow leading dashes for flags; validate non-flag operands lightly.
    if (!arg.startsWith("-") && arg.length > 0) {
      assertSafeGitToken(arg, "argument");
    } else if (arg.startsWith("-") && arg.includes("\0")) {
      throw new DiffWitnessError("repo", "Unsafe git argument");
    }
  }

  return new Promise((resolve, reject) => {
    const child = spawn("git", [...args], {
      cwd,
      env: { PATH: process.env.PATH ?? "" },
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let stdoutBytes = 0;
    let stdoutTruncated = false;
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      reject(new DiffWitnessError("repo", `git timed out after ${timeoutMs}ms`, {
        details: { args: [...args] },
      }));
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      if (stdoutTruncated) return;
      if (maxStdoutBytes !== undefined && stdoutBytes + chunk.length > maxStdoutBytes) {
        stdoutChunks.push(chunk.subarray(0, maxStdoutBytes - stdoutBytes));
        stdoutBytes = maxStdoutBytes;
        stdoutTruncated = true;
        child.kill("SIGKILL");
        return;
      }
      stdoutChunks.push(chunk);
      stdoutBytes += chunk.length;
    });
    child.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

    child.on("error", (cause) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(
        new DiffWitnessError("repo", "Failed to spawn git (is git installed?)", {
          cause,
        }),
      );
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        exitCode: code ?? 1,
        stdout: Buffer.concat(stdoutChunks).toString("utf8"),
        stderr: Buffer.concat(stderrChunks).toString("utf8"),
        ...(stdoutTruncated ? { stdoutTruncated: true } : {}),
      });
    });
  });
}
