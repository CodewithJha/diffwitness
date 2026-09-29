#!/usr/bin/env bash
# DiffWitness M7 hosted demo smoke: build → start the production server on a free port →
# /health → /ready → POST /api/demo (trusted scenario, MockAI only) → assert → stop → clean up.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

say() { printf '\n== %s ==\n' "$1"; }

TMP="$(mktemp -d "${TMPDIR:-/tmp}/diffwitness-m7-XXXXXX")"
SERVER_PID=""
cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill -TERM "$SERVER_PID" 2>/dev/null || true
    for _ in $(seq 1 50); do kill -0 "$SERVER_PID" 2>/dev/null || break; sleep 0.1; done
    kill -KILL "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT

say "build"
npm run build >/dev/null

say "start production server (PORT=0 → free port, no API key in env)"
env -i PATH="$PATH" HOME="$TMP" PORT=0 HOST=127.0.0.1 node dist/hosted/server.js >"$TMP/server.log" 2>&1 &
SERVER_PID=$!

PORT=""
for _ in $(seq 1 100); do
  PORT="$(sed -n 's/.*"event":"listening".*"port":\([0-9]*\).*/\1/p' "$TMP/server.log" | head -n 1)"
  [ -n "$PORT" ] && break
  kill -0 "$SERVER_PID" 2>/dev/null || { cat "$TMP/server.log"; exit 1; }
  sleep 0.1
done
[ -n "$PORT" ] || { echo "server did not start"; cat "$TMP/server.log"; exit 1; }
echo "listening on 127.0.0.1:$PORT"

say "GET /health + /ready + POST /api/demo {\"scenario\":\"pricing-discount-change\"}"
BASE="http://127.0.0.1:$PORT" node --input-type=module -e '
const base = process.env.BASE;
const fail = (msg) => { console.error("ASSERTION FAILED:", msg); process.exit(1); };
const SCENARIO = "pricing-discount-change";

const health = await fetch(`${base}/health`);
const h = await health.json();
if (health.status !== 200 || JSON.stringify(h) !== JSON.stringify({ status: "ok" })) fail("health");
console.log("health:", JSON.stringify(h));

let ready = null;
for (let i = 0; i < 50; i++) {
  const res = await fetch(`${base}/ready`);
  ready = { status: res.status, body: await res.json() };
  if (ready.status === 200) break;
  await new Promise((r) => setTimeout(r, 100));
}
if (ready.status !== 200 || ready.body.status !== "ready") fail(`ready ${JSON.stringify(ready)}`);
console.log("ready:", JSON.stringify(ready.body));

const rejected = await fetch(`${base}/api/demo`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ scenario: SCENARIO, command: "id" }),
});
if (rejected.status !== 400) fail("command field must be rejected");
console.log("extra command field: HTTP", rejected.status, "(rejected, not executed)");

const res = await fetch(`${base}/api/demo`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ scenario: SCENARIO }),
});
const r = await res.json();
if (res.status !== 200 || r.status !== "completed") fail(`demo status ${res.status} ${JSON.stringify(r.failure)}`);
for (const s of r.stages) {
  console.log(`$ ${s.command}`.padEnd(46), `exit=${s.exitCode}`, `${s.durationMs}ms`);
  if (s.exitCode !== 0) fail(`stage ${s.id}`);
}
const stage = (id) => r.stages.find((s) => s.id === id);
if (!/Baseline captured\./.test(stage("baseline").stdout)) fail("baseline");
if (!/^\+export const DISCOUNT = 0\.2;$/m.test(stage("change").stdout)) fail("change applied");
if (r.findings.status !== "findings" || r.findings.items.length !== 1) fail("check findings");
const s = r.summary;
if (s.verdict !== "BEHAVIOR CHANGED" || s.tests.result !== "PASS" || s.tests.changed) fail("summary tests/verdict");
if (!s.output || s.output.before !== "{\"total\":315}" || s.output.after !== "{\"total\":280}") fail("summary output");
const cs = r.findings.changeSurface;
if (!cs || !cs.files.some((f) => f.path === "src/pricing.mjs")) fail("change surface");
if (cs.causality !== "not_established") fail("causality");
const e = r.explanation;
if (e.status !== "ok" || e.provider !== "mock" || e.citedEvidenceIds.length < 1) fail("MockAI explanation");
if (!/CAUSALITY: not established/.test(e.narrative)) fail("explanation causality line");
console.log("summary:", s.headline);
console.log("findings:", r.findings.items.map((f) => `[${f.severity}] ${f.observationKey}`).join(", "));
console.log("change surface:", cs.files.map((f) => `${f.status} ${f.path}`).join(", "), "| causality:", cs.causality);
console.log("explanation:", e.provider, e.promptVersion, "| evidence refs:", e.citedEvidenceIds.length);
'

say "stop server (SIGTERM → graceful shutdown)"
kill -TERM "$SERVER_PID"
wait "$SERVER_PID" || true
SERVER_PID=""
grep -q '"event":"shutdown_complete","trackedWorkspaces":0' "$TMP/server.log" || { cat "$TMP/server.log"; exit 1; }
echo "shutdown complete; no tracked workspaces"

echo
echo "DEMO M7 OK"
