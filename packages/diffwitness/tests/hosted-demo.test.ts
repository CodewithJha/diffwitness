import assert from "node:assert/strict";
import { mkdtemp, readFile, realpath, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import {
  buildChildEnv,
  scrubWorkspacePaths,
  WORKSPACE_PLACEHOLDER,
} from "../src/hosted/cli-invocation.js";
import { PACKAGE_ROOT, PRICING_SCENARIO } from "../src/hosted/scenarios.js";
import { WorkspaceTracker } from "../src/hosted/workspace.js";
import {
  hangingWorkflow,
  isAlive,
  listDir,
  postDemo,
  readPid,
  registry,
  replaceWorkflow,
  startTestServer,
  testScenario,
  waitFor,
  type TestServer,
} from "./support/hosted-server.js";

const POSIX = process.platform !== "win32";
const SECRET = `sk-hosted-demo-${process.pid}-secret`;

async function scratchDir(prefix: string): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("hosted demo: golden scenario (pricing-discount-change)", () => {
  let server: TestServer;
  let res: Awaited<ReturnType<typeof postDemo>>;

  before(async () => {
    process.env.FEATHERLESS_API_KEY = SECRET;
    server = await startTestServer();
    res = await postDemo(server.baseUrl, { scenario: "pricing-discount-change" });
  });

  after(async () => {
    delete process.env.FEATHERLESS_API_KEY;
    await server.close();
  });

  it("completes with a versioned response and every stage exits 0", () => {
    assert.equal(res.status, 200, res.text.slice(0, 2000));
    assert.equal(res.json.schemaVersion, 2);
    assert.equal(res.json.status, "completed");
    assert.equal(res.json.failure, null);
    assert.equal(res.json.scenario.id, "pricing-discount-change");
    assert.match(res.json.scenario.config, /- id: pricing\n/);
    assert.match(res.json.scenario.config, /- id: tests\n/);
    assert.deepEqual(
      res.json.stages.map((s: { id: string }) => s.id),
      ["init", "baseline", "change", "check", "explain", "explain-json"],
    );
    for (const stage of res.json.stages) {
      assert.equal(stage.outcome, "exited", stage.id);
      assert.equal(stage.exitCode, 0, stage.id);
      assert.equal(stage.truncated, false, stage.id);
      assert.ok(Number.isInteger(stage.durationMs), stage.id);
    }
  });

  it("baseline, the one-line source change, and check output come from the real CLI / git", () => {
    const stage = (id: string) => res.json.stages.find((s: { id: string }) => s.id === id);
    assert.equal(stage("baseline").command, "diffwitness baseline");
    assert.match(stage("baseline").stdout, /^Baseline captured\./);
    assert.match(stage("baseline").stdout, /Dirty:\s+false/);
    assert.match(stage("baseline").stdout, /Workflows:\s+pricing, tests/);
    assert.equal(stage("change").command, "git diff");
    const diff = stage("change").stdout as string;
    assert.match(diff, /^-export const DISCOUNT = 0\.1;$/m);
    assert.match(diff, /^\+export const DISCOUNT = 0\.2;$/m);
    assert.equal(diff.match(/^diff --git/gm)?.length, 1, "only src/pricing.mjs changes");
    assert.equal(diff.match(/^[-+][^-+]/gm)?.length, 2, "exactly one line replaced");
    const check = stage("check").stdout as string;
    assert.match(check, /^BEHAVIOR CHANGED \(status: findings\)\n/);
    assert.match(check, /^Observations: 11 unchanged · 1 changed · 0 appeared · 0 disappeared$/m);
    assert.match(check, /^ {2}tests {4}unchanged {2}exit 0 \(pass\)$/m);
    assert.match(check, /^Finding 1\/1 {2}\[warn\] pricing · stdout — Normalized stdout changed/m);
    assert.match(check, /^ {2}Before: {3}\{"total":315\}$/m);
    assert.match(check, /^ {2}After: {4}\{"total":280\}$/m);
    assert.match(check, /^ {2}Evidence: baseline ev_\S+ → current ev_\S+$/m);
    assert.match(check, /^ {2}Changed alongside \(Git\): src\/pricing\.mjs \(modified\)$/m);
    assert.match(check, /Change surface \(Git: baseline [0-9a-f]{12} → current [0-9a-f]{12} \+ working tree\): 1 file\(s\)/);
    assert.match(check, /Causality: not established/);
  });

  it("exactly one finding: pricing stdout 315 → 280, with baseline and current evidence", () => {
    const f = res.json.findings;
    assert.equal(f.source, "diffwitness explain --provider mock --json");
    assert.equal(f.status, "findings");
    assert.equal(f.items.length, 1);
    const [item] = f.items;
    assert.equal(item.workflowId, "pricing");
    assert.equal(item.observationKey, "stdout");
    assert.equal(item.findingType, "stdout_changed");
    assert.equal(item.severity, "warn");
    assert.equal(item.associationStatus, "associated");
    assert.equal(item.evidenceIds.length, 2);
    assert.ok(item.evidenceIds.every((id: string) => id.startsWith("ev_")));
    assert.deepEqual(item.before, { evidenceId: item.evidenceIds[0], preview: '{"total":315}\n' });
    assert.deepEqual(item.after, { evidenceId: item.evidenceIds[1], preview: '{"total":280}\n' });
    const cs = f.changeSurface;
    assert.deepEqual(cs.files.map((x: { path: string }) => x.path), ["src/pricing.mjs"]);
    assert.equal(cs.causality, "not_established");
    assert.equal(cs.associationStatus, "associated");
    const json = res.json.stages.at(-1).json;
    assert.deepEqual(f.items.map((i: { id: string }) => i.id), json.behavioralDiff.findings.map((i: { id: string }) => i.id));
    assert.deepEqual(json.behavioralDiff.affectedWorkflows, ["pricing"], "tests workflow unchanged");
  });

  it("summary card is derived from the CLI JSON: tests PASS unchanged, behavior CHANGED", () => {
    const s = res.json.summary;
    const json = res.json.stages.at(-1).json;
    assert.equal(s.verdict, "BEHAVIOR CHANGED");
    assert.equal(s.status, json.behavioralDiff.status);
    assert.deepEqual(s.tests, { workflowId: "tests", result: "PASS", changed: false });
    assert.deepEqual(s.behavior, { workflowId: "pricing", changed: true });
    assert.deepEqual(s.output, { workflowId: "pricing", observationKey: "stdout", before: '{"total":315}', after: '{"total":280}' });
    assert.deepEqual(s.observations, { unchanged: 11, changed: 1, appeared: 0, disappeared: 0 });
    assert.equal(s.findingCount, 1);
    assert.deepEqual(s.evidence, { baseline: json.behavioralDiff.baselineEvidenceIds, current: json.behavioralDiff.currentEvidenceIds });
    assert.equal(s.causality, "not_established");
    assert.equal(s.headline, 'Tests: PASS (unchanged) · Behavior: CHANGED · {"total":315} → {"total":280} · 11 unchanged · 1 changed');
  });

  it("MockAI explanation succeeds, cites only finding evidence, states causality not established", () => {
    const e = res.json.explanation;
    assert.equal(e.status, "ok");
    assert.equal(e.provider, "mock");
    assert.equal(e.promptVersion, "explain.v2");
    assert.equal(e.error, null);
    assert.ok(e.citedEvidenceIds.length >= 1);
    const findingEvidence = new Set(res.json.findings.items.flatMap((i: { evidenceIds: string[] }) => i.evidenceIds));
    for (const id of e.citedEvidenceIds) assert.ok(findingEvidence.has(id), id);
    assert.match(e.narrative, /CAUSALITY: not established/);
    const explain = res.json.stages.find((s: { id: string }) => s.id === "explain");
    assert.equal(explain.command, "diffwitness explain --provider mock");
    assert.match(explain.stdout, /Explanation \(mock; explain\.v2\)/);
  });

  it("MockAI received only the CLI's reduced EvidencePacket (no line locations, redaction applied)", () => {
    const json = res.json.stages.at(-1).json;
    assert.equal(json.metadata.provider, "mock");
    assert.equal(json.packet.schemaVersion, 2);
    assert.equal(json.packet.changeSurface.causality, "not_established");
    assert.equal("locations" in json.packet.changeSurface, false);
    assert.equal(typeof json.packet.redactionApplied, "boolean");
  });

  it("leaks no server paths or secrets; workspace path scrubbed; workspace removed", async () => {
    assert.ok(!res.text.includes(SECRET));
    assert.ok(!res.text.includes(server.workspaceParent));
    assert.ok(!res.text.includes(await realpath(server.workspaceParent)));
    assert.ok(!res.text.includes(process.cwd()));
    assert.ok(res.text.includes(WORKSPACE_PLACEHOLDER));
    assert.equal(res.json.stages.at(-1).json.repoRoot, `${WORKSPACE_PLACEHOLDER}/repo`);
    assert.deepEqual(await listDir(server.workspaceParent), []);
    assert.equal(server.demo.trackedWorkspaces(), 0);
    assert.equal(server.demo.activeRuns(), 0);
  });
});

describe("hosted demo: failure propagation (trusted test scenarios)", () => {
  let server: TestServer;

  before(async () => {
    server = await startTestServer({
      scenarios: registry(
        testScenario("analysis-error", {
          change: {
            summary: "workflow killed by a signal",
            apply: (repo) => replaceWorkflow(repo, 'process.kill(process.pid, "SIGKILL");\n'),
          },
        }),
        testScenario("explain-fails", {
          beforeExplain: (repo) => unlink(path.join(repo, ".diffwitness", "runs", "last-check.json")),
        }),
        testScenario("no-change", { change: { summary: "nothing", apply: async () => {} } }),
      ),
    });
  });

  after(async () => server.close());

  it("analysis error stays an error (never completed / clean)", async () => {
    const res = await postDemo(server.baseUrl, { scenario: "analysis-error" });
    assert.equal(res.status, 500);
    assert.equal(res.json.status, "failed");
    assert.equal(res.json.failure.kind, "analysis_error");
    assert.equal(res.json.failure.stage, "check");
    assert.equal(res.json.stages.at(-1).id, "check");
    assert.equal(res.json.stages.at(-1).exitCode, 3);
    assert.equal(res.json.findings, null);
    assert.equal(res.json.explanation, null);
    assert.deepEqual(await listDir(server.workspaceParent), []);
  });

  it("explanation failure is reported as explain_error, not success", async () => {
    const res = await postDemo(server.baseUrl, { scenario: "explain-fails" });
    assert.equal(res.status, 500);
    assert.equal(res.json.status, "failed");
    assert.equal(res.json.failure.kind, "explain_error");
    assert.equal(res.json.failure.stage, "explain");
    const explain = res.json.stages.at(-1);
    assert.equal(explain.id, "explain");
    assert.notEqual(explain.exitCode, 0);
    const check = res.json.stages.find((s: { id: string }) => s.id === "check");
    assert.match(check.stdout, /^BEHAVIOR CHANGED \(status: findings\)\n/, "findings stay findings in the check output");
    assert.deepEqual(await listDir(server.workspaceParent), []);
  });

  it("an unexpected clean result is not presented as the scenario succeeding", async () => {
    const res = await postDemo(server.baseUrl, { scenario: "no-change" });
    assert.equal(res.json.status, "failed");
    assert.equal(res.json.failure.kind, "unexpected_result");
    assert.match(res.json.failure.message, /Expected check status findings, got clean/);
  });
});

describe("hosted demo: timeouts, abort, concurrency, shutdown, cleanup", { skip: !POSIX }, () => {
  let scratch: string;

  before(async () => {
    scratch = await scratchDir("diffwitness-hosted-pids-");
  });

  after(async () => rm(scratch, { recursive: true, force: true }));

  function hangingScenario(id: string, pidFile: string) {
    return testScenario(id, {
      change: { summary: "workflow hangs", apply: (repo) => replaceWorkflow(repo, hangingWorkflow(pidFile)) },
    });
  }

  it("request timeout → 504 request_timeout; workflow process killed; workspace removed", async () => {
    const pidFile = path.join(scratch, "request-timeout.pid");
    const server = await startTestServer({
      config: { requestTimeoutMs: 3_000, stageTimeoutMs: 20_000 },
      scenarios: registry(hangingScenario("hang", pidFile)),
    });
    try {
      const res = await postDemo(server.baseUrl, { scenario: "hang" });
      assert.equal(res.status, 504);
      assert.equal(res.json.status, "failed");
      assert.equal(res.json.failure.kind, "request_timeout");
      assert.equal(res.json.failure.stage, "check");
      const pid = await readPid(pidFile);
      assert.ok(pid !== null, "workflow started");
      await waitFor(() => !isAlive(pid), 5_000);
      assert.deepEqual(await listDir(server.workspaceParent), []);
      assert.equal(server.demo.activeRuns(), 0);
    } finally {
      await server.close();
    }
  });

  it("stage timeout → 504 stage_timeout (distinct from request timeout); cleanup", async () => {
    const pidFile = path.join(scratch, "stage-timeout.pid");
    const server = await startTestServer({
      config: { requestTimeoutMs: 30_000, stageTimeoutMs: 3_000 },
      scenarios: registry(hangingScenario("hang", pidFile)),
    });
    try {
      const res = await postDemo(server.baseUrl, { scenario: "hang" });
      assert.equal(res.status, 504);
      assert.equal(res.json.failure.kind, "stage_timeout");
      assert.equal(res.json.stages.at(-1).outcome, "timed_out");
      const pid = await readPid(pidFile);
      assert.ok(pid !== null);
      await waitFor(() => !isAlive(pid), 5_000);
      assert.deepEqual(await listDir(server.workspaceParent), []);
    } finally {
      await server.close();
    }
  });

  it("client disconnect aborts the run and removes the workspace", async () => {
    const pidFile = path.join(scratch, "disconnect.pid");
    const server = await startTestServer({ scenarios: registry(hangingScenario("hang", pidFile)) });
    try {
      const controller = new AbortController();
      const pending = postDemo(server.baseUrl, { scenario: "hang" }, { signal: controller.signal }).catch(() => null);
      await waitFor(async () => (await readPid(pidFile)) !== null);
      controller.abort();
      await pending;
      await waitFor(() => server.demo.activeRuns() === 0, 10_000);
      await waitFor(async () => (await listDir(server.workspaceParent)).length === 0, 5_000);
      const pid = (await readPid(pidFile))!;
      await waitFor(() => !isAlive(pid), 5_000);
      const finished = server.logs.find((l) => l.event === "demo_finished");
      assert.equal(finished?.failure, "interrupted");
    } finally {
      await server.close();
    }
  });

  it("concurrency limit → 503 busy with Retry-After; no extra process started", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const server = await startTestServer({
      config: { maxConcurrent: 1 },
      scenarios: registry(
        testScenario("slow", {
          change: {
            summary: "waits for the test",
            apply: async (repo) => {
              await gate;
              await PRICING_SCENARIO.change.apply(repo);
            },
          },
        }),
      ),
    });
    try {
      const first = postDemo(server.baseUrl, { scenario: "slow" });
      await waitFor(() => server.demo.activeRuns() === 1);
      const busy = await postDemo(server.baseUrl, { scenario: "slow" });
      assert.equal(busy.status, 503);
      assert.equal(busy.json.error.code, "busy");
      assert.equal(busy.headers.get("retry-after"), "5");
      assert.equal((await listDir(server.workspaceParent)).length, 1, "only the first run has a workspace");
      release();
      const done = await first;
      assert.equal(done.status, 200);
      assert.equal(done.json.status, "completed");
      assert.deepEqual(await listDir(server.workspaceParent), []);
    } finally {
      release();
      await server.close();
    }
  });

  it("shutdown aborts active runs (interrupted), kills children, removes workspaces, refuses new work", async () => {
    const pidFile = path.join(scratch, "shutdown.pid");
    const server = await startTestServer({
      config: { shutdownGraceMs: 8_000 },
      scenarios: registry(hangingScenario("hang", pidFile)),
    });
    try {
      const pending = postDemo(server.baseUrl, { scenario: "hang" });
      await waitFor(async () => (await readPid(pidFile)) !== null);
      const stopped = server.demo.shutdown();
      const late = await postDemo(server.baseUrl, { scenario: "hang" }).catch(() => "refused" as const);
      assert.ok(late === "refused" || late.status === 503, "no new run during shutdown");
      const res = await pending;
      assert.equal(res.status, 503);
      assert.equal(res.json.failure.kind, "interrupted");
      assert.match(res.json.failure.message, /shutting down/);
      await stopped;
      assert.equal(server.demo.activeRuns(), 0);
      assert.equal(server.demo.trackedWorkspaces(), 0);
      assert.deepEqual(await listDir(server.workspaceParent), []);
      const pid = (await readPid(pidFile))!;
      await waitFor(() => !isAlive(pid), 5_000);
    } finally {
      await server.close();
    }
  });
});

describe("hosted demo: child environment + scrubbing + workspace tracker", () => {
  it("CLI children get an allowlisted env: no FEATHERLESS_API_KEY or other server env", async () => {
    const scratch = await scratchDir("diffwitness-hosted-env-");
    const envFile = path.join(scratch, "env.json");
    const script = path.join(scratch, "fake-cli.mjs");
    await writeFile(
      script,
      `import { writeFileSync } from "node:fs";\nwriteFileSync(${JSON.stringify(envFile)}, JSON.stringify(process.env));\n`,
    );
    process.env.FEATHERLESS_API_KEY = SECRET;
    process.env.DIFFWITNESS_HOSTED_TEST_SECRET = SECRET;
    const server = await startTestServer({ cliCommand: [process.execPath, script] });
    try {
      const res = await postDemo(server.baseUrl, { scenario: "pricing-discount-change" });
      assert.equal(res.json.status, "failed", "fake CLI cannot complete the demo");
      const childEnv = JSON.parse(await readFile(envFile, "utf8")) as Record<string, string>;
      assert.equal(childEnv.FEATHERLESS_API_KEY, undefined);
      assert.equal(childEnv.DIFFWITNESS_HOSTED_TEST_SECRET, undefined);
      assert.ok(!JSON.stringify(childEnv).includes(SECRET));
      assert.equal(childEnv.GIT_CONFIG_NOSYSTEM, "1");
      assert.ok(childEnv.HOME?.startsWith(server.workspaceParent), "HOME is inside the run workspace");
      const allowed = new Set(["PATH", "HOME", "GIT_CONFIG_NOSYSTEM", "GIT_CONFIG_GLOBAL", "GIT_TERMINAL_PROMPT", "NO_COLOR", "LC_ALL"]);
      // Node/macOS may inject a few process-level vars; none of the server's own vars may appear.
      for (const key of Object.keys(childEnv)) {
        assert.ok(allowed.has(key) || !(key in process.env) || key === "__CF_USER_TEXT_ENCODING", `unexpected ${key}`);
      }
      assert.ok(!res.text.includes(SECRET));
      assert.deepEqual(await listDir(server.workspaceParent), []);
    } finally {
      delete process.env.FEATHERLESS_API_KEY;
      delete process.env.DIFFWITNESS_HOSTED_TEST_SECRET;
      await server.close();
      await rm(scratch, { recursive: true, force: true });
    }
  });

  it("buildChildEnv never includes provider keys", () => {
    process.env.FEATHERLESS_API_KEY = SECRET;
    try {
      const env = buildChildEnv({ root: "/w", realRoot: "/w", repoDir: "/w/repo", homeDir: "/w/home", createdAt: 0 });
      assert.deepEqual(Object.keys(env).sort(), ["GIT_CONFIG_GLOBAL", "GIT_CONFIG_NOSYSTEM", "GIT_TERMINAL_PROMPT", "HOME", "LC_ALL", "NO_COLOR", "PATH"]);
      assert.equal(env.HOME, "/w/home");
    } finally {
      delete process.env.FEATHERLESS_API_KEY;
    }
  });

  it("scrubWorkspacePaths replaces workspace roots and the app root only", () => {
    const ws = { root: "/tmp/x-1", realRoot: "/private/tmp/x-1", repoDir: "", homeDir: "", createdAt: 0 };
    assert.equal(
      scrubWorkspacePaths("Repository: /private/tmp/x-1/repo and /tmp/x-1/repo; ev_abc sha256:ff", ws),
      "Repository: <workspace>/repo and <workspace>/repo; ev_abc sha256:ff",
    );
    const trace = `at file://${PACKAGE_ROOT}/dist/cli/main.js:3:1`;
    assert.equal(scrubWorkspacePaths(trace, ws), "at file://<app>/dist/cli/main.js:3:1");
  });

  it("WorkspaceTracker creates unique dirs and the sweeper removes expired ones", async () => {
    const parent = await scratchDir("diffwitness-hosted-ws-");
    try {
      const tracker = new WorkspaceTracker(parent);
      const a = await tracker.create();
      const b = await tracker.create();
      assert.notEqual(a.root, b.root);
      assert.equal(tracker.size, 2);
      assert.equal(await tracker.removeOlderThan(60_000), 0);
      assert.equal(await tracker.removeOlderThan(60_000, Date.now() + 120_000), 2);
      assert.equal(tracker.size, 0);
      assert.deepEqual(await listDir(parent), []);
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });
});
