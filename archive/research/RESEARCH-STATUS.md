# HACK47 OFFGRID — Research Status

**Status (29 Sep 2026): SemaDiff M0–M7 implemented; production finalization complete; deployment, public push, and video pending user.**  
Historical detail lives in `research/`, `research/validation/`, and `research/second-cycle/`. This file does not replace those records.

---

## Current State

| Dimension | Status |
|---|---|
| Product direction | **SemaDiff** — M0–M7 complete in `packages/semadiff/` (M7 = hosted trusted demo, MockAI only); **M8 not started** |
| PackLock | **Abandoned / superseded** (archive: `archive/packlock/`) |
| Discovery survivors | **1** (SemaDiff as active direction) |
| Architecture | **Planning docs + M0–M7 modular CLI package + hosted demo server** |
| Application code | **M7 COMPLETE** (29 Sep 2026); **M8 NOT started** |
| Research discovery | **CLOSED** |

Placeholder name “Afterhours” and any scaffold notes→brief path are **not** the product. See `research/ANTI-FORCING.md` and `research/STATUS-SUMMARY.md`.

---

## Latest decision (22 Sep 2026) — SemaDiff product reset

**PackLock abandoned** as active OFFGRID direction. **SemaDiff** named as working product direction (behavioral intelligence CLI). Competitive research completed; planning docs are SoT; **M0 code landed 22 Sep 2026**.

| Item | Outcome |
|---|---|
| PackLock | **ABANDONED** — docs archived |
| SemaDiff | **Product direction** — PRD + tech + architecture + plan + CLI/AI/threat docs + **M0–M5 package** |
| Discovery | Remains **CLOSED** (no new hunt) |
| Application code | **M7 COMPLETE** — **M8 NOT started** |

Evidence: `research/SEMADIFF-COMPETITIVE-SOURCES.md`, `research/DECISION-LOG.md`, `docs/SEMADIFF-PRD.md`, `packages/semadiff/`, `docs/FEATHERLESS-PROVIDER.md`.

**Do not** start another discovery cycle. **Do not** resurrect PackLock, ScopeBrake, AliasTripwire, FlowDiff, or Afterhours notes→brief. **Next = M6 authorization only.**

---

## Prior: HIGH-CONFIDENCE PRODUCT HUNT v2 (historical)

Investigated candidates A–E; advanced PackLock to PRD-next. That path is **superseded** by the SemaDiff reset. Hunt record retained: `research/HIGH-CONFIDENCE-PRODUCT-HUNT.md`.

---

## First Discovery Cycle

**Investigated:** Hackathon intelligence, problem landscape, competitive landscape, product concepts, shortlist scoring, and kill-tested recommendations. Corpus: `research/00-executive-summary.md` through `research/11-report-A-to-O.md`, plus raw and sources files under `research/`.

**Five major candidates** advanced to validation (investigations only; never a product pick) — see `research/10-final-recommendation.md`:

1. **CiteCheck** — citation existence / quote checks for AI-written briefs  
2. **Action Receipt** — independent record of what an agent ran  
3. **Canary Session** — replay a golden long agent session after config change  
4. **Spec Triangle** — detect spec / live API / SDK disagreement  
5. **Merge Preflight** — block agent PRs that evidence says won’t merge  

**Why they were killed (summary):** each failed adversarial kill tests on 21 September 2026. Full kill records: `research/validation/01-citecheck.md` … `05-merge-preflight.md`. Verdict: `research/validation/07-final-survivor-report.md` — **zero candidates survived.**

Do **not** resurrect, rename, combine, or variant these five.

---

## Second Discovery Cycle

Residuals after cycle-1 kills. Outcome: **ZERO survivors.** Evidence: `research/second-cycle/09-final-shortlist.md`.

---

## Later cycles (abridged)

| Cycle | Outcome |
|---|---|
| Failure-Mode 03 (silent non-occurrence) | Thesis killed |
| Failure-Mode 04 (fragmented truth) | Thesis killed |
| Discovery Reset → AliasTripwire | Validated → **KILL** (Provider Sentinel) |
| Final Product Hunt → ScopeBrake | Validated → **KILL** (MyChangeOrder) |
| HIGH-CONFIDENCE HUNT v2 → PackLock | PRD/planning → **later ABANDONED** |
| Product reset → SemaDiff | **Active product direction** (planning only) |

---

## Current Decision

Discovery is **closed**. **SemaDiff** has planning docs and **Milestone 0** implementation in `packages/semadiff/`. **Milestone 1** remains **blocked** until explicit authorization.

Do not force root `src/` or empty services to fill calendar. Do not start DiffEngine / baseline capture beyond M0 needs.

---

## Reopening discovery

Discovery may reopen only if SemaDiff is **killed** with evidence and a new cycle is explicitly authorized — still subject to `research/REOPEN-GATE.md` (**FAIL = KILL**). Do not reopen killed products under rename. Do not revive PackLock.
