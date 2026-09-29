# DiffWitness

Detect behavioral changes that tests and Git diffs can miss — a local-first CLI. Evidence first, AI second.

Pipeline: execution → Evidence → DiffEngine → Git change surface + Finding↔ChangeSurface association (co-occurrence) → optional explain (MockAI **or** Featherless). AI is **off by default in CI** and never decides status or change-surface membership. A small hosted demo server ships alongside — see [Hosted demo](#hosted-demo).

## What / why

DiffWitness answers: *how did observable behavior change after a code change?* It runs configured workflows, captures normalized Evidence, diffs against a stored baseline, and optionally explains findings with MockAI.

It is **not** an AI Git diff, coding agent, or sandbox for untrusted repos.

## Requirements

- Node.js **20+**
- `git` on `PATH`

## Setup

```bash
cd packages/diffwitness
npm install
npm run typecheck && npm test && npm run build
```

## Quickstart (offline, the pricing example)

```bash
npm run demo     # scripts/demo-pricing.sh: copies fixtures/pricing into a temp git repo and runs
                 # init → baseline → DISCOUNT 0.1→0.2 → tests (pass) → check → explain → ci --fail-on warn (exit 1)
KEEP=1 npm run demo   # keep the temp repo to poke at it
```

`fixtures/pricing` is a tiny project: `bin/quote.mjs` prints the quote for a sample order (`{"total":315}`), and `test/pricing.test.mjs` checks shape and validation but not the total. Its `diffwitness.config.yaml` declares two workflows, `pricing` and `tests`. After the one-line change the tests still pass and `check` reports exactly one finding: `pricing · stdout`, `{"total":315}` → `{"total":280}`. Manual steps are in [`fixtures/pricing/README.md`](fixtures/pricing/README.md).

On your own repository: `diffwitness init` writes a commented template (`.diffwitness/config.yaml`) with a placeholder workflow `example`. Edit its `command`, commit the config, then `diffwitness baseline`. Running `baseline` on the unedited template exits 2 before anything runs.

More offline demos on the engine-test fixture: `npm run demo:m6` (change surface + association) and `npm run demo:m4` (CI gate variants).

## Hosted demo

A small `node:http` server (`src/hosted/`, static page in `hosted/public/`) that runs the **real** CLI on the trusted, built-in pricing example so a visitor can watch: `diffwitness init` → install the example's workflow config → `diffwitness baseline` → trusted change (`src/pricing.mjs`: `DISCOUNT 0.1 → 0.2`, shown with `git diff`) → `diffwitness check` → `diffwitness explain --provider mock` → the real `explain --json` output. The page leads with a summary card (verdict, tests PASS, behavior CHANGED, output before → after, observation counts, evidence IDs). The server is not part of the npm package.

### Deploy (any Node host: Render, Fly, Railway, a VM)

- **Requirements:** Node.js **20+**, `git` **≥ 2.28** on `PATH`, a POSIX host (Linux/macOS). No API key, no database, no disk persistence.
- **Directory:** the **repository root**.
- **Commands:**

```bash
npm install && npm run build && npm start
```

  Root `build` runs `npm ci --include=dev` + `npm run build` inside `packages/diffwitness`, so it works even when the host sets `NODE_ENV=production` (TypeScript is a devDependency). Root `start` runs `node packages/diffwitness/dist/hosted/server.js`. (From `packages/diffwitness` directly: `npm ci --include=dev && npm run build && npm start`.)
- **Health checks:** `GET /health` → `200 {"status":"ok"}` (liveness: the process is up). `GET /ready` → `200 {"status":"ready","checks":{"git":"ok"}}` once `git --version` succeeds; `503` with `reason: "git_unavailable"` (or `starting`) otherwise. Point the platform's readiness/health check at `/ready`.
- **Local smoke:** `npm run demo:m7` (build, start on a free port, `/health`, `/ready`, run the demo, assert, SIGTERM, clean up; prints `DEMO M7 OK`).

| Env var | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | Listen port (`0` = ephemeral; the `listening` log line shows it) |
| `HOST` | `0.0.0.0` | Bind address (PaaS routes to the container interface; use `127.0.0.1` locally) |
| `DEMO_MAX_CONCURRENT` | `2` | Concurrent demo runs; beyond that `503` + `Retry-After` (no queue) |
| `DEMO_REQUEST_TIMEOUT_MS` | `30000` | Hard limit for one `POST /api/demo` |
| `DEMO_STAGE_TIMEOUT_MS` | `15000` | Limit per child process (CLI stage or git setup command) |
| `DEMO_WORKSPACE_TTL_MS` | `120000` | Sweeper removes tracked workspaces older than this (must be ≥ request timeout + 5 s) |
| `DEMO_MAX_OUTPUT_BYTES` | `262144` | Cap on captured stdout and on stderr, per child |
| `DEMO_MAX_BODY_BYTES` | `1024` | Request body cap (`413` beyond) |
| `DEMO_SHUTDOWN_GRACE_MS` | `10000` | On SIGINT/SIGTERM: time for aborted runs to stop and clean up before exit |

Invalid values fail startup with the variable name. `FEATHERLESS_API_KEY` is never read or forwarded.

### API

- `GET /health` → `{"status":"ok"}` · `GET /ready` → readiness (above) · `GET /api/scenarios` → trusted scenario list
- `POST /api/demo`, `Content-Type: application/json`, body exactly `{"scenario":"pricing-discount-change"}`. Unknown/extra fields, path-like or unknown ids → `400`; wrong content type → `415`; oversize → `413`; not ready (git missing) or capacity → `503`.
- Response (`schemaVersion: 2`): `scenario` (incl. the installed `config` text), `status` (`completed | failed`), `failure` (`kind`: `stage_failed | analysis_error | explain_error | unexpected_result | stage_timeout | request_timeout | interrupted | internal_error`), `stages[]` (`id`, `label`, `command` display string, `outcome`, `exitCode`, `stdout`, `stderr`, `truncated`, `json`, `durationMs`), `findings` (each item with `before` / `after` = `{evidenceId, preview}`) and `explanation` copied from the CLI's `explain --json` (never recomputed), and `summary` — a presentation view derived from that same JSON (verdict, tests PASS/FAIL from the tests workflow's exit-code digest, output before → after from the evidence excerpts, observation counts, evidence IDs). HTTP `200` only for `completed`; `504` timeouts, `503` interrupted, `500` otherwise.
- Output scrubbing: the run's temp directory is shown as `<workspace>` (and the app install directory as `<app>`, only relevant in crash traces). Command labels omit the real `--repo <workspace>` argument. Nothing else in CLI output is changed; volatile ids (baseline/evidence UUIDs, durations) differ per run.

### Security model

The server **never executes visitor-supplied input**. The only input is a scenario id checked against a regex and a built-in registry; every executed argv is built from constants plus a server-created temp path, spawned without a shell. Each run gets a fresh `mkdtemp` workspace with a private `HOME`, system/global git config disabled and no git hooks, the child env is an allowlist (no API keys), and the workspace is removed on success, failure, timeout, client disconnect, and shutdown. It is **not a sandbox** — it only ever runs the shipped fixture. No accounts, analytics, visitor ids, database, or stored history. See `docs/THREAT-MODEL.md` §8.

## Change surface

After findings, `check` / `ci` / `explain` print:

```text
Change surface (Git: baseline <sha> → current <sha> + working tree): 2 file(s)
  M  README.md  +1 -0  (hunks: -1,0 +2)
  M  fixtures/demo/behavior.json  +1 -1  (hunks: -3 +3)
Association: 2 of 2 finding(s) co-occurred with this change surface (workflow demo @ source state <sha> + working tree)
Causality: not established — change-surface membership means co-occurrence only, not that a file caused a finding.
```

- **What it is:** files that differ (per Git) between the active baseline's commit and the repository state that was executed — committed, staged, unstaged, and untracked-not-ignored. Status `added | modified | deleted | renamed` (`oldPath` when git detects a rename); `+/-` counts are change metadata, never behavioral evidence; hunk ranges come from `git diff --unified=0` headers.
- **Association** (`associated | unavailable | not_comparable`): a finding is `associated` only when Git identities are comparable, the executed state matches the surface (checked before and after execution), and the finding cites current-execution evidence. It means co-occurrence — never causality. It never changes findings, severity, status, or exit codes.
- **not_comparable:** baseline captured from a dirty tree (commit, then re-baseline), missing SHA, or baseline commit not present locally. **unavailable:** git failure or the repo changed during execution.
- **Excluded:** gitignored files and DiffWitness operational dirs `.diffwitness/{evidence,blobs,baselines,runs,cache}` (counted as `excludedOperationalPaths`). `.diffwitness/config.yaml` is reported.
- **Limits:** 200 files, 500 locations, 512-char paths (longer paths omitted and counted), 64 000 serialized chars, 4 MiB git output per command; deterministic path order; any reduction sets `truncation.truncated`. Terminal shows ≤10 files.
- **Not done:** symbol attribution, call graphs, causal inference, provenance of generated files (they are listed like any other file), merge-base / PR bases.

## CI

```bash
# After baseline exists and config is committed (source-clean tree):
diffwitness ci
diffwitness ci --fail-on warn
diffwitness ci --fail-on never
diffwitness ci --allow-dirty          # override source-clean requirement
diffwitness ci --explain              # optional MockAI; still never decides status
```

### Baseline model (M4 limitation)

CI compares against the **local active baseline** (`.diffwitness/baselines/active.json`).  
There is **no** PR base, merge-base, or remote branch inference. Capture baseline in the same environment (or restore `.diffwitness` artifacts) before gating.

### Exit codes

| Code | Meaning |
|---|---|
| 0 | Success / acceptable (clean, or findings below `--fail-on`) |
| 1 | Findings at/above `--fail-on` |
| 2 | User/config/repo error (including missing baseline, source-dirty CI) |
| 3 | Analysis/execution failure |
| 4 | Explain failure (only when `--explain`) |
| 130 | Interrupted (SIGINT / Ctrl-C) |
| 143 | Interrupted (SIGTERM) |

**Invariants:** `analysis_error` never maps to clean; missing baseline never maps to clean; AI failure never maps to clean.

**Precedence with `--explain`:** `3` > `1` > `4` > `0`. An explain failure never hides an analysis error (`3`) or a gating finding (`1`); it yields `4` only when the check itself is acceptable.

**Interruption:** Ctrl-C / SIGTERM kills the running workflow's process group and saves nothing: no new or replaced active baseline, no Evidence, no BehavioralDiff, no verdict (exit 130 / 143). The interrupted workflow is never recorded as behavior. A workflow killed by a signal DiffWitness did not send is an execution failure (exit 3), not Evidence.

**`--workflow` subsets** (`check` / `ci`) compare only the selected workflows' baseline Evidence; a selected workflow missing from the active baseline is exit 2.

**`explain` never explains a stale result:** after a failed or interrupted check it exits 2 with `check_incomplete`; if the stored diff belongs to a superseded baseline (e.g. after `baseline --force`) it exits 2 with `check_stale`. Re-run `diffwitness check`.

### Severity mapping (`--fail-on`)

| Finding severity | `never` | `warn` | `error` (CI default) |
|---|---|---|---|
| info | exit 0 | exit 0 | exit 0 |
| warn | exit 0 | exit 1 | exit 0 |
| error | exit 0 | exit 1 | exit 1 |

Typical stdout/artifact deltas are **warn**; exit-code deltas are **error**.

### Dirty-tree policy

| Mode | Policy |
|---|---|
| Local `check` | Dirty trees allowed |
| `ci` | Requires **source-clean** working tree unless `--allow-dirty` |

DiffWitness operational paths under `.diffwitness/{evidence,blobs,baselines,runs,cache}/` are **not** treated as source changes. `.diffwitness/config.yaml` **is** source-relevant — commit it before CI.

### Machine-readable CI JSON

Stdout is always versioned JSON (`schemaVersion: 2`, `command: "ci"`) with `status`, `baseline`, `current`, `behavioralDiff` (incl. `changeSurface`), `findings` (incl. `associationStatus` / `changeSurfaceRefs`), `evidenceRefs`, `ai`, `limitations` (incl. `causality: "not_established"`), `metadata`. Deterministic ordering; no ANSI; timestamps only under `metadata.generatedAt` labeled `volatile: true`. v2 is additive over v1; exit semantics unchanged.

## AI honesty

- DiffEngine is source of truth for `clean` / `findings` / `analysis_error`
- MockAI explains offline (default); Featherless is optional live HTTP (`docs/FEATHERLESS-PROVIDER.md`)
- Never silent featherless→mock fallback; AI failure leaves findings intact (`explain_error`)
- One shared semantic gate for every provider checks every model-generated string (narrative, facts, hypotheses, citation claims, caveats, `promptVersion`, `modelId`): causal assertions ("caused", "due to", "because", "root cause", "resulted from", "triggered", "led to", …) are rejected with or without a change surface — hypotheses may only hedge ("may have …"); an `analysis_error` explanation may not claim clean / passed / safe to merge / no regressions. Rejection → `explain_error`; nothing from the rejected explanation is printed or serialized. This is a wording filter, not a proof of honesty.
- `ci` disables AI unless `--explain`

### Featherless setup (optional)

```bash
export FEATHERLESS_API_KEY=...   # https://featherless.ai/account/api-keys
# config: ai.provider: featherless  (+ ai.featherless.model / baseUrl / timeoutMs)
diffwitness explain --provider featherless
diffwitness ci --explain --provider featherless
```

Privacy: only the redacted EvidencePacket.v2 is sent (change-surface file list + association + `causality: "not_established"`; no file contents, no line locations). Keys never in logs/JSON. Live test: `DIFFWITNESS_FEATHERLESS_LIVE=1` + key (skipped otherwise).

## Security

- Argv-only process execution (`shell: false`), timeouts, stream bounds, cwd validation
- Workflow cleanup: on POSIX each workflow runs in its own process group; timeout, SIGINT/SIGTERM and shutdown SIGKILL the whole group (grandchildren included) and release its pipes, so a timeout bounds wall-clock time. Not covered: descendants that leave the group (`setsid`/daemonize), and background processes that a normally exiting workflow leaves running without holding its stdout/stderr (those still holding the pipes are killed at the timeout). **Windows:** no process groups — only the direct child is killed; descendants may outlive a timeout or interrupt.
- `execution.envPolicy`: `none` | `path` (default) | `all`
- Provider boundary: AI receives reduced EvidencePacket only — no shell tools
- **Repo trust:** DiffWitness executes workflows from local config in the analyzed repo. It is **not** a multi-tenant sandbox for untrusted code. See `docs/THREAT-MODEL.md`.

## Packaging

```bash
npm run build
npm pack --dry-run    # inspect; do not publish without name-collision check
```

Package is `"private": true`. Name `diffwitness` — verify npm registry before any publish claim.

### Fresh-install procedure

```bash
npm run build && npm pack
TMP=$(mktemp -d)
tar -xzf diffwitness-0.1.0.tgz -C "$TMP"
cd "$TMP/package"
node dist/cli/main.js --help
# fixtures/pricing ships in the tarball; see its README for the manual walkthrough
```

`tests/user-journey.test.ts` automates this: pack → install the tarball into a clean consumer → init → edit the template → baseline → change source → check → explain → `ci --fail-on warn` exits 1.

## Production-readiness honesty

**Supported:** init, baseline, check, explain (mock + Featherless), ci; hosted single-scenario demo (MockAI only); local-active baseline; deterministic DiffEngine; bounded Git change surface + co-occurrence association; fail-closed persistence/config versions; external AI hardening.

**Not supported:** GitHub/GitLab APIs, PR merge-base inference, history command, symbol attribution, call/dependency graphs, causal inference, agents, RAG, dashboard, telemetry, embeddings, model routing, hosted multi-tenant demo.

## Troubleshooting

| Symptom | Check |
|---|---|
| CI exit 2 “No active baseline” | Run `diffwitness baseline` first |
| CI exit 2 source-dirty | Commit changes or `--allow-dirty`; ignore `.diffwitness` ops via gitignore |
| Exit 3 analysis_error | Timeout/spawn/signal-killed workflow/corrupt storage — not a clean bill of health |
| `explain` exit 2 `check_incomplete` / `check_stale` | Last check failed/was interrupted, or baseline was replaced — re-run `diffwitness check` |
| Findings but exit 0 on `ci` | Default `--fail-on error`; use `--fail-on warn` to gate warn findings |
| Change surface `not_comparable` | Baseline was captured from a dirty tree — commit, then `diffwitness baseline --force` |

## Layout

```text
src/cli            → argv, help, exit codes
src/application    → init, baseline, check, explain, ci, dirty-policy, change-surface capture/format
src/domain         → types, DiffEngine, change surface + association, schemas, errors
src/ports          → AiProvider, Storage, Git, ProcessExecutor, Clock, IdGenerator
src/infrastructure → config, storage, git (+ diff parsers), executor, evidence, MockAI, Featherless
src/hosted         → hosted demo server (not in the npm package)
hosted/public      → static demo page (HTML/CSS/vanilla JS, strict CSP)
fixtures/pricing   → the demo example (quote CLI + unit tests + workflow config)
fixtures/demo      → deterministic engine-test workflow
scripts/demo-pricing.sh → offline end-to-end pricing demo (npm run demo)
scripts/demo-m4.sh → offline CI demo
scripts/demo-m6.sh → offline change-surface demo
scripts/demo-m7.sh → hosted demo smoke (production server)
```

## Contributor notes

- Prefer small modules; no giant files
- Run `npm run typecheck && npm test && npm run build` before claiming done
