# Problem landscape — HACK47: OFFGRID

**Date:** 21 September 2026  
**Role:** Adversarial product research (no product code)  
**Scope:** Painful professional workflows that might justify a production-quality product submitted as a hackathon demo on 14 Oct 2026.  
**Method:** Agent-reach (Jina Reader, `gh`, HN Algolia, V2EX public API, Exa via mcporter where it returned pages) plus Cursor WebSearch as discovery only. Quotes and stats below are from pages actually fetched. Search snippets are not treated as evidence.

## How to read this file

- **KEEP** = pain is evidenced; not yet a product recommendation.
- **CROWDED** = pain is real and already a funded category.
- **REJECTED** = weak problem, already solved at demo quality, or structurally a bad OFFGRID bet.
- Vendor surveys are labeled as such. Commissioned research is not independent.
- If a number is missing: **Unknown**.

## The default scaffold path is generic productivity — kill it

Placeholder product **Afterhours** (README / `docs/WIN-PLAN.md`): paste a messy week of GitHub / Linear / email notes → get a shippable brief (decision, blockers, one thing to ship tomorrow). Fixture in `src/fixtures/messy-week.txt` is five lines of standup notes.

**Why this dies under adversarial review**

1. **The job is “summarize my week.”** That is already the default ChatGPT / Claude / Notion AI / Slack AI / Linear AI path. A judge can paste the same fixture into any frontier chat and get a comparable brief in 20 seconds. There is no verification, no integration depth, and no reason to return tomorrow.
2. **No evidence of a specific buyer who still lacks this.** We did not find a 2026 primary source describing “shippable brief from messy notes” as an unsolved, high-severity workflow. Adjacent meeting-notes products (Otter, Fireflies, Granola, Zoom AI Companion, Teams Copilot) are so crowded that **orgs now publish how to *block* notetaker bots** (Zoom Community thread; Microsoft Teams `ExternalBotAccessMode=RequireApprovalWhenDetected`). That is the opposite of unmet demand.
3. **Judging criteria punish it.** Originality and product thinking score near zero. Execution can look polished and still lose because the category is tutorial-adjacent.
4. **AI is doing all the work.** Remove the LLM and the product is a markdown template. That fails the product-without-AI test in the wrong direction: the remaining artifact is not valuable.

**Verdict: REJECTED as the OFFGRID wow-path.** Keep the repo name if you want; do not keep this job.

## What actually hurts (clusters)

### Cluster A — Verification of machine output (strongest evidence of *new* pain)

Professionals now ship text, code, citations, invoices, and “judgments” produced by models. Failures are often **silent**: no HTTP 500, no red CI, no exception.

Evidence:

- **Mata v. Avianca, Inc.** (S.D.N.Y. 22 June 2023, Judge P. Kevin Castel): counsel submitted **non-existent judicial opinions with fake quotes and citations created by ChatGPT**, then stood by them after the court questioned them. Rule 11 sanctions, $5,000 jointly and severally. Primary: [Justia opinion](https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1:2022cv01461/575368/54/), [CourtListener PACER PDF](https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf). This is not “AI is sometimes wrong.” It is a professional gatekeeping failure with court-documented harm.
- **Hamel Husain, “Your AI Product Needs Evals”** (29 March 2024): “unsuccessful products almost always share a common root cause: a failure to create robust evaluation systems.” Vendors “claim to eliminate the need for a human to look at” traces; he argues periodic human evaluation of traces is required. [hamel.dev/blog/posts/evals](https://hamel.dev/blog/posts/evals/). FAQ: teams he has seen spend **60–80% of development time on error analysis** (looking at failures), not building automated checks; typical review cycle **100+ traces**, **2–4 weeks**. [hamel.dev/blog/posts/evals-faq](https://hamel.dev/blog/posts/evals-faq/).
- **LLM-as-judge is biased.** Zheng et al., *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena* (NeurIPS 2023, [arXiv:2306.05685](https://arxiv.org/abs/2306.05685)): position bias can flip the winner when answers are swapped; “Only GPT-4 outputs consistent results in more than 60% of cases” on a hard similar-answer test; verbosity and self-enhancement biases documented. Later work ([arXiv:2410.21819](https://arxiv.org/abs/2410.21819)) reports GPT-4 self-preference. This undercuts any product that *is* an uncalibrated LLM judge.
- **Agent actions can succeed technically and still be disasters.** Exa retrieved a 2026 engineering essay on a vibe-coded production DB wipe: “the agent never errored”; “Deleting a database is a perfectly valid operation”; the agent’s self-report of recoverability was wrong. **INFERENCE:** the pattern matches missing approval gates, missing sandbox/prod split, and missing independent logs — not “need a smarter model.” HumanLayer’s Launch HN (YC F24) is adjacent (human-in-the-loop API); crowding exists.
- **Empirical study of 33k agent-authored PRs** ([arXiv:2601.15195](https://arxiv.org/pdf/2601.15195)): documentation/CI PRs merge more often; bug-fix/performance PRs worst; unmerged PRs are larger, touch more files, often fail CI; qualitative taxonomy includes lack of reviewer engagement, duplicates, unwanted features, agent misalignment.

**Cluster risk:** Langfuse (**34,889** GitHub stars as of 21 Sep 2026), Promptfoo (**25,332**), Helicone (**6,168**), plus closed LangSmith / Braintrust. Building “another eval dashboard” is death. The remaining wedge, if any, is **error-analysis UX, citation/provenance checks, judge calibration, or independent action receipts** — not traces-as-a-service.

### Cluster B — Silent data / money / contract mismatches (old pain, expensive incumbents)

- **Monte Carlo** (vendor) 2023 Wakefield survey of **200** data professionals, commissioned: data downtime nearly doubled YoY; **74%** said business stakeholders identify issues first “all or most of the time”; average resolution **15 hours**. [Business Wire 2 May 2023](https://www.businesswire.com/news/home/20230502005377/en/Data-Downtime-Nearly-Doubled-Year-Over-Year-Monte-Carlo-Survey-Says). Treat as vendor-commissioned. Their later first-party story: a cartesian-join bug overstated revenue **$16,191/day for 379 days** until a SQL monitor fired. [Monte Carlo blog](https://montecarlo.ai/blog-how-tsa-caught-16k-a-day-bug).
- **Stripe payout vs bank vs books:** Stripe documents payout reconciliation and bank reconciliation as first-class problems ([docs.stripe.com/payouts/reconciliation](https://docs.stripe.com/payouts/reconciliation), [docs.stripe.com/bank-reconciliation](https://docs.stripe.com/bank-reconciliation)). Puzzle (startup GL) publishes clearing-account mechanics for timing gaps ([help.puzzle.io Stripe FAQ](https://help.puzzle.io/en/articles/9426187-faq-stripe)). Pain is real. Buyers already pay accountants and Stripe-native reports. Demo needs sensitive financial data.
- **AP 3-way match:** Stampli (vendor) describes exception queues for quantity/price/receipt mismatches and claims Billy “reached the same conclusions as human operators 97% of the time” — **vendor claim, not independently audited**. Line-level extraction trails headers. Category is Bill.com, Ramp, Tipalti, Airbase, Brex. **Bad 3-week solo wedge.**
- **OpenAPI / SDK / live drift:** Fern (Aug 2026) frames documentation drift as a pipeline problem: spec, docs, SDKs rot at different rates ([buildwithfern.com](https://buildwithfern.com/post/stopping-schema-drift-coupling-sdks-documentation-claude)). `oasdiff/oasdiff` has **1,373** stars (21 Sep 2026). Speakeasy, Stainless, Pact, Spectral, Postman exist. Pain real, **CROWDED**.

### Cluster C — Maintainers, flags, tests, a11y (real, incumbent-owned)

- **OSS maintainers:** Tidelift *2024 State of the Open Source Maintainer* (PDF fetched): **60%** unpaid hobbyists (same as 2023); **48%** feel underappreciated / work is thankless; **60%** have quit or considered quitting (22% quit, 38% considered). Time is spent on maintenance/security, not features. GitHub Blog 28 Aug 2025 (GitHub-authored maintainer survey snippet on that page): **60% want help with issue triage, 30% duplicate detection, 10% spam, 5% slop detection**; they want AI as a second pair of eyes **that does not intervene unless asked**. Duplicate-bug research is a 20-year academic field (e.g. *Appl. Sci.* 2023 survey; arXiv:2504.14797). Dosu and GitHub Models already productize this. **CROWDED + maintainer distrust of unsolicited bots.**
- **Feature flags:** LaunchDarkly documents stale-flag debt, 90–120 day archive heuristic, and **Vega** automated cleanup PRs. They are selling the solution to the problem they created. **REJECTED as a startup wedge.**
- **Flaky tests:** Google ICSME 2020 study across 428 projects; Datadog Test Optimization and Buildkite Test Engine productize detect/quarantine/retry. **CROWDED.**
- **Accessibility overlays as a product class failed.** Overlay Fact Sheet ([overlayfactsheet.com/en/](https://overlayfactsheet.com/en/)): “No overlay product on the market can cause a website to become fully compliant with any existing accessibility standard.” WebAIM practitioner survey quoted there: **67%** rate overlays not at all / not very effective (**72%** among respondents with disabilities). This research pass counted **1,031** numbered signatories on the fetched page. **FTC** final order 22 Apr 2025: accessiBe pay **$1 million**; barred from claiming automated products make any website WCAG-compliant without evidence ([ftc.gov press release](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million)). **EAA** (Directive (EU) 2019/882) applies to covered products/services **after 28 June 2025** ([EUR-Lex](https://eur-lex.europa.eu/eli/dir/2019/0882); Commission news 27 June 2025). Remaining job is **source remediation + honest CI**, not a widget. Deque `axe-core` has **7,538** stars. **Do not build an overlay. Do not claim compliance.** A narrow “axe findings → component-level PR with repro, never a compliance certificate” might still be interesting and is **not** uniquely empty.

### Cluster D — Dead ends confirmed by failures

| Failure | What it appeared to be | Why it still failed | Lesson |
|---|---|---|---|
| **Adept** (28 Jun 2024 official post) | General enterprise computer-use agent | Founders + team to Amazon AGI; Amazon licensed agent tech/models/datasets; remaining company “focus entirely on solutions that enable agentic AI” | Generic agents lose to capital + platform distribution. [adept.ai/blog/adept-update](https://www.adept.ai/blog/adept-update/) |
| **Inflection / Pi** | Consumer companion AI | Microsoft hired almost all the team (CMA: 19 Mar 2024 announcement); Reuters source ~$650M licensing (not in CMA public $ figure). Inflection pivoted to API/studio. UK CMA treated it as a merger situation, no SLC. | Consumer chatbot is not a wedge. Talent deals are the exit. |
| **Humane Ai Pin** | Hardware “AI as product” | Official customer notice: sales stopped immediately; devices lose calling/messaging/AI/cloud **12:00 PST 28 Feb 2025**; data deleted. HP: $116M for Cosmos + talent + IP (HP press 18 Feb 2025). | Hardware + cloud-dependent demo is a trap. Do not build a device. |
| **Builder.ai** | “Build an app as easy as ordering pizza” | Bloomberg/FT 2025: insolvency after cash seizure; reported revenue overstatement (~$220M forecast vs ~$50M actual per Bloomberg sources); FT: AWS owed ~$88M, Microsoft ~$30M. **Allegations of round-tripping — not adjudicated in pages we fetched.** | AI wrapping of services + fake traction. Judges will smell “AI builds your app.” |
| **accessiBe overlay** | One-line WCAG compliance | FTC $1M + marketing prohibition | Do not sell “AI compliance.” |
| **AI meeting bots** | Auto notes | Enterprises blocking them; consent/recording law; calendar auto-join spam | Privacy backlash is the market now. |
| **Mutable.ai** | AI docs + autocomplete | PitchBook: acquired/merged 11 Dec 2024 by Google. Secondary wiki claims site went dark — **treat wiki as low reliability**; PitchBook status is the evidenced fact. | Coding-assistant crowding; acquihire. |
| **Sweep AI (JetBrains copilot)** | YC coding agent | Secondary aggregator Artificialus claims discontinued Apr 2026 “without prior notice” citing insufficient market. **Not confirmed on an official Sweep domain in this pass. Status: Unverified / do not treat as fact until primary is fetched.** | If true: niche IDE copilots die. If false: ignore. |

**Pattern:** generic agents, hardware, “AI will do the whole job,” compliance theater, and anything an incumbent can bundle (GitHub Copilot, Microsoft 365, Stripe reports, LaunchDarkly Vega) are graveyards.

## Domains we scanned vs forced

We did **not** invent a taxonomy and then fill it. The clusters above are where primary pages actually showed repeated pain. We also looked at (and mostly rejected): creator tools, education AI-detection, generic CRM, generic dashboards, sponsorship CRMs (no strong public pain corpus in this pass), GPU scheduling (incumbent cloud), legal research copilots (Harvey-class; we keep only **citation verification**, not “AI lawyer”).

## Implications for OFFGRID (not a winner pick)

A product that can survive judges + three weeks + post-hackathon continuation is more likely to be:

1. **A verifier or gate**, not a generator.
2. **Deterministic core** (diff, HTTP probe, DOI/court lookup, axe, schema compare, payout ID match) with LLM as optional explanation.
3. **One job** a specific professional already does weekly, with a 20-second “before was lying / after is checked” demo.
4. **Not** a platform, not a copilot, not a dashboard of scores.

Even those remaining ideas are **not proven winners**. See `05-problem-opportunities.md` and `10-final-recommendation.md`.

## Parallel-sweep addenda (not re-scored into the 32)

Workstreams writing `research/_raw-*.md` added corroborated items we did **not** promote to the shortlist:

- **Training–serving skew:** Google *Rules of ML* (fetched in raw-problems) — real, BigTech, Feast/Tecton incumbents; bad 20s browser demo unless scoped to prompt/tool schema eval≠prod.
- **Alert fatigue / silent incidents:** NeuBird 2026 vendor survey (n=1,039) — 44% outage tied to ignored alerts; **not independent**. Crowded AIOps.
- **Paper reproduction / leakage:** academic pain; not a weekly professional job for this field.
- **Humanloop killed** after Anthropic hire — eval dashboards are acquihire-fragile.
- **AgentGPT / gpt-engineer archived** — generic agent graveyard with huge star counts.
- **Bench shutdown** — bookkeeping is painful *and* operationally lethal.

- Dependabot noise: Filippo Valsorda, *Turn Dependabot Off* (20 Feb 2026) — thousands of PRs, false positive on Wycheproof, “noise machine.” Strengthens problem #17 **evidence**; does not unsink Breaking Bump as a product (Renovate/Socket still exist).
- Uber Piranha: ~2,000 stale flags removed — strengthens #11 **pain**; does not unsink Flag Reaper (LD Vega + Piranha OSS).
- Lost Pixel sunsetting / joining Figma + Chromatic **$179/mo**: narrow cheap visual-review gap. **Still not a shortlist item** (Figma Magician pattern; Chromatic owns paid review).
- Vanta “78% deals delayed”: **unverified** in fetched Vanta PDF (Problem evidence sweep (internal research session)).

These reinforce kills; they do not add a sixth survivor.

## Source conflicts (notable)

- **Monte Carlo $16k/day** is first-party marketing of their own monitor catching their own bug. It proves silent join bugs exist; it does not prove a new startup can sell against Monte Carlo.
- **Tidelift 60% unpaid** vs **47%** “I don’t get paid” on a multi-select income question in the same report — they explain the 13-point gap as identity vs nominal payments. Do not quote both as if independent surveys.
- **GitHub maintainer “60% want triage”** is on a GitHub product blog promoting GitHub Models. Directionally consistent with Tidelift load, but it is not independent.
- **Stampli 97% / 87%** are vendor metrics with vendor-defined denominators.
- **Sweep AI shutdown (Apr 2026)** is unverified primary; a different company named Sweep (Israeli GTM agents) was reported acquired by ServiceNow in 2026. Name collision.
- **Hamel evals HN story** (item 39877609) shows **1 point** in Algolia — the *blog* is influential in AI-eng circles; HN score is not evidence of mainstream demand.
- **Great Expectations** GitHub canonical appears to be `fivetran/great_expectations` (**11,819** stars) as of this fetch — Fivetran ownership is a crowding/consolidation signal, not a greenfield.
