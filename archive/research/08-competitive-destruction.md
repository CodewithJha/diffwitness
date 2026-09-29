# Competitive destruction + failed products

**Date:** 21 September 2026  
**Unknown if not found. Do not invent funding/pricing.**

## How searches were done

Queries mixed `[product] GitHub/open source`, `[problem] automation/AI`, HN Algolia, `gh repo view`, Jina fetches of official posts, FTC, EUR-Lex, PitchBook, Bloomberg, Reuters, Adept blog. Reddit CLI **off**; Reddit threads discovered via search then not fully authenticated. Twitter CLI **not installed**.

## Serious competitors (tables)

Format: Company | URL | Founded | Target | Problem | Workflow | Pricing | Funding | Traction | Tech | AI | Strength | Weakness | Complaints | OSS | Switch | Why choose | Why leave | Our diff

### Langfuse
Langfuse | https://github.com/langfuse/langfuse | Unknown this pass | AI eng | Observe/eval LLMs | Traces, scores | Unknown | Unknown | **34,889** stars (21 Sep 2026), repo hot | OSS platform | Tracing+evals | Open, broad | Dashboard gravity | Unknown this pass | Yes | Medium | Default OSS | Too generic | We should **not** clone traces

### Promptfoo
Promptfoo | https://github.com/promptfoo/promptfoo | Unknown | AI eng | Prompt/agent tests | YAML + CI | Unknown | Unknown | **25,332** stars; README claims OpenAI & Anthropic use (vendor) | CLI/CI | Red team + evals | CI-native | Can be YAML-heavy | Unknown | Yes | Low | Evals in git | UX | Canary Session overlaps

### Helicone
Helicone | https://github.com/Helicone/helicone | YC W23 (README) | AI apps | Observe/cost | Proxy | Unknown | Unknown | **6,168** stars | Gateway | Yes | One-line | Proxy insertion | Unknown | Yes | Medium | Cost+traces | Another hop | Not our wedge

### oasdiff
oasdiff | https://github.com/oasdiff/oasdiff | Unknown | API teams | Breaking OpenAPI | CLI diff | Free OSS | n/a | **1,373** stars | Spec diff | No | Correct layer | CLI not hosted triangle | Unknown | Yes | Low | CI gate | No live/SDK | Spec Triangle wraps this — **fatal wrapper risk**

### Fern
Fern | https://buildwithfern.com/ | Unknown | API companies | Drift of docs/SDKs | Generate from one spec | Unknown | Unknown | Blog Aug 2026 fetched | Codegen | Optional | Right architecture | Vendor lock **INFERENCE** | Unknown | Unknown | High if adopted | Spec-first teams | Price/lock | They already preach the gospel

### axe-core / Deque
axe-core | https://github.com/dequelabs/axe-core | Deque longstanding | Web teams | a11y bugs | Engine | Engine OSS; Deque paid unknown | Unknown | **7,538** stars | Rules engine | No (overlays used AI as marketing) | Standard | Raw violations | Unknown | Yes | Low | CI | Noise | SourceFix is positioning + mapping

### Overlay vendors (accessiBe)
accessiBe | https://www.ftc.gov/.../accessibe | Unknown | Marketing-led web | “WCAG in one line” | Widget | Unknown | Unknown | FTC **$1M** order 22 Apr 2025 | JS overlay + claimed AI | Marketed as AI | Sold the lie | **Does not work**; OFS 1,031 signatories; WebAIM 67%/72% | Disabled users quoted on OFS | Closed | Medium (installed) | Easy checkbox | FTC, users, EAA | **Do not be this**

### CodeRabbit
CodeRabbit | https://www.coderabbit.ai | Unknown | Dev teams | PR review | Comments | **$24–$72/dev/mo** (pricing via Competitor landscape sweep (internal research session)) | Unknown | HN noise + **687-pt** exploit thread https://news.ycombinator.com/item?id=44953032 | LLM comments | Core | Fast comments | Nitpicks; RCE/write-access incident | HN 42484498, 49621594 | Unknown | Low | Catch nits | Mute bot / distrust | Merge Preflight is gates not nits

### HumanLayer
HumanLayer | HN item 42247368 Launch HN YC F24 | 2024 (YC F24) | Agent builders | HITL | API | Unknown | YC | **354** HN points | Approval API | Around agents | Right problem | Infra not demo-wow **INFERENCE** | Unknown | Unknown | Medium | Need approvals | DIY Slack button | Action Receipt: narrative vs log

### Stripe reconciliation
Stripe | https://docs.stripe.com/payouts/reconciliation | 2010s | Merchants | Payout vs bank | Dashboard/reports | Included? Unknown | n/a | Default processor | Ledger objects | No | Source of truth | Manual payouts on you | Unknown | n/a | High | Already on Stripe | Leave Stripe | We cannot win core recon

### Puzzle
Puzzle | https://help.puzzle.io | Unknown | Startups | GL incl. Stripe | Sync + clearing accts | Unknown | Unknown | Help center fetched | Accounting | Unknown | Stripe-aware GL | Unknown residual exceptions | Unknown | Closed | High | Startup GL | Price | Not a 3-week space

### Stampli
Stampli | https://www.stampli.com | Unknown | AP teams | Invoice match | Exception workflow | Unknown | Unknown | Vendor 97%/87% claims | AI extraction + HITL | Yes | Category leader-ish | Vendor metrics | Unknown | Closed | High | AP suite | ERP | **REJECTED** space

### Monte Carlo
Monte Carlo | https://montecarlo.ai | Unknown | Data teams | Data downtime | Monitors + lineage | Unknown | Accel/Redpoint/GGV/ICONIQ/IVP (Business Wire 2023 **vendor press**) | Survey 200 people commissioned | ML monitors | Increasingly agents (their blog) | Category creator | Price; they still had a 379-day bug internally | Unknown | Closed | High | Exec fear | Cost | **REJECTED** to compete

### Great Expectations
GX | https://github.com/fivetran/great_expectations | Unknown; now Fivetran-owned repo | Data teams | Tests on data | Assertions | Unknown | Fivetran | **11,819** stars | Tests | Optional | OSS tests | Not ML observability | Unknown | Yes | Medium | dbt-like tests | Fivetran gravity | Not our wedge

### LaunchDarkly Vega
LaunchDarkly | https://launchdarkly.com/docs/home/flags/manage/flag-cleanup-vega.md | Unknown | Flag users | Flag debt | Auto cleanup PRs | Paid LD | Unknown | Docs fetched | Code + evals | Vega | Owns the loop | Creates the debt | Unknown | Closed | High | Already customer | Price | **REJECTED**

### Datadog Test Optimization / Buildkite Test Engine
Datadog / Buildkite | docs fetched | Unknown | Platform | Flakes | Detect/quarantine | Paid | Unknown | Product pages | Telemetry | Little | Incumbent CI | Price | Unknown | Closed | High | Already in stack | Cost | **REJECTED**

### Westlaw / Lexis / Harvey
Westlaw etc. | Justia/Mata cite them as proper research tools | Long | Lawyers | Research | Search | Expensive Unknown | n/a | Default | Editorial + search | Harvey: genAI | Completeness | Cost; genAI still hallucinates if used as writer | Mata is the complaint against ChatGPT not Westlaw | Closed | Very high | Malpractice insurance | Price | CiteCheck is a *gate* on model output, not a research replacement — they can still add a badge and kill us

### GitHub (issues + Models)
GitHub | https://github.blog/...maintainers... | n/a | Maintainers | Triage | Native + Models recipes | Bundled | n/a | Default forge | Actions | Models | Distribution | Unsolicited bots | Maintainers want on-request (their survey on that page) | n/a | Extreme | Where the issues are | n/a | DupGate **REJECTED**

### Lago / OpenMeter
Lago | https://github.com/getlago/lago | Unknown | Billing | Metering | API | Unknown | Unknown | **10,588** stars | Metering | No | OSS billing | Complexity | Unknown | Yes | Medium | Usage billing | Ops | Token Ledger **REJECTED**

### Otter / Fireflies / meeting bots
Otter | help.otter.ai fetched | Unknown | Meeting-heavy orgs | Notes | Calendar auto-join | Unknown | Unknown | So large orgs document **blocking** | ASR+LLM | Core | Convenient | Consent, spam | Zoom community “how do I disable” | Closed | Low | Notes | Privacy/policy | **REJECTED**

## Failed / talent-drained / discredited products

### Adept (computer-use agent)
- **URL:** https://www.adept.ai/blog/adept-update/ (28 Jun 2024)
- **What:** General workplace agents on multimodal models.
- **Failure mode:** Co-founders + team to Amazon AGI; Amazon licensed agent tech, models, datasets; Adept “focus entirely on solutions that enable agentic AI” under new CEO. Reuters compared to Inflection/Microsoft.
- **Appeared valuable:** Beta in “mission-critical production,” “dozens of steps.”
- **Why anyway:** Foundation-model fundraising vs product; platform companies absorb talent.
- **Lesson:** Do not build generic computer-use for OFFGRID.

### Inflection / Pi
- **URL:** CMA full text https://assets.publishing.service.gov.uk/media/6719ff5f549f63039436b3c8/__Full_text_decision__.pdf ; Reuters ~$650M (source, not CMA figure)
- **What:** Consumer companion AI.
- **Failure mode:** Microsoft hired almost all team (CMA) 19 Mar 2024; Inflection pivoted to studio/API.
- **Lesson:** Consumer chatbot is not a wedge; talent deals are the exit.

### Humane Ai Pin
- **URL:** https://support.humane.com/hc/en-us/articles/34374173951373-Important-Update-for-Consumer-Ai-Pin-Customers ; HP press 18 Feb 2025 $116M
- **What:** Wearable AI.
- **Failure mode:** Sales stopped; devices lose cloud features 28 Feb 2025 12:00 PST; data deleted; refunds only last 90 days (TechCrunch).
- **Lesson:** Hardware + cloud-dependent demo. Brick risk. Not us.

### Builder.ai
- **URL:** Bloomberg 20 May 2025 insolvency; FT creditor list (AWS ~$88M, Microsoft ~$30M)
- **What:** “App as easy as ordering pizza.”
- **Failure mode:** Cash seizure; reported revenue overstatement (Bloomberg sources: ~$220M forecast vs ~$50M). Round-tripping **alleged**, not adjudicated in fetched pages. SDNY document request reported.
- **Lesson:** AI wrapping of services + fake traction. Judges will smell “AI builds your app.”

### accessiBe overlay
- **URL:** FTC 3 Jan 2025 proposed; **22 Apr 2025 final** $1M
- **What:** AI widget → WCAG.
- **Failure mode:** Deceptive claims + undisclosed reviews (FTC allegations in press).
- **Lesson:** Do not sell automated compliance.

### Mutable.ai
- **URL:** PitchBook acquired/merged 11 Dec 2024 by Google
- **What:** AI docs/autocomplete.
- **Failure mode:** Acqui-hire / merge; independent product ended as a company. Secondary wiki claims site dark — **low reliability**.
- **Lesson:** Coding assistant crowding.

### Sweep (sweep.dev) — original issue-to-PR **sunset**; JetBrains **pivot**
- **Primary (not Artificialus):** Failed products postmortems (internal research session) fetched GitHub `sweep.dev` repo: **not archived**, last push **18 Sep 2025**, **7,711** stars, README: now a JetBrains assistant; founders on HN: throughout 2024 **almost all users moved to Cursor**; original GitHub-agent form abandoned.
- **Do not use:** Artificialus “discontinued April 2026 without notice” — aggregator, conflicts with the live JetBrains-positioned repo.
- **Name collision:** A different Israeli GTM company named Sweep was reported acquired by ServiceNow in 2026 (Ctech/CRN).
- **Lesson:** Kill “AI that opens PRs.” Sweep’s own story is users left for Cursor.

### Magician (Diagram) — Figma plugin sunset
- **URL:** https://www.figma.com/blog/ai-the-next-chapter-in-design/ (21 Jun 2023 Figma acquired Diagram). Forum: plugin no longer available.
- **Lesson:** Host-app plugins die inside the host.

### Rewind → Limitless Pendant → Meta
- **Evidence:** Parallel sweep: Meta acquisition; Pendant sales stop; Rewind capture disabled **19 Dec 2025**; EU/UK cutoff + deletion. HN: users deleting data rather than give Meta a lifelog.
- **Lesson:** Always-on capture and hostage archives. Local-first that later phones home is Rewind’s ending.

### Humanloop (LLM evals / prompt platform)
- **URL:** https://humanloop.com/ (copy: joins Anthropic, sunsets platform); HN 17 Jul 2025 item 44592216 (customer email: sunset **8 Sep 2025**, data deleted after) — documented in parallel sweep `research/_raw-failures.md`.
- **What:** YC S20 evals/prompt/logging.
- **Failure mode:** Anthropic hiring + **explicit product kill**. Independent eval dashboard is easy to sunset in an acquihire.
- **Lesson:** Do not make OFFGRID “LangSmith-but-smaller.” Labs bundle then delete the login.

### AgentGPT (Reworkd)
- **URL:** https://github.com/reworkd/AgentGPT — **archived**, **36,289** stars, last push 29 Apr 2025 (`gh` in parallel sweep).
- **Lesson:** Viral “name a goal” agents are a museum. Stars ≠ a job.

### gpt-engineer
- **URL:** https://github.com/AntonOsika/gpt-engineer — archived precursor to Lovable; **55,091** stars (parallel sweep).
- **Lesson:** Unopinionated “AI writes a codebase” is an experiment, not a wedge.

### Bench (bookkeeping)
- **URL:** TechCrunch 27 Dec 2024 shutdown leaving customers without books; later distressed sale; ~$65M liabilities (TC 16 Jan 2025). Parallel sweep `_raw-failures.md`.
- **Lesson:** Do not hostage user records. SMB books is a real job with **lethal** ops/trust; Puzzle/Stripe recon is not a 3-week demo.

### Meeting notetakers (class, not one failure)
- Not dead as businesses; **dead as a greenfield idea** because the new workflow is blocking them (Teams, Zoom community).

## Failure patterns that should kill similar OFFGRID ideas

1. **Generic agent / computer use** (Adept).
2. **Hardware** (Humane).
3. **“AI builds the app”** (Builder.ai).
4. **Compliance theater** (accessiBe).
5. **Incumbent-bundle jobs** (flags, flakes, traces, notes, copilots).
6. **Unsolicited bots** (CodeRabbit noise, meeting bots, issue bots).
7. **Talent-deal “startups”** (Inflection, Adept) — not a path for a solo builder anyway.
8. **Acquihire then sunset** (Humanloop) — customers lose the eval UI they built on.
9. **Viral generic agent** (AgentGPT 36k★ archived) — stars ≠ retention.

## Source conflicts inside this file

- Inflection dollars: Reuters/Bloomberg **source**; CMA redacts amounts.
- Builder.ai fraud: press **allegations**.
- Sweep **issue-to-PR** sunset vs JetBrains **pivot** (README + HN) vs Artificialus “April 2026 discontinued” (do not treat aggregator as fact) vs Israeli Sweep/ServiceNow (different company).
- Monte Carlo funding/survey: **their** press.
- Promptfoo “used by OpenAI and Anthropic”: README claim.
