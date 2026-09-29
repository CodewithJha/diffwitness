# Problem opportunities — 32 problems, kill-tested

**Date:** 21 September 2026  
**Template:** as specified. **REJECTED** marked in the heading when the idea fails badly.  
**Evidence rule:** URLs are pages inspected this pass unless noted. Vendor stats stay vendor-labeled.

---

## Problem #1
### Problem
Production LLM/agent quality regresses silently: the system still returns 200s while behavior gets worse (forgetfulness, tool loops, shorter/dumber answers). Teams notice via “it feels off,” not monitors.
### Target user
Engineers shipping a coding agent or LLM feature in production.
### Workflow
Change prompt, model, cache, reasoning effort, or CLI version → ship → users complain weeks later → bisect config/model/history.
### Frequency
After every model/provider/prompt/CLI change. Hamel FAQ: re-run error analysis on significant changes; 2–4 week cycles typical in his client work.
### Pain
You cannot tell if *you* broke it or the provider did. Traditional APM stays green.
### Current solution
Vibe check; LangSmith/Langfuse dashboards; ad hoc canaries; user tweets.
### Workaround
Pin versions; read traces in a spreadsheet (Hamel).
### Evidence
Hamel 2024: unsuccessful LLM products “almost always” lack robust evals. FAQ: 60–80% of time on error analysis. Secondary 2026 essays describe Claude Code “felt off for a month” due to config/cache/prompt bugs — **official Anthropic URL not confirmed this pass; do not treat as Anthropic quote.**
### Evidence sources (URLs you inspected)
https://hamel.dev/blog/posts/evals/  
https://hamel.dev/blog/posts/evals-faq/
### Economic value
Unknown dollars. Cost is wasted tokens + lost user trust + weeks of bisect. Unknown willingness-to-pay for a new tool vs Langfuse.
### Technical difficulty (Low/Medium/High + why)
High for *honest* detection (need long-session canaries, not toy prompts). Medium for logging.
### AI opportunity
Optional: cluster failure modes in traces. Dangerous if used as the only judge.
### Non-AI opportunity
Fixed canary transcripts, token-per-turn monitors, config snapshots, version pins.
### Data requirements
Production traces (sensitive). Public fixtures for demo.
### Integration requirements
Your LLM gateway or agent runtime; git for prompts.
### Security/privacy concerns
Traces contain user secrets and code.
### Existing competitors
Langfuse, LangSmith, Promptfoo, Helicone, Braintrust, provider status pages.
### Why current solutions are insufficient
They measure latency/cost/score, not “this 40-minute session got stupid after compact.” Hamel: generic frameworks miss product-specific failures.
### Potential product wedge
Long-session canaries + config/receipt diff when a canary fails.
### Main reason this problem may NOT be worth solving
Langfuse 34.9k★ already. Providers will ship status/postmortems. A solo 3-week tool looks like a wrapper.
### Confidence (Low/Medium/High)
Medium (pain High; whitespace Low)

---

## Problem #2
### Problem
Teams do not look at traces. They install an eval product and watch meaningless 1–5 scores.
### Target user
PM + engineer on an AI feature.
### Workflow
Sample 100 traces → open-code first failure → cluster → only then write assertions.
### Frequency
Every 2–4 weeks in Hamel’s described practice; more when shipping weekly.
### Pain
60–80% of the real work is looking; tools optimize the other 20–40%.
### Current solution
Excel (Hamel); LangSmith UI; ignore.
### Workaround
Hire Hamel-style consultants.
### Evidence
https://hamel.dev/blog/posts/evals-faq/ (60–80% error analysis; 100+ traces). https://hamel.dev/blog/posts/evals/ (vendors claim to eliminate looking; he disagrees).
### Evidence sources (URLs you inspected)
https://hamel.dev/blog/posts/evals-faq/  
https://hamel.dev/blog/posts/evals/
### Economic value
Unknown. Consultant rates Unknown. Internal hours are large **INFERENCE**.
### Technical difficulty (Low/Medium/High + why)
Medium UX; Low infrastructure if traces already exist.
### AI opportunity
Clustering suggestions. Must not auto-grade.
### Non-AI opportunity
A labeling UX with binary tags and counts. Spreadsheet already does this.
### Data requirements
Traces + human labels.
### Integration requirements
Import from Langfuse/LangSmith/JSONL.
### Security/privacy concerns
Same as traces.
### Existing competitors
The incumbent UIs; Excel; LabelStudio.
### Why current solutions are insufficient
Incumbents optimize dashboards. Excel does not cluster or sample well.
### Potential product wedge
“100 traces in 90 minutes” structured open-coding.
### Main reason this problem may NOT be worth solving
If Excel is enough, no business. If not, LangSmith can copy the UX in a quarter.
### Confidence (Low/Medium/High)
Medium

---

## Problem #3
### Problem
LLM-as-judge evals are biased (position, verbosity, self-preference, style) so teams ship on fake quality numbers.
### Target user
Anyone using an LLM to score another LLM (eval vendors, AI teams).
### Workflow
Run pairwise judge → dashboard up and to the right → humans disagree → trust collapses (Hamel: if evals say great and team says broken, you lose trust).
### Frequency
Every eval run.
### Pain
You automate the thing that is lying.
### Current solution
Position swap; human gold labels; papers’ mitigations.
### Workaround
Don’t use LLM judges; use assertions (Hamel hierarchy).
### Evidence
Zheng et al. 2023 arXiv:2306.05685 — position bias can flip winners; GPT-4 >60% consistency only on hard similar-answer test; verbosity attack; self-enhancement discussion. arXiv:2410.21819 — GPT-4 self-preference. Hamel Substack LLM-judge: 1–5 scores often a bad process.
### Evidence sources (URLs you inspected)
https://arxiv.org/pdf/2306.05685.pdf  
https://arxiv.org/abs/2410.21819  
https://hamelhusain.substack.com/p/llm-judge
### Economic value
Unknown. Wrong ship/no-ship decisions.
### Technical difficulty (Low/Medium/High + why)
High to *fix* bias; Medium to *measure* it with swaps + gold set.
### AI opportunity
The problem *is* AI. Calibration needs humans.
### Non-AI opportunity
Swap tests, gold labels, agreement stats, refuse 1–5 rubrics.
### Data requirements
Gold labels from domain experts.
### Integration requirements
Eval runner.
### Security/privacy concerns
Eval sets may contain prod data.
### Existing competitors
Promptfoo, Braintrust, academic harnesses, vendor “alignment” features.
### Why current solutions are insufficient
Mitigations exist in papers; production teams still ship vanilla GPT-4 judges **INFERENCE**.
### Potential product wedge
A judge-bias report that fails CI if swap disagreement exceeds threshold.
### Main reason this problem may NOT be worth solving
Looks like a research demo; Promptfoo can add swap CI. Not a company.
### Confidence (Low/Medium/High)
High on problem existence; Low on product wedge

---

## Problem #4
### Problem
Professionals cannot tell whether citations, quotes, and URLs in AI-written memos actually exist.
### Target user
Lawyers first (court-documented); also researchers, analysts, anyone pasting model output into a brief.
### Workflow
Model emits cases/DOIs/URLs → human files or publishes → opponent or reviewer checks → sanctions or reputational damage.
### Frequency
Every AI-assisted writing session if unverified.
### Pain
Mata: fake cases, fake quotes, continued defense after challenge; $5,000 Rule 11; letters to judges falsely named as authors.
### Current solution
Westlaw/Lexis; manual Google Scholar; “I asked ChatGPT if the case is real” (the Mata failure mode).
### Workaround
Ban AI for citations; only cite what you opened.
### Evidence
Mata v. Avianca opinion (Justia + CourtListener PDF). Court: nothing inherently improper about reliable AI assistance; existing rules impose gatekeeping.
### Evidence sources (URLs you inspected)
https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1:2022cv01461/575368/54/  
https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf
### Economic value
Sanctions, malpractice, wasted opposing-party time (court’s words). Market size Unknown.
### Technical difficulty (Low/Medium/High + why)
Medium for existence (CourtListener, CAP, Crossref, HTTP). High for quote-at-pinpoint and unpublished opinions.
### AI opportunity
Extract citation spans from a PDF/memo. Optional; regex + parsers exist.
### Non-AI opportunity
The lookup is the product.
### Data requirements
User document; court/DOI APIs.
### Integration requirements
CourtListener, Crossref, maybe Google Scholar ToS issues.
### Security/privacy concerns
Privileged legal documents; do not train on them; local-first matters.
### Existing competitors
Westlaw, Lexis, Harvey, Spellbook, scite, Elicit, Consensus, “Check with ChatGPT.”
### Why current solutions are insufficient
Research tools *generate* more citations. Mata needed a verifier, not a better writer. ChatGPT confirmed fakes to the user (court record).
### Potential product wedge
Paste brief → red/green existence + quote-check against public opinions. Never draft arguments.
### Main reason this problem may NOT be worth solving
Westlaw/Harvey will add badges. Legal buyers are slow. Demo looks like a search box. Hallucinated citations may decline as models improve **Unknown**.
### Confidence (Low/Medium/High)
High on pain; Medium on uncrowded wedge

---

## Problem #5
### Problem
Agents take irreversible actions (delete, pay, email, drop DB) with no independent record; monitoring stays green because the command succeeded.
### Target user
Developers giving coding/ops agents tools.
### Workflow
Agent gets shell/DB credentials → runs valid destructive SQL → narrates incorrectly → human debugs using the liar.
### Frequency
Whenever agents have write tools. Rising with coding agents **INFERENCE**.
### Pain
Customer data loss; recovery depends on backups the agent may deny exist.
### Current solution
Don’t give prod creds; HumanLayer-style approve; vendor plan-only modes.
### Workaround
Watch the agent; never leave overnight (public GitHub issue catalogs of overnight agent failures exist; treat individual issues as anecdotes).
### Evidence
Adept’s official post is about *building* workplace agents, then talent left to Amazon — shows how hard general agents are, not this exact incident. HumanLayer HN 354 points. Exa-retrieved 2026 postmortem essay on DB wipe: no error, unreliable self-report. Codex GitHub issue #25426: close_agent hang / slot leak — lifecycle unreliability.
### Evidence sources (URLs you inspected)
https://www.adept.ai/blog/adept-update/  
https://news.ycombinator.com/item?id=42247368  
https://github.com/openai/codex/issues/25426
### Economic value
Unknown; tail-risk high.
### Technical difficulty (Low/Medium/High + why)
Medium for wrapping tools with receipts; Hard to intercept every agent runtime.
### AI opportunity
None required. LLM as narrator is the liability.
### Non-AI opportunity
Allowlist, two-person rule, append-only log, prod unreachable.
### Data requirements
Tool-call stream.
### Integration requirements
MCP/tools layer, not the model.
### Security/privacy concerns
Logs of secrets; the log must not be writable by the agent.
### Existing competitors
HumanLayer; OS permissions; E2B sandboxes; vendor “plan mode.”
### Why current solutions are insufficient
Default agent products still optimize autonomy. Incidents keep rhyming.
### Potential product wedge
A receipt viewer: “here is what ran; here is what the agent claimed.”
### Main reason this problem may NOT be worth solving
Cursor/Claude Code/Codex will ship this. HumanLayer exists. Looks like infra not a wow demo.
### Confidence (Low/Medium/High)
Medium

---

## Problem #6
### Problem
OpenAPI spec, live traffic, and generated SDK drift independently until clients 404 or send the wrong body.
### Target user
API platform engineers; SDK consumers.
### Workflow
Merge spec change → linter green → staging tests against *new* server → old clients break.
### Frequency
Every API release.
### Pain
Breakage shows up in someone else’s nightly, not your CI.
### Current solution
oasdiff; Fern/Speakeasy pipelines; Pact; Postman collections; hope.
### Workaround
Never break; never generate SDKs; Slack apologies.
### Evidence
Fern Aug 2026 post on schema drift as pipeline not discipline. oasdiff 1,373★. Flowrust 2026 blog argues CI diffs the wrong thing (new spec vs new server, not old client). **Vendor/blog self-interest: Fern sells coupling.**
### Evidence sources (URLs you inspected)
https://buildwithfern.com/post/stopping-schema-drift-coupling-sdks-documentation-claude  
https://github.com/oasdiff/oasdiff
### Economic value
Unknown. Broken integrations cost support + churn **INFERENCE**.
### Technical difficulty (Low/Medium/High + why)
Low–Medium (diff + probe). High to infer semantic compatibility.
### AI opportunity
Explain the break in English. Optional.
### Non-AI opportunity
Diff + shadow traffic + SDK surface scan.
### Data requirements
Spec versions, optional HAR/OpenAPI from prod (sensitive).
### Integration requirements
CI, gateway.
### Security/privacy concerns
Hitting prod; leaking spec internals.
### Existing competitors
oasdiff, Fern, Stainless, Speakeasy, Pact, Spectral, Postman, Optic.
### Why current solutions are insufficient
Many teams still don’t run *client-oriented* diffs (Fern/Flowrust claim). Unknown how many.
### Potential product wedge
Three-column demo: spec / live / SDK with a red 404.
### Main reason this problem may NOT be worth solving
Weekend wrapper around oasdiff. Fern already sells the “right” architecture.
### Confidence (Low/Medium/High)
Medium

---

## Problem #7
### Problem
Orgs buy accessibility overlays that do not make sites accessible and can make them worse — while EAA now applies in the EU.
### Target user
Web teams at companies selling to EU consumers; in-house a11y specialists.
### Workflow
Install widget → marketing claims WCAG → disabled users hit new barriers → FTC/EDF/IAAP already said this doesn’t work.
### Frequency
Continuous for public sites; legal calendar after 28 Jun 2025.
### Pain
Real users blocked; legal risk not reduced (OFS).
### Current solution
Overlays (accessiBe et al.); axe in CI; paid audits; ignore.
### Workaround
Block overlay scripts (users do this; OFS quotes).
### Evidence
OFS; WebAIM 67%/72%; FTC $1M accessiBe; EAA 28 Jun 2025; EDF-IAAP joint statement: overlays not a substitute for fixing the site.
### Evidence sources (URLs you inspected)
https://overlayfactsheet.com/en/  
https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million  
https://eur-lex.europa.eu/eli/dir/2019/0882  
https://digital-strategy.ec.europa.eu/en/news/eu-becomes-more-accessible-all
### Economic value
Lawsuits, lost customers, wasted overlay subscriptions. Overlay market size Unknown (won’t invent).
### Technical difficulty (Low/Medium/High + why)
Low to run axe. High to actually fix React a11y. Medium to map violations to components.
### AI opportunity
Drafting alt text — often harmful if unsupervised. Prefer none.
### Non-AI opportunity
axe + component mapping + no compliance claim.
### Data requirements
HTML/CSS/JS of the site.
### Integration requirements
CI, Storybook, design system.
### Security/privacy concerns
Crawling authenticated apps.
### Existing competitors
Deque, Pa11y, Lighthouse, Level Access, agencies; overlay vendors (discredited).
### Why current solutions are insufficient
Overlays failed. axe dumps 200 violations nobody triages. Agencies don’t fit a hackathon continuation unless the UX is “one component PR.”
### Potential product wedge
Honest CI: fail on new keyboard traps in *your* design system; never say “EAA compliant.”
### Main reason this problem may NOT be worth solving
Looks like Lighthouse. Buyers still want a magic widget (the lie sells). Enforcement of EAA is national and uneven **Unknown**.
### Confidence (Low/Medium/High)
High on overlay failure; Low–Medium on new product

---

## Problem #8
### Problem
OSS maintainers drown in duplicate issues, missing repros, and triage — unpaid, underappreciated, considering quitting.
### Target user
Maintainers of popular GitHub repos.
### Workflow
Wake up → 3 issues, 2 duplicates → copy “dup of #1234” forever.
### Frequency
Daily on large projects. Mozilla cited as 300 bugs/day in a 2023 survey paper (secondary academic cite).
### Pain
Tidelift 2024: 60% unpaid; 48% thankless; 60% quit or considered. GitHub blog: 60% want triage help, 30% dup detection; want AI that doesn’t intervene unless asked.
### Current solution
Humans; stale-bot; Dosu; GitHub Models recipes.
### Workaround
Lock issues; burn out; archive the project.
### Evidence
Tidelift PDF; GitHub Blog 28 Aug 2025; academic duplicate-bug literature.
### Evidence sources (URLs you inspected)
Tidelift 2024 maintainer report PDF  
https://github.blog/open-source/maintainers/how-github-models-can-help-open-source-maintainers-focus-on-what-matters/  
https://doi.org/10.3390/app13158788
### Economic value
Maintainer time; security neglected (Tidelift: paid maintainers implement more security practices). WTP for yet another bot Unknown and likely low.
### Technical difficulty (Low/Medium/High + why)
Medium NLP; Hard to get trust.
### AI opportunity
Suggest dups. Must be a suggestion.
### Non-AI opportunity
Embeddings + issue templates + required repro checkbox.
### Data requirements
Issue text (public on GitHub).
### Integration requirements
GitHub App.
### Security/privacy concerns
Prompt injection via issues; spam; unsolicited comments that anger maintainers.
### Existing competitors
GitHub, Dosu, countless bots, 20 years of research.
### Why current solutions are insufficient
Bots comment too much (same as CodeRabbit pattern). Maintainers asked for *on-request* help.
### Potential product wedge
Button: “find dups” comments only when maintainer clicks.
### Main reason this problem may NOT be worth solving
GitHub copies it. Maintainers don’t pay. Slop PRs may be the newer pain (GitHub 5% in that survey).
### Confidence (Low/Medium/High)
High on pain; Low on business

---

## Problem #9
### Problem
Stripe payouts, bank deposits, fees, refunds, and the general ledger don’t line up; timing and netting create “missing money.”
### Target user
Startup founder + bookkeeper.
### Workflow
Month close → Stripe dashboard ≠ bank ≠ QuickBooks → Slack the accountant.
### Frequency
Monthly (close); daily for high volume.
### Pain
Cannot explain cash. Audit risk.
### Current solution
Stripe payout/bank reconciliation reports; Puzzle clearing accounts; accountants; spreadsheets.
### Workaround
Ignore until fundraise.
### Evidence
Stripe docs on payout and bank reconciliation. Puzzle FAQ on automatic linking if bank connected; timing accounts 10920/10200.
### Evidence sources (URLs you inspected)
https://docs.stripe.com/payouts/reconciliation  
https://docs.stripe.com/bank-reconciliation  
https://help.puzzle.io/en/articles/9426187-faq-stripe  
https://help.puzzle.io/en/articles/8422710-stripe-related-journal-entries
### Economic value
Accountant hours; misstated revenue (see also Monte Carlo’s own $16k/day join bug).
### Technical difficulty (Low/Medium/High + why)
High (money correctness, many edge cases). Medium for a demo of one payout ID.
### AI opportunity
None for matching keys. LLM for explaining a *specific* unmatched payout.
### Non-AI opportunity
Join on `po_xxx` and amounts.
### Data requirements
Stripe + bank + GL. Extremely sensitive.
### Integration requirements
Stripe API, Plaid/bank, accounting.
### Security/privacy concerns
Full financial access. Demo cannot use real books.
### Existing competitors
Stripe, Puzzle, Pilot, Bench (historical; status of Bench post-2024 not fully re-verified this pass), Synder, accountants.
### Why current solutions are insufficient
Manual payouts (Stripe: you reconcile yourself). Multi-entity, Connect platforms. Unknown residual pain for Puzzle customers.
### Potential product wedge
Exception queue for *unmatched* payouts with receipts.
### Main reason this problem may NOT be worth solving
Trust + integrations + incumbents. Bad hackathon data story.
### Confidence (Low/Medium/High)
Medium pain; Low as OFFGRID product

---

## Problem #10 **REJECTED**
### Problem
Accounts payable 3-way match exceptions (invoice ≠ PO ≠ receipt), especially line items.
### Target user
AP clerks.
### Workflow
Invoice PDF in → OCR → exception queue → email purchasing.
### Frequency
Every invoice that doesn’t auto-match.
### Pain
Vendor: messy PDFs, handwritten notes, hundreds of lines (Stampli blog).
### Current solution
Stampli, Bill.com, Ramp, Tipalti, ERP native.
### Workaround
Pay anyway (fraud/overpay risk).
### Evidence
Stampli matching pages; vendor 97%/87% claims — not independent.
### Evidence sources (URLs you inspected)
https://www.stampli.com/blog/all/po-matching-invoice/  
https://www.stampli.com/resources/invoice-extraction-accuracy-benchmarks/
### Economic value
AP labor; duplicate payments. Unknown independently.
### Technical difficulty (Low/Medium/High + why)
High (ERP). 
### AI opportunity
Extraction. Already the vendors’ pitch.
### Non-AI opportunity
Tolerances + workflow.
### Data requirements
ERP.
### Integration requirements
NetSuite/SAP.
### Security/privacy concerns
Financial.
### Existing competitors
Entire AP automation category.
### Why current solutions are insufficient
Vendors say exceptions remain. That’s their upsell.
### Potential product wedge
None for a solo 3-week demo that isn’t a toy PDF.
### Main reason this problem may NOT be worth solving
**REJECTED:** cannot beat Stampli/Ramp in 3 weeks; demo is CRUD+OCR.
### Confidence (Low/Medium/High)
High (rejection)

---

## Problem #11 **REJECTED**
### Problem
Stale feature flags remain in code after launch, creating debt and foot-guns.
### Target user
Teams using LaunchDarkly or similar.
### Workflow
Ship flag → 100% → never delete code.
### Frequency
Continuous.
### Pain
LD documents archive checks, 90–120 day heuristic, Vega auto-PRs.
### Current solution
LaunchDarkly Vega/Cleanup; Flagsmith/Unleash hygiene; grep.
### Workaround
Mark temporary flags as permanent to game metrics (LD warns against this).
### Evidence
https://launchdarkly.com/docs/guides/flags/technical-debt  
https://launchdarkly.com/docs/home/flags/manage/flag-cleanup-vega.md
### Evidence sources (URLs you inspected)
Same.
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
Medium (code mods).
### AI opportunity
LD already using Vega for PRs.
### Non-AI opportunity
Code references.
### Data requirements
Flag API + repo.
### Integration requirements
LD + GitHub.
### Security/privacy concerns
Prod flag state.
### Existing competitors
The flag vendor.
### Why current solutions are insufficient
They’re building it.
### Potential product wedge
None.
### Main reason this problem may NOT be worth solving
**REJECTED:** incumbent owns the cleanup loop.
### Confidence (Low/Medium/High)
High (rejection)

---

## Problem #12 **REJECTED**
### Problem
Flaky tests destroy CI confidence and waste retries.
### Target user
Platform engineers.
### Workflow
Test fails → retry → green → nobody fixes.
### Frequency
Daily in large suites. Google: flaky tests a first-class TAP concept.
### Pain
Google ICSME 2020; Datadog/Buildkite product pages.
### Current solution
Datadog Test Optimization; Buildkite Test Engine; quarantine; rerun.
### Workaround
Delete the test; ignore red.
### Evidence
https://conferences.computer.org/icsme/pdfs/ICSME2020-1oOutvkGTwF4GyVvNtr3Mm/561900a736/561900a736.pdf  
https://docs.datadoghq.com/tests.md  
https://buildkite.com/platform/test-engine/
### Evidence sources (URLs you inspected)
Same.
### Economic value
CI minutes Unknown independently (BuildPulse-style 20–60% claims **not verified this pass**).
### Technical difficulty (Low/Medium/High + why)
High at Google scale; Medium for heuristics.
### AI opportunity
Not required.
### Non-AI opportunity
Same-SHA pass/fail.
### Data requirements
Test telemetry.
### Integration requirements
CI.
### Security/privacy concerns
Build logs.
### Existing competitors
Datadog, Buildkite, Launchable, etc.
### Why current solutions are insufficient
Still flakes. Not a greenfield.
### Potential product wedge
None for OFFGRID.
### Main reason this problem may NOT be worth solving
**REJECTED:** crowded infra.
### Confidence (Low/Medium/High)
High (rejection)

---

## Problem #13
### Problem
Help center / docs / changelog describe a UI that no longer exists (docs drift).
### Target user
DevRel, technical writers, API platform docs.
### Workflow
Ship UI → forget docs → customers open tickets quoting dead steps.
### Frequency
Every release.
### Pain
Fern 2026 post: copies of the contract rot at different rates. Mintlify/ReadMe exist but drift remains **INFERENCE**.
### Current solution
Docs-as-code; Mintlify; screenshot tests; humans.
### Workaround
“See changelog.”
### Evidence
Fern schema-drift post (docs as derived artifact). Not a customer survey.
### Evidence sources (URLs you inspected)
https://buildwithfern.com/post/stopping-schema-drift-coupling-sdks-documentation-claude
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
Medium (crawl + DOM compare). High for meaning.
### AI opportunity
Map docs steps to DOM. High hallucination risk — must click.
### Non-AI opportunity
Playwright the documented path; fail if selector missing.
### Data requirements
Docs URL + staging app.
### Integration requirements
Browser automation (demo-fragile).
### Security/privacy concerns
Auth on docs/app.
### Existing competitors
Swimm, Mintlify, Chromatic, Playwright, Fern.
### Why current solutions are insufficient
Most docs tools generate from spec, not from clicking the marketing site.
### Potential product wedge
“This getting-started page’s step 3 404s against staging.”
### Main reason this problem may NOT be worth solving
Browser automation flakes in judging. Looks like QA.
### Confidence (Low/Medium/High)
Low–Medium

---

## Problem #14
### Problem
Two dashboards, two numbers: metrics disagree (ARR, headcount, conversion) with no owner.
### Target user
Data analysts, finance, founders.
### Workflow
Board meeting → “which revenue?” → war room.
### Frequency
Monthly/quarterly; worse with AI-generated SQL **INFERENCE**.
### Pain
Monte Carlo: business finds issues first 74% (vendor survey 2023). Their $16k/day overstatement is a cartesian join.
### Current solution
Metric catalogs (dbt, Transform-era, Looker); argument.
### Workaround
One blessed spreadsheet.
### Evidence
Monte Carlo Business Wire 2023; Monte Carlo $16k blog.
### Evidence sources (URLs you inspected)
https://www.businesswire.com/news/home/20230502005377/en/Data-Downtime-Nearly-Doubled-Year-Over-Year-Monte-Carlo-Survey-Says  
https://montecarlo.ai/blog-how-tsa-caught-16k-a-day-bug
### Economic value
Misstated revenue can be material. WTP for another catalog Unknown.
### Technical difficulty (Low/Medium/High + why)
High (lineage).
### AI opportunity
Explain SQL diffs. Risky.
### Non-AI opportunity
Parse two SQL queries; show grain/join difference.
### Data requirements
Warehouse access.
### Integration requirements
Snowflake/BigQuery.
### Security/privacy concerns
Revenue data.
### Existing competitors
Monte Carlo, metric layers, Hex, etc.
### Why current solutions are insufficient
Still happens (MC’s own finance table).
### Potential product wedge
Diff two SQL queries’ grain — no warehouse required for demo.
### Main reason this problem may NOT be worth solving
Enterprise sales; not a 3-week product.
### Confidence (Low/Medium/High)
Medium pain; Low product

---

## Problem #15
### Problem
Analytics event taxonomy breaks: renamed events, missing properties, silent empty funnels.
### Target user
Growth engineers, analytics engineers.
### Workflow
Ship feature → Mixpanel empty → 2 days later.
### Frequency
Every tracking change.
### Pain
Related to data downtime; Segment tracking plans exist.
### Current solution
Segment protocols; Amplitude; in-house linters.
### Workaround
Wait for a human to notice.
### Evidence
Indirect via Monte Carlo class. Direct 2026 independent survey: **Unknown**.
### Evidence sources (URLs you inspected)
Monte Carlo pages above.
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
Medium.
### AI opportunity
None required.
### Non-AI opportunity
Schema registry for events.
### Data requirements
Event stream.
### Integration requirements
Segment/Rudderstack.
### Security/privacy concerns
PII in events.
### Existing competitors
Segment, Snowplow, in-house.
### Why current solutions are insufficient
Unknown residual.
### Potential product wedge
CI: PR diffs `track()` vs tracking plan.
### Main reason this problem may NOT be worth solving
Looks like a lint rule. Weak evidence in this pass.
### Confidence (Low/Medium/High)
Low

---

## Problem #16 **REJECTED**
### Problem
A/B tests ship underpowered or with sample-ratio mismatch (SRM).
### Target user
Experimentation-aware product orgs.
### Workflow
Peek at dashboard → ship.
### Frequency
Per experiment.
### Pain
Well-known statistically; Statsig/Eppo/GrowthBook productize checks.
### Current solution
Those platforms.
### Workaround
Don’t experiment.
### Evidence
Not independently fetched beyond category knowledge; **do not invent Statsig stats**. Category existence is enough to reject as crowded.
### Evidence sources (URLs you inspected)
None primary on SRM rates this pass.
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
Medium stats.
### AI opportunity
None.
### Non-AI opportunity
SRM test.
### Data requirements
Assignment logs.
### Integration requirements
Experiment platform.
### Security/privacy concerns
User IDs.
### Existing competitors
Statsig, Eppo, LaunchDarkly experiments, GrowthBook.
### Why current solutions are insufficient
Unknown.
### Potential product wedge
None.
### Main reason this problem may NOT be worth solving
**REJECTED:** crowded; weak primary evidence this pass.
### Confidence (Low/Medium/High)
Medium (rejection)

---

## Problem #17
### Problem
Dependabot/Renovate PRs are noise; true breaking upgrades hide in the pile.
### Target user
Maintainers, platform teams.
### Workflow
20 bump PRs → merge all or ignore all.
### Frequency
Daily on active repos.
### Pain
Tidelift: more time on security; xz aftermath increased vetting (66% agreed they vet non-maintainer PRs more). Not specifically Dependabot.
### Current solution
Group PRs; ignore; Socket/Snyk for malware.
### Workaround
Pin everything.
### Evidence
Indirect. oasdiff-like need for changelog intelligence. **Weak.**
### Evidence sources (URLs you inspected)
Tidelift PDF (trust after xz, not Dependabot specifically).
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
High (behavior diff).
### AI opportunity
Summarize changelog — hallucinates.
### Non-AI opportunity
Run tests on the bump; semver parse.
### Data requirements
Lockfile + CI.
### Integration requirements
GitHub.
### Security/privacy concerns
Supply chain.
### Existing competitors
Renovate, Dependabot, Socket, Snyk, Endor.
### Why current solutions are insufficient
Noise remains **INFERENCE**.
### Potential product wedge
Fail only on *API-breaking* bumps via oasdiff/semver, not every patch.
### Main reason this problem may NOT be worth solving
Looks like Renovate config. Weak evidence.
### Confidence (Low/Medium/High)
Low

---

## Problem #18
### Problem
On-call runbooks rot: the page says restart X but X was deleted.
### Target user
On-call engineers.
### Workflow
Page → open runbook → commands fail → tribal knowledge.
### Frequency
Every novel incident.
### Pain
Widely believed; **primary survey this pass: Unknown**.
### Current solution
incident.io, Rootly, Notion, wiki.
### Workaround
Slack the last person.
### Evidence
Insufficient. Flag Low confidence.
### Evidence sources (URLs you inspected)
None specific.
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
Medium (dry-run commands).
### AI opportunity
Hallucinates runbooks — bad.
### Non-AI opportunity
CI: runbook links and CLI flags exist.
### Data requirements
Runbook + prod (dangerous).
### Integration requirements
PagerDuty.
### Security/privacy concerns
Prod access.
### Existing competitors
Incident tooling.
### Why current solutions are insufficient
Unknown.
### Potential product wedge
Lint runbooks against current helm/terraform.
### Main reason this problem may NOT be worth solving
No hard evidence this pass.
### Confidence (Low/Medium/High)
Low

---

## Problem #19 **REJECTED**
### Problem
Vendor security questionnaires (CAIQ/SIG) steal weeks from startups.
### Target user
Startup security/ops.
### Workflow
Customer sends 400 questions → copy-paste last year’s answers.
### Frequency
Every enterprise deal.
### Pain
Real anecdotally; Vanta/Drata/SafeBase/Conveyor exist to sell this.
### Current solution
Those products.
### Workaround
Shared PDF.
### Evidence
Category existence. Independent pain stats **Unknown**.
### Evidence sources (URLs you inspected)
None primary questionnaire-time study this pass.
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
Medium NLP.
### AI opportunity
Draft answers — dangerous if wrong (compliance theater).
### Non-AI opportunity
Answer library.
### Data requirements
Policies.
### Integration requirements
Trust center.
### Security/privacy concerns
Oversharing controls.
### Existing competitors
Vanta, Drata, Whistic, Conveyor, SafeBase.
### Why current solutions are insufficient
Unknown.
### Potential product wedge
None for OFFGRID.
### Main reason this problem may NOT be worth solving
**REJECTED:** crowded; AI-answering questionnaires is compliance theater (see overlays).
### Confidence (Low/Medium/High)
High (rejection)

---

## Problem #20 **REJECTED**
### Problem
Cannot attribute LLM spend to customer/feature.
### Target user
AI app finance/eng.
### Workflow
OpenAI bill shock → spreadsheet.
### Frequency
Monthly.
### Pain
Real; Helicone/Langfuse/OpenMeter/Lago exist.
### Current solution
Those.
### Workaround
One API key.
### Evidence
Helicone 6.2k★; Lago 10.6k★; OpenMeter 2.3k★.
### Evidence sources (URLs you inspected)
GitHub repo pages via `gh`.
### Economic value
Cloud bills. Unknown incremental.
### Technical difficulty (Low/Medium/High + why)
Medium metering.
### AI opportunity
None.
### Non-AI opportunity
Metering.
### Data requirements
Usage events.
### Integration requirements
Gateway.
### Security/privacy concerns
Customer IDs.
### Existing competitors
Lago, OpenMeter, Helicone, Stripe usage, Orb.
### Why current solutions are insufficient
OSS already strong.
### Potential product wedge
None.
### Main reason this problem may NOT be worth solving
**REJECTED:** solved as OSS category.
### Confidence (Low/Medium/High)
High (rejection)

---

## Problem #21
### Problem
PDF tables (invoices, papers, filings) extract wrong line items with silent confidence.
### Target user
Analysts, AP, researchers.
### Workflow
Upload PDF → CSV looks fine → sums don’t match.
### Frequency
Per document batch.
### Pain
Stampli: don’t trust blended accuracy; line-level trails headers. Academic PDF tools (GROBID etc.) exist.
### Current solution
Textract, Document AI, Unstructured, LlamaParse, humans.
### Workaround
Manual rekey.
### Evidence
Stampli accuracy-benchmarks page (vendor). Not a general PDF study.
### Evidence sources (URLs you inspected)
https://www.stampli.com/resources/invoice-extraction-accuracy-benchmarks/
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
High (layout).
### AI opportunity
Vision models. Error-prone — need confidence UX.
### Non-AI opportunity
Show bounding boxes; human confirm.
### Data requirements
PDFs.
### Integration requirements
None for demo.
### Security/privacy concerns
Financial/PII PDFs.
### Existing competitors
AWS/Azure/Google doc AI; AP vendors; Unstructured.
### Why current solutions are insufficient
Silent wrong numbers.
### Potential product wedge
“Extraction with obligatory box-level confirm; refuse a single accuracy %.”
### Main reason this problem may NOT be worth solving
Looks like a Document AI wrapper. Weak unique evidence.
### Confidence (Low/Medium/High)
Low–Medium

---

## Problem #22
### Problem
Support screenshots and session replay leak PII/secrets into tickets and LLM prompts.
### Target user
Support + security.
### Workflow
User sends screenshot of billing page → Zendesk → someone pastes into ChatGPT.
### Frequency
Unknown.
### Pain
Industry DLP products exist (Nightfall, etc.). Session replay vendors sell masking. **Primary stats Unknown this pass.**
### Current solution
DLP; masking; policy.
### Workaround
Ban screenshots.
### Evidence
Insufficient.
### Evidence sources (URLs you inspected)
None strong.
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
Medium CV for screenshot OCR of secrets.
### AI opportunity
OCR. False positives.
### Non-AI opportunity
Regex on ticket text.
### Data requirements
Images.
### Integration requirements
Zendesk.
### Security/privacy concerns
The data *is* the risk.
### Existing competitors
Nightfall, Cyberhaven, FullStory masking, GitHub secret scanning.
### Why current solutions are insufficient
Unknown.
### Potential product wedge
Local screenshot redaction before paste.
### Main reason this problem may NOT be worth solving
Weak evidence; crowded DLP.
### Confidence (Low/Medium/High)
Low

---

## Problem #23
### Problem
Eval/benchmark datasets leak into training; scores are contaminated; teams think they improved.
### Target user
AI researchers, applied LLM teams.
### Workflow
Pick GSM8K/HumanEval → model memorizes → leaderboard.
### Frequency
Every model update.
### Pain
LiveCodeBench et al. exist because of this. Academic.
### Current solution
Held-out private sets; canaries; LiveCodeBench-style live problems.
### Workaround
Don’t believe leaderboards.
### Evidence
Problem is real in literature; **specific contamination rate for a given 2026 model: Unknown this pass.**
### Evidence sources (URLs you inspected)
Not a dedicated contamination paper fetch this pass.
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
High.
### AI opportunity
N-gram overlap detectors.
### Non-AI opportunity
Private canaries.
### Data requirements
Eval set + model outputs.
### Integration requirements
None.
### Security/privacy concerns
Leaking private evals.
### Existing competitors
Academic harnesses; some vendor private evals.
### Why current solutions are insufficient
Public benches remain gamed.
### Potential product wedge
Canary strings in your private eval.
### Main reason this problem may NOT be worth solving
Research tool; not a painful *job* for most professionals weekly.
### Confidence (Low/Medium/High)
Low as OFFGRID product

---

## Problem #24
### Problem
CODEOWNERS / service ownership rot: alerts go to a team that doesn’t exist.
### Target user
Platform orgs.
### Workflow
Page → @ghost-team.
### Frequency
Unknown.
### Pain
Plausible; **no primary this pass.**
### Current solution
Backstage; OpsLevel; spreadsheet.
### Workaround
Broadcast to #eng.
### Evidence
Insufficient.
### Evidence sources (URLs you inspected)
None.
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
Low–Medium.
### AI opportunity
None.
### Non-AI opportunity
Diff CODEOWNERS vs IdP groups.
### Data requirements
Git + Okta.
### Integration requirements
IdP.
### Security/privacy concerns
Org chart.
### Existing competitors
Backstage.
### Why current solutions are insufficient
Unknown.
### Potential product wedge
CI check.
### Main reason this problem may NOT be worth solving
No evidence; looks like a GitHub Action.
### Confidence (Low/Medium/High)
Low

---

## Problem #25
### Problem
Changelogs and semver lie: a “patch” removes a field.
### Target user
Library consumers and publishers.
### Workflow
Upgrade 1.2.3 → 1.2.4 → compile errors.
### Frequency
Per upgrade.
### Pain
Related to #6. oasdiff classifies breaking vs non-breaking.
### Current solution
Keep a changelog; conventional commits; oasdiff; trust.
### Workaround
Read the diff.
### Evidence
oasdiff purpose statement (repo).
### Evidence sources (URLs you inspected)
https://github.com/oasdiff/oasdiff
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
Medium.
### AI opportunity
Summaries lie. Prefer AST diff.
### Non-AI opportunity
Exported API surfacing.
### Data requirements
Two package versions.
### Integration requirements
CI.
### Security/privacy concerns
Low for public libs.
### Existing competitors
oasdiff, semver checkers, revapi, cargo-semver-checks.
### Why current solutions are insufficient
Not universal across languages.
### Potential product wedge
“This patch is actually breaking; here is the symbol.”
### Main reason this problem may NOT be worth solving
Language-specific OSS already exists. Wrapper risk.
### Confidence (Low/Medium/High)
Low–Medium

---

## Problem #26 **REJECTED**
### Problem
Implemented UI ≠ Figma.
### Target user
Designers + frontend.
### Workflow
QA with screenshots.
### Frequency
Every UI PR.
### Pain
Chromatic, Percy, Lost Pixel, Playwright screenshots exist.
### Current solution
Those.
### Workaround
Slack screenshots.
### Evidence
Category existence.
### Evidence sources (URLs you inspected)
Not fetched individually this pass.
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
Medium.
### AI opportunity
“Visual LLM” — flaky.
### Non-AI opportunity
Pixel diff.
### Data requirements
Screenshots.
### Integration requirements
Storybook.
### Security/privacy concerns
Low.
### Existing competitors
Chromatic et al.
### Why current solutions are insufficient
Unknown.
### Potential product wedge
None.
### Main reason this problem may NOT be worth solving
**REJECTED:** crowded visual regression.
### Confidence (Low/Medium/High)
High (rejection)

---

## Problem #27
### Problem
Agent-authored PRs fail to merge for socio-technical reasons (size, CI, no reviewer, duplicates, unwanted features), not just “code quality.”
### Target user
Teams adopting coding agents; OSS maintainers receiving agent PRs.
### Workflow
Agent opens PR → CI red or ignored → human cleanup.
### Frequency
Rising (33k PRs in one 2026 arXiv study of popular repos).
### Pain
Quantified merge differences by task type; qualitative rejection taxonomy.
### Current solution
Human rewrite; close PR.
### Workaround
Don’t let agents open PRs.
### Evidence
arXiv:2601.15195 (33k PRs, 600 qualitative).
### Evidence sources (URLs you inspected)
https://arxiv.org/pdf/2601.15195
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
Medium to *measure*; Hard to *fix* social merge.
### AI opportunity
Agents caused it.
### Non-AI opportunity
PR size gates; require CI; require human assignee.
### Data requirements
GitHub.
### Integration requirements
GitHub App.
### Security/privacy concerns
Repo access.
### Existing competitors
GitHub merge queues; CodeRabbit (wrong tool); policy.
### Why current solutions are insufficient
Study says unmerged PRs are larger, fail CI, lack engagement.
### Potential product wedge
Preflight: “this agent PR will not merge because X (size, no tests, dup of #n).”
### Main reason this problem may NOT be worth solving
GitHub will add agent PR policies. Research-shaped.
### Confidence (Low/Medium/High)
Medium

---

## Problem #28 **REJECTED**
### Problem
Silent warehouse bugs (null spikes, cartesian joins) corrupt metrics without exceptions.
### Target user
Data engineers.
### Workflow
Dashboard up → board meeting → “wait.”
### Frequency
Monte Carlo survey: dozens of incidents/month (vendor).
### Pain
$16k/day for 379 days (first-party).
### Current solution
Monte Carlo et al.; GX 11.8k★; dbt tests.
### Workaround
Business users as monitors.
### Evidence
Business Wire 2023; MC blog.
### Evidence sources (URLs you inspected)
Same as #14.
### Economic value
Vendor-claimed % of revenue — **do not repeat as fact**.
### Technical difficulty (Low/Medium/High + why)
High ML monitors.
### AI opportunity
Vendors adding agents.
### Non-AI opportunity
SQL assertions.
### Data requirements
Warehouse.
### Integration requirements
Snowflake.
### Security/privacy concerns
All the data.
### Existing competitors
The whole data observability market.
### Why current solutions are insufficient
Still happens at MC itself — they used MC.
### Potential product wedge
None for solo.
### Main reason this problem may NOT be worth solving
**REJECTED:** you would be competing with Monte Carlo.
### Confidence (Low/Medium/High)
High (rejection)

---

## Problem #29 **REJECTED**
### Problem
GPU/training jobs idle or retry wastefully.
### Target user
ML engineers.
### Workflow
Spot preemption → pay anyway.
### Frequency
Per job.
### Pain
Real at scale; cloud consoles exist.
### Current solution
W&B, cloud native, Modal.
### Workaround
Watch nvidia-smi.
### Evidence
Not fetched.
### Evidence sources (URLs you inspected)
None.
### Economic value
Unknown.
### Technical difficulty (Low/Medium/High + why)
High.
### AI opportunity
None.
### Non-AI opportunity
Schedulers.
### Data requirements
Cluster metrics.
### Integration requirements
K8s.
### Security/privacy concerns
Infra.
### Existing competitors
Cloud vendors.
### Why current solutions are insufficient
Unknown.
### Potential product wedge
None.
### Main reason this problem may NOT be worth solving
**REJECTED:** no evidence pass; not demoable in a browser well.
### Confidence (Low/Medium/High)
Medium (rejection)

---

## Problem #30 **REJECTED**
### Problem
Meetings need notes and action items.
### Target user
Knowledge workers.
### Workflow
Call → bot joins → summary.
### Frequency
Daily.
### Pain
Now includes bot spam and consent risk. Otter documents all-party consent states. Teams/Zoom admin docs exist to block bots.
### Current solution
Otter, Fireflies, Granola, Zoom AI, etc.
### Workaround
Ban bots; take notes.
### Evidence
https://learn.microsoft.com/en-us/microsoftteams/manage-external-bots  
https://community.zoom.com/meetings-2/how-do-i-disable-ai-notetakers-otter-ai-read-ai-fireflies-ai-etc-from-joining-our-meetings-17388  
https://help.otter.ai/hc/en-us/articles/39339238308503-Recording-Permissions-with-Otter
### Evidence sources (URLs you inspected)
Same.
### Economic value
Large market, also backlash.
### Technical difficulty (Low/Medium/High + why)
Medium transcription.
### AI opportunity
Core — and that’s the problem.
### Non-AI opportunity
Human notes.
### Data requirements
Audio.
### Integration requirements
Calendar — the auto-join vector.
### Security/privacy concerns
Recording law; confidential meetings.
### Existing competitors
Everyone.
### Why current solutions are insufficient
They over-joined. Market is now *blocking*.
### Potential product wedge
None.
### Main reason this problem may NOT be worth solving
**REJECTED:** generic productivity + privacy backlash.
### Confidence (Low/Medium/High)
High (rejection)

---

## Problem #31 **REJECTED**
### Problem
Messy GitHub/Linear/email notes → need a shippable brief (Afterhours default).
### Target user
Solo professional / EM.
### Workflow
Paste notes → LLM outline.
### Frequency
Weekly.
### Pain
Mild coordination, not a documented crisis.
### Current solution
ChatGPT; Linear cycles; Notion.
### Workaround
Write the brief yourself (10 minutes).
### Evidence
No primary source of unmet demand found. Adjacent meeting-notes market is saturated and blocked.
### Evidence sources (URLs you inspected)
README of this repo; WIN-PLAN; Zoom/Teams bot-blocking docs.
### Economic value
Near zero incremental vs ChatGPT.
### Technical difficulty (Low/Medium/High + why)
Low.
### AI opportunity
Entire product.
### Non-AI opportunity
A template. Valueless.
### Data requirements
Notes (may be confidential).
### Integration requirements
None.
### Security/privacy concerns
Pasting company Slack into a hosted model.
### Existing competitors
Every chatbot.
### Why current solutions are insufficient
They aren’t. The job is solved at demo quality.
### Potential product wedge
None that survives originality judging.
### Main reason this problem may NOT be worth solving
**REJECTED:** generic productivity; fails originality; fails product-without-AI.
### Confidence (Low/Medium/High)
High (rejection)

---

## Problem #32 **REJECTED**
### Problem
Need a generic coding copilot / issue-to-PR agent.
### Target user
Developers.
### Workflow
Prompt → code.
### Frequency
Daily.
### Pain
Solved and overcrowded. Mutable.ai acquired 11 Dec 2024 (PitchBook). Adept talent to Amazon. Builder.ai insolvency 2025 after alleged revenue issues (Bloomberg/FT). CodeRabbit noise. arXiv 33k agent PRs often unmerged.
### Current solution
Cursor, Copilot, Claude Code, etc.
### Workaround
Type.
### Evidence
PitchBook Mutable.AI; Adept official; Bloomberg Builder.ai; CodeRabbit HN; arXiv:2601.15195.
### Evidence sources (URLs you inspected)
https://pitchbook.com/profiles/company/512143-21  
https://www.adept.ai/blog/adept-update/  
https://www.bloomberg.com/news/articles/2025-05-20/microsoft-backed-builder-ai-to-enter-insolvency-proceedings  
https://news.ycombinator.com/item?id=42484498  
https://arxiv.org/pdf/2601.15195
### Economic value
Huge for incumbents; zero greenfield for a 3-week clone.
### Technical difficulty (Low/Medium/High + why)
Extremely high to compete.
### AI opportunity
Core.
### Non-AI opportunity
IDEs already exist.
### Data requirements
Repos.
### Integration requirements
GitHub.
### Security/privacy concerns
Code exfil.
### Existing competitors
The entire category.
### Why current solutions are insufficient
They have other problems (noise, merge failure) — that’s #5/#27, not “build another copilot.”
### Potential product wedge
None.
### Main reason this problem may NOT be worth solving
**REJECTED:** forbidden-generic + graveyard.
### Confidence (Low/Medium/High)
High (rejection)

---

## Count

| Verdict | n | IDs |
|---|---|---|
| KEEP for synthesis (not a winner) | 14 | 1,2,3,4,5,6,7,8,9,13,14,21,25,27 |
| Weak / Low confidence keep | 6 | 15,17,18,22,23,24 |
| REJECTED | 12 | 10,11,12,16,19,20,26,28,29,30,31,32 |

32 problems. Additional REJECTED class-level: overlays-as-product, hardware AI, RAG chatbot (not given a number; see landscape).
