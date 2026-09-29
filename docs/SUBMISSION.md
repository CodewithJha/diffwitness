# DiffWitness — Devpost submission package

Event: [HACK47: OFFGRID](https://hack47-offgrid.devpost.com/). Submit by **14 Oct 2026**; hard clock **15 Oct 2026 04:00 UTC**. Keep the demo live through **25 Oct 2026**.

Copy-paste text for each Devpost field is below. Replace every `TODO` before submitting.

---

## Name

DiffWitness

## Tagline / short description (1–2 sentences)

DiffWitness detects behavioral changes that tests and Git diffs can miss. It runs the commands whose output you care about, stores the results as evidence, and after a code change shows exactly what changed — before/after values and evidence IDs — without guessing at causes.

## Demo link

TODO — hosted demo URL (see `docs/DEPLOYMENT.md`)

## Source

https://github.com/CodewithJha/diffwitness

## Demo video

TODO — video URL (script: `docs/DEMO-SCRIPT.md`)

## Problem

A one-line change ships: `DISCOUNT = 0.1` becomes `DISCOUNT = 0.2`. The unit tests pass because they check the shape of the quote, not its value. The Git diff looks harmless. The quote a customer sees for the same order has gone from 315 to 280 — and nobody notices until a customer does.

Tests only verify what someone thought to assert. Git diffs show which text changed, not what the program now does. Snapshot tests help only where someone already wrote one. The gap in between — *observable behavior that changed without anyone asserting on it* — is where quiet regressions live, and reviewers have no evidence either way.

## Solution

DiffWitness is a local-first CLI:

1. `diffwitness init` writes a commented config. You list **workflows** — argv commands whose output matters (a CLI, a report script, your test command).
2. `diffwitness baseline` runs them and stores **evidence**: exit code and normalized stdout/stderr (plus listed artifacts), each with a SHA-256 digest, a redacted preview, and an evidence ID.
3. After a change, `diffwitness check` reruns the workflows and a **deterministic diff engine** reports `BEHAVIOR CHANGED`, `NO BEHAVIOR CHANGE`, or `ANALYSIS ERROR` (never shown as clean) — per finding: workflow, observation, **before → after**, evidence IDs, and the files Git says changed alongside it, with `Causality: not established`.
4. `diffwitness explain` produces a bounded explanation from the evidence packet only. The default explainer, MockAI, is deterministic and offline; an optional live model can be enabled. AI never decides status, findings, or exit codes, and causal wording from a model is rejected.
5. `diffwitness ci --fail-on warn` turns it into a CI gate with stable exit codes (0 / 1 findings / 2 user error / 3 analysis error / 4 explain error).

The hosted demo runs the real CLI on the pricing example in a fresh temporary Git repository per click: the project's tests stay **PASS**, DiffWitness reports **BEHAVIOR CHANGED**, `{"total":315} → {"total":280}`, with evidence.

## What makes it different

- **Evidence, not guesses.** Every finding cites stored evidence IDs; the verdict comes from digests, not a model.
- **Honest about causality.** Changed files are shown as co-occurrence. No report claims a file caused a change; a wording gate rejects model output that does.
- **Works on commands you already have.** No test framework, no instrumentation, no per-output snapshot files.
- **Fail-closed.** Timeouts, crashes, corrupt storage, and AI failures never turn into a clean result.

## How we built it (tech stack)

- TypeScript (ESM) on Node.js 20+; CLI built with `commander`; config and evidence schemas validated with `zod`; YAML config via `yaml`.
- Git via the `git` binary (argv, no shell) for identity and change surface.
- Process executor: argv-only spawn, per-workflow process groups, timeouts, bounded output, interruption handling.
- Content-addressed evidence storage in `.diffwitness/` with deterministic normalization and IDs.
- Explain layer: provider interface with a deterministic MockAI and an optional Featherless (OpenAI-compatible) adapter behind a shared semantic validation gate.
- Hosted demo: plain `node:http` server + static vanilla JS page (strict CSP, `textContent` rendering only), per-request temp workspaces, allowlisted child env, concurrency/output/time limits, `/health` + `/ready`.
- Tests: `node:test` via `tsx` — 283 tests (unit, integration, hosted API security, production-path E2E, packed-tarball user journey), green on Node 20 and Node 26.

## Build process — during OFFGRID vs next

**Built during OFFGRID (this repository, created for the event):** the whole product — domain model, deterministic diff engine, evidence storage, executor, Git change surface and association, MockAI and Featherless explainers with validation, CI command and exit-code contract, hosted demo server and page, pricing example, test suite, and docs. Pre-product planning notes are kept under `archive/`. Formerly developed under the working name SemaDiff; renamed DiffWitness on 29 Sep 2026 before the first public commit because that name is already used by unrelated projects.

**Next (future direction):**

- Publish the package to npm (`diffwitness` was unclaimed on 29 Sep 2026) and a ready-made GitHub Action.
- PR-base comparison (merge-base) instead of a local active baseline only.
- Structured observations for JSON output (field-level before/after instead of whole-stream digests).
- More normalizers for common volatile output (timestamps, durations, temp paths).

## Limitations (stated honestly)

- Sees only what your workflows exercise; untested behavior stays invisible.
- Output must be deterministic; volatile lines need normalization or they appear as changes.
- Compares against a stored local baseline — no merge-base / PR inference, no history browsing.
- Findings are per observation stream (e.g. whole stdout), not per JSON field.
- Changed files are co-occurrence only; no symbol-level attribution or causal inference.
- Runs commands from the repository's own config — not a sandbox for untrusted repositories. Windows kills only the direct child on timeout.

## Positioning

DiffWitness sits between unit tests and code review: tests check what you asserted, diffs show what text changed, DiffWitness shows what observable behavior changed — with evidence. It is not an AI code reviewer, not a coding agent, and not a replacement for tests. Closest neighbours: snapshot/approval testing and CLI transcript tests (cram, trycmd), which need hand-written expectations per output; RealDiff, which instruments runtimes for PR behavior diffs at a heavier weight. See the README's related-work section.

## Challenges

- Making "tests PASS, behavior CHANGED" provable rather than narrated: the summary is derived from stored evidence digests, and the demo asserts the exact before/after values in tests.
- Keeping AI useful but powerless: explanations are built from a redacted, size-bounded packet and filtered for causal claims; the engine alone owns the verdict.
- Running real commands safely for anonymous visitors: the hosted demo never executes visitor input — only a built-in scenario — with per-run temp repos, env allowlists, and hard limits.

## Accomplishments

- One click in the browser runs the real CLI end to end in about a second and shows the exact behavioral delta with evidence IDs.
- Deterministic results across runs (only IDs and durations vary).
- A clean exit-code contract suitable for CI, including precedence (3 > 1 > 4 > 0).

## What we learned

The hard part of "explain what changed" isn't generating text — it's refusing to say more than the evidence supports.

## Disclosure: AI tools

- **Building:** developed with AI coding assistance in the Cursor editor (Cursor agents) for implementation, tests, and documentation, with human review and direction.
- **Running the demo:** the hosted demo uses **MockAI only** — a deterministic, offline template in this repository. No model is called and no API key is present.
- **Optional at runtime:** users can enable a live model via Featherless.ai's OpenAI-compatible API (`--provider featherless` with their own `FEATHERLESS_API_KEY`; model id set in `ai.featherless.model`; the config template suggests `Qwen/Qwen2.5-7B-Instruct`). It receives only the redacted evidence packet, only explains, and never falls back silently to MockAI. Not used by the hosted demo.

## Disclosure: third-party software and services

| Component | Use | License |
|---|---|---|
| Node.js | Runtime | MIT-style (Node.js license) |
| Git | Repository identity and change surface (invoked as a binary) | GPL-2.0 (not linked or distributed) |
| commander | CLI argument parsing | MIT |
| zod | Schema validation | MIT |
| yaml | YAML config parsing | ISC |
| TypeScript, tsx, @types/node | Build and tests (dev only) | Apache-2.0 / MIT / MIT |
| Featherless (featherless.ai) | Optional live model API; not used by the hosted demo | Service (user-provided key) |

## Submitter checklist

- [ ] Hosted demo deployed and reachable; `/ready` returns 200; the demo button completes
- [ ] Demo URL and video URL filled in above and in `README.md`; all three URLs on Devpost
- [ ] Video recorded per `docs/DEMO-SCRIPT.md` (2–3 minutes; demo on screen within the first 30 seconds)
- [ ] Repository public, with the screenshot rendering in the README
- [ ] AI tools and third-party software disclosed (sections above)
- [ ] Prize opt-in checkbox checked on Devpost
- [ ] Demo kept live through **25 Oct 2026**
