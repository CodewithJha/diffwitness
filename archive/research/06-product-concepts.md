# Product concepts — 32, kill-tested

**Date:** 21 September 2026  
**Rule:** derived from identified problems. Not 32 agent variants. **REJECTED** when the idea fails badly.  
**Never say “nobody has built this.”** Use Existing / Our / Material difference.

---

## Product #1
### Name
Canary Session
### One-line description
Long-session regression canaries for coding/LLM agents: replay a 30-minute golden transcript after every prompt/model/CLI change.
### Target user
Teams shipping coding agents.
### Painful workflow
Problem #1 silent regression.
### Current solution
Toy evals; vibe; Langfuse scores.
### Why current solution is insufficient
Hamel: generic scores miss product failures; short evals miss cache/compact bugs (secondary 2026 essays — official Anthropic page unconfirmed).
### Proposed workflow
Check in a golden session → CI replays against the new runtime → fail on missing tool, token-per-turn spike, or assertion.
### Core technical mechanism
Deterministic replay harness + assertions; optional embedding similarity.
### AI role
The system under test. Not the judge if we can avoid it.
### Non-AI role
Assertions, token accounting, config snapshot.
### Data flow
Golden JSONL → runner → report HTML.
### Required integrations
Your agent CLI; optional Langfuse export.
### Hardest technical problem
Non-determinism; provider drift vs your bug.
### Novelty
Existing: Promptfoo/eval harnesses. Our: long-session as first-class. Material: maybe UX, not science.
### Existing competitors
Promptfoo, Langfuse, SWE-bench-style harnesses, vendor evals.
### Competitive gap
Long-session still under-tooled **INFERENCE**.
### 20-second demo
Flip “reasoning effort” in a fixture → canary shows shorter/worse tool trace.
### 2-minute demo
Bisect which config commit broke the golden session.
### Hackathon scope (by 14 Oct)
One agent fixture, one replay, hosted report.
### Post-hackathon scope
More runtimes; flake control.
### Main failure mode
Flaky canaries; “works on demo model.”
### Security/privacy concerns
Golden sessions may contain secrets — sanitize.
### Scalability considerations
Expensive replays.
### Monetization possibility
CI minutes. Crowded.
### User frequency
Per change.
### Switching cost
Low.
### Defensibility
Low.
### Reproducibility test (could a competent engineer copy the core idea in a weekend? Honest answer.)
Yes.
### Product-without-AI test
Still a replay harness. Good.
### Confidence (Low/Medium/High)
Medium  
**Kill risk:** Promptfoo YAML already does this if you bother.

---

## Product #2
### Name
Trace Autopsy
### One-line description
Open-coding UI for 100 production traces: first-failure labels, counts, export of *those* assertions.
### Target user
PM+eng on an AI feature.
### Painful workflow
Problem #2.
### Current solution
Excel; LangSmith.
### Why current solution is insufficient
Hamel 60–80% time looking; vendors sell scores.
### Proposed workflow
Import JSONL → sample → tag first failure → cluster counts → generate promptfoo tests.
### Core technical mechanism
Sampling + labeling UX; optional clustering.
### AI role
Suggest clusters. Human is source of truth.
### Non-AI role
The product.
### Data flow
Traces in browser; optional server.
### Required integrations
Langfuse/LangSmith export.
### Hardest technical problem
Getting real traces into a demo without leaking.
### Novelty
Existing: labeling tools. Our: opinionated Hamel workflow. Material: process, not tech.
### Existing competitors
LangSmith, LabelStudio, Excel.
### Competitive gap
Opinionated 100-trace path.
### 20-second demo
100 traces → 4 failure buckets with counts.
### 2-minute demo
Export 12 unit assertions from the top bucket.
### Hackathon scope (by 14 Oct)
Static fixture traces; no live prod.
### Post-hackathon scope
Live import.
### Main failure mode
Excel is enough.
### Security/privacy concerns
Traces.
### Scalability considerations
Browser memory.
### Monetization possibility
Weak.
### User frequency
Biweekly.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes, a weekend.
### Product-without-AI test
Yes — tagging UI.
### Confidence (Low/Medium/High)
Medium  
**Kill risk:** LangSmith copies the wizard.

---

## Product #3 **REJECTED** as a company; keep as a *feature*
### Name
Judge Swap CI
### One-line description
CI that fails if an LLM-as-judge flips winners when answers are swapped.
### Target user
Eval engineers.
### Painful workflow
Problem #3.
### Current solution
Papers; ad hoc.
### Why current solution is insufficient
Vanilla GPT-4 judges still ship.
### Proposed workflow
Pairwise evals run twice swapped; fail on disagreement rate.
### Core technical mechanism
Position swap + stats.
### AI role
The judge under test.
### Non-AI role
The swap harness.
### Data flow
Eval set → two judge calls → kappa/disagreement.
### Required integrations
Promptfoo.
### Hardest technical problem
Cost of double calls; gold labels.
### Novelty
Existing: Zheng et al. method. Our: CI product. Material: packaging.
### Existing competitors
Promptfoo, research code.
### Competitive gap
Packaging.
### 20-second demo
Swap flips 8/20 → red CI.
### 2-minute demo
Gold-label disagreement report.
### Hackathon scope (by 14 Oct)
Tiny set.
### Post-hackathon scope
More biases (verbosity).
### Main failure mode
Looks like a blog post.
### Security/privacy concerns
Low.
### Scalability considerations
2× judge cost.
### Monetization possibility
No.
### User frequency
Per eval change.
### Switching cost
Low.
### Defensibility
Zero.
### Reproducibility test
Yes, an afternoon.
### Product-without-AI test
N/A — it tests AI.
### Confidence (Low/Medium/High)
Low as product  
**REJECTED:** research demo; Promptfoo feature.

---

## Product #4
### Name
CiteCheck
### One-line description
Paste a memo; every case/DOI/URL is probed for existence and quote-at-pinpoint against public records. No drafting.
### Target user
Lawyers, researchers, analysts using AI writing.
### Painful workflow
Problem #4 Mata.
### Current solution
Westlaw; asking the same model.
### Why current solution is insufficient
Mata: ChatGPT fabricated then confirmed. Research tools generate more cites.
### Proposed workflow
Parse citations → CourtListener/CAP/Crossref/HTTP → red/green + excerpt.
### Core technical mechanism
Citation parser + existence APIs. Optional PDF quote search.
### AI role
Span detection only; or regex/GROBID. Prefer non-AI parse.
### Non-AI role
The lookups.
### Data flow
Document stays in browser; queries are citation strings only.
### Required integrations
CourtListener, Crossref; later Google Scholar ToS risk — avoid scrape.
### Hardest technical problem
Pinpoint quotes; reporter vs docket; unpublished opinions; jurisdiction.
### Novelty
Existing: Westlaw KeyCite; scite. Our: adversarial check of *model output* as the job. Material: verifier not researcher.
### Existing competitors
Westlaw, Lexis, Harvey, scite, Elicit, Consensus.
### Competitive gap
20-second “this brief is lying” vs research suite.
### 20-second demo
Paste Mata-style fake cites → all red with “no such opinion; this reporter citation is Gibbs v. Maxwell House.”
### 2-minute demo
One real opinion + quote match / mismatch.
### Hackathon scope (by 14 Oct)
US case + DOI + URL only; fixture document; hosted.
### Post-hackathon scope
Pinpoint, state courts, local-first PDF.
### Main failure mode
Looks like a search box; Harvey ships a badge; false red on valid obscure cites.
### Security/privacy concerns
Privileged docs — local parse, cite-only egress.
### Scalability considerations
API rate limits (CourtListener).
### Monetization possibility
Per-seat lawyers; crowded.
### User frequency
Per brief.
### Switching cost
Low vs Westlaw lock-in.
### Defensibility
Low; data APIs public.
### Reproducibility test
Core existence check: weekend. Quote-at-pinpoint: no.
### Product-without-AI test
Stronger without LLM.
### Confidence (Low/Medium/High)
Medium–High as investigation candidate

---

## Product #5
### Name
Action Receipt
### One-line description
Independent, agent-unwritable log + approval gate for destructive tools; compare receipt vs the agent’s story.
### Target user
Developers enabling agent shell/DB tools.
### Painful workflow
Problem #5.
### Current solution
HumanLayer; sandboxes; hope.
### Why current solution is insufficient
Autonomy default; incidents rhyme.
### Proposed workflow
Proxy tools → append-only log → require click for drop/delete/pay → UI shows “agent said X; log says Y.”
### Core technical mechanism
Tool proxy; hash-chained log.
### AI role
None.
### Non-AI role
Entire product.
### Data flow
Tool args to log store the agent cannot write.
### Required integrations
MCP or wrapper around `run_terminal_cmd`.
### Hardest technical problem
Covering all runtimes (Cursor, Claude Code, Codex, custom).
### Novelty
Existing: HumanLayer, OS auditd. Our: “receipt vs narrative” demo. Material: UX for the Mata-of-actions.
### Existing competitors
HumanLayer; E2B; vendor plan modes.
### Competitive gap
Demo of lying narrator.
### 20-second demo
Agent claims “irreversible”; receipt shows `DELETE` + backup exists.
### 2-minute demo
Approval gate blocks second delete.
### Hackathon scope (by 14 Oct)
One mock agent + mock DB; hosted log viewer.
### Post-hackathon scope
Real MCP.
### Main failure mode
Judges say “that’s just logging.” HumanLayer exists.
### Security/privacy concerns
Log of secrets; must redact.
### Scalability considerations
Low.
### Monetization possibility
Infra SaaS. Crowded.
### User frequency
Continuous.
### Switching cost
Medium (wrap tools).
### Defensibility
Low.
### Reproducibility test
Weekend for the demo; no for all agents.
### Product-without-AI test
Yes — better.
### Confidence (Low/Medium/High)
Medium

---

## Product #6
### Name
Spec Triangle
### One-line description
Three-way live check: OpenAPI vs production responses vs SDK surface.
### Target user
API platform engineers.
### Painful workflow
Problem #6.
### Current solution
oasdiff; Fern pipelines.
### Why current solution is insufficient
CI often tests new-vs-new (Flowrust/Fern claims).
### Proposed workflow
Upload spec + hit a URL + scan SDK folder → breaking report.
### Core technical mechanism
oasdiff + HTTP probe + language AST/scan.
### AI role
Explain. Optional.
### Non-AI role
Diff/probe.
### Data flow
Spec and HAR; no customer PII if using fixture API.
### Required integrations
None for demo; CI later.
### Hardest technical problem
Auth against live APIs; semantic compatibility.
### Novelty
Existing: oasdiff, Pact, Fern. Our: hosted triangle UX. Material: packaging.
### Existing competitors
oasdiff 1.3k★, Fern, Speakeasy, Postman.
### Competitive gap
Hosted wow-path.
### 20-second demo
Rename a path in spec → live still 200 on old path → SDK missing method → red.
### 2-minute demo
PR comment.
### Hackathon scope (by 14 Oct)
Public fixture API.
### Post-hackathon scope
CI GitHub App.
### Main failure mode
Wrapper. Reproducibility yes.
### Security/privacy concerns
Probing APIs; keys.
### Scalability considerations
Rate limits.
### Monetization possibility
CI seats. Crowded.
### User frequency
Per API change.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes, weekend.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
Medium  
**Kill:** Fern already sells the architecture.

---

## Product #7
### Name
SourceFix (honest a11y)
### One-line description
axe findings mapped to a design-system component with a repro; **explicitly refuses WCAG/EAA certification.**
### Target user
Frontend teams selling to EU, post-overlay hangover.
### Painful workflow
Problem #7.
### Current solution
Overlays (failed); axe dump; agencies.
### Why current solution is insufficient
Overlays FTC’d; axe untriaged.
### Proposed workflow
Paste URL → axe → “Button in `PrimaryCTA` has no accessible name” → suggested PR, not a widget.
### Core technical mechanism
axe-core in browser + source map/component heuristics.
### AI role
None, or dangerous alt-text. Prefer none.
### Non-AI role
axe.
### Data flow
Page HTML to scanner.
### Required integrations
Optional GitHub.
### Hardest technical problem
Mapping DOM to React component honestly.
### Novelty
Existing: axe, Pa11y, Lighthouse. Our: anti-overlay positioning + component mapping. Material: honesty.
### Existing competitors
Deque, axe-core 7.5k★.
### Competitive gap
Marketing against overlays after FTC/EAA.
### 20-second demo
Site with overlay still fails keyboard; SourceFix shows source issue; overlay toggle does not “fix” it.
### 2-minute demo
Open a PR on a fixture repo.
### Hackathon scope (by 14 Oct)
Public fixture site; no compliance language.
### Post-hackathon scope
Storybook.
### Main failure mode
Looks like Lighthouse. Component mapping wrong.
### Security/privacy concerns
Crawling.
### Scalability considerations
SPA timing.
### Monetization possibility
Hard vs Deque.
### User frequency
Per PR.
### Switching cost
Low.
### Defensibility
Low.
### Reproducibility test
Yes (axe wrapper).
### Product-without-AI test
Yes — required.
### Confidence (Low/Medium/High)
Low–Medium

---

## Product #8 **REJECTED**
### Name
DupGate
### One-line description
Maintainer-triggered duplicate issue finder; silent until clicked.
### Target user
OSS maintainers.
### Painful workflow
Problem #8.
### Current solution
Dosu; GitHub Models.
### Why current solution is insufficient
Unsolicited bots.
### Proposed workflow
Button on issue.
### Core technical mechanism
Embeddings.
### AI role
Optional summarize.
### Non-AI role
Similarity.
### Data flow
Public issues.
### Required integrations
GitHub App.
### Hardest technical problem
Trust.
### Novelty
Existing: 20 years of research + GitHub blog recipes.
### Existing competitors
GitHub, Dosu.
### Competitive gap
On-request only.
### 20-second demo
Click → “similar to #12.”
### 2-minute demo
False-positive handling.
### Hackathon scope (by 14 Oct)
One repo fixture.
### Post-hackathon scope
App marketplace.
### Main failure mode
GitHub ships it.
### Security/privacy concerns
Issue injection.
### Scalability considerations
Embeddings cost.
### Monetization possibility
Maintainers don’t pay.
### User frequency
Daily.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
Low  
**REJECTED:** GitHub-owned; no WTP.

---

## Product #9 **REJECTED** as OFFGRID default
### Name
Payout Exceptions
### One-line description
Match Stripe `po_xxx` to bank lines; queue only unmatched.
### Target user
Founders.
### Painful workflow
Problem #9.
### Current solution
Stripe reports; Puzzle.
### Why current solution is insufficient
Manual payouts; timing.
### Proposed workflow
Upload two CSVs → exceptions.
### Core technical mechanism
Join keys.
### AI role
Explain one unmatched row.
### Non-AI role
Join.
### Data flow
CSVs in browser.
### Required integrations
None for demo; Stripe later.
### Hardest technical problem
Real-world netting.
### Novelty
Existing: Stripe, Puzzle.
### Existing competitors
Those.
### Competitive gap
Browser-only CSV for small teams.
### 20-second demo
One unmatched fee line.
### 2-minute demo
Timing vs true miss.
### Hackathon scope (by 14 Oct)
Fixture CSVs.
### Post-hackathon scope
OAuth Stripe — privacy hell.
### Main failure mode
Toy recon.
### Security/privacy concerns
Financial.
### Scalability considerations
Low.
### Monetization possibility
Accountants already.
### User frequency
Monthly.
### Switching cost
Accounting lock-in.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
Low  
**REJECTED** for OFFGRID: sensitive data + incumbents. Keep CSV demo only if all else fails.

---

## Product #10 **REJECTED**
### Name
Billy Junior
### One-line description
Invoice 3-way match toy.
### Target user
AP.
### Painful workflow
#10.
### Current solution
Stampli et al.
### Why current solution is insufficient
N/A — we cannot win.
### Proposed workflow
Three PDFs → exceptions.
### Core technical mechanism
OCR.
### AI role
Extraction.
### Non-AI role
Tolerances.
### Data flow
PDFs.
### Required integrations
ERP.
### Hardest technical problem
ERP.
### Novelty
Existing: entire AP category.
### Existing competitors
Stampli, Ramp, Bill.com.
### Competitive gap
None.
### 20-second demo
Mismatched qty.
### 2-minute demo
Same.
### Hackathon scope (by 14 Oct)
Toy.
### Post-hackathon scope
Impossible solo.
### Main failure mode
Tutorial CRUD+OCR.
### Security/privacy concerns
Financial.
### Scalability considerations
N/A.
### Monetization possibility
N/A.
### User frequency
Daily.
### Switching cost
ERP.
### Defensibility
None.
### Reproducibility test
Yes, and that’s bad.
### Product-without-AI test
Still OCR suite.
### Confidence (Low/Medium/High)
High  
**REJECTED.**

---

## Product #11 **REJECTED**
### Name
Flag Reaper
### One-line description
Delete stale flags.
### Target user
LD customers.
### Painful workflow
#11.
### Current solution
Vega.
### Why current solution is insufficient
Incumbent building it.
### Proposed workflow
PR to remove flags.
### Core technical mechanism
Code refs.
### AI role
LD Vega already.
### Non-AI role
Grep.
### Data flow
Flag API.
### Required integrations
LD+GitHub.
### Hardest technical problem
Safety.
### Novelty
Existing: Vega.
### Existing competitors
LaunchDarkly.
### Competitive gap
None.
### 20-second demo
N/A.
### 2-minute demo
N/A.
### Hackathon scope (by 14 Oct)
N/A.
### Post-hackathon scope
N/A.
### Main failure mode
Incumbent.
### Security/privacy concerns
Prod flags.
### Scalability considerations
N/A.
### Monetization possibility
N/A.
### User frequency
Quarterly.
### Switching cost
High (LD).
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
High  
**REJECTED.**

---

## Product #12 **REJECTED**
### Name
Flake Pack
### One-line description
Evidence pack for a flaky test.
### Target user
Platform.
### Painful workflow
#12.
### Current solution
Datadog, Buildkite.
### Why current solution is insufficient
Crowded.
### Proposed workflow
Same-SHA pass/fail gallery.
### Core technical mechanism
Telemetry.
### AI role
None.
### Non-AI role
All.
### Data flow
CI.
### Required integrations
GHA.
### Hardest technical problem
Telemetry.
### Novelty
Existing: Datadog.
### Existing competitors
Those.
### Competitive gap
None.
### 20-second demo
N/A.
### 2-minute demo
N/A.
### Hackathon scope (by 14 Oct)
N/A.
### Post-hackathon scope
N/A.
### Main failure mode
Incumbent.
### Security/privacy concerns
Logs.
### Scalability considerations
N/A.
### Monetization possibility
N/A.
### User frequency
Daily.
### Switching cost
High.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
High  
**REJECTED.**

---

## Product #13
### Name
Docs Click
### One-line description
Playwright the getting-started page against staging; fail if a documented control is missing.
### Target user
DevRel.
### Painful workflow
#13.
### Current solution
Manual; Chromatic.
### Why current solution is insufficient
Docs not executed.
### Proposed workflow
Parse numbered steps → click → screenshot fail.
### Core technical mechanism
Browser automation.
### AI role
Parse steps. Risky; CSS selectors from humans better.
### Non-AI role
Playwright.
### Data flow
URL pair.
### Required integrations
None.
### Hardest technical problem
Judge-demo flake; auth; SPAs.
### Novelty
Existing: Playwright, Checkly. Our: docs as the script. Material: thin.
### Existing competitors
Checkly, Datadog synthetics, Swimm.
### Competitive gap
Docs-specific.
### 20-second demo
Step 3 button gone → red with screenshot.
### 2-minute demo
Diff of docs vs DOM.
### Hackathon scope (by 14 Oct)
One public docs+app pair.
### Post-hackathon scope
Auth.
### Main failure mode
Flaky demo on judging day.
### Security/privacy concerns
Credentials.
### Scalability considerations
Browsers.
### Monetization possibility
Synthetics crowded.
### User frequency
Per release.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes if steps are structured.
### Confidence (Low/Medium/High)
Low–Medium  
**Kill:** Checkly exists; demo reliability.

---

## Product #14
### Name
SQL Grain Diff
### One-line description
Paste two “revenue” queries; show grain/join differences that would double-count.
### Target user
Analysts.
### Painful workflow
#14 cartesian joins.
### Current solution
Code review; Monte Carlo after the fact.
### Why current solution is insufficient
Business finds it first (vendor survey).
### Proposed workflow
Parse SQL → diagram grain → warn fanout.
### Core technical mechanism
SQL parser (sqlglot).
### AI role
None required.
### Non-AI role
Static analysis.
### Data flow
SQL text only.
### Required integrations
None.
### Hardest technical problem
SQL dialects; without data you cannot prove.
### Novelty
Existing: SQL linters, MC lineage. Our: two-query compare. Material: small.
### Existing competitors
Monte Carlo, sqlfluff, dbt.
### Competitive gap
No warehouse needed for demo.
### 20-second demo
OR-join fanout like MC’s $16k story (synthetic SQL).
### 2-minute demo
Rewrite suggestion (deterministic).
### Hackathon scope (by 14 Oct)
One dialect.
### Post-hackathon scope
Explain with samples.
### Main failure mode
Looks like a homework parser.
### Security/privacy concerns
SQL may contain secrets.
### Scalability considerations
Low.
### Monetization possibility
Weak.
### User frequency
When numbers fight.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
Low–Medium

---

## Product #15 **REJECTED**
### Name
TrackLint
### One-line description
PR linter for analytics events vs tracking plan.
### Target user
Growth eng.
### Painful workflow
#15.
### Current solution
Segment protocols.
### Why current solution is insufficient
Weak evidence.
### Proposed workflow
AST of `track()`.
### Core technical mechanism
Lint.
### AI role
None.
### Non-AI role
All.
### Data flow
Repo.
### Required integrations
CI.
### Hardest technical mechanism
Languages.
### Novelty
Existing: Segment.
### Existing competitors
Segment.
### Competitive gap
None evidenced.
### 20-second demo
Missing property.
### 2-minute demo
Same.
### Hackathon scope (by 14 Oct)
One language.
### Post-hackathon scope
N/A.
### Main failure mode
Homework linter.
### Security/privacy concerns
Low.
### Scalability considerations
N/A.
### Monetization possibility
No.
### User frequency
Per PR.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
Low  
**REJECTED:** weak evidence; lint rule.

---

## Product #16 **REJECTED**
### Name
SRM Lamp
### One-line description
Sample ratio mismatch checker.
### Target user
Experimenters.
### Painful workflow
#16.
### Current solution
Statsig et al.
### Why current solution is insufficient
Crowded.
### Proposed workflow
Upload assignments.
### Core technical mechanism
Chi-square.
### AI role
None.
### Non-AI role
Stats.
### Data flow
CSV.
### Required integrations
None.
### Hardest technical problem
None.
### Novelty
Existing: every experiment platform.
### Existing competitors
Statsig, Eppo, GrowthBook.
### Competitive gap
None.
### 20-second demo
p-value.
### 2-minute demo
Same.
### Hackathon scope (by 14 Oct)
Toy.
### Post-hackathon scope
N/A.
### Main failure mode
Stats 101.
### Security/privacy concerns
User IDs.
### Scalability considerations
N/A.
### Monetization possibility
No.
### User frequency
Per experiment.
### Switching cost
Platform.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
High  
**REJECTED.**

---

## Product #17 **REJECTED**
### Name
Breaking Bump
### One-line description
Only fail Dependabot when exported API breaks.
### Target user
Maintainers.
### Painful workflow
#17.
### Current solution
Renovate grouping.
### Why current solution is insufficient
Weak evidence.
### Proposed workflow
Build two versions; revapi.
### Core technical mechanism
API diff.
### AI role
Changelog hallucination — avoid.
### Non-AI role
Diff.
### Data flow
Packages.
### Required integrations
CI.
### Hardest technical problem
Polyglot.
### Novelty
Existing: cargo-semver-checks, revapi.
### Existing competitors
Those + Socket.
### Competitive gap
Thin.
### 20-second demo
Deleted export.
### 2-minute demo
Same.
### Hackathon scope (by 14 Oct)
One language.
### Post-hackathon scope
N/A.
### Main failure mode
OSS already.
### Security/privacy concerns
Install scripts.
### Scalability considerations
Builds.
### Monetization possibility
No.
### User frequency
Daily.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
Low  
**REJECTED:** polyglot OSS exists.

---

## Product #18 **REJECTED**
### Name
Runbook Lint
### One-line description
CI that URLs/commands in runbooks still exist.
### Target user
On-call.
### Painful workflow
#18.
### Current solution
Wikis.
### Why current solution is insufficient
No evidence this pass.
### Proposed workflow
Parse markdown; HTTP and `--help`.
### Core technical mechanism
Link checker.
### AI role
None — would invent steps.
### Non-AI role
All.
### Data flow
Markdown.
### Required integrations
Repo.
### Hardest technical problem
Auth, dangerous commands.
### Novelty
Existing: lychee, markdown link check.
### Existing competitors
Those.
### Competitive gap
None.
### 20-second demo
404.
### 2-minute demo
Same.
### Hackathon scope (by 14 Oct)
Toy.
### Post-hackathon scope
N/A.
### Main failure mode
Link checker.
### Security/privacy concerns
Prod.
### Scalability considerations
N/A.
### Monetization possibility
No.
### User frequency
Unknown.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
Low  
**REJECTED:** no evidence; wrapper.

---

## Product #19 **REJECTED**
### Name
Questionnaire Autofill
### One-line description
LLM fills SIG/CAIQ.
### Target user
Startups.
### Painful workflow
#19.
### Current solution
Vanta.
### Why current solution is insufficient
Crowded; theater.
### Proposed workflow
RAG policies → answers.
### Core technical mechanism
RAG — forbidden generic.
### AI role
Core — dangerous if wrong.
### Non-AI role
Library.
### Data flow
Policies.
### Required integrations
Trust center.
### Hardest technical problem
Wrong answers = fraud-adjacent.
### Novelty
Existing: Vanta AI.
### Existing competitors
Vanta, Drata.
### Competitive gap
None.
### 20-second demo
N/A.
### 2-minute demo
N/A.
### Hackathon scope (by 14 Oct)
N/A.
### Post-hackathon scope
N/A.
### Main failure mode
Compliance lie (see overlays).
### Security/privacy concerns
Overshare.
### Scalability considerations
N/A.
### Monetization possibility
Crowded.
### User frequency
Per deal.
### Switching cost
High.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Answer library without LLM is the honest product — already exists.
### Confidence (Low/Medium/High)
High  
**REJECTED.**

---

## Product #20 **REJECTED**
### Name
Token Ledger
### One-line description
Cost per customer for LLM calls.
### Target user
AI apps.
### Painful workflow
#20.
### Current solution
Lago, OpenMeter, Helicone.
### Why current solution is insufficient
OSS exists.
### Proposed workflow
Meter events.
### Core technical mechanism
Metering.
### AI role
None.
### Non-AI role
All.
### Data flow
Events.
### Required integrations
Gateway.
### Hardest technical problem
Scale.
### Novelty
Existing: Lago 10.6k★.
### Existing competitors
Those.
### Competitive gap
None.
### 20-second demo
N/A.
### 2-minute demo
N/A.
### Hackathon scope (by 14 Oct)
N/A.
### Post-hackathon scope
N/A.
### Main failure mode
Rebuild Lago.
### Security/privacy concerns
Customer IDs.
### Scalability considerations
High.
### Monetization possibility
Crowded.
### User frequency
Continuous.
### Switching cost
Medium.
### Defensibility
None.
### Reproducibility test
No (scale) / yes (demo).
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
High  
**REJECTED.**

---

## Product #21
### Name
Box Confirm
### One-line description
PDF table extraction that refuses a single accuracy number; every cell has a box and a human confirm.
### Target user
Analysts.
### Painful workflow
#21.
### Current solution
Textract; Unstructured.
### Why current solution is insufficient
Silent wrong lines (Stampli: be skeptical of blended %).
### Proposed workflow
PDF → overlay boxes → tab through cells.
### Core technical mechanism
Layout parser + HITL.
### AI role
Proposal only.
### Non-AI role
Confirm UI.
### Data flow
PDF in browser.
### Required integrations
None.
### Hardest technical problem
Hard PDFs; not unique.
### Novelty
Existing: label UIs. Our: refuse blended accuracy as a feature. Material: positioning.
### Existing competitors
Document AI vendors; LabelStudio; Stampli.
### Competitive gap
Honesty UX.
### 20-second demo
Wrong total highlighted vs printed total.
### 2-minute demo
Correct one line; export.
### Hackathon scope (by 14 Oct)
One table type.
### Post-hackathon scope
Learning per vendor — that’s Stampli.
### Main failure mode
Wrapper on pdf.js + a model.
### Security/privacy concerns
PDFs.
### Scalability considerations
CPU.
### Monetization possibility
Crowded.
### User frequency
Batch.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Mostly yes.
### Product-without-AI test
Manual box drawing still works; slower.
### Confidence (Low/Medium/High)
Low

---

## Product #22 **REJECTED**
### Name
Paste Guard
### One-line description
Redact secrets in screenshots before clipboard leave.
### Target user
Support.
### Painful workflow
#22.
### Current solution
DLP.
### Why current solution is insufficient
Weak evidence.
### Proposed workflow
Local OCR; mask.
### Core technical mechanism
OCR.
### AI role
Optional.
### Non-AI role
Regex.
### Data flow
Local.
### Required integrations
None.
### Hardest technical problem
False positives.
### Novelty
Existing: DLP, GitHub scanning.
### Existing competitors
Nightfall et al.
### Competitive gap
Local-first.
### 20-second demo
Mask PAN.
### 2-minute demo
Same.
### Hackathon scope (by 14 Oct)
Toy.
### Post-hackathon scope
N/A.
### Main failure mode
DLP clone.
### Security/privacy concerns
The images.
### Scalability considerations
N/A.
### Monetization possibility
Enterprise DLP.
### User frequency
Unknown.
### Switching cost
Policy.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Regex.
### Confidence (Low/Medium/High)
Low  
**REJECTED:** weak evidence; crowded.

---

## Product #23 **REJECTED**
### Name
Canary Eval
### One-line description
Private canary strings to detect contamination.
### Target user
Researchers.
### Painful workflow
#23.
### Current solution
Live benches.
### Why current solution is insufficient
Academic.
### Proposed workflow
Insert canaries; probe model.
### Core technical mechanism
Memorization test.
### AI role
The model under test.
### Non-AI role
Canaries.
### Data flow
Prompts.
### Required integrations
API.
### Hardest technical problem
Not a weekly professional job.
### Novelty
Existing: academic.
### Existing competitors
LiveCodeBench etc.
### Competitive gap
None.
### 20-second demo
Canary recalled.
### 2-minute demo
Same.
### Hackathon scope (by 14 Oct)
Toy.
### Post-hackathon scope
N/A.
### Main failure mode
Paper.
### Security/privacy concerns
Eval leak.
### Scalability considerations
N/A.
### Monetization possibility
No.
### User frequency
Rare.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
N/A.
### Confidence (Low/Medium/High)
Low  
**REJECTED:** not the hackathon buyer.

---

## Product #24 **REJECTED**
### Name
Owner Diff
### One-line description
CODEOWNERS vs IdP.
### Target user
Platform.
### Painful workflow
#24.
### Current solution
Backstage.
### Why current solution is insufficient
No evidence.
### Proposed workflow
CI.
### Core technical mechanism
Diff.
### AI role
None.
### Non-AI role
All.
### Data flow
Files.
### Required integrations
Okta.
### Hardest technical problem
None.
### Novelty
Existing: Backstage.
### Existing competitors
Backstage.
### Competitive gap
None.
### 20-second demo
Ghost team.
### 2-minute demo
Same.
### Hackathon scope (by 14 Oct)
Toy.
### Post-hackathon scope
N/A.
### Main failure mode
GitHub Action.
### Security/privacy concerns
Org chart.
### Scalability considerations
N/A.
### Monetization possibility
No.
### User frequency
Unknown.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
Low  
**REJECTED.**

---

## Product #25
### Name
Honest Patch
### One-line description
Compare two published package versions; fail if a “patch” removes exports.
### Target user
Library authors/consumers.
### Painful workflow
#25.
### Current solution
cargo-semver-checks; revapi; oasdiff for APIs.
### Why current solution is insufficient
Not hosted; not polyglot.
### Proposed workflow
Upload two tarballs / npm packs.
### Core technical mechanism
Export surface diff.
### AI role
None.
### Non-AI role
All.
### Data flow
Packages.
### Required integrations
Registries optional.
### Hardest technical problem
Languages.
### Novelty
Existing: language tools. Our: hosted npm-first. Material: packaging.
### Existing competitors
Language-specific OSS.
### Competitive gap
Hosted wow for JS.
### 20-second demo
Deleted export in 1.2.4 vs 1.2.3.
### 2-minute demo
Report.
### Hackathon scope (by 14 Oct)
JS/TS only.
### Post-hackathon scope
More languages.
### Main failure mode
`api-extractor` already.
### Security/privacy concerns
Installing tarballs (supply chain).
### Scalability considerations
Sandbox installs.
### Monetization possibility
Weak.
### User frequency
Per release.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
Low–Medium

---

## Product #26 **REJECTED**
### Name
Pixel Cop
### One-line description
Figma vs impl screenshot.
### Target user
Designers.
### Painful workflow
#26.
### Current solution
Chromatic.
### Why current solution is insufficient
Crowded.
### Proposed workflow
Screenshot diff.
### Core technical mechanism
Pixels.
### AI role
Useless.
### Non-AI role
All.
### Data flow
Images.
### Required integrations
Figma.
### Hardest technical problem
None new.
### Novelty
Existing: Chromatic.
### Existing competitors
Chromatic, Percy.
### Competitive gap
None.
### 20-second demo
N/A.
### 2-minute demo
N/A.
### Hackathon scope (by 14 Oct)
N/A.
### Post-hackathon scope
N/A.
### Main failure mode
Clone.
### Security/privacy concerns
UI.
### Scalability considerations
N/A.
### Monetization possibility
Crowded.
### User frequency
Per PR.
### Switching cost
Storybook.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
High  
**REJECTED.**

---

## Product #27
### Name
Merge Preflight
### One-line description
Before an agent opens a PR: predict non-merge (too big, no tests, dup, CI likely red) and block.
### Target user
Teams using coding agents.
### Painful workflow
#27 arXiv 33k PRs.
### Current solution
Hope; human close.
### Why current solution is insufficient
Unmerged agent PRs are larger, fail CI, lack engagement.
### Proposed workflow
Agent output → gates → “won’t merge because 12 files, 0 tests, similar to #88.”
### Core technical mechanism
Heuristics from the paper’s quantitative findings.
### AI role
Optional dup text. Size/CI are non-AI.
### Non-AI role
Gates.
### Data flow
Diff stats.
### Required integrations
GitHub.
### Hardest technical problem
Predicting CI without running it.
### Novelty
Existing: merge queues. Our: agent-specific preflight from empirical failure modes. Material: policy product.
### Existing competitors
GitHub, CodeRabbit (wrong layer).
### Competitive gap
Prevent open, don’t nitpick.
### 20-second demo
Block a 40-file agent diff with no tests.
### 2-minute demo
Allow a 2-file docs PR (paper: docs merge more).
### Hackathon scope (by 14 Oct)
Heuristic gates + fixture PRs.
### Post-hackathon scope
Learn per repo.
### Main failure mode
GitHub policy; false blocks.
### Security/privacy concerns
Repo.
### Scalability considerations
Low.
### Monetization possibility
Uncertain.
### User frequency
Per agent PR.
### Switching cost
Medium.
### Defensibility
Low.
### Reproducibility test
Heuristics: weekend. Quality: no.
### Product-without-AI test
Yes — the gates are the product.
### Confidence (Low/Medium/High)
Medium

---

## Product #28 **REJECTED**
### Name
Mini Carlo
### One-line description
Warehouse monitors.
### Target user
Data eng.
### Painful workflow
#28.
### Current solution
Monte Carlo.
### Why current solution is insufficient
You cannot beat them in 3 weeks.
### Proposed workflow
N/A.
### Core technical mechanism
ML monitors.
### AI role
Vendor agents.
### Non-AI role
SQL tests.
### Data flow
Warehouse.
### Required integrations
Snowflake.
### Hardest technical problem
Everything.
### Novelty
Existing: MC, GX.
### Existing competitors
Those.
### Competitive gap
None.
### 20-second demo
N/A.
### 2-minute demo
N/A.
### Hackathon scope (by 14 Oct)
N/A.
### Post-hackathon scope
N/A.
### Main failure mode
Enterprise.
### Security/privacy concerns
Data.
### Scalability considerations
High.
### Monetization possibility
Crowded.
### User frequency
Continuous.
### Switching cost
High.
### Defensibility
None for us.
### Reproducibility test
Demo yes; product no.
### Product-without-AI test
dbt tests.
### Confidence (Low/Medium/High)
High  
**REJECTED.**

---

## Product #29 **REJECTED**
### Name
GPU Watch
### One-line description
Idle GPU alerts.
### Target user
ML eng.
### Painful workflow
#29.
### Current solution
Cloud.
### Why current solution is insufficient
No evidence pass.
### Proposed workflow
N/A.
### Core technical mechanism
Metrics.
### AI role
None.
### Non-AI role
All.
### Data flow
Cluster.
### Required integrations
K8s.
### Hardest technical problem
Access.
### Novelty
Existing: cloud.
### Existing competitors
GCP/AWS, W&B.
### Competitive gap
None.
### 20-second demo
N/A.
### 2-minute demo
N/A.
### Hackathon scope (by 14 Oct)
N/A.
### Post-hackathon scope
N/A.
### Main failure mode
Not a browser demo.
### Security/privacy concerns
Infra.
### Scalability considerations
N/A.
### Monetization possibility
N/A.
### User frequency
Unknown.
### Switching cost
Cloud.
### Defensibility
None.
### Reproducibility test
N/A.
### Product-without-AI test
Yes.
### Confidence (Low/Medium/High)
Medium  
**REJECTED.**

---

## Product #30 **REJECTED**
### Name
Yet Another Notetaker
### One-line description
Meeting notes.
### Target user
Everyone.
### Painful workflow
#30.
### Current solution
Everyone.
### Why current solution is insufficient
Market is blocking bots.
### Proposed workflow
N/A.
### Core technical mechanism
ASR.
### AI role
Core.
### Non-AI role
None valuable.
### Data flow
Audio.
### Required integrations
Calendar.
### Hardest technical problem
Consent.
### Novelty
Existing: Otter et al.
### Existing competitors
The category.
### Competitive gap
None.
### 20-second demo
N/A.
### 2-minute demo
N/A.
### Hackathon scope (by 14 Oct)
N/A.
### Post-hackathon scope
N/A.
### Main failure mode
Privacy.
### Security/privacy concerns
Recording law.
### Scalability considerations
N/A.
### Monetization possibility
Crowded.
### User frequency
Daily.
### Switching cost
Low.
### Defensibility
None.
### Reproducibility test
Yes.
### Product-without-AI test
No.
### Confidence (Low/Medium/High)
High  
**REJECTED.**

---

## Product #31 **REJECTED**
### Name
Afterhours (scaffold default)
### One-line description
Notes → shippable brief.
### Target user
EM.
### Painful workflow
#31.
### Current solution
ChatGPT.
### Why current solution is insufficient
It isn’t insufficient.
### Proposed workflow
Paste → brief.
### Core technical mechanism
LLM.
### AI role
All.
### Non-AI role
Template.
### Data flow
Notes to model.
### Required integrations
None.
### Hardest technical problem
None — that’s the tell.
### Novelty
Existing: every chatbot.
### Existing competitors
ChatGPT, Notion AI, Linear.
### Competitive gap
None.
### 20-second demo
The fixture already.
### 2-minute demo
Same.
### Hackathon scope (by 14 Oct)
Already scaffolded.
### Post-hackathon scope
None worth doing.
### Main failure mode
Originality = 0.
### Security/privacy concerns
Confidential notes.
### Scalability considerations
N/A.
### Monetization possibility
No.
### User frequency
Weekly.
### Switching cost
Zero.
### Defensibility
None.
### Reproducibility test
An hour.
### Product-without-AI test
Fails.
### Confidence (Low/Medium/High)
High  
**REJECTED.**

---

## Product #32 **REJECTED**
### Name
Copilot Clone
### One-line description
Generic coding agent.
### Target user
Devs.
### Painful workflow
#32.
### Current solution
Cursor et al.
### Why current solution is insufficient
Wrong problem.
### Proposed workflow
N/A.
### Core technical mechanism
LLM.
### AI role
All.
### Non-AI role
IDE.
### Data flow
Code.
### Required integrations
GitHub.
### Hardest technical problem
Competing with Cursor.
### Novelty
Existing: the category.
### Existing competitors
Everyone; Adept/Mutable/Builder as failure modes.
### Competitive gap
None.
### 20-second demo
N/A.
### 2-minute demo
N/A.
### Hackathon scope (by 14 Oct)
Forbidden generic.
### Post-hackathon scope
N/A.
### Main failure mode
Graveyard.
### Security/privacy concerns
Code.
### Scalability considerations
N/A.
### Monetization possibility
Incumbents.
### User frequency
Daily.
### Switching cost
IDE.
### Defensibility
None.
### Reproducibility test
No (quality) / yes (toy).
### Product-without-AI test
No.
### Confidence (Low/Medium/High)
High  
**REJECTED.**

---

## Concept counts

| Status | n | IDs |
|---|---|---|
| Investigate further | 8 | 1 Canary Session, 2 Trace Autopsy, 4 CiteCheck, 5 Action Receipt, 6 Spec Triangle, 7 SourceFix, 14 SQL Grain Diff, 27 Merge Preflight |
| Thin / low confidence | 3 | 13 Docs Click, 21 Box Confirm, 25 Honest Patch |
| REJECTED | 21 | 3,8–12,15–20,22–24,26,28–32 |
