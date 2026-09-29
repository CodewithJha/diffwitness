import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { runCli } from "../src/cli/program.js";
import { EXIT_CODES } from "../src/domain/errors.js";
import { FsStorage } from "../src/infrastructure/storage/fs-storage.js";
import { loadConfig } from "../src/infrastructure/config/load.js";
import { MockAIProvider } from "../src/infrastructure/ai/mock-ai-provider.js";

async function makeGitRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-init-"));
  await mkdir(path.join(root, ".git"));
  return root;
}

describe("diffwitness CLI", () => {
  it("prints help for --help", async () => {
    let out = "";
    const code = await runCli({
      argv: ["--help"],
      stdout: (c) => {
        out += c;
      },
      stderr: () => {},
    });
    assert.equal(code, EXIT_CODES.success);
    assert.match(out, /Usage:/i);
    assert.match(out, /init/);
  });

  it("init creates .diffwitness without AI", async () => {
    const repo = await makeGitRepo();
    try {
      let out = "";
      const code = await runCli({
        argv: ["init"],
        cwd: repo,
        storage: new FsStorage(),
        stdout: (c) => {
          out += c;
        },
        stderr: () => {},
      });
      assert.equal(code, 0);
      assert.match(out, /initialized/i);

      const configPath = path.join(repo, ".diffwitness", "config.yaml");
      const raw = await readFile(configPath, "utf8");
      assert.match(raw, /version: 1/);
      assert.match(raw, /provider: mock/);

      const cfg = await loadConfig(new FsStorage(), configPath);
      assert.equal(cfg.workflows[0]?.id, "example");
      assert.match(raw, /^# DiffWitness configuration\./m, "template keeps its comments");
      assert.match(out, /Edit \.diffwitness\/config\.yaml/);

      const gitignore = await readFile(path.join(repo, ".diffwitness", ".gitignore"), "utf8");
      assert.match(gitignore, /cache\//);

      // AI must not be required for init — constructing provider is optional and unused.
      assert.ok(new MockAIProvider());
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("repeated init without --force exits 2", async () => {
    const repo = await makeGitRepo();
    try {
      const storage = new FsStorage();
      const first = await runCli({
        argv: ["init"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: () => {},
      });
      assert.equal(first, 0);

      let err = "";
      const second = await runCli({
        argv: ["init"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: (c) => {
          err += c;
        },
      });
      assert.equal(second, EXIT_CODES.user_error);
      assert.match(err, /already/i);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("repeated init with --force overwrites config", async () => {
    const repo = await makeGitRepo();
    try {
      const storage = new FsStorage();
      await runCli({
        argv: ["init"],
        cwd: repo,
        storage,
        stdout: () => {},
        stderr: () => {},
      });

      const configPath = path.join(repo, ".diffwitness", "config.yaml");
      await writeFile(configPath, "version: 1\nbaseRef: custom\n", "utf8");

      let out = "";
      const code = await runCli({
        argv: ["init", "--force"],
        cwd: repo,
        storage,
        stdout: (c) => {
          out += c;
        },
        stderr: () => {},
      });
      assert.equal(code, 0);
      assert.match(out, /re-initialized/i);
      const cfg = await loadConfig(storage, configPath);
      assert.equal(cfg.baseRef, "origin/main");
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("init outside a git repo fails with nonzero exit", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "diffwitness-nongit-"));
    try {
      let err = "";
      const code = await runCli({
        argv: ["init"],
        cwd: dir,
        storage: new FsStorage(),
        stdout: () => {},
        stderr: (c) => {
          err += c;
        },
      });
      assert.equal(code, EXIT_CODES.user_error);
      assert.match(err, /Not a Git repository/i);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("help lists baseline", async () => {
    let out = "";
    const code = await runCli({
      argv: ["--help"],
      stdout: (c) => {
        out += c;
      },
      stderr: () => {},
    });
    assert.equal(code, EXIT_CODES.success);
    assert.match(out, /baseline/);
  });
});
