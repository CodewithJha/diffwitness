import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { promisify } from "node:util";
import { parse as parseYaml } from "yaml";
import { runCli } from "../src/cli/program.js";
import { EXIT_CODES } from "../src/domain/errors.js";
import { DEFAULT_CONFIG_TEMPLATE, defaultConfig } from "../src/infrastructure/config/defaults.js";
import { parseDiffWitnessConfig } from "../src/infrastructure/config/schema.js";
import { FsStorage } from "../src/infrastructure/storage/fs-storage.js";

const execFileAsync = promisify(execFile);

async function run(argv: string[], cwd?: string): Promise<{ code: number; out: string; err: string }> {
  let out = "";
  let err = "";
  const code = await runCli({
    argv,
    ...(cwd !== undefined ? { cwd } : {}),
    storage: new FsStorage(),
    stdout: (c) => {
      out += c;
    },
    stderr: (c) => {
      err += c;
    },
  });
  return { code, out, err };
}

async function gitRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-ux-"));
  const git = (args: string[]) => execFileAsync("git", ["-c", "user.name=t", "-c", "user.email=t@example.com", ...args], { cwd: root });
  await git(["init", "-q"]);
  await writeFile(path.join(root, "README.md"), "x\n", "utf8");
  await git(["add", "."]);
  await git(["commit", "-qm", "init"]);
  return root;
}

describe("CLI usage errors", () => {
  for (const argv of [["--bogus"], ["check", "--nope"], ["frobnicate"], ["baseline", "extra-arg"]]) {
    it(`diffwitness ${argv.join(" ")} → exit 2 with a single error line`, async () => {
      const { code, err } = await run(argv);
      assert.equal(code, EXIT_CODES.user_error);
      assert.doesNotMatch(err, /error: error:/);
      assert.equal(err.match(/^error:/gm)?.length, 1);
      assert.match(err, /--help/);
    });
  }

  it("--version still exits 0", async () => {
    const { code, out } = await run(["--version"]);
    assert.equal(code, 0);
    assert.match(out, /^\d+\.\d+\.\d+/);
  });
});

describe("init template", () => {
  it("is valid, commented YAML whose parsed form is defaultConfig()", () => {
    assert.match(DEFAULT_CONFIG_TEMPLATE, /^# /m);
    assert.match(DEFAULT_CONFIG_TEMPLATE, /TODO: replace this example/);
    assert.deepEqual(parseDiffWitnessConfig(parseYaml(DEFAULT_CONFIG_TEMPLATE)), defaultConfig());
  });

  it("baseline on the unedited template exits 2 with an actionable message and runs nothing", async () => {
    const repo = await gitRepo();
    try {
      assert.equal((await run(["init"], repo)).code, 0);
      const { code, err } = await run(["baseline"], repo);
      assert.equal(code, EXIT_CODES.user_error);
      assert.match(err, /^error: Workflow example still uses the template command \(node path\/to\/workflow\.mjs\)/m);
      assert.match(err, /Edit \.diffwitness\/config\.yaml/);
      assert.doesNotMatch(err, /artifact/i);
      assert.doesNotMatch(err, new RegExp(repo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("a command that does not exist gets a 'command not found' message, not a missing-artifact error", async () => {
    const repo = await gitRepo();
    try {
      assert.equal((await run(["init"], repo)).code, 0);
      const configPath = path.join(repo, ".diffwitness", "config.yaml");
      const edited = (await readFile(configPath, "utf8")).replace(
        'command: ["node", "path/to/workflow.mjs"]',
        'command: ["diffwitness-no-such-binary-xyz"]',
      );
      await writeFile(configPath, edited, "utf8");
      const { code, err } = await run(["baseline"], repo);
      assert.equal(code, EXIT_CODES.analysis_error);
      assert.match(err, /could not start `diffwitness-no-such-binary-xyz` \(command not found\)/);
      assert.match(err, /\.diffwitness\/config\.yaml/);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("a missing artifact after a failing command says the command failed", async () => {
    const repo = await gitRepo();
    try {
      assert.equal((await run(["init"], repo)).code, 0);
      const configPath = path.join(repo, ".diffwitness", "config.yaml");
      const edited = (await readFile(configPath, "utf8"))
        .replace('command: ["node", "path/to/workflow.mjs"]', 'command: ["node", "-e", "process.exit(3)"]')
        .replace('# artifactGlobs: ["out/report.json"]', 'artifactGlobs: ["out/report.json"]');
      await writeFile(configPath, edited, "utf8");
      const { code, err } = await run(["baseline"], repo);
      assert.equal(code, EXIT_CODES.analysis_error);
      assert.match(err, /expected artifact out\/report\.json is missing — the command exited with code 3/);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });
});
