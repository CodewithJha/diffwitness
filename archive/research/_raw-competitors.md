# HACK47 OFFGRID — raw competitor sweep

**Date compiled:** 21 Sep 2026  
**Analyst posture:** adversarial, evidence-only. No application code.  
**Rule:** `Unknown` if not found. Snippets from search APIs are discovery, not evidence. Product facts below are tagged with the inspect method.

## Method

Used **agent-reach** (`agent-reach doctor --json` first).

| Channel | Doctor status (21 Sep 2026) | How used |
|---|---|---|
| Exa (`mcporter call exa.web_search_exa`) | warn (configured, not live-verified) | Discovery. Hit **HTTP 429 free-tier limit** mid-sweep after ~12 queries. |
| Jina Reader (`curl https://r.jina.ai/URL`) | ok | Official pages. **This is evidence.** |
| GitHub (`gh search repos` / `gh repo view`) | warn (CLI present, auth not live-checked) | Stars, license, createdAt. Counts as of 21 Sep 2026. |
| HN Algolia API | n/a (public API) | Discussion / complaint threads. |
| Product Hunt | Jina fetch of PH product pages **failed** (empty/blocked). Cursor WebSearch used for discovery only. |
| Cursor WebSearch | discovery URLs only | Then Jina / GitHub / FTC where possible. |
| Reddit / Twitter | doctor: Reddit **off**, Twitter CLI **not installed** | Not used. |

**Fetch failures (Jina returned ~242 bytes / blocked):** Qodo homepage, Cursor Bugbot blog, Statsig homepage, incident.io homepage, Monte Carlo homepage, Helicone pricing, Vanta homepage, Product Hunt Revalvo page. Those products are **not** given full cards unless another primary source was fetched.

**Not independently inspected (named in the sweep list, no Jina/GitHub primary page):** Humanloop, HoneyHive, Galileo, Patronus, Portkey, WhyLabs, Elementary, Soda, Metaplane, Bigeye, Anomalo, dbt tests (as a product), Percy (only via Chromatic comparison copy), Overwrite, Pixel Perfect tools, AudioEye (only via overlay-comparison articles), Bill.com, Stampli, Expensify, Veryfi, Mindee, Tipalti, Brex, Stripe Sigma, Bench, Float, Finmark, Solve, Pact, Spectral, buf.build, Optic, oasdiff, LaunchDarkly, Split.io, OpenFeature, Rootly, FireHydrant, PagerDuty, Better Stack, Otter, Fireflies, Limitless, Rewind, Notion AI, Mem, ReadMe, Guru, Swimm, Glean, Dust, Eppo, FOSSA, Syft, Trivy, Endor Labs, UiPath, Consensus, SciSpace, Semantic Scholar, Connected Papers, Zotero, ResearchRabbit, Scite, Orb, Conveyor, Whistic (Exa only), Drata (Exa only). Listed in crowdedness notes, not invented as cards.

---

## Return to parent (read this first)

### 20 most relevant inspected competitors (URLs)

These are the products a 3-week solo OFFGRID build would actually collide with, plus a few that **kill** a category.

1. [Langfuse](https://langfuse.com) — OSS LLM evals/observability; 34,889 GitHub stars; acquired by ClickHouse.
2. [LangSmith](https://www.langchain.com/langsmith) — LangChain’s hosted observability; $39/seat Plus.
3. [Braintrust](https://www.braintrust.dev) — eval-first platform; Pro $249/mo, unlimited users.
4. [Promptfoo](https://www.promptfoo.dev) — OSS prompt/agent testing + red team; 25,332 stars; claims 156 Fortune 500.
5. [DeepEval](https://github.com/confident-ai/deepeval) / [Confident AI](https://www.confident-ai.com/products/llm-evaluation) — OSS eval framework 18,367 stars + hosted quality platform.
6. [Ragas](https://github.com/vibrantlabsai/ragas) — RAG evals; 15,804 stars.
7. [Phoenix (Arize)](https://arize.com/phoenix/) — OSS agent eval/tracing; 11,562 stars. Arize cloud: $70M Series C (LinkedIn/press via Exa, **not** Jina-fetched PR).
8. [Helicone](https://www.helicone.ai) — OSS LLM gateway/observability; 6,168 stars; YC.
9. [CodeRabbit](https://www.coderabbit.ai) — AI PR review; $24–$72/dev/mo; HN 687-pt exploit thread.
10. [Graphite](https://graphite.dev) — stacked PRs + AI review; homepage now advertises Cursor Cloud Agents.
11. [Cursor Bugbot](https://cursor.com/docs/bugbot) — bundled AI PR review (docs fetched via WebSearch/docs dump).
12. [Chromatic](https://www.chromatic.com) — visual + a11y UI testing; Starter **$179/mo**.
13. [Lost Pixel](https://github.com/lost-pixel/lost-pixel) — OSS Percy/Chromatic alternative; **product sunsetting / joining Figma**.
14. [Granola](https://www.granola.ai) — AI meeting notepad (no bot); $0 / $14 / $35 per user.
15. [Mintlify](https://www.mintlify.com) — agent-era docs/knowledge platform (Anthropic, Coinbase case studies on homepage).
16. [Stainless](https://www.stainless.com) — OpenAPI → SDKs, docs, MCP.
17. [Fern](https://www.buildwithfern.com) — Docs + SDKs + CLI from API spec.
18. [Browserbase](https://www.browserbase.com) + [Stagehand](https://github.com/browserbase/stagehand) (24,718 stars) — hosted browsers for agents.
19. [Elicit](https://www.elicit.com) — AI scientific research; claims 5M+ researchers, 138M papers.
20. [OpenMeter](https://www.openmeter.io) (now “by Kong”) + [Lago](https://www.getlago.com) (10,587 stars) — usage metering/billing.
21. [axe-core](https://github.com/dequelabs/axe-core) (7,538 stars) + [Pa11y](https://github.com/pa11y/pa11y) (4,533 stars) — real a11y engines.
22. [accessiBe](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-order-requires-online-marketer-pay-1-million-deceptive-claims-its-ai-product-could-make-websites) — overlay **trap**; FTC $1M order.
23. [Ramp](https://ramp.com) — AP/expense/cards; 70,000+ businesses claimed; Free + $15/user Plus.
24. [Socket](https://socket.dev) — supply-chain; claims $125M raised, 1.5M repos.
25. [Puzzle](https://puzzle.io) / [Pilot](https://pilot.com/platform/ai-accountant) — AI ledger/close (Exa official-page highlights; Jina not completed).

### 5 categories to AVOID (death-by-competition for a 3-week solo hackathon)

Evidence, not vibes:

1. **Meeting notes / productivity AI** — Granola is a live, well-designed product with published $14/$35 pricing, logos (Linear, PostHog, Brex, Replit), and an explicit “no meeting bot” wedge. Otter/Fireflies/Limitless/Rewind/Notion AI/Mem sit in the same job. OFFGRID’s default “messy week → brief” collides here.
2. **LLM evals / agent observability platforms** — Langfuse 34.9k★ + ClickHouse acquisition; Promptfoo 25.3k★; DeepEval 18.4k★; Ragas 15.8k★; Phoenix 11.6k★; LangSmith + Braintrust paid platforms; 2026 Product Hunt is still launching Tracea/PandaProbe/Heron/ClawMetry/Revalvo into the same hole.
3. **AI code review** — CodeRabbit (paid tiers, HN 687-pt security incident), Graphite (Cursor-adjacent), Bugbot bundled into Cursor, Copilot review bundled into GitHub. HN comments (Sep 2026) already call the category noisy/pointless. Seat-priced incumbents + free bundles = no room.
4. **Feature flags / experimentation platforms** — Unleash 13,818★, GrowthBook 8,409★, Flagsmith 6,561★, plus LaunchDarkly/Split/Statsig/Eppo as commercial gravity. This is a 10-year category with OSS defaults.
5. **Trust-center / security-questionnaire / GRC** — Vanta, Drata, SafeBase (Drata acquired SafeBase — third-party 2026 buyer guides), Conveyor, Whistic. Enterprise sales cycle, not a 3-week demo.

**Also crowded, do not enter:** AP/expense (Ramp Free tier already includes AP OCR + AI policy agents), docs *hosting* (Mintlify/Fern/Stainless), generic computer-use/RPA (Browserbase + Stagehand 24.7k★ + Playwright), academic citation search (Elicit 5M researchers claim).

### 5 categories with remaining gaps (evidence-backed)

These are **jobs**, not empty markets. Incumbents exist for adjacent pieces. The gap is the painful end-to-end job a solo adult still does by hand.

1. **Accessibility as actual remediation + evidence, not an overlay widget.**  
   FTC (3 Jan 2025) ordered accessiBe to pay **$1 million** for claiming accessWidget made sites WCAG-compliant; final order 22 Apr 2025. EAA has been enforceable since **28 Jun 2025**; a French court (4 Jun 2026) ordered Carrefour to reach **100% RGAA** or €500/day ([Webply enforcement tracker](https://webply.io/blog/eaa-enforcement-actions-2026) — secondary; not the court PDF). axe-core/Pa11y exist as *scanners* and Deque’s own position (via comparison articles) is that many WCAG 2.2 criteria cannot be automated. **Gap:** produce a shippable, cited before/after pack for a live site (failures → patches → re-scan) that a judge can click. Overlay SaaS is legally radioactive. Scanner libraries are not a product.

2. **Visual-diff *review* after Lost Pixel’s sunset.**  
   Lost Pixel GitHub README (fetched via Exa, 22 Apr 2026 snapshot): “Lost Pixel is joining Figma” / platform sunsetting. Chromatic Starter is **$179/month**. Playwright `toHaveScreenshot` is free but has no team review UI. **Gap:** local-first approve/reject workflow on Playwright (or design-vs-live) snapshots for a solo/small team. Not “another Chromatic.” Chromatic still owns the paid review UX.

3. **OSS issue hygiene that does not auto-close unreviewed work.**  
   Classic HN: [“GitHub stale bot considered harmful”](https://news.ycombinator.com/item?id=28998374) (338 pts). Still live in 2026: [anthropics/claude-code#39980](https://github.com/anthropics/claude-code/issues/39980) (stale bot closing never-triaged bugs); [etcd-io/etcd#21051](https://github.com/etcd-io/etcd/issues/21051) (proposal to disable auto-close). GitHub Copilot can *create* issues ([docs](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/copilot-on-github/copilot-for-github-tasks/use-copilot-to-create-or-update-issues), public preview) and agent automations can label/close ([changelog 23 Jul 2026](https://github.blog/changelog/2026-07-23-agent-automation-controls-in-github-issues-in-public-preview/)). **Gap:** rank + draft-reply + never close until a human touches it. Microsoft is occupying “AI files the issue”; the complaint is still “bots bury the issue.”

4. **Stripe payout → books *exception explanation* without a GL migration.**  
   Puzzle and Pilot (official pages via Exa) sell AI close *inside* a new/managed ledger. Synder sells ecommerce settlement into QuickBooks. Full-stack finance is Ramp/Brex/Pilot — unwinnable in 3 weeks. **Gap (narrow):** a read-only explainer that fetches Stripe payouts + fees + refunds and writes a plain-English “why this deposit does not match,” leaving the GL where it is. Switching cost of Puzzle/Pilot is the reason this job still exists on spreadsheets. **Not independently Jina-fetched for Puzzle/Pilot; treat as hypothesis until those pages are pulled.**

5. **Running-app vs help-center vs OpenAPI disagreement (one product, one URL).**  
   Mintlify/Fern/Stainless host and generate docs/SDKs. Chromatic snapshots Storybook. oasdiff/Optic (not fetched) exist as CLI contract diffs. Nobody inspected here owns the combo: **paste a production URL + repo docs + OpenAPI, get a punch-list of lies** (UI copy, screenshot, endpoint, example) a founder can ship tomorrow. That is closer to OFFGRID’s “one painful job” than another eval dashboard. **Gap is the job composition, not missing libraries.**

---

## Crowdedness scoreboard

| # | Category | Density | 3-week solo verdict | Why (evidence) |
|---|---|---|---|---|
| 1 | AI evals / LLM observability | **Saturated** | AVOID | 5 OSS repos >10k★ plus LangSmith/Braintrust paid; PH 2026 still spawning clones |
| 2 | Data quality / observability | Saturated (enterprise) | AVOID | Great Expectations 11,819★; Monte Carlo et al. are series-funded sales machines (pages not all fetched) |
| 3 | Code review AI | **Saturated + consolidating** | AVOID | CodeRabbit + Graphite/Cursor + Copilot + Bugbot; HN noise complaints |
| 4 | Visual regression / design-code | Crowded at capture; thinning at cheap review | **Narrow gap** | Chromatic $179; Lost Pixel sunsetting |
| 5 | Accessibility | Split: scanners mature, overlays discredited, enforcement new | **Gap if you *do the work*** | FTC $1M; EAA 2025; axe/Pa11y are libraries |
| 6 | AP / invoice / expense | Saturated | AVOID | Ramp Free includes AP OCR + AI agents; 70k businesses claim |
| 7 | Reconciliation / ledger | Crowded for startups | Avoid full GL; maybe exception-explainer | Puzzle/Pilot/Synder (partial inspect) |
| 8 | API contracts / SDK | Crowded | AVOID as platform | Stainless + Fern + Speakeasy (Speakeasy homepage **pivoted** to AI control plane) |
| 9 | Feature flags | Saturated | AVOID | Unleash/GB/Flagsmith OSS defaults |
| 10 | Incident / oncall | Saturated | AVOID | PagerDuty + incident.io + FireHydrant + Better Stack (Exa; incident.io Jina failed) |
| 11 | OSS maintainer tools | Occupied by GitHub, hated stale-bots remain | **Narrow gap** | 2026 GitHub issues still documenting auto-close harm |
| 12 | Citation / research | Saturated | AVOID | Elicit claims 5M researchers + 138M papers |
| 13 | Security questionnaires / trust | Saturated enterprise | AVOID | Vanta/Drata/SafeBase (Exa buyer guides) |
| 14 | LLM cost / metering | Crowded | AVOID | OpenMeter (Kong), Lago 10.6k★, Helicone, Langfuse cost tracking |
| 15 | Meeting notes / productivity | **Kill list** | AVOID | Granola live + priced; category instruction was to kill |
| 16 | Docs drift / help center | Crowded at hosting | **Narrow gap at drift-vs-running-app** | Mintlify/Fern; drift of UI vs docs not owned |
| 17 | Experimentation | Saturated | AVOID | GrowthBook OSS + Statsig/Eppo/LD (Statsig Jina failed) |
| 18 | Supply-chain / license | Saturated | AVOID | Socket $125M / 1.5M repos claimed; Snyk incumbent |
| 19 | Browser / RPA / computer-use | Crowded; Adept hollowed | AVOID as infra | Browserbase priced; Stagehand 24.7k★; Adept 2024 Amazon licensing |
| 20 | PH 2026 AI infra / verification / local-first | Flooded | AVOID cloning | Revalvo/Tracea/PandaProbe/Heron/ClawMetry (WebSearch only) |

---

## Category 1 — AI evals / LLM observability

**Crowdedness:** Saturated. Building “Langfuse but local” is what 2026 PH already did.

### Langfuse

| Field | Evidence |
|---|---|
| Company/project | Langfuse (now **by ClickHouse**) |
| URL | https://langfuse.com |
| Founded | GitHub created **2023-05-18**. YC W23 per own ClickHouse blog. |
| Target user | Teams building chat/coding/workflow agents in production |
| Problem | LLM apps are easy to demo, hard to debug/eval in production (own blog) |
| Core workflow | Trace (OTel/SDK) → prompt management → datasets/experiments → LLM-as-judge + human annotation → metrics/alerts |
| Pricing | Hobby Free (50k units, 2 users, 30-day). Core **$29/mo** (100k units, unlimited users, 90-day, overage $8/100k). Pro **$199/mo**. Teams add-on **$300/mo**. Enterprise **$2,499/mo**. Source: https://langfuse.com/pricing |
| Funding | **Acquired by ClickHouse** (https://langfuse.com/blog/joining-clickhouse). Amount Unknown on that page. HN: [ClickHouse acquires Langfuse](https://news.ycombinator.com/item?id=46656552) 220 pts / 96 comments. |
| Traction | Homepage community stats: **34.9k GitHub stars**. `gh repo view`: **34,889** stars (21 Sep 2026). Pricing logos: Hugging Face, Canva, Twilio, Ramp, GoDaddy, Khan Academy, Merck. |
| Technical approach | OpenTelemetry; Cloud + self-host; v3 data layer **ClickHouse** (migrated off Postgres). v4 changelog claim: “up to 165× faster.” |
| AI usage | LLM-as-judge evaluators; “Langfuse Assistant (in-app agent)” on pricing matrix |
| Strength | MIT-ish OSS + real self-host + cheapest serious cloud among inspected peers |
| Weakness | Self-host implies ClickHouse ops; billing **units** = traces+observations+scores (easy to underestimate) |
| User complaints | HN thread exists; comment-search with `tags=comment` returned empty for this query. Specific complaint URLs: Unknown beyond acquisition discussion. |
| Open-source? | Yes. GitHub licenseInfo `"Other"`. Blog: “no planned changes to licensing”; `ee` folders often proprietary (third-party comparisons; not verified in-repo this sweep). |
| Switching cost | Medium if instrumented; lower than LangSmith because OTel + self-host |
| Why users choose it | Own the data; $29 Core; ClickHouse backing |
| Why users might leave | Acquisition risk (despite promises); infra burden; eval-first teams prefer Braintrust |
| Inspected via | Jina homepage, Jina pricing, Jina blog, `gh repo view`, HN Algolia |

### LangSmith

| Field | Evidence |
|---|---|
| Company/project | LangSmith (LangChain) |
| URL | https://www.langchain.com/langsmith |
| Founded | Unknown (LangChain company). Page published-time header 14 Sep 2026. |
| Target user | Teams tracing agents; deepest if already on LangChain/LangGraph (third-party; homepage itself says Python/TS/Go/Java SDKs, any stack) |
| Problem | “Know what your agents are really doing” |
| Core workflow | Trace preferred framework or SDK → observability + evals + (Plus) Deployment/Engine/Fleet/Sandboxes/LLM Gateway |
| Pricing | Developer $0/seat, 5k traces then PAYG, 1 seat. Plus **$39/seat/mo**, 10k traces then PAYG. Enterprise custom. Metering: **$1.50/LCU**, **$1.00/LSU**. Startup credits up to $10,000. Source: https://www.langchain.com/pricing |
| Funding | Unknown on fetched pages |
| Traction | Homepage logos: Listen, Rillet, Vanta, Clay, Rippling, Lyft, Harvey (partial render) |
| Technical approach | Proprietary SaaS; self-host/hybrid on Enterprise only (pricing page) |
| AI usage | Tuned evaluators metered in LCUs; Engine/Fleet usage |
| Strength | Zero-friction if LangChain; full agent hosting adjacent |
| Weakness | Per-seat + inscrutable LCU/LSU; lock-in |
| User complaints | Ask HN “What tools are you using for AI evals? Everything feels half-baked” https://news.ycombinator.com/item?id=44194187 (6 pts) — not LangSmith-specific |
| Open-source? | No (platform) |
| Switching cost | High if traces/evals live only in Smith |
| Why users choose it | Already on LangGraph |
| Why users might leave | Seat cost at team scale; want OSS |
| Inspected via | Jina product + pricing |

### Braintrust

| Field | Evidence |
|---|---|
| Company/project | Braintrust |
| URL | https://www.braintrust.dev |
| Founded | Unknown on fetched pages |
| Target user | “AI native teams”; homepage: “Trusted by the best AI teams”; Coursera story linked |
| Problem | Agents fail differently; silent drift/regression |
| Core workflow | Observe traces → Evaluate (LLM/code/human) → Discover patterns → Loop agent generates prompts/scorers/datasets → CI-style block bad releases |
| Pricing | Starter: $0 platform, 1 GB processed then +$4/GB, 10k scores then $2.50/1k, 14-day retention, unlimited users. Pro: **$249/mo**, 5 GB then +$3/GB, 50k scores then $1.50/1k, 30-day then $0.50/GB-mo. SSO/RBAC mostly Enterprise. Source: https://www.braintrust.dev/pricing |
| Funding | Unknown on official pages. Third-party Coverge (Apr 2026) and LLMTools claim $80M Series B / ~$800M valuation — **not verified**. |
| Traction | Homepage customer videos; Coursera case. Named customers on third-party posts (Notion/Stripe) — **not on the Jina homepage extract**. |
| Technical approach | Proprietary SaaS; framework-agnostic; MCP into IDE |
| AI usage | LLM-as-judge, Loop agent, Topics/pattern discovery, model credits |
| Strength | Eval-first; unlimited users; playground-on-prod-traces |
| Weakness | $249 entry; proprietary backend; verbose traces punish GB billing |
| User complaints | HN query `Braintrust` was dominated by unrelated “brain trust” stories. Product-specific HN: Unknown. |
| Open-source? | SDKs Unknown; platform No |
| Switching cost | Medium-high (datasets/scorers in their store) |
| Why users choose it | Block regressions; no seat tax |
| Why users might leave | Cost at verbose agents; want OSS |
| Inspected via | Jina homepage + pricing |

### Promptfoo

| Field | Evidence |
|---|---|
| Company/project | Promptfoo |
| URL | https://www.promptfoo.dev — GitHub https://github.com/promptfoo/promptfoo |
| Founded | GitHub created **2023-04-28** |
| Target user | Security + engineering teams shipping AI apps; “156 of the Fortune 500” |
| Problem | Application-specific AI vulnerabilities (injection, jailbreak, PII, insecure tool use) |
| Core workflow | Connect app/CI → generate attacks (`npx promptfoo@latest redteam setup`) → findings in PRs → remediate |
| Pricing | Unknown (homepage did not show a public matrix in the Jina extract; enterprise demo CTA) |
| Funding | Unknown |
| Traction | Homepage: **156 Fortune 500**, **300,000+ developers**, “Used by OpenAI and Anthropic.” GitHub **25,332** stars, MIT. |
| Technical approach | Declarative configs, CLI, CI/CD, on-prem or cloud |
| AI usage | Generates attacks; compares models |
| Strength | Security-shaped, not just quality evals; OSS; CI native |
| Weakness | Homepage is now **red-team/security** more than “prompt playground”; quality-eval users may bounce to DeepEval |
| User complaints | Unknown (not fetched) |
| Open-source? | **Yes, MIT** |
| Switching cost | Low-medium (YAML in repo) |
| Why users choose it | CI + red team + no lock-in |
| Why users might leave | Need hosted observability UI |
| Inspected via | Jina homepage, `gh repo view` |

### DeepEval / Confident AI

| Field | Evidence |
|---|---|
| Company/project | DeepEval (OSS) + Confident AI (hosted) |
| URL | https://github.com/confident-ai/deepeval — https://www.confident-ai.com/products/llm-evaluation |
| Founded | GitHub **2023-08-10**. LinkedIn via Exa: YC W25, 9 people, SF — **Exa/LinkedIn, not Jina**. |
| Target user | Orgs standardizing evals; PMs + engineers; IDE (Cursor/Claude Code/MCP) |
| Problem | Evals stuck in CSVs/engineering bottleneck |
| Core workflow | Point at API like Postman → multi-turn sims → 50+ DeepEval metrics → CI |
| Pricing | Unknown on Jina (not fetched). Coverge third-party Apr 2026: Starter $19.99/user — **unverified**. |
| Funding | Unknown |
| Traction | DeepEval **18,367** stars, Apache-2.0, homepageUrl https://deepeval.com |
| Technical approach | Python eval framework + hosted “Postman for AI evaluation” |
| AI usage | LLM-as-judge metrics |
| Strength | Research-backed metric library; OSS core |
| Weakness | Hosted pricing not verified; category clones |
| User complaints | Unknown |
| Open-source? | DeepEval **yes Apache-2.0**; hosted platform No |
| Switching cost | Low for library; medium for hosted datasets |
| Why users choose it | Metrics + CI |
| Why users might leave | Need tracing (Langfuse) or eval ops (Braintrust) |
| Inspected via | `gh repo view`; Exa on confident-ai.com (not Jina) |

### Ragas

| Field | Evidence |
|---|---|
| Company/project | Ragas (Vibrant Labs) |
| URL | https://github.com/vibrantlabsai/ragas — docs https://docs.ragas.io |
| Founded | GitHub **2023-05-08** |
| Target user | Teams evaluating RAG/LLM apps |
| Problem | Unknown beyond README tagline “Supercharge Your LLM Application Evaluations” |
| Core workflow | Unknown (README not fully fetched) |
| Pricing | Unknown |
| Funding | Unknown |
| Traction | **15,804** stars, Apache-2.0 |
| Technical approach | Unknown |
| AI usage | Likely LLM-as-judge (not re-verified from docs this sweep) |
| Strength | Star traction in RAG eval niche |
| Weakness | Not inspected beyond GitHub metadata |
| User complaints | Unknown |
| Open-source? | Yes Apache-2.0 |
| Switching cost | Unknown |
| Why users choose it | Unknown (do not invent) |
| Why users might leave | Unknown |
| Inspected via | `gh repo view` only |

### Phoenix (Arize)

| Field | Evidence |
|---|---|
| Company/project | Phoenix (OSS) / Arize (cloud) |
| URL | https://arize.com/phoenix/ — https://github.com/Arize-ai/phoenix |
| Founded | Phoenix GitHub **2022-11-09** |
| Target user | Agent developers needing trace → annotate → experiment |
| Problem | Without tracing, agent failures are opaque |
| Core workflow | Observe traces → annotate (human or LLM-as-judge) → hypothesize → experiment → score cost/latency/quality |
| Pricing | Unknown (Phoenix page not Jina-fetched this round; GitHub only). Coverge: AX Pro $50/mo — **unverified**. |
| Funding | Exa/LinkedIn: **$70M Series C** (Feb 2025 press) — **not Jina-fetched PR**. |
| Traction | **11,562** stars. Phoenix page (Exa): “ELv2 licensed. 9k+ GitHub stars” (stale vs current 11.5k). |
| Technical approach | OpenTelemetry / OpenInference; self-host |
| AI usage | LLM-as-judge evals; agent-as-judge messaging on LinkedIn (Exa) |
| Strength | OSS tracing+evals; OTel portability |
| Weakness | Dual OSS/cloud; license “Other” on GitHub |
| User complaints | Unknown |
| Open-source? | Yes (license key `other` / ELv2 per vendor page) |
| Switching cost | Medium |
| Why users choose it | Self-host traces |
| Why users might leave | Cloud Arize sales motion / need Langfuse-style prompt mgmt |
| Inspected via | `gh repo view`; Exa Phoenix page |

### Helicone

| Field | Evidence |
|---|---|
| Company/project | Helicone |
| URL | https://www.helicone.ai — https://github.com/Helicone/helicone |
| Founded | GitHub **2023-01-31**. YC W23 (logo on homepage). |
| Target user | AI app teams needing route/debug/analyze |
| Problem | Reliability across 100+ models |
| Core workflow | Point OpenAI SDK at `https://ai-gateway.helicone.ai` → dashboard (requests, sessions, prompts, datasets, playground, rate limits, alerts) |
| Pricing | Jina pricing page **failed**. Homepage: “No credit card required, 7-day free trial.” |
| Funding | Unknown (YC) |
| Traction | **6,168** stars Apache-2.0. Homepage: “1000+ AI teams”; logos Together, QA Wolf, Clay, Singapore Airlines, Duolingo. “Product of the Day” badge. |
| Technical approach | Proxy/gateway + OSS platform |
| AI usage | Gateway routing; evals implied in Improve/Prompts/Datasets |
| Strength | One-line SDK swap; OSS |
| Weakness | Proxy in the request path (latency/privacy concern — not documented as complaint here) |
| User complaints | Unknown |
| Open-source? | Yes Apache-2.0 |
| Switching cost | Low if only a proxy; medium if prompts live in Helicone |
| Why users choose it | Gateway + logs without full LangSmith |
| Why users might leave | Need deeper evals |
| Inspected via | Jina homepage, `gh repo view` |

### Evidently, TruLens (thin)

- **Evidently:** GitHub via Exa https://github.com/evidentlyai/evidently — Apache 2.0 ML+LLM observability, 100+ metrics, Cloud with free tier. **Not `gh repo view`’d this sweep.**  
- **TruLens:** https://github.com/truera/trulens — **3,568** stars, MIT, created 2020-11-02, homepage https://www.trulens.org/

---

## Category 2 — Data quality / observability

**Crowdedness:** Saturated enterprise. Unwinnable as a 3-week demo against Monte Carlo/GE.

### Great Expectations

| Field | Evidence |
|---|---|
| Company/project | Great Expectations (repo now under **fivetran/great_expectations**) |
| URL | https://github.com/fivetran/great_expectations — docs https://docs.greatexpectations.io/ |
| Founded | GitHub **2017-09-11** |
| Target user | Data engineers who need expectations on pipelines |
| Problem | “Always know what to expect from your data.” |
| Core workflow | Unknown (docs not Jina-fetched) |
| Pricing | Unknown |
| Funding | Unknown (Fivetran ownership implied by GitHub org — **do not invent terms**) |
| Traction | **11,819** stars, Apache-2.0 |
| Technical approach | Python expectations library |
| AI usage | Unknown |
| Strength | Long-running OSS default for data tests |
| Weakness | Not a 2026 “wow” demo; category is warehouse-sales |
| User complaints | Unknown |
| Open-source? | Yes |
| Switching cost | High once tests are in CI |
| Why users choose it | dbt/warehouse-adjacent testing |
| Why users might leave | SaaS observability (Monte Carlo et al.) |
| Inspected via | `gh repo view` only |

**Monte Carlo:** Jina homepage **failed**. Treat as unscored. Industry fixture; do not build this.

---

## Category 3 — Code review AI

**Crowdedness:** Saturated and consolidating. HN already treats specialist reviewers as noise.

### CodeRabbit

| Field | Evidence |
|---|---|
| Company/project | CodeRabbit |
| URL | https://www.coderabbit.ai |
| Founded | Unknown |
| Target user | Teams drowning in AI-generated PRs (“The future isn't writing code. It's reviewing it.”) |
| Problem | AI-driven code outpaces human review capacity |
| Core workflow | Auto-review every PR → Triage by impact → security scan → 1-click fixes / agent loops / MCP |
| Pricing | 14-day trial. Annual: Essentials **$24/dev/mo**, Team **$48**, Advanced **$72**, Enterprise custom. Agent add-on **$0.40 per agent minute**. Source: https://www.coderabbit.ai/pricing |
| Funding | HN title (not article body): “CodeRabbit raises a $143M Series C at a $1.5B valuation” https://news.ycombinator.com/item?id=49274706 (7 pts). **Treat as unverified until a primary post.** |
| Traction | Homepage logos: NVIDIA, Indeed, Adyen, JFrog, BMW, Swiggy, Visma. Swiggy/Visma case studies linked. |
| Technical approach | Git-hosted PR bot + CLI + linters/SAST + multi-repo on Team |
| AI usage | Agentic reviews, chat, finishing touches (tests, conflicts) |
| Strength | Breadth (review + triage + security); works where teams already PR |
| Weakness | Noise; security surface (bot on repos) |
| User complaints | **HN 687 pts / 227 comments:** “How we exploited CodeRabbit: From simple PR to RCE and write access on 1M repos” https://news.ycombinator.com/item?id=44953032. HN comments Sep 2026: “we tried coderabbit, qodo, and they all produce an amount of noise that end up being useless” https://news.ycombinator.com/item?id=49621594; “poor results… isn’t worth the noise” https://news.ycombinator.com/item?id=49573957 |
| Open-source? | No (product). Enterprise self-host option on pricing. |
| Switching cost | Medium (learnings/rules in product) |
| Why users choose it | Cover every PR without hiring |
| Why users might leave | Noise, security incident history, Copilot/Bugbot already paid for |
| Inspected via | Jina home + pricing, HN Algolia |

### Graphite

| Field | Evidence |
|---|---|
| Company/project | Graphite |
| URL | https://graphite.dev |
| Founded | Unknown |
| Target user | Teams shipping stacked PRs |
| Problem | Waiting on review; large PRs |
| Core workflow | CLI/VS Code stacking → unified inbox → merge queue → AI reviewer/chat that applies fixes |
| Pricing | Unknown (not fetched) |
| Funding | Unknown. Third-party Coderbuds (29 Aug 2026) claims Cursor acquired Graphite Dec 2025 — **homepage does not say “acquired.”** Homepage does say “Cursor Cloud Agents are now in Graphite.” |
| Traction | Unknown beyond marketing claims “ship more code with smaller PRs” |
| Technical approach | GitHub-synced stacked PRs + merge queue + CI optimizer |
| AI usage | Collaborative AI reviewer on PR page; Cursor Cloud Agents |
| Strength | Workflow (stacking) not just comments |
| Weakness | Thin official page fetch; GitHub-centric |
| User complaints | Unknown |
| Open-source? | Unknown (CLI may be; not verified) |
| Switching cost | High once stacking is the team habit |
| Why users choose it | Stay unblocked with stacks |
| Why users might leave | If Cursor bundles stacking/review |
| Inspected via | Jina homepage (short) |

### Cursor Bugbot

| Field | Evidence |
|---|---|
| Company/project | Bugbot (Cursor) |
| URL | https://cursor.com/docs/bugbot — help https://cursor.com/help/ai-features/bugbot — marketing https://cursor.com/bugbot |
| Founded | Out of beta: https://cursor.com/blog/bugbot-out-of-beta (Jina of blog **failed**; WebSearch quotes beta stats) |
| Target user | Teams already in Cursor/GitHub |
| Problem | Logic bugs, security, quality in PRs |
| Core workflow | Auto on PR update, or comment `cursor review` / `bugbot run` → inline comments → Fix in Cursor / Cloud Agent / Autofix |
| Pricing | Unknown on fetched docs. Help text: included reviews on PRs; Teams analytics. |
| Funding | n/a (Cursor product) |
| Traction | Blog via WebSearch: beta “reviewed over 1 million PRs and found over 1.5 million issues”; “over 50% of identified bugs are resolved by the time the PR is merged.” **Not Jina-verified.** |
| Technical approach | PR-diff review + BUGBOT.md rules; GitHub check `Cursor Bugbot`; also GitLab/Bitbucket/Azure DevOps per help |
| AI usage | Full |
| Strength | Bundled; low incremental cost if you pay Cursor |
| Weakness | False-positive risk shared with the category |
| User complaints | Unknown (not fetched) |
| Open-source? | No |
| Switching cost | Low if already on Cursor |
| Why users choose it | Already pay for Cursor |
| Why users might leave | Noise; want GitLab-first specialist |
| Inspected via | Cursor docs dump / WebSearch (Jina blog failed) |

### Qodo / Copilot review / Sourcery

- **Qodo:** Jina homepage **failed**. Third-party Coderbuds: Qodo moved OSS PR-Agent to community Apache-2.0 on **23 Apr 2026**. Unverified.
- **GitHub Copilot code review:** Documented in Copilot docs index (https://docs.github.com/en/copilot) as PR review with suggested fixes. Bundled.
- **Sourcery:** Not fetched.

---

## Category 4 — Visual regression / design-code

**Crowdedness:** Capture is a commodity (Playwright). Paid review UX is Chromatic/Percy. Lost Pixel exiting.

### Chromatic

| Field | Evidence |
|---|---|
| Company/project | Chromatic (Storybook / Chromatic Inc.) |
| URL | https://www.chromatic.com |
| Founded | Unknown |
| Target user | Frontend teams / design systems |
| Problem | Visual, interaction, accessibility issues before ship |
| Core workflow | Storybook/Playwright snapshots → pixel/visual diff → review/approve in UI; DOM archive for debug; a11y testing now marketed |
| Pricing | Free $0 — 5,000 billed snapshots, Chrome only, unlimited users. Starter **$179/mo** — 35k snapshots, extra $0.008, Safari/Firefox/Edge. Pro **$399/mo** — 85k. Enterprise custom. Source: https://www.chromatic.com/pricing |
| Funding | Unknown |
| Traction | Pricing logos: Canon, DocuSign, Replit, Toyota, Vercel, Perplexity. Chromatic vs Lost Pixel page (Exa, Aug 2026): “7.3 billion tests.” |
| Technical approach | Cloud browsers; turbosnaps; Git/CI |
| AI usage | Unknown on homepage extract |
| Strength | Review UX + flake control + inspectable archives |
| Weakness | Price; snapshot-count surprises |
| User complaints | Unknown |
| Open-source? | No (Storybook is OSS; Chromatic is cloud) |
| Switching cost | High (baselines in cloud) |
| Why users choose it | Design-system CI |
| Why users might leave | Cost; Playwright-only shops |
| Inspected via | Jina home + pricing |

### Lost Pixel

| Field | Evidence |
|---|---|
| Company/project | Lost Pixel |
| URL | https://github.com/lost-pixel/lost-pixel — platform https://app.lost-pixel.com/ |
| Founded | Unknown |
| Target user | GitHub-centric frontend teams wanting OSS visual tests |
| Problem | Percy/Chromatic cost |
| Core workflow | Storybook/Ladle/Histoire/pages/custom Playwright screenshots → GitHub Action → (platform) approve/reject |
| Pricing | OSS free (`generateOnly`); platform sunsetting |
| Funding | Unknown |
| Traction | README: “Open source alternative to Percy, Chromatic, Applitools.” **Critical:** “Lost Pixel is joining Figma” / “We are sunsetting the product.” Chromatic compare page (Exa, Aug 2026): official pricing page says product is being sunset. |
| Technical approach | OSS runner + optional SaaS |
| AI usage | No on README |
| Strength | Playwright-native OSS |
| Weakness | **Being killed** |
| User complaints | n/a (shutdown) |
| Open-source? | Yes |
| Switching cost | Forced migrate |
| Why users choose it | Free GitHub Action visual tests |
| Why users might leave | Sunset |
| Inspected via | Exa GitHub README + Chromatic compare (not Jina) |

### Playwright screenshots / Figma Dev Mode / Overwrite

- Playwright visual comparison is documented widely; **not independently fetched** from playwright.dev this sweep.
- **Overwrite:** no official product page found in this sweep. **Unknown / do not treat as verified competitor.**
- Figma Dev Mode: not fetched.

---

## Category 5 — Accessibility

**Crowdedness:** Overlay vendors are legally toxic. Scanner engines are mature OSS. Enforcement of EAA is the *new* pressure, not a new scanner market.

### axe-core (Deque)

| Field | Evidence |
|---|---|
| Company/project | axe-core |
| URL | https://github.com/dequelabs/axe-core — https://www.deque.com/axe/ |
| Founded | GitHub **2015-06-10** |
| Target user | Frontend/QA embedding automated a11y in tests |
| Problem | Automated Web UI accessibility failures |
| Core workflow | Run engine in browser/CI → report violations |
| Pricing | Engine OSS; Deque DevTools Pro unknown (site not Jina-fetched) |
| Funding | Unknown |
| Traction | **7,538** stars, MPL-2.0 |
| Technical approach | In-browser rules engine |
| AI usage | Unknown for core |
| Strength | Default engine inside many tools (incl. Chromatic a11y marketing) |
| Weakness | Cannot certify WCAG; Deque-adjacent writing says many 2.2 criteria need manual tests (secondary article) |
| User complaints | Unknown |
| Open-source? | Yes MPL-2.0 |
| Switching cost | Low as a library |
| Why users choose it | Standard |
| Why users might leave | Need manual AT testing / remediation product |
| Inspected via | `gh repo view` |

### Pa11y

| Field | Evidence |
|---|---|
| Company/project | Pa11y |
| URL | https://github.com/pa11y/pa11y — https://pa11y.org |
| Founded | GitHub **2013-03-05** |
| Target user | Teams wanting CLI a11y sweeps |
| Problem | Automated accessibility testing |
| Core workflow | Unknown (README not fetched) |
| Pricing | OSS |
| Funding | n/a |
| Traction | **4,533** stars, LGPL-3.0 |
| Technical approach | CLI |
| AI usage | No evidence |
| Strength | CI-friendly age and simplicity |
| Weakness | Not a remediation product |
| User complaints | Unknown |
| Open-source? | Yes |
| Switching cost | Low |
| Why users choose it | Scheduled sweeps |
| Why users might leave | axe ecosystem |
| Inspected via | `gh repo view` |

### accessiBe (negative space / trap)

| Field | Evidence |
|---|---|
| Company/project | accessiBe Inc. / accessiBe Ltd. |
| URL | Product not used as a model. FTC: https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-order-requires-online-marketer-pay-1-million-deceptive-claims-its-ai-product-could-make-websites |
| Founded | Unknown |
| Target user | Site owners wanting “instant WCAG” |
| Problem | (Marketed) make any website WCAG compliant via accessWidget |
| Core workflow | Overlay/plugin |
| Pricing | Unknown this sweep |
| Funding | Unknown |
| Traction | Enough to draw FTC + NFB convention ban (HN) |
| Technical approach | AI-powered overlay |
| AI usage | Central to the deceptive claim |
| Strength | n/a for OFFGRID (do not copy) |
| Weakness | **FTC: accessWidget did not make all user websites WCAG-compliant; claims false/misleading/unsubstantiated; paid reviews dressed as independent.** $1,000,000 payment. Order bars representing automated products can make any website WCAG-compliant or ensure continued compliance unless evidenced. Final order: https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million (22 Apr 2025). |
| User complaints | NFB ban: https://news.ycombinator.com/item?id=27718801 ; “AccessiBE will get you sued” https://news.ycombinator.com/item?id=29716290 ; FTC HN https://news.ycombinator.com/item?id=42588873 |
| Open-source? | No |
| Switching cost | Overlay removable; legal residue remains |
| Why users choose it | One-line “compliance” fantasy |
| Why users might leave | FTC order, lawsuits, AT user harm |
| Inspected via | Jina FTC press release 3 Jan 2025 |

### EAA 2025 enforcement (context, not a product)

- EU Accessibility Act enforceable **28 Jun 2025** (Webply tracker; secondary).
- **4 Jun 2026:** Tribunal judiciaire de Caen — Carrefour ordered to full RGAA in six months or €500/day; 71% was held not enough (Webply; **court PDF not fetched**).
- Spain Vueling fine cited by Webply under pre-EAA RD 1112/2018 — label as secondary.

**AudioEye:** not Jina-fetched. Overlay-comparison articles mention hybrid human+overlay tiers. Unknown.

---

## Category 6 — AP / invoice / expense

**Crowdedness:** Saturated. Ramp’s *free* tier already includes AP OCR and AI policy review.

### Ramp

| Field | Evidence |
|---|---|
| Company/project | Ramp |
| URL | https://ramp.com |
| Founded | Unknown |
| Target user | Finance teams at growing companies |
| Problem | Spend, expenses, AP, travel, procurement fragmented |
| Core workflow | Cards + policy at swipe → auto receipts → Policy Agent flags exceptions → AP OCR 99% claim → 2-/3-way match → pay |
| Pricing | **Free $0/user** (cards, expenses, AP OCR, travel, QBO/Xero). **Plus $15/user/mo + platform fee** (20% off annual). Enterprise custom. Source: Jina of https://ramp.com (machine-readable page). |
| Funding | Unknown on this page |
| Traction | “Trusted by **70,000+** businesses including Notion, Shopify, Webflow…”; “saved 27M+ hours”; close books 75% faster (vendor claims) |
| Technical approach | All-in-one spend platform; OCR; AI agents for coding/fraud/approvals |
| AI usage | Policy Agent, AP agents, procurement intake, expense memos |
| Strength | Free wedge + card network + AP |
| Weakness | Needs bank/card issuance (not a hackathon demo) |
| User complaints | Unknown this sweep |
| Open-source? | No |
| Switching cost | Very high (cards, ERP, receipts) |
| Why users choose it | Replace Expensify+Bill+card |
| Why users might leave | Plus platform fees; ERP depth vs Coupa |
| Inspected via | Jina ramp.com |

Bill.com, Stampli, Expensify, Veryfi, Mindee, Tipalti, Brex: **not fetched.** Do not invent.

---

## Category 7 — Reconciliation / ledger / Stripe

**Crowdedness:** High for “AI accountant.” Narrow remaining job is exception explanation without migration.

### Puzzle / Pilot / Synder (partial)

Inspected via **Exa official-page highlights only** (not Jina). Treat as directional:

- **Puzzle** https://puzzle.io — AI drafts categorization, reconciliation, close; native Stripe/Ramp/Brex/Mercury/Gusto; “nothing posts without your approval.” Firm page claims Trivium completed 81% of reconciliations with Puzzle automations.
- **Pilot** https://pilot.com/platform/ai-accountant — AI Accountant categorizes/reconciles; manages QBO; Meridian for accounting firms. “Built on the platform Pilot has run in production since 2017.”
- **Synder** — ecommerce/Stripe/Shopify/PayPal/Amazon settlement into QuickBooks (LinkedIn/Exa).

**Stripe Sigma, Bench, Float, Finmark, Solve:** not fetched.

---

## Category 8 — API contracts / SDK

**Crowdedness:** Saturated for “generate SDKs from OpenAPI.” Speakeasy’s **marketing homepage has pivoted**.

### Stainless

| Field | Evidence |
|---|---|
| Company/project | Stainless |
| URL | https://www.stainless.com |
| Founded | Unknown |
| Target user | API companies needing idiomatic SDKs + docs + MCP for agents |
| Problem | DevEx and agent-ex from the same spec |
| Core workflow | OpenAPI → SDKs (TS/Python/Go/Java/Ruby/C#/PHP shown) + docs + MCP |
| Pricing | Unknown |
| Funding | Unknown |
| Traction | Anthropic TypeScript snippet on homepage (example client) |
| Technical approach | Spec-derived generation |
| AI usage | MCP servers for agents |
| Strength | Languages + MCP in one pitch |
| Weakness | Not a 3-week differentiator |
| User complaints | Unknown |
| Open-source? | Unknown |
| Switching cost | High once official SDKs are generated here |
| Why users choose it | Official-quality SDKs |
| Why users might leave | Fern docs+SDK bundle; Speakeasy if they still generate |
| Inspected via | Jina homepage |

### Fern

| Field | Evidence |
|---|---|
| Company/project | Fern |
| URL | https://www.buildwithfern.com |
| Founded | Unknown |
| Target user | API companies; “developers and agents” |
| Problem | Docs/SDKs/CLI that agents can use |
| Core workflow | Docs site + generated SDKs + CLI; search, MCP, llms.txt, AI search |
| Pricing | Page exists https://www.buildwithfern.com/pricing — **not Jina-fetched** |
| Funding | Unknown |
| Traction | “20M+ Docs pages served per year” (ElevenLabs); “99% reduction in time to first API call” (Frame); “14x AI search engagement” (Unleash). SOC 2 trust center linked. |
| Technical approach | Spec → docs/SDK/CLI |
| AI usage | AI search, agent setup, MCP, llms.txt |
| Strength | Docs+SDK together vs Stainless docs add-on |
| Weakness | Overlaps Mintlify (docs) + Stainless (SDKs) |
| User complaints | Unknown |
| Open-source? | Unknown |
| Switching cost | High |
| Why users choose it | One vendor for docs+SDKs |
| Why users might leave | Mintlify for docs-only; Stainless for SDK quality |
| Inspected via | Jina homepage |

### Speakeasy (pivot note)

Jina of https://www.speakeasy.com (21 Sep 2026): **“Govern and secure enterprise AI” / AI control plane** — catalog of agents/MCP/Skills, identity, policy enforcement, MDM deploy. Logos: Google, Mistral, MoonPay, Fifth Third, PlanetScale, LaunchDarkly. MoonPay security quote.  

This is **not** an SDK-generator homepage anymore. Historical SDK product may still exist off this page — **not verified**. Do not plan to “compete with Speakeasy SDKs” from this homepage.

Pact, Spectral, buf.build, Optic, oasdiff: **not fetched.**

---

## Category 9 — Feature flags

**Crowdedness:** Saturated. OSS defaults exist.

| Project | URL | Stars (21 Sep 2026) | Created | License | Notes |
|---|---|---|---|---|---|
| Unleash | https://github.com/Unleash/unleash — https://www.getunleash.io | **13,818** | 2014-09-29 | AGPL-3.0 | Open-source feature management |
| GrowthBook | https://github.com/growthbook/growthbook — https://www.growthbook.io | **8,409** | 2021-05-07 | Other | Flags + experimentation + analytics |
| Flagsmith | https://github.com/Flagsmith/flagsmith — https://www.flagsmith.com | **6,561** | 2018-06-05 | BSD-3-Clause | Flags, remote config, experiment, self-host or cloud |

LaunchDarkly, Split.io, OpenFeature: **not fetched.** OpenFeature is a spec/ecosystem, not a single product.

**Verdict:** AVOID. You cannot out-execute Unleash in 3 weeks.

---

## Category 10 — Incident / oncall

**Crowdedness:** Saturated. Jina of incident.io **failed**. Exa highlights (use as discovery):

- **incident.io** https://incident.io — Slack/Teams incident + on-call + AI investigations. Third-party PickMySoft (Jul 2026): Basic free; Team $19/user; on-call add-on extra. ProPicked (May 2026): “crossed 600 customers including Vercel, Anthropic” — **unverified**.
- **FireHydrant** https://firehydrant.com/incident-management/ — end-to-end incident; Pro $25/responder in third-party tables.
- **Better Stack** — bundles logs/uptime/on-call/AI SRE.
- **PagerDuty** — enterprise default, 700+ integrations in third-party writeups.
- **Rootly** — not fetched.

**Verdict:** AVOID.

---

## Category 11 — OSS maintainer tools

**Crowdedness:** GitHub Copilot occupies issue *creation* and agent automations. Stale-bots remain hated.

### GitHub Copilot for issues

| Field | Evidence |
|---|---|
| Company/project | GitHub Copilot |
| URL | https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/copilot-on-github/copilot-for-github-tasks/use-copilot-to-create-or-update-issues |
| Founded | n/a |
| Target user | Maintainers/contributors with repo write access |
| Problem | Filing structured issues is slow |
| Core workflow | Natural language or screenshot → draft title/body/labels/assignees from templates → human review → Create. Can assign Copilot cloud agent. |
| Pricing | Copilot subscription (not fetched) |
| Funding | n/a |
| Traction | Public preview (docs note subject to change). Changelog 23 Jul 2026: agent automation controls show rationale/confidence before label/close/assign. |
| Technical approach | Copilot on github.com + CLI tabs for Issues (GA 23 Jun 2026 changelog) |
| AI usage | Full |
| Strength | Distribution (it’s GitHub) |
| Weakness | Preview; quality warning on long threads |
| User complaints | Copilot-adjacent automations still close issues; see claude-code stale threads (Anthropic’s bot, not Copilot — related *job*) |
| Open-source? | No |
| Switching cost | n/a if you’re on GitHub |
| Why users choose it | Zero install |
| Why users might leave | Hallucinated issues; preview churn |
| Inspected via | WebSearch → GitHub docs |

### Stale-bot backlash (the job, not a vendor)

- https://news.ycombinator.com/item?id=28998374 — 338 pts, 163 comments — “GitHub stale bot considered harmful”
- https://news.ycombinator.com/item?id=25821092 — 288 pts — “GitHub Stale Bots – A False Economy”
- 2026: https://github.com/anthropics/claude-code/issues/39980 — stale labels on never-triaged, still-reproducing bugs
- 2026: https://github.com/etcd-io/etcd/issues/21051 — disable auto-close; bot re-stales after maintainers unstale; misconfigured `days-until-*` vs `days-before-*`

**Gap:** tools that *reduce inbox* without pretending silence = resolved.

---

## Category 12 — Citation / research

**Crowdedness:** Saturated for “AI over papers.”

### Elicit

| Field | Evidence |
|---|---|
| Company/project | Elicit |
| URL | https://www.elicit.com |
| Founded | Unknown |
| Target user | Scientific researchers, evidence-based decisions |
| Problem | Research is slow; need cited artifacts not chat |
| Core workflow | Question → search 138M papers + 545k trials → reports with sentence-level citations → systematic review screening/extraction → library + alerts |
| Pricing | https://www.elicit.com/pricing **not fetched** |
| Funding | Unknown |
| Traction | “Trusted by over **5 million researchers**”; research-agent video on homepage; claims up to 80% time savings on systematic reviews (vendor) |
| Technical approach | Semantic search + systematic-review-inspired reports; accuracy eval blog linked https://blog.elicit.com/elicit-reports-eval/ (**not fetched**) |
| AI usage | Research agent, extraction, screening |
| Strength | Citations as a first-class constraint |
| Weakness | Academic, not OFFGRID “adult professional ops” unless the user’s job is research |
| User complaints | Unknown |
| Open-source? | No |
| Switching cost | Medium (library) |
| Why users choose it | Cited reports vs ChatGPT |
| Why users might leave | Consensus/SciSpace/Zotero stacks |
| Inspected via | Jina homepage |

Consensus, SciSpace, Semantic Scholar, Connected Papers, Zotero, ResearchRabbit, Scite: **not fetched.** Assume crowded.

---

## Category 13 — Security questionnaires / trust

**Crowdedness:** Saturated enterprise. Vanta Jina **failed**.

Exa/buyer-guide discovery (not evidence-grade):

- SafeBase (now Drata): https://www.safebase.ai/ — trust center + AI questionnaires; Crossbeam “reduced inbound questionnaires by 98%” (vendor). Wolfia blog: Drata acquired SafeBase **$250M Feb 2025** — **unverified**.
- Conveyor: founded 2021, $12.5M A (2023) + $20M B (Wolfia — unverified); credit-metered portal.
- Vanta / Drata: compliance automation with bolted-on trust centers.
- Whistic: dual-sided vendor risk network.

**Verdict:** AVOID. Sales-cycle product.

---

## Category 14 — LLM cost / metering

**Crowdedness:** Crowded. Overlaps Helicone/Langfuse cost tracking.

### OpenMeter (Kong)

| Field | Evidence |
|---|---|
| Company/project | OpenMeter by **Kong** |
| URL | https://www.openmeter.io — https://github.com/openmeterio/openmeter |
| Founded | GitHub **2023-06-06** |
| Target user | AI/API companies shipping usage-based billing |
| Problem | Meter events → bill |
| Core workflow | Collect usage events → aggregate → billing (Cloud signup now `cloud.konghq.com`) |
| Pricing | https://www.openmeter.io/pricing not fetched |
| Funding | Unknown (Kong acquisition/branding on homepage; terms Unknown) |
| Traction | **2,327** stars Apache-2.0. Logos: Trigger, Beam, Requestly, Traceloop |
| Technical approach | OSS metering + cloud |
| AI usage | Metering *for* AI usage, not an LLM product |
| Strength | Purpose-built usage billing |
| Weakness | Now a Kong SKU; not a hackathon wedge |
| User complaints | Unknown |
| Open-source? | Yes Apache-2.0 |
| Switching cost | High once invoices depend on meters |
| Why users choose it | Usage-based billing without Stripe Billing gymnastics |
| Why users might leave | Lago; Kong packaging |
| Inspected via | Jina homepage, `gh repo view` |

### Lago

| Field | Evidence |
|---|---|
| Company/project | Lago |
| URL | https://www.getlago.com — https://github.com/getlago/lago |
| Founded | GitHub **2022-02-28** |
| Target user | Teams needing OSS usage billing |
| Problem | Consumption tracking, subscriptions, pricing iterations, payments, revenue analytics |
| Core workflow | Unknown beyond GitHub description (homepage Jina 8kB, not fully extracted here) |
| Pricing | Unknown |
| Funding | Unknown |
| Traction | **10,587** stars, **AGPL-3.0** |
| Technical approach | OSS billing API |
| AI usage | Unknown |
| Strength | Star count; AGPL self-host |
| Weakness | AGPL may scare some shops |
| User complaints | Unknown |
| Open-source? | Yes AGPL-3.0 |
| Switching cost | High |
| Why users choose it | OSS Stripe Billing alternative |
| Why users might leave | OpenMeter/Kong; Orb (not fetched) |
| Inspected via | `gh repo view` + short Jina |

Orb: **not fetched.** Langfuse pricing includes token/cost tracking on all inspected tiers.

---

## Category 15 — Meeting notes / productivity — KILL

**Crowdedness:** Death. Do not build this. Do not use OFFGRID default wow-path if it is “summarize my week of meetings.”

### Granola

| Field | Evidence |
|---|---|
| Company/project | Granola |
| URL | https://www.granola.ai |
| Founded | Unknown |
| Target user | People in back-to-back meetings (macOS, Windows, iOS, Android; Apple Watch) |
| Problem | Notes without inviting a meeting bot |
| Core workflow | Capture computer audio (Zoom/Meet/Teams/etc.) → enhance notes → chat across meetings → share folders |
| Pricing | Basic **$0** (limited history). Business **$14/user/mo** (unlimited, advanced models, Attio/Notion/Slack/HubSpot/Affinity/Zapier, MCP, API). Enterprise **$35/user/mo** (SSO, admin, org training opt-out). 1.5% of subscription to Stripe Climate. Source: https://www.granola.ai/pricing |
| Funding | Unknown |
| Traction | Logos: PostHog, Intercom, Linear, Index, Brex, Replit, Lovable. Brex CEO testimonial on pricing page. |
| Technical approach | On-device/computer audio vs bot participant |
| AI usage | Note enhancement, chat, “advanced AI thinking models” on Business |
| Strength | Privacy wedge vs Otter bots; polished; priced for individuals |
| Weakness | Category clones; audio-permission distrust |
| User complaints | HN “Granola” is polluted by cereal. Related: Show HN Muesli “If Granola and Wisprflow had an open source on device baby” https://news.ycombinator.com/item?id=48011116 ; OSS granola https://news.ycombinator.com/item?id=44271745 |
| Open-source? | No |
| Switching cost | Medium (history) |
| Why users choose it | No bot in the meeting |
| Why users might leave | Limitless/Rewind local capture; company Otter contract |
| Inspected via | Jina home + pricing, HN |

Otter, Fireflies, Limitless, Rewind, Notion AI, Mem: **not fetched.** Instruction was to kill the category; Granola alone is enough.

---

## Category 16 — Docs drift / help center

**Crowdedness:** Hosting is crowded. Drift-vs-running-product is not clearly owned.

### Mintlify

| Field | Evidence |
|---|---|
| Company/project | Mintlify |
| URL | https://www.mintlify.com |
| Founded | Unknown |
| Target user | Product/docs teams; “agent-native” knowledge |
| Problem | Knowledge that goes stale; agents need docs |
| Core workflow | Knowledge platform: self-updating knowledge, access control, system connectors, agents |
| Pricing | Unknown (not fetched) |
| Funding | Unknown |
| Traction | Homepage live counters (session-specific): pages read ~10.7M, search ~130k, API ~21k, content updates ~21k. Case studies: **Anthropic** “2M Monthly active developers”; **Coinbase** “+50x faster deployment time.” Customers include ATT, Rivian (logo links). |
| Technical approach | Hosted docs/knowledge + agents |
| AI usage | Agents, self-updating knowledge, search |
| Strength | Distribution in AI-lab docs |
| Weakness | Hosting ≠ detecting that the *app UI* lied |
| User complaints | Unknown |
| Open-source? | Unknown |
| Switching cost | High (docs domain) |
| Why users choose it | Beautiful docs + AI search |
| Why users might leave | Fern (docs+SDK); ReadMe |
| Inspected via | Jina homepage |

ReadMe, Guru, Swimm, Glean, Dust: **not fetched.**

---

## Category 17 — Experimentation

**Crowdedness:** Saturated. GrowthBook OSS already in flags table. Statsig Jina **failed**. Eppo/LaunchDarkly experiments **not fetched.** AVOID.

---

## Category 18 — Supply-chain / license

**Crowdedness:** Saturated. OFFGRID rules also say do not build cyber.

### Socket

| Field | Evidence |
|---|---|
| Company/project | Socket |
| URL | https://socket.dev |
| Founded | Unknown |
| Target user | Engineering/security at AI-speed development |
| Problem | Malicious packages / supply-chain attacks before they reach code |
| Core workflow | GitHub App / Firewall / CLI / patches / web extension / reachability |
| Pricing | https://socket.dev/pricing not fetched |
| Funding | Homepage achievement: **“Raised $125M”** linking https://socket.dev/blog/series-c (**blog not fetched**) |
| Traction | **11.6M+** commits secured/month; **1.5M** repos. Case studies: Anthropic, Vercel, MetaMask, Drata, Replit. OpenAI Trusted Access for Cyber cohort (homepage news). |
| Technical approach | Package scanning, reachability, firewall |
| AI usage | “Security that keeps pace with AI development” |
| Strength | Distribution + funding |
| Weakness | Category vs Snyk/Dependabot; **do not build this for OFFGRID** (cyber) |
| User complaints | Unknown |
| Open-source? | Unknown (GitHub org SocketDev; `socketdev/socket` repo name 404 via `gh repo view`) |
| Switching cost | Medium-high |
| Why users choose it | Block malware packages |
| Why users might leave | Snyk already purchased |
| Inspected via | Jina homepage |

Snyk, FOSSA, Syft, Trivy, Endor Labs: **not fetched.** Skip for OFFGRID.

---

## Category 19 — Browser / RPA / computer-use

**Crowdedness:** Infra is crowded. Adept is not a product you can bet on.

### Browserbase + Stagehand

| Field | Evidence |
|---|---|
| Company/project | Browserbase / Stagehand |
| URL | https://www.browserbase.com — https://github.com/browserbase/stagehand |
| Founded | Stagehand GitHub **2024-03-24** |
| Target user | Teams building browser agents (logos: Microsoft, Clay, Amplitude, Ramp, Lovable, DeepMind) |
| Problem | Web is not a reliable API for agents |
| Core workflow | Cloud browsers + Agents + Search/Fetch APIs + Runtime + Identity + Observability; OSS Stagehand SDK |
| Pricing | Free: 3 concurrent, 1 browser hour, 3 agent runs. Developer: 25 concurrent, 100 hours then **$0.12/hr**. Startup: 100 concurrent, 500 hours then **$0.10/hr**. Enterprise custom. Captcha solving from Developer up. Source: https://www.browserbase.com/pricing (plan dollar stickers in title: Free, $20, $99, or Custom — **dollar amounts not repeated in the table extract**; title is the source for $20/$99). |
| Funding | Unknown |
| Traction | “10,000+ companies”; Stagehand **24,718** stars, MIT |
| Technical approach | Hosted Chromium + stealth/proxies + OSS framework |
| AI usage | Agent runs, model gateway |
| Strength | The computer-use pickaxe |
| Weakness | Usage cost; captcha/stealth arms race; not a *job*, it’s infra |
| User complaints | Unknown |
| Open-source? | Stagehand yes; Browserbase cloud no |
| Switching cost | Medium |
| Why users choose it | Don’t run Playwright farms |
| Why users might leave | Self-host Playwright; other browser clouds |
| Inspected via | Jina home + pricing, `gh repo view` |

### Adept (status)

Primary: https://www.adept.ai/blog/adept-update/ (28 Jun 2024) — co-founders + some team join Amazon AGI; Amazon licenses agent tech/models/datasets; Adept continues focused on agentic solutions; Zach Brock CEO. Reuters 28 Jun 2024: raised over $410M, valued above $1B; continues independently. GeekWire: ~20 employees remain.

**2026 status of a public Adept product: Unknown.** LinkedIn noise (Zach Brock reactions) is not a product page. Do not build “Adept for X.” Computer-use is Browserbase/Stagehand/Playwright now.

UiPath: **not fetched.** Enterprise RPA incumbent; AVOID.

---

## Category 20 — Product Hunt 2026 (AI infra / verification / local-first)

Jina of Product Hunt pages **failed**. WebSearch discovery only (not evidence-grade traction):

| Product | URL | Launch claim (PH copy via WebSearch) |
|---|---|---|
| Revalvo | https://www.producthunt.com/products/revalvo | Local-first prompt workbench; 40 evaluators; BYOK; no account; Ollama; launched 2026 |
| Tracea | https://www.producthunt.com/products/tracea | Self-hosted “Datadog for AI agents”; Docker; RCA; launched 2026 |
| PandaProbe | https://www.producthunt.com/products/pandaprobe | OSS agent engineering; traces + trajectory evals |
| Heron | https://www.producthunt.com/products/heron | Passive eBPF “Wireshark for agents”; local DuckDB |
| ClawMetry | https://www.producthunt.com/products/clawmetry | Observability for 21+ agent runtimes; claims 90k+ installs; cloud $5/node/mo |

**Implication:** even the *local-first eval* wedge is already on PH in 2026. Do not submit “Langfuse but local.”

HN adjacent: Show HN Cobalt https://news.ycombinator.com/item?id=47091182 ; Verse AI https://news.ycombinator.com/item?id=45914386 — tiny scores.

---

## Cross-cutting notes for OFFGRID product choice

1. **Default Afterhours wow-path (messy GitHub/Linear/email → shippable brief)** sits on top of Granola + Copilot-for-issues + every meeting-notes app. Originality score dies on first judge click unless the *output* is a specific artifact those tools do not produce (e.g. a11y patch pack, visual approve-list, payout exception memo).
2. **Incumbents are not “AI wrappers”; they are distribution.** Cursor bundles Bugbot. GitHub bundles Copilot review/issues. LangChain bundles LangSmith. ClickHouse bought Langfuse. Kong brands OpenMeter. Drata bought SafeBase (unverified amount). Graphite is Cursor-cloud-agent-adjacent.
3. **Do not compete on “we also trace/eval/review.”** Compete on a job whose buyer is one adult, whose demo is a URL, whose switching cost from incumbents is *not* migrating a platform.
4. **Legal/ethical landmines:** accessiBe-style overlays; supply-chain/cyber (OFFGRID rule); meeting bots people hate (Granola’s wedge exists because of that hate).

---

## Source log (primary)

- agent-reach doctor JSON, 21 Sep 2026
- Jina: langfuse.com, langfuse.com/pricing, langfuse.com/blog/joining-clickhouse, langchain.com/langsmith, langchain.com/pricing, braintrust.dev, braintrust.dev/pricing, promptfoo.dev, helicone.ai, chromatic.com, chromatic.com/pricing, coderabbit.ai, coderabbit.ai/pricing, graphite.dev, granola.ai, granola.ai/pricing, mintlify.com, speakeasy.com, stainless.com, buildwithfern.com, browserbase.com, browserbase.com/pricing, elicit.com, openmeter.io, getlago.com, ftc.gov accessiBe PR 2025-01-03, socket.dev, ramp.com
- GitHub `gh repo view` 21 Sep 2026: langfuse/langfuse, promptfoo/promptfoo, confident-ai/deepeval, vibrantlabsai/ragas, Arize-ai/phoenix, Helicone/helicone, truera/trulens, fivetran/great_expectations, Flagsmith/flagsmith, Unleash/unleash, growthbook/growthbook, openmeterio/openmeter, getlago/lago, dequelabs/axe-core, pa11y/pa11y, browserbase/stagehand
- HN Algolia: Langfuse acquisition; CodeRabbit exploit; AccessiBe; stale bots; Granola-adjacent
- GitHub issues: anthropics/claude-code#39980, etcd-io/etcd#21051
- FTC: https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-order-requires-online-marketer-pay-1-million-deceptive-claims-its-ai-product-could-make-websites
- Secondary (labeled in-place): Coverge LLMOps pricing Apr 2026; LLMTools/dreaming.press comparisons; Coderbuds code-review Aug 2026; Webply EAA tracker; Wolfia trust-center guide; Adept Reuters/GeekWire 2024; Product Hunt WebSearch snippets

## agent-reach version

`agent-reach check-update`: current **v1.5.0**, already latest. No update prompt.
