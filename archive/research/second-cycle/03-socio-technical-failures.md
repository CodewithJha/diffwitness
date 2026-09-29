# Area 2 — Socio-technical duplication / nobody-will-look failures

**Date:** 21 September 2026  
**Workspace:** repository root  
**Question:** Why do technically valid changes fail because humans do not notice, understand, trust, own, or act on them?  
**Method:** Failure-mode search first (postmortems, papers, incident reports, OSS, surveys). Primary pages fetched 21 Sep 2026 via agent-reach (Jina Reader, `gh`, HN Algolia) plus Cursor WebSearch/WebFetch. Exa MCP hit free-tier **429** after a few calls. Reddit backend **off**. Twitter CLI **not installed**. V2EX hot API reachable; no on-topic threads in the hot list this pass.  
**Rule:** FACT vs INFERENCE labeled. Unknown stays Unknown. Never fabricate. No application code. No `src/`. Merge Preflight remains **KILLED** — this file does not resurrect size/CI/test-count/merge-prediction gates.

**Prior-cycle constraint (do not reopen as a product):** arXiv:2601.15195 RQ2 of 562 labeled rejected agent PRs: **38%** abandoned / not reviewed, **23%** duplicate. Those numbers are *diagnosis*, not a merge-heuristic product. GitHub already ships extra approval for unattributed Copilot PRs. CodeRabbit already named Pre-Merge Checks. DupGate and Owner Diff were already REJECTED in `research/05` / `06`.

**Hard kills for this area (class, not one idea):** GitHub notifications, CODEOWNERS as a product, another comment bot, maintainer duplicate-issue finders, branch-protection linters, score dashboards of “did a human look.”

---

## Counts

| Status | n | IDs |
|---|---:|---|
| **KEEP** | **0** | — |
| **WEAK** | **3** | ST-4 runtime patch ownership; ST-5 acknowledged shift handoff; ST-8 zombie/duplicate research protocols |
| **KILLED** | **5** | ST-1 habituation gate; ST-2 git≠tarball; ST-3 review-attestation theater; ST-6 ungoverned prompts; ST-7 agent clone-write |

**Area verdict:** **KILLED as an OFFGRID product well.** Pain is real and repeatedly documented. Every distinctive mechanism either lives inside the GitHub gravity well, is a named feature of PagerDuty / Langfuse / OpenSSF / Tenable-class / PROSPERO, or is cyber/supply-chain (forbidden as a *build* for this repo). The three WEAK rows are residual jobs, not shortlist entries.

**Strongest evidence in the area:** Equifax House Oversight report (Dec 2018): GTVM emailed **>400** people on 9 Mar 2017; Payne testimony that application/system owners were **not explicitly designated**; 143M announced / later 148M consumers. Knight SEC order 34-70694: **97** “BNET reject” emails before the open, “generally did not review them.” xz: Andres Freund Openwall 29 Mar 2024 — backdoor in **tarball not git**. BMJ Open 2022: **138/1054** COVID-19 PROSPERO protocols submitted after a similar PICOS was already registered; **85/138** ticked “Not Similar.”

**Strongest kill in the area:** A product that “makes humans look” on GitHub is extra Copilot approval + CODEOWNERS + CodeRabbit, which already killed Merge Preflight. A product that “finds duplicate work” is GitHub/Linear/PROSPERO/Zylo/Feast/dupehound depending on layer. There is no remaining 3-week hosted wow that is also a company.

---

## ST-1 — Reviewers habituate and rubber-stamp agent PRs

### User
Repeat reviewers of AI-agent pull requests on popular GitHub repos (the AIDev population).

### Exact workflow
Agent opens a PR → human is requested as reviewer → approve / comment / request changes → next agent PR from the same reviewer, weeks later.

### Failure
The human gate that safety arguments rely on **loosens with experience**. Approval rises; inline comments fall; queue time rises. Technically valid-looking agent diffs land because the reviewer has stopped inspecting, not because the diff got better in a way the study can prove.

### Frequency
**FACT (arXiv:2606.22721v1 HTML, fetched 21 Sep 2026):** 400 repeat reviewers, 11,429 reviews, seven-month window. Population approval **30.1% → 36.8%** (Wilcoxon signed-rank \(p<10^{-6}\)). Experience-decile gap **+14.5 pp**. Inline comments **−22%** (\(p=0.0014\)). Latency **+3.5×**. Human-PR approval **declined** over the same calendar window. Median PR size flat. Authors **cannot establish causality** (agent quality may have improved). Independent-researcher author list; not an official GitHub study.

### Current workaround
Hope the reviewer still reads. Mute bots. Add another required approver. “LGTM if CI green.”

### Existing software
GitHub rulesets: **additional approval for unattributed Copilot PRs, default on** (`research/validation/05`, re-used as prior FACT, not re-fetched as a product this pass). Copilot review can count toward merge requirements. CODEOWNERS required reviews. CodeRabbit Request Changes. Danger `fail`. Graphite stacking.

### Why existing software fails
**INFERENCE:** extra approval counts a second *identity*, not a second *inspection*. The habituation paper’s own alternative explanations (rational trust calibration, backlog pressure) are not ruled out. A tool that “forces looking” is a comment quota or a quiz-on-the-diff — the comment-bot failure mode.

### Evidence (URLs actually read this pass)
- https://arxiv.org/html/2606.22721v1
- Prior kill (not reopened): https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
- Adjacent lab studies (weaker, small-n): Tang PLATEAU 2023 PDF; Zare 2026 HCII PDF; arXiv:2609.21020 PDF

### Economic impact
Unknown dollars. Paper does not report revert rate or production-incident rate of habituated approvals.

### Technical opportunity
Measure within-reviewer Δ approval vs comment volume. That is a research dashboard on GitHub metadata.

### Non-AI
The measurement is non-AI. The *intervention* (require a human comment) is a GitHub setting.

### AI
An LLM that “summarizes the diff so the reviewer can skip reading” **worsens** habituation.

### Security/privacy
Needs org GitHub metadata. Fine-grained review traces are PII-ish (who slackened).

### Three-week feasibility
Yes as a chart over public AIDev. No as a trusted gate.

### Demo possibility
20s: “this reviewer’s comment rate fell 22%.” Looks like a Graphite analytics screenshot. Judge-says-no: “GitHub already requires an extra Copilot approver.”

### Post-hackathon potential
Feature request on GitHub, not a company. Same 2-year owner as Merge Preflight.

### Strongest reason NOT to solve it
It **is** Merge Preflight’s socio-technical remainder, already occupied by identity-based extra approval. Building “make them leave a comment” is a comment bot. Paper cannot show the approvals were *wrong*.

### Status
**KILLED**

---

## ST-2 — Humans review git; what installs is a different artifact

### User
Distribution packagers (Debian/Nix/brew), security engineers, OSS release managers.

### Exact workflow
Review commits on GitHub/GitLab → `git tag` → publish a **release tarball** (often with generated `m4`/test binaries) → distros build from the tarball, not from `git clone`.

### Failure
A change can be technically “in the release” while **nobody who looked at git saw it**. xz 5.6.0/5.6.1: payload in tarball test files and `build-to-host.m4`, not in the public git tree in the form that executed. Discovered by a PostgreSQL developer chasing SSH CPU, not by review.

### Frequency
Rare as a nation-state-shaped attack; the *mismatch class* is routine (tarballs add autotools output). **FACT:** Freund disclosure 29 Mar 2024, Openwall. Ars Technica 1 Apr 2024: JiaT75 first known commit 2021; sock-puppet pressure on Lasse Collin; oss-fuzz URL/ifunc changes. Ugly workaround after the fact: `diff -r` git vs unpacked tarball; `git-buildpackage` import commit; `diffoscope`; `dishball` (1★ this fetch); `auth-tarball-from-git` (17★).

### Current workaround
Manual recursive diff. Trust the signed git tag and ignore tarballs (NixOS Discourse thread). Reproducible-builds.org. Don’t review binary “test” files.

### Existing software
diffoscope; reproducible-builds; in-toto/sigstore; `kpcyrd/auth-tarball-from-git` 17★; `alvarezp/dishball` 1★; Debian `gbp import-orig`. OpenSSF Scorecard (adjacent, and itself gamed — ST-3).

### Why existing software fails
Packagers still consume upstream tarballs because that is the lowest common denominator (Otto Kekäläinen post, fetched). Generated autotools files create **legitimate** git≠tarball diffs, so a red “mismatch” gate is noisy. Detection of xz was luck + latency, not a catalog product.

### Evidence
- https://www.openwall.com/lists/oss-security/2024/03/29/4
- https://arstechnica.com/security/2024/04/what-we-know-about-the-xz-utils-backdoor-that-almost-infected-the-world/
- https://optimizedbyotto.com/post/xz-backdoor-debian-git-detection/
- https://discourse.nixos.org/t/reconsider-reusing-upstream-tarballs/42524
- https://github.com/kpcyrd/auth-tarball-from-git (17★, 21 Sep 2026)
- https://github.com/alvarezp/dishball (1★)

### Economic impact
Counterfactual worldwide sshd backdoor. Dollar figure Unknown. No OFFGRID buyer identified who is not a distro or a security vendor.

### Technical opportunity
Hosted `diff git-tag unpacked-tarball` with a fixture. That is `dishball` in a browser.

### Non-AI
Recursive file diff. Stronger without a model.

### AI
An LLM explaining the diff does not make a packager look at `bad-3-corrupt_lzma2.xz`.

### Security/privacy
This **is** supply-chain / offensive-adjacent. Repo strategy: do not build cyber.

### Three-week feasibility
Afternoon wrapper. Fatal for originality.

### Demo possibility
xz fixture → files only in tarball go red. Judges who know xz call it a book report. Judges who don’t still see `diff -r`.

### Post-hackathon potential
None independent. Distros and sigstore own it.

### Strongest reason NOT to solve it
Cyber + occupied + weekend wrapper. Forbidden class for this repo even if it were empty (it is not).

### Status
**KILLED**

---

## ST-3 — “Reviewed” attestations that do not mean a human looked

### User
Open-source maintainers and downstream consumers who trust OpenSSF Scorecard’s Code-Review check (High risk tier).

### Exact workflow
Run Scorecard → Code-Review reports **10/10 “all changesets reviewed”** → consumer believes human review is required before merge.

### Failure
**FACT (whyisthisdown.com 31 Aug 2026, plus `gh issue view ossf/scorecard#370` this pass):** Gerrit detection is substring `Reviewed-on:` AND `Reviewed-by:` in the commit message; the Reviewed-by *value is not parsed*. `Reviewed-by: Nobody <nobody@example.invalid>` satisfies it. Prow path: a label named `approved`/`lgtm` short-circuits to “reviewed.” Author-merger self-approve with that label scores 10/10. Issue **#370** (opened 27 Apr 2021 by a Scorecard contributor, **closed 5 Feb 2024**) asked in writing: “we check for reviews via gerrit by checking the presence of string `Reviewed-on:` in the commit message. Is there a better way?” Scorecard **5,699★** this fetch.

### Frequency
Reproduced by the author against pinned commit `d1fab88` (15 Aug 2026) in five public lab repos (claimed; lab repos not re-cloned this pass — treat lab *numbers* as the post’s, the *detector logic* as corroborated by issue 370 + the quoted `getGerritRevisionID`).

### Current workaround
Ignore Scorecard Code-Review. Require GitHub branch protection. Read the actual PR.

### Existing software
OpenSSF Scorecard 5,699★. GitHub “required reviewing” is the real control. SLSA provenance. Gerrit itself, when actually running.

### Why existing software fails
Scorecard cannot see a live Gerrit from a GitHub mirror (the 2021 issue already said this). It scores substring theater instead of `inconclusive`. Consumers treat 10/10 as a human looked.

### Evidence
- https://whyisthisdown.com/posts/reviewed-by-nobody
- https://github.com/ossf/scorecard/issues/370 (body fetched via `gh`)
- https://github.com/ossf/scorecard (5,699★, 21 Sep 2026)

### Economic impact
Unknown. Trust-score market, not a weekly professional job with WTP evidence this pass.

### Technical opportunity
Fix Scorecard’s check. That is an upstream PR, not an OFFGRID company.

### Non-AI
Substring vs platform attestation.

### AI
Irrelevant.

### Security/privacy
Public repo metadata.

### Three-week feasibility
Yes as a lab that reprints whyisthisdown. That is a blog with CSS.

### Demo possibility
Self-merge + fake trailer → 10/10. View-source: we wrapped their Go.

### Post-hackathon potential
Scorecard changelog line.

### Strongest reason NOT to solve it
It is a **bug in a 5.7k★ OpenSSF tool**. Shipping a competing “honest review score” is another GitHub-well dashboard and adjacent to CODEOWNERS/required-review, which this cycle is forbidden to resurrect.

### Status
**KILLED**

---

## ST-4 — Patch/CVE alert goes to everyone, so it goes to no one (runtime ownership, not CODEOWNERS)

### User
Enterprise IT / vulnerability management. The person who is supposed to patch a **running** application when US-CERT fires.

### Exact workflow
Vendor/US-CERT advisory → internal GTVM-style email or ticket to a large list → someone must identify *which running system* has the library → designated owner applies patch in 48h.

### Failure
Policy names roles (business / system / application owner). **Nobody is designated.** The email is sent to hundreds of people. Scans miss the instance. CEO later calls it “human error” of one forwarder.

**FACT (U.S. House Oversight Equifax staff report, Dec 2018, PDF fetched):** GTVM emailed the Struts alert to **over 400 people** on 9 Mar 2017, 48-hour patch policy. ACIS (1970s consumer dispute portal) stayed unpatched. Payne: “I don’t believe there was any explicit designation of application owners.” Policy required owners to subscribe to US-CERT; with no designees, nobody was on the hook for the subscription. Payne (SVP, ~400 reports) was fired for not forwarding the email. Announced **143 million** consumers, later **148 million**. Senate HSGAC report (also fetched): monthly vuln meetings that senior managers did not routinely attend; CIO described patching as “six levels down.”

This is **not** CODEOWNERS. CODEOWNERS maps git paths to GitHub identities. Equifax failed to map a **running binary / legacy portal** to a human. Owner Diff (`research/06` #24) was already REJECTED as a GitHub Action; do not rebuild it.

### Frequency
One congressional-grade incident is not a rate. The *workaround* (blast-email the org) is old and still used. Recurrence rate Unknown.

### Current workaround
Email 400 people. Wiki of “who owns what” that rot. Fire the person who didn’t forward. Mandiant after the fact.

### Existing software
Tenable / Qualys / Rapid7 (vuln → asset). Wiz / Orca (runtime cloud). ServiceNow CMDB. Tanium. Backstage software catalog (**34,462★** this fetch) — “no more orphan software.” PagerDuty + patch tickets. Endor Labs / Snyk for *declared* deps.

### Why existing software fails
**FACT:** Equifax *ran scans that did not identify* the Struts instance (CEO written testimony, quoted in govinfosecurity coverage; House report discusses inventory failure). **FACT:** DevOpsNess 2026 blog (fetched): first Backstage rollout became a graveyard — decommissioned services, owners who left, 404 docs — until they stopped asking humans to register YAML. **INFERENCE:** CMDB/catalog products fail the same socio-technical way Equifax’s policy failed: roles on paper, empty seats in reality. That does not imply a 3-week app can assign owners better than ServiceNow.

### Evidence
- https://oversight.house.gov/wp-content/uploads/2018/12/Equifax-Report.pdf
- https://www.hsgac.senate.gov/wp-content/uploads/imo/media/doc/FINAL%20Equifax%20Report.pdf
- https://surfingcomplexity.blog/2018/12/14/the-equifax-breach-report/ (quotes the same Payne transcript)
- https://github.com/spotify/backstage (34,462★)
- https://www.devopsness.com/blog/backstage-software-catalog-adoption
- Explicitly **not** this problem: GitHub CODEOWNERS docs (prior cycle)

### Economic impact
148 million consumers’ PII. Equifax market-cap / settlement dollars not re-fetched this pass (Unknown here). The *job* is already a nine-figure vendor category.

### Technical opportunity
Join CVE → running process/binary → on-call human, and refuse to send the 400-person email. That join is Tenable/Wiz.

### Non-AI
Inventory + ownership table. AI classifying owners from Slack is theater.

### AI
Optional: parse advisory text. Not the bottleneck (they had the US-CERT notice).

### Security/privacy
Highest: asset inventory + vuln status is crown-jewel data. Hosted demo needs fixtures, not a real CMDB.

### Three-week feasibility
Toy HTML: “CVE-2017-5638 → ACIS → (empty owner).” Looks like a spreadsheet. Real scanners are years of agents.

### Demo possibility
Weak. Judges see ServiceNow. Fixture smell.

### Post-hackathon potential
Absorption into Wiz/Tenable/ServiceNow/Backstage. Not an independent company.

### Strongest reason NOT to solve it
Occupied by the entire vulnerability-management industry. Empty-owner is a **process** failure those vendors already sell against. Easy to confuse with CODEOWNERS (already killed). No 20-second wow that is not a table with a blank cell.

### Status
**WEAK** (pain congressional-grade; product gap not shown; do not build)

---

## ST-5 — Shift handoff that was sent but not acknowledged (ops; clinical analog occupied)

### User
Engineers ending a PagerDuty/Opsgenie week; incoming on-call. (Clinical nurses/residents are the *evidence analog*, not the OFFGRID buyer.)

### Exact workflow
Outgoing writes “quiet week” in Slack or a doc → pager rotates → incoming is paged at 03:00 for a thread the outgoing was already tracking → neither thinks they own it.

### Failure
Handoff is optional prose. “It was sent” ≠ “it was read.” Google SRE book (quoted by incident.io, fetched): outgoing commander waits for **firm acknowledgment**. Ugly workaround: **Google Sheet + Slack workflow** (Honor, Jocelyn Keung Medium — fetched). Shiftctl 2026 blog (vendor): “None of [PagerDuty, Better Stack, incident.io, Opsgenie] handles [enforced handover]”; they sell the gate.

### Frequency
Unknown as a measured engineering rate. Clinical analog is quantified and **already productized**:
- **FACT:** Joint Commission Sentinel Event Alert 58 (2017 PDF): communication failures implicated in **30%** of malpractice claims, 1,744 deaths, **$1.7B** over five years (TJC citing a 2016 study). Receivers judged **37%** of hand-offs unsuccessful.
- **FACT:** Starmer et al., NEJM 2014 (I-PASS): 10,740 admissions; medical errors **24.5 → 18.8 /100** (−23%); preventable adverse events **4.7 → 3.3 /100** (−30%).
- **FACT:** CRICO malpractice sample (PubMed 35188927): communication failures in **49%** of claims; **40%** of those were failed handoffs; mean cost **$237,600** vs $154,100.

Those numbers justify I-PASS/Epic, not an OFFGRID clone of a pediatric-residency bundle.

### Current workaround
Slack “you’re up.” Spreadsheet. Verbal “it was quiet.” `/pd note`. incident.io async template. Shiftctl.

### Existing software
PagerDuty Slack + notes + **Change Events / Recent Changes** (official docs fetched: change events **do not notify**; they appear on the incident page after you are already paged). incident.io on-call handoff template (vendor blog). Shiftctl (enforced sign-off). Better Stack. Opsgenie. Clinical: I-PASS, SBAR, EHR signout modules.

### Why existing software fails
**FACT:** PagerDuty Change Events are triage *after* the page, not a shift-start brief the incoming must ack. **FACT:** Honor built Sheets because `/pd oncall` is a private slash-command, not a team handoff. **Vendor claim (Shiftctl, treat as vendor):** alerting tools don’t enforce handover. Counter: incident.io’s job *is* coordination, and they say so.

### Evidence
- https://medium.com/@jkeung/a-homegrown-free-pagerduty-google-sheets-slack-integration-c93b9cc6f52d
- https://incident.io/blog/async-on-call-handoff-template
- https://shiftctl.com/blog/on-call-handover-guide
- https://support.pagerduty.com/main/docs/recent-changes
- https://support.pagerduty.com/main/docs/slack-integration-guide
- https://www.nejm.org/doi/full/10.1056/NEJMsa1405556
- https://www.jointcommission.org/-/media/tjc/documents/resources/patient-safety-topics/sentinel-event/sea_58_hand_off_comms_9_6_17_final_(1).pdf
- https://pubmed.ncbi.nlm.nih.gov/35188927/
- Knight SEC (related “signal existed, humans didn’t treat it as an alert”): 97 BNET emails, https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf
- Target 2013 (same class, **cyber**, extra-kill): FireEye alerts reached Bangalore → Minneapolis, “did not warrant immediate follow-up” — Reuters + Bloomberg Businessweek archive

### Economic impact
Clinical: TJC’s $1.7B / I-PASS 30% preventable-AE drop. Engineering: unknown; one missed 3am page is not a TAM. Knight $460M is the *unread-email* cousin, not a handoff SaaS proof.

### Technical opportunity
iCal-sync + structured fields + required ack. That sentence is Shiftctl’s homepage pitch.

### Non-AI
Checklist + ack timestamp. I-PASS is a mnemonic, not a model.

### AI
“Summarize the shift” is incident.io / PagerDuty Advance. Makes unread more likely.

### Security/privacy
Incident details are confidential. Clinical PHI if you foolishly go there. Hosted demo needs a fake pager.

### Three-week feasibility
Yes as a form. Indistinguishable from incident.io’s template.

### Demo possibility
Checkbox “incoming acked.” Not a 20s wow. Looks like a standup bot.

### Post-hackathon potential
Compete with incident.io ($45/user/mo claim on their blog, vendor) and PagerDuty. Enterprise on-call is a graveyard for a solo 3-week app.

### Strongest reason NOT to solve it
The ugly Sheets workaround is real; the **category is not empty**. Clinical evidence is strong and already captured by I-PASS. Knight/Target are “humans didn’t act on a signal” and are SIEM/notification problems (kill class). Building I-PASS-for-Slack is a meeting notetaker adjacent (already REJECTED as a class).

### Status
**WEAK**

---

## ST-6 — Production behavior lives in an unowned vendor-dashboard prompt

### User
Teams shipping LLM features who moved prompts out of git into a prompt UI so PMs can edit without deploys.

### Exact workflow
PM/support edits a string in Langfuse/PromptLayer/vendor dashboard at 23:00 → production traffic uses it → structured output breaks days later → postmortem cannot answer who owns the prompt.

### Failure
Highest behavior-per-character artifact escapes change management. Failures are distributional, not exceptions.

**FACT:** Langfuse prompt version control + **protected production labels** (admin/owner only) — docs fetched 21 Sep 2026. PromptLayer RBAC includes `PROMPT_DEPLOY` / Publisher. Humanloop **sunset 8 Sep 2025** (prior research).  
**NOT FACT:** tianpan.co 18 May 2026 “prompt nobody owned” narrative is a **paywalled essay** with an unnamed revenue workflow. The public portion cites “a 2025 review of more than a thousand production LLM deployments” **without a paper URL**. Do not treat that n as a study. Composite storytelling ≠ Mata-class evidence.

### Frequency
Unknown. Essay claims “most common production AI incident.” Unverified.

### Current workaround
Put the prompt back in git. Protected labels in Langfuse (Pro/Teams). Don’t give PMs production.

### Existing software
Langfuse (34.9k★ class from prior research; prompt CI guide fetched this pass). PromptLayer. LangSmith. Promptfoo. Git.

### Why existing software fails
It doesn’t, for the stated job. The gap is orgs that *disable* the gate the vendors already sell. That is not whitespace.

### Evidence
- https://langfuse.com/docs/prompt-management/features/prompt-version-control
- https://langfuse.com/resources/engineering/prompt-cicd
- https://www.promptlayer.com/prompt-management/
- https://promptlayer.mintlify.app/why-promptlayer/rbac
- https://tianpan.co/blog/2026/05/18/prompt-nobody-owned-postmortem (public intro only; rest members-only)

### Economic impact
Unknown. Essay’s “ninety minutes of stalled revenue” is unsourced.

### Technical opportunity
None that is not Langfuse labels.

### Non-AI
Git + code owners on `prompts/`. Already exists; Owner Diff was REJECTED.

### AI
The artifact is AI; the control is not.

### Security/privacy
Prompts often contain customer-derived examples.

### Three-week feasibility
Yes as “paste a prompt, show no owner.” Theater.

### Demo possibility
Fails Originality against Langfuse’s own CI guide (fetched the same day as this memo).

### Post-hackathon potential
Humanloop is the prior for independent prompt SaaS.

### Strongest reason NOT to solve it
Incumbent feature, unnamed anecdote, eval-platform crowding (Canary Session already KILLED on Promptfoo/Langfuse).

### Status
**KILLED**

---

## ST-7 — Agents reimplement a function that already exists in the repo

### User
Teams whose agents write most of the code. Maintainers drowning in near-duplicate helpers (`formatDate` / `renderTimestamp`).

### Exact workflow
Agent tasked “add timestamps” → does not search the repo → writes a new helper → PR is “correct” → canonical helper ages in parallel.

### Failure
Technically valid new code that a human who knew the codebase would not have written. Duplicate work *inside one repo*, not GitHub-issue dups (DupGate already REJECTED).

### Frequency
Vendor/OSS claims of “duplication doubled since AI” were **not independently measured this pass**. Do not cite as fact. The *product category* is already noisy.

### Current workaround
`jscpd` / PMD CPD / Sonar clone detection. Reviewer memory. AGENTS.md “search first.” MCP `find-similar`.

### Existing software
**FACT (`gh` 21 Sep 2026):** `Rafaelpta/dupehound` **94★** — “Finds the code your AI wrote twice,” CI `check` gate, no ML. `Nimblesite/Deslop` **47★** — live LSP+MCP `find-similar` for agents. semdup, redup, SonarQube, PMD. This is **not** empty.

### Why existing software fails
False positives on similar-but-intentional code. Agents ignore MCP unless prompted. CI clone gates are politically the same as Merge Preflight’s false blocks.

### Evidence
- https://github.com/Rafaelpta/dupehound (94★)
- https://github.com/Nimblesite/Deslop (47★)
- https://www.christianfindlay.com/blog/find-duplicate-code-csharp-deslop
- Ford ML feature-store essay (adjacent org-scale duplicate *features*, occupied by Feast/Tecton): https://gauthamv.com/writing/feature-store-deep-dive/

### Economic impact
Unknown. Ford claim (author’s own post): ML cycles 6 months → 1 week after a **custom feature store** — not a clone detector, and Feast/Tecton exist.

### Technical opportunity
Index functions, fail CI on Type-3 clones. dupehound README *is* the product.

### Non-AI
AST/MinHash. dupehound’s pitch is “an LLM can’t do this job.”

### AI
Embeddings (semdup) — already a tool.

### Security/privacy
Local index of source. Fine.

### Three-week feasibility
Yes, and that is why it dies: copy-me of a 94★ CLI.

### Demo possibility
`formatDate` vs `renderTimestamp` side by side. Sonar has done this for a decade.

### Post-hackathon potential
Sonar feature. Not a company.

### Strongest reason NOT to solve it
Occupied clone-detection + agent-MCP tools shipping *this month*. Adjacent to DupGate (killed) and Merge Preflight (killed).

### Status
**KILLED**

---

## ST-8 — Researchers register overlapping work, then abandon it as a zombie protocol

### User
People about to start a systematic review (methods researchers, HTA, guideline groups). Not GitHub maintainers.

### Exact workflow
Before writing a protocol: search PROSPERO / OSF / INPLASY → decide whether the question is taken → if a protocol exists, **email the author** to ask if the review is still alive → register anyway or stop.

### Failure
Two teams run the same review because (a) they did not search, (b) they searched, saw a hit, and ticked “Not Similar,” or (c) the hit is a **zombie** — abandoned but still listed as ongoing, so newcomers either duplicate or wrongly stand down. Ugly workaround: email strangers; wait; guess.

**FACT (Beresford, Walker, Stewart, BMJ Open 2022; CRD York news 2023; full HTML fetched):** 1 Mar 2020–31 Jan 2021, **3,013** COVID-19 protocols on PROSPERO; **1,054** in four topic slices; **138** submitted when similar/identical PICOS already registered. Hydroxychloroquine **14** similar reviews; tocilizumab **7**. Of 138, **85** answered the screening question **“Not Similar.”** Survey 41/138 responses; reasons included PICOS differences (n=13). PROSPERO **does not prevent** duplicate registration (2026 Frontiers meta-research, fetched).  
**FACT (Andrade et al. “Zombie reviews” preprint PDF fetched):** of PROSPERO SRs registered 2011–2017, **only 7%** updated to published. Remainder clog the registry as unfinished or unpublished.

Chalmers & Glasziou Lancet 2009: cumulative **>85%** avoidable waste estimate (design + unpublished + unusable reports). Authors later explained the arithmetic (BMJ blog 2016, fetched). This is **research waste**, not “85% of dollars proven.”

### Frequency
Pandemic surge is a peak, not a 2026 weekly rate. Zombie 7% is 2011–2017 vintage. Live 2026 duplication rate across all of PROSPERO: Unknown this pass.

### Current workaround
Search PROSPERO + Cochrane + OSF; email corresponding author; register on a second platform (INPLASY, protocols.io) which **splits** the namespace and makes duplicates harder to see (Frontiers 2026).

### Existing software
PROSPERO (York CRD). Cochrane. OSF. INPLASY. ClinicalTrials.gov / WHO ICTRP for *trials* (related, not the same form). Elicit / Semantic Scholar (search, not liveness).

### Why existing software fails
**FACT:** PROSPERO administrators themselves documented COVID duplicates and still do not block them. Status is author-updated. Zombies persist by design. A third search box across PROSPERO+OSF+INPLASY is a weekend wrapper and still cannot tell “abandoned” from “slow.”

### Evidence
- https://bmjopen.bmj.com/content/12/12/e061862
- https://www.york.ac.uk/crd/about/news/2023/duplication-prospero/
- https://repub.eur.nl/pub/109107/REPUB_109107_AAM.pdf
- https://doi.org/10.3389/frma.2026.1738112
- https://blogs.bmj.com/bmj/2016/01/14/paul-glasziou-and-iain-chalmers-is-85-of-health-research-really-wasted/

### Economic impact
Lancet-shaped “tens of billions” is the 2009 cumulative estimate, not a measured 2026 TAM. Reviewer-hours duplicated: Unknown. Buyers (universities, NIHR) already fund Cochrane/PROSPERO.

### Technical opportunity
PICOS similarity + **liveness probe** (does the protocol author still reply? is there a preprint?). Email-the-author is the current human job.

### Non-AI
Registry search + status ping. PICOS overlap can be rules.

### AI
Embedding similar titles — false “duplicate” on legitimately different PICOS (the survey’s main excuse). Zheng-class judge bias if an LLM decides “similar.”

### Security/privacy
Unpublished protocols; emailing authors; some reviews are industry-sensitive.

### Three-week feasibility
Hosted search over a PROSPERO CSV fixture: yes. Real-time PROSPERO scrape + author ping: ToS / rate-limit Unknown. Demo of “14 HCQ protocols” is a table.

### Demo possibility
Mediocre. Looks like ClinicalTrials.gov. Judges in a builder house may not be systematic reviewers.

### Post-hackathon potential
PROSPERO/NIHR feature. Researchers are a bad WTP class (Tidelift-shaped: unpaid methods work). Not a company.

### Strongest reason NOT to solve it
The registry that should prevent this **already exists and refuses to gate**. Duplicate-detection without liveness is a search box. Liveness is “email the author.” Slow buyers. Easy to confuse with GitHub issue-dup (DupGate, killed).

### Status
**WEAK**

---

## Explicitly searched and **not** promoted as opportunities

| Failure mode | Why not a numbered KEEP |
|---|---|
| Agent PR abandonment 38% / dups 23% | Merge Preflight residual; CodeRabbit issue-dup; GitHub well |
| GitHub notifications unread | Forbidden class |
| CODEOWNERS rot / empty team | Owner Diff REJECTED; OpenReplay 2026 already in prior kill file |
| Duplicate GitHub issues | DupGate REJECTED |
| Duplicate SaaS / shadow IT | Zylo occupies (vendor pages fetched) |
| ML feature duplication | Feast/Tecton; Ford post is a feature-store case study |
| Bus factor / tribal knowledge | Notion/Glean/Guru/ADR; Herrington blog is a leadership essay, not a gap |
| Boeing 737 MAX MCAS not in manuals | NTSB ASR-19-01 fetched; aviation certification, not a 3-week product |
| CrowdStrike Channel File 291 (Jul 2024) | Official RCA fetched: validator trusted after prior greens — **automation bias / test hole**, vendor’s own process, not a startup |
| Clinical I-PASS as a *product* | Occupied; HIPAA; not OFFGRID demoable with public fixtures honestly |
| Target FireEye ignored | Cyber + SIEM; Reuters + Bloomberg archive |

---

## Area-level kill test

If the job is **“stop duplicate work before a human is taxed”**: Linear/Jira/PROSPERO/Zylo/Feast/dupehound/GitHub depending on layer.  
If the job is **“make a human actually look”**: GitHub extra Copilot approval, required reviews, I-PASS, PagerDuty ack — and Scorecard shows that *scoring* looking is gameable.  
If the job is **“map a change to someone who owns the running system”**: CMDB/Wiz/Backstage; Equifax shows empty seats, not missing software.

No KEEP. Do not start architecture. Do not resurrect Merge Preflight, DupGate, Owner Diff, comment bots, or a “handoff copilot.”
