# DiffWitness — Implementation Plan

**Status:** M0–M7 implemented; finalization for submission in progress  
**Date:** 22 September 2026  
**PRD:** `docs/DIFFWITNESS-PRD.md`  
**Code:** `packages/diffwitness/`

---

## 1. First language + stack (decision)

### Recommendation: **TypeScript (Node 20+)** for the CLI

| Criterion | TypeScript | Python |
|---|---|---|
| CLI packaging for JS/TS demo fixtures | Excellent (same runtime as fixture) | Good, extra runtime for TS fixtures |
| Typed domain model / JSON schemas | Strong (`zod` or similar — add only when needed) | Strong (`pydantic`) |
| Git + child process control | Mature | Mature |
| Hackathon audience / judge familiarity | High for web/devtool demos | High |
| AST later (`ts-morph`) | Native to first language | Better for Python repos |
| Featherless OpenAI-compatible client | Trivial | Trivial |

**Choose TypeScript** because: MVP fixture + CLI share one runtime; OFFGRID demo audience skews JS tooling; MockAI + JSON schemas fit cleanly; avoids dual-runtime for the smallest wow-path.

**Defer Python** as a second-language runner adapter if needed later — not dual-core.

### Stack (locked at M0)

| Piece | Choice | Notes |
|---|---|---|
| Runtime | Node 20+ | Engines field in `packages/diffwitness/package.json` |
| Language | TypeScript | ESM (`NodeNext`) |
| CLI parser | **`commander`** | Chosen over citty at M0 — do not add citty |
| Config | **YAML** + **zod** | `.diffwitness/config.yaml` |
| Tests | **`node:test` + `tsx`** | Prefer std; no vitest yet |
| Package path | **`packages/diffwitness`** | Do not extend historical root `src/` |
| AI | Mock required; Featherless HTTP optional | No live provider in M0/M1 |

**Do not** install large dependency sets without justification.

---

## 2. Assumptions

1. Calendar constraints before 30 Sep 2026 (other commitments) may limit coding time.
2. Discovery remains **closed**; DiffWitness is product direction via reset — not another hunt.
3. Earlier abandoned directions (see `archive/`) are **not** extended — no feature carryover.

---

## 3. Milestones M0–M9

Use `docs/MILESTONE-TEMPLATE.md` per milestone. One at a time.

### M0 — Foundation + contracts + `init` — **COMPLETE**

**Objective:** Package layout, domain types, config schema, storage port, MockAIProvider, `diffwitness init`.  
**Acceptance:** `diffwitness --help`; schema tests; `init` / repeated init / failure exits; **no** claimed behavioral magic.  
**Out:** Real execution engine, DiffEngine, Featherless live calls, full baseline capture.

> **Scope note (22 Sep 2026):** User-authorized M0 includes `diffwitness init` + persistence layout foundation. Planned-plan M1 “init” is absorbed into M0; remaining M1 focuses on LocalGit identity + deterministic workflow/evidence capture. Logged in [`archive/research/DECISION-LOG.md`](../archive/research/DECISION-LOG.md).

### M1 — LocalGit + deterministic workflow/evidence capture — **COMPLETE**

**Objective:** LocalGit identity; argv process execution; normalize → digest → Evidence → Baseline persist; `diffwitness baseline`.  
**Acceptance:** Integration on temp fixture repo; real persisted evidence; timeout/spawn ≠ successful baseline; non-zero exit recorded as fact; no AI; no DiffEngine/Findings.

> **Scope note (22 Sep 2026):** Authorized M1 absorbs planned-plan “M2 WorkflowRunner + Evidence capture” into this milestone. Remaining plan numbers shift: next is **M2 BehavioralDiff / check**.

### M2 — deterministic BehavioralDiff / `check` — **COMPLETE**

**Objective:** Compare current Evidence vs Baseline; produce BehavioralDiff JSON; `diffwitness check`.  
**Acceptance:** Mutate fixture → findings; identical run → clean; analysis_error ≠ clean.

> **Scope note (22 Sep 2026):** Authorized M2 is DiffEngine + `check` only. No explain/AI/Featherless/impact graph/history/ci.

### M3 — (was M4) explain + MockAIProvider wiring — **COMPLETE**

**Objective:** EvidencePacket reduction + schema-valid Explanation on `explain`.  
**Acceptance:** Offline explain cites finding IDs; invalid model output fail-soft.

> **Scope note (22 Sep 2026):** Authorized M3 is ExplanationPacket builder + MockAI `explain` only. Featherless deferred to M6 (config name accepted → clear unavailable). No CI, history, impact graph, agents.

### M4 — CI integration + production hardening — **COMPLETE**

**Objective:** `diffwitness ci`, exit semantics, machine-readable CI JSON, reliability/security hardening, packaging honesty.  
**Acceptance:** Exit matrix; AI off by default; fail closed on analysis_error / missing baseline; npm pack inspectable; offline demo.

> **Scope note (22 Sep 2026):** Authorized M4 is **CI + production hardening** (not plan-label “human report + history”). History / Featherless / hosted demo remain deferred. Plan labels M4 human/history and M5 ci are superseded for this authorization.

### M5 — Featherless live provider + external AI hardening — **COMPLETE**

**Objective:** Optional Featherless OpenAI-compatible adapter behind `AiProvider`; env keys; timeouts; fail soft; no silent mock fallback.  
**Acceptance:** Contract tests with mock HTTP; live test skipped without key; DiffEngine remains SoT.

> **Scope note (22 Sep 2026):** Authorized M5 is **Featherless + AI hardening** (not plan-label “human report + history”). History / hosted demo remain deferred.

### M6 — Change surface + evidence-to-code context (COMPLETE)

**Objective:** Deterministic Git change surface (baseline commit → executed state) attached to BehavioralDiff; Finding↔ChangeSurface association as co-occurrence, never causality.  
**Acceptance:** See §13. History / hosted demo remain deferred (not M6).

### M7 — Live trusted demo + host-agnostic Node hosting + MockAI only — **COMPLETE**

**Objective:** Small hosted page that runs the **real** CLI (`init → baseline → trusted change → check → explain --provider mock`) on a trusted built-in fixture per request, host-agnostic Node server, MockAI only.  
**Acceptance:** See §15. No uploads, no arbitrary execution, no Featherless, no auth/DB/telemetry.

### M8–M9 — (plan residual)

Submission pack / polish: finalization for submission in progress.

---

## 4. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| RealDiff seen as same product | Med | Demo stresses progressive reduction + AI-bound evidence + small TS CLI; document Near in competitive sources |
| SemanticDiff name confusion | Med | Messaging: **behavioral / runtime evidence**, not language-aware source diff |
| Unsafe repo execution | High | Allowlist, timeouts, no AI shell; threat model; demo on locked fixture |
| Nondeterministic fixtures | High | NormalizeSpec; deterministic demo fixture; digest over normalized bytes |
| Calendar time conflict | High | Plan docs first; code when time allows |
| Scope creep to full instrumentation | High | Hard MVP non-goals; adapters later |

---

## 5. Most likely technical failure

**Honest, stable evidence under real repos:** nondeterminism, flaky commands, and over-broad execution make diffs noisy or demos fake. Win condition is a **tight fixture + solid DiffEngine semantics**, not universal language tracers.

---

## 6. Open source release cut

Reusable/OSS-friendly: CLI core, domain, MockAIProvider, fixture demo, schemas.  
Keep out of “must publish day one”: private provider keys, judge-only hosted secrets, archived material under `archive/`.

---

## 7. M0 completion record (22 September 2026)

See prior §7 content in git history. Summary: package layout, domain, config, storage, MockAI, `init` — 20 tests.

---

## 8. M1 completion record (22 September 2026)

### Implemented

- `diffwitness baseline` (no AI)
- `LocalGitPort`: root (canonical), HEAD SHA, dirty, changed files; fail outside git; argv-only git
- Config extensions: `execution.maxStdoutBytes`, `maxStderrBytes`, `envPolicy` (`none`|`path`|`all`); per-workflow stdout/stderr caps
- `ChildProcessExecutor`: argv-only, required timeout, stream bounds + truncation flags; `exited` vs `timed_out` vs `spawn_failed`
- Digests: **SHA-256**, lowercase hex, wire form `sha256:<hex>` over **normalized** bytes
- `DeterministicNormalizer` (`normalize-v1`): strip ANSI, CRLF→LF, ignore-line patterns, stable sort, maxBytes, optional env-value redaction — no LLM
- Observations: factual (`exit_code`, stream digests, truncation flags, artifact hashes, normalizer version)
- `Evidence` + `Baseline` persistence via `EvidenceStore` on `StoragePort`; schemaVersion envelopes; no silent overwrite of active baseline; atomic blob/text writes
- Deterministic fixture: `fixtures/demo/{behavior.json,run.mjs,out/}`

### Execution model (M1)

```text
config → git identity → select workflows → spawn argv
  → bound stdout/stderr → normalize → digest → Evidence
  → Baseline → persist (.diffwitness/{evidence,blobs,baselines})
```

| Outcome | Baseline success? |
|---|---|
| Process exits (any code including non-zero) | Yes — exit recorded as fact |
| Timeout / spawn failure | No — analysis_error (exit 3) |
| Invalid config / no git / missing workflow / persist fail | No — user_error or analysis_error |

### Deferred (intentionally not M1)

- DiffEngine, `check`, Findings, BehavioralDiff product claims
- `explain` / Featherless / AI in the baseline path
- Recursive artifact globs (`**`); M1 requires exact relative artifact paths
- Hosted demo URL

### Nondeterminism limits

- Fixture avoids network, `Date`, `Math.random`, and absolute machine paths in payload
- `envPolicy: path` (default) passes host `PATH` only — tool resolution may differ across machines; digests of fixture stdout remain stable when `node` is available
- Volatile Evidence/Baseline IDs and `capturedAt` / `durationMs` are excluded from determinism comparisons
- `envFingerprint` is config-derived (workflow argv/timeout/env), not host fingerprint

### Tests / results

```bash
cd packages/diffwitness && npm run typecheck && npm test && npm run build
# 48/48 tests pass (incl. prior M0); typecheck + build clean
```

### Architectural decisions (M1)

1. Digest algorithm locked: SHA-256 + `sha256:` prefix  
2. Env policy default `path`  
3. Non-zero workflow exit ≠ analysis failure for baseline  
4. Planned M2 capture scope absorbed into authorized M1  

### Known limitations

- Artifact paths must be exact (no glob expansion yet)
- `--wipe` still does not deep-delete evidence trees
- Default init workflow path is `fixtures/demo/...` relative to **git root** — use an isolated fixture repo for demos (or adjust config)

## 9. M2 completion record (22 September 2026)

### Implemented

- Deterministic `DiffEngine.compareEvidence` (pure; no LLM/network/random)
- Enriched `BehavioralDiff`: schemaVersion, baseline/current evidence IDs, observation groups (unchanged/changed/added/removed), findings, affected workflows/assumptions
- Finding vocabulary: `exit_code_changed`, `stdout_changed`, `stderr_changed`, `artifact_changed`, `truncation_changed`, `observation_changed`
- Shared capture path `captureWorkflows` reused by `baseline` and `check` (no second executor)
- `diffwitness check`: human + JSON; persists BehavioralDiff under `.diffwitness/runs/`; **never** mutates active baseline
- AnalysisStatus mapping + `--fail-on warn|error|never` (default `never` → findings print, exit 0)
- `normalizer_version` mismatch → `analysis_error` (not silent compare)
- Truncation-aware stdout/stderr summaries (capture truncation ≠ inventing full content claims)

### Comparison semantics (honest)

DiffWitness compares **observable Evidence** (keyed observations: exit, normalized stream digests, truncation flags, artifact hashes, normalizer version).  
It does **not** prove causality, label bugs/regressions, or infer intent from the Git diff. Git = source change; DiffWitness = observable behavior change.

### Deferred (intentionally not M2)

- `explain` / MockAI wiring / Featherless
- Impact graph, `history`, `ci`
- Dual worktree `--base` re-execution (flag is Git identity hint only)
- Hosted demo URL

### Tests / results

```bash
cd packages/diffwitness && npm run typecheck && npm test && npm run build
# 61/61 tests pass; typecheck + build clean
```

### Architectural decisions (M2)

1. Finding IDs / BehavioralDiff IDs are content-derived for DiffEngine determinism  
2. Local `check` default `--fail-on never` (exit 0 with findings); use `--fail-on warn|error` for gate  
3. Missing baseline → `user_error` (never `clean`)  
4. Shared M1 capture path only — no parallel execution stack  

### Known limitations (M2)

- `--base` does not dual-run base worktree; compare uses stored baseline Evidence
- Dirty trees allowed for local check (CI strictness deferred)
- Human renderer is progressive but not yet golden-snapshot polished (M4)

## 10. M3 completion record (22 September 2026)

### Implemented

- `buildExplanationPacket` (EvidencePacket.v1 / ExplanationPacket): progressive reduction, deterministic, hard budgets; preserves Finding + EvidenceIds + changed observations; fails clearly if cannot reduce safely
- Strict EvidencePacket + Explanation schemas (facts vs hypotheses; categorical confidence on hypotheses only)
- Redaction before provider handoff (`redactExplanationPacket`) — mock uses same path
- Versioned prompt `explain.v1` (`packages/diffwitness/src/infrastructure/ai/prompts/explain.v1.ts`)
- `MockAIProvider.explain`: deterministic FACT→EVIDENCE→INTERPRETATION; cites packet EvidenceIds; no fs/network/process
- Provider selection: `mock` default; `none` = explanation unavailable (findings remain); `featherless` unavailable in M3
- `diffwitness explain`: load last BehavioralDiff; validate packet → provider → validate Explanation citations → render
- Narrow `AiProvider.explain(packet)` only — never receives repositoryPath / Git / Storage / ProcessExecutor
- JSON output preserves Structured Diff + Explanation; provider failure keeps findings visible (not clean)

### Pipeline (M3)

```text
Baseline+Current Evidence → DiffEngine → BehavioralDiff
  → ExplanationPacket (reduced + redacted) → AiProvider.explain → Explanation → renderer
```

### Deferred (intentionally not M3)

- Featherless live HTTP adapter (M6)
- `history`, `ci`, impact graph, agents
- Explanation cache by packet digest
- Dual worktree / hosted demo URL

### Tests / results

```bash
cd packages/diffwitness && npm run typecheck && npm test && npm run build
# 77/77 tests pass; typecheck + build clean; no credentials required
```

### Architectural decisions (M3)

1. Wire name remains EvidencePacket.v1; ExplanationPacket is the application alias  
2. Featherless not shipped in M3 — selecting it yields explain_error with findings intact  
3. Hypotheses carry categorical confidence only (`low|medium|high`); never numeric scores  
4. Citation validation rejects unknown Finding/Evidence IDs  
5. Token/char budgets are hard config caps; unsafe truncation refused  

### Known limitations (M3)

- MockAI is a deterministic template — useful offline demo, not a live causal model  
- Featherless / live providers deferred  
- Human explain renderer is functional; golden polish deferred  

## 11. M4 completion record (22 September 2026)

### Implemented

- `diffwitness ci`: non-interactive; AI off by default; JSON always on stdout; `--json-out`; `--fail-on warn|error|never` (default `error`); `--allow-dirty`; optional `--explain`
- Exit semantics: 0 / 1 / 2 / 3 (/ 4 with explain); never analysis_error→clean; never missing baseline→clean; never AI fail→clean
- Versioned CI JSON: status, baseline (local-active), current, behavioralDiff, findings, evidenceRefs, ai, limitations, metadata (volatile timestamps labeled)
- Dirty-tree policy: CI refuses **source-dirty**; ignores DiffWitness operational `.diffwitness/{evidence,blobs,baselines,runs,cache}/`; config remains source-relevant
- Reliability: config version fail-closed; persistence schemaVersion fail-closed; atomic baseline/active writes; executor cwd validation, AbortSignal, SIGINT/SIGTERM child cleanup
- Security: argv-only, envPolicy tests, NUL rejection, malicious config tests, threat-model sync, repo-trust documented
- Packaging: `bin` / `engines` (>=20) / `files` / `license` / MIT LICENSE; `npm pack` inspected in tests; `private: true` (not published)
- Demo: `scripts/demo-m4.sh` / `npm run demo:m4`

### Deferred (intentionally not M4)

- `history`, human golden polish
- Featherless / live AI
- GitHub/GitLab APIs, PR merge-base inference
- Impact graph, agents, RAG, dashboard, telemetry
- Hosted demo URL

### Tests / results

```bash
cd packages/diffwitness && npm run typecheck && npm test && npm run build
# 95/95 tests pass; typecheck + build clean; npm pack inspected; demo:m4 OK
```

### Architectural decisions (M4)

1. Authorized M4 = CI + hardening (supersedes plan-label human/history for this milestone)  
2. Baseline model remains **local-active** — documented CI limitation  
3. CI default `--fail-on error` (warn findings do not fail unless `--fail-on warn`)  
4. AI never on the default CI path  

### Known limitations (M4)

- No PR/merge-base baseline inference  
- Not a sandbox for untrusted repos  
- Package not published; registry name collision must be checked before any publish claim  
- Not “full production-ready” without caveats (see package README production-readiness section)  

## 12. M5 completion record (22 September 2026)

### Implemented

- `FeatherlessAIProvider` implementing `AiProvider.explain(packet)` only — OpenAI-compatible `POST /v1/chat/completions`
- Config: `ai.provider: featherless` + `ai.featherless.{apiKeyEnv,baseUrl,model,timeoutMs,maxResponseBytes,preferJsonObjectFormat}`
- Thin native `fetch` + AbortController timeout; bounded response bytes; status→taxonomy mapping; no auth in logs; no silent mock fallback
- Flow: BehavioralDiff → packet → redaction → Featherless → schema + citation + semantic validation → Explanation (`explain.v1`)
- `explain --provider featherless`; `ci --explain --provider featherless` preserves M4 exit (findings stay findings on AI fail)
- JSON metadata: `provider` / `model` / `promptVersion` / `explanationStatus`
- Opt-in live test: `DIFFWITNESS_FEATHERLESS_LIVE=1` + `FEATHERLESS_API_KEY` (skipped otherwise)
- Provider docs: `docs/FEATHERLESS-PROVIDER.md`

### Deferred (intentionally not M5)

- `history`, human golden polish, hosted demo URL
- GitHub/GitLab APIs, impact graph, agents, RAG, dashboards, telemetry, embeddings, model routing
- Auto-retry storms on 503

### Tests / results

```bash
cd packages/diffwitness && npm run typecheck && npm test && npm run build && npm pack --dry-run
# 105 pass + 1 skipped (live); no credentials/network required for normal suite
```

### Architectural decisions (M5)

1. Authorized M5 = **Featherless live provider + external AI hardening** (supersedes plan-label “human/history” for this authorization)  
2. Official completions docs do not list `response_format`; DiffWitness prefers `json_object` per Featherless JSON guidance + still parses content  
3. Domain free of chat.completions/Bearer — adapter only  
4. DiffEngine remains SoT; AI failure never cleans findings  

### Known limitations (M5)

- Live quality depends on selected open model + warm status (400 cold → `provider_unavailable`)  
- Offline demo remains MockAI (`demo:m4`)  
- No PR/merge-base baseline inference  

## 13. M6 completion record (27 September 2026)

### Implemented

- Pipeline: Git → `captureChangeSurface` / `buildChangeSurface` → DiffEngine (unchanged) → `associateChangeSurface` → optional AI explain. No LLM decides change-surface membership.
- `GitPort.resolveCommit` + `GitPort.diffWorkingTree` (argv-only): `git diff --name-status -z -M`, `--numstat -z -M`, `--unified=0` (hunk headers only), `git ls-files --others --exclude-standard -z`; fixed `--src-prefix/--dst-prefix`, `--no-ext-diff --no-textconv --no-color`; bounded stdout (`runGit` `maxStdoutBytes`).
- Domain: `ChangedFile`, `ChangeLocation`, `ChangeSurface` (`associationStatus`, `causality: "not_established"`, truncation metadata, deterministic `cs_…` id), `DEFAULT_CHANGE_SURFACE_LIMITS`.
- Base revision = active baseline `GitIdentity.headSha`; current = HEAD + working tree (tracked committed/staged/unstaged + untracked-not-ignored). No merge-base / PR inference.
- Association statuses: `associated | unavailable | not_comparable` (no confidence scores). Surface captured before **and** after workflow execution; any difference → `unavailable`.
- `Finding.associationStatus` / `Finding.changeSurfaceRefs`; `BehavioralDiff.changeSurface` (optional, additive; `BehavioralDiff.schemaVersion` stays 1; not part of `BehavioralDiff.id`).
- `.diffwitness/` operational dirs excluded (gitignore semantics + explicit operational-path filter, counted in `excludedOperationalPaths`); operator files (`config.yaml`, `.gitignore`) still reported.
- Output: check/ci/explain human “Change surface / Association / Causality: not established” block (≤10 files, explicit truncation); check JSON v2, CI JSON v2 (`limitations.causality`), explain JSON v2.
- AI: EvidencePacket.v2 (`changeSurface` = file list + association + causality marker; no line locations); prompt `explain.v2`; MockAI co-occurrence wording; semantic guard rejects causal wording in facts when a surface is present. Featherless receives the same reduced packet only.
- `npm run demo:m6`; `build` now cleans `dist/` first (stale-output packaging fix).

### Line locations / symbols

- **Line locations shipped** from `--unified=0` hunk headers (raw git ranges; body lines skipped by count; C-quoted paths not attributed → `locationsComplete=false`). Terminal + JSON only; not sent to AI.
- **Symbol attribution deferred** (no Tree-sitter / TS compiler dependency).

### Deferred (intentionally not M6)

- Symbols, call/dependency graphs, semantic indexing, embeddings, RAG, source-code LLM analysis, causal inference, targeted test selection
- GitHub/GitLab, PR comments, merge-base inference, `history`, hosted demo, agents, dashboards, telemetry

### Tests / results

```bash
cd packages/diffwitness && npm run typecheck && npm test && npm run build && npm pack
# 145 tests: 144 pass + 1 skipped (live Featherless); demo:m4 OK; demo:m6 OK; no network/credentials
```

### Known limitations (M6)

- Association is co-occurrence only; causality is never established
- Baseline captured from a dirty tree → `not_comparable` (re-baseline from a commit)
- Renames detected only when the new path is tracked (committed or staged); unstaged delete + untracked add = deleted + added
- Untracked files have no numstat or hunks; binary files have no counts
- Generated files are reported like any other file (no provenance inference)
- Git output capped at 4 MiB per command → counts become lower bounds, marked truncated

## 14. M6 STOP (superseded by M7 authorization, 29 Sep 2026)

M6 stopped here; M7 was later explicitly authorized as "Live trusted demo + host-agnostic Node hosting + MockAI only".

## 15. M7 completion record (29 September 2026)

### Implemented

- `packages/diffwitness/src/hosted/` — thin presentation/execution layer (`node:http`, no new dependencies):
  - `config.ts` env limits (zod-validated, fail at startup) · `scenarios.ts` trusted registry (one scenario: `behavior-change`) · `run-demo.ts` orchestration · `process-runner.ts` argv-only child runner (process groups; SIGTERM → SIGKILL) · `workspace.ts` per-run mkdtemp tracking · `cli-invocation.ts` CLI argv, env allowlist, git flags, path scrubbing · `demo-result.ts` response schema + zod parse of CLI JSON · `http-app.ts` routes/validation/limits/shutdown · `static-assets.ts` fixed allowlist · `server.ts` entry.
- `packages/diffwitness/hosted/public/` — static HTML/CSS/vanilla JS (no framework); all CLI output via `textContent`; CSP `script-src 'self'`.
- Per request: mkdtemp workspace → copy `fixtures/demo` → `git init --template=` + deterministic commit (fixed author/committer/date, `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, `core.hooksPath=/dev/null`, private HOME) → `diffwitness init` + commit config → `diffwitness baseline` → trusted change (behavior.json rank 1→2 + README edit, same as `demo:m6`) shown via `git diff` → `diffwitness check` → `diffwitness explain --provider mock` → `diffwitness explain --provider mock --json` → remove workspace.
- API: `GET /health` → `{"status":"ok"}`; `GET /api/scenarios`; `POST /api/demo` with strict body `{"scenario":"<id>"}` (JSON content-type, 1 KiB cap). Response `schemaVersion: 1` with stages (command label, outcome, exit code, stdout/stderr, parsed CLI JSON, duration), findings + explanation copied from `explain --json` (never recomputed), explicit failure kinds (`stage_failed | analysis_error | explain_error | unexpected_result | stage_timeout | request_timeout | interrupted | internal_error`).
- Deployment: repo root `npm install && npm run build && npm start` (root `build` runs `npm ci --include=dev` in `packages/diffwitness`, so dev-dependency pruning cannot break `tsc`). Server excluded from the npm tarball (`files: "!dist/hosted"`).
- `npm run demo:m7`.
- **Finalization update (29 Sep 2026):** the scenario is now `pricing-discount-change` (tiny pricing project; `DISCOUNT` 0.10→0.20 → exactly one finding, stdout `{"total":315}`→`{"total":280}`, `node --test` workflow stays green); response is `schemaVersion: 2` with a server-derived `summary` computed only from the real CLI JSON and before/after previews from the explain packet's `evidenceExcerpts`; `GET /ready` added (503 when `git` is unavailable; checked once at startup, bounded). The bullets above describe the original M7 cut.

### Decisions

- Server lives inside `packages/diffwitness` (shares the build and the trusted fixture) but is **not** shipped in the npm package.
- Own child runner instead of `ChildProcessExecutor`: the CLI puts workflows in their own process groups, so the hosted layer must SIGTERM the CLI first (CLI kills its workflow groups, exits 143) and SIGKILL only after a 2 s grace.
- CLI stdout/stderr: the run's temp dir (created + canonical) → `<workspace>`; package root → `<app>`. Nothing else is altered. For the `explain-json` stage, stdout is returned once, as parsed `json`.
- `HOST` default `0.0.0.0` (PaaS routes to the container interface); override with `HOST=127.0.0.1` locally.
- Test-only trusted hooks: injectable scenario registry / CLI argv / workspace parent via `createDemoServer` options, and `DemoScenario.beforeExplain`. No public knob.

### Tests / results

- 33 new hosted tests (`hosted-api`, `hosted-demo`, `hosted-e2e`): config, health/no secrets, headers/CSP, static allowlist, 405/404/415/413/400, strict schema (command/repo/workflow/provider/env/`__proto__` fields), injection/traversal values, real flow assertions, reduced packet, path scrubbing, analysis/explain/unexpected-result propagation, request vs stage timeout, client disconnect, 503 busy + Retry-After, shutdown, child env allowlist, workspace sweeper, production-path E2E (`npm run build` + `npm start`, no API key).
- Suite: **258 tests — 257 pass, 1 skipped (live Featherless), 0 fail.** typecheck/build/pack/fresh tarball install/demo:m4/demo:m6/demo:m7 pass.
- Test-only robustness fix: `executor-process-group` waited a fixed 300 ms for a grandchild pid; under the added parallel load it flaked (1 in 5). Wait raised to 1 s; assertions unchanged.

### Known limitations (M7)

- POSIX hosts only for process-group cleanup (Windows: direct child only); requires `git` ≥ 2.28 on the host.
- No per-client rate limiting (no visitor identifiers by design); capacity is bounded only by `DEMO_MAX_CONCURRENT`.
- Workspaces orphaned by a hard kill of the server process (SIGKILL / OOM) are not reclaimed on next start.
- If the CLI ignores SIGTERM for > 2 s, it is SIGKILLed and a still-running workflow process group could outlive it.
- Not a sandbox: it only ever executes the shipped fixture; it is not safe for untrusted code and does not accept any.

## 16. Status

M0–M7 implemented; finalization for submission in progress (see [`archive/research/DECISION-LOG.md`](../archive/research/DECISION-LOG.md)).
