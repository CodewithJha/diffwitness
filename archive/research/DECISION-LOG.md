# HACK47 OFFGRID — Decision Log

Chronological, factual. Evidence points at research files; this log does not replace them.  
Today’s freeze decisions: **2026-09-21**. Cycle work on disk is dated **21 September 2026**.

---

### 2026-09-21 — Initial research opened

| | |
|---|---|
| **Decision** | Run discovery research for OFFGRID; no product winner; no product code. |
| **Evidence** | `research/00-executive-summary.md`, `research/01-hackathon-intelligence.md` … `research/11-report-A-to-O.md` |
| **Consequence** | Problem/competitive/product landscapes documented; Afterhours notes→brief scaffold treated as rejected generic productivity, not a pick. |

---

### 2026-09-21 — First candidate generation

| | |
|---|---|
| **Decision** | Generate and score concepts; advance five *investigations* only (not a build order). |
| **Evidence** | `research/05-problem-opportunities.md`, `research/06-product-concepts.md`, `research/07-shortlist.md`, `research/10-final-recommendation.md` |
| **Consequence** | CiteCheck, Action Receipt, Canary Session, Spec Triangle, Merge Preflight entered validation. Trace Autopsy / SourceFix / SQL Grain Diff / Docs Click / Honest Patch filtered out earlier. |

---

### 2026-09-21 — First validation cycle

| | |
|---|---|
| **Decision** | Adversarial kill tests on the five candidates; no architecture; no replacement product. |
| **Evidence** | `research/validation/01-citecheck.md` … `05-merge-preflight.md`, sources under `research/validation/` |
| **Consequence** | Each candidate measured against incumbents, demo honesty, false-green risk, and post-hackathon path. |

---

### 2026-09-21 — Five candidates killed

| | |
|---|---|
| **Decision** | **KILL** CiteCheck, Action Receipt, Canary Session, Spec Triangle, Merge Preflight. Zero survivors. |
| **Evidence** | `research/validation/07-final-survivor-report.md` — no candidate meets the evidence threshold |
| **Consequence** | Do not resurrect, rename, combine, or variant these five. Do not start product code for them. |

---

### 2026-09-21 — Second discovery cycle opened

| | |
|---|---|
| **Decision** | Investigate three residual areas left by cycle-1 kills; prefer kill over forcing a product. |
| **Evidence** | `research/second-cycle/01-problem-discovery.md` … `08-hackathon-fit.md` |
| **Consequence** | New corpus for world-state, socio-technical, and replayable failure shapes; class forbids reopening killed products. |

---

### 2026-09-21 — Three residual areas investigated

| | |
|---|---|
| **Decision** | Exhaust Areas 1–3 as product wells. |
| **Evidence** | World-state: `02-world-state-evidence.md`; socio-technical: `03-socio-technical-failures.md`; replayable: `04-replayable-failures.md`; competitive: `05-competitive-landscape.md` |
| **Consequence** | 24 numbered opportunities → 0 KEEP after destruction (16 KILLED, 8 WEAK). Concepts file is a refusal record (`06-product-concepts.md`). |

---

### 2026-09-21 — Second cycle closed; RF-1 killed; zero survivors

| | |
|---|---|
| **Decision** | Close second cycle. Kill RF-1 (only thin KEEP) before concept stage. **ZERO survivors. ZERO concepts advanced.** |
| **Evidence** | `research/second-cycle/09-final-shortlist.md`, `07-competitive-destruction.md`, `10-sources.md` |
| **Consequence** | Do not write architecture. Do not force a sixth/seventh idea. Do not re-pass Areas 1–3 without a new thesis. |

---

### 2026-09-21 — Research paused

| | |
|---|---|
| **Decision** | **RESEARCH PAUSED.** Zero survivors is acceptable. Do not build because a deadline exists. |
| **Evidence** | This log; `research/RESEARCH-STATUS.md`; `research/ANTI-FORCING.md`; `research/STATUS-SUMMARY.md`; reopen only via `research/REOPEN-GATE.md` |
| **Consequence** | Engineering governance docs may exist (`docs/ENGINEERING-STANDARDS.md`, `docs/FUTURE-ARCHITECTURE-RULES.md`, `.cursor/rules/hack47-engineering.mdc`); application code and speculative architecture remain forbidden until a product is selected under the gate. |

---

### 2026-09-21 — Eligibility clarification still pending

*[Redacted before public release: personal eligibility notes.]*

---

### 2026-09-21 — Failure-Mode Cycle 03 opened and closed (thesis killed)

| | |
|---|---|
| **Decision** | Investigate thesis “Silent Non-Occurrence of Expected Work.” Outcome: **C — THESIS KILLED.** Survivors **0.** No product selection. No architecture / application code. |
| **Evidence** | `research/FAILURE-MODE-CYCLE-03.md`, `research/FAILURE-MODE-CYCLE-03-sources.md` |
| **Consequence** | Absence-of-expected-event is a real failure modality but an occupied product category (heartbeat/cron monitors, data freshness, no-data monitors, orchestrator miss metrics, Silent Fail–class automation dead-men). Do not reopen this thesis under a rename. Research remains paused pending a *different* failure-mode thesis under `research/REOPEN-GATE.md`. |

---

### 2026-09-21 — Failure-Mode Cycle 04 opened and closed (thesis killed)

| | |
|---|---|
| **Decision** | Investigate thesis “Decision-Making Under Fragmented Truth.” Outcome: **C — THESIS KILLED.** Survivors **0.** No product selection. No architecture / application code. |
| **Evidence** | `research/FAILURE-MODE-CYCLE-04.md`, `research/FAILURE-MODE-CYCLE-04-sources.md` |
| **Consequence** | Multi-source disagreement at action time is a real failure modality but an occupied stack (MDM/survivorship, CRM duplicate gates, CMDB reconciliation, CLM versioning, finance reconciliation, catalogs/lineage, enterprise search/verified KM). Collapse to RAG/search/KM/workflow = kill. Do not reopen under rename (“truth at click,” “conflict copilot,” etc.). Research remains paused pending a *different* failure-mode thesis under `research/REOPEN-GATE.md`. |

---

### 2026-09-21 — Product Discovery Reset produced Working Candidate AliasTripwire

| | |
|---|---|
| **Decision** | User-authorized Product Discovery Reset (new kill rule; do not return 0 survivors). Produced Working Product Candidate **AliasTripwire** — continuous silent hosted-LLM alias/backend swap detection via frozen canaries + output hashing. **Not permanent selection;** next step is product validation. No architecture / application code. |
| **Evidence** | `research/PRODUCT-DISCOVERY-RESET.md` (20 raw → 10 refined → 5 finalists → 3 strongest → 1 working candidate). Final-3 also: PlanMirror, FossilFixtures. |
| **Consequence** | Validate AliasTripwire next (stability, exact-product search, willingness). Do not start another discovery cycle. Do not treat AliasTripwire as selected until validation passes. Fallback candidates if killed: PlanMirror, FossilFixtures. |

---

### 2026-09-22 — AliasTripwire validation → KILL

| | |
|---|---|
| **Decision** | Working candidate **AliasTripwire** validated. Outcome: **C — KILL.** Not selected. No architecture / PRD / application code. Survivors remain **0** for permanent selection. |
| **Evidence** | `research/ALIAS-TRIPWIRE-VALIDATION.md`, `research/ALIAS-TRIPWIRE-VALIDATION-SOURCES.md`. Problem real (DeepSeek changelog same-name/re-post-train + compatibility routing; OpenAI `system_fingerprint`; Anthropic alias vs pin + serving infra). **Primary-workflow occupation:** [Provider Sentinel](https://vertrule.com/provider-sentinel/) (sealed provider canaries → baseline → drift classification including alias-contract vs behaviour → evidence packs). Neighboring continuous AI canary SaaS: [PromptCanary](https://www.promptcanary.dev/), AICanary. Exact-hash-only canaries unreliable per OpenAI determinism docs + Provider Sentinel OpenAI reproducibility-instability case study. No API keys → live canary FP rate unmeasured; experiment designed only. |
| **Consequence** | Do **not** rename AliasTripwire and continue. Do **not** build `src/` for it. Kill is on **exact primary workflow**, not Promptfoo/LangSmith adjacency alone. Fallback candidates from discovery reset remain **PlanMirror** and **FossilFixtures** if user authorizes next validation — not another discovery cycle unless requested. Research posture: no product selected. |

---

### 2026-09-22 — Final Product Hunt selected Working Product ScopeBrake

| | |
|---|---|
| **Decision** | Final Product Hunt (last discovery cycle; non–AI-infra territory; updated kill rule). Named Working Product **ScopeBrake** — mid-job trades change-order authorization gate (photo + priced delta + customer sign before continue / invoice line unlock). **Not permanent selection** until validation. Finalists also: **CallbackGate**, **AuthDayGate**. Discovery cycles **STOP**. No architecture / PRD / application code this step. |
| **Evidence** | `research/FINAL-PRODUCT-HUNT.md` (30 raw → 10 products → 5 concepts → 3 finalists → 1 Working Product). Primary pain: Anvilfield change-order field guide; plumbing work-order vs invoice guidance. Adjacent (not exact kill): Jobber/ServiceTitan/FieldLoom/SoloPro FSM suites. Exact-adjacent kills this pass: SlipException (ThickDot/TableFlow), RunSheetLive (Bekkn/Rundown), deposit packet apps. |
| **Consequence** | Next step = **validation for ScopeBrake** (then PRD only if validation passes). Do **not** start another discovery cycle. Do **not** resurrect AliasTripwire or other forbidden names. Fallbacks if ScopeBrake killed: CallbackGate → AuthDayGate. Do not treat ScopeBrake as permanently selected yet. |

---

### 2026-09-22 — ScopeBrake validation → KILL

| | |
|---|---|
| **Decision** | Working Product **ScopeBrake** validated. Outcome: **KILL.** Not selected. No architecture / PRD / application code. Survivors remain **0** for permanent selection. |
| **Evidence** | `research/SCOPEBRAKE-VALIDATION.md`, `research/SCOPEBRAKE-VALIDATION-SOURCES.md`. Pain real (Anvilfield HVAC CO field guide; Contractor+ HVAC CO process; LegalClarity plumbing work-order/invoice; Joist extras education). **Primary-workflow occupation:** [MyChangeOrder](https://mychangeorder.com/) — mid-job priced CO + GPS evidence + on-site/remote e-sign → one-click invoice for electrician/plumber/HVAC/solo crews (free tier + pay-per-CO + Pro pricing on site). Strong adjacent: [Joist Change Orders](https://support.joistapp.com/en/articles/9212730-change-orders) (Elite; optional signature). FSM suites (Jobber/HCP/ServiceTitan/FieldPulse/Workiz/ServiceM8/Fergus/Tradify/Contractor Foreman/Buildxact) = adjacent features, not sole kill. Final Product Hunt claim of “no primary CO-gate product for solos” **falsified**. AI: not needed. |
| **Consequence** | Do **not** rename ScopeBrake and continue. Do **not** build `src/` for it. Kill is on **exact primary workflow** (MyChangeOrder), not “Jobber has change orders” alone. Fallbacks from Final Product Hunt remain **CallbackGate** then **AuthDayGate** if user authorizes next validation — not another discovery cycle unless requested. Research posture: no product selected. |

---

### 2026-09-22 — HIGH-CONFIDENCE PRODUCT HUNT v2 CLOSED → PackLock (MODIFY) for PRD-next

| | |
|---|---|
| **Decision** | Last discovery pass on candidates **A–E**. Outcome: **MODIFY OrderLock → PackLock**; advance **PackLock** to **PRD-next**. **KILL** original OrderLock, DockShield, Chargeback Prevention Gate, FlowDiff, CaseProof. **Discovery CLOSED.** No further product hunt. No architecture / application code this step. Not permanent selection until PRD. |
| **Evidence** | `research/HIGH-CONFIDENCE-PRODUCT-HUNT.md`, `research/HIGH-CONFIDENCE-PRODUCT-HUNT-SOURCES.md`. **A original KILL:** [GroundControl PO Review](https://gndctl.com/solutions/po-review-software) exact supplier PO-vs-quote / PO-revision before production. **PackLock MODIFY:** EMS Golden Data Pack Stop/Go gate (BOM/Gerber/XY/drawing cohesion + traveler release lock); process primary in [EMS handbook intake/freeze](https://emshandbook.com/vol-03/1/release-checklist-and-freeze-rules/); no exact primary SaaS found; Adjacent ≠ kill: CalcuQuote quote-pack, Valor NPI DFM, GroundControl PO review. **B KILL:** [Osa AI Retail Compliance](https://osacommerce.com/osa-ai-retail-compliance) (Manifest 2026) + [AIMS360](https://www.aims360.com/features-integrations/edi-retailer-chargeback-management) pre-ship compliance. **C KILL:** [Cleo Chargeback Prevention](https://www.cleo.com/solutions/supply-chain-orchestration/chargeback-prevention) owns named prevention / exposure-before-penalty. **D KILL:** D365 Procurement Agent impact analysis; EquatorOps; Pathnovo; Oracle/Bluestar ECM. **E KILL:** Fask / ROIAI / RetailPath (retail evidence); CertNode/Chargeflow (card). |
| **Consequence** | Next step = **PRD for PackLock only**. Do **not** open another discovery cycle. Do **not** revive killed A–E originals or forbidden prior names. Do **not** build `src/` until PRD accepted and product selected under `research/REOPEN-GATE.md` / engineering standards. Survivors for discovery: **1 (PackLock → PRD)**. Permanent product selection: still **pending PRD**. |

---

### 2026-09-22 — PackLock planning docs written (PRD → tech spec → architecture → plan)

| | |
|---|---|
| **Decision** | Author PackLock **planning documentation only**. Product requirements taken from HIGH-CONFIDENCE hunt. **No** application code, **no** Milestone 0 scaffold, **no** new product deps, **no** `apps/packlock` directories created yet. Permanent selection still requires explicit acceptance + implementation approval. |
| **Evidence** | Originally `docs/PRD.md`, `docs/TECHNICAL-SPECIFICATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION-PLAN.md` — later moved to `docs/archive/packlock/` when PackLock was abandoned. |
| **Consequence** | Architecture/planning started for PackLock. **Superseded the same day** by SemaDiff product reset (see next entries). |

---

### 2026-09-22 — PackLock ABANDONED; SemaDiff product direction

| | |
|---|---|
| **Decision** | **ABANDON PackLock** as active OFFGRID product direction. Name **SemaDiff** as working product direction: local-first behavioral intelligence CLI (observable behavior after code changes; evidence-first; AI-second). Discovery remains **CLOSED**. **No** application code. **No** resurrection of PackLock features or killed products (ScopeBrake, AliasTripwire, FlowDiff, Afterhours notes→brief, etc.). |
| **Evidence** | User product reset; competitive research `research/SEMADIFF-COMPETITIVE-SOURCES.md` (Exa + Jina + `gh`; closest Near = RealDiff; no exact full-workflow clone). Planning SoT: `docs/SEMADIFF-PRD.md`, `docs/TECHNICAL-SPECIFICATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION-PLAN.md`, `docs/CLI-SPECIFICATION.md`, `docs/AI-ARCHITECTURE.md`, `docs/THREAT-MODEL.md`. PackLock docs archived under `docs/archive/packlock/`. |
| **Consequence** | Status files point at SemaDiff. Next = accept SemaDiff plan → **Milestone 0 only when coding authorized** (calendar constraints before 30 Sep 2026). Application implementation **STOPPED**. |

---

### 2026-09-22 — SemaDiff planning docs written; M0 not started

| | |
|---|---|
| **Decision** | Author SemaDiff **planning documentation only** (PRD, tech spec, architecture, implementation plan, CLI/AI/threat, engineering-standards CLI extensions). Archive PackLock planning docs. Update RESEARCH-STATUS / STATUS-SUMMARY / README / DECISION-LOG. |
| **Evidence** | Files listed in prior entry; `research/RESEARCH-STATUS.md`; `research/STATUS-SUMMARY.md`. |
| **Consequence** | Planning complete for SemaDiff direction. **Superseded same day** by M0 implementation approval (next entry). |

---

### 2026-09-22 — SemaDiff M0 Foundation COMPLETE

| | |
|---|---|
| **Decision** | User explicitly authorized OFFGRID coding override for **SemaDiff Milestone 0 only**. Implement foundation in `packages/semadiff/` and **STOP before M1**. |
| **Evidence** | `packages/semadiff/`; `docs/IMPLEMENTATION-PLAN.md` §7; tests 20/20 pass (`npm test`). |
| **Consequence** | Application code exists for SemaDiff. Do **not** start DiffEngine / full baseline capture / Featherless live / hosted demo until M1+ authorization. Do **not** extend Afterhours `src/`. Do **not** revive PackLock. |

**Doc conflict resolutions (priority: PRD → tech → architecture → CLI → AI → threat → impl plan):**

1. **`init` in M0:** Impl plan originally deferred `init` to M1; user M0 scope + CLI SPEC / PRD MVP surface require `semadiff init` now. **Absorbed into M0**; M1 reframed to LocalGit identity + deterministic capture prep.  
2. **Package path:** Architecture did not pin `apps/` vs `packages/`; chose **`packages/semadiff`** modular monolith (CLI package), leaving root `src/` historical.  
3. **CLI framework:** Chose **`commander`** (not citty).  
4. **Config:** **YAML + zod** (not JSON-only).  
5. **Tests:** **`node:test` + `tsx`** (not vitest).  

---

### 2026-09-22 — Stack locks for SemaDiff M0

| | |
|---|---|
| **Decision** | Lock M0 stack: Node 20+, TypeScript ESM, commander, yaml, zod, MockAIProvider required, no live LLM in tests, filesystem storage only (no DB). |
| **Evidence** | `packages/semadiff/package.json`; `docs/ARCHITECTURE.md` layer rules; `docs/AI-ARCHITECTURE.md`. |
| **Consequence** | Do not add citty, vitest, or provider SDKs without a concrete later-milestone requirement. AI remains explain-only (no shell/Git/fs tools). |

---

### 2026-09-22 — SemaDiff M1 Deterministic Capture COMPLETE

| | |
|---|---|
| **Decision** | User explicitly authorized **SemaDiff Milestone 1 only**: LocalGit + ProcessExecutor + normalize/digest + Evidence/Baseline persist + `semadiff baseline`. **STOP before M2** (no DiffEngine / `check` / explain / Featherless). |
| **Evidence** | `packages/semadiff/`; `docs/IMPLEMENTATION-PLAN.md` §8; tests 48/48 pass (`npm test`). |
| **Consequence** | Capture path is real. Do **not** start BehavioralDiff/`check` until M2 authorization. AI remains unused by baseline. Do **not** revive PackLock or extend Afterhours `src/`. |

**Doc conflict resolutions (M1):**

1. **Milestone numbering:** Impl plan’s old “M2 WorkflowRunner + Evidence capture” absorbed into authorized M1; next product milestone is **M2 BehavioralDiff / check**.  
2. **Digest:** SHA-256, lowercase hex, prefix `sha256:` over normalized bytes (`normalize-v1`).  
3. **Env policy:** default `path` (PATH + workflow.env); `none` / `all` available.  
4. **Non-zero exit:** recorded as Evidence fact; baseline may succeed. Timeout/spawn fail → not successful baseline (`analysis_error`).  
5. **Artifacts:** M1 exact relative paths only (no `**` glob expansion yet).  

---

### 2026-09-22 — SemaDiff M2 Deterministic BehavioralDiff / check COMPLETE

| | |
|---|---|
| **Decision** | User explicitly authorized **SemaDiff Milestone 2 only**: deterministic DiffEngine + `semadiff check`. **STOP before M3** (no explain / Featherless / impact graph / history / ci). |
| **Evidence** | `packages/semadiff/`; `docs/IMPLEMENTATION-PLAN.md` §9; tests 61/61 pass (`npm test`). |
| **Consequence** | BehavioralDiff is real and evidence-cited. Do **not** start AI explain until M3 authorization. Do **not** revive PackLock or extend Afterhours `src/`. |

**Doc conflict resolutions (M2):**

1. **Comparison honesty:** DiffEngine compares keyed Evidence observations only — not causality, not auto “regression”/bug labels.  
2. **Finding vocabulary:** `exit_code_changed` \| `stdout_changed` \| `stderr_changed` \| `artifact_changed` \| `truncation_changed` \| `observation_changed`.  
3. **normalizer_version mismatch:** `analysis_error` — never silent compare / never `clean`.  
4. **Missing baseline:** `user_error` (exit 2) — never reported as `clean`.  
5. **`--fail-on`:** default `never` (local findings → exit 0); `warn`/`error` gate exit 1.  
6. **Shared capture:** `check` reuses M1 `captureWorkflows` — no second execution path.  
7. **Baseline immutability:** `check` persists current Evidence + BehavioralDiff under `runs/`; never rewrites `baselines/active.json`.  
8. **`--base`:** Git identity hint only in M2; dual worktree re-run deferred.  

---

### 2026-09-22 — SemaDiff M3 Evidence-Backed Explanation / MockAI COMPLETE

| | |
|---|---|
| **Decision** | User explicitly authorized **SemaDiff Milestone 3 only**: ExplanationPacket builder + MockAI `explain`. **STOP before M4** (no CI / history / Featherless live / impact graph / agents). |
| **Evidence** | `packages/semadiff/`; `docs/IMPLEMENTATION-PLAN.md` §10; `docs/AI-ARCHITECTURE.md`; tests 77/77 pass (`npm test`). |
| **Consequence** | Offline explain works without credentials. Do **not** start M4 until authorized. Do **not** revive PackLock or extend Afterhours `src/`. |

**Doc conflict resolutions (M3):**

1. **Packet name:** Wire schema remains **EvidencePacket.v1**; application alias **ExplanationPacket**.  
2. **Featherless:** Listed in config/CLI enums for forward compat; **not implemented in M3** (unavailable → exit 4). Live adapter stays **M6**.  
3. **Explanation richness:** Extended beyond thin tech-spec sketch with `facts` / `hypotheses` (categorical confidence) + `promptVersion` — DiffEngine still owns findings/status.  
4. **Provider surface:** `explain(packet)` only; never repo/git/storage/executor.  
5. **Budgets:** Hard `ai.maxChars` / `maxFindings` / `maxExcerpts` / `maxExcerptChars` / `maxPaths`; refuse unsafe truncation of IDs/citations.  
6. **Fail soft:** Provider/explain failure leaves findings visible; never rewrite status to `clean`.  

---

### 2026-09-22 — SemaDiff M4 CI Integration + Production Hardening COMPLETE

| | |
|---|---|
| **Decision** | User explicitly authorized **SemaDiff Milestone 4 only**: CI integration + production hardening. **STOP before M5** (no history, Featherless, GitHub/GitLab, impact graph, agents, RAG, dashboard, telemetry). |
| **Evidence** | `packages/semadiff/` (`semadiff ci`, dirty-policy, executor cleanup, pack tests); `docs/IMPLEMENTATION-PLAN.md` §11; `docs/CLI-SPECIFICATION.md`; `docs/THREAT-MODEL.md` §6. |
| **Consequence** | CI gate is usable offline with local-active baseline. Do **not** start M5 until authorized. Do **not** revive PackLock or extend Afterhours `src/`. |

**Doc conflict resolutions (M4):**

1. **Authorized M4 vs plan labels:** Plan text had M4=history / M5=ci; owner authorization redefined M4 as **CI + hardening**. History deferred to next milestone.  
2. **Baseline model:** CI uses **local-active** baseline only — no PR/merge-base inference (documented limitation).  
3. **AI in CI:** Off by default; optional `--explain`; AI never decides status.  
4. **Dirty policy:** CI stricter than local check; operational `.semadiff/` artifacts excluded from source-dirty; config counts.  
5. **Packaging:** `private: true`; MIT license file; `npm pack` tested; no publish.  

---

### 2026-09-22 — SemaDiff M5 Featherless Live Provider + External AI Hardening COMPLETE

| | |
|---|---|
| **Decision** | User explicitly authorized **SemaDiff Milestone 5 only**: Featherless live provider + external AI hardening. **STOP before M6** (no history, GitHub/GitLab, impact graph, agents, RAG, dashboards, telemetry, embeddings, model routing). |
| **Evidence** | `packages/semadiff/` (`FeatherlessAIProvider`, HTTP adapter, taxonomy); `docs/FEATHERLESS-PROVIDER.md`; `docs/IMPLEMENTATION-PLAN.md` §12; tests 105 pass + 1 live skip. |
| **Consequence** | Optional live explain works with env key. Offline demo stays mock. Do **not** start M6 until authorized. Do **not** revive PackLock or extend Afterhours `src/`. |

**API verification (M5):**

1. **Base URL:** `https://api.featherless.ai/v1` (quickstart + completions docs).  
2. **Auth:** `Authorization: Bearer $FEATHERLESS_API_KEY` (docs once say “Authentication:” — treated as typo; OpenAI-compat uses Authorization).  
3. **Endpoint:** `POST /v1/chat/completions` with `model` + `messages`.  
4. **Structured output:** Official completions parameter table does **not** list `response_format`. Tool-calling / JSON guidance mentions `response_format: {type:"json_object"}`. SemaDiff prefers it + parses content.  
5. **Errors:** 400 cold → `provider_unavailable`; 401/403/429/5xx mapped; **no** infinite retries (docs suggest 503 retry — rejected for SemaDiff fail-soft).  

**Doc conflict resolutions (M5):**

1. **Authorized M5 vs plan labels:** Plan text had M5=history / M6=Featherless; owner authorization redefined M5 as **Featherless + AI hardening**.  
2. **No silent fallback:** Featherless failure never swaps to MockAI.  
3. **Domain purity:** chat.completions / Bearer stay in adapter only.  
4. **CI:** `--explain` optional; AI fail preserves findings status; exit 4 per M4.  

---

### 2026-09-27 — SemaDiff M6 Change Surface + Evidence-to-Code Context COMPLETE

| | |
|---|---|
| **Decision** | User explicitly authorized **SemaDiff Milestone 6 only**: deterministic Git change surface + Finding↔ChangeSurface association (co-occurrence, never causality). **STOP before M7** (no call/dependency graphs, indexing, embeddings, RAG, LLM source analysis, causal inference, test selection, GitHub/GitLab, agents, dashboards, telemetry). |
| **Evidence** | `packages/semadiff/` (`domain/change-surface*.ts`, `infrastructure/git/{parse-diff,working-tree-diff}.ts`, `application/{capture,format}-change-surface.ts`, `prompts/explain.v2.ts`, `scripts/demo-m6.sh`); `docs/IMPLEMENTATION-PLAN.md` §13; tests 144 pass + 1 live skip (145 total). |
| **Consequence** | `check`/`ci`/`explain` report which files Git says changed and that findings co-occurred with them; causality is always `not_established`. Findings, severity, status and exit codes unchanged. Do **not** start M7 until authorized. |

**Decisions (M6):**

1. **Base revision:** the active baseline's `GitIdentity.headSha` — no merge-base, no PR base. `--base` does not affect the surface.  
2. **Comparability:** baseline captured from a dirty tree, missing SHA, or unreachable base commit → `not_comparable` (surface cannot represent the baseline's source state).  
3. **Executed-state check:** surface captured before and after execution; differing ids → `unavailable` (repo changed during execution).  
4. **Line locations shipped** from `git diff --unified=0` hunk headers (terminal/JSON only; not sent to AI). C-quoted paths are not attributed (`locationsComplete: false`). **Symbols deferred.**  
5. **Self-change isolation:** `.semadiff/{evidence,blobs,baselines,runs,cache}` filtered and counted (`excludedOperationalPaths`, excluded from surface id); gitignore also applies. Regression-tested.  
6. **Limits owned by domain** (200 files / 500 locations / 512-char paths / 64 000 chars / 4 MiB git output); deterministic code-unit ordering; explicit truncation; paths never shortened.  
7. **Versions:** EvidencePacket **v2** (v1 rejected explicitly, `unsupported_packet_version`); prompt `explain.v2` replaces v1; check/ci/explain JSON → **v2** (additive); BehavioralDiff stays **v1** with optional `changeSurface` (not part of diff id); Explanation stays v1.  
8. **Semantic guard:** when a change surface is present, explanation facts with causal wording (`caused`, `root cause`, `due to`, …) are rejected (`causal_fact`).  
9. **AI boundary:** MockAI and Featherless receive the same reduced packet (file list + association + causality; no contents/locations). Surface files are dropped first under packet budget.  
10. **Dependencies:** none added.  

**Reopened defect (M4 packaging):** `build` did not clean `dist/`, so deleted modules (e.g. `explain.v1`) shipped in `npm pack`. Fixed by a `clean` step before `tsc` (no new dependency).

---

### 2026-09-28 — SemaDiff six-blocker remediation (2 P0 + 4 P1) COMPLETE — M7 NOT started

| | |
|---|---|
| **Decision** | Remediate only the six P0/P1 blockers from the post-M6 adversarial audit. No new capabilities, no P2/P3 backlog, no architecture redesign, no new dependencies. PRD untouched. |
| **Evidence** | `packages/semadiff/` — `ports/interruption.ts`, `infrastructure/execution/{interrupt-controller,process-executor}.ts`, `application/{interruption-guard,capture-workflows,create-baseline,run-check,run-ci,run-explain}.ts`, `infrastructure/evidence/evidence-store.ts`, `domain/{errors,explanation-wording,validate-explanation-semantics}.ts`, `cli/program.ts`; new tests `interrupt-signals`, `executor-process-group`, `workflow-subset`, `stale-explain`, `ci-exit-precedence`, `explanation-semantics`. Tests 145 → 225 (224 pass + 1 live skip). |
| **Consequence** | Interrupted/failed runs can no longer masquerade as results; `--workflow` subsets compare only what was selected; CI exit codes cannot be masked by explain failures; the causal-language gate covers every model-generated field. |

**Decisions:**

1. **P0-1 interruption:** explicit `Interruption` state set only by signals SemaDiff receives (never inferred from a child's exit code). SIGINT → **130**, SIGTERM → **143** (128 + signal; new `terminated` exit class, documented in CLI spec). Use cases check the flag before every persist (evidence, baseline record, active pointer, run file, last-check) and the CLI before printing a verdict. Executor outcomes are now `exited | signaled | timed_out | interrupted | spawn_failed`; `signaled`/`interrupted` never become Evidence (`signaled` → exit 3). Second signal exits immediately.  
2. **P0-2 subsets:** baseline Evidence is filtered to the explicitly selected workflows in `run-check` (application boundary); DiffEngine untouched; full check unchanged. Selected workflow missing from the baseline → exit 2 `workflow_not_in_baseline`.  
3. **P1-1 stale explain:** `check`/`ci` replace `runs/last-check.json` with a `check_incomplete` marker at start; `explain` refuses it (exit 2) and refuses any diff whose `baselineId` ≠ active baseline (`check_stale`, exit 2 — "no current prior check" per CLI spec, not an analysis or provider failure). No history subsystem.  
4. **P1-2 process groups:** POSIX `detached: true` + `SIGKILL` to `-pgid` on timeout / interrupt / dispose, and stdio destroyed so the executor resolves promptly. Windows: direct child only (documented). Background processes left by a normally exiting workflow that don't hold its pipes are not reaped (documented; unchanged behavior).  
5. **P1-3 precedence:** `ci` exit = 3 > 1 > 4 > 0 (`ciExitCode`). `explain` itself never returns 1/3, so it did not share the defect; `check --explain` does not exist.  
6. **P1-4 semantics:** shared `validateExplanationSemantics` applied to narrative, facts, hypotheses, citations, caveats, `promptVersion`, `modelId`; expanded causal lexicon; enforced with or without a change surface; hedges allowed only in hypotheses; tightened `analysis_error` clean-claim rule. Verbatim packet quotes are excluded so evidence text containing "because" does not fail MockAI.  
7. **Test change (justified):** `m4-hardening` asserted `exited || timed_out` after `killAllChildren`; `exited` encoded the P0-1 defect, so it now requires `interrupted`. No goldens changed.  

---

### 2026-09-29 — SemaDiff Milestone 7 (live trusted demo + host-agnostic Node hosting + MockAI only) COMPLETE — M8 NOT started

| | |
|---|---|
| **Decision** | User explicitly approved **M7 = "Live trusted demo + host-agnostic Node hosting + MockAI only."** Implemented as a thin `node:http` presentation/execution layer that runs the **real** CLI on the shipped `fixtures/demo` in a fresh temp Git repo per request. No uploads, arbitrary execution, editable fixtures, Featherless, keys, auth, DB, history, telemetry, GitHub/GitLab, graphs, RAG, agents, or chat. |
| **Evidence** | `packages/semadiff/src/hosted/*`, `packages/semadiff/hosted/public/*`, `scripts/demo-m7.sh`, tests `hosted-{api,demo,e2e}.test.ts`; `docs/IMPLEMENTATION-PLAN.md` §15; `docs/THREAT-MODEL.md` §8. Suite 258 tests: 257 pass + 1 live Featherless skip. |
| **Consequence** | Deployable to any Node host from the repo root with `npm install && npm run build && npm start`; `GET /health`. Not deployed by the agent. Do **not** start M8 without explicit approval. |

**Decisions (M7):**

1. **Placement:** server in `packages/semadiff/src/hosted/` (shares build + trusted fixture), excluded from the npm tarball (`files: "!dist/hosted"`); CLI package contents unchanged.  
2. **Deployment directory:** repository root. Root `build` = `npm ci --include=dev` + build in `packages/semadiff` (survives `NODE_ENV=production` devDependency pruning); root `start` = `node packages/semadiff/dist/hosted/server.js`. Historical Afterhours server kept, not extended, as `start:afterhours-historical`.  
3. **Execution:** argv-only children; own runner (SIGTERM → 2 s → SIGKILL on the child's process group) because the CLI's workflows live in separate groups that only the CLI can clean up. Fixture git: `--template=`, `core.hooksPath=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, private HOME, fixed author/committer/date.  
4. **API:** strict `{"scenario":"<id>"}` only; registry of one scenario (`behavior-change`, same change as `demo:m6`); findings/explanation copied from `explain --provider mock --json` (zod-validated, never recomputed); explicit failure kinds; HTTP 200 only for completed runs.  
5. **Scrubbing:** temp workspace path → `<workspace>`, package root → `<app>`; no other output changes.  
6. **Limits:** env-configured concurrency (default 2, 503 + Retry-After, no queue), request/stage timeouts, workspace TTL sweeper, output/body caps, shutdown grace.  
7. **Dependencies:** none added. **CLI:** unchanged (no CLI-SPECIFICATION change).  
8. **Test-only change:** `executor-process-group` fixed 300 ms pre-interrupt wait → 1 s (flaked 1 in 5 under the added parallel load); assertions unchanged, no product change.  

**Recorded PRD conflict (PRD not modified):** `docs/SEMADIFF-PRD.md` still lists "Rank / narrate likely causal links citing evidence IDs" as an AI capability. Since M6 the product guarantee is **causality: not established** (co-occurrence only; the semantic gate rejects causal wording). The hosted demo presents "Causality: not established" as a product guarantee; the PRD wording is stale and should be reconciled if the PRD is revised.

---

## Finalization for submission (29 Sep 2026)

| | |
|---|---|
| **Decision** | Finalize SemaDiff for public HACK47 OFFGRID submission without new capabilities. **Name kept: SemaDiff** — overlap acknowledged (snapshot testing, cram/trycmd, RealDiff, Selfsame, arXiv 2607.13111 "SemaDiff" paper). **PRD overclaims annotated, not rewritten:** `history`, merge-base default comparison, causal narration, L0–L6 reduction ladder. **Terminology:** `affectedAssumptions` = "Declared assumptions (for affected workflows)" — all declared config assumptions whenever any finding exists; no inference, no linking. **Hosted demo:** scenario replaced by `pricing-discount-change` (DISCOUNT 0.10→0.20 → exactly one finding, stdout 315→280; tests stay green); response `schemaVersion: 2` with server-derived `summary`; `GET /ready` added (503 when git is unavailable). **CLI:** `init` writes a commented template config (placeholder workflow `example`; baseline on the unedited template exits 2); commander errors (unknown options/arguments/commands) exit 2 with a single `error:` line. **Repo hygiene:** research, historical scaffold, and the abandoned earlier direction archived under `archive/`. **Runtime:** Node >=20 supported via an explicit test file list. |
| **Evidence** | `docs/SEMADIFF-PRD.md` inline annotations; `docs/CLI-SPECIFICATION.md`; `docs/ARCHITECTURE.md` §hosted; `docs/THREAT-MODEL.md` §8; `docs/IMPLEMENTATION-PLAN.md` §15 finalization update; `archive/README.md`. |
| **Consequence** | Docs match shipped behavior. **Pending user:** deployment to a public URL, public repo push, demo video. |

---

### 2026-09-29 — Product renamed SemaDiff → DiffWitness (before first public commit)

| | |
|---|---|
| **Decision** | Rename the product to **DiffWitness** before any public commit. CLI binary and npm package `diffwitness` (still private/unpublished), package directory `packages/diffwitness`, project state directory `.diffwitness/`, root workspace package `diffwitness-workspace`, env vars `SEMADIFF_*` → `DIFFWITNESS_*`. Engine semantics, evidence IDs/prefixes, exit codes, and JSON schema versions unchanged. |
| **Evidence** | Naming audit: `semadiff` conflicts with BleedingDev/semadiff (an active TypeScript CLI of the same name), the taken github.com/SemaDiff account, and arXiv 2607.13111 ("SemaDiff" paper). Re-check on 29 Sep 2026: `npm view diffwitness` → 404; `https://api.github.com/users/diffwitness` → 404; `https://api.github.com/repos/diffwitness/diffwitness` → 404; GitHub repository search `diffwitness in:name` → 0 results. |
| **Consequence** | Archive text left as written (historical). Judge-facing docs use DiffWitness, with a one-line "formerly SemaDiff" note in the README related-work section and `docs/SUBMISSION.md`. Future GitHub home `diffwitness/diffwitness` not created by the agent. |
