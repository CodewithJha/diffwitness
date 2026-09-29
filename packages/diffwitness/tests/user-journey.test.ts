import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { after, before, describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pricingFixture = path.join(packageRoot, "fixtures", "pricing");

interface Run {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

async function run(cmd: string, args: readonly string[], cwd: string): Promise<Run> {
  try {
    const { stdout, stderr } = await execFileAsync(cmd, [...args], { cwd, maxBuffer: 8 * 1024 * 1024 });
    return { code: 0, stdout, stderr };
  } catch (err) {
    const e = err as { code?: number; stdout?: string; stderr?: string };
    if (typeof e.code !== "number") throw err;
    return { code: e.code, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

/**
 * A new user's path, using the packed tarball rather than the source tree:
 * install → init → configure the template → baseline → change source → check → explain → ci.
 */
describe("user journey (packed tarball)", { timeout: 240_000, skip: process.platform === "win32" }, () => {
  let tmp: string;
  let app: string;
  let bin: string;

  const git = (...args: string[]) => run("git", args, app);
  const diffwitness = (...args: string[]) => run(bin, ["--repo", app, ...args], tmp);

  before(async () => {
    tmp = await mkdtemp(path.join(os.tmpdir(), "diffwitness-journey-"));
    // Build in a staged copy so the concurrently running packaging test cannot race on ./dist.
    const stage = path.join(tmp, "stage");
    for (const entry of ["package.json", "package-lock.json", "tsconfig.json", "README.md", "LICENSE", "src", "fixtures", "hosted"]) {
      await cp(path.join(packageRoot, entry), path.join(stage, entry), { recursive: true });
    }
    await symlink(path.join(packageRoot, "node_modules"), path.join(stage, "node_modules"), "dir");
    await execFileAsync("npm", ["run", "build"], { cwd: stage });
    const { stdout } = await execFileAsync("npm", ["pack", "--pack-destination", tmp], { cwd: stage });
    const tarball = path.join(tmp, stdout.trim().split("\n").pop()!);

    const consumer = path.join(tmp, "consumer");
    await mkdir(consumer);
    await writeFile(path.join(consumer, "package.json"), '{"name":"consumer","private":true}\n');
    await execFileAsync(
      "npm",
      ["install", "--prefer-offline", "--no-audit", "--no-fund", "--omit=dev", tarball],
      { cwd: consumer },
    );
    bin = path.join(consumer, "node_modules", ".bin", "diffwitness");

    app = path.join(tmp, "app");
    await cp(pricingFixture, app, {
      recursive: true,
      filter: (src) => path.basename(src) !== "diffwitness.config.yaml",
    });
    await git("init", "-q", "-b", "main");
    await git("config", "user.email", "journey@example.com");
    await git("config", "user.name", "Journey");
    await git("add", ".");
    await git("commit", "-qm", "pricing app");
  });

  after(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("walks init → baseline → check → explain → ci --fail-on warn", async () => {
    const init = await diffwitness("init");
    assert.equal(init.code, 0, init.stderr);
    assert.match(init.stdout, /Edit \.diffwitness\/config\.yaml/);

    const unconfigured = await diffwitness("baseline");
    assert.equal(unconfigured.code, 2, "template command must be refused before anything runs");
    assert.match(unconfigured.stderr, /still uses the template command/);

    const configPath = path.join(app, ".diffwitness", "config.yaml");
    const template = await readFile(configPath, "utf8");
    const configured = template
      .replace('command: ["node", "path/to/workflow.mjs"]', 'command: ["node", "bin/quote.mjs"]')
      .replace("baseRef: origin/main", "baseRef: main");
    assert.notEqual(configured, template);
    await writeFile(configPath, configured, "utf8");
    await git("add", ".diffwitness/config.yaml", ".diffwitness/.gitignore");
    await git("commit", "-qm", "diffwitness config");

    const baseline = await diffwitness("baseline");
    assert.equal(baseline.code, 0, baseline.stderr);

    const clean = await diffwitness("check");
    assert.equal(clean.code, 0, clean.stderr);
    assert.match(clean.stdout, /^NO BEHAVIOR CHANGE \(status: clean\)$/m);

    const source = path.join(app, "src", "pricing.mjs");
    const before = await readFile(source, "utf8");
    await writeFile(source, before.replace("DISCOUNT = 0.1;", "DISCOUNT = 0.2;"), "utf8");

    const tests = await run("node", ["--test", "test/pricing.test.mjs"], app);
    assert.equal(tests.code, 0, "the project's own tests still pass after the change");

    const changed = await diffwitness("check", "--fail-on", "never");
    assert.equal(changed.code, 0, changed.stderr);
    assert.match(changed.stdout, /^BEHAVIOR CHANGED \(status: findings\)$/m);
    assert.match(changed.stdout, /Before:\s+\{"total":315\}/);
    assert.match(changed.stdout, /After:\s+\{"total":280\}/);
    assert.match(changed.stdout, /Causality: not established/);

    const explain = await diffwitness("explain", "--provider", "mock");
    assert.equal(explain.code, 0, explain.stderr);
    assert.match(explain.stdout, /CAUSALITY: not established/);

    await git("commit", "-qam", "raise discount");
    const ci = await diffwitness("ci", "--fail-on", "warn");
    assert.equal(ci.code, 1, ci.stderr);
    const report = JSON.parse(ci.stdout);
    assert.equal(report.status, "findings");
    assert.deepEqual(
      report.findings.map((f: { workflowId: string; observationKey: string }) => `${f.workflowId}:${f.observationKey}`),
      ["example:stdout"],
    );
  });
});
