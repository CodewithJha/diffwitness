# HACK47 OFFGRID — Status Summary

**Status (29 Sep 2026): SemaDiff M0–M7 implemented; production finalization complete; deployment, public push, and video pending user.**

## Current State

| | |
|---|---|
| Product direction | **SemaDiff** (selected direction; **M7 COMPLETE**) |
| PackLock | **Abandoned / superseded** (`archive/packlock/`) |
| Discovery survivors | **1** (SemaDiff direction; PackLock no longer active) |
| Architecture | **Planning docs + M0–M7 code** in `packages/semadiff/` |
| Application Code | **M0–M7 COMPLETE** (M7 = live trusted hosted demo, MockAI only) — **M8 NOT started** |
| Research discovery | **CLOSED** |

---

## What Just Happened

**Milestone 7 implemented (29 Sep 2026)** under explicit user approval: **live trusted demo + host-agnostic Node hosting + MockAI only**. A `node:http` server in `packages/semadiff/src/hosted/` runs the real CLI (`init → baseline → trusted change → check → explain --provider mock`) on the shipped fixture in a fresh temp Git repo per request, relays real output + CLI JSON, and deletes the repo. No uploads, no arbitrary execution, no Featherless, no auth/DB/telemetry. Deploy from repo root: `npm install && npm run build && npm start`; `GET /health`. Not yet deployed to a public URL. See `docs/IMPLEMENTATION-PLAN.md` §15. **M8 not started.**

**Six-blocker remediation (28 Sep 2026):** the 2 P0 + 4 P1 findings from the post-M6 adversarial audit are fixed with regression tests — Ctrl-C/SIGTERM now exit 130/143 and persist nothing; `--workflow` subsets compare only selected workflows; `explain` refuses stale or incomplete results; timeouts kill the workflow's process group (POSIX); `ci --explain` exit precedence 3 > 1 > 4 > 0; the causal-language gate covers every model-generated field. P2/P3 audit items remain open. Not production-ready. **M7 not started.** See `research/DECISION-LOG.md`.

**Milestone 6 implemented** under explicit user authorization: **Change Surface + Evidence-to-Code Context**. `check` now records the Git change surface between the active baseline's commit and the executed repository state (files, status, renames, numstat metadata, `--unified=0` hunk locations), bounded and deterministic, and associates findings with it as **co-occurrence only — causality is never established**. DiffEngine findings/status/exit codes unchanged. EvidencePacket.v2 + prompt `explain.v2`; MockAI and Featherless receive the same reduced packet. Symbols deferred. See `docs/IMPLEMENTATION-PLAN.md` §13.

Earlier: **M5** Featherless live provider; **M4** CI/hardening; **M3** explain/MockAI; **M2** DiffEngine/`check`; **M1** capture; **M0** foundation; PackLock abandoned; SemaDiff direction selected.

---

## What Has Been Eliminated (historical)

- Cycle-1: CiteCheck, Action Receipt, Canary Session, Spec Triangle, Merge Preflight  
- Cycle-2 residual wells → 0 KEEP  
- Failure-Mode cycles 03–04 theses killed  
- AliasTripwire (Provider Sentinel)  
- ScopeBrake (MyChangeOrder)  
- Hunt v2: original OrderLock, DockShield, Chargeback Prevention Gate, FlowDiff, CaseProof  
- **PackLock** (abandoned 22 Sep 2026 — do not resurrect)

Do **not** revive those names or forbidden thesis classes in `research/ANTI-FORCING.md`.

---

## Immediate Actions

1. **Do not start M8** until explicitly authorized. Deploying the M7 server to a public URL is an operator step (not done by the agent).  
2. Mind calendar constraints before 30 Sep 2026 (other commitments).  
3. Do **not** extend historical Afterhours `src/`. Do **not** revive PackLock.

---

## Run SemaDiff (offline demos)

```bash
cd packages/semadiff
npm install
npm run typecheck && npm test && npm run build
npm run demo:m6   # change surface + association (Git vs SemaDiff vs AI vs causality)
npm run demo:m4   # CI gate variants
```

Or manually:

```bash
FIX=$(mktemp -d)
git -C "$FIX" init
git -C "$FIX" config user.email t@example.com
git -C "$FIX" config user.name t
mkdir -p "$FIX/fixtures"
cp -R fixtures/demo "$FIX/fixtures/demo"
printf 'demo\n' > "$FIX/README.md"
git -C "$FIX" add . && git -C "$FIX" commit -m init
npm run semadiff -- --repo "$FIX" init
git -C "$FIX" add .semadiff/config.yaml .semadiff/.gitignore
git -C "$FIX" commit -m "semadiff config"
npm run semadiff -- --repo "$FIX" baseline
# Mutate fixtures/demo/behavior.json (rank 1 → 2), then:
npm run semadiff -- --repo "$FIX" check          # findings + change surface + "Causality: not established"
npm run semadiff -- --repo "$FIX" explain --provider mock
```

CI uses **local-active baseline only** (no PR/merge-base inference). AI is off by default in `ci`. A baseline captured from a dirty tree makes the change surface `not_comparable`.

---

## Reminder

Calendar constraints before 30 Sep 2026 (other commitments) applied; M0–M6 were explicitly authorized.
