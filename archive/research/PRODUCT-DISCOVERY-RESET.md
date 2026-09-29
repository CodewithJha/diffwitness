# Product Discovery Reset

**Date:** 21 September 2026  
**Workspace:** repository root  
**Scope:** Discovery only. No application code, architecture, PRD, deps, or `src/` changes.  
**Override:** User explicitly authorized this reset to produce a Working Product Candidate (not permanent selection). New kill rule applied: competitors / crowded categories do not auto-kill; kill only exact same workflow+mechanism, trivial problem, no user, unbuildable, weak demo, no value, or generic AI wrapper.  
**Channels used:** agent-reach doctor; Exa (`mcporter call exa.web_search_exa`); Jina Reader (`r.jina.ai`); GitHub `gh search`. Reddit/Twitter backends off — not used as proof.

**Engineering note:** Any eventual implementation must follow `docs/ENGINEERING-STANDARDS.md`. No architecture is designed here.

---

## Previous Research (brief what killed)

| Cycle | Outcome |
|---|---|
| Cycle 1 | **CiteCheck, Action Receipt, Canary Session, Spec Triangle, Merge Preflight** killed — incumbents/OSS occupy wedge, demo collapses to search/fixture theater, or false-green gates. |
| Cycle 2 | Residual wells (world-state SoT packaging, socio-technical “someone must notice,” replay/snapshot) → **0 survivors**. |
| Cycle 03 | Thesis “silent non-occurrence of expected work” → occupied by heartbeat/cron/freshness monitors (Cronitor/Healthchecks class). |
| Cycle 04 | Thesis “decision under fragmented truth” → occupied by MDM/CRM/CMDB/CLM/reconciliation/search/RAG. |
| Placeholder | **Afterhours notes→brief** rejected as generic productivity. |

**Forbidden as products (still):** those exact concepts; generic chatbot/assistant/RAG/dashboard; CRUD+AI; ChatGPT-for-X; meeting summarizer; coding copilot; task/notes apps; generic observability; simple PDF analyzer; LLM browser extension; upload→summary; prompt generator.

**This reset:** Broad exploration across developers, AI eng, data, small eng teams, researchers, ops, a11y, SaaS billing — looking for sharp A→B→C→D→E workflows where tools stop early. Mechanism-first, not “AI that helps.”

---

## 20 Raw Ideas

### Idea 1 — AliasTripwire
- **User:** AI engineer shipping production LLM features on floating model aliases  
- **Problem:** Provider retrains / swaps the model behind a stable name; code, logs, and version fields stay quiet  
- **Current workflow:** Hope; occasional manual prompt re-check; maybe notice `system_fingerprint` change  
- **Why painful:** Parsers, refusals, tool-call shapes break without a deploy on your side  
- **Product:** Continuous tripwire: resolve alias → run frozen canary prompts → hash outputs → alert on persistent flip  
- **Core mechanism:** observe + compare + detect (identity + behavioral canary)  
- **Why technically interesting:** Ground truth is output distribution under fixed inputs, not vendor metadata  
- **Demo:** Register `gpt-…` / Claude alias; show canary green; switch to alternate model; tripwire fires with before/after hashes  
- **Potential continuation:** AI ops reliability product for teams that will not adopt a full eval platform  

### Idea 2 — PlanMirror
- **User:** Solo/small SaaS founder or eng lead changing pricing  
- **Problem:** Marketing pricing page claims diverge from code entitlement / plan checks  
- **Current workflow:** Spreadsheet + manual click-through of plans; `if (plan === "pro")` archaeology  
- **Why painful:** Accidental unlocks (revenue leak) or accidental locks (churn / support fire)  
- **Product:** Extract feature claims from pricing HTML + extract gate identifiers from code → mismatch matrix  
- **Core mechanism:** reconcile / compare / constrain  
- **Why technically interesting:** Two different representations of “what access means” must be joined without MDM  
- **Demo:** Paste pricing URL + paste repo snippets → red cells for “Pro claims X / code only gates Y”  
- **Potential continuation:** Pricing-change confidence tool for SaaS  

### Idea 3 — FossilFixtures
- **User:** Backend engineer with JSON fixtures mocking external or internal APIs  
- **Problem:** Fixtures fossilize; live responses drift; CI stays green  
- **Current workflow:** Discover in production; manually update fixtures after incident  
- **Why painful:** Types and mocks agree with each other, not with the wire  
- **Product:** Shape-tree diff of fixtures folder vs live samples / HAR; breaking vs additive report; fixture patch  
- **Core mechanism:** observe + compare + generate (updated fixtures)  
- **Why technically interesting:** Contract without requiring OpenAPI first  
- **Demo:** Fixture vs live JSON → removed field highlighted → patched fixture download  
- **Potential continuation:** CI gate for fixture honesty  

### Idea 4 — PromptEnv Diff
- **User:** LLM app team with prompts in files / env / Notion, not LangSmith  
- **Problem:** Staging and prod run different prompt versions for weeks unnoticed  
- **Current workflow:** Side-by-side output staring; Slack archaeology  
- **Why painful:** Behavior drift blamed on “the model”  
- **Product:** Environment pointers → immutable content hashes → diff + history  
- **Core mechanism:** compare + constrain + explain  
- **Why technically interesting:** Release engineering applied to prompts without forcing a vendor  
- **Demo:** Two env pointers resolve to different hashes; show textual diff  
- **Potential continuation:** Lightweight prompt release registry  

### Idea 5 — LockCast
- **User:** Eng shipping Postgres migrations without Rails `strong_migrations`  
- **Problem:** Migration “works” on tiny staging; locks / invalid indexes bite prod  
- **Current workflow:** Read docs; hope; Friday deploys  
- **Why painful:** Immediate, hard-to-rollback outages  
- **Product:** Parse migration SQL + optional table stats → lock/risk narrative + expand-contract checklist  
- **Core mechanism:** simulate + explain + constrain  
- **Why technically interesting:** Maps SQL ops to Postgres locking semantics as a product UX  
- **Demo:** Paste `ADD COLUMN … NOT NULL` → risk report with safer rewrite suggestions  
- **Potential continuation:** Cross-ORM migration safety as a service  

### Idea 6 — FlagDebt Scanner (narrow)
- **User:** Small eng team drowning in stale feature flags (not DoorDash scale)  
- **Problem:** Flags fully rolled out still branch in code  
- **Current workflow:** Defer cleanup; LaunchDarkly Vega if on LD enterprise  
- **Why painful:** Incident cognitive load; DoorDash: 1–2 hours per flag manually  
- **Product:** Given live flag state export + repo scan → stale candidates + safe hardcode PR drafts for boolean flags only  
- **Core mechanism:** reconcile (live state ↔ call sites) + generate  
- **Why technically interesting:** Correctness requires live rollout value, not source-only  
- **Demo:** Flag at 100% true + call sites → PR removing branches  
- **Potential continuation:** Vendor-agnostic cleanup for Unleash/Flagsmith/ConfigCat  

### Idea 7 — LabelName Check
- **User:** Frontend eng / a11y-conscious product team  
- **Problem:** Visible label ≠ accessible name (WCAG 2.5.3) — speech users fail  
- **Current workflow:** axe in CI (rule exists) but rare focused UX for fix  
- **Why painful:** Failures are silent for most testers  
- **Product:** Upload page / DOM snapshot → list mismatches with suggested accessible-name fixes  
- **Core mechanism:** detect + explain + generate  
- **Why technically interesting:** Precision on “what counts as the visible label”  
- **Demo:** Button “Save” with `aria-label="Submit form"` → fail + fix  
- **Potential continuation:** Narrow a11y fixer, not full axe clone  

### Idea 8 — DLQ Triage Desk
- **User:** On-call / backend owning SQS/Kafka DLQs  
- **Problem:** Thousands of dead letters; humans open one each; purge wins  
- **Current workflow:** Manual sample; tribal knowledge  
- **Why painful:** Replay landmines vs safe retries mixed  
- **Product:** Classify by exception + status + payload shape into replay protocols  
- **Core mechanism:** detect + cluster + explain  
- **Why technically interesting:** Taxonomy as product, not another metrics dashboard  
- **Demo:** Upload 50 DLQ JSON → buckets with “safe replay / poison / schema”  
- **Potential continuation:** Per-service triage sidecar  

### Idea 9 — BundleBlame
- **User:** Frontend eng fighting sudden bundle size jump  
- **Problem:** Diff shows many files; root import unclear  
- **Current workflow:** `webpack-bundle-analyzer` archaeology  
- **Why painful:** Perf regressions ship as “mystery”  
- **Product:** Compare two build stats → attribute bytes to new/changed import edges  
- **Core mechanism:** compare + explain  
- **Why technically interesting:** Graph diff of module graphs  
- **Demo:** Before/after stats.json → “+180kb from `lodash-es` via `X.tsx`”  
- **Potential continuation:** CI comment bot  

### Idea 10 — EnvSemantic Diff
- **User:** DevOps / eng before prod deploy  
- **Problem:** Staging vs prod config drift (missing keys, rename, format) hides outages  
- **Current workflow:** Eyeball `diff`; quarterly cleanup  
- **Why painful:** Service starts; first request cliffs  
- **Product:** Flatten JSON/YAML/TOML/ENV → masked semantic key diff  
- **Core mechanism:** compare + constrain  
- **Why technically interesting:** Cross-format flatten + secret masking as default  
- **Demo:** Paste staging + prod → missing `STRIPE_WEBHOOK_SECRET` in one region  
- **Potential continuation:** Pre-deploy ritual product  

### Idea 11 — Webhook Consumer Guard (narrow ≠ HookHound)
- **User:** Team consuming third-party webhooks  
- **Problem:** Provider additive-until-it-isn’t; consumer parser breaks  
- **Current workflow:** Customer complaints; HookHound-class inbound monitors if adopting their stack  
- **Why painful:** Silent drop / corrupt state  
- **Product:** From recorded deliveries, maintain consumer expectation schema + CI against fixtures  
- **Core mechanism:** observe + compare + constrain  
- **Why technically interesting:** Consumer-driven lockfile for webhook JSON  
- **Demo:** Old vs new Stripe-like payload → breaking field removed  
- **Potential continuation:** Consumer-side webhook contracts  

### Idea 12 — RateBudget Simulator
- **User:** Platform eng for multi-tenant API  
- **Problem:** Per-tenant quotas interact with shared upstream budgets unpredictably  
- **Current workflow:** Spreadsheets; discover via 429 storms  
- **Why painful:** Noisy-neighbor outages  
- **Product:** Simulate request mixes against quota policies → who trips first  
- **Core mechanism:** simulate + predict  
- **Why technically interesting:** Discrete-event sim of rate limiters  
- **Demo:** 3 tenants + shared OpenAI budget → projected trip minute  
- **Potential continuation:** Capacity planning for AI backends  

### Idea 13 — TrainLeak Gate
- **User:** ML engineer / student researcher  
- **Problem:** Train/test row overlap quietly inflates metrics  
- **Current workflow:** Hope; later discover with `splitcheck` / LeakLens if known  
- **Why painful:** Invalid experiments ship to papers/prod  
- **Product:** Hosted/CI check for exact + normalized leakage with fail threshold  
- **Core mechanism:** compare + constrain  
- **Why technically interesting:** Normalization that still fails CI  
- **Demo:** Upload train/test CSV → 2.1% leakage fail  
- **Potential continuation:** Pre-flight for ML datasets (crowded — keep only if UX wedge clear)  

### Idea 14 — CascadeWitness
- **User:** Frontend eng debugging “why is this CSS value winning?”  
- **Problem:** Mental cascade walk; blind `!important`  
- **Current workflow:** DevTools Computed panel manually  
- **Why painful:** Slow; wrong fix increases specificity debt  
- **Product:** Paste HTML+CSS → explain winning declaration path (specificity, layer, order)  
- **Core mechanism:** simulate + explain  
- **Why technically interesting:** Cascade algorithm as productized explainer  
- **Demo:** Two competing rules → winner + why  
- **Potential continuation:** Teaching + debugging tool  

### Idea 15 — SecretCutover Check
- **User:** Ops rotating DB/API credentials  
- **Problem:** Cut over before new secret proven; AWS Secrets Manager has path but DIY stacks don’t  
- **Current workflow:** Flip and pray; blue/green if mature  
- **Why painful:** Dual outage window  
- **Product:** Dual-read validate AWSPENDING-equivalent against real dependency before promote  
- **Core mechanism:** verify + constrain + recover  
- **Why technically interesting:** Orchestrated dual-credential proof independent of AWS  
- **Demo:** Old works / new fails → block promote; fix; pass  
- **Potential continuation:** Rotation reliability for non-AWS shops  

### Idea 16 — AgentCost Breaker (note: occupied)
- **User:** Anyone running agent loops  
- **Problem:** Runaway tokens / loops  
- **Current workflow:** Find out from the bill  
- **Why painful:** Margin death  
- **Product:** Wrapper with budget / loop kill  
- **Core mechanism:** constrain + detect  
- **Why technically interesting:** Predictive “worth-it” trip  
- **Demo:** Loop trips at $5  
- **Potential continuation:** **Likely kill** — circuitbreaker.dev / MonetiseBG already ship this workflow  

### Idea 17 — MCP Schema Lock (note: occupied)
- **User:** Agent builders on remote MCP servers  
- **Problem:** `tools/list` contract drifts; HTTP stays green  
- **Current workflow:** Runtime failure mid-tool-call  
- **Why painful:** Agents cache contracts; silent mis-calls  
- **Product:** Lockfile + MAJOR/MINOR/PATCH drift CI  
- **Core mechanism:** observe + compare  
- **Why technically interesting:** Semver for JSON Schema tool contracts  
- **Demo:** Required field added → MAJOR fail  
- **Potential continuation:** **Likely kill as Working Candidate** — `@wannavf/mcp-sentinel` and `mcp-schema-watch` already are this product  

### Idea 18 — Integration Call Diff (drift/ci class)
- **User:** Maintainers of Make/n8n-style integrations  
- **Problem:** Integration code calls paths removed from live OpenAPI  
- **Current workflow:** Customer tickets  
- **Why painful:** Spec vs what modules *actually* call  
- **Product:** Parse integration modules vs OpenAPI → breaking drift  
- **Core mechanism:** compare + constrain  
- **Why technically interesting:** Different artifact than oasdiff (calls vs spec)  
- **Demo:** `endpoint_removed` on Todoist node  
- **Potential continuation:** **Likely kill** — driftci.com already ships this  

### Idea 19 — Entitlement Soft-Limit Witness
- **User:** SaaS eng with metered features / grace periods  
- **Problem:** Billing webhooks lag; access races; soft vs hard limits confused  
- **Current workflow:** Couple Stripe state directly to `if`  
- **Why painful:** Wrong cuts / wrong unlocks  
- **Product:** Simulate entitlement state machine given billing event sequences  
- **Core mechanism:** simulate + verify  
- **Why technically interesting:** Time-travel billing→access  
- **Demo:** Failed payment + grace → still hasAccess true  
- **Potential continuation:** Complements Stigg; does not replace it  

### Idea 20 — EvalNoise Band
- **User:** AI eng with flaky LLM eval gates in CI  
- **Problem:** Exact-match / single-run accuracy flaps without code change  
- **Current workflow:** Retry CI; loosen thresholds by gut  
- **Why painful:** Lost trust in eval suite  
- **Product:** Measure noise floor → recommend tolerance bands / pass@k vs pass^k  
- **Core mechanism:** observe + predict + constrain  
- **Why technically interesting:** Statistical gate design, not more prompts  
- **Demo:** 10 unchanged runs → proposed `baseline - 0.02` band  
- **Potential continuation:** Eval reliability layer (adjacent Promptfoo — must stay narrow)  

---

## 10 Refined Concepts

### R1 — AliasTripwire (silent hosted-model swap detector)
- **User:** AI engineer responsible for a production LLM feature on floating aliases  
- **Workflow pain:** Tuned prompts/parsers against behavior that can move without a code change  
- **Behavior:** Schedule frozen canaries; alert on persistent output-hash flip; optionally track provider fingerprint / Models API resolve  
- **Wedge:** Not a full eval/red-team platform — only the identity tripwire  
- **Tech core:** Deterministic canary runner, hash store, confirm-before-page (anti-flake), optional alias→id resolve  
- **Demo:** 60–90s hash flip when underlying model changes  
- **Competition:** Promptfoo (can DIY canaries); Helicone/Langfuse (observability); OpenAI `system_fingerprint` (hint only)  
- **Why use instead:** Dedicated continuous tripwire UX + multi-provider; fingerprint alone is insufficient when aliases retrain without metadata change  

### R2 — PlanMirror (pricing claims ↔ code gates)
- **User:** Founder/eng lead before a pricing change  
- **Workflow pain:** No join between marketing feature list and runtime entitlement checks  
- **Behavior:** Build two graphs and diff; export mismatch checklist  
- **Wedge:** Verification of packaging claims, not entitlement management (Stigg/Lago)  
- **Tech core:** HTML/DOM feature extraction + AST/regex gate extraction + fuzzy join with human confirm  
- **Demo:** Public SaaS pricing page + sample codebase → red matrix  
- **Competition:** Entitlement platforms manage access; none found that primarily audit marketing↔code  
- **Why use instead:** Answers “will this pricing page lie?” before launch  

### R3 — FossilFixtures (fixture honesty gate)
- **User:** Backend eng with `__fixtures__` / recorded JSON  
- **Workflow pain:** Mocks and types agree; wire moved  
- **Behavior:** Shape-tree compare fixtures vs live/HAR; classify breaking; patch fixtures  
- **Wedge:** Fixture-folder audit without requiring OpenAPI/Pact adoption first  
- **Tech core:** JSON shape normalization, breaking/additive rules, CI exit codes  
- **Demo:** Live missing field vs fixture → fail + patch  
- **Competition:** Pact, StitchAPI `drift()`, DriftGuard, Schemathesis — adjacent  
- **Why use instead:** Starts from the fixtures you already have, not a new contract stack  

### R4 — PromptEnv Diff
- **User:** Teams with prompts outside LangSmith/PromptLayer  
- **Workflow pain:** Env pointer drift for weeks  
- **Behavior:** Hash + diff prompt blobs per env; history of pointer moves  
- **Wedge:** Release engineering for file/env prompts without platform migration  
- **Tech core:** Content-addressed versions + env pointers  
- **Demo:** staging≠prod hash with unified diff  
- **Competition:** LangSmith envs, PromptLayer labels, Bedrock Prompt Management  
- **Why use instead:** Works where prompts still live in git/env  

### R5 — LockCast (Postgres migration risk narrative)
- **User:** Non-Rails teams shipping SQL migrations  
- **Workflow pain:** Staging size lies; locking surprises  
- **Behavior:** Static risk map + optional `EXPLAIN`-informed narrative  
- **Wedge:** Human risk story + safer rewrite, not Rails-only gem  
- **Tech core:** SQL classify → Postgres lock semantics knowledge base  
- **Demo:** Dangerous migration → rewrite to expand/contract  
- **Competition:** `strong_migrations`, Laravel migration-guard, DBA review  
- **Why use instead:** Language-agnostic hosted preflight for SQL text  

### R6 — FlagDebt (vendor-agnostic stale flag → PR)
- **User:** Small teams not on LaunchDarkly Vega  
- **Workflow pain:** Cleanup deferred; debt compounds  
- **Behavior:** Live state + call-site graph → boolean cleanup PRs with confirmation  
- **Wedge:** Correctness from live rollout value (DoorDash lesson)  
- **Tech core:** Reconcile vendor export with AST call sites  
- **Demo:** 100% flag → remove `if` branches  
- **Competition:** LD Vega, ConfigCat cleanup action (archived), internal DoorDash system  
- **Why use instead:** Portable to Flagsmith/Unleash/ConfigCat/home-grown  

### R7 — DLQ Triage Desk
- **User:** On-call with noisy DLQs  
- **Workflow pain:** Purge-or-panic  
- **Behavior:** Auto-tag into replay protocols  
- **Wedge:** Taxonomy + action, not “DLQ dashboard”  
- **Tech core:** Rule + shape clustering (+ optional LLM for poison explanations)  
- **Demo:** Mixed bag → five buckets with replay buttons (safe ones only)  
- **Competition:** Cloud vendor consoles; custom scripts  
- **Why use instead:** Opinionated triage protocols per category  

### R8 — LabelName Check
- **User:** Frontend shipping UI with voice/AT users  
- **Workflow pain:** WCAG 2.5.3 failures invisible to sighted QA  
- **Behavior:** Focused mismatch list with copy-paste fixes  
- **Wedge:** One SC done deeply, not full a11y suite  
- **Tech core:** Accessible name computation vs visible label heuristic  
- **Demo:** Mismatch → fix aria/name  
- **Competition:** axe-core rules, WAVE, PTC Visual QA (broader)  
- **Why use instead:** Faster path to fix this class alone  

### R9 — BundleBlame
- **User:** Frontend owning performance budgets  
- **Workflow pain:** Size jump without clear owner  
- **Behavior:** Attribute delta to import edges  
- **Wedge:** Blame, not just treemap visualization  
- **Tech core:** Module graph diff  
- **Demo:** PR comment “+X kb from Y”  
- **Competition:** Bundle analyzers, Size Limit, bundlesize  
- **Why use instead:** Causal attribution across two builds  

### R10 — EvalNoise Band
- **User:** AI eng with flaky eval CI  
- **Workflow pain:** Gates flap; trust dies  
- **Behavior:** Estimate noise; propose bands / repeats / metric choice  
- **Wedge:** Reliability of the gate, not more eval cases  
- **Tech core:** Repeated runs → variance → recommended threshold  
- **Demo:** Before/after flake rate on same suite  
- **Competition:** Promptfoo docs/patterns; QASkills guides; DIY  
- **Why use instead:** Productizes the statistical ops layer people skip  

---

## 5 Finalists

Tradeoffs (narrative; no 1–10 scores):

### F1 — AliasTripwire
- **Pain × frequency:** Real for anyone on floating aliases; silent swaps documented (DeepSeek-class retrain-under-same-name; OpenAI exposes `system_fingerprint` precisely because backend config moves).  
- **Differentiation:** Narrow tripwire vs Promptfoo-as-platform vs Helicone-as-observability.  
- **Demoability:** Excellent — hash flip is visible and honest.  
- **Tech depth:** Real (anti-flake confirmation, multi-provider quirks, fingerprint vs canary precedence).  
- **Risk:** Adversarial reviewer says “Promptfoo cron.” Must stay ruthlessly narrow and ship hosted continuous monitoring UX.  
- **Continuation:** Strong for AI-native founder.

### F2 — PlanMirror
- **Pain × frequency:** Pricing changes are episodic but high blast radius.  
- **Differentiation:** Highest originality among finalists (no exact product found in this pass).  
- **Demoability:** Excellent visual matrix for judges.  
- **Tech depth:** Medium — extraction/join quality is the hard part; risk of looking like scrape+grep.  
- **Risk:** Marketing copy ambiguity → false positives; needs human-in-loop confirm.  
- **Continuation:** Good SaaS tooling path.

### F3 — FossilFixtures
- **Pain × frequency:** Chronic for API-consuming backends.  
- **Differentiation:** Meaningful vs Pact/OpenAPI-first tools; fixture-first wedge.  
- **Demoability:** Strong; must avoid “fixture theater” irony by using real live samples.  
- **Tech depth:** High on shape-diff semantics.  
- **Risk:** Crowded-adjacent (StitchAPI, DriftGuard); must not become Spec Triangle.  
- **Continuation:** Solid DevTools.

### F4 — LockCast
- **Pain × frequency:** Deploy-time fear is real; Postgres locking documented.  
- **Differentiation:** Cross-language narrative vs `strong_migrations`.  
- **Demoability:** Good paste-SQL demo.  
- **Tech depth:** Medium — knowledge encoding; wrong advice is dangerous.  
- **Risk:** Liability of bad safety advice; Rails users already solved.  
- **Continuation:** Niche but durable.

### F5 — FlagDebt (vendor-agnostic)
- **Pain × frequency:** Proven at DoorDash scale; small teams feel it too.  
- **Differentiation:** Live-state-required cleanup vs source-only dead-code tools; vs LD Vega lock-in.  
- **Demoability:** Good if boolean-only MVP.  
- **Tech depth:** High (AST + live reconcile).  
- **Risk:** Merge Preflight adjacency (agent PRs); vendor API auth friction for demo; partial rollouts need human confirm (DoorDash).  
- **Continuation:** Strong if multi-vendor.

**Cut from finalists (still useful raw):** MCP lockfile and drift/ci-class integration scan — exact products already exist (`mcp-sentinel`, driftci). Agent cost breaker — circuitbreaker.dev. TrainLeak — splitcheck/LeakLens occupy. EnvSemantic Diff — thin as sole product.

---

## 3 Strongest Product Concepts

### Product 1 — AliasTripwire

- **One sentence:** A continuous tripwire that detects when a hosted LLM alias silently changes behavior — before your users do.  
- **User:** AI / full-stack engineer owning a production LLM feature on provider aliases.  
- **Pain:** Providers can retrain or reconfigure behind a stable model name; your parsers, tool-call shapes, and refusal boundaries were tuned to yesterday’s behavior.  
- **Existing workflow:** Pin dated snapshots when available; eyeball outputs; maybe log `system_fingerprint`; run Promptfoo occasionally; discover breaks via customer reports.  
- **Product workflow:** Register endpoint + model alias → upload/freeze 15–40 canary prompts (temp 0 / seed where supported) → schedule runs → on persistent hash flip (reconfirm N times) → alert with before/after + optional Models API resolve / fingerprint delta → freeze-to-pin playbook checklist.  
- **Core mechanism:** observe (canary execution) + compare (content hashes / distributions) + detect (persistent flip) — not summarization.  
- **Differentiation:** Not Canary Session (that was replaying *your* long agent session after *your* config change). Not Promptfoo (eval/red-team platform). Not Helicone (request observability). AliasTripwire’s job is solely: **prove the model behind the door moved.**  
- **Demo (60–120s):** Open app → canaries green on alias A → switch backend to alias B (or known-different model) → tripwire red with hash diff → “what to do next” freeze/pin steps. URL on screen.  
- **Technical depth:** Anti-flake confirmation; provider quirks (no seed / no fingerprint); alias resolution via Anthropic Models API-style retrieve; separating fingerprint hint from canary ground truth.  
- **Production path:** Hosted scheduler + encrypted user keys + Slack/webhook alerts; later: org baselines, multi-model matrix, auto-pin suggestions. Follow ENGINEERING-STANDARDS when building.  
- **Risks:** Looks like “Promptfoo subset”; nondeterminism false positives; users won’t upload prompts; key handling.  
- **Kill condition:** If validation finds a hosted product whose primary workflow is continuous alias canary hashing with confirm-before-alert (same mechanism), or if canaries cannot be made stable enough for honest demos across major providers.

### Product 2 — PlanMirror

- **One sentence:** Diff your pricing page’s feature claims against the entitlement checks actually in your code before you ship a packaging change.  
- **User:** Solo founder / eng lead at a small SaaS about to change plans.  
- **Pain:** Billing, pricing, and entitlements get conflated; `if (plan === "pro")` sprawl; accidental unlocks/locks.  
- **Existing workflow:** Spreadsheet; manual QA on three plan accounts; hope support notices.  
- **Product workflow:** Ingest pricing page → structured claim list → ingest repo/gate patterns → join matrix → human confirms ambiguous rows → export ship checklist.  
- **Core mechanism:** reconcile two authoritative-looking but divergent representations.  
- **Differentiation:** Stigg/Lago *implement* entitlements; PlanMirror *audits packaging truth*. Not Cycle 04 enterprise MDM/search.  
- **Demo (60–120s):** Paste pricing URL + sample gates → red “claimed on Pro / unguarded in code” and “gated in code / missing on page.”  
- **Technical depth:** Robust extraction; fuzzy entity join; confidence scores; no hallucinated features (deterministic extract first; LLM only for join suggestions).  
- **Production path:** GitHub app comment on pricing MD / marketing PRs; Stripe Product catalog sync later.  
- **Risks:** Copy ambiguity; false positives; scrape fragility.  
- **Kill condition:** Exact marketing↔code entitlement matrix product with same workflow exists and is widely used; or extraction quality too low for trusted demos.

### Product 3 — FossilFixtures

- **One sentence:** Prove your test fixtures still match live API shapes — and patch the fossils before CI lies to you.  
- **User:** Backend engineer maintaining JSON fixtures for third-party or internal HTTP APIs.  
- **Pain:** Types and mocks are mutually consistent fossils; production is the first real validator.  
- **Existing workflow:** Incident → manually refresh fixtures; optional Pact/OpenAPI migration (heavy).  
- **Product workflow:** Point at fixtures dir + live sample/HAR/URL → shape-tree diff → breaking/additive → download patched fixtures / CI fail.  
- **Core mechanism:** observe live shape + compare to fixture trees + generate patches.  
- **Differentiation:** Not Spec Triangle (OpenAPI ↔ live ↔ SDK). Not drift/ci (integration module ↔ OpenAPI). Fixture-first honesty gate.  
- **Demo (60–120s):** Fixture expects `total`; live returns `total_amount` → breaking → patched fixture.  
- **Technical depth:** Shape normalization, array sampling, breaking taxonomy, stable reporting.  
- **Production path:** CLI + GitHub Action; optional scheduled live probes.  
- **Risks:** Crowded-adjacent contract tooling; auth to live APIs in demo; becomes “just ajv.”  
- **Kill condition:** Exact fixture-folder↔live shape audit product dominates with same mechanism; or cannot demo honestly without staging credentials theater.

---

## Working Product Candidate

# **AliasTripwire**

Continuous detection of silent hosted-LLM alias / backend swaps via frozen canary prompts, output hashing, and confirm-before-alert — so AI engineers learn the model moved before customers do.

---

## Why This Candidate

1. **Sharp failure mode with primary evidence:** Hosted aliases are moving targets; OpenAI documents `system_fingerprint` because backend configuration changes; practitioner write-ups describe retrain-under-same-name hazards and prescribe pin + canary + alarm layers.  
2. **Mechanically distinct from killed concepts:** Not citation checking, agent action receipts, agent-session replay after *your* config change, OpenAPI/SDK/live triangle, or merge preflight.  
3. **Wedge under the new kill rule:** Promptfoo/Helicone/Langfuse adjacency is fine — the product is a narrower workflow (identity tripwire), not a platform clone. No exact primary-workflow duplicate found this pass.  
4. **Demo honesty:** A hash flip is a real observable, not fixture theater or a fake dashboard.  
5. **Fits the builder:** Solo AI-strong founder; Oct 1–4 MVP is a hosted canary runner + alert, not a platform.  
6. **Continuation:** AI reliability ops is worth continuing after OFFGRID.  
7. **Why not PlanMirror / FossilFixtures as #1:** PlanMirror has higher originality but weaker technical-depth story and messier false positives for a competitive field. FossilFixtures is strong but sits closer to an occupied contract-testing neighborhood — better as backup if AliasTripwire fails validation.

---

## Competitive Landscape (honest; competitors ≠ auto-kill)

| Player | What they do | Relation to AliasTripwire |
|---|---|---|
| **Promptfoo** | Declarative evals, red team, CI | Can *implement* canaries; not a dedicated continuous alias-identity tripwire product |
| **Helicone / Langfuse** | LLM observability, tracing, prompt mgmt | Catch distribution shifts in traffic; not frozen canary ground truth |
| **OpenAI `system_fingerprint` / seed** | Hint that backend config changed | Explicitly incomplete alone; nondeterminism remains |
| **Anthropic Models API retrieve** | Resolve alias → model info | Identity metadata helper, not behavioral tripwire |
| **DIY cron + hash scripts** | Blog-prescribed three-layer fix | Workflow exists as advice; productizing UX + multi-provider + confirm-before-page is the wedge |
| **Eval platforms generally** | Quality regression suites | Overlap if we expand into “full evals” — **do not expand**; stay tripwire |

**Not auto-killed** because category “LLM monitoring/evals” is established — the wedge is the specific workflow+mechanism above.

---

## Risks

- **Subset perception:** Judges/reviewers may say “Promptfoo cron.” Mitigation: one job copy, canary-hash UX, pin playbook — refuse feature creep into red team/RAG eval.  
- **Nondeterminism:** False trips at temperature 0. Mitigation: reconfirm N runs; tolerance on selected metrics; document residual risk.  
- **Provider limits:** Some models reject temperature/seed. Mitigation: provider-specific runners; distribution alarms as secondary.  
- **Secret handling:** User API keys on a hosted demo. Mitigation: env-config, short-lived keys, clear disclosure (ENGINEERING-STANDARDS).  
- **Weak wow if only green:** Demo must include a deliberate model switch to show the trip.  

---

## Immediate Validation Questions

*(Next step = product validation for AliasTripwire — **not** another discovery cycle.)*

1. **Canary stability:** On OpenAI + Anthropic (and one floating alias without dated pins), how often do frozen canaries flip hash with *no* intentional model change across 20 scheduled runs? Is confirm-N enough for an honest “green” demo?  
2. **Exact-product search:** Does any shipped product market *continuous hosted-model alias canary hashing with alert* as its primary job (not as one Promptfoo recipe)? Name it or clear it.  
3. **Willingness to run:** Will 5 AI engineers who ship LLM features actually paste 15 canary prompts and leave a key for scheduled runs — or do they already consider Promptfoo CI sufficient? What would make them switch?  
4. **Fingerprint vs canary:** In practice, how often does `system_fingerprint` (or Models API id) change *without* canary hash change, and vice versa? Does the dual-signal UI clarify or confuse?  
5. **Kill check:** If validation shows canaries are too flaky for a hosted demo without fake determinism, do we fall back to **PlanMirror** or **FossilFixtures** rather than inventing a fourth discovery thesis?

---

## Sources

URLs inspected this pass (Exa and/or Jina Reader and/or `gh`):

- https://platform.claude.com/docs/en/api/models/retrieve — alias → model resolve  
- https://developers.openai.com/api/docs/guides/advanced-usage — `seed` / `system_fingerprint`  
- https://dreaming.press/posts/how-to-catch-a-silent-model-upgrade-hosted-endpoint-drift.html — pin + canary + alarm layers; silent retrain-under-same-name hazard  
- https://kindatechnical.com/testing-non-deterministic-systems/version-pinning-and-system-fingerprint-tracking.html — alias ≠ version  
- https://qaskills.sh/blog/llm-non-determinism-flaky-eval-guide-2026 — flaky eval / tolerance bands  
- https://merlonix.com/blog/mcp-tool-schema-drift-detection/ — MCP tools/list drift (occupied adjacent)  
- https://github.com/Wannavf/mcp-sentinel — MCP schema lockfile product (exact adjacent; not our candidate)  
- https://www.driftci.com/ — integration calls vs OpenAPI (exact adjacent; not our candidate)  
- https://careersatdoordash.com/blog/automating-feature-flag-cleanup-at-scale-with-a-multi-agent-llm-system/ — stale flag cost; live rollout state required  
- https://launchdarkly.com/docs/home/flags/manage/flag-cleanup-vega — LD Vega flag cleanup  
- https://priceos.ghost.io/billing-vs-pricing-vs-entitlements-why-saas-teams-keep-mixing-these-up-2/ — billing vs pricing vs entitlements  
- https://docs.stigg.io/api-and-sdks/integration/backend/entitlements — entitlement checks (management, not marketing audit)  
- https://stitchapi.dev/blog/schema-drift-is-a-production-bug — fixtures/types vs live wire  
- https://github.com/ankane/strong_migrations — migration safety (Rails)  
- https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html — WCAG 2.5.3  
- https://circuitbreaker.dev/ / https://github.com/MonetiseBG/circuit-breaker — agent cost breaker (occupied)  
- https://emailens.dev/ — email rendering linter (occupied adjacent)  
- https://pypi.org/project/splitcheck/ / https://pypi.org/project/leaklens/ — train/test leakage (occupied adjacent)  
- https://blog.flowrust.com/2026/06/16/environment-config-diff-visualizer-the-three-files-that-hide-the-outage/ — env config drift shape  
- https://oh-bug.com/posts/llm-prompt-release-governance-production/ — prompt env pointers (LangSmith/PromptLayer class)  
- https://dev.to/gabrielanhaia/dead-letter-queue-triage-the-5-categories-that-cover-95-of-failures-4p9g — DLQ taxonomy  
- https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html — IAM policy simulator (occupied for AWS IAM)  
- https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda-functions.html — secret rotation validate-before-cutover  

---

**Status line for governance:** Working Product Candidate **AliasTripwire** named for validation — **not** permanently selected; research pause posture lifted only for this discovery reset output; next step is validation, not architecture or `src/` work.
