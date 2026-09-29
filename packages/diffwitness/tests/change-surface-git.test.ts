import assert from "node:assert/strict";
import { mkdir, mkdtemp, realpath, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { LocalGitPort } from "../src/infrastructure/git/local-git.js";
import {
  parseNameStatusZ,
  parseNumstatZ,
  parseUnifiedZeroHunks,
} from "../src/infrastructure/git/parse-diff.js";
import { git } from "./support/fixture-repo.js";

const MAX = { maxOutputBytes: 1_000_000 };

async function repoWithFiles(files: Record<string, string>): Promise<{ root: string; base: string }> {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), "diffwitness-cs-git-")));
  await git(root, ["init"]);
  await git(root, ["config", "user.email", "t@example.com"]);
  await git(root, ["config", "user.name", "T"]);
  for (const [name, body] of Object.entries(files)) {
    await writeFile(path.join(root, name), body, "utf8");
  }
  await git(root, ["add", "."]);
  await git(root, ["commit", "-m", "base"]);
  const base = (await git(root, ["rev-parse", "HEAD"])).trim();
  return { root, base };
}

describe("LocalGitPort.diffWorkingTree", () => {
  const port = new LocalGitPort();

  it("no changes → empty file list", async () => {
    const { root, base } = await repoWithFiles({ "a.txt": "a\n" });
    try {
      const diff = await port.diffWorkingTree(root, base, MAX);
      assert.deepEqual(diff.files, []);
      assert.deepEqual(diff.locations, []);
      assert.equal(diff.outputCapped, false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("modified (unstaged) with numstat metadata and hunk locations", async () => {
    const { root, base } = await repoWithFiles({ "a.txt": "one\ntwo\nthree\n" });
    try {
      await writeFile(path.join(root, "a.txt"), "one\nTWO\nthree\nfour\n", "utf8");
      const diff = await port.diffWorkingTree(root, base, MAX);
      assert.deepEqual(diff.files, [{ path: "a.txt", status: "modified", additions: 2, deletions: 1 }]);
      assert.equal(diff.locationsComplete, true);
      assert.deepEqual(diff.locations, [
        { path: "a.txt", baseStart: 2, baseLines: 1, currentStart: 2, currentLines: 1 },
        { path: "a.txt", baseStart: 3, baseLines: 0, currentStart: 4, currentLines: 1 },
      ]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("added (untracked and staged), deleted, committed changes since base", async () => {
    const { root, base } = await repoWithFiles({ "keep.txt": "k\n", "gone.txt": "g\n" });
    try {
      await writeFile(path.join(root, "committed.txt"), "c\n", "utf8");
      await git(root, ["add", "committed.txt"]);
      await git(root, ["commit", "-m", "later"]);
      await writeFile(path.join(root, "staged.txt"), "s\n", "utf8");
      await git(root, ["add", "staged.txt"]);
      await writeFile(path.join(root, "untracked.txt"), "u\n", "utf8");
      await unlink(path.join(root, "gone.txt"));
      const diff = await port.diffWorkingTree(root, base, MAX);
      const byPath = new Map(diff.files.map((f) => [f.path, f]));
      assert.equal(byPath.get("committed.txt")?.status, "added");
      assert.equal(byPath.get("staged.txt")?.status, "added");
      assert.equal(byPath.get("gone.txt")?.status, "deleted");
      assert.deepEqual(byPath.get("untracked.txt"), { path: "untracked.txt", status: "added", untracked: true });
      assert.equal(byPath.has("keep.txt"), false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("renamed via git mv reports oldPath", async () => {
    const body = "line1\nline2\nline3\nline4\nline5\n";
    const { root, base } = await repoWithFiles({ "old-name.txt": body });
    try {
      await git(root, ["mv", "old-name.txt", "new-name.txt"]);
      const diff = await port.diffWorkingTree(root, base, MAX);
      assert.equal(diff.files.length, 1);
      assert.equal(diff.files[0]?.status, "renamed");
      assert.equal(diff.files[0]?.path, "new-name.txt");
      assert.equal(diff.files[0]?.oldPath, "old-name.txt");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("gitignored files never appear; unusual path characters survive via -z", async () => {
    const { root, base } = await repoWithFiles({ ".gitignore": "out/\n", "x.txt": "x\n" });
    try {
      await writeFile(path.join(root, "space name.txt"), "s\n", "utf8");
      await git(root, ["add", "space name.txt"]);
      await mkdir(path.join(root, "out"));
      await writeFile(path.join(root, "out", "gen.json"), "{}\n", "utf8");
      const diff = await port.diffWorkingTree(root, base, MAX);
      assert.deepEqual(diff.files.map((f) => f.path), ["space name.txt"]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("output cap marks outputCapped instead of failing", async () => {
    const files: Record<string, string> = { "seed.txt": "s\n" };
    const { root, base } = await repoWithFiles(files);
    try {
      for (let i = 0; i < 50; i++) {
        await writeFile(path.join(root, `file-${String(i).padStart(3, "0")}.txt`), "x\n", "utf8");
      }
      const diff = await port.diffWorkingTree(root, base, { maxOutputBytes: 64 });
      assert.equal(diff.outputCapped, true);
      assert.ok(diff.files.length < 50);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("resolveCommit returns null for unknown / malformed SHAs", async () => {
    const { root, base } = await repoWithFiles({ "a.txt": "a\n" });
    try {
      assert.equal(await port.resolveCommit(root, base), base);
      assert.equal(await port.resolveCommit(root, "0".repeat(40)), null);
      assert.equal(await port.resolveCommit(root, "not-a-sha"), null);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("git diff parsers", () => {
  it("name-status -z handles renames and stops on incomplete trailing records", () => {
    const out = "M\0a.txt\0R087\0old.txt\0new.txt\0D\0gone.txt\0";
    assert.deepEqual(parseNameStatusZ(out), [
      { path: "a.txt", status: "modified" },
      { path: "new.txt", status: "renamed", oldPath: "old.txt" },
      { path: "gone.txt", status: "deleted" },
    ]);
    assert.deepEqual(parseNameStatusZ("M\0a.txt\0R087\0old.t"), [{ path: "a.txt", status: "modified" }]);
  });

  it("numstat -z maps renames to the new path and leaves binary counts absent", () => {
    const counts = parseNumstatZ("1\t2\ta.txt\0-\t-\timg.png\0" + "3\t0\t\0old.txt\0new.txt\0");
    assert.deepEqual(counts.get("a.txt"), { additions: 1, deletions: 2 });
    assert.deepEqual(counts.get("img.png"), {});
    assert.deepEqual(counts.get("new.txt"), { additions: 3, deletions: 0 });
  });

  it("unified=0 hunks skip body lines that look like headers; quoted paths are not attributed", () => {
    const out = [
      "diff --git a/x.txt b/x.txt",
      "--- a/x.txt",
      "+++ b/x.txt",
      "@@ -1,2 +1 @@",
      "--- not a header",
      "-+++ also not a header",
      "+replacement",
      "diff --git a/del.txt b/del.txt",
      "--- a/del.txt",
      "+++ /dev/null",
      "@@ -1 +0,0 @@",
      "-bye",
      'diff --git "a/q\\tx" "b/q\\tx"',
      '--- "a/q\\tx"',
      '+++ "b/q\\tx"',
      "@@ -1 +1 @@",
      "-a",
      "+b",
      "",
    ].join("\n");
    const parsed = parseUnifiedZeroHunks(out, false);
    assert.deepEqual(parsed.locations, [
      { path: "x.txt", baseStart: 1, baseLines: 2, currentStart: 1, currentLines: 1 },
      { path: "del.txt", baseStart: 1, baseLines: 1, currentStart: 0, currentLines: 0 },
    ]);
    assert.equal(parsed.complete, false);
  });
});
