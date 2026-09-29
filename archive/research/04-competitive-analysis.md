# Competitive analysis — HACK47: OFFGRID

**Date:** 21 September 2026  
**Unknown = not found in this pass. Do not treat Unknown as zero.**

## How to use this

This file is category-level. Named-competitor destruction tables for shortlist ideas live in `08-competitive-destruction.md`. Star counts are `gh` as of **21 Sep 2026**.

## Category map

### 1. LLM evals / observability — **saturated**

| Project | URL | OSS? | Traction evidenced | AI usage | Gap / complaint |
|---|---|---|---|---|---|
| Langfuse | https://github.com/langfuse/langfuse | Yes | **34,889** stars; **acquired by ClickHouse** ([langfuse.com/blog/joining-clickhouse](https://langfuse.com/blog/joining-clickhouse); HN 220 pts). Amount Unknown. | Tracing, evals | Commodity traces; acquihire/sunset risk (see Humanloop) |
| Promptfoo | https://github.com/promptfoo/promptfoo | Yes | **25,332** stars; claims used by OpenAI and Anthropic (README, vendor) | Prompts, red team, CI | Red-team marketing; core is YAML evals |
| DeepEval | https://github.com/confident-ai/deepeval | Yes | **18,367** stars (parallel sweep `gh`) | Unit evals | More crowding |
| Ragas | https://github.com/vibrantlabsai/ragas | Yes | **15,804** stars | RAG evals | Forbidden-generic RAG adjacent |
| Phoenix / Arize | https://arize.com/phoenix/ | Yes | **11,562** stars | Tracing | Crowding |
| Helicone | https://github.com/Helicone/helicone | Yes | **6,168** stars; YC W23 | Gateway + observability | Proxy insertion cost |
| LangSmith | https://www.langchain.com/langsmith | Closed | Hamel 2024 uses it; pricing page Plus **$39/seat/mo** ([langchain.com/pricing](https://www.langchain.com/pricing), parallel sweep) | Traces + playground | Lock-in; metered LCUs |
| Braintrust | https://www.braintrust.dev | Mixed | Pro **$249/mo**, unlimited users ([braintrust.dev/pricing](https://www.braintrust.dev/pricing), parallel sweep). GitHub canonical still Unknown (`braintrustdata/braintrust` 404 this pass). | Eval-first | Price floor; GB billing |
| Humanloop | https://humanloop.com/ | Was paid | **Sunset 8 Sep 2025** after Anthropic hire | Was evals | Category is acquihire-fragile |

**User-problem the category does not actually solve (Hamel):** looking at 100 traces, open-coding the first failure, clustering. Vendors sell scores. That is a UX gap **and** a reason a new dashboard will be ignored.

### 2. Code review bots — **noisy incumbents**

| Project | Evidence of weakness | Strength |
|---|---|---|
| CodeRabbit | Pricing **$24–$72/dev/mo** (parallel sweep, site). HN 42484498 noise. HN **687 pts**: “How we exploited CodeRabbit… write access on 1M repos” https://news.ycombinator.com/item?id=44953032. Sep 2026 HN: tried CodeRabbit/Qodo, “noise that end up being useless” (49621594). Own KB exists to reduce verbosity. | Summaries; some bug catches |
| Graphite, Qodo, Copilot Review, Cursor Bugbot | Cursor bundles Bugbot (docs named in parallel sweep) | Incumbent distribution |

**Lesson:** another PR bot is a **REJECTED** OFFGRID idea unless the mechanism is not comments (e.g. “only fail merge if a *reproducing test* is added”).

### 3. Data quality — **enterprise oligopoly**

Monte Carlo, GX (`fivetran/great_expectations`, **11,819** stars), dbt tests, Elementary, Soda, Metaplane, Bigeye, Anomalo. Monte Carlo’s own $16k/day story is both proof of pain and proof they already sell the monitor. **REJECTED** as a 3-week solo company.

### 4. API contracts / SDK generation — **pipeline vendors**

| Project | URL | Stars / note |
|---|---|---|
| oasdiff | https://github.com/oasdiff/oasdiff | **1,373** |
| Fern | https://buildwithfern.com/ | Docs+SDK from one spec (Aug 2026 post fetched) |
| Speakeasy, Stainless, Pact, Spectral, Optic, Postman | various | Not all fetched |

A hosted **triangle demo** (spec, traffic, SDK surface) can still wow if the failure is visible. Defensibility is low (reproducibility: a competent engineer wraps oasdiff in a weekend). Chromatic Starter is **$179/mo** ([chromatic.com/pricing](https://www.chromatic.com/pricing)). Lost Pixel README (parallel sweep): **joining Figma / sunsetting**. That is a *narrow* cheap-review gap, **not** an OFFGRID recommendation — Figma absorption is the Magician pattern. Playwright capture remains free and has no team review UI. **Still REJECTED as a primary product** (Pixel Cop).

### 5. Accessibility — **overlay class destroyed; source tools remain**

| Actor | Evidence |
|---|---|
| Overlay Fact Sheet | overlayfactsheet.com/en/ — 1,031 numbered signatories this fetch; “cannot eliminate legal risk” |
| WebAIM (quoted on OFS) | 67% / 72% ineffective ratings |
| FTC v accessiBe | $1M; no WCAG-compliance claims without evidence (final order 22 Apr 2025) |
| axe-core | dequelabs/axe-core **7,538** stars |
| EAA | Applies 28 June 2025 (Directive (EU) 2019/882) |

**Do not compete with overlays. Do not claim EAA/WCAG.** Remaining commercial space is Deque, Level Access, manual agencies — expensive. A honest CI is a feature of axe, Pa11y, Lighthouse CI.

### 6. Money movement — **Stripe + GL startups + AP suites**

Stripe first-party reports; Puzzle clearing accounts; Stampli/Bill.com/Ramp. Privacy and ERP integration kill hackathon depth. **Keep only as a problem, not as a default product.**

### 7. Usage metering — **OSS already good**

Lago **10,588** stars; OpenMeter **2,327**. Helicone overlaps cost. **REJECTED.**

### 8. HITL / agent control

HumanLayer Launch HN (item 42247368) **354 points** (Algolia this pass). Adept as general agent talent-drained to Amazon. Coding agents adding plan-only / approval after incidents (secondary essays; Anthropic official postmortem URL not confirmed this pass — do not cite a guessed URL).

### 9. Research / citations

Elicit, Consensus, SciSpace, Semantic Scholar, Connected Papers, Zotero, scite, Westlaw, Lexis, Harvey, Spellbook. **Citation existence** is a subset none of them *own* as a 20-second “this brief is lying” demo — but Harvey-class will add it. CourtListener is public.

### 10. Maintainer triage

GitHub native, Dosu, stale-bot (widely resented; not re-fetched this pass — **do not overclaim**), academic duplicate-issue papers for 20 years. Tidelift survey shows burnout, not willingness to pay a new SaaS.

## Competitive conclusions for scoring

- **Existing competition score will be high (bad) for almost every interesting problem.** That is honest. Differentiation must be mechanism + honesty + demo, not “we also do evals.”
- **Incumbent bundling** is the main killer: GitHub, Microsoft, Stripe, LaunchDarkly, Datadog, Deque, LangChain.
- **Open source CLIs** are the other killer: if `oasdiff` / `axe` / `promptfoo` already do 80% of the demo, judges who read the repo will call it a wrapper.

## What we did not find (Unknown, not “doesn’t exist”)

- Independent 2026 market-size for “AI evals” — Unknown (won’t invent TAM).
- Official Anthropic April 2026 Claude quality postmortem page — not found this pass.
- Lost Pixel “joining Figma”: from Competitor landscape sweep (internal research session) README/Exa fetch; re-confirm on GitHub before building visual-diff.
