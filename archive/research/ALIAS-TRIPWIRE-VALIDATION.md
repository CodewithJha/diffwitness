# AliasTripwire — Product Validation

**Date:** 22 September 2026  
**Candidate status entering validation:** Working Product Candidate (not permanently selected)  
**Method:** Primary docs + hosted product pages fetched via agent-reach (Exa / Jina Reader) + `gh` where used; no application code; no API-keyed live canary run (keys absent).  
**Labeling:** FACT = fetched primary source. INTERPRETATION = reasoned from facts. HYPOTHESIS = untested.

---

## Verdict (one line)

**KILL** — the failure mode is real, but a product whose *primary* workflow is sealed/frozen canaries against hosted providers with baseline → drift classification → evidence already ships; AliasTripwire as proposed is not an empty wedge.

---

## 1. Failure mode under test

### Exact failure

Floating hosted-model identifiers (aliases / undated names / “latest” pointers) keep a **valid API surface** while the **served model or serving behavior** changes. Callers tuned parsers, tool-call shapes, refusal boundaries, or cost assumptions against yesterday’s behavior without a deploy on their side.

### Who is affected

AI / full-stack engineers shipping production LLM features that call provider aliases (or app endpoints backed by those aliases), especially where dated pins are unused or unavailable.

### How it is detected today (workaround)

FACT (workarounds documented across providers and practitioner guides):

- Prefer dated / pinned model IDs when available.
- Log returned `model` / Models API resolve / `system_fingerprint` when exposed.
- Occasional Promptfoo / CI evals.
- Discover breaks via customer reports or production metric step-changes.

### How long undetected

INTERPRETATION: Undetected duration is “until a user-visible parser/refusal/cost break,” because the HTTP API remains successful. Frequency is tied to provider release cadence, not the caller’s deploy cadence. Exact mean-time-to-detect is Unknown without fleet telemetry (labeled Unknown).

### What breaks

Parsers and schema assumptions, tool-call argument style, refusal boundaries, latency/cost/cache economics, eval baselines — while status codes stay 200.

### Developer response when noticed

Pin if a prior snapshot remains available; re-run golden evals; accept or roll back deliberately; sometimes chase “our bug” first (cache/config) before realizing the alias moved.

---

## 2. Primary evidence — aliases / backends move while API stays valid

### FACT — DeepSeek (primary changelog)

Source: https://api-docs.deepseek.com/updates

- **2026-07-31:** Official V4-Flash API public beta; “API calling method remains unchanged — simply set the model name to `deepseek-v4-flash` to use the latest version.” Same entry states **DeepSeek-V4-Flash-0731** “keeps the same model architecture and size as DeepSeek-V4-Flash-Preview, and was only **re-post-trained**.”
- **2026-09-10:** V4.1 Flash release; previous names `deepseek-v4-flash` and `deepseek-v4-flash-vision-exp` are **temporarily routed** to V4.1 Flash for compatibility.
- **2026-08-13 / 2026-04-24:** “calling method remains unchanged” / legacy names pointing at Flash modes — same pattern of stable request shape, moving target behind the name.

**INTERPRETATION:** Provider-documented same-name / compatibility-route updates are not hypothetical; they are changelog events.

### FACT — OpenAI (`seed` / `system_fingerprint`)

Source: https://developers.openai.com/api/docs/guides/advanced-usage

- Completions are non-deterministic by default.
- `seed` + stable params give **mostly** deterministic outputs.
- `system_fingerprint` exists because OpenAI may change **backend configuration**; if fingerprint differs, outputs may differ.
- Companion cookbook (https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter): even with matching seed + fingerprint, a small chance of divergence remains (“inherent non-determinism”).

**INTERPRETATION:** OpenAI itself treats backend movement as a first-class monitoring concern; fingerprint is a hint, not a full behavioral contract.

### FACT — Anthropic (aliases vs pinned IDs; infra can still move)

Source: https://docs.anthropic.com/docs/en/about-claude/models/model-ids-and-versions

- Pre-4.6: shorter aliases (e.g. `claude-sonnet-4-5`) point to the **most recent dated snapshot**.
- 4.6+: dateless IDs are **pinned snapshots** (not evergreen pointers); weights/config for an ID are not silently updated under that ID.
- Still: “serving infrastructure around the model can change over time” (router, safety classifiers, sampling); “occasionally… minor differences in observable behavior even when the model ID and weights have not changed.”
- Models retrieve API documents alias → model resolve: https://platform.claude.com/docs/en/api/models/retrieve

**INTERPRETATION:** Alias risk is explicit for older convenience aliases; even pinned IDs are not a guarantee of bit-identical serving behavior.

### FACT — Practitioner / secondary (not used as sole proof)

- https://dreaming.press/posts/how-to-catch-a-silent-model-upgrade-hosted-endpoint-drift.html — pin + canary hash + distribution alarms (cites DeepSeek-class failure; methodology aligns with primary DeepSeek changelog).
- Community demand for alias→snapshot history: https://community.openai.com/t/where-can-i-check-the-model-alias-updates/1357643

### Consequence of the failure (economic)

**Unknown** as a universal dollar figure (no invented $). Observable costs are: silent product quality regression, emergency pin/re-eval work, and mis-attributed debugging time. Cost of *missing* a change is “users notice first,” which is the product’s claimed urgency — not quantified in this pass.

---

## 3. Canary stability (critical)

### No live API experiment this pass

**FACT:** No `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / Gemini keys present in process env or repo `.env` (only `.env.example`). Live multi-run hashing was **not** executed. A throwaway `/tmp` experiment was designed (below) for when keys exist.

### What provider docs imply for exact-hash tripwires

| Signal | Provider stance (FACT) | Implication for AliasTripwire |
|---|---|---|
| Exact output hash @ temp 0 | OpenAI: determinism **not guaranteed** even with seed + matching fingerprint | Exact-hash alone → **false positives** expected |
| `system_fingerprint` | Hint of backend config change; incomplete alone | Dual-signal useful; not sufficient alone |
| Anthropic seed | Not a published Messages seed contract in this research pass | Cannot assume OpenAI-style seed controls |
| Confirm-N / repeat agreement | Practitioner + Provider Sentinel methodology | Required to separate noise from drift |

### FACT — Independent product already observed OpenAI reproducibility instability

Provider Sentinel case window (`CCS-2026-05-08` → `CCS-2026-05-14`) reports **“Reproducibility instability observed for OpenAI on the closing day”** under sealed context: https://vertrule.com/provider-sentinel/ and https://vertrule.com/provider-sentinel/latest/

**INTERPRETATION:** A honest demo that pages on a single exact-hash flip would be fragile on OpenAI; GREEN/YELLOW/RED with confirm-N and multi-surface comparators is the viable design — and that design is already productized (see §4).

### Canary stability verdict

**needs modify (for naive exact-hash) / unreliable as sole signal** — viable only with confirm-N, constrained/structured canaries, and multi-surface baselines (exact + normalized + schema/class + optional fingerprint). That viability does **not** create an empty product wedge.

### Experiment design (run when keys exist; labeled SIMULATION allowed for controlled change)

Location: `/tmp/alias-tripwire-canary/` (throwaway; stdlib + HTTPS).

1. **Providers:** one floating alias + one pinned ID (OpenAI and/or Anthropic).
2. **Canaries (3–5):** (a) strict JSON schema object, (b) fixed arithmetic with `answer:` prefix, (c) short refusal-boundary probe, (d) optional tool-call schema probe, (e) echo-canonical string.
3. **Controls:** `temperature=0`, `seed` where supported, fixed `max_tokens`, fixed system prompt, no tools unless schema’d.
4. **Repeats:** each canary × 3 same-day; schedule 10–20 sessions over days if keys allow.
5. **Fingerprints:**
   - exact: SHA-256 of UTF-8 body
   - normalized: whitespace/JSON key-sort canonicalize then hash
   - semantic/class: schema pass/fail, numeric equality, refusal class enum
   - metadata: returned `model`, `system_fingerprint` if any
6. **Classification:**
   - **GREEN:** within-session repeats agree; match baseline
   - **YELLOW:** within-session disagreement (stochastic) OR fingerprint-only change without class flip
   - **RED:** within-session agreement **and** disagreement with baseline on class/normalized hash across confirm-N sessions
7. **Controlled change (SIMULATION — must label):** retarget floating alias to a known-different model ID to demonstrate RED without inventing a real provider incident.

**Result this pass:** design only; no measured false-positive rate.

---

## 4. Competitors and the critical question

### Critical question

> Does a product EXIST whose **PRIMARY** workflow is: Create frozen production canaries → continuously run against floating hosted-model aliases → behavioral baseline → detect meaningful provider-side behavioral change → distinguish stochastic variance → confirmation → alert when confident → preserve evidence?

### Answer

**YES — Provider Sentinel (VertRule).**  
Primary URL: https://vertrule.com/provider-sentinel/

**FACT (from fetched homepage):** Primary positioning is “Detect AI provider behaviour drift under sealed context.” Workflow: create baseline → seal probe suite + adapter config + comparator + capture policy → rerun later → evidence pack. Separates **alias-contract drift** vs **behaviour drift** vs **context mismatch**. Exact canaries + schema + refusal class surfaces. Proof boundary: observable drift ≠ proof of hidden weight mutation. Case study shows sealed multi-provider monitoring and OpenAI reproducibility instability.

This matches AliasTripwire’s intended primary job more closely than “Promptfoo can DIY a cron.”

### Adjacent — not auto-kill alone, but close the residual wedge

| Product | Primary job | Relation |
|---|---|---|
| **PromptCanary** https://www.promptcanary.dev/ | Hosted synthetic monitoring of **your AI HTTP endpoint**; scheduled checks; pass/fail diffs; alerts; CI gates | Same continuous-canary loop for *app* endpoints; assertion-based (JSON/schema/keywords), not provider-alias identity as sole wedge |
| **AICanary (Luxkern)** https://app.luxkern.com/aicanary | Continuous testing for AI behavior / drift / silent updates | Same category slogan; suite of Luxkern tools |
| **Codeform Model Integrity** https://codeform.io/docs/features/model-integrity/ | Feature inside a **coding harness** (primary product = harness) | Pinning lint + nightly drift canary with hashes/fingerprint — **primitive inside another product**, not standalone tripwire SaaS |
| **Promptfoo model drift** https://www.promptfoo.dev/docs/red-team/model-drift/ | Eval/red-team platform recipe (scheduled ASR / custom asserts) | Adjacent primitive; primary product ≠ alias tripwire |
| **Helicone / Langfuse / Braintrust / Portkey / Arize / Galileo / OpenLLMetry / LiteLLM** | Observability, tracing, gateway, evals, routing | Traffic/distribution or eval platforms — not sealed provider-alias canary as primary workflow |
| **egnaro9/model-drift** https://github.com/egnaro9/model-drift | Public daily frozen suite across labs | Public tracker / OSS board, not your production tripwire UX |
| **Temsor `model_drift`** (via Glama connector description) | Independent daily alias/probe ledger for some providers | Independent measurement API snippet; not validated as full hosted OFFGRID competitor UX this pass |
| **DriftWatch** https://driftwatchproxy.com/ | Proxy + token prune + schema firewall marketing drift | Proxy/firewall primary; drift claims secondary |

**Honest gap statement:** Discovery hoped “narrow identity tripwire SaaS” was empty after clearing Promptfoo/Helicone. Validation finds **Provider Sentinel already owns the sealed provider-canary + evidence primary workflow**, with PromptCanary owning hosted continuous AI-endpoint canaries. Remaining “gap” is branding/UX polish or DIY packaging — **not** an OFFGRID-empty job.

---

## 5. Wedge validation

### Proposed wedge (from discovery)

“Independent external canary monitoring for provider-side behavioral changes in floating production model aliases.”

### What AliasTripwire is NOT (still true as negative space)

- Not Canary Session (replay of *your* agent session after *your* config change).
- Not a full eval/red-team platform (Promptfoo).
- Not request observability (Helicone/Langfuse).
- Not CiteCheck / Action Receipt / Spec Triangle / Merge Preflight.

### Wedge result

**INVALID as an empty product wedge.** Provider Sentinel’s primary workflow is that independent/sealed provider behavioural monitoring. PromptCanary covers the closely related hosted continuous canary job for production AI endpoints.

**Revised wedge (only if forced to rename):** none recommended — do not MODIFY into a thinner PromptCanary/Provider Sentinel clone.

---

## 6. Value / demo honesty

### Who would use / why leave running

Engineers on floating aliases who want continuous external signal. Willingness exists as a category (PromptCanary free tier, Provider Sentinel public case study). That demand does **not** justify a third clone for OFFGRID.

### Frequency / pay / trust / uninstall

Frequency follows provider release/retrain/routing events (FACT: DeepSeek changelog cadence shows multiple alias/route events in 2026). Pay willingness Unknown for a *new* entrant given existing products. Trust dies if exact-hash false-pages (documented nondeterminism). Uninstall risk high if alerts are noisy.

### Honest 60–90s demo (if it were still a candidate)

Show GREEN baseline → **labeled simulation** switch to different model ID → RED with before/after + confirm-N → pin checklist. **Do not** present a fabricated live provider incident as real.

Demo path does **not** rescue differentiation against Provider Sentinel / PromptCanary.

---

## 7. Technical feasibility (note only — no architecture)

Solo Oct MVP of “scheduler + canaries + hashes + Slack” is feasible under `docs/ENGINEERING-STANDARDS.md` *after selection* — but selection is blocked. Feasibility of a clone is irrelevant under anti-forcing and the discovery kill condition.

---

## 8. Reopen-gate style kill criteria hit

From `research/PRODUCT-DISCOVERY-RESET.md` Product 1 kill condition:

> If validation finds a hosted product whose primary workflow is continuous alias canary hashing with confirm-before-alert (same mechanism)…

**HIT** by Provider Sentinel (and substantially by PromptCanary for the continuous hosted canary loop).

User instruction: do **not** kill merely because Promptfoo/LangSmith have adjacent primitives — kill only per C criteria / exact primary workflow. This kill is on **primary-workflow occupation**, not adjacency.

---

## 9. Open questions (closed by kill)

1. Live false-positive rate on OpenAI/Anthropic with confirm-N — **unmeasured** (no keys); docs + Provider Sentinel case imply exact-hash alone is insufficient.
2. Willingness interviews (5 engineers) — **not run**; competitive existence dominates.
3. Fingerprint vs canary precedence — moot for product selection.

---

## 10. Fallback (governance)

Per discovery reset: if AliasTripwire fails validation, fall back consideration to **PlanMirror** or **FossilFixtures** — **not** another AliasTripwire rename, and **not** resurrecting CiteCheck / Action Receipt / Canary Session / Spec Triangle / Merge Preflight / Cycle 03–04 theses.

---

## DECISION: KILL

**Evidence:** Provider Sentinel’s primary product workflow matches the proposed AliasTripwire job (sealed/frozen canaries → continuous provider monitoring → stochastic vs drift separation → evidence packs), with additional hosted continuous AI canary products (PromptCanary, AICanary) occupying the neighboring continuous-canary market. Problem reality (DeepSeek changelog; OpenAI fingerprint; Anthropic alias/infra notes) does not create an empty wedge. Exact-hash-only tripwire is unreliable per OpenAI docs and independent sealed-context observations.

**Do not** write PRD, architecture, or `src/` for AliasTripwire. **Do not** rename and continue.
