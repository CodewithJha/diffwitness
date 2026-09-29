# HACK47 OFFGRID: Deep Research Report

**Date:** 21 September 2026  
**Synthesized from files on disk.** FACT vs INFERENCE labeled. Unknown stays Unknown. **No product winner. Do not start product code.**

---

## A. Hackathon Intelligence

**FACT (inspected 21 Sep 2026):** HACK47: OFFGRID is an online, public Devpost contest (challenge id 31035). Tagline on the overview: “A month to do great work, surrounded by great builders.”

| Item | What the primary page says |
|---|---|
| Submission window | 15 Sep 2026 04:00 UTC → 15 Oct 2026 04:00 UTC |
| Header deadline | 15 Oct 2026 04:00 UTC |
| Alternate display | “October 15 at 12:00am EDT” (same instant) |
| Winners | 25 Oct 2026 13:00 UTC |
| Judging start | **Blank** on the dates table — unpublished |
| Field | **87** registered participants (nav + org listing; not submissions, not a named roster) |
| Prize | 1 non-cash prize, 1 winner |
| Judges | None named. “Looking for judges” + hello@hack47.org |
| Gallery / updates | Unpublished / none beyond placeholder |
| Contact | hello@hack47.org |
| Founders | Rishul Chanana, Pratyush Pandey ([hack47.org](https://hack47.org/)) |
| LinkedIn | https://www.linkedin.com/company/hack47 |

**Date / copy conflicts (do not flatten):**

1. Rules body still says the official timeline “will be announced.” Header and `/details/dates` already publish the window above. Submit to the **clock**.
2. Stale search snippets showed 52 or 59 participants. Live page: **87**.

*[Redacted before public release: personal eligibility notes.]*

**What to submit:** project name; 1–2 sentence description; problem; solution; demo link (“whenever possible”); source (GitHub/GitLab); demo video (show it working; **duration unspecified**); tech stack; build process (what was built during OFFGRID vs what you’d improve next). Working prototype “whenever reasonably possible.” Disclose major third-party technologies, APIs, models, OSS: **must**. Created during the designated period: **must**.

**AI:** allowed, including Cursor / Claude Code / generative AI. Be transparent. No published AI-usage % or ethics form.

**Prize:** “Hack47 Next Cohort — $10,000 OpenAI Credits + Red Bull Supply.” Body: $10,000 in OpenAI credits, guaranteed next-cohort seat, one month of Red Bull Supply, plus additional credits/tools/perks from the sponsor network. Page label: **1 non-cash prize**. `div.prize-value` **empty** (do not cite a displayed `$0` — that was not observed). Gallery filter for this prize exists → **INFERENCE:** opt-in checkbox; if unchecked you may be out of the only prize pool. Unknowns: credit issuance product/org, expiry, transferability, Red Bull geography, tax/KYC.

**Prior events:** Devpost org listing “Showing 1 hackathon” — only OFFGRID. No public winners found. House applicants named in public posts (Narayan Thakur, Milan Sampath) are **not** OFFGRID winners. GitHub `maximally0/Hack47` is the organizer website. X/Instagram **not inspected** (403 / login wall). No email was sent.

**Disqualifiers stated:** after deadline; existing project with minimal changes; plagiarism; malware; illegal content; intentionally harmful functionality; third-party terms. **Not** stated as disqualifiers: using AI, solo, blockchain (explicitly allowed), lack of theme-fit (no fixed theme), not being in the house.

---

## B. Organizer Philosophy

**Quoted OFFGRID (Devpost):** “Don’t build what you’re supposed to build. Build what you want to exist.” “Don’t build for the hackathon. Build something worth continuing after it.” “You don’t need the most complicated project to win.” “Build something people remember.” They encourage: real problem, clear target user, unconventional, technology used meaningfully, **beyond tutorial/CRUD**, functional prototype, product thinking, could become a product/startup/OSS. **No fixed theme. No mandatory stack.** Blockchain and hardware are allowed on the OFFGRID page.

**Quoted house (hack47.org — not OFFGRID rules):** live software only; if it cannot be shown running it does not get shown; no equity; “demo, not slides”; “Proximity is the whole product.” LinkedIn About: no slides, no pitch decks, no “we’re the Uber of,” show repos and shipped products. Rishul on speed: if you’re building the wrong thing, shipping faster is getting to the wrong answer quicker.

**Judging (FACT):** Originality, Impact, Execution, Product Thinking, Technical Depth, Potential — **unweighted**. Not most LoC, buzzwords, or most complicated stack. Overview widget duplicates Potential (config duplicate, not a seventh criterion).

**INFERENCE for a remote judge:** clickable demo beats a pitch; one painful job; git history that looks like a build; technical depth = used thoughtfully, not many models. These are strategy, not rules.

---

## C. Market & Technology Landscape

Professionals currently use **generators** (ChatGPT, copilots, notetakers) for summarization and code, **comment bots** for PRs, **dashboards** for “did the AI get worse,” **lookup tools** (Westlaw, CourtListener, Crossref) for citations, **observability/ERP** for money and data, **CLI/codegen** for API contracts, and **widgets that failed** for accessibility.

**Category crowding (death ratings for a 3-week solo):** generic chat/RAG; coding copilots; meeting notetakers; LLM observability (Langfuse 34,889★, Promptfoo 25,332★, Helicone 6,168★, DeepEval 18,367★, Ragas 15,804★, Phoenix 11,562★, closed LangSmith / Braintrust; Humanloop sunset); data observability (Monte Carlo and peers; GX 11,819★, Fivetran-owned repo); AP suites; feature-flag platforms; flake platforms; trust-center questionnaires; accessibility overlays; usage billing (Lago 10,588★, OpenMeter 2,327★).

**Less crowded but not empty (still kill-tested later):** citation/URL/DOI/case existence as a *verifier*; independent non-model-authored audit log + approval for destructive tools; error-analysis UX for ~100 traces rather than scores; hosted spec-vs-live-vs-SDK triangle; source-level a11y CI that **refuses** to claim WCAG/EAA.

**Where AI is a costume:** “shippable brief from notes” dies if you remove the LLM. Overlay “compliance” remaining JS is harmful. Uncalibrated LLM-as-judge is a biased rater (Zheng et al.). Citation existence, OpenAPI diff, axe CI, payout-ID match still work without an LLM.

**Hackathon constraint:** public demo URL required in practice. Local-first = sample in browser, optional model disclosed, no silent training. Sensitive domains need **public fixtures** (Mata cites, toy OpenAPI, known-bad HTML, public PRs) — not customer Gmail.

**Landscape conclusion:** relatively fewer **boring verifiers with receipts**. Incumbents can still add a checkbox; a 3-week demo can still look like a weekend wrapper.

---

## D. 30+ Real Problems

32 problems in `research/05-problem-opportunities.md`. Count table there: **14 KEEP** (IDs 1–9, 13, 14, 21, 25, 27), **6 weak keep** (15, 17, 18, 22, 23, 24), **12 REJECTED** (10–12, 16, 19, 20, 26, 28–32). Additional class-level rejects not numbered: overlays-as-product, hardware AI, RAG chatbot.

“SURVIVED investigation” = not heading-tagged REJECTED (includes weak keeps). One-line “why” = the file’s kill reason or main objection.

| # | Problem (one line) | Status | Why |
|---|---|---|---|
| 1 | Silent LLM/agent quality regression (200s while behavior worsens) | SURVIVED | Langfuse 34.9k★; providers may ship postmortems; 3-week tool looks like a wrapper |
| 2 | Teams install eval products and watch 1–5 scores instead of looking at traces | SURVIVED | Excel may be enough; LangSmith can copy UX |
| 3 | LLM-as-judge evals are biased (position, verbosity, self-preference) | SURVIVED | Looks like a research demo; Promptfoo can add swap CI |
| 4 | Cannot tell if citations/quotes/URLs in AI memos exist | SURVIVED | Westlaw/Harvey badge risk; slow legal buyers; search-box demo |
| 5 | Agents take irreversible actions with no independent record | SURVIVED | IDEs/HumanLayer may ship this; infra not wow |
| 6 | OpenAPI vs live vs SDK drift → client 404s | SURVIVED | Weekend oasdiff wrapper; Fern sells the architecture |
| 7 | Orgs buy a11y overlays that do not make sites accessible (EAA now applies) | SURVIVED | Looks like Lighthouse; the lie still sells |
| 8 | OSS maintainers drown in dups / triage; unpaid; considering quitting | SURVIVED | GitHub copies it; maintainers don’t pay |
| 9 | Stripe payouts vs bank vs GL don’t line up | SURVIVED | Trust + integrations + incumbents; bad hackathon data story |
| 10 | AP 3-way match exceptions (invoice ≠ PO ≠ receipt) | **REJECTED** | Cannot beat Stampli/Ramp in 3 weeks; CRUD+OCR |
| 11 | Stale feature flags remain in code | **REJECTED** | Incumbent (LaunchDarkly Vega) owns the cleanup loop |
| 12 | Flaky tests destroy CI confidence | **REJECTED** | Crowded infra (Datadog / Buildkite) |
| 13 | Docs/changelog describe a UI that no longer exists | SURVIVED | Browser automation flakes in judging; looks like QA |
| 14 | Two dashboards, two numbers; no owner | SURVIVED | Enterprise sales; not a 3-week product |
| 15 | Analytics taxonomy breaks (renames, missing properties) | SURVIVED (weak) | Looks like a lint rule; weak evidence this pass |
| 16 | A/B tests underpowered or sample-ratio mismatch | **REJECTED** | Crowded; weak primary evidence |
| 17 | Dependabot/Renovate noise hides true breaking upgrades | SURVIVED (weak) | Looks like Renovate config; weak evidence |
| 18 | On-call runbooks rot (restart X but X was deleted) | SURVIVED (weak) | No hard evidence this pass |
| 19 | Vendor security questionnaires steal weeks | **REJECTED** | Crowded; AI-answering questionnaires is compliance theater |
| 20 | Cannot attribute LLM spend to customer/feature | **REJECTED** | Solved as OSS category (Lago/OpenMeter/Helicone) |
| 21 | PDF tables extract wrong line items with silent confidence | SURVIVED | Looks like a Document AI wrapper; weak unique evidence |
| 22 | Screenshots/replays leak PII into tickets and prompts | SURVIVED (weak) | Weak evidence; crowded DLP |
| 23 | Eval datasets leak into training; scores contaminated | SURVIVED (weak) | Research tool; not a weekly professional job |
| 24 | CODEOWNERS / ownership rot | SURVIVED (weak) | No evidence; looks like a GitHub Action |
| 25 | Changelogs and semver lie (a “patch” removes a field) | SURVIVED | Language-specific OSS exists; wrapper risk |
| 26 | Implemented UI ≠ Figma | **REJECTED** | Crowded visual regression |
| 27 | Agent PRs fail to merge for socio-technical reasons | SURVIVED | GitHub will add agent PR policies; research-shaped |
| 28 | Silent warehouse bugs corrupt metrics | **REJECTED** | Competing with Monte Carlo |
| 29 | GPU/training jobs idle or retry wastefully | **REJECTED** | No evidence pass; not demoable in a browser well |
| 30 | Meetings need notes and action items | **REJECTED** | Generic productivity + privacy backlash (orgs block bots) |
| 31 | Messy GitHub/Linear/email notes → shippable brief (Afterhours default) | **REJECTED** | Generic productivity; fails originality; fails product-without-AI |
| 32 | Need a generic coding copilot / issue-to-PR agent | **REJECTED** | Forbidden-generic + graveyard (Adept / AgentGPT / gpt-engineer) |

---

## E. 30+ Product Concepts

32 concepts in `research/06-product-concepts.md`. Count table: **8 investigate further**, **3 thin**, **21 REJECTED** (IDs 3, 8–12, 15–20, 22–24, 26, 28–32).

| # | Name | One-line | Status |
|---|---|---|---|
| 1 | **Canary Session** | Replay a 30-minute golden agent session after prompt/model/CLI change | Investigate (top 5) |
| 2 | Trace Autopsy | Open-coding UI for ~100 traces; export assertions | Investigate (dropped from top 5) |
| 3 | Judge Swap CI | CI fails if LLM-as-judge flips winners when answers swap | **REJECTED** — research demo; Promptfoo feature |
| 4 | **CiteCheck** | Paste a memo; probe case/DOI/URL existence and quote-at-pinpoint; no drafting | Investigate (top 5) |
| 5 | **Action Receipt** | Agent-unwritable log + approval; compare receipt vs the agent’s story | Investigate (top 5) |
| 6 | **Spec Triangle** | OpenAPI vs production responses vs SDK surface | Investigate (top 5) |
| 7 | SourceFix | axe findings → component repro; **refuses WCAG/EAA certification** | Investigate (dropped from top 5) |
| 8 | DupGate | Maintainer-triggered duplicate finder; silent until clicked | **REJECTED** — GitHub-owned; no WTP |
| 9 | Payout Exceptions | Match Stripe `po_xxx` to bank lines; queue unmatched | **REJECTED** as OFFGRID default — sensitive data + incumbents |
| 10 | Billy Junior | Invoice 3-way match toy | **REJECTED** — tutorial CRUD+OCR |
| 11 | Flag Reaper | Delete stale flags | **REJECTED** — LaunchDarkly incumbent |
| 12 | Flake Pack | Evidence pack for a flaky test | **REJECTED** — Datadog/Buildkite |
| 13 | Docs Click | Playwright getting-started against staging | Thin (top 10; flake risk) |
| 14 | SQL Grain Diff | Paste two revenue queries; show grain/join double-count | Investigate (dropped from top 5) |
| 15 | TrackLint | PR linter for analytics events vs tracking plan | **REJECTED** — weak evidence; lint rule |
| 16 | SRM Lamp | Sample-ratio mismatch checker | **REJECTED** — stats 101 |
| 17 | Breaking Bump | Fail Dependabot only when exported API breaks | **REJECTED** — polyglot OSS exists |
| 18 | Runbook Lint | CI that runbook URLs/commands still exist | **REJECTED** — no evidence; wrapper |
| 19 | Questionnaire Autofill | LLM fills SIG/CAIQ | **REJECTED** — compliance theater |
| 20 | Token Ledger | Cost per customer for LLM calls | **REJECTED** — rebuild Lago |
| 21 | Box Confirm | PDF extraction with per-cell box + human confirm; no single accuracy number | Thin |
| 22 | Paste Guard | Redact secrets in screenshots before clipboard leave | **REJECTED** — weak evidence; crowded DLP |
| 23 | Canary Eval | Private canary strings to detect contamination | **REJECTED** — not the hackathon buyer |
| 24 | Owner Diff | CODEOWNERS vs IdP | **REJECTED** — GitHub Action |
| 25 | Honest Patch | Compare published package versions; fail if a “patch” removes exports | Thin (top 10) |
| 26 | Pixel Cop | Figma vs impl screenshot | **REJECTED** — clone of visual regression |
| 27 | **Merge Preflight** | Block agent PRs predicted not to merge (size, tests, dup, CI) | Investigate (top 5) |
| 28 | Mini Carlo | Warehouse monitors | **REJECTED** — enterprise / Monte Carlo |
| 29 | GPU Watch | Idle GPU alerts | **REJECTED** — not a browser demo |
| 30 | Yet Another Notetaker | Meeting notes | **REJECTED** — privacy backlash |
| 31 | Afterhours (scaffold default) | Notes → shippable brief | **REJECTED** — originality = 0 |
| 32 | Copilot Clone | Generic coding agent | **REJECTED** — graveyard |

---

## F. Competitive Landscape

Category-level (`04`) plus named destruction (`08`). Star counts are `gh` as of **21 Sep 2026**. Unknown ≠ zero.

**LLM evals — saturated.** Langfuse 34,889★, acquired by ClickHouse (`04`; amount Unknown). Promptfoo 25,332★ (README claims OpenAI & Anthropic use — vendor). Helicone 6,168★, YC W23. LangSmith Plus **$39/seat/mo** (`04` pricing page). Braintrust Pro **$249/mo** (`04`). Humanloop **sunset 8 Sep 2025** after Anthropic hire. Gap Hamel names: looking at 100 traces, open-coding first failure — vendors sell scores.

**Code review bots — noisy incumbents.** CodeRabbit: HN noise (item 42484498); own KB to reduce verbosity; `04` records **$24–$72/dev/mo** from a parallel site sweep; `08` left pricing **Unknown** (site not fully fetched). Graphite, Qodo, Copilot Review, Cursor Bugbot. Lesson: another comment bot is REJECTED unless the mechanism is not comments.

**Data quality — enterprise oligopoly.** Monte Carlo (Accel/Redpoint/GGV/ICONIQ/IVP in 2023 **vendor press**); GX 11,819★. **REJECTED** as 3-week solo company.

**API contracts.** oasdiff 1,373★; Fern/Speakeasy/Stainless/Pact/Spectral/Postman. Hosted triangle can wow; defensibility low (weekend wrapper).

**Accessibility.** Overlay Fact Sheet 1,031 signatories; WebAIM 67%/72% ineffective (quoted on OFS); FTC accessiBe $1M (22 Apr 2025); axe-core 7,538★; EAA after 28 Jun 2025. **Do not compete with overlays. Do not claim EAA/WCAG.**

**Money.** Stripe first-party recon docs; Puzzle clearing accounts; Stampli/Bill.com/Ramp. Privacy and ERP kill hackathon depth.

**Metering.** Lago 10,588★; OpenMeter 2,327★. **REJECTED.**

**HITL.** HumanLayer Launch HN item 42247368, **354 points**, YC F24. Coding agents adding plan/approval after incidents (secondary essays; official Anthropic postmortem **unconfirmed**).

**Research/citations.** Westlaw, Lexis, Harvey, Elicit, scite, CourtListener public. Citation *existence* is a subset none of them own as a 20-second “this brief is lying” demo — Harvey-class can still add a badge.

**Maintainer triage.** GitHub native, Dosu, 20 years of duplicate-issue papers. Tidelift 2024: **60%** unpaid hobbyists; **48%** thankless; **60%** quit or considered. Same report’s “I don’t get paid” multi-select is **47%** — they explain the 13-point gap as identity vs nominal payments; do not quote both as independent surveys. GitHub Blog 28 Aug 2025 (vendor): 60% want triage help, on-request only.

**Competitive conclusions:** competition scores will be high (bad) for almost every interesting problem. Killers are incumbent bundling and OSS CLIs. Differentiation must be mechanism + honesty + demo, not “we also do evals.”

---

## G. Failed Products / Lessons

| Failure | What it appeared to be | What happened (as fetched) | Lesson |
|---|---|---|---|
| Adept | General workplace / computer-use agent | 28 Jun 2024: founders + team to Amazon AGI; Amazon licensed agent tech, models, datasets | Do not build generic computer-use for OFFGRID |
| Inflection / Pi | Consumer companion AI | Microsoft hired almost all team (CMA, 19 Mar 2024); Reuters source ~$650M — CMA redacts amounts | Consumer chatbot is not a wedge |
| Humane Ai Pin | Wearable AI | Sales stopped; cloud features die 28 Feb 2025 12:00 PST; HP $116M (18 Feb 2025) for Cosmos + talent + IP | Hardware + cloud-dependent demo; brick risk |
| Builder.ai | “App as easy as ordering pizza” | Bloomberg 20 May 2025 insolvency; FT: AWS ~$88M, Microsoft ~$30M; revenue overstatement reported; round-tripping **alleged**, not adjudicated in fetched pages | Judges will smell “AI builds your app” |
| accessiBe | AI widget → WCAG | FTC final order 22 Apr 2025, $1M; barred from unsubstantiated WCAG claims | Do not sell automated compliance |
| Mutable.ai | AI docs/autocomplete | PitchBook: acquired/merged 11 Dec 2024 by Google | Coding-assistant crowding |
| Sweep AI (JetBrains) | YC coding agent | Aggregator claims discontinued Apr 2026 | **UNVERIFIED** on official Sweep domain; name collision with a different Sweep |
| Humanloop | YC S20 evals/prompt/logging | Joins Anthropic; customer email sunset **8 Sep 2025**, data deleted after (HN 44592216) | Do not make OFFGRID “LangSmith-but-smaller” |
| AgentGPT (Reworkd) | Viral “name a goal” agent | GitHub **archived**, **36,289★**, last push 29 Apr 2025 | Stars ≠ a job |
| gpt-engineer | Unopinionated codegen | Archived precursor to Lovable; **55,091★** | Experiment, not a wedge |
| Bench | Bookkeeping | TechCrunch 27 Dec 2024 shutdown; customers locked out of books; ~$65M liabilities (TC 16 Jan 2025) | Do not hostage user records; finance is lethal ops |
| Meeting notetakers (class) | Auto notes | Not dead as businesses; **dead as a greenfield idea** — Teams/Zoom admins document blocking them | Privacy backlash is the market |

**Failure patterns that should kill similar OFFGRID ideas:** generic agent/computer use; hardware; “AI builds the app”; compliance theater; incumbent-bundle jobs (flags, flakes, traces, notes, copilots); unsolicited bots; talent-deal “startups”; acquihire-then-sunset; viral generic agents.

---

## H. Competitive Destruction

Kill tests against the remaining ideas (`08` + `10`):

| Our idea | Strongest competitor | Why they win | Remaining wedge (if any) | Fatal risk |
|---|---|---|---|---|
| Canary Session | Promptfoo 25,332★ | CI-native evals; YAML in git | Long-session canary as the *object*, not a dashboard | Indistinguishable from Promptfoo README; flake |
| Trace Autopsy | Langfuse 34,889★ / LangSmith | Default OSS/closed traces | Hamel’s looking/Excel hole | Humanloop sunset; spreadsheet demo |
| CiteCheck | Westlaw / Lexis / Harvey | Completeness; malpractice insurance | Gate on *model output*, not research replacement | They add a verify badge |
| Action Receipt | HumanLayer + Cursor/Claude Code/Codex | HITL API; IDE distribution | Receipt vs lying narrator (APM-blind success) | Mock-agent looks fake; IDEs ship logs |
| Spec Triangle | oasdiff + Fern | Correct layer; codegen gospel | Hosted 20s 404 vs green spec | Weekend wrapper (`npx oasdiff`) |
| Merge Preflight | GitHub branch protection | Distribution | Agent-specific thresholds from 33k-PR study; **no nits** (CodeRabbit failure mode) | Looks like a linter; GitHub ships policy |
| SourceFix | axe-core 7,538★ / Lighthouse | Standard engine | Honesty after FTC/EAA; component mapping | Overlay comparison confusing; “it’s Lighthouse” |
| SQL Grain Diff | Monte Carlo | Category creator; already owns budget | Static SQL grain/join diff | Homework vibe |
| Docs Click | Checkly / Playwright | Monitoring incumbents | Docs-as-script | Highest flake |
| Honest Patch | api-extractor | Existing OSS | Hosted JS-only | Supply-chain if you `npm install` untrusted |
| Afterhours brief | ChatGPT / Notion AI / meeting bots | 20-second comparable brief | None | **Already killed** |

**Do not clone traces. Do not be accessiBe. Do not rebuild Lago. Do not comment-bot.**

---

## I. Technical Feasibility

Shared constraints (`09`): solo builder; hosted URL; local-first = honest egress; disclose AI tools; prefer Node as in scaffold (not mandatory); **do not** depend on judge OAuth to Gmail/Stripe/GitHub if fixtures can carry the wow-path. Keep demo up through **25 Oct 2026**.

Builder strength in AI/LLM/agents is a **trap** (cluster D). Feasible ≠ should. Less-killed ideas are verifiers with a deterministic core.

| Concept | Build | 3-week? | Hardest / kill-if |
|---|---|---|---|
| CiteCheck | Moderate | **Yes** (existence); pinpoint **Maybe** | False reds; CourtListener 429s; never send full memo to an LLM |
| Action Receipt | Moderate as simulated agent; wrapping real Cursor/Codex **Hard / Extremely hard** | **Yes** as theater-with-real-log | Judges reject a mock agent |
| Canary Session | Hard if real; Moderate if scripted | **Yes only with scripted runtime**; true multi-hour Claude Code replay **Extremely hard** | Flake vs regression; timeout |
| Trace Autopsy | Easy–Moderate | **Yes** (fixture JSONL) | Indistinguishable from a spreadsheet |
| Spec Triangle | Easy–Moderate | **Yes** (fixture API we control) | View-source `npx oasdiff` |
| Merge Preflight | Moderate | **Yes without GitHub App**; App review may miss 14 Oct | Marketplace timing |
| SourceFix | Moderate for axe-on-URL; component mapping **Maybe** | **Yes** for URL scan | Never say compliant |
| SQL Grain Diff | Easy | **Yes** | CS homework vibe |
| Docs Click | Hard | **Risky** — not recommended as primary | Headless flake on cheap hosts |
| Honest Patch | Moderate | **Yes** if never executing untrusted install scripts | Supply-chain |

**Out of scope / extremely hard:** warehouse observability, AP ERP, wrapping all agent IDEs, hardware, legal research completeness, EAA certification product.

---

## J. Top 10

From `07` (demo-first). Competition score: higher = more crowded = **worse**. No row dominates. Afterhours scored last; **do not shortlist.**

### 1. CiteCheck
- **10s:** “It checks whether the citations in this AI-written brief actually exist.”
- **30s:** Paste fixture with Mata-style fakes → red. One real citation → green.
- **60s:** Quote mismatch on a real public opinion snippet.
- **3-min technical:** Citation parse; CourtListener/Crossref/HTTP; no generation; local parse / cite-only egress.
- **Hardest judge Q:** “Isn’t this Ctrl+F on CourtListener?” **A:** The job is gatekeeping a document, including reporter-number collisions (Mata lists Gibbs v. Maxwell House at a fake case’s cite). Not replacing Westlaw in 3 weeks.

### 2. Action Receipt
- **10s:** “It records what the agent actually ran, not what it claimed.”
- **30s:** Agent says drop is irreversible; log shows DELETE + backup.
- **60s:** Approval gate blocks the next destructive call.
- **Hardest judge Q:** “HumanLayer?” **A:** They exist (Launch HN 354). Demo is receipt vs narrative, a Mata-shaped failure, not a generic HITL API.

### 3. Canary Session
- **10s:** “It replays a 30-minute golden agent session after you change the prompt.”
- **30s:** Toggle config → canary fails assertions / token spike.
- **60s:** Bisect the config commit.
- **Hardest judge Q:** “Promptfoo?” **A:** Yes 25k★. Bet is long-session canaries because short evals miss compact/cache failures (Hamel + secondary 2026 essays; official Anthropic postmortem **unconfirmed**).

### 4. Trace Autopsy
- **10s:** “It makes you look at 100 traces the way Hamel says you must.”
- **30s / 60s:** Tags + counts; export assertions.
- **Hardest judge Q:** “LangSmith?” **A:** They optimize dashboards; Hamel still used Excel. If they copy this, we lose — say that.

### 5. Spec Triangle
- **10s:** “It shows when your spec, live API, and SDK disagree.”
- **30s / 60s:** 404 vs green spec; SDK missing method.
- **Hardest judge Q:** “oasdiff?” **A:** 1.3k★ CLI. We are a hosted triangle. Honest: weekend wrapper risk.

### 6. Merge Preflight
- **10s:** “It blocks agent PRs that the data says won’t merge.”
- **30s / 60s:** 40-file no-test diff blocked; 2-file docs allowed; cite arXiv:2601.15195.
- **Hardest judge Q:** “Isn’t that branch protection?” **A:** Partly. Product is agent-specific thresholds, not style nits.

### 7. SourceFix
- **10s:** “It finds real a11y bugs in source and will not sell you a WCAG badge.”
- **30s / 60s:** Overlay still fails; axe on source; component name + PR.
- **Hardest judge Q:** “Lighthouse?” **A:** Same engine family. Difference is anti-compliance-theater after FTC $1M and EAA 28 Jun 2025.

### 8. SQL Grain Diff
- **10s:** “It shows why two revenue queries disagree without a warehouse.”
- **30s / 60s:** Fanout join highlighted; tie to Monte Carlo $16k/day *shape* (synthetic SQL, not their data).
- **Hardest judge Q:** “Monte Carlo?” **A:** They monitor data; we static-diff SQL. They already own the budget.

### 9. Docs Click
- **10s:** “It clicks your getting-started guide and fails when the button is gone.”
- **30s / 60s:** Step 3 404; screenshot.
- **Hardest judge Q:** “Checkly?” **A:** Yes. Docs-as-script is the only twist. **Highest flake.**

### 10. Honest Patch
- **10s:** “It catches a ‘patch’ that deletes an export.”
- **30s / 60s:** npm pack diff; report.
- **Hardest judge Q:** “api-extractor?” **A:** Yes. Hosted JS-only is the whole product. Sandbox install = supply-chain risk.

Scoring notes (`07`): CiteCheck pain **9** because Mata is a federal sanctions order. Canary competition **9** because Promptfoo/Langfuse. AI leverage is **low on purpose** for survivors. Afterhours: demo 8, everything that matters 1–3.

---

## K. Top 5 Survivors

Kill test **first**. These are remaining *investigations*, not a product pick. They survived because they were **less dead**.

### 1. CiteCheck

**Why we shouldn’t:** Westlaw/Lexis/Harvey can add “verify citations” as a checkbox. CourtListener is public; a weekend wrapper is plausible. False reds on real obscure cases are worse than no product. Legal buyers are slow. Looks like a search box on stage.

**Why we might:** Mata is a **court-documented** professional failure of unverified model output. The job is gatekeeping, not writing. Product-without-AI is strong. 20-second demo is brutal and visual. Local-first (cite-only egress) is honest.

**Why survived:** Strongest pain×demo×non-AI in the matrix; not a generator.

**Strongest evidence:** Mata v. Avianca (S.D.N.Y. 22 Jun 2023) Rule 11 sanctions; Justia opinion + CourtListener PACER PDF listing fake reporter collisions.

**Strongest competitor:** Westlaw/Harvey (badge risk).

**Biggest risk / what would kill it:** Harvey ships a badge before 14 Oct; demo false-reds; judges yawn at “search.”

**Validate next (no product code):** Time-box CourtListener lookup of *actual* Mata fake reporter numbers vs real cases at those cites; ask 3 lawyers whether they would paste a draft into a hosted tool; check rate limits.

**Hackathon demo:** Fixture memo + existence checks + one quote search on a public opinion.

**Post-hackathon:** Pinpoint, local PDF, jurisdictions.

### 2. Action Receipt

**Why we shouldn’t:** HumanLayer exists (Launch HN 354). Cursor/Claude Code will add plan modes. A mock-agent demo looks fake. Logging is not original.

**Why we might:** Failure mode is *successful* destructive commands plus a lying narrator — APM-blind. Non-AI is the product. Complements coding-agent chaos (Codex issue #25426 lifecycle hangs) without being another copilot.

**Why survived:** Non-AI value and repeat use; Mata-shaped gate.

**Strongest evidence:** Pattern of technically successful disasters; HumanLayer occupying HITL but not “receipt vs story”; Codex #25426 as adjacent anecdote.

**Strongest competitor:** HumanLayer + IDE vendors.

**Biggest risk / what would kill it:** Judges require a real IDE integration we cannot finish; or HumanLayer is “already the answer”; or current agents already show a trustworthy tool log.

**Validate next:** Watch how Claude Code / Cursor / Codex expose tool logs. If they already show a trustworthy receipt, **stop**.

**Hackathon demo:** Mock agent + real append-only log + approval. Do not actually drop a real DB.

**Post-hackathon:** MCP proxy.

### 3. Canary Session

**Why we shouldn’t:** Promptfoo 25k★, Langfuse 35k★. Long-session evals are expensive and flaky. Secondary 2026 “Claude felt off” posts are **not** a substitute for an official Anthropic postmortem (unconfirmed this pass). Looks like “we built evals.” Humanloop sunset extra-kills **Canary-as-dashboard**.

**Why we might:** Hamel: unsuccessful LLM products lack evals; **60–80%** of work is looking at failures; short unit tests are necessary but insufficient. Builder’s home turf **if** the object is a *golden long session*, not a dashboard.

**Why survived:** Best AI-eng fit if scoped to canary-as-object; Hamel evidence is practitioner-strong.

**Strongest evidence:** Hamel evals + FAQ (100+ traces, 2–4 week cycles). Zheng et al. as a reason **not** to be an uncalibrated judge.

**Strongest competitor:** Promptfoo.

**Biggest risk / what would kill it:** Demo flake on judging day; indistinguishable from Promptfoo README.

**Validate next:** Fail a canary by changing **one** documented config knob in a **scripted** runtime, reliably, **10/10**.

**Hackathon demo:** Scripted agent + assertions.

**Post-hackathon:** Real CLI replay.

### 4. Spec Triangle

**Why we shouldn’t:** oasdiff 1.3k★; Fern/Speakeasy/Stainless/Pact/Postman. Reproducibility: weekend. Technical depth cannot rescue this.

**Why we might:** 20-second 404 vs green spec is judge-legible. Deterministic. Honest local-first (spec in browser, probe a fixture API we control).

**Why survived:** Demoability + non-AI core; less dead than generators.

**Strongest evidence:** Fern Aug 2026 drift post; oasdiff stars; real 404 vs green spec as a visible failure.

**Strongest competitor:** oasdiff + Fern.

**Biggest risk / what would kill it:** View-source wrapper accusation.

**Validate next:** Is there a *single* visual that oasdiff CLI cannot match in 20 seconds? If no, **stop**.

**Hackathon demo:** Fixture API we control.

**Post-hackathon:** CI app — `10` says probably still not a company.

### 5. Merge Preflight

**Why we shouldn’t:** Branch protection + “don’t use agents for large PRs” is a CONTRIBUTING paragraph. GitHub will ship agent policies. Paper heuristics are copyable.

**Why we might:** arXiv:2601.15195 gives **empirical** merge failure modes (size, CI, docs vs bugfix, social). CodeRabbit failed on nits; this product *refuses to comment* and only gates. Non-AI.

**Why survived:** Empirical paper + anti-nit mechanism.

**Strongest evidence:** 33k agent-authored PRs study; documentation/CI PRs merge more; unmerged PRs larger, more files, often fail CI.

**Strongest competitor:** GitHub branch protection.

**Biggest risk / what would kill it:** Looks like a linter; GitHub App not approved in time.

**Validate next:** Replay the paper’s quantitative rules on 20 public agent PRs — do they separate merged vs not at a glance?

**Hackathon demo:** Fixture PRs + gates (demo without App if delayed).

**Post-hackathon:** Per-repo thresholds.

**Explicit non-recommendation:** Do **not** pick a final product from this memo. Do **not** start Afterhours-as-brief. Do **not** start a generic agent. Do **not** start an overlay.

---

## L. Why Each Could Fail

| Survivor | Could fail because |
|---|---|
| CiteCheck | Incumbent badge; false red on a valid obscure cite (Mata-level irony); lawyers won’t paste privileged drafts; CourtListener rate limits on judging day; demo looks like search |
| Action Receipt | HumanLayer already named; mock agent rejected as theater; IDEs ship trustworthy logs before 14 Oct; wrapping real runtimes is Extremely hard in 3 weeks |
| Canary Session | Promptfoo/Langfuse crowding; flake indistinguishable from regression; cost/timeout; Humanloop-class sunset if it becomes a dashboard; unofficial 2026 quality essays overclaimed |
| Spec Triangle | Competent engineer calls it `npx oasdiff` in a weekend; Fern already generates from one spec; auth APIs; public API used in demo moves |
| Merge Preflight | GitHub ships agent merge policy; false blocks anger users; App review misses deadline; paper heuristics copyable; looks like a linter not a product |
| **Shared** | Judges may value **generators** over verifiers given an OpenAI-credits prize (`07` unknown #1) |

Trace Autopsy / SourceFix / SQL Grain Diff / Docs Click / Honest Patch already failed the last filter for spreadsheet, Lighthouse, homework, flake, and api-extractor reasons.

---

## M. Critical Unknowns

**Hackathon operations:**

- Prize opt-in checkbox on the live submit form (login; **not inspected**).
- OpenAI credit issuance, expiry, region, transferability.
- Red Bull Supply fulfillment outside the house.
- Named judges; judging start date.
- Video length cap (OFFGRID unspecified).
- Whether a public demo URL is required or video+repo is enough (rules: strongly recommended).

**Product / evidence:**

- CiteCheck: lawyer paste willingness; CourtListener limits; pinpoint accuracy; false-red rate on real cites.
- Action Receipt: do current coding agents already expose a trustworthy tool log?
- Canary Session: 10/10 reliable fail on one config change; flake vs regression.
- Spec Triangle: a visual oasdiff cannot match in 20s.
- Merge Preflight: heuristics vs 20 real agent PRs; GitHub App timing.
- Whether judges value verifiers over generators.
- Sweep AI Apr 2026 shutdown: **unverified**. Official Anthropic April 2026 quality postmortem: **not found**. Independent 2026 TAM for AI evals: **Unknown**. CodeRabbit current pricing: conflict (`04` vs `08`). Braintrust canonical GitHub: not found at `braintrustdata/braintrust` this pass.

**Conflicts already in-report (do not flatten):** Monte Carlo survey is vendor-commissioned; Tidelift 60% vs 47%; GitHub 60% triage is a product blog; Inflection $650M is Reuters, CMA redacts; Builder.ai fraud **alleged**.

---

## N. Recommended Next Research

No product code. Do these probes; any one can kill a survivor.

1. **CiteCheck:** CourtListener live probe of Mata-listed reporter collisions; 3 lawyer conversations; rate limits.
2. **Action Receipt:** inspect Claude Code / Cursor / Codex tool-log UX; stop if already trustworthy.
3. **Canary Session:** scripted harness; one config knob; 10/10 fail.
4. **Spec Triangle:** one 20-second visual oasdiff cannot match — or drop.
5. **Merge Preflight:** replay paper rules on 20 public agent PRs.
6. Confirm prize checkbox + custom questions on the live Devpost submit form.
7. Do **not** start Afterhours notes→brief, a generic agent, an overlay, or any REJECTED concept.

Opportunity is **not** yet strong enough to start product code. Calendar in repo briefings: think/name/wow-path until ~30 Sep 2026 unless the user explicitly overrides.

---

## O. Source Index

Full tables (pages actually fetched 21 Sep 2026, not search snippets):

- **Hackathon:** [`research/sources-hackathon.md`](sources-hackathon.md)
- **Product/market:** [`research/sources.md`](sources.md)

Workstream files this report synthesizes: `01-hackathon-intelligence.md`, `02-problem-landscape.md`, `03-product-landscape.md`, `04-competitive-analysis.md`, `05-problem-opportunities.md` (names/REJECTED only), `06-product-concepts.md` (names/REJECTED only), `07-shortlist.md`, `08-competitive-destruction.md`, `09-technical-feasibility.md`, `10-final-recommendation.md`, `_product-findings-for-exec.md`. Raw files `_raw-problems.md`, `_raw-competitors.md`, `_raw-failures.md` were not dumped here; items from them appear only where already promoted (Humanloop, AgentGPT, gpt-engineer, Bench, etc.).

**Most important URLs actually used:**

| URL | Why |
|---|---|
| https://hack47-offgrid.devpost.com/ | Overview, eligibility, prize, 87, criteria |
| https://hack47-offgrid.devpost.com/rules | Full rules, AI, originality, disqualification |
| https://hack47-offgrid.devpost.com/details/dates | Clock; judging blank; winners 25 Oct |
| https://hack47-offgrid.devpost.com/resources | Cursor/Claude Code allowed; no required stack |
| https://hack47.org/ | House philosophy; founders; Delhi dates still on homepage |
| https://www.linkedin.com/company/hack47 | No slides / no Uber-of |
| https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1:2022cv01461/575368/54/ | Mata opinion |
| https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf | Mata PACER PDF |
| https://hamel.dev/blog/posts/evals/ | Evals root cause |
| https://hamel.dev/blog/posts/evals-faq/ | 60–80% looking; 100+ traces |
| https://arxiv.org/abs/2306.05685 | Zheng et al. judge bias |
| https://arxiv.org/pdf/2601.15195 | 33k agent PRs |
| https://overlayfactsheet.com/en/ | 1,031 signatories this fetch |
| https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million | FTC $1M |
| https://eur-lex.europa.eu/eli/dir/2019/0882 | EAA |
| https://www.adept.ai/blog/adept-update/ | Adept → Amazon |
| https://assets.publishing.service.gov.uk/media/6719ff5f549f63039436b3c8/__Full_text_decision__.pdf | Inflection CMA |
| https://github.com/langfuse/langfuse | 34,889★ |
| https://github.com/promptfoo/promptfoo | 25,332★ |
| https://github.com/oasdiff/oasdiff | 1,373★ |
| https://github.com/reworkd/AgentGPT | Archived 36,289★ |
| https://github.com/AntonOsika/gpt-engineer | Archived 55,091★ |
| https://humanloop.com/ | Eval platform sunset |
| https://news.ycombinator.com/item?id=42247368 | HumanLayer Launch HN 354 |
| https://help.devpost.com/article/132-prizes | Opt-in prize mechanism |

**Intentionally not evidence:** tweets (fetch failed); Instagram (login wall); Devpost live submit form (login); hello@hack47.org replies (none requested); Artificialus Sweep AI page; secondary “Claude felt off” blogs as Anthropic quotes; consulting TAM decks.

---

After attempting to kill these opportunities, these are the few problems that still appear worth investigating, this is the evidence supporting them, this is what could invalidate them, and this is what we need to learn before writing a single line of product code.
