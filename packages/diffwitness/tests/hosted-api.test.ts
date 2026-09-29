import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { request } from "node:http";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { DEFAULT_HOSTED_CONFIG, HostedConfigError, loadHostedConfig } from "../src/hosted/config.js";
import { listDir, postDemo, startTestServer, type TestServer } from "./support/hosted-server.js";

const SECRET = `sk-hosted-test-${process.pid}-secret`;

describe("hosted config (env)", () => {
  it("defaults when unset; parses overrides", () => {
    assert.deepEqual(loadHostedConfig({}), DEFAULT_HOSTED_CONFIG);
    const c = loadHostedConfig({ PORT: "8080", HOST: "127.0.0.1", DEMO_MAX_CONCURRENT: "1", DEMO_REQUEST_TIMEOUT_MS: "5000" });
    assert.equal(c.port, 8080);
    assert.equal(c.host, "127.0.0.1");
    assert.equal(c.maxConcurrent, 1);
    assert.equal(c.requestTimeoutMs, 5000);
  });

  it("rejects invalid values and names the variable", () => {
    assert.throws(() => loadHostedConfig({ PORT: "abc" }), (e: unknown) => e instanceof HostedConfigError && /PORT/.test(e.message));
    assert.throws(() => loadHostedConfig({ DEMO_MAX_CONCURRENT: "0" }), /DEMO_MAX_CONCURRENT/);
    assert.throws(() => loadHostedConfig({ DEMO_MAX_CONCURRENT: "1000" }), /DEMO_MAX_CONCURRENT/);
    assert.throws(() => loadHostedConfig({ HOST: "a b;rm" }), /HOST/);
    assert.throws(
      () => loadHostedConfig({ DEMO_REQUEST_TIMEOUT_MS: "60000", DEMO_WORKSPACE_TTL_MS: "10000" }),
      /DEMO_WORKSPACE_TTL_MS/,
    );
  });
});

describe("hosted readiness without git", () => {
  it("/health stays live, /ready is 503, and valid demo requests are refused before anything runs", async () => {
    const server = await startTestServer({ gitCheck: async () => false });
    try {
      assert.equal((await fetch(`${server.baseUrl}/health`)).status, 200);
      const ready = await fetch(`${server.baseUrl}/ready`);
      assert.equal(ready.status, 503);
      assert.deepEqual(await ready.json(), { status: "not_ready", reason: "git_unavailable", checks: { git: "missing" } });
      const res = await postDemo(server.baseUrl, { scenario: "pricing-discount-change" });
      assert.equal(res.status, 503);
      assert.equal(res.json.error.code, "not_ready");
      assert.equal(res.headers.get("retry-after"), "5");
      assert.ok(!res.text.includes(path.sep + "fixtures"));
      assert.equal(server.demo.trackedWorkspaces(), 0);
      assert.equal(server.logs.filter((l) => l.event === "demo_finished").length, 0);
      assert.equal(server.logs.filter((l) => l.event === "dependency_missing").length, 1);
      const invalid = await postDemo(server.baseUrl, { scenario: "nope" });
      assert.equal(invalid.status, 400, "request validation still runs first");
    } finally {
      await server.close();
    }
  });
});

describe("hosted HTTP API (validation + security)", () => {
  let server: TestServer;
  const marker = path.join(os.tmpdir(), `diffwitness-hosted-rce-marker-${process.pid}`);

  before(async () => {
    process.env.FEATHERLESS_API_KEY = SECRET;
    server = await startTestServer();
  });

  after(async () => {
    delete process.env.FEATHERLESS_API_KEY;
    await server.close();
  });

  function assertNothingExecuted(): void {
    assert.equal(server.logs.filter((l) => l.event === "demo_finished").length, 0, "no demo may run");
    assert.equal(server.demo.trackedWorkspaces(), 0);
    assert.equal(existsSync(marker), false, "injected command must never run");
  }

  it("GET /health → 200 {status:ok}, JSON, no secrets or env even with FEATHERLESS_API_KEY set", async () => {
    const res = await fetch(`${server.baseUrl}/health`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /^application\/json/);
    const text = await res.text();
    assert.deepEqual(JSON.parse(text), { status: "ok" });
    const headerDump = JSON.stringify([...res.headers.entries()]);
    assert.ok(!text.includes(SECRET) && !headerDump.includes(SECRET));
    assert.ok(!text.includes(os.hostname()));
  });

  it("GET /ready → 200 once git is verified at startup", async () => {
    const res = await fetch(`${server.baseUrl}/ready`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: "ready", checks: { git: "ok" } });
    assert.equal((await fetch(`${server.baseUrl}/ready`, { method: "POST" })).status, 405);
  });

  it("sets CSP and basic security headers", async () => {
    const res = await fetch(`${server.baseUrl}/`);
    assert.equal(res.status, 200);
    const csp = res.headers.get("content-security-policy") ?? "";
    assert.match(csp, /default-src 'none'/);
    assert.match(csp, /script-src 'self'/);
    assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-frame-options"), "DENY");
    assert.equal(res.headers.get("referrer-policy"), "no-referrer");
    assert.match(await res.text(), /Causality: not established/);
  });

  it("serves only allowlisted static assets; traversal-looking paths are 404", async () => {
    for (const p of ["/app.js", "/styles.css", "/index.html"]) {
      assert.equal((await fetch(`${server.baseUrl}${p}`)).status, 200, p);
    }
    for (const p of ["/package.json", "/../package.json", "/%2e%2e/package.json", "/hosted/public/app.js", "/src/hosted/server.ts", "/etc/passwd", "//etc/passwd"]) {
      const res = await rawRequest(server.baseUrl, "GET", p);
      assert.equal(res.status, 404, p);
      assert.ok(!res.body.includes("diffwitness@") && !res.body.includes("root:"), p);
    }
  });

  it("GET /api/scenarios lists the trusted registry without filesystem paths", async () => {
    const res = await fetch(`${server.baseUrl}/api/scenarios`);
    const body = (await res.json()) as { scenarios: { id: string }[] };
    assert.deepEqual(body.scenarios.map((s) => s.id), ["pricing-discount-change"]);
    assert.ok(!JSON.stringify(body).includes(path.sep + "fixtures" + path.sep));
  });

  it("wrong methods → 405 with Allow; unknown routes → 404", async () => {
    const get = await fetch(`${server.baseUrl}/api/demo?command=touch%20${encodeURIComponent(marker)}`);
    assert.equal(get.status, 405);
    assert.equal(get.headers.get("allow"), "POST");
    const postHealth = await fetch(`${server.baseUrl}/health`, { method: "POST" });
    assert.equal(postHealth.status, 405);
    assert.equal((await fetch(`${server.baseUrl}/`, { method: "PUT" })).status, 405);
    assert.equal((await fetch(`${server.baseUrl}/api/run`, { method: "POST" })).status, 404);
    assertNothingExecuted();
  });

  it("wrong or missing content-type → 415", async () => {
    const res = await postDemo(server.baseUrl, { scenario: "pricing-discount-change" }, { headers: { "Content-Type": "text/plain" } });
    assert.equal(res.status, 415);
    const form = await postDemo(server.baseUrl, null, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      raw: "scenario=pricing-discount-change",
    });
    assert.equal(form.status, 415);
    const missing = await rawRequest(server.baseUrl, "POST", "/api/demo", '{"scenario":"pricing-discount-change"}');
    assert.equal(missing.status, 415);
    assertNothingExecuted();
  });

  it("oversize body → 413 (declared and chunked)", async () => {
    const big = JSON.stringify({ scenario: "pricing-discount-change", pad: "x".repeat(4096) });
    const res = await postDemo(server.baseUrl, null, { raw: big });
    assert.equal(res.status, 413);
    const chunked = await rawRequest(server.baseUrl, "POST", "/api/demo", big, {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
    });
    assert.equal(chunked.status, 413);
    assertNothingExecuted();
  });

  it("invalid JSON → 400", async () => {
    const res = await postDemo(server.baseUrl, null, { raw: "{scenario:" });
    assert.equal(res.status, 400);
    assert.equal(res.json.error.code, "invalid_json");
    assertNothingExecuted();
  });

  it("unknown scenario → 400 and never executes", async () => {
    const res = await postDemo(server.baseUrl, { scenario: "does-not-exist" });
    assert.equal(res.status, 400);
    assert.equal(res.json.error.code, "unknown_scenario");
    assertNothingExecuted();
  });

  it("path-like / traversal / shell-injection scenario values → 400, nothing runs", async () => {
    const values: unknown[] = [
      "../../etc/passwd",
      "/tmp",
      "fixtures/demo",
      "pricing-discount-change/../..",
      "pricing-discount-change; touch " + marker,
      "$(touch " + marker + ")",
      "`touch " + marker + "`",
      "pricing-discount-change\u0000",
      "Behavior-Change",
      "",
      "a".repeat(65),
      42,
      ["pricing-discount-change"],
      { id: "pricing-discount-change" },
      null,
    ];
    for (const scenario of values) {
      const res = await postDemo(server.baseUrl, { scenario });
      assert.equal(res.status, 400, JSON.stringify(scenario));
      assert.ok(["invalid_request", "unknown_scenario"].includes(res.json.error.code));
    }
    assertNothingExecuted();
  });

  it("command / repo / workflow / path / provider fields are rejected (strict schema), never executed", async () => {
    const bodies: unknown[] = [
      { scenario: "pricing-discount-change", command: `touch ${marker}` },
      { scenario: "pricing-discount-change", argv: ["touch", marker] },
      { scenario: "pricing-discount-change", repo: "https://example.com/evil.git" },
      { scenario: "pricing-discount-change", repoPath: "/" },
      { scenario: "pricing-discount-change", workflow: { command: ["touch", marker] } },
      { scenario: "pricing-discount-change", fixture: "../../" },
      { scenario: "pricing-discount-change", config: "workflows: []" },
      { scenario: "pricing-discount-change", provider: "featherless" },
      { scenario: "pricing-discount-change", env: { FEATHERLESS_API_KEY: "x" } },
      { command: `touch ${marker}` },
      [],
      "pricing-discount-change",
    ];
    for (const body of bodies) {
      const res = await postDemo(server.baseUrl, body);
      assert.equal(res.status, 400, JSON.stringify(body));
      assert.equal(res.json.error.code, "invalid_request");
    }
    const proto = await postDemo(server.baseUrl, null, {
      raw: `{"scenario":"pricing-discount-change","__proto__":{"command":"touch ${marker}"}}`,
    });
    assert.equal(proto.status, 400);
    assertNothingExecuted();
    assert.deepEqual(await listDir(server.workspaceParent), []);
  });

  it("error responses are concise JSON without stack traces or server paths", async () => {
    const res = await postDemo(server.baseUrl, null, { raw: "{bad" });
    assert.deepEqual(Object.keys(res.json), ["error"]);
    assert.ok(!res.text.includes("at ") && !res.text.includes(os.tmpdir()) && !res.text.includes(process.cwd()));
  });
});

function rawRequest(
  baseUrl: string,
  method: string,
  pathname: string,
  body?: string,
  headers: Record<string, string> = {},
): Promise<{ status: number; body: string }> {
  const url = new URL(baseUrl);
  return new Promise((resolve, reject) => {
    let responded = false;
    const req = request({ host: url.hostname, port: url.port, method, path: pathname, headers }, (res) => {
      responded = true;
      let data = "";
      res.on("data", (c: Buffer) => (data += c.toString("utf8")));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
      res.on("error", () => resolve({ status: res.statusCode ?? 0, body: data }));
    });
    req.on("error", (error) => {
      // After a 413 the server closes the socket; that is only acceptable once a response arrived.
      if (!responded) reject(error);
    });
    if (body !== undefined) {
      // Write in pieces so chunked encoding is exercised.
      for (let i = 0; i < body.length; i += 512) req.write(body.slice(i, i + 512));
    }
    req.end();
  });
}
