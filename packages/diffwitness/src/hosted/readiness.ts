import os from "node:os";
import { runProcess } from "./process-runner.js";

export type ReadinessState =
  | { readonly status: "starting" }
  | { readonly status: "ready" }
  | { readonly status: "not_ready"; readonly reason: "git_unavailable" };

/** Returns true when a usable `git` is on PATH. Bounded; never throws. */
export type GitAvailabilityCheck = () => Promise<boolean>;

const GIT_CHECK_TIMEOUT_MS = 5_000;

export const defaultGitCheck: GitAvailabilityCheck = async () => {
  try {
    const result = await runProcess({
      argv: ["git", "--version"],
      cwd: os.tmpdir(),
      env: { PATH: process.env.PATH ?? "" },
      timeoutMs: GIT_CHECK_TIMEOUT_MS,
      maxOutputBytes: 4096,
    });
    return result.outcome === "exited" && result.exitCode === 0 && result.stdout.startsWith("git version");
  } catch {
    return false;
  }
};

/** Runs the dependency check once at startup and caches the answer for /ready and /api/demo. */
export class Readiness {
  private state: ReadinessState = { status: "starting" };
  readonly settled: Promise<void>;

  constructor(check: GitAvailabilityCheck, onGitMissing: () => void) {
    this.settled = check().then((ok) => {
      this.state = ok ? { status: "ready" } : { status: "not_ready", reason: "git_unavailable" };
      if (!ok) onGitMissing();
    });
  }

  get current(): ReadinessState {
    return this.state;
  }
}
