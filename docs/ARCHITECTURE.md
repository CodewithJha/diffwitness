# DiffWitness — Architecture

**Status:** Architecture for DiffWitness; M0–M7 implemented in `packages/diffwitness/` (M7 = hosted trusted demo)  
**Date:** 22 September 2026  
**PRD:** `docs/DIFFWITNESS-PRD.md`  
**Tech spec:** `docs/TECHNICAL-SPECIFICATION.md`

---

## 0. Package location (M0 lock)

DiffWitness lives in **`packages/diffwitness/`** (modular monolith CLI).
---

## 1. Shape

**Modular monolith CLI** — one Node/TypeScript process (MVP). No microservices. No agent runtime mesh.

```text
┌─────────────────────────────────────────────┐
│ CLI (argv, help, exit codes, formatters)    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│ Application (use cases)                     │
│ init | baseline | check | explain | ci      │
│ (history: not implemented, future)          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│ Domain                                      │
│ Baseline, Evidence, BehavioralDiff,         │
│ Finding, DiffEngine, policies               │
└──────────────────┬──────────────────────────┘
                   │ ports
┌──────────────────▼──────────────────────────┐
│ Infrastructure                              │
│ LocalGit | ProcessWorkflowRunner | FsStore  │
│ MockAIProvider | FeatherlessAdapter         │
│ ConfigLoader | Redactor                     │
└─────────────────────────────────────────────┘
```

---

## 2. Layer rules

| Layer | May depend on | Must not |
|---|---|---|
| Domain | nothing infra | fs, child_process, fetch, CLI |
| Application | domain + ports | Featherless SDK details |
| Infra | domain types | encode product policy beyond port impl |
| CLI | application | domain rules duplicated |

---

## 3. Modules (real boundaries only)

Create a module only when there is a consumer and a reason:

| Module | Responsibility |
|---|---|
| `git` | LocalGit port implementation |
| `evidence` | store + blob addressing |
| `diff` | DiffEngine |
| `runner` | process execution + timeouts |
| `ai` | provider interface + mock + featherless |
| `config` | load/validate |
| `report` | human + JSON formatters |

Do **not** invent `packages/agent-orchestrator`, queues, or “platform” folders.

---

## 4. LocalGit first

- Shell out to `git` via controlled argv (no shell string concatenation of user refs without validation).
- Validate refs as safe tokens.
- Prefer `git` CLI already on PATH over embedding libgit2 in MVP.
- Worktree support is optional post-MVP; baseline store is enough for demo.

---

## 4a. Change surface pipeline (M6)

```text
check:
  LocalGit ──► captureChangeSurface (before execution)          # application; argv-only git
  WorkflowRunner ──► Evidence ──► DiffEngine ──► BehavioralDiff # unchanged M2 semantics
  LocalGit ──► captureChangeSurface (after execution)
  confirmExecutedState(before, after)                           # differ → unavailable
  associateChangeSurface(diff, surface)                         # domain; co-occurrence only
  ──► BehavioralDiff.changeSurface + Finding.associationStatus / changeSurfaceRefs
explain:
  BehavioralDiff (+ changeSurface) ──► EvidencePacket.v2 ──► redact ──► AiProvider
```

| Piece | Layer | File |
|---|---|---|
| `GitPort.resolveCommit` / `diffWorkingTree` | port + infra | `ports/git.ts`, `infrastructure/git/working-tree-diff.ts`, `parse-diff.ts` |
| `buildChangeSurface` (sort, limits, truncation, id) | domain | `domain/change-surface.ts` |
| `associateChangeSurface` | domain | `domain/change-surface-association.ts` |
| `captureChangeSurface` / `confirmExecutedState` (comparability, `.diffwitness/` exclusion) | application | `application/capture-change-surface.ts` |
| Human “Change surface / Association / Causality” block | application | `application/format-change-surface.ts` |

No LLM participates in change-surface membership or association. Association never changes findings, severity, status, BehavioralDiff id, or exit codes.

---

## 5. AI placement

```text
check  → BehavioralDiff (+ change surface; no AI)
explain → AiProvider.explain(EvidencePacket.v2)
ci     → check (+ optional explain off by default)
```

Featherless is an **adapter**, not core. Core ships with **MockAIProvider**.

AI never receives a “run this command” tool. No function-calling to shell.

---

## 6. Execution safety boundary

WorkflowRunner is the only component that starts processes. It:

- runs allowlisted argv from config (not from model output)
- applies timeout and max output bytes
- captures streams to temp then EvidenceStore
- records failures as analysis_error Evidence / run terminal state

See `docs/THREAT-MODEL.md`.

---

## 7. Demo / deploy architecture

Hackathon needs a **public demo URL**. Options (choose at M0 approval):

1. **Hosted read-only demo page** that streams a pre-baked honest run + “run locally” instructions, or  
2. **CI-connected status page** + container that runs fixture `diffwitness check` on a schedule, or  
3. **Small web wrapper** that invokes the CLI on a locked demo repo (no arbitrary user code on shared host without sandbox).

Prefer simplest honest hostable surface — no K8s. Env-based config; health endpoint if web wrapper exists.

**M7 decision (29 Sep 2026): option 3** — `packages/diffwitness/src/hosted/` (not shipped in the npm package).

```text
browser ──POST /api/demo {"scenario":"pricing-discount-change"}──▶ http-app (validate: JSON, ≤1 KiB, strict schema, registry lookup, capacity)
                                                              │
                                                              ▼
                                                  run-demo (per-request mkdtemp workspace)
                                                    copy trusted pricing fixture → git init/commit (argv-only, no hooks, no host config)
                                                    child: node dist/cli/main.js --repo <ws> init | baseline | check | explain --provider mock [--json]
                                                    trusted change (src/pricing.mjs DISCOUNT 0.10→0.20) → git diff
                                                    parse `explain --json` (zod) → findings / explanation copied verbatim;
                                                    before/after previews from the packet's evidenceExcerpts
                                                    rm -rf workspace (always)
                                                              │
browser ◀── schemaVersion 2: stages[] (command, exit, output, json) + findings + explanation + summary + failure
```

- **Scenario `pricing-discount-change`:** a tiny pricing project (`src/pricing.mjs` `calculateTotal`; `bin/quote.mjs` prints `{"total":315}`; a `node --test` workflow stays green). The trusted change sets the source constant `DISCOUNT` 0.10→0.20; the demo shows exactly one finding (stdout `315`→`280`) while tests pass unchanged.
- Response `schemaVersion: 2` adds a server-derived `summary` computed only from the real CLI JSON (never recomputed analysis).

- The hosted layer contains **no** DiffWitness logic: Git diffing, DiffEngine, evidence, change surface, EvidencePacket, MockAI and findings all run inside the real CLI process. The server only sequences trusted commands and relays their output.
- MockAI boundary unchanged: `explain --provider mock` builds and redacts the EvidencePacket inside the CLI; the server never constructs or edits packets. Featherless is never selected; child env carries no API keys.
- Limits (env): `DEMO_MAX_CONCURRENT`, `DEMO_REQUEST_TIMEOUT_MS`, `DEMO_STAGE_TIMEOUT_MS`, `DEMO_WORKSPACE_TTL_MS`, `DEMO_MAX_OUTPUT_BYTES`, `DEMO_MAX_BODY_BYTES`, `DEMO_SHUTDOWN_GRACE_MS`; `PORT`, `HOST`.
- Deploy: repo root `npm install && npm run build && npm start`; `GET /health` (liveness) and `GET /ready` (readiness — 503 when `git` is unavailable; git availability checked once at startup, bounded). See `packages/diffwitness/README.md` § Hosted demo.

Localhost-only is not a valid final submission (`AGENTS.md`).

---

## 8. Explicit non-architecture

- No upload/certificate services  
- No Web3  
- No multi-tenant control plane for MVP  

---

## 9. Evolution

Post-MVP adapters (Playwright traces, JUnit parsers, language tracers) plug behind Evidence capture — do not rewrite domain. RealDiff-like deep instrumentation is a **later** infra option, not MVP architecture.
