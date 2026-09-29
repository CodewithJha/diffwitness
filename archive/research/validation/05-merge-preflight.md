# Merge Preflight — adversarial kill test

**Date:** 21 September 2026  
**Candidate:** Merge Preflight only. Do not defend. Do not generate alternatives.  
**Method:** Primary-page fetch (GitHub `gh` + Jina Reader + Exa). Paper fetched as HTML (`arxiv.org/html/2601.15195v1`) plus abstract. Public PR replay via `gh api repos/…/pulls/N` (not invented). No product code. `src/` not touched. No product deps installed.  
**Prior suspicion (confirmed):** `research/06` reproducibility = weekend; `research/08` GitHub ships policy; `research/10` “if heuristics vs 20 real agent PRs do not separate, stop.”

**Verdict: KILLED**

---

## Thesis (to attack)

AI-generated PRs fail for reasons beyond code correctness (oversized diffs, missing tests, CI, docs mismatch, conventions, socio-technical constraints). Merge Preflight predicts merge likelihood **before** wasting reviewer time. Output is a **gate/warning with reasons**. No comment spam.

The pain is real as a *maintainer complaint*. It is not a product. GitHub already gates merge. CodeRabbit already named the job “Pre-Merge Checks.” Danger.js already ships “encourage smaller PRs” / “encourage more testing.” The 33k-PR paper does **not** give a threshold you can enforce without false-blocking legitimate work. The top failure modes in that paper are **reviewer abandonment** and **duplicates**, which a size/test/CI heuristic cannot see.

---

## Kill test A — GitHub branch protection / rulesets / CODEOWNERS / Copilot review / merge queues

**Question:** What does Merge Preflight do that GitHub cannot trivially implement? If weak: KILL.

Inspected 21 Sep 2026 (Jina of current GitHub Docs):

| GitHub surface | What it already does | Merge Preflight overlap |
|---|---|---|
| [Protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches) | Required approving reviews; required reviews from code owners; required status checks (strict/loose); restrict who can push | CI gate, ownership gate, human review gate |
| [Rulesets — available rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) | Named lists of rules (up to 75/repo). Required status checks with **app as expected source**. Restrict file paths, path length, **file size**. Bypass actors. | Path/size policy. CI as a required check whose source is pinned to an App |
| **Additional approval for unattributed Copilot PRs** (same rulesets page, default **on**) | When Copilot opens a PR under its own app identity, the ruleset requires **one more approval** than configured. Quoted purpose: the usual “author + reviewer” assumption “doesn’t hold when Copilot opens a pull request.” | **Agent-specific merge policy, already shipped by the forge** |
| [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) | Auto-request owners; with “require review from Code Owners,” merge is blocked until an owner of every touched path approves | Ownership / conventions of who may land |
| [Copilot code review](https://docs.github.com/en/copilot/concepts/code-review) + [configure automatic review](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/configure-automatic-review) | Auto-review PRs; optional **Allow Copilot to approve**; optional **Allow Copilot approvals to count toward merge requirements**; glob-limited | Review-quality + merge-requirement coupling, native |
| [Merge queues](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) | After required checks pass, queue rebases against latest target + in-queue PRs and re-runs CI. “Only merge non-failing PRs.” | CI-at-merge; the actual “will this land cleanly” job |

**What Merge Preflight claims that GitHub “doesn’t have”:** a *prediction* that a PR won’t merge because it is too big, has no tests, docs-mismatch, or is a duplicate — *before* a reviewer looks.

That is not a missing primitive:

1. **CI / tests.** Required status checks. If tests didn’t run or failed, GitHub already blocks. Predicting CI *without running it* is the product’s own hardest problem (`research/06`) and is strictly worse than running CI.
2. **Size.** Rulesets already restrict **file size**. File-*count* / line-count is a required GitHub Action (or [Danger JS](https://danger.systems/js/), whose homepage examples include **“Encourage smaller PRs”** and **“Encourage more testing”**). Weekend YAML, not a company.
3. **Docs / conventions.** Same Action/Dangerfile. CODEOWNERS for who must see it.
4. **Duplicates / “won’t get review.”** Not a GitHub checkbox. Also **not** something a size heuristic predicts (paper RQ2).
5. **Agent-specific thresholds.** GitHub already added **extra approval for unattributed Copilot PRs**, default enabled on rulesets. That is the exact “agents are different” policy Merge Preflight wanted GitHub not to have.

GitHub’s own [troubleshooting required status checks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks) documents false-block modes: skipped workflows stay **Pending** and **block merge**; path-filtered PRs wait forever for a check that will never report. The forge already knows gates hurt.

**A result: KILL.** There is no non-trivial remainder. Agent-specific extra approval exists. CI/size/ownership are first-party. A 20-line Action is the entire “heuristic gate.”

---

## Kill test B — CodeRabbit / Qodo / Graphite / Copilot

**Question:** Do they already analyze PR size, test coverage, CI, ownership, duplicates, merge likelihood, conventions? Exact remaining wedge or KILL.

### CodeRabbit — they already named the product

Fetched [Built-in Pre-Merge Checks](https://docs.coderabbit.ai/pr-reviews/pre-merge-checks.md) and [Triage prioritization](https://docs.coderabbit.ai/triage/prioritization.md).

- **Pre-Merge Checks:** “Enforce quality gates and your organization’s custom requirements **before pull requests are merged**.” Built-ins: **Docstring Coverage** (default 80% threshold), **PR Title**, **PR Description** (template), **Issue Assessment** (linked issue, **out-of-scope changes**). Custom checks in natural language (Team+): docs for breaking changes, migration patterns, compliance. Modes: `off` / `warning` (default) / `error`. Error + Request Changes Workflow **blocks merge** until resolved or **Ignore failed checks**.
- **Triage (open beta):** ranks open PRs by **priority (worth acting on)** vs **next action**. Explicitly separates “failing CI = blocked” from “important.” That is merge-likelihood / reviewer-time allocation, not nits.
- Issue enrichment: **detect duplicates**.
- Finishing touches: generate unit tests.
- They already lost the “no comment spam” fight in public (HN 42484498, 44953032, 49621594 in prior research). Their answer was config + pre-merge checks + ignore checkbox — not a new startup.

A CodeRabbit custom check that says “fail if >40 files and no tests” **is Merge Preflight**, hosted, with a blocking mode.

### Qodo (Git interface, formerly Qodo Merge)

Fetched [Qodo code review](https://docs.qodo.ai/code-review), [blast radius](https://docs.qodo.ai/code-review/assess-risk-with-blast-radius), [rule enforcement](https://docs.qodo.ai/governance/rule-enforcement), [llms.txt routing](https://docs.qodo.ai/llms.txt).

- PR review + **code governance / rule enforcement** across repositories.
- **Blast radius** = risk of the change.
- **Requirement gaps**, UX deviations, **cross-repository conflicts**.
- Historical positioning (Qodo 1.x overview + 2026 comparison pages): PR descriptions, **test coverage**, docs, standards. Vendor blogs still sell “test generation alongside review.”
- Not a merge-probability model. It **is** conventions + tests + risk + enforcement — the “reasons” side of the gate.

### Graphite (now bundled with Cursor Cloud Agents)

Fetched [graphite.dev](https://graphite.dev/) and docs index (`llms.txt`).

- Job is **smaller PRs**, not blocking large ones: stacking so review is tractable. Homepage: orgs ship “more code with **smaller PRs** and faster review cycles.”
- **Merge queue**, reviewer assignment, AI reviewer that “Resolve[s] CI failures,” mergeability status check to prevent mid-stack merges.
- Graphite Agent: custom rules, exclusions, analytics (acceptance, downvote). Third-party 2026 writeups note a hard ceiling (~200k characters → “Not running”) — they treat huge diffs as a **workflow** problem (stack), not a third-party predictor.

If oversized agent diffs are the pain, Graphite’s answer is **split**, which is what maintainers asked for on BMAD-METHOD#196 (see sample).

### GitHub Copilot (again, as competitor not forge)

Automatic review, optional counting toward required approvals, extra approval for unattributed Copilot PRs. Distribution is the repository.

### Danger JS (incumbent the shortlist ignored)

[danger.systems/js](https://danger.systems/js/): CI-time rules, `fail` is blocking. Homepage examples: **Encourage smaller PRs**, **Encourage more testing**, changelogs, assignees. This is Merge Preflight’s non-AI core, ~decade old.

**Remaining wedge:** none that is a 3-week hosted product. “We refuse to comment” is a **minus** on a Dangerfile/Action (no bot to mute), not a plus. “Agent-specific thresholds from the paper” are copyable and empirically weak (kill test C).

**B result: KILL.**

---

## Kill test C — Paper arXiv:2601.15195

**Fetched:** [abs](https://arxiv.org/abs/2601.15195), [HTML v1](https://arxiv.org/html/2601.15195v1). Not missing. Not retracted on this fetch. Comments: **Accepted at MSR 2026**. Authors: Ehsani, Pathak, Rawal, Al Mujahid, Imran, Chatterjee. Dataset: **AIDev-pop** (Li, Zhang, Hassan 2025, arXiv:2507.15003), agent PRs on GitHub repos with **>100 stars**.

### Dataset / n

| Item | Number from the paper |
|---|---|
| Agentic PRs | **33,596** |
| Codex | 21,799 (64.9% of the sample) |
| Copilot | 4,970 |
| Devin | 4,827 |
| Cursor | 1,541 |
| Claude Code | 459 |
| Merged | 24,014 (**71.48%**) |
| Qualitative rejected sample | 600 planned; **38 inaccessible** → **562** labeled |
| Inter-rater κ | 0.55 then **0.91** after taxonomy rewrite |

Agent merge rates (paper): Codex 82.59%, Cursor 65.22%, Claude Code 59.04%, Devin 53.76%, Copilot **43.04%**. Overall merge is Codex-dominated. A product that “blocks agent PRs the data says won’t merge” starts from a base rate where **most agent PRs do merge**.

### Features / methodology

RQ1 quantitative: task type (11 conventional-commit labels), **#LOC**, **#files**, **#failed CI checks** + overall commit status, **#review comments**, **#review revisions**. Cliff’s δ + KDE + logistic regression (they refuse p-values-only because n is large).

RQ2 qualitative: stratified 600 rejected PRs; open coding; hierarchical taxonomy (Reviewer / Pull Request / Code / Agentic).

### What the numbers actually say about the heuristic

| Signal Merge Preflight wants to gate on | Paper result | Usable as a gate? |
|---|---|---|
| Files changed | Cliff’s **δ = −0.10** (small). Odds ratio ~99% per extra file | **No.** Overlap is huge. |
| LOC | δ = **−0.17** (small-to-medium). Coef **−2.8e−6**; ~1% odds drop per *one line* | **No** without a cutoff that false-blocks. |
| Failed CI checks | δ = **−0.24** (moderate). Each extra failed check ≈ **15%** lower merge odds | **Yes, and GitHub required checks already do this.** |
| Review comments / revisions | **Not significant** (p ~48% / 67%); tiny δ | Noise |
| Task type | Docs **84%**, CI **79%**, build **74%** merge; performance **55%**, fix **64%** | A “must include tests” gate **false-blocks the class the paper says merges most** (docs) |
| Socio-technical (RQ2) | **Not captured by the quantitative metrics** (paper’s own words) | Heuristic product is aimed at the wrong layer |

### RQ2 frequencies (562 labeled rejected PRs)

| Level | Pattern | n | % of 562 |
|---|---|---|---|
| Reviewer | Abandoned / not reviewed | **228** | **38%** |
| Pull Request | Duplicate | **142** | **23%** |
| Code | CI/test failure | 99 | 17% |
| Pull Request | Unwanted feature | 24 | 4% |
| Code | Incorrect / incomplete | 19+15 | ~6% |
| Agentic | Misalignment / license | 9+4 | ~2% |

The **plurality failure is nobody looked**. Size/tests/CI do not predict abandonment. Duplicates need search, not a diffstat. Unwanted features are product intent. License/CLA is a bot GitHub already runs (see netdata#20631, coder#16917).

Paper conclusion (quoted job for *agents*, not a SaaS): identify existing work, adhere to norms, **decompose into localized changes**, **validate against CI before opening PRs**. That is a Copilot/Cursor/Codex product change. Sweep/JetBrains already abandoned “agent opens PRs” as a company (`research/08`).

**Limitations (paper + this pass):** HTML version has **no dedicated threats-to-validity section**. Sample is star-filtered popular repos. Codex skew. Closed-PR CI status on GitHub later often reads `pending` with 0 check-runs (stale). Replication package is an anonymous.4open.science link, not re-run here. Effect sizes on size are **small**; treating them as a merge predictor is a product error, not a research finding.

**C result:** Paper is real and on-topic. It **does not validate** Merge Preflight. It is evidence **against** a size/test gate. **KILL** as empirical foundation.

---

## Kill test D — Public PR replay (~20 agent-authored PRs)

**Method:** `gh search prs` (Copilot `app/copilot-swe-agent`, Cursor `app/cursor`, Devin `app/devin-ai-integration`, Claude `app/claude`, Codex `app/chatgpt-codex-connector`) then `gh api` on a **fixed URL list**. Plus all **10 GitHub URLs the paper itself cites** as rejection examples. Codex search returned only `daisy976/test-repo` #1–#3 (open README-whitespace toys) — **excluded** from the separator table, not invented.

**n = 25** with full metadata (14 closed-unmerged, 11 merged) + 1 open (dxos#13283, not used in merged-vs-closed counts). **No reverts found** in this set (not searched exhaustively; unknown).

### Did simple features separate success vs failure?

**No.**

| Heuristic | Merged (n=11) | Closed unmerged (n=14) | Separates? |
|---|---|---|---|
| Files > 10 | **1** (kody#2412, 13 files, **has tests**, CI success) | **2** (BMAD#196 129 files; pygraphistry#706 38 files) | **No** |
| No test files touched | **8 / 11** | **11 / 14** | **No — majority of both** |
| Docs-only / docs-heavy | token-sprint#37 README **merged** | several closed docs PRs also exist | **No** (paper: docs merge *more*) |
| CI combined status | mixed `success`/`pending` | mostly `pending` with **0 check-runs** on old closed PRs | **Unusable** after the fact; GitHub already gates live CI |
| Ownership requested | rare | netdata requested `ktsaou`; hyperlight requested many humans and still closed | **No** |

**Closed PRs a size/test gate would have *allowed* (≤6 files, often 1 file):** 12 of 14 closed. Examples: vscode-cpptools#13763 (1 markdown file, maintainer: “doesn’t look like it belongs”); sentry-javascript#16526 (1 file; **repo Action already comments “opened against master… want develop”**); coder#16917 titled **“testing DO NOT MERGE”** (+3 lines); firecrawl#1645 (5 files, +28); BlazeDB#506 (**auto-closed**: “does not accept unsolicited Cursor/Bugbot pull requests”).

**Merged PRs a “must have tests” / “small only” gate would have *blocked*:** 8/11 merged had **zero** test-path files, including a README translation, a 1-file PHP fix, a 2-file CI path fix (`iging/sauron#1`), and Devin PRs with 2–8 files. kody#2412 is 13 files **and merged**.

The one closed PR the 40-file demo would catch is [BMAD-METHOD#196](https://github.com/bmad-code-org/BMAD-METHOD/pull/196) (+44,568 / 129 files). Maintainer: “would really prefer smaller granular PRs” / “100s of files.” That is a **CONTRIBUTING sentence + Graphite stacking**, not a startup. pygraphistry#706 is 38 files **with 14 test files and CI success** — paper classifies it as **duplicate**, which the heuristic would **miss** or **false-block a valid stacked slice**.

**D result: KILL.** Signal is weak in the paper (small δ) and **absent** in the 25-PR replay.

---

## Kill test E — False blocks

A gate that blocks good work is worse than no gate.

**Evidence fetched this pass:**

1. **GitHub docs, required checks:** skipped/path-filtered workflows stay Pending and **block merge**. Duplicate job names (protected-branches page) cause **ambiguous checks** that block. This is first-party admission that gates misfire.
2. **CODEOWNERS:** GitHub docs: owners without write access are ignored; empty owner lines leave paths unowned; draft PRs don’t request owners. [OpenReplay 6 Aug 2026](https://blog.openreplay.com/automatic-code-reviews-codeowners/): “Merge blocked, no one can approve” when an **empty team** owns a path. [github/docs#16897](https://github.com/github/docs/issues/16897): even the *meaning* of “require code owners” (any vs all) was ambiguous enough to file.
3. **Overlapping rulesets + Code Scanning:** public maintainer writeup (ResumeLens GitHub blog, fetched via Exa) of “I can’t merge even though CI is green” because a ruleset required Code Scanning before CodeQL reported, plus `dismiss_stale_reviews` looping CODEOWNER re-approval, plus classic protection **and** a ruleset both live. Solo CODEOWNER cannot merge their own PR without bypass.
4. **CodeRabbit defaults Pre-Merge Checks to `warning`**, and documents an **Ignore** escape. They know `error` mode is politically expensive. Merge Preflight’s 20s demo *is* error mode.
5. **Paper: docs PRs merge at 84%.** A “no tests → block” rule attacks the highest-success class. token-sprint#37 (Copilot, README translate, **merged**) is the false-block fixture.
6. **BlazeDB#506:** the repo already auto-closes Cursor PRs. Policy, not prediction. False-block cost is why they scoped it to *unsolicited bot PRs*, not “40 files.”

**E result: KILL.** The failure mode of the product is the well-documented failure mode of branch protection.

---

## Strongest alternative (already exists)

Not a new idea: **GitHub rulesets** (required checks + extra Copilot approval + CODEOWNERS) **plus** a required Action or **Dangerfile** for size/tests, **or** CodeRabbit Pre-Merge Checks in `error` mode. Graphite stacking if the actual pain is large diffs.

## Difference

Merge Preflight’s claimed difference is (1) agent-specific thresholds from arXiv:2601.15195 and (2) gate not comments.

(1) GitHub already shipped agent-specific extra approval; paper thresholds are not separable.  
(2) Danger `fail`, required checks, CodeRabbit Request Changes, and GitHub merge queues already gate.

## Does it matter?

No. Reviewers already ignore bots. Maintainers already close huge PRs in one sentence. Agents that want to merge need to **run CI and split diffs** — the paper’s own recommendation to *agent vendors*.

## Demo breakage

- GitHub App review can miss 14 Oct (`research/09`). Fixture-only demo is a webpage over `changed_files`.
- 20-second “40-file no-test → block” is visually identical to a red required check named `size`. View-source kills Originality / Technical Depth.
- Citing the paper in the 60s demo **backfires** if a judge asks for effect size (δ=0.10 files) or RQ2 (38% abandonment).
- Live GitHub demo needs OAuth the wow-path should not depend on (`research/09`).

## Business breakage

- Buyer already pays GitHub. Copilot review is in the seat.
- CodeRabbit/Qodo/Graphite occupy “PR quality gate” budget.
- False blocks create **bypass lists**, which is how branch protection already dies.
- No independent receipt the agent vendors cannot add as a checkbox (they are told to by this paper).
- WTP for maintainer triage tools is already weak (Tidelift 2024 in prior research); this is the same buyer.

## Copy-me

**Yes, a weekend.** Required workflow / repo Action:

```text
if changed_files > 40 and no test paths: exit 1
```

Mark it required in a ruleset. Or `yarn danger ci` with the homepage “smaller PRs / more testing” examples. Or enable CodeRabbit Pre-Merge Checks → error. Or tick GitHub’s extra Copilot approval.

Originality against ~87 entries: near zero.

## No-AI

The gates are the product (`research/06` product-without-AI = yes). That is not a virtue here. It means the demo is a **linter**. Removing AI does not create a wedge; it reveals there was never one.

## Judge-says-no

Hardest question is already in `research/07`: “Isn’t that a branch protection rule?” Honest answer after this pass: **yes, plus Danger.js, plus CodeRabbit’s actual ‘Pre-Merge Checks’ page.** Youth-house judges who click a demo URL will see a red badge. Unweighted Originality / Product Thinking / Potential fail. Execution can be made to work and still lose.

## 2-year category

**Dead as an independent product.** GitHub is already writing agent merge policy into rulesets. Cursor owns Graphite (homepage: “Cursor Cloud Agents are now in Graphite”). CodeRabbit owns the phrase Pre-Merge Checks. Agent vendors will “validate CI before opening PRs” because MSR 2026 told them to. A solo verifier of diffstat is a feature request, not a company.

---

## Unknowns

- Exact CodeRabbit pricing this pass (prior research conflict $24–$72 vs Unknown). Not needed for kill.
- Whether GitHub will add a first-party “max files in PR” rule (file *size* already exists). Would only make A stronger.
- Revert rate of merged agent PRs: **not measured** here.
- Codex public PRs beyond toy `test-repo`: search did not yield a usable merged/closed sample this pass (rate limit on a later search).
- Paper peer-review camera-ready vs arXiv v1 deltas.
- Whether a *warning-only* (non-blocking) UX survives as a hackathon demo. It would still be Danger `warn`. Not reopened as BUILD.

---

## PR sample table

Fetched 21 Sep 2026 via `gh api`. **Do not treat `ci_combined=pending` on old closed PRs as “CI failed.”** `tests` = path heuristic (`test`/`spec`/`__tests__`). `docs` = `docs/`, README, changelog, or `.md`.

| URL | Agent / author | Outcome | Files | +/− | Tests | Docs | CI | Notes |
|---|---|---|---:|---:|---:|---:|---|---|
| [netdata#20631](https://github.com/netdata/netdata/pull/20631) | Copilot | closed | 0* | 0 | 0 | 0 | success | Paper license/CLA class; CLA bot commented; branch gone |
| [coder#16917](https://github.com/coder/coder/pull/16917) | Human `stirby`; body: Claude Code | closed | 1 | +3/−1 | 0 | 1 | pending | Title **testing DO NOT MERGE**; CLA bot |
| [vscode-cpptools#13763](https://github.com/microsoft/vscode-cpptools/pull/13763) | `you112ef`; title Cursor/… | closed | 1 | +295 | 0 | 1 | pending | Maintainer: “doesn’t look like it belongs” |
| [sentry-javascript#16526](https://github.com/getsentry/sentry-javascript/pull/16526) | `AbhiPrasad` (paper-cited) | closed | 1 | +6 | 0 | 0 | pending | **Action already:** wrong base branch (`master` vs `develop`) |
| [reflex-web#1479](https://github.com/reflex-dev/reflex-web/pull/1479) | Devin bot | closed | 1 | +11 | 0 | 1 | pending | Paper misalignment quote |
| [firecrawl#1645](https://github.com/firecrawl/firecrawl/pull/1645) | Devin bot | closed | 5 | +28/−12 | 0 | 0 | pending | Paper: implementation wrong |
| [hyperlight#641](https://github.com/hyperlight-dev/hyperlight/pull/641) | Copilot | closed | 6 | +54/−7 | 0 | 1 | pending | Many reviewers requested; still closed; paper CI/conflicts |
| [BMAD-METHOD#196](https://github.com/bmad-code-org/BMAD-METHOD/pull/196) | `amarbunty` (paper-cited) | closed | **129** | +44568/−13954 | 1 | 90 | pending | Maintainer: too much to review; split |
| [pygraphistry#706](https://github.com/graphistry/pygraphistry/pull/706) | `lmeyerov` (paper-cited) | closed | 38 | +3366/−93 | **14** | 1 | **success** | Paper: **duplicate** (superseded). Tests+CI would pass |
| [ruv-FANN#59](https://github.com/ruvnet/ruv-FANN/pull/59) | `ruvnet` (paper-cited) | closed | 3 | +560/−1 | 0 | 1 | pending | Paper: unwanted / superseded |
| [emulator-wtf/actions#150](https://github.com/emulator-wtf/actions/pull/150) | Copilot | closed | 3 | +3/−3 | 0 | 0 | pending | Live search; tiny bump |
| [inferoute-client#14](https://github.com/Inferoute/inferoute-client/pull/14) | cursor[bot] | closed | 2 | +49/−10 | 1 | 0 | pending | 1 failed / 2 checks |
| [BlazeDB#506](https://github.com/Mikedan37/BlazeDB/pull/506) | cursor[bot] | closed | 3 | +87/−6 | 0 | 0 | pending | **Auto-closed: no unsolicited Cursor PRs** |
| [newsbot#25](https://github.com/beelin000/newsbot/pull/25) | cursor[bot] | closed | 5 | +362/−16 | 0 | 1 | pending | Auto-landed elsewhere; closed to avoid conflict |
| [token-sprint#37](https://github.com/cloud26/token-sprint/pull/37) | Copilot | **merged** | 1 | +39/−39 | 0 | 1 | success | README translate — false-block if “need tests” |
| [avscms#12](https://github.com/Sl0ppie/avscms/pull/12) | Copilot | merged | 1 | +46/−1 | 0 | 0 | pending | No tests |
| [sauron#1](https://github.com/iging/sauron/pull/1) | Copilot | merged | 2 | +2/−6 | 0 | 0 | pending | **CI workflow fix**, no tests |
| [Pooryamn.github.io#1](https://github.com/Pooryamn/Pooryamn.github.io/pull/1) | Copilot | merged | 2 | +132/−1 | 0 | 0 | pending | Feature, no tests |
| [botnav#127](https://github.com/Repom4n/botnav/pull/127) | Copilot | merged | 4 | +95/−13 | 0 | 1 | pending | No tests |
| [kody#2412](https://github.com/kentcdodds/kody/pull/2412) | cursor[bot] | merged | **13** | +48/−241 | **13** | 0 | success | Would trip a naive “>10 files” rule |
| [arbiter#366](https://github.com/tylerreckart/arbiter/pull/366) | cursor[bot] | merged | 4 | +71/−13 | 1 | 1 | pending | |
| [renda-sua#333](https://github.com/B-T-Group/renda-sua/pull/333) | cursor[bot] | merged | 2 | +82/−1 | 1 | 0 | pending | |
| [ocean-ios#710](https://github.com/ocean-ds/ocean-ios/pull/710) | Devin bot | merged | 3 | +7/−7 | 0 | 0 | pending | No tests |
| [ONEPASS-FITNESS#4](https://github.com/Tauave/ONEPASS-FITNESS/pull/4) | Devin bot | merged | 2 | +62/−33 | 0 | 0 | success | No tests |
| [GT-Player-Dashboard#96](https://github.com/Kimpossible7544/GT-Player-Dashboard/pull/96) | Devin bot | merged | 8 | +2/−739 | 0 | 0 | pending | 8 files, no tests, merged |
| [dxos#13283](https://github.com/dxos/dxos/pull/13283) | claude[bot] | **open** | 16 | +997/−60 | 4 | 3 | success | Not counted in merged/closed split |

\*netdata file counts are 0 because the head branch was gone at fetch time.

---

## Verdict

**KILLED**

A–E all kill. The thesis describes a real annoyance. The product is a rename of GitHub required checks + Danger.js, launched into a market where CodeRabbit already sells “Pre-Merge Checks” and GitHub already adds extra reviewers for Copilot-authored PRs. The paper that was supposed to be the wedge shows small size effects and a plurality of failures the heuristic cannot see.
