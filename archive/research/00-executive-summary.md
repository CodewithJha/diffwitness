# HACK47 OFFGRID Research Summary

**Date:** 21 September 2026  
**Method:** Synthesis of files already on disk (`research/01`–`10`, `_product-findings-for-exec.md`, `sources.md`, `sources-hackathon.md`). Facts are from those files. Inferences are labeled. Unknowns stay Unknown. **No product winner.** **Do not start product code.**

---

## 1. Hackathon intelligence

**FACT (Devpost primary pages, 21 Sep 2026):** HACK47: OFFGRID is an online public contest (challenge id 31035). Submission window **15 Sep 2026 04:00 UTC → 15 Oct 2026 04:00 UTC**. Header deadline: 15 Oct 2026 04:00 UTC. Winners: **25 Oct 2026 13:00 UTC**. Judging start: **blank / unpublished**. **87** registered participants (nav + org listing; not a named roster). **1 winner, 1 non-cash prize.** Named judges: none (“Looking for judges”). Gallery unpublished. Updates: none beyond placeholder. Organizer contact: hello@hack47.org. Founders: Rishul Chanana, Pratyush Pandey ([hack47.org](https://hack47.org/)).

Prize published as **Hack47 Next Cohort — $10,000 OpenAI Credits + Red Bull Supply**: $10k OpenAI credits, next Hack47 cohort seat, one month of Red Bull Supply, plus unspecified extra sponsor perks. Page labels it a **non-cash prize**; `div.prize-value` is **empty** (this research did **not** observe a displayed `$0`). Sponsors shown: OpenAI, Red Bull. Gallery has a sponsor-prize filter for this prize → **INFERENCE:** prize is opt-in on the submit form (Devpost article 132 mechanism). Confirm on the live form.

**Date conflicts (do not flatten):** Rules body still says the timeline “will be announced.”

**What to submit (OFFGRID):** name, 1–2 sentence description, problem, solution, demo link (“whenever possible”), source, demo video (length **unspecified**), tech stack, build process (during OFFGRID vs next). Working prototype “whenever reasonably possible.” Disclose third-party tech / APIs / models / OSS: **must**. Created during the designated period: **must**. AI tools including Cursor / Claude Code: **allowed**. No fixed theme, no mandatory stack; blockchain and hardware are **explicitly allowed** on the OFFGRID page (not building them is strategy, not a ban).

**No prior Hack47 Devpost event** (“Showing 1 hackathon”). No public OFFGRID submissions or winners found. X/Instagram not inspected (fetch failed / login wall). No email was sent to organizers.

---

## 2. What the judges appear to value

**FACT — six unweighted criteria:** Originality, Impact, Execution, Product Thinking, Technical Depth, Potential. Published: you don’t need the most complicated project; not most lines of code or buzzwords. CRUD/tutorial is discouraged. AI is fine if disclosed. Demo is strongly recommended.

**FACT — house / LinkedIn aesthetic (not OFFGRID rules):** live software only; no slides; no pitch decks; no “Uber of”; show repos; “build what you want to exist”; “build something worth continuing after it.”

**INFERENCE (not a rule):** with ~87 registrants and unnamed judges, a clickable HTTPS demo beats a mission-statement video. One painful job for a real user beats a platform. Technical depth ≠ many models. Youth-founder copy may bias the *house*; written OFFGRID rules are age-open. A localhost-only demo is not named as a disqualifier but is a practical Execution fail.

---

## 3. Important rules and constraints

- Submit by **15 Oct 2026 04:00 UTC**; plan to submit **14 Oct**. Keep demo live through **25 Oct 2026**.
- Project **must be created for OFFGRID** in the designated window. Existing libraries OK. Do not submit an existing project with minimal changes.
- Disqualifiers stated: late, plagiarism, malware, illegal/intentionally harmful content, third-party terms violations.
- Solo is OK in written rules.
- Hosted demo URL is a **practical** requirement (INFERENCE from 01 + 09). Local-first = honest about what leaves the browser, not localhost-only.
- Disclose AI tools used to build or run.
- Prize checkbox: treat as operationally required for the only prize; confirm on form.
- **Do not** start heavy product code before remaining investigations (this research’s conclusion). Calendar in repo briefings: think-only until ~30 Sep unless the user explicitly overrides.
- Do not build Web3/cyber as *this repo’s* strategy even though OFFGRID allows blockchain.

---

## 4. Major market/product patterns discovered

The market is **full of generators** and **full of dashboards**. Relatively less full of **boring verifiers with receipts**. That does **not** automatically make a verifier win OFFGRID: incumbents can add a checkbox, and a 3-week demo can look like a weekend CLI wrapper.

**Clusters (from `02`):**

- **A — Verification of machine output** (strongest *new* pain): Mata v. Avianca fake ChatGPT cites; Hamel evals (60–80% of work is looking); Zheng et al. LLM-as-judge bias; agent actions that succeed and still destroy; 33k agent-PR study (arXiv:2601.15195). Eval SaaS is saturated (Langfuse **34,889★**, Promptfoo **25,332★**, Helicone **6,168★**, plus LangSmith / Braintrust; Humanloop **sunset 8 Sep 2025**).
- **B — Silent money/data/contract mismatches:** real pain, expensive incumbents (Monte Carlo, Stripe reports, AP suites, Fern/oasdiff). Vendor-commissioned stats stay labeled.
- **C — Maintainers, flags, tests, a11y:** real, incumbent-owned. Overlay class **failed** (Overlay Fact Sheet **1,031** signatories this fetch; FTC accessiBe **$1M** 22 Apr 2025; EAA after **28 Jun 2025**).
- **D — Graveyards:** Adept (Amazon talent/license), Inflection (Microsoft hire; Reuters ~$650M is a *source*, CMA redacts), Humane Ai Pin bricked, Builder.ai insolvency (fraud **alleged**), AgentGPT **36,289★ archived**, gpt-engineer **55,091★ archived**, Bench shutdown (hostage books). Sweep AI Apr 2026 shutdown **unverified**.

**Avoid as OFFGRID bets:** generic chat/RAG, copilots, meeting notetakers (orgs now **block bots**), LLM observability dashboards, data observability SaaS, AP suites, flag platforms, flake platforms, trust-center questionnaires, overlays, usage billing (Lago **10,588★**).

**Mechanisms still product-shaped (INFERENCE in `03`):** contract diff, long-session replay/canary, append-only receipts, HTTP/DOI/docket existence probes, axe tree inspection, financial identity keys — not NLP “match.”

**Scaffold Afterhours notes→brief is REJECTED** as generic productivity. ChatGPT already does the 20-second demo. Product-without-AI is a template.

---

## 5. Top problem opportunities

32 problems documented (`05`). **12 REJECTED.** **14 KEEP** for synthesis (not winners). **6 weak/low-confidence keep.** None is a proven company.

Strongest remaining *problem shapes* (not ranked as a pick):

1. AI-written citations/quotes/URLs that do not exist (Mata — court-documented).
2. Destructive agent actions with no independent receipt (success ≠ safety).
3. Silent long-session agent regression (Hamel; eval dashboards don’t replace looking).
4. Spec vs live API vs SDK drift (404 vs green spec).
5. Agent PRs that fail to merge for socio-technical reasons (33k-PR study).

Other KEEP problems (citations, eval looking, judge bias, a11y overlay lie, maintainer triage, Stripe recon, docs drift, metric disagreement, PDF tables, semver lies) remain crowded, slow-buyer, or demo-fragile. Weak keeps (analytics lint, Dependabot noise, runbook rot, screenshot DLP, eval contamination, CODEOWNERS rot) lack evidence or look like a GitHub Action.

---

## 6. Top product concepts

32 concepts (`06`). **21 REJECTED.** **8** marked “investigate further.” **3** thin. **Top 10** scored in `07` (demo-first, not a winner formula). **Five least-dead investigations** in `10` (not a product pick):

| Rank in top 10 | Concept | 10s line |
|---|---|---|
| 1 | **CiteCheck** | Checks whether citations in an AI-written brief actually exist |
| 2 | **Action Receipt** | Records what the agent ran, not what it claimed |
| 3 | **Canary Session** | Replays a golden long agent session after a config change |
| 4 | Trace Autopsy | Makes you look at ~100 traces (Hamel’s job) |
| 5 | **Spec Triangle** | Shows when spec, live API, and SDK disagree |
| 6 | **Merge Preflight** | Blocks agent PRs the data says won’t merge |
| 7 | SourceFix | Finds a11y bugs in source; will not sell a WCAG badge |
| 8 | SQL Grain Diff | Why two revenue queries disagree, without a warehouse |
| 9 | Docs Click | Clicks getting-started; fails when the button is gone |
| 10 | Honest Patch | Catches a “patch” that deletes an export |

**Bold = five survivors.** Trace Autopsy / SourceFix / SQL Grain Diff / Docs Click / Honest Patch did not survive the last kill filter (dashboard/spreadsheet, Lighthouse, homework, flake, api-extractor). Afterhours notes→brief scored last and is **not** shortlisted.

---

## 7. Competitive landscape

Existing competition scores are **high (bad)** for almost every interesting problem. Killers: **incumbent bundling** (GitHub, Microsoft, Stripe, LaunchDarkly, Datadog, Deque, LangChain, Westlaw/Harvey) and **OSS CLIs** (oasdiff, axe, promptfoo) that make a hosted demo look like a wrapper.

**Strongest named competitor per survivor:** CiteCheck → Westlaw/Harvey (badge risk). Action Receipt → HumanLayer (Launch HN **354**) + IDE vendors. Canary Session → Promptfoo (**25,332★**). Spec Triangle → oasdiff (**1,373★**) + Fern. Merge Preflight → GitHub branch protection.

Langfuse **34,889★**, acquired by ClickHouse (`04`; amount Unknown). Humanloop sunset after Anthropic hire. CodeRabbit: HN noise; `04` records **$24–$72/dev/mo** from a parallel site sweep; `08` left pricing **Unknown** (site not fully fetched). Overlay vendors: do not be this. Monte Carlo / Stampli / Lago / Otter-class: REJECTED spaces.

---

## 8. Concepts rejected and why

**Afterhours (scaffold default):** generic productivity; ChatGPT already demos it; fails originality and product-without-AI.

Class kills with named incumbents/failures: generators/copilots (Adept, AgentGPT, gpt-engineer), meeting notetakers (Teams/Zoom blocking), overlays (FTC + OFS), AP suites (Stampli/Ramp), flag cleanup (LaunchDarkly Vega), flakes (Datadog/Buildkite), metering (Lago/OpenMeter), questionnaires (Vanta-class / compliance theater), Monte Carlo-class DQ, DupGate (GitHub-owned; Tidelift shows burnout not WTP), Payout Exceptions as default (sensitive data + Stripe/Puzzle), Judge Swap as a company (Promptfoo feature), TrackLint/SRM/Breaking Bump/Runbook Lint/Owner Diff/Pixel Cop/GPU Watch (wrapper, homework, incumbent, or no evidence).

**21 of 32 concepts REJECTED.** See `06` IDs 3, 8–12, 15–20, 22–24, 26, 28–32.

---

## 9. Five surviving candidates

Investigations only. They survived because they were **less dead**, not because they are obviously winning. Shared shape: **verification, gates, receipts**, public fixtures, hosted 20-second wow, **low AI leverage on purpose**.

1. **CiteCheck** — Mata is a federal sanctions opinion. Gatekeeping, not writing. Kill: Harvey badge, false reds, “it’s search.”
2. **Action Receipt** — Successful destructive calls + lying narrator; APM-blind. Kill: HumanLayer / IDE logs already good; mock-agent looks fake.
3. **Canary Session** — Hamel: looking beats dashboards; short evals miss long sessions. Kill: Promptfoo overlap; flake on judging day. Official Anthropic 2026 postmortem **unconfirmed**.
4. **Spec Triangle** — 20-second 404 vs green spec. Kill: view-source `npx oasdiff`.
5. **Merge Preflight** — 33k agent-PR heuristics; gates not CodeRabbit nits. Kill: looks like a linter; GitHub App timing.

**Strongest honest conclusion (`10`):** no sufficiently strong, uncrowded opportunity that is also a 3-week hosted demo *and* a post-hackathon company.

---

## 10. Critical unknowns

- Prize opt-in checkbox, OpenAI credit issuance/expiry, Red Bull fulfillment, tax/KYC.
- Named judges and judging start date.
- CiteCheck: lawyer willingness to paste drafts; CourtListener rate limits; false reds / reporter collisions; pinpoint quote accuracy.
- Action Receipt: whether Cursor / Claude Code / Codex already expose a trustworthy tool log.
- Canary Session: 10/10 reliable fail on one config knob in a scripted runtime.
- Spec Triangle: a single visual oasdiff cannot match in 20 seconds.
- Merge Preflight: heuristics vs 20 real agent PRs; GitHub App review delay.
- Whether judges value **verifiers over generators** given an OpenAI-credits prize.
- Sweep AI Apr 2026 shutdown: **unverified**. Official Anthropic quality postmortem: **not found**. Independent 2026 TAM for “AI evals”: **Unknown**.

---

## 11. Recommended next research steps

No product code. Time-boxed probes only:

1. CiteCheck: CourtListener lookup of *actual* Mata fake reporter numbers vs real cases; 3 lawyer conversations; rate limits.
2. Action Receipt: inspect current coding-agent tool logs; stop if they already show a trustworthy receipt.
3. Canary Session: fail a canary by changing one documented config knob, 10/10, in a scripted harness.
4. Spec Triangle: find a 20-second visual oasdiff cannot match, or drop.
5. Merge Preflight: replay paper quantitative rules on 20 public agent PRs.
6. Confirm prize checkbox on the live Devpost submit form (login; not inspected this pass).

---

## 12. Sources

Primary logs (pages actually fetched 21 Sep 2026):

- `research/sources-hackathon.md` — Devpost, hack47.org, LinkedIn company/posts, Devpost help, GitHub organizer site.
- `research/sources.md` — Mata, Hamel, Zheng, Overlay Fact Sheet, FTC, EAA, Adept/Inflection/Humane/Builder.ai, star counts, Stripe, LaunchDarkly, HumanLayer, arXiv:2601.15195, Humanloop, AgentGPT, gpt-engineer, Bench.

Most important URLs: [hack47-offgrid.devpost.com](https://hack47-offgrid.devpost.com/), [rules](https://hack47-offgrid.devpost.com/rules), [dates](https://hack47-offgrid.devpost.com/details/dates), [hack47.org](https://hack47.org/), [Mata Justia](https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1:2022cv01461/575368/54/), [Hamel evals](https://hamel.dev/blog/posts/evals/), [arXiv:2306.05685](https://arxiv.org/abs/2306.05685), [Overlay Fact Sheet](https://overlayfactsheet.com/en/), [FTC accessiBe](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million), [Adept update](https://www.adept.ai/blog/adept-update/), Langfuse/Promptfoo/oasdiff GitHub.

Workstream files synthesized: `01`–`10`, `_product-findings-for-exec.md`. Raw dumps (`_raw-*.md`) used only as already promoted into those files.

---

After attempting to kill these opportunities, these are the few problems that still appear worth investigating, this is the evidence supporting them, this is what could invalidate them, and this is what we need to learn before writing a single line of product code.
