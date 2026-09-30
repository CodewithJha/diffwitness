# DiffWitness — Product Requirements Document

> **Historical planning document.** Written before implementation to choose and scope the product. Some statements (for example "why (evidence-backed)" and "which assumptions were affected") describe goals that the shipped CLI deliberately does not claim: DiffWitness never establishes causality and does not infer affected assumptions. For current behavior see the [README](../README.md), the [CLI reference](reference/cli.md) and the [architecture overview](architecture/README.md).

**Status:** Selected product **direction** for HACK47 OFFGRID (not permanently locked until M0 acceptance / validation if required)  
**Date:** 22 September 2026  
**Supersedes:** an earlier abandoned direction (see [`archive/`](../archive/README.md))  
**Authority:** Product reset (user) + competitive research [`archive/research/SEMADIFF-COMPETITIVE-SOURCES.md`](../archive/research/SEMADIFF-COMPETITIVE-SOURCES.md)  
**Scope:** Product requirements only. **No application code in this pass.**

---

## One-liner

**DiffWitness** is a local-first behavioral intelligence CLI: after code changes, it shows **how software’s observable behavior changed**, **why (evidence-backed)**, and **which assumptions, tests, and workflows were affected** — evidence first, AI second. Not an AI Git diff. Not a coding agent.

> **Not implemented / superseded — see DECISION-LOG (finalization).** `affectedAssumptions` lists all declared assumptions from config whenever any finding exists (no inference, no linking) — "Declared assumptions (for affected workflows)"; "why" is evidence-backed, causality is never established.

---

## ICP

| Field | Definition |
|---|---|
| **User** | Individual developer / small team shipping PRs with non-trivial regression risk |
| **Trigger** | Before merge / after a local change / in CI on PR — “what did this actually do?” |
| **Pain today** | Read the Git diff; hope tests cover it; skim AI review comments that invent risk without execution proof |
| **Not ICP** | Enterprise APM operators; security scanners; people who only want prettier source diffs |

---

## Problem

**Exact failure:** A change looks local in the source diff. Behavior elsewhere shifts (ordering, defaults, side effects, error shapes, call outcomes). Tests that still pass do not surface the shift. AI review tools speculate from text. APM sees production after the damage. The developer cannot answer: *what observable behavior moved, with proof, for this Git delta?*

**Frequency:** Every non-trivial PR; especially refactors, shared helpers, config/default flips, serialization, and “cleanup” commits.

**Workaround today:** Full test suite hope + manual repro + AI chat that may hallucinate impact.

---

## Solution (primary job)

One painful job: **given a Git baseline and a working tree (or tip), produce an evidence-backed behavioral diff** of what changed in observed behavior, then optionally explain it with AI constrained to that evidence.

---

## Promise

- **Evidence-first:** Claims cite captured evidence (artifacts, exits, outputs, structured observations). AI never invents unobserved behavior.
- **Progressive reduction:** Cheapest deterministic signals first; escalate only when needed (L0→L6).

> **Not implemented / superseded — see DECISION-LOG (finalization).** No L0→L6 escalation ladder; actual reduction is a simpler deterministic packet reduction (surface files, assumptions, changed observations, excerpt size/count, lowest-severity findings — see `build-explanation-packet.ts`).

- **Local-first:** Analysis runs on the developer machine / CI runner; no required cloud SoT.
- **Provider-independent AI:** Optional adapters (e.g. Featherless); **MockAIProvider required** for demos and offline.
- **Honest failure:** Analysis failure ≠ “no regression.” Exit codes and reports distinguish *could not analyze* from *no behavioral delta found*.

---

## Core workflow

```text
Git baseline (ref) + current tree
        │
        ▼
L0 Config / init (.diffwitness)
        │
        ▼
L1 Change surface (files / symbols / touched paths)
        │
        ▼
L2 Target selection (tests / workflows / commands from config + heuristics)
        │
        ▼
L3 Execute under policy (sandbox / timeouts / allowlist — never AI-driven shell)
        │
        ▼
L4 Normalize + capture Evidence packets
        │
        ▼
L5 BehavioralDiff (deterministic compare vs baseline store)
        │
        ▼
L6 Optional AI explain (schema-validated; evidence-bound; fail-soft)
        │
        ▼
CLI report (human + JSON) / CI gate
```

---

## Core commands (smallest MVP surface)

| Command | Job |
|---|---|
| `diffwitness init` | Create `.diffwitness/` config + ignore defaults |
| `diffwitness baseline` | Capture baseline evidence for current Git ref / configured workflows |
| `diffwitness check` | Diff current tree vs baseline (or vs `--base` ref); emit BehavioralDiff |
| `diffwitness explain` | AI explanation over last/check evidence packet (optional provider) |
| `diffwitness history` | List prior runs / baselines locally |
| `diffwitness ci` | Non-interactive check + machine-readable exit for CI |

> **Not implemented / superseded — see DECISION-LOG (finalization).** `diffwitness history` does not exist; it is future work.

**Deferred (post-MVP):** `watch`, interactive TUI, multi-language tracers, auto-instrumentation platforms, PR bot posting.

Full flags/exits: `docs/reference/cli.md`.

---

## Baseline semantics

- A **Baseline** is a versioned local record: Git identity (commit SHA / dirty flag), environment fingerprint (runtime versions as configured), workflow IDs, and **Evidence** artifacts produced by those workflows.
- Default compare: `baseline` at `--base` (default: upstream merge-base or configured `baseRef`) vs current working tree / HEAD after change.

> **Not implemented / superseded — see DECISION-LOG (finalization).** No merge-base default or PR base inference: compare uses the locally stored active baseline; `--base` is an identity hint only.

- Dirty trees allowed for local `check`; CI mode prefers clean tree or explicit SHA.
- Re-baselining is explicit (`baseline`); silent overwrite of golden baselines is forbidden without `--force` (documented).

---

## Behavioral evidence

Evidence may include (MVP subset in bold):

- **Command exit codes** and duration
- **Normalized stdout/stderr** (redaction + stable sorting where configured)
- **File artifacts** produced by workflows (hashes + optional structured parse)
- Structured observations from adapters (e.g. test result JUnit/JSON summary)
- Later: traces, snapshots, HTTP recordings — only when adapters exist

Evidence is the **source of truth**. AI may summarize and hypothesize **only** over included packets.

---

## Behavioral diff

A **BehavioralDiff** is a deterministic structure:

- Unchanged / changed / appeared / disappeared observations
- Severity heuristic (exit flip > content delta > timing-only, configurable)
- Links to Evidence IDs and workflow IDs
- Affected assumptions (from config `assumptions:` and inferred “this workflow was the contract”)

> **Not implemented / superseded — see DECISION-LOG (finalization).** `affectedAssumptions` currently lists all declared assumptions from config whenever any finding exists (no inference, no linking) — terminology "Declared assumptions (for affected workflows)".

- Affected tests/workflows list

No AI required to compute the diff.

---

## AI role

| AI may | AI must not |
|---|---|
| Explain a BehavioralDiff in plain language | Invent unobserved behaviors |
| Rank / narrate likely causal links **citing evidence IDs** | Choose or execute shell commands |
| Suggest which tests to add (advisory) | Auto-approve “no regression” when analysis failed |
| Run behind MockAIProvider for deterministic demos | Bypass schema validation |

> **Not implemented / superseded — see DECISION-LOG (finalization).** No causal narration: causality is never established; Git changes are co-occurrence only; AI explains evidence and labels hypotheses.

See `docs/architecture/ai.md`.

---

## Output format

- **Human (default):** progressive disclosure — summary → changed findings → evidence pointers → optional explain section.
- **JSON (`--json`):** stable schema for CI and history.
- **CI:** exit codes per `docs/reference/cli.md` (behavioral change ≠ analysis error).

---

## Privacy / local-first / OSS

- Default: no code or evidence uploaded.
- Optional AI provider receives **redacted evidence packets** only when user opts in (`explain` + configured provider).
- Secrets: redaction hooks; never commit `.diffwitness/cache` secrets; `.env` for provider keys.
- **OSS intent:** core CLI + MockAIProvider + fixture runners MIT-releasable; provider adapters thin.

---

## MVP (exact first behavior)

1. TypeScript CLI installs/runs locally.
2. `init` → config with **one** fixture workflow (e.g. `node fixtures/demo/run.mjs` or equivalent demo pack).
3. `baseline` captures Evidence for that workflow at a known Git state.
4. Demo mutates code so **observable output changes** while a naïve “tests still green” story is optional.
5. `check` reports BehavioralDiff with evidence citations (no AI required for wow).
6. `explain` with **MockAIProvider** produces schema-valid narrative citing evidence IDs.
7. `ci` fails on configured severity of behavioral change; fails differently on analysis error.
8. Hosted demo path: documented public URL running the demo fixture (or CI badge + replayable recording of CLI) — **not** localhost-only for submission.

---

## Non-goals (do not build)

- AI coding agent / autofix PR bot
- Language-aware **source** diff product (SemanticDiff competitor space)
- Full multi-runtime instrumentation platform (RealDiff-scale) in MVP
- Enterprise APM / production continuous profiler
- Mutation testing suite as primary product
- Web3 / blockchain / offensive cyber features
- Resurrecting earlier abandoned directions (see `archive/`)

---

## Success criteria (hackathon)

| Criterion | Measure |
|---|---|
| Demo honesty | Judge sees real baseline → change → behavioral finding with evidence |
| Differentiation | Clearly not “ChatGPT on git diff” |
| Reliability | MockAI path works offline; provider failure fail-soft |
| Depth | Progressive pipeline + domain types + exit semantics |
| Potential | Path to more adapters without rewrite |

---

## 90-second demo

1. Open terminal on demo repo; show `diffwitness check` clean against baseline (or skip to dirty).
2. Apply one-line behavior change (or checkout prepared branch).
3. Run `diffwitness check` → findings: workflow X output/exit changed; cite artifact hash / excerpt.
4. Run `diffwitness explain` (MockAI) → short “why” with evidence IDs on screen.
5. Show JSON/`ci` exit meaning; URL on screen.

No slides. No mission statement.

---

## Differentiation

| Alternative | Why DiffWitness is not that |
|---|---|
| Git / source review / SemanticDiff | Those explain **text**; DiffWitness explains **observed behavior** |
| CodeRabbit / Graphite | AI on diffs — no required execution evidence packet |
| APM / Datadog | Production continuous telemetry — not local Git-baseline CLI |
| Snapshots / ApprovalTests | Author oracles inside tests — not change-impact intelligence product |
| RealDiff (Near) | Closest runtime behavior-diff class; DiffWitness MVP is smaller, TS-local, **AI-explain + progressive reduction + Mock provider** as product spine, not multi-runtime instrumentation platform first |

---

## Kill criteria (post-PRD)

Kill or pivot if validation shows:

1. RealDiff (or successor) already owns the same buyer + workflow + mechanism **including** evidence-bound AI explain in one CLI, or
2. Demo collapses to “we ran tests and printed stdout diff” with no durable product shape, or
3. Safe execution policy makes the demo dishonest.

---

## Assumptions

- First language: TypeScript (see Implementation Plan).
