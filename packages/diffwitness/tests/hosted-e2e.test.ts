import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { cp, mkdtemp, rm, symlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSIX = process.platform !== "win32";

/**
 * Production path: stage the package in a temp dir (so the concurrently running packaging test's
 * `npm run build` cannot race on ./dist), `npm run build`, then `npm start` with PORT=0 and no API
 * key in the environment.
 */
describe("hosted E2E: npm run build && npm start", { skip: !POSIX }, () => {
  it("serves /health and a complete MockAI demo from built dist via the start script", async () => {
    const stage = await mkdtemp(path.join(os.tmpdir(), "diffwitness-hosted-e2e-"));
    let server: ReturnType<typeof spawn> | undefined;
    try {
      for (const entry of ["package.json", "package-lock.json", "tsconfig.json", "src", "fixtures", "hosted"]) {
        await cp(path.join(packageRoot, entry), path.join(stage, entry), { recursive: true });
      }
      await symlink(path.join(packageRoot, "node_modules"), path.join(stage, "node_modules"), "dir");
      await execFileAsync("npm", ["run", "build"], { cwd: stage });

      const env: NodeJS.ProcessEnv = { PATH: process.env.PATH, HOME: stage, PORT: "0", HOST: "127.0.0.1" };
      server = spawn("npm", ["start"], { cwd: stage, env, detached: true, stdio: ["ignore", "pipe", "pipe"] });
      let log = "";
      server.stdout!.on("data", (c: Buffer) => (log += c.toString("utf8")));
      server.stderr!.on("data", (c: Buffer) => (log += c.toString("utf8")));
      const exited = new Promise<void>((resolve) => server!.on("close", () => resolve()));

      const port = await waitForPort(() => log, 20_000);
      const base = `http://127.0.0.1:${port}`;

      const health = await fetch(`${base}/health`);
      assert.equal(health.status, 200);
      assert.deepEqual(await health.json(), { status: "ok" });
      await waitForReady(base, 10_000);

      const res = await fetch(`${base}/api/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: "pricing-discount-change" }),
      });
      const body = (await res.json()) as any;
      assert.equal(res.status, 200, JSON.stringify(body.failure));
      assert.equal(body.status, "completed");
      const byId = (id: string) => body.stages.find((s: { id: string }) => s.id === id);
      assert.equal(byId("baseline").exitCode, 0);
      assert.match(byId("baseline").stdout, /Baseline captured\./);
      assert.match(byId("change").stdout, /^\+export const DISCOUNT = 0\.2;$/m);
      assert.equal(body.findings.status, "findings");
      assert.equal(body.findings.items.length, 1);
      assert.equal(body.summary.headline, 'Tests: PASS (unchanged) · Behavior: CHANGED · {"total":315} → {"total":280} · 11 unchanged · 1 changed');
      assert.deepEqual(body.findings.changeSurface.files.map((f: { path: string }) => f.path), ["src/pricing.mjs"]);
      assert.equal(body.findings.changeSurface.causality, "not_established");
      assert.equal(body.explanation.status, "ok");
      assert.equal(body.explanation.provider, "mock");
      assert.ok(body.explanation.citedEvidenceIds.length >= 1);
      assert.ok(!JSON.stringify(body).includes(stage));

      process.kill(-server.pid!, "SIGTERM");
      await exited;
      assert.match(log, /"event":"shutdown_complete","trackedWorkspaces":0/);
      server = undefined;
    } finally {
      if (server?.pid !== undefined) {
        try {
          process.kill(-server.pid, "SIGKILL");
        } catch {
          // already gone
        }
      }
      await rm(stage, { recursive: true, force: true });
    }
  });
});

async function waitForReady(base: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(`${base}/ready`);
    if (res.status === 200) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error("server never became ready");
}

async function waitForPort(read: () => string, timeoutMs: number): Promise<number> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const match = /"event":"listening".*?"port":(\d+)/.exec(read());
    if (match) return Number(match[1]);
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`server did not start:\n${read()}`);
}
