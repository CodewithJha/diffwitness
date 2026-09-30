import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { after, before, describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exampleDir = path.resolve(packageRoot, "..", "..", "examples", "behavioral-change");

/**
 * Runs examples/behavioral-change/run.sh exactly as a contributor would, but against the CLI
 * source (via tsx) so the test does not depend on a concurrently rebuilt dist/.
 */
describe("examples/behavioral-change", { timeout: 120_000, skip: process.platform === "win32" }, () => {
  let tmp: string;
  let wrapper: string;

  before(async () => {
    tmp = await mkdtemp(path.join(os.tmpdir(), "diffwitness-example-test-"));
    wrapper = path.join(tmp, "diffwitness");
    await writeFile(
      wrapper,
      '#!/bin/sh\ncd "$DW_PACKAGE_ROOT" && exec node --import tsx src/cli/main.ts "$@"\n',
    );
    await chmod(wrapper, 0o755);
  });

  after(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("detects the shipping change while the project's tests keep passing", async () => {
    const sourceBefore = await readFile(path.join(exampleDir, "project", "src", "shipping.mjs"), "utf8");
    const { stdout } = await execFileAsync("bash", [path.join(exampleDir, "run.sh")], {
      env: { ...process.env, DIFFWITNESS_BIN: wrapper, DW_PACKAGE_ROOT: packageRoot, KEEP: "0" },
      maxBuffer: 8 * 1024 * 1024,
    });

    assert.match(stdout, /BEHAVIOR CHANGED \(status: findings\)/);
    assert.match(stdout, /quote\s+CHANGED\s+exit 0 \(pass\)\s+1 finding\(s\)/);
    assert.match(stdout, /tests\s+unchanged\s+exit 0 \(pass\)/);
    assert.match(stdout, /Before:\s+\{"subtotal":45,"shipping":5\.99,"total":50\.99\}/);
    assert.match(stdout, /After:\s+\{"subtotal":45,"shipping":0,"total":45\}/);
    assert.match(stdout, /Changed alongside \(Git\): src\/shipping\.mjs \(modified\)/);
    assert.match(stdout, /CAUSALITY: not established/);
    assert.match(stdout, /^exit=1$/m);
    assert.match(stdout, /EXAMPLE OK/);

    const sourceAfter = await readFile(path.join(exampleDir, "project", "src", "shipping.mjs"), "utf8");
    assert.equal(sourceAfter, sourceBefore, "the example must run in a temp repo, never in place");
  });
});
