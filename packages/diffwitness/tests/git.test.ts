import assert from "node:assert/strict";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { LocalGitPort } from "../src/infrastructure/git/local-git.js";
import { DiffWitnessError } from "../src/domain/errors.js";

const execFileAsync = promisify(execFile);

async function gitInitWithCommit(dir: string): Promise<void> {
  await execFileAsync("git", ["init"], { cwd: dir });
  await execFileAsync("git", ["config", "user.email", "test@example.com"], { cwd: dir });
  await execFileAsync("git", ["config", "user.name", "Test"], { cwd: dir });
  await writeFile(path.join(dir, "README.md"), "hello\n", "utf8");
  await execFileAsync("git", ["add", "README.md"], { cwd: dir });
  await execFileAsync("git", ["commit", "-m", "init"], { cwd: dir });
}

describe("LocalGitPort", () => {
  it("resolves root, HEAD SHA, and dirty flag", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-git-"));
    const canonical = await realpath(root);
    try {
      await gitInitWithCommit(root);
      const git = new LocalGitPort();
      const fromRoot = await git.resolveRoot(root);
      assert.equal(fromRoot, canonical);

      const nested = path.join(root, "nested");
      await mkdir(nested);
      assert.equal(await git.resolveRoot(nested), canonical);

      const identity = await git.getIdentity(fromRoot);
      assert.equal(identity.dirty, false);
      assert.ok(identity.headSha && identity.headSha.length >= 7);

      await writeFile(path.join(root, "dirty.txt"), "x\n", "utf8");
      const dirtyId = await git.getIdentity(fromRoot);
      assert.equal(dirtyId.dirty, true);
      const changed = await git.listChangedFiles(fromRoot);
      assert.ok(changed.includes("dirty.txt"));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails outside a git repository", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "diffwitness-nongit-"));
    try {
      const git = new LocalGitPort();
      await assert.rejects(
        () => git.resolveRoot(dir),
        (err: unknown) => err instanceof DiffWitnessError && err.category === "repo",
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
