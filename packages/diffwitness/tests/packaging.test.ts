import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readdir, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("packaging", () => {
  it("package.json declares bin, engines, files, license, name", async () => {
    const pkg = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
    assert.equal(pkg.name, "diffwitness");
    assert.equal(pkg.license, "MIT");
    assert.ok(pkg.engines?.node?.includes("20"));
    assert.equal(pkg.bin?.diffwitness, "./dist/cli/main.js");
    assert.ok(Array.isArray(pkg.files));
    assert.ok(pkg.files.includes("dist"));
    assert.equal(pkg.private, true);
  });

  it("npm pack produces tarball with dist CLI entry", async () => {
    // Ensure dist exists
    await execFileAsync("npm", ["run", "build"], { cwd: packageRoot });
    if (process.platform !== "win32") {
      // `npm link` points at dist/cli/main.js directly, so a rebuild must keep it executable.
      const { mode } = await stat(path.join(packageRoot, "dist", "cli", "main.js"));
      assert.ok(mode & 0o100, "dist/cli/main.js must be executable after build");
    }
    const tmp = await mkdtemp(path.join(os.tmpdir(), "diffwitness-pack-"));
    try {
      const { stdout } = await execFileAsync("npm", ["pack", "--pack-destination", tmp], {
        cwd: packageRoot,
      });
      const tarballName = stdout.trim().split("\n").pop();
      assert.ok(tarballName?.endsWith(".tgz"));
      const tarball = path.join(tmp, tarballName!);
      const { stdout: listing } = await execFileAsync("tar", ["-tzf", tarball]);
      assert.ok(listing.includes("package/dist/cli/main.js"));
      assert.ok(listing.includes("package/package.json"));
      assert.ok(!listing.includes("node_modules/"));
      assert.ok(listing.includes("package/fixtures/pricing/bin/quote.mjs"));
      assert.ok(!listing.includes("package/dist/hosted/"));
      // Smoke: extract and require package.json name
      const extractDir = path.join(tmp, "extract");
      await execFileAsync("mkdir", ["-p", extractDir]);
      await execFileAsync("tar", ["-xzf", tarball, "-C", extractDir]);
      const packedPkg = JSON.parse(
        await readFile(path.join(extractDir, "package", "package.json"), "utf8"),
      );
      assert.equal(packedPkg.name, "diffwitness");
      const entries = await readdir(path.join(extractDir, "package", "dist", "cli"));
      assert.ok(entries.includes("main.js"));
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });
});
