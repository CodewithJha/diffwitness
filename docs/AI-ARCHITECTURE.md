# DiffWitness — AI Architecture

**Date:** 22 September 2026  
**Status:** **M6 implemented** — MockAI + Featherless; EvidencePacket.v2 change surface (co-occurrence only); DiffEngine remains SoT  
**Principle:** Evidence-first, AI-second. Progressive evidence reduction. Fail soft. Provider-independent.

---

## 1. Where AI is necessary

AI is **optional** for the core job. Deterministic BehavioralDiff is the product spine.

AI is used when the user runs `explain` to:

- Turn findings + short evidence into a readable FACT → EVIDENCE → INTERPRETATION narrative  
- Separate **facts** (packet-bound) from **hypotheses** (speculative; categorical confidence only)  
- Cite Finding IDs and EvidenceIds from the packet only  

AI is **not** used to:

- Decide PASS/FAIL of `check` / `ci`  
- Select shell commands  
- Invent observations absent from EvidencePacket  
- Replace DiffEngine  
- Execute, read files, search, or receive `repositoryPath` / Git / Storage / ProcessExecutor  

---

## 2. EvidencePacket / ExplanationPacket

Wire schema **EvidencePacket.v2** (M6; application alias: **ExplanationPacket**):

```text
EvidencePacket.v2
  schemaVersion: 2
  behavioralDiffId
  status
  findings[]: { id, severity, workflowId, observationKey, findingType, change, summary, evidenceIds[],
                associationStatus? }
  changedObservations[]: { workflowId, key, beforeDigest?, afterDigest? }
  evidenceExcerpts[]: { evidenceId, observationKey, preview, digest }
  assumptions[]: { id, description }
  changeSurface?: {                    # Git co-occurrence context — NOT behavioral evidence
    id, associationStatus: associated|unavailable|not_comparable,
    causality: "not_established",      # literal; never omitted when changeSurface is present
    baseRevision, currentRevision, workingTreeIncluded, limitation,
    files[]: { path, status, oldPath?, additions?, deletions?, untracked? },   # ≤ maxPaths
    filesTotal, truncated
  }                                    # no line locations, no file contents
  budgets: { maxChars, maxFindings, maxExcerpts, maxExcerptChars, maxPaths }
  redactionApplied: boolean
```

Built by `buildExplanationPacket` **after** DiffEngine + association. Provider receives **only** this packet (redacted; paths redacted too).

**Compatibility:** v1’s untyped `changeSurface.paths` had no co-occurrence/causality semantics, so the version was bumped. Packets are rebuilt per `explain` run and never persisted as inputs; `parseEvidencePacket` rejects v1 with an explicit `explain_error` message instead of guessing.

---

## 3. Progressive reduction

Applied until serialized packet ≤ `budgets.maxChars`. **Never** truncate Finding/Evidence IDs or drop `evidenceIds` on kept findings.

| Pass | Include | Drop / shrink if over budget |
|---|---|---|
| 0 | status + findings (severity-sorted, capped) | — |
| 1 | changedObservations for selected findings | drop changedObservations |
| 2 | excerpts (bounded preview chars) | shorten previews → drop excerpts |
| 3 | change-surface files (first to shrink) | halve file list until 0; header (status + `causality`) always kept; `truncated: true` |
| 4 | assumptions | blank assumption descriptions |
| 5 | fewer findings (lowest severity first) | drop low-severity findings |
| fail | — | clear `explain_error` if still too large |

Actual drop order when over budget: change-surface files → assumption descriptions → changedObservations → excerpt preview length → excerpts → lowest-severity findings → fail.

Never: full repo tarball, unbounded stderr, raw env, inventing excerpts, file contents, line diffs.

---

## 4. Prompts as versioned product logic

Implemented: `packages/diffwitness/src/infrastructure/ai/prompts/explain.v2.ts` (`EXPLAIN_PROMPT_VERSION = explain.v2`; v1 removed in M6).

- System: evidence-bound explainer; cite IDs; facts vs hypotheses; refuse clean bill of health on `analysis_error`; no pass/fail; no claim to inspect repo/execute  
- v2 adds: change-surface membership is **co-occurrence only, never proof of causality**; no causal claims in FACTS; do not relate findings to files unless `associated`; empty surface → say no source change, do not guess why; no file contents / line diffs available  
- User: serialized EvidencePacket + Explanation.v1 JSON shape instructions  
- Bump version + tests on prompt change — no silent string drift  

---

## 5. Explanation schema

```text
Explanation.v1
  schemaVersion: 1
  promptVersion: string          # e.g. explain.v1
  narrative: string              # FACT → EVIDENCE → INTERPRETATION
  facts[]: { claim, findingId?, evidenceIds[] }
  hypotheses[]: { claim, confidence: low|medium|high, findingId?, evidenceIds[] }
  citations[]: { findingId? | evidenceId?, claim }   # at least one ID required
  caveats[]: string
  modelId?: string
  provider: string
```

- Validate with zod (`parseExplanation`)  
- `assertExplanationCitationsInPacket` rejects unknown Finding/Evidence IDs  
- `validateExplanationSemantics` — one shared gate, run in `runExplain` for **every** provider (Featherless also runs it internally; same function, not a bypass). It checks every model-generated string: narrative, facts, hypotheses, citation claims, caveats, `promptVersion`, `modelId`.  
  - Causal assertions are rejected **with or without** a change surface: caused / caused by / cause of / root cause / due to / because / resulted from|in / as a result of / triggered / led to / responsible for / introduced by / attributable to / stems from / originates from / explains why. Case-insensitive, word-boundary, per clause.  
  - Accepted: epistemic negation in the same clause (“does not claim … caused”, “no evidence that …”, “not established that …”, “cannot determine the cause”), direct negation (“was not caused by”), and — **in hypotheses only** — hedges (“may have caused”, “possibly due to”).  
  - `analysis_error` packets: claims of clean / passed / successful / verified / safe to merge / no issues / no regressions / nothing changed (unless negated) are rejected.  
  - Verbatim packet text (evidence previews, finding summaries, paths) containing such words is not treated as a model claim.  
  - It is a wording filter, not a proof of honesty.  
- Invalid / unknown citations → `explain_error`; BehavioralDiff unchanged; findings still shown  

---

## 6. Fail soft

| Failure | Behavior |
|---|---|
| No prior `check` | `user_error` (exit 2) |
| `ai.provider=none` | Explanation unavailable; findings remain; exit 0 |
| Missing Featherless credentials | `explain_error` (exit 4); findings remain; **no** mock fallback |
| Provider throw / invalid JSON / bad citations | `explain_error` (exit 4); findings remain; status not rewritten to clean |
| Packet cannot reduce under budget | `explain_error`; clear message |
| `analysis_error` packet | Refuse clean bill of health; does not narrate as ordinary findings |
| `clean` / empty findings | Honest “nothing to explain” — no fabricated regression story |

---

## 7. Cost / token control

1. Progressive reduction with **hard** `maxChars` / `maxFindings` / `maxExcerpts` / `maxExcerptChars` / `maxPaths` (config `ai.*`)  
2. Default provider `mock`  
3. `explain` not in default `ci` path (optional `--explain` only; AI never decides status)  
4. Redaction before provider handoff (mock + featherless same path)  
5. Featherless model / timeout / baseUrl from config — never hardcode paid keys  

---

## 8. Providers

| Provider | Role |
|---|---|
| **MockAIProvider** | **Required**; deterministic; offline demos; no fs/network/process; names change-surface files as co-occurrence + “Causality: not established” caveat |
| **none** | Skip explanation; findings remain |
| **FeatherlessAIProvider** | **M5**; OpenAI-compatible HTTP; optional; explain-only |

`AiProvider` surface: **`explain(packet)` only**.

Featherless details: `docs/FEATHERLESS-PROVIDER.md`.

Domain stays free of `chat.completions` / Bearer shapes — HTTP adapter only under `infrastructure/ai/featherless/`.

---

## 9. Non-goals for AI subsystem

- Agent loops  
- Tool calling to filesystem/shell  
- Autonomous PR writing  
- Fine-tune hosting  
- Silent featherless→mock fallback  
- Embeddings / model routing / RAG  

---

## 10. Test plan (AI)

- Mock packet → stable explanation shape + determinism  
- Featherless HTTP mocks: success + 400/401/403/408/429/5xx + network/timeout + invalid/citation/schema  
- Contract: Mock vs Featherless Explanation.v1 shape  
- Live: `DIFFWITNESS_FEATHERLESS_LIVE=1` + `FEATHERLESS_API_KEY` (skipped otherwise)  
- Reduction respects budgets; fail when unsafe  
- Redaction strips Bearer-like secrets; IDs preserved  
- Invalid / unknown citations rejected  
- `analysis_error` → refuses clean bill of health  
- Security: no repo/exec on provider; baseline/check do not call AI; key never in logs  
