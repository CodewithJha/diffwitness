# Raw problem candidates — HACK47 OFFGRID

**Date of research:** 21 Sep 2026  
**Researcher role:** Adversarial product-research analyst (evidence only; no application code)  
**Hackathon constraint:** Solo builder; submit 14 Oct 2026; one painful job; hosted demo URL required. Avoid generic AI assistants, RAG, CRUD+LLM, generic agents, generic productivity, generic dashboards, generic coding copilots. No Web3/blockchain/offensive-cyber.

## Method (so this file can be audited)

1. Ran `agent-reach doctor --json` (2026-09-21). Usable: YouTube (yt-dlp), Bilibili search API, V2EX public API, RSS/feedparser, Jina Reader. GitHub `gh` executable present (auth not live-verified). Exa configured via mcporter; **hit free MCP 429 after ~8 queries**. Reddit CLI **off**. Twitter CLI **not installed**.
2. Search: `mcporter call exa.web_search_exa query="..." numResults=8` until rate-limited; then Cursor WebSearch. **Search snippets are not evidence.** Quotes below come from pages fetched with `curl -sL "https://r.jina.ai/URL"`, Cursor WebFetch, `gh`, or HN Algolia JSON. Failed fetches are labeled **FETCH FAILED**.
3. GitHub: `gh search issues`. HN: `https://hn.algolia.com/api/v1/search`. V2EX: public API (hot topics on 2026-09-21 were consumer/lifestyle, not used as professional-pain evidence).
4. Never fabricate companies, quotes, stats, URLs, funding, pricing. Unknown = **Unknown**. Inferences labeled **INFERENCE**.
5. Aggressively try to disprove. Weak evidence or already-solved → REJECTED or DEAD END.

## Fetch / coverage caveats

- Reddit CLI off → Reddit threads found via search were only used if another fetch (Jina/WebFetch) succeeded. Several Reddit URLs were **not** used as evidence.
- Twitter CLI not installed → skipped.
- BusinessWire NeuBird press release: Jina returned **403**. Used NeuBird’s own blog instead.
- TUM flaky-tests cost PDF (`mediatum.ub.tum.de`): Jina **429**. **Not quoted.** Do not treat Exa abstract snippets as fetched evidence.
- GitHub HTML via Jina often returns site chrome, not issue body. Playwright / Hugging Face issue quotes below are from Cursor WebSearch’s page fetch of those URLs (same session), not from Jina HTML.
- Vendor surveys (NeuBird, Vanta, Ardent) are **primary for “someone surveyed N people”** but **not independent**. Flagged.

## Verdict totals (this file)

| Verdict | Count |
|---------|------:|
| KEEP-FOR-SYNTHESIS | 18 |
| REJECTED | 20 |
| **Total candidates** | **38** |
| Dead ends (investigated, killed as product classes) | 12 |

---

## Candidate index

| # | Problem | Verdict | Confidence |
|---|---------|---------|------------|
| 1 | Domain-specific LLM evals / error analysis | KEEP-FOR-SYNTHESIS | High |
| 2 | LLM-as-judge position & verbosity bias | KEEP-FOR-SYNTHESIS | High |
| 3 | Training–serving skew | KEEP-FOR-SYNTHESIS | High |
| 4 | Flaky tests destroying CI signal | KEEP-FOR-SYNTHESIS | High |
| 5 | Alert fatigue causing missed outages | KEEP-FOR-SYNTHESIS | Medium |
| 6 | Vendor security questionnaires as deal toil | KEEP-FOR-SYNTHESIS | High |
| 7 | Dependabot / vuln-scanner false positives | KEEP-FOR-SYNTHESIS | High |
| 8 | OSS maintainer issue-triage burnout | KEEP-FOR-SYNTHESIS | High |
| 9 | Independent reproduction of ML papers | KEEP-FOR-SYNTHESIS | High |
| 10 | Data leakage in ML-based science | KEEP-FOR-SYNTHESIS | High |
| 11 | Stale feature flags as live branches | KEEP-FOR-SYNTHESIS | High |
| 12 | Jupyter non-linear / unreproducible notebooks | KEEP-FOR-SYNTHESIS | High |
| 13 | Invoice exception matching (AP) | KEEP-FOR-SYNTHESIS | Medium |
| 14 | Compliance evidence / screenshot theater | KEEP-FOR-SYNTHESIS | Medium |
| 15 | Teachers assessing AI-written student work | KEEP-FOR-SYNTHESIS | Medium |
| 16 | Human-in-the-loop for production agents | KEEP-FOR-SYNTHESIS | Medium |
| 17 | Local-first whole-file sync conflicts | KEEP-FOR-SYNTHESIS | Medium |
| 18 | E2E flake mislabeled as pass (Playwright) | KEEP-FOR-SYNTHESIS | Medium |
| 19 | Paste GitHub/Linear/email → shippable brief | REJECTED | High |
| 20 | Generic chatbot / AI assistant | REJECTED | High |
| 21 | Meeting notes / action items | REJECTED | High |
| 22 | Second brain / PKM | REJECTED | High |
| 23 | Generic RAG | REJECTED | High |
| 24 | Generic dashboard | REJECTED | High |
| 25 | Generic coding copilot | REJECTED | High |
| 26 | Email triage | REJECTED | High |
| 27 | Calendar / scheduling | REJECTED | High |
| 28 | Jupyter git merge as a product | REJECTED | High |
| 29 | Security-questionnaire autofill SaaS | REJECTED | High |
| 30 | Flaky-test detection SaaS | REJECTED | High |
| 31 | PII-in-logs sanitizer | REJECTED | Medium |
| 32 | OpenAPI spec drift as a product | REJECTED | Medium |
| 33 | Silent dbt test failures as a product | REJECTED | Medium |
| 34 | AI auto-grading as a product | REJECTED | Medium |
| 35 | Dataset license-tag cleanup | REJECTED | Medium |
| 36 | CRDT sync engine as a product | REJECTED | High |
| 37 | AI code-review rubber-stamp fixer | REJECTED | Low |
| 38 | Weekly status report from GitHub | REJECTED | High |

---

## Candidates

### 1. Domain-specific LLM evals / error analysis is the actual job

- **Who hurts:** AI engineers, PMs, and founders shipping LLM products (not model researchers running MMLU).
- **Workflow:** After an MVP, they cannot tell if a prompt/model/tool change is progress. They “vibe check,” then stall. The real work is reading traces, labeling first-failure, writing assertions, and only then automating judges.
- **Frequency:** Hamel/Shreya FAQ: typical review cycles “2–4 weeks”; “review at least 100+ fresh traces each review cycle.” Consultants report **60–80% of development time** on error analysis and evaluation.
- **Pain evidence (fetched):**
  - Hamel Husain, *Your AI Product Needs Evals* (fetched 2026-09-21): “I’ve found that unsuccessful products almost always share a common root cause: **a failure to create robust evaluation systems.**” Also: “To know whether your AI product is working, you need a way to measure success beyond vibe checks (which are useful, but not enough).” Also: “It’s almost always where people get stuck when building AI products.” Also: “Don’t rely on generic evaluation frameworks… create an evaluation system specific to your problem.” URL: https://hamel.dev/blog/posts/evals/
  - Same authors, *LLM Evals FAQ* (fetched): “Start with error analysis, not infrastructure. Spend 30 minutes manually reviewing 20–50 LLM outputs whenever you make significant changes.” “In the projects we’ve worked on, we’ve spent 60-80% of our development time on error analysis and evaluation.” URL: https://hamel.dev/blog/posts/evals-faq/index.html
  - Eugene Yan, *Task-Specific LLM Evals that Do & Don't Work* (fetched; published 2024-03-31): “If you’ve ran off-the-shelf evals for your tasks, you may have found that most don’t work. They barely correlate with application-specific performance and aren’t discriminative enough to use in production. As a result, we could spend weeks and still not have evals that reliably measure how we’re doing on our tasks.” Voiceflow case: intent-classification evals “helped them catch a 10% performance drop” on a GPT-3.5 version upgrade. URL: https://eugeneyan.com/writing/evals/
  - HN: Eugene Yan post 182 points / 46 comments: https://news.ycombinator.com/item?id=42366481 (Algolia; comments not fully mined).
- **Current solutions named:** LangSmith, Braintrust, Arize Phoenix, Humanloop, in-house unit-test harnesses, Maven “AI Evals for Engineers and PMs” course, LLM-as-judge.
- **Why they may be insufficient (evidence):** Hamel: generic frameworks measure the wrong thing. Eugene: n-gram / vector-similarity evals “are not discriminative enough to cut a threshold on.” Judge models themselves need a mini-eval (Hamel: “Model-based evaluation is a meta-problem”).
- **Why this may NOT be worth solving:** Crowded (every LLM observability vendor). The *pain* is looking at data, which is a human job; a 3-week hackathon demo easily becomes a generic eval dashboard (forbidden). Technical depth is real only if the wow-path is a *specific* eval for a *specific* task.
- **Confidence:** High
- **Suggested:** KEEP-FOR-SYNTHESIS

### 2. LLM-as-judge systematic bias (position, verbosity, self-preference)

- **Who hurts:** Anyone using an LLM to score another LLM (product evals, RLHF, leaderboards, “AI reviewer”).
- **Workflow:** Pairwise or single-score judging of open-ended outputs; order of answers and length silently flip the winner.
- **Frequency:** Zheng et al. measured this on MT-bench; not a rare edge case.
- **Pain evidence (fetched):**
  - Zheng et al., *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*, arXiv HTML v2 (fetched): “We found all of them exhibit strong position bias. Most LLM judges favor the first position… The position bias can be very significant. Only GPT-4 outputs consistent results in more than 60% of cases.” Example: “When GPT-3.5’s answer is positioned first, GPT-4 considers GPT-3.5’s answer more detailed and superior. However, upon switching the positions… GPT-4’s judgement flips.” Verbosity: “repetitive list” attack — “all LLMs may be prone to verbosity bias.” URL: https://arxiv.org/html/2306.05685v2
  - Same paper: GPT-4 can match humans at “an agreement rate exceeding 80%” *after* mitigations — so the bias is real **and** partially solvable. That is a source conflict with “just use GPT-4 as judge.”
- **Current solutions named:** Swap-and-require-consistency; randomize order; few-shot judge (paper: GPT-4 consistency 65.0% → 77.5%, but “$4× more expensive”); human labels; Chatbot Arena.
- **Why they may be insufficient:** Swap doubles cost. Few-shot “may introduce new biases.” Domain tasks (medical/legal/code) remain “domain blindness” in later practitioner writing (**INFERENCE** from Hamel/Eugene, not in Zheng).
- **Why this may NOT be worth solving:** Academic result is from 2023; every eval vendor already documents swap. A hackathon “unbiased judge” is a research demo, not a painful *job* unless tied to a concrete workflow (e.g. grading coding-agent patches).
- **Confidence:** High (bias exists); Medium (as a product)
- **Suggested:** KEEP-FOR-SYNTHESIS

### 3. Training–serving skew

- **Who hurts:** ML/applied-ML engineers with separate train and serve pipelines (ranking, ads, recsys, now LLM feature pipelines).
- **Workflow:** Features computed one way in batch training, another way online; table joins change between train and serve; feedback loops.
- **Frequency:** Google documents it as a recurring production failure mode, not a one-off.
- **Pain evidence (fetched):**
  - Google, *Rules of Machine Learning* (fetched 2026-09-21; page shows last-updated metadata 2025-08-25 in Exa; Jina body fetched): “Training-serving skew is a difference between performance during training and performance during serving.” Causes: “A discrepancy between how you handle data in the training and serving pipelines”; “A change in the data between when you train and when you serve”; “A feedback loop.” “We have observed production machine learning systems at Google with training-serving skew that negatively impacts performance.” Rule #29: “The best way to make sure that you train like you serve is to save the set of features used at serving time, and then pipe those features to a log to use them at training time.” “Teams that have made this measurement at Google were sometimes surprised by the results.” Rule #32: “try not to use two different programming languages between training and serving. That decision will make it nearly impossible for you to share code.” URL: https://developers.google.com/machine-learning/guides/rules-of-ml
- **Current solutions named:** Log features at serving time; shared feature code; TensorFlow Transform / Feast / Tecton-style feature stores; training-serving identity tests.
- **Why they may be insufficient:** Feature stores are heavy and still allow join-time drift (Rule #31: table contents change between train and serve). LLM apps reintroduce skew via prompt templates, tools, and RAG corpora that differ between eval and prod (**INFERENCE**).
- **Why this may NOT be worth solving:** Classic BigTech problem; Feast/Tecton already exist. Hard to demo in a judge’s browser in 90 seconds unless scoped to a tiny, visible skew (e.g. “this prompt/tool schema in eval ≠ prod”).
- **Confidence:** High
- **Suggested:** KEEP-FOR-SYNTHESIS

### 4. Flaky tests destroying CI signal

- **Who hurts:** Software engineers on any team with UI/integration tests; build cops; anyone whose merge is gated on green CI.
- **Workflow:** Test fails; engineer reruns; it passes; they merge or ignore; real bugs hide in the noise. Google: ignoring legitimate failures is common.
- **Frequency:** Google (2016, fetched): **~1.5% of all test runs** flaky; **almost 16% of tests** have some flakiness; **~84% of pass→fail transitions** involve a flaky test. Google (2017, fetched): 4.2M tests; ~63k flaky in a week; large tests 14% flaky vs small 0.5%.
- **Pain evidence (fetched):**
  - John Micco, *Flaky Tests at Google and How We Mitigate Them*, 27 May 2016 (WebFetch 2026-09-21): “we see a continual rate of about 1.5% of all test runs reporting a ‘flaky’ result.” “Almost 16% of our tests have some level of flakiness associated with them! … more than 1 in 7 of the tests written by our world-class engineers occasionally fail in a way not caused by changes to the code or tests.” “about 84% of the transitions we observe from pass to fail involve a flaky test!” “It is quite common to ignore legitimate failures in flaky tests due to the high number of false-positives.” “If 1.5% of test results are flaky, 15 tests will likely fail” on a 1000-test project. “It is human nature to ignore alarms when there is a history of false signals.” URL: https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html
  - Jeff Listfield, *Where do our flaky tests come from?*, 17 Apr 2017 (Jina): “Google has around 4.2 million tests… around 63 thousand have a flaky run over the course of a week… still causes significant drag on our engineers.” “0.5% of our small tests were flaky, 1.6% of our medium tests… and 14% of our large tests.” Android emulator tests: 25.46% flaky. URL: https://testing.googleblog.com/2017/04/where-do-our-flaky-tests-come-from.html
  - HN: 85 points / 38 comments on the 2017 post: https://news.ycombinator.com/item?id=14146841
- **Current solutions named:** Rerun failing tests; quarantine; mark-as-flaky (fail only after 3 consecutive failures — Google calls this “hardly a perfect solution”); Trunk Flaky Tests; Playwright retries; Buildkite.
- **Why they may be insufficient:** Google: insertion rate ≈ fix rate, so you are “stuck with” a background flake rate. Quarantine “could easily mask a real race condition.” Mark-as-flaky delays discovery of real breaks (45 min for a 15-min test × 3).
- **Why this may NOT be worth solving:** Decade-old, well-known; SaaS exists (Trunk, etc.). A generic “flake dashboard” is a dashboard. Depth only if the job is *diagnosing a specific class* (e.g. Playwright serial-mode mislabel — see #18) rather than “detect flakes.”
- **Confidence:** High
- **Suggested:** KEEP-FOR-SYNTHESIS

### 5. Alert fatigue causing missed outages

- **Who hurts:** SREs, on-call software engineers, DevOps/IT ops at orgs ≥100 employees (survey frame).
- **Workflow:** 10+ alerts/day, most non-actionable; engineers suppress; a real signal is ignored; customer reports the outage.
- **Frequency:** NeuBird 2026 survey (n=1,039, Feb 2026): 77% of on-call teams get ≥10 alerts/day; 57% say <30% actionable; 83% ignore/dismiss at least occasionally; 44% had an outage tied to ignored/suppressed alerts; 78% had an incident with **no alert at all**.
- **Pain evidence (fetched):**
  - NeuBird blog, *State of Production Reliability Report: 78% Outgrow Monitoring*, published 2026-04-20 (Jina): “78% of organizations have experienced at least one incident where no alert fired at all. Almost 40% of incidents are discovered by customers before the engineering team knows anything is wrong.” “Alert fatigue ranked as the top operational challenge in our survey. Above insufficient automation.” “When 70% of alerts don’t require action, engineers adapt…” “44% of organizations experienced an outage in the past year directly linked to an ignored or suppressed alert.” “Nearly 40% of organizations report more than a quarter of their on-call engineers are showing burnout symptoms tied to incident management.” Exec vs practitioner: “74% of C-suite respondents say their organization actively uses AI for incident management. Only 39% of practitioners say the same.” Runbooks: “57% of C-suite describe their runbooks as comprehensive… Only 34% of practitioners agree.” “For engineers in the middle of an outage, an outdated runbook is often worse than no runbook at all.” URL: https://neubird.ai/blog/78pc-outgrow-monitoring-state-of-production-reliability
  - **Caveat:** NeuBird sells an “autonomous production operations” agent. This is a vendor-funded survey. BusinessWire reprint **FETCH FAILED (403)**.
- **Current solutions named:** PagerDuty, Datadog, SLO burn-rate alerts, symptom-vs-cause paging, AIOps vendors including NeuBird.
- **Why they may be insufficient:** Vendor itself reports practitioners don’t see the AI that executives bought. Runbook rot is acknowledged by the same survey.
- **Why this may NOT be worth solving:** Extremely crowded; “AI SRE” is the default 2026 hackathon bait. Hard to demo a real incident. Judges may see another copilot for alerts.
- **Confidence:** Medium (pain real; independence of stats low)
- **Suggested:** KEEP-FOR-SYNTHESIS (for synthesis of *reliability jobs*, not as the product)

### 6. Vendor security questionnaires as deal-blocking toil

- **Who hurts:** Founders/CTOs/SEs at small SaaS selling to companies ~100+ employees; separately, **buyer** security teams doing TPRM.
- **Workflow:** Prospect sends SIG/CAIQ/custom spreadsheet (100–800+ questions). Seller copies answers from memory/SOC2. Inconsistencies trigger more rounds. Deal stalls.
- **Frequency:** Ask HN (2023) describes this as routine at 100+ employee clients. Vanta/Sapio 2025 (n=2,500 leaders): buyers spend **7 hours/week** on vendor reviews ≈ **9 working weeks/year**.
- **Pain evidence (fetched):**
  - Ask HN: *How small startups deal with long security questionnaires from clients?*, 27 Jun 2023, 22 points / 20 comments (Jina): OP: “Whenever we get a client with around 100+ head count, they ask to fill their own security assessment. It takes a lot of time as it has sometimes 100+ questions. We can't also deny them… We're too small to hire someone for this and as a founder, my time can surely be used better somewhere else.” SkyPuncher: “Even with a SOC2, many companies will simply issue a questionnaire out of policy. It cost them nothing.” “They’re still a mental drain to do manually.” temikus: “So many startups spend millions running a compliance program that brings in thousands.” URL: https://news.ycombinator.com/item?id=36488436
  - Related HN: *Our Dumb Security Questionnaire* 149 points / 88 comments: https://news.ycombinator.com/item?id=25793230 (Hangar URL **Jina DNS fail**; comments not fully fetched). *Launch HN: Stacksi* 134 points / 89 comments: https://news.ycombinator.com/item?id=26513040
  - Vanta *State of Trust Report* Oct 2025 PDF (WebSearch fetch): “Today, organizations spend 7 hours per week (an average of 9 working weeks a year) on vendor security reviews and risk assessments—up two whole weeks from the year prior.” “We’ve lost the plot, and now almost two-thirds say they spend more time proving security rather than improving it.” “spending ~10 hours each week on compliance tasks like policy reviews, evidence collection, and vendor attestations.” “61% spend more time proving security rather than improving it” / “64% say today’s security frameworks feel like security theater” (PDF infographic lines). Methodology: Sapio Research for Vanta, 2,500 leaders US/UK/Australia, July 2025. URL: https://8588479.fs1.hubspotusercontent-na1.net/hubfs/8588479/State%20of%20Trust%20Report%20-%20October%202025.pdf
  - **Source conflict:** SaaS-vendor blogs claim “67% of B2B deals require a questionnaire” / “78% delayed” citing Vanta. The **fetched Vanta PDF** supports weekly hours and “proving vs protecting,” **not** the 67%/78% deal-delay figures. Treat 67%/78% as **unverified** until the 2024 report is fetched.
- **Current solutions named:** Vanta, Drata, Whistic, SafeBase, Wolfia, Stacksi, Hyperproof, CAIQ-on-file, trust centers.
- **Why they may be insufficient:** HN: questionnaires continue *even with SOC2*. SkyPuncher (works in the space): “This is only going to continue this way.” Tools are expensive for a 2-person shop (HN: Stacksi “$400/month lowest plan” — user-reported 2023, may be stale).
- **Why this may NOT be worth solving:** Packed category. Autofill from a knowledge base is CRUD+LLM. Liability if the model lies on a questionnaire. Demo can look like a spreadsheet copilot.
- **Confidence:** High (pain); High (do not build generic autofill)
- **Suggested:** KEEP-FOR-SYNTHESIS (narrow slice only, e.g. *evidence-cited* answers with a human sign-off — see also #14, #16)

### 7. Dependabot / vulnerability-scanner false positives

- **Who hurts:** Maintainers (esp. Go, but pattern is general); security-minded app teams drowning in dependency PRs.
- **Workflow:** Transitive CVE; scanner opens thousands of PRs; none of the code paths call the vulnerable symbol; humans stop reading alerts.
- **Frequency:** Filippo’s 2026 case: “thousands of PRs” for a one-line fix in a method “essentially no one uses”; false alert on a repo that only imported an unaffected subpackage.
- **Pain evidence (fetched):**
  - Filippo Valsorda, *Turn Dependabot Off*, published 2026-02-20 (Jina): “Dependabot is a noise machine. It makes you feel like you’re doing work, but you’re actually discouraging more useful work.” “Yesterday, Dependabot opened thousands of PRs against unaffected repositories.” Wycheproof “does not import the affected filippo.io/edwards25519 package at all.” “False positive alerts are not only a waste of time, they also reduce security by causing alert fatigue and making proper triage impractical.” “A business-as-usual dependency bump is a woefully insufficient remediation for an actual vulnerability, but it’s the only practical response to the constant stream of low-value Dependabot alerts.” “I often get issues and PRs demanding I update the dependencies of my projects due to vulnerabilities that don’t affect them… extra toil dropped at the feet of open source maintainers.” URL: https://words.filippo.io/dependabot/
  - HN: 647 points / 185 comments: https://news.ycombinator.com/item?id=47094192
- **Current solutions named:** govulncheck (symbol-level), OSV, Renovate, Dependabot cooldown (GitHub changelog 2026-07-14, 209 points / 143 comments — Algolia), Snyk, GitHub Advisory.
- **Why they may be insufficient:** Filippo: Dependabot still alerts at module level; even “compatibility scores” can be “nonsensical.” Ecosystem-wide toil is dumped on maintainers.
- **Why this may NOT be worth solving:** GitHub can (and is) changing Dependabot. A “smarter Dependabot” for one language is a scanner, not a 90-second wow-path, and sits next to cyber (rules: no offensive-cyber; defensive scanners still look like security products).
- **Confidence:** High
- **Suggested:** KEEP-FOR-SYNTHESIS (as *alert-quality / evidence* problem, not as a vuln scanner)

### 8. OSS maintainer issue-triage burnout

- **Who hurts:** Solo/small-team maintainers of popular libraries; kernel maintainers (related LWN thread exists; not fully fetched).
- **Workflow:** Morning: 10 new issues, 2 actionable, all must be read; duplicates; missing repro; stale-bot hiding the pile.
- **Frequency:** Intel 2023 OSS survey (Phoronix writeup of emailed results): **maintainer burnout 45%** — top challenge, ahead of documentation/onboarding 41%.
- **Pain evidence (fetched):**
  - Phoronix, *Intel Survey Finds Maintainer Burnout & Documentation Top Open-Source Challenges*, 20 Feb 2024 (Jina): “the top open-source challenge faced was maintainer burnout at 45%… followed by documentation/onboarding at 41% and then maintaining sustainability at 37%.” Caveat: “I haven't seen Intel post this data on any public web page yet, but per the email…” Sample size **Unknown** from this page. URL: https://www.phoronix.com/news/Intel-2023-Survey-Results
  - Mathew Sachin, *What happened to Captura?*, 9 Apr 2023 (Jina): “As the sole contributor, I was struggling with burnout from balancing feature development and bug fixes.” “License enforcement is hard… platforms like the Microsoft Store are slow to act.” “Burnout is real in solo open-source projects. Without a co-maintainer or clear scope boundaries, the maintenance load compounds quickly.” Project had 8k+ stars. URL: https://mathewsachin.github.io/blog/2023/04/09/captura-unmaintained.html
  - HN: Captura post 82 points / 84 comments: https://news.ycombinator.com/item?id=40615723
  - **Discounted:** DEV.to “I analyzed 50 GitHub repos” (2025-12-30) contains tidy quotes (“I spend more time categorizing issues…”) but reads like SEO/AI content with no dataset/repo list. **Not used as evidence.**
- **Current solutions named:** stale-bot, issue templates, GitHub Discussions, Copilot issue triage, paid maintainers, Homebrew “Avoiding Burnout” doc (HN hit; not fetched).
- **Why they may be insufficient:** Captura died anyway. Intel survey still ranks burnout #1 in 2023. Stale-bot is widely hated as hiding valid issues (**INFERENCE** from common knowledge; not fetched here).
- **Why this may NOT be worth solving:** “AI issue triage” is a generic agent. Duplicate-detection is a commodity. The painful *job* that might be demoable is **repro minimization** or **license-violation takedown**, not chat-on-issues.
- **Confidence:** High (burnout exists); Low (as an original product)
- **Suggested:** KEEP-FOR-SYNTHESIS

### 9. Independent reproduction of ML papers

- **Who hurts:** Researchers, applied scientists, engineers trying to reimplement a paper from the PDF (not `pip install` the authors’ repo).
- **Workflow:** Read paper → implement algorithm without looking at authors’ code → compare metrics. Missing hyperparameters, cluster requirements, equation/code mismatch.
- **Frequency:** Raff 2019: **162 / 255 papers reproduced (63.5%)** independently, 1984–2017 sample, implementations 2012–2017.
- **Pain evidence (fetched via WebSearch of NeurIPS PDF / arXiv 1909.06674, same session):**
  - Edward Raff, *A Step Toward Quantifying Independently Reproducible Machine Learning Research*, NeurIPS 2019: “we obtained features from 255 papers.” “After this selection process, we are left with 255 papers, of which 162 (63.5%) were successfully replicated and 93 were not.” Independent = did not look at authors’ code. URL: https://arxiv.org/abs/1909.06674 and https://proceedings.neurips.cc/paper/2019/file/c429429bf1f2af051f2021dc92a8ebea-Paper.pdf
  - **Note:** A 2023 ReScience-C meta-analysis (arXiv 2305.12571, search snippet only, PDF not fully quoted here) reports higher success when reproducers *use* artifacts — different definition. **Source conflict:** 63.5% independent vs ~81% with artifacts. Both can be true.
- **Current solutions named:** Papers with Code, NeurIPS reproducibility checklists, ReScience C, Docker, author code release.
- **Why they may be insufficient:** Raff’s point is code release ≠ independent reproducibility. Checklists don’t write the missing hyperparameter.
- **Why this may NOT be worth solving:** Academic audience; GPU cost; a “paper repro agent” looks like a generic coding agent. Hard to wow in 90 seconds unless the job is *extracting a runnable spec from a PDF* (narrow).
- **Confidence:** High (the failure rate); Medium (product)
- **Suggested:** KEEP-FOR-SYNTHESIS

### 10. Data leakage in ML-based science

- **Who hurts:** Scientists using ML as evidence for a scientific claim; reviewers; downstream policymakers who trust inflated AUCs.
- **Workflow:** Feature selection on full data; no train/test split; temporal leakage; duplicates across split → published “high accuracy” that evaporates.
- **Frequency:** Princeton running list (page updated May 2024, fetched): **41 papers from 30 fields, collectively affecting 648 papers**.
- **Pain evidence (fetched):**
  - Kapoor & Narayanan project site, *Leakage and the Reproducibility Crisis in ML-based Science* (Jina; “Published Time: Sat, 18 May 2024”): “We find 41 papers from 30 fields where errors have been found, collectively affecting 648 papers and in some cases leading to wildly overoptimistic conclusions. In each case, data leakage causes errors in the modeling process.” “reproducibility failures in ML-based science are systemic.” “despite the urgency… there aren’t yet any systemic solutions.” URL: https://reproducible.cs.princeton.edu/
  - Patterns in the table include “No train-test split,” “Feature selection on train and test set,” “Temporal leakage” across medicine, neuroimaging, software engineering, etc.
- **Current solutions named:** Model info sheets (proposed in their Patterns paper — ScienceDirect page in search; full paper not re-quoted here), textbooks, reviewer checklists.
- **Why they may be insufficient:** Authors: “there aren’t yet any systemic solutions.” Errors persist across 30 fields.
- **Why this may NOT be worth solving:** Not a “job an adult professional already has” in the hackathon demo sense unless scoped to *auditing a notebook/CSV for leakage* (could be a sharp wow-path). Easy to look like an academic tool. Avoid health-claim framing.
- **Confidence:** High
- **Suggested:** KEEP-FOR-SYNTHESIS

### 11. Stale feature flags as live, forgotten branches

- **Who hurts:** Product engineers at companies using flags for rollout/experiments (Uber-scale documented; same pattern at smaller shops).
- **Workflow:** Ship behind flag → 100% roll out → forget to delete → incident from a toggle, a default-on fallback, or dead code that still compiles.
- **Frequency:** Uber (fetched): Piranha used to remove **“around two thousand stale feature flags and their related code.”** They run it as an ongoing pipeline.
- **Pain evidence (fetched):**
  - Uber Engineering, *Introducing Piranha* (Jina; page timestamp 2026-09-21): “after a feature has either been 100 percent rolled out… the feature flag in the code becomes obsolete. These nonfunctional feature flags represent technical debt, making it difficult for developers to work on the codebase, and can bloat our apps… Removing this debt can be time-intensive for our engineers, preventing them from working on newer features.” “developers do not always perform this simple post-cleanup process.” Effects: reason about obsolete control flow; unreachable code; flags “might still be made executable in unexpected cases (e.g. due to a flag management backend error), reducing the overall reliability”; extra tests; slower builds. URL: https://www.uber.com/blog/piranha/
- **Current solutions named:** LaunchDarkly/Split/Unleash; Uber Piranha (OSS); GrowthBook stale-flag guides (vendor; not used as primary); expiry dates / owners.
- **Why they may be insufficient:** Uber built a custom AST rewriter because process didn’t happen. Deleting the flag without collapsing code can *turn a feature back on* via defaults (practitioner blogs exist; not treated as primary here).
- **Why this may NOT be worth solving:** Piranha already OSS. A “flag janitor” is an internal tool; wow-path needs a scary before/after in the browser (flag graph → delete PR).
- **Confidence:** High
- **Suggested:** KEEP-FOR-SYNTHESIS

### 12. Jupyter notebooks that cannot be re-run top-to-bottom

- **Who hurts:** Data scientists, ML engineers, researchers sharing `.ipynb` as the artifact of record.
- **Workflow:** Execute cells out of order; commit; colleague `Run All` and gets different results or failures. Hidden state, missing markdown, plots without narrative.
- **Frequency:** JetBrains Datalore, Oct 2020 snapshot: **9,720,000** public notebooks; **36%** “not consistent” (non-linear execution order).
- **Pain evidence (fetched):**
  - JetBrains, *We Downloaded 10,000,000 Jupyter Notebooks From Github*, 17 Dec 2020 (Jina): “It’s a known problem for Jupyter Notebooks that not all the notebooks can be reproduced.” “If code cells were not originally executed in a linear order, we can’t be sure that the result of linear order execution will be the same.” “36% of the notebooks we investigated fell into this category.” Also: “50% of notebooks contain fewer than 4 Markdown cells and more than 66 code cells.” 71.90% contain markdown; 42.13% contain image outputs. URL: https://blog.jetbrains.com/datalore/2020/12/17/we-downloaded-10-000-000-jupyter-notebooks-from-github-this-is-what-we-learned/
  - **Limitation (also on that page’s Reddit discussion, not used as evidence):** they inspected execution counters, they did not re-execute 10M notebooks. Non-linear ≠ guaranteed fail.
- **Current solutions named:** Restart-and-run-all culture; Papermill; nbconvert; Jupytext; Datalore; VS Code notebooks.
- **Why they may be insufficient:** The published corpus still shows 36% inconsistent. Hidden state is the point of notebooks.
- **Why this may NOT be worth solving:** Overlaps #28 (git merge). “Make my notebook reproducible” is a known IDE feature. Depth if the job is *prove this notebook’s outputs match a frozen spec* (eval + provenance).
- **Confidence:** High
- **Suggested:** KEEP-FOR-SYNTHESIS

### 13. Invoice exception matching (accounts payable)

- **Who hurts:** AP / finance teams; small-business operators paying suppliers; anyone matching PO ↔ invoice ↔ receipt.
- **Workflow:** Invoice arrives; missing PO, price/qty mismatch, coding error; human exception queue; supplier chases payment; late fees.
- **Frequency:** Ardent Partners *State of ePayables 2025* blog (fetched 2026-01-22 page): **average invoice exception rate 18.4%**; staff time on supplier inquiries **21.9%**; avg cost **$9.84**/invoice; avg time **8.2 days**.
- **Pain evidence (fetched):**
  - Ardent Partners, *State of ePayables (Part Nine)*, 22 Jan 2026 (Jina): “AP groups have a long way to go to solve their invoice exception problem. The invoice exception rate for AP departments is, on average, 18.4%. Exceptions are typically the biggest single reason why the benchmarks in Table 1 are not lower.” “the amount of staff time dealing with suppliers overall (21.9%) is in no small part caused by exceptions. They continue to be the bane of AP’s existence.” “39% of all AP leaders admitting that their overall potential is stunted by the sheer volume of manual, low-value work.” URL: https://payablesplace.ardentpartners.com/2026/01/state-of-epayables-part-nine-ap-benchmarks-and-best-in-class-performance/
  - **Caveat:** Analyst firm; sample size for 2025 **Unknown on this page** (a secondary site claimed n=204; not verified here).
  - **Source conflict:** Ardent “AP Metrics that Matter in 2025” PDF (WebSearch fetch) says exception rates “dropped dramatically to 14% in 2024.” Different report years/definitions. Do not collapse 14% and 18.4% into one number.
- **Current solutions named:** Coupa, Bill.com, Tipalti, Medius, Basware, OCR vendors, Excel.
- **Why they may be insufficient:** Two decades of “ePayables” and exceptions remain “the bane.” Best-in-class still not zero.
- **Why this may NOT be worth solving:** Enormous incumbent market. Looks like fintech CRUD+OCR. Weak originality for OFFGRID. Freelancer invoicing is a different, smaller job (not evidenced here).
- **Confidence:** Medium
- **Suggested:** KEEP-FOR-SYNTHESIS (as “exception queue” pattern, probably not the product)

### 14. Compliance evidence / screenshot theater

- **Who hurts:** Security/GRC people; startup CTOs collecting SOC 2 evidence; the same humans filling questionnaires (#6).
- **Workflow:** Auditor asks for a screenshot of a setting; someone clicks through AWS/GitHub/Okta; stores PNG in a folder; repeats next year. Time spent *proving* security, not improving it.
- **Frequency:** Vanta 2025 (fetched PDF): ~10 hours/week on compliance tasks; 12 working weeks/year; 61% more time proving than protecting.
- **Pain evidence (fetched):** Vanta State of Trust Oct 2025 PDF (quoted in #6): “death by documentation… diverting skilled teams to screenshot-based evidence collection and one-off auditor requests tracked in spreadsheets.” “61% spend more time proving security rather than improving it.” **Vendor-funded.**
- **Current solutions named:** Vanta, Drata, Secureframe, Sprinto, auditor portals.
- **Why they may be insufficient:** The same report that sells automation still finds 12 weeks/year. HN (#6): SOC 2 does not stop questionnaires.
- **Why this may NOT be worth solving:** Crowded GRC. Screenshot bots are brittle. Easy to ship a “compliance copilot.”
- **Confidence:** Medium
- **Suggested:** KEEP-FOR-SYNTHESIS (provenance/evidence job, not a GRC platform)

### 15. Teachers assessing work when students have generative AI

- **Who hurts:** Secondary and university teachers; anyone whose job is fair assessment.
- **Workflow:** Homework looks fluent; plagiarism checkers miss LLM text; 84% of UK secondary teachers have **not** changed assessment methods; policies missing.
- **Frequency:** BCS survey part two: **5,298 secondary teachers**, 2,600 schools (UK).
- **Pain evidence (fetched via WebSearch of BCS PDF):**
  - BCS AI paper, Dec 2024: ChatGPT “quickly gained a negative reputation, often seen a way to ‘cheat at homework’ and presenting challenges around fair assessment.” “Almost two thirds of teachers we asked (64%) are not using ChatGPT at all.” “Some 41% of teachers said their school did not have an agreed approach to AI, and 17% didn’t know.” “The vast majority (84%) of teachers have not changed the way they assess students’ work, despite the availability of AI tools. And only 41% of teachers are regularly checking homework / coursework for plagiarism content from the web.” URL: https://www.bcs.org/media/11kcvxvn/bcs-ai-paper-december-2024.pdf
  - arXiv 2506.07955 *Implementation Considerations for Automated AI Grading* (HTML fetched): 19-teacher K–12 pilot; “they distrusted automated scoring and emphasized the need for human oversight.” Of 13 survey returners: 42% said AI feedback was not useful (24% vague, 18% incorrect/misleading). URL: https://arxiv.org/html/2506.07955v1
- **Current solutions named:** Turnitin, GPTZero, MagicSchool, in-class assessment, oral exams.
- **Why they may be insufficient:** BCS: most have not changed methods; many schools have no policy. Auto-scoring is distrusted in the pilot.
- **Why this may NOT be worth solving:** Detector arms race (already lost). “AI grader” is generic. The keepable job is **process-based evidence of work** (keystroke/version provenance), which overlaps #16/#14 and is ethically sensitive.
- **Confidence:** Medium
- **Suggested:** KEEP-FOR-SYNTHESIS (narrow: provenance of student work, not detectors)

### 16. Human-in-the-loop for production agents (approvals that are themselves risky)

- **Who hurts:** Teams trying to let agents touch production (drop tables, send email, migrate DB) without a 3-month eval program.
- **Workflow:** Agent proposes a side effect → must ask a human → but asking the wrong human is also a failure → nested approvals.
- **Frequency:** Unknown at population level. Strong qualitative HN launch (354 points / 196 comments, Nov 2024).
- **Pain evidence (fetched):**
  - Launch HN: Human Layer (YC F24), 26 Nov 2024 (Jina): Founder: “customers were (rightfully!) opposed to giving AI agents direct access to production systems. Getting AI to ‘production grade’ reliability is a function of ‘how risky is this task’… We didn’t have the 3+ months it would have taken to sink into evals, fine tuning, and prompt engineering to get to… 99.9+% reliability.” Nested: “Our buyers wanted the agent to ask stakeholders for approval, but first *they* wanted to approve the ‘ask for approval’ action itself.” HN user chalkycrimp: “Startup owner using AI with this need - needless to say, a real problem. I've considered DIYing an internal service for this.” URL: https://news.ycombinator.com/item?id=42247368
- **Current solutions named:** HumanLayer, Slack approvals, GitHub CODEOWNERS, ITSM change tickets, “human as tool.”
- **Why they may be insufficient:** HN: pricing/steepness push DIY; commenter says the loop “isn’t complicated to make” — **pain is real, willingness-to-pay for a platform is contested.**
- **Why this may NOT be worth solving:** HumanLayer already exists (YC). Building “approvals for agents” is a generic agent product. Remaining gap may be **local-first / audit-trail of who approved what with which evidence** (hackathon-sized if extremely narrow).
- **Confidence:** Medium
- **Suggested:** KEEP-FOR-SYNTHESIS

### 17. Local-first whole-file sync conflicts

- **Who hurts:** Professionals using local-first apps across phone + laptop (example: Super Productivity).
- **Workflow:** Edit offline on two devices; sync a single JSON; conflict dialog; choose local XOR remote; lose the other device’s work.
- **Frequency:** Unknown. Repeated GitHub issues on a popular app.
- **Pain evidence (fetched via WebSearch of GitHub issues):**
  - super-productivity#4829 *WebDav sync is not working*: user powers on laptop, “It said there are some conflicts and need to decide which changes are fine, remote or local. I choose Remote… but it doesn't keep remote changes.” Maintainer: “You will get a conflict dialog. You can then choose which data is the one you want to use.” On a new-task-on-phone vs edit-on-computer scenario: choosing one side can drop the other. URL: https://github.com/super-productivity/super-productivity/issues/4829
  - super-productivity#4857: “This approach leads to frequent conflicts, such as outdated remote files overwriting local changes during concurrent edits.” URL: https://github.com/super-productivity/super-productivity/issues/4857
- **Current solutions named:** Dropbox/WebDAV file sync; Automerge; Yjs; cr-sqlite; iCloud; Syncthing.
- **Why they may be insufficient:** Whole-file LWW is still shipped because CRDT “is too expensive in terms of data size” (maintainer quote in #4829 thread per search fetch).
- **Why this may NOT be worth solving:** CRDT libraries exist; this is infrastructure, not a 90-second job. Building a sync engine in 3 weeks is a trap.
- **Confidence:** Medium
- **Suggested:** KEEP-FOR-SYNTHESIS (as constraint: if Afterhours is local-first, sync UX is a known footgun — do not make it the product)

### 18. E2E tests marked flaky (or green) when they never passed

- **Who hurts:** Teams using Playwright serial mode + retries to gate CI.
- **Workflow:** Serial group; retry; skipped attempts counted as flaky; **CLI exit 0**; pipeline goes green.
- **Frequency:** Multiple independent GitHub issues 2023–2024 on microsoft/playwright.
- **Pain evidence (fetched via WebSearch of issue pages):**
  - playwright#28322: “See both tests identified as flaky / CLI exit status is 0.” Expected: test B “should not be flaky, it should be failed… the test never produces the expected passed status.” “CLI exit status should not be 0.” Comment: “In our company we also has been affected by this.” URL: https://github.com/microsoft/playwright/issues/28322
  - playwright#29922: “the CI shouldn't pass if some tests were skipped (if they were not explicitly set to be skipped).” Folded into #28322. Fixes referenced: PRs #30276, #30529 (2024).
- **Current solutions named:** Playwright retries, serial mode (docs: “not recommended”), project dependencies, quarantine SaaS.
- **Why they may be insufficient:** The *definition* of flaky in the runner was wrong for serial+retry; users shipped false greens. Even after fixes, serial e2e remains structurally flaky (Google 2017: large/UI tests).
- **Why this may NOT be worth solving:** Framework bug, maintainers already fixing. A product that “explains why CI went green” could still be a sharp debugger for e2e, but looks like DevTools.
- **Confidence:** Medium
- **Suggested:** KEEP-FOR-SYNTHESIS

---

### 19. Paste messy GitHub / Linear / email notes → shippable brief

- **Who hurts:** The scaffold’s implied user (solo professional planning tomorrow).
- **Workflow:** Dump a week of tickets + notes; get decisions, blockers, “the one thing to ship.”
- **Frequency:** **No primary evidence fetched** that this is a *hated, recurring, high-stakes job* distinct from generic status reporting.
- **Pain evidence:** None that survived adversarial review. Adjacent HN/vendor content is “weekly update,” “standup theater,” “AI meeting notes” — all dead ends (below).
- **Current solutions named:** ChatGPT, Notion AI, Linear updates, GitHub Copilot summary, TLDV, Granola, every “AI standup” app.
- **Why they may be insufficient:** n/a — the category is overserved.
- **Why this may NOT be worth solving:** **This is generic productivity.** Judges from a live-product house will have seen ten “summarize my week” demos. No unique artifact, no verification, no painful *consequence* if the brief is slightly wrong. Conflicts with OFFGRID guidance: one painful job, not a platform; avoid generic productivity. **KILL as the wow-path.**
- **Confidence:** High
- **Suggested:** REJECTED

### 20. Generic chatbot / AI assistant

- **Who hurts:** Everyone and no one.
- **Workflow:** Type a question, get an answer.
- **Pain evidence:** Hamel (fetched): unsuccessful LLM products fail from **lack of evals**, not lack of a chat box. Eugene (fetched): off-the-shelf evals don’t work — implying generic assistants don’t encode the job.
- **Current solutions:** ChatGPT, Claude, Gemini, every wrapper.
- **Why NOT:** Explicitly forbidden by research brief; no one painful job; no originality.
- **Confidence:** High
- **Suggested:** REJECTED

### 21. Meeting notes / action items

- **Who hurts:** People in too many meetings.
- **Workflow:** Record → transcript → bullets.
- **Pain evidence:** Not fetched as a *serious professional* bottleneck distinct from commodity. Market: Otter, Fireflies, Fathom, Grain, Granola, Notion.
- **Why NOT:** Commodity; privacy; “AI meeting notes” is 2023’s default hackathon. **DEAD END.**
- **Confidence:** High
- **Suggested:** REJECTED

### 22. Second brain / PKM

- **Who hurts:** Knowledge workers who enjoy tools more than jobs.
- **Workflow:** Capture everything, never retrieve.
- **Pain evidence:** None fetched that PKM failure is a *workplace* emergency. Tools: Obsidian, Roam, Notion, Capacities.
- **Why NOT:** Generic productivity; no end-to-end painful job; graveyard of note apps.
- **Confidence:** High
- **Suggested:** REJECTED

### 23. Generic RAG

- **Who hurts:** Teams with PDFs.
- **Workflow:** Chunk, embed, retrieve, hallucinate with citations.
- **Pain evidence:** Eugene (fetched): n-gram/vector similarity “not discriminative enough”; Hamel: don’t use generic metrics. RAG-as-product is the opposite of task-specific evals.
- **Why NOT:** Explicitly avoid; every tutorial; no wow beyond “chat with PDFs.”
- **Confidence:** High
- **Suggested:** REJECTED

### 24. Generic dashboard

- **Who hurts:** Managers who want charts.
- **Workflow:** Connect data source, drop widgets.
- **Pain evidence:** None that “lack of a dashboard” is the job. NeuBird/Vanta reports are themselves dashboard bait.
- **Why NOT:** Forbidden class; judges click a working *job*, not charts.
- **Confidence:** High
- **Suggested:** REJECTED

### 25. Generic coding copilot

- **Who hurts:** Developers (already have Copilot, Cursor, Claude Code, Cody).
- **Workflow:** Tab-complete / agent-edit.
- **Pain evidence:** Rubber-stamp review is real as a *fear* (see #37) but the *assistant* market is saturated. HN search for “AI generated code review” returned mostly 1–5 point Show HNs.
- **Why NOT:** Forbidden class; user already lives in Cursor.
- **Confidence:** High
- **Suggested:** REJECTED

### 26. Email triage

- **Who hurts:** Anyone with Superhuman envy.
- **Current solutions:** Gmail Smart Reply, Superhuman, Shortwave, Gemini in Gmail.
- **Why NOT:** Generic productivity; privacy; incumbents.
- **Confidence:** High
- **Suggested:** REJECTED

### 27. Calendar / scheduling

- **Current solutions:** Calendly, Reclaim, Clockwise, Motion.
- **Why NOT:** Commodity; not a depth job.
- **Confidence:** High
- **Suggested:** REJECTED

### 28. Jupyter git merge as a product

- **Pain evidence (fetched):** nbdime docs (Jina): “Jupyter notebooks are useful, rich media documents stored in a plain text JSON format… primitive line-based diff and merge tools do not handle well the logical structure of notebook documents.” URL: https://nbdime.readthedocs.io/en/latest/
- **Why REJECT:** **Already solved in OSS** (nbdime `config-git --enable`). Shipping another mergetool is not original. The remaining pain is *adoption* and *reproducibility* (#12), not missing software.
- **Confidence:** High
- **Suggested:** REJECTED

### 29. Security-questionnaire autofill SaaS (as the product)

- **Pain:** Real — see #6.
- **Why REJECT as product class:** Stacksi launched on HN in 2021 (134 points). Vanta/Drata/Whistic/Wolfia/SafeBase exist. Autofill is CRUD+LLM with legal risk. HN founder already tired of $400/mo tools. Do not enter this market in 3 weeks.
- **Confidence:** High
- **Suggested:** REJECTED *(keep the underlying job in #6/#14 for synthesis)*

### 30. Flaky-test detection SaaS (as the product)

- **Pain:** Real — see #4.
- **Why REJECT as product class:** Trunk, Buildkite, Playwright retries, Google-scale internal tools. HN even has “Show HN: FlakyBot.” Detection is solved-enough; *root-cause of a flake* is research-hard.
- **Confidence:** High
- **Suggested:** REJECTED *(keep #4/#18 for synthesis)*

### 31. PII-in-logs sanitizer

- **Pain evidence:** HN hits are small Show HNs (20, 25, 11 points) for new sanitizer tools — **demand signal weak**, supply of toy projects high. Nightfall blog (16 points, 0 comments).
- **Why REJECT:** Compliance-adjacent; regex+entropy is a sidecar, not a wow job; looks like security product.
- **Confidence:** Medium
- **Suggested:** REJECTED

### 32. OpenAPI spec drift as a product

- **Pain evidence:** GSA/touchpoints#2088 (search fetch): CI check to prevent OpenAPI drift was **removed** because of YAML whitespace diffs between laptop and CI. That is real but **one repo’s formatting bug**, not a market.
- **Why REJECT:** Solved by generate-in-CI (rswag, openapi-typescript, buf). Weak evidence of widespread unsolved pain.
- **Confidence:** Medium
- **Suggested:** REJECTED

### 33. Silent dbt test failures as a product

- **Pain evidence:** Elementary, AnomalyArmor, Wicked Smart Data blogs — all vendors. dbt docs on debugging jobs are **how-to**, not proof of crisis.
- **Why REJECT:** Insufficient independent evidence. Monte Carlo / Bigeye / Elementary already sell this. Generic data-quality dashboard.
- **Confidence:** Medium
- **Suggested:** REJECTED

### 34. AI auto-grading as a product

- **Pain:** Assessment chaos is real (#15).
- **Why REJECT as product:** The fetched classroom study shows teachers **distrust scores**; 42% found feedback not useful. Building an auto-grader fights the user. Ethical landmine.
- **Confidence:** Medium
- **Suggested:** REJECTED *(keep #15’s provenance angle)*

### 35. Dataset license-tag cleanup

- **Pain evidence:** huggingface/datasets#5158 (search fetch): “402 datasets with deprecated ‘languages’ or ‘licenses’” blocking metadata PRs. **Closed as done** by maintainers’ script.
- **Why REJECT:** One-time hub hygiene; already executed. Not an ongoing professional job for the hackathon user.
- **Confidence:** Medium
- **Suggested:** REJECTED

### 36. CRDT sync engine as a product

- **Pain:** Real in #17.
- **Why REJECT:** Automerge/Yjs/cr-sqlite exist. Building a sync engine is a research project, not a 14 Oct demo. Local-first is a **constraint**, not the job.
- **Confidence:** High
- **Suggested:** REJECTED

### 37. AI code-review rubber-stamp fixer

- **Pain evidence:** DEV.to posts Sep 2026 (“Rubber Stamp Effect”) look like SEO. HN “AI generated code review” stories are 1–5 points. **No high-quality primary quote fetched** that teams’ AI reviewers are systematically approving bugs, beyond opinion pieces.
- **Why REJECT:** Weak evidence. Overlaps generic copilot. If kept later, need GitHub issue + incident, not blogs.
- **Confidence:** Low
- **Suggested:** REJECTED until better evidence

### 38. Weekly status report from GitHub activity

- **Pain evidence:** None fetched distinct from #19.
- **Why REJECT:** Same kill as #19. Standup generators are a meme.
- **Confidence:** High
- **Suggested:** REJECTED

---

## Dead ends (investigated and killed as product classes)

| Dead end | Why killed |
|----------|------------|
| **Paste GitHub/Linear/email → shippable brief** | Default scaffold wow-path. Generic productivity. No primary evidence of a *hated, high-stakes, unique* job. Overserved by ChatGPT. **Explicitly killed.** |
| **Generic chatbot / “ChatGPT but for X”** | Forbidden; no one job; eval evidence says generic assistants stall without task evals. |
| **Meeting notes / action items / Otter-class** | Commodity 2023–2026; privacy; not original. |
| **Second brain / PKM / Notion wiki** | Tool-for-tools; retrieval never was the job. |
| **Generic RAG / “chat with docs”** | Forbidden; Eugene: similarity metrics don’t discriminate. |
| **Generic dashboard / AI SRE copilot** | Alert pain is real (#5) but the product class is the most crowded AIOps pitch of 2026. |
| **Generic coding copilot** | User already has Cursor; Show HN graveyard. |
| **Email triage / calendar AI** | Incumbents; generic productivity. |
| **Security questionnaire autofill** | Pain real; market owned by Vanta/Drata/Whistic; legal risk. |
| **Flaky-test SaaS** | Pain real; Trunk/Playwright/Google already there. |
| **Jupyter mergetool** | nbdime exists and is the official answer. |
| **AI grader / AI detector** | Teachers distrust scores; detector arms race; ethics. |

V2EX hot API on 2026-09-21 returned consumer threads (iOS client, girlfriend visiting, cars) — **no professional-workflow signal used.**

---

## Source conflicts (do not paper over)

1. **Vendor questionnaire “78% of deals delayed”** appears on SaaS blogs citing Vanta. The **fetched 2025 Vanta PDF** supports 7 h/week vendor reviews and 61% “proving vs protecting,” **not** the 78%/67% deal-delay stats. Treat deal-delay percentages as **unverified**.
2. **Invoice exception rate 18.4% (ePayables 2025 blog) vs 14% (AP Metrics 2025 PDF).** Different Ardent reports/years. Do not merge.
3. **LLM-as-judge:** Zheng et al. document severe position bias **and** “>80% agreement with humans” for GPT-4 after mitigations. Both true.
4. **Paper reproducibility:** Raff 63.5% *independent* (no author code) vs later artifact-based studies ~81% reproducible. Different definitions.
5. **NeuBird 44%/78% alert numbers** vs industry folklore. Only one vendor survey fetched; BusinessWire 403. Use with “vendor-funded” tag.
6. **Flaky-test dollar costs** in a 2026 DEV.to “10,000 GitHub Actions” post look invented (neat $37.50). **Not used.** Google’s 1.5%/16%/84% **were** used.
7. **Intel 45% maintainer burnout:** Phoronix from an email, not Intel’s public page; n **Unknown**.

---

## Source list

| Source name | URL | Date visible on page | What it proves | Reliability |
|-------------|---------|----------------------|----------------|-------------|
| agent-reach doctor JSON | local CLI | 2026-09-21 | Channel availability (Reddit off, Twitter missing, Exa unlive until used) | High (local) |
| Hamel Husain — Your AI Product Needs Evals | https://hamel.dev/blog/posts/evals/ | Fetched 2026-09-21 (undated on page) | Unsuccessful LLM products fail from missing evals; vibe checks insufficient | High (practitioner, widely cited) |
| Hamel & Shreya — LLM Evals FAQ | https://hamel.dev/blog/posts/evals-faq/index.html | Fetched 2026-09-21 | 60–80% of build time on error analysis; 100+ traces / 2–4 week cycle | High (same; sample of consulting projects, not a survey) |
| Eugene Yan — Task-specific LLM evals | https://eugeneyan.com/writing/evals/ | 2024-03-31 | Off-the-shelf evals don’t correlate; Voiceflow 10% drop caught by harness; human eval still gold | High |
| Zheng et al. — LLM-as-judge (arXiv HTML v2) | https://arxiv.org/html/2306.05685v2 | v2 ~2023-07 | Position bias; GPT-4 consistency >60% only; verbosity attack; ~80% human agreement after mitigations | High (NeurIPS) |
| Google Rules of ML | https://developers.google.com/machine-learning/guides/rules-of-ml | Fetched 2026-09-21 | Training-serving skew observed in Google prod; log features at serve time | High |
| Google Testing Blog — Micco 2016 | https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html | 2016-05-27 | 1.5% flaky runs; 16% of tests flaky; 84% of pass→fail are flakes; ignore-legitimate-failure | High (old but primary) |
| Google Testing Blog — Listfield 2017 | https://testing.googleblog.com/2017/04/where-do-our-flaky-tests-come-from.html | 2017-04-17 | 4.2M tests; 63k flaky/week; large 14% vs small 0.5%; emulator 25% | High |
| HN Algolia — flaky tests / evals / dependabot / questionnaires | https://hn.algolia.com/api/v1/search | 2026-09-21 query | Discussion volume (points/comments); not quote-level unless thread fetched | Medium |
| NeuBird reliability blog | https://neubird.ai/blog/78pc-outgrow-monitoring-state-of-production-reliability | 2026-04-20 | n=1,039 survey claims on alert fatigue, missed alerts, exec/IC AI gap, runbook gap | Medium (vendor-funded) |
| BusinessWire NeuBird PR | https://www.businesswire.com/news/home/20260406439955/en/... | — | **FETCH FAILED 403** | n/a |
| Ask HN security questionnaires | https://news.ycombinator.com/item?id=36488436 | 2023-06-27 | Founder pain; SOC2 doesn’t stop questionnaires; $400/mo tool complaint | High (qualitative) |
| Vanta State of Trust PDF (Oct 2025) | https://8588479.fs1.hubspotusercontent-na1.net/hubfs/8588479/State%20of%20Trust%20Report%20-%20October%202025.pdf | Oct 2025; Sapio Jul 2025 | 7 h/week vendor reviews; 9 weeks/year; 61% proving vs protecting; n=2,500 | Medium (vendor-commissioned) |
| Filippo — Turn Dependabot Off | https://words.filippo.io/dependabot/ | 2026-02-20 | Thousands of irrelevant PRs; false positive on Wycheproof; alert fatigue reduces security | High (author of the library + ex Go Security) |
| HN Dependabot | https://news.ycombinator.com/item?id=47094192 | Algolia: 647 points / 185 comments | Community interest | Medium (counts only) |
| Phoronix — Intel OSS survey 2023 | https://www.phoronix.com/news/Intel-2023-Survey-Results | 2024-02-20 | Burnout 45% top challenge | Medium (email, n unknown, not Intel’s page) |
| Captura unmaintained | https://mathewsachin.github.io/blog/2023/04/09/captura-unmaintained.html | 2023-04-09 | Solo maintainer burnout + license theft | High (first-person) |
| Raff NeurIPS 2019 | https://arxiv.org/abs/1909.06674 | 2019 | 162/255 = 63.5% independent ML paper reproduction | High |
| Princeton ML leakage site | https://reproducible.cs.princeton.edu/ | Updated May 2024 | 41 review papers / 648 affected papers; leakage taxonomy | High |
| Uber Piranha | https://www.uber.com/blog/piranha/ | Fetched 2026-09-21 | ~2,000 stale flags removed; flags as reliability/debt | High |
| JetBrains 10M notebooks | https://blog.jetbrains.com/datalore/2020/12/17/we-downloaded-10-000-000-jupyter-notebooks-from-github-this-is-what-we-learned/ | 2020-12-17 | 9.72M notebooks; 36% non-linear execution | High (metadata analysis, not re-run) |
| nbdime docs | https://nbdime.readthedocs.io/en/latest/ | Fetched 2026-09-21 | Line-based git cannot merge notebooks well; nbdime exists | High |
| Ardent ePayables part 9 | https://payablesplace.ardentpartners.com/2026/01/state-of-epayables-part-nine-ap-benchmarks-and-best-in-class-performance/ | 2026-01-22 | 18.4% invoice exceptions; 21.9% staff time on supplier inquiries | Medium (analyst; n unclear on page) |
| Ardent AP Metrics 2025 PDF | https://corcentric-corpsite.s3.dualstack.us-east-1.amazonaws.com/pdfs/ap-metrics-that-matter-2025.pdf | WebSearch fetch | 14% exception rate (conflicts with 18.4%) | Medium |
| BCS AI paper Dec 2024 | https://www.bcs.org/media/11kcvxvn/bcs-ai-paper-december-2024.pdf | Dec 2024 | 5,298 UK teachers; 84% assessment unchanged; 41% no school AI policy | High |
| AI grading implementation arXiv | https://arxiv.org/html/2506.07955v1 | 2025 | 19 teachers; distrust auto-scores; 42% feedback not useful | Medium (small n) |
| Launch HN Human Layer | https://news.ycombinator.com/item?id=42247368 | 2024-11-26 | Nested human approval for agents; “a real problem”; DIY vs SaaS | High (qualitative) |
| super-productivity #4829 / #4857 | https://github.com/super-productivity/super-productivity/issues/4829 | Search-fetch 2026-09-21 | Whole-file sync conflict dialogs; data loss risk | Medium |
| playwright #28322 | https://github.com/microsoft/playwright/issues/28322 | 2023-11-24 | False flaky + exit 0 in serial+retry | High |
| huggingface/datasets #5158 | https://github.com/huggingface/datasets/issues/5158 | 2022-10-25 | 402 datasets with broken license/language tags (later fixed) | High (but solved) |
| TUM flaky-cost PDF | https://mediatum.ub.tum.de/doc/1730194/... | — | **FETCH FAILED 429** — do not cite numbers | n/a |
| Hangar “Our DSQ” | https://hangar.tech/posts/our-dsq/ | — | **FETCH FAILED DNS** | n/a |
| DEV.to flaky $37.50 / 50-repo burnout | various | 2025–2026 | **Discounted as likely AI/SEO** | Very low |
| V2EX hot.json | https://www.v2ex.com/api/topics/hot.json | 2026-09-21 | No professional-workflow signal that day | n/a |

---

## Parent-agent return (also copied here)

**KEEP-FOR-SYNTHESIS: 18. REJECTED: 20.** (38 candidates + 12 dead-end classes.)

**Top 12 keepers (one-line evidence):**

1. **LLM error-analysis / task evals** — Hamel: unsuccessful LLM products “almost always” fail from missing evals; FAQ: 60–80% of build time looking at traces.
2. **LLM-as-judge bias** — Zheng et al.: only GPT-4 >60% position-consistent; judgments flip when answers swap.
3. **Training–serving skew** — Google Rules of ML: observed in production; teams “sometimes surprised” when they log serve-time features.
4. **Flaky tests** — Google: 1.5% of runs, 16% of tests, 84% of new failures are flakes; people ignore real bugs.
5. **Alert fatigue** — NeuBird n=1,039: 44% outage from ignored alerts; 78% incident with no alert (vendor-funded).
6. **Security questionnaires** — Ask HN founder: 100+ questions from every 100-person client; SOC2 doesn’t stop them.
7. **Dependabot noise** — Filippo 2026: thousands of PRs for an unused symbol; “noise machine” causes real alert fatigue.
8. **Maintainer burnout** — Intel survey (Phoronix): burnout 45% top OSS challenge; Captura first-person archive.
9. **Paper reproduction** — Raff: 93/255 ML papers failed independent reimplementation.
10. **ML science leakage** — Princeton list: 648 papers implicated via 41 reviews.
11. **Stale feature flags** — Uber Piranha: ~2,000 flags deleted because humans didn’t clean up; reliability risk.
12. **Unreproducible notebooks** — JetBrains: 36% of 9.72M public notebooks executed non-linearly.

**Conflicts to carry into synthesis:** Vanta deal-delay % unverified vs hours/week verified; Ardent 14% vs 18.4% exceptions; judge-bias vs 80% human agreement; independent vs artifact reproducibility; NeuBird vendor bias.

**Scaffold wow-path (GitHub/Linear → brief): REJECTED with high confidence.**
