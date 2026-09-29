import { mkdir, mkdtemp, realpath, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export interface Workspace {
  /** Unique per-run root (mkdtemp). Never exposed to visitors. */
  readonly root: string;
  /** Canonical form of `root` (e.g. /private/var/... on macOS), for output scrubbing. */
  readonly realRoot: string;
  /** Git repository the CLI analyzes. */
  readonly repoDir: string;
  /** Private HOME for child processes so host git/npm config cannot leak in. */
  readonly homeDir: string;
  readonly createdAt: number;
}

const WORKSPACE_PREFIX = "diffwitness-hosted-";

/**
 * Creates and tracks per-run temp workspaces so every exit path (success, failure, timeout,
 * abort, shutdown, sweeper) can remove them. No fixed paths; nothing shared between runs.
 */
export class WorkspaceTracker {
  private readonly active = new Map<string, Workspace>();

  constructor(private readonly parentDir: string = os.tmpdir()) {}

  async create(): Promise<Workspace> {
    const root = await mkdtemp(path.join(this.parentDir, WORKSPACE_PREFIX));
    const realRoot = await realpath(root);
    const workspace: Workspace = {
      root,
      realRoot,
      repoDir: path.join(root, "repo"),
      homeDir: path.join(root, "home"),
      createdAt: Date.now(),
    };
    this.active.set(root, workspace);
    await mkdir(workspace.repoDir);
    await mkdir(workspace.homeDir);
    return workspace;
  }

  /** Remove a workspace. Stays tracked (for the sweeper / shutdown) if removal fails. */
  async remove(workspace: Workspace): Promise<boolean> {
    try {
      await rm(workspace.root, { recursive: true, force: true, maxRetries: 2 });
      this.active.delete(workspace.root);
      return true;
    } catch {
      return false;
    }
  }

  async removeOlderThan(ageMs: number, now: number = Date.now()): Promise<number> {
    let removed = 0;
    for (const workspace of [...this.active.values()]) {
      if (now - workspace.createdAt >= ageMs && (await this.remove(workspace))) {
        removed += 1;
      }
    }
    return removed;
  }

  async removeAll(): Promise<void> {
    await Promise.all([...this.active.values()].map((w) => this.remove(w)));
  }

  get size(): number {
    return this.active.size;
  }
}
