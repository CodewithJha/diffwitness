# Sources — Merge Preflight kill test

**Date accessed:** 21 September 2026  
**Rule:** only pages actually fetched/read this pass. Search snippets are discovery unless the page was then opened.  
**Agent Reach:** `doctor --json` first. GitHub via `gh` (Doctor `active_backend: null`; `gh auth status` + `gh api` succeeded). Web via Jina Reader (`r.jina.ai`). Exa via `mcporter` (rate-limit / 503 on some calls; later calls returned GitHub docs + competitor comparison hits). Twitter/Reddit backends off — not used. `agent-reach check-update`: **v1.5.0, current**.

| Source | URL | Type | What it proves for this kill | Reliability | Notes |
|---|---|---|---|---|---|
| arXiv abs 2601.15195 | https://arxiv.org/abs/2601.15195 (Jina) | Paper | Title, abstract, MSR 2026 accepted, 33k PRs, five agents, RQ1/RQ2 | High | v1 21 Jan 2026; not missing/retracted this fetch |
| arXiv HTML v1 | https://arxiv.org/html/2601.15195v1 (Jina) | Paper | Dataset AIDev-pop; n=33,596; agent counts & merge rates; Cliff’s δ; logistic OR; RQ2 taxonomy 228/142/99; no ToV section in HTML | High | Primary numbers for kill test C |
| AIDev-pop citation | Li et al. arXiv:2507.15003 (cited in paper; not re-fetched in full) | Paper | Source of the 33k corpus; repos >100★ | Medium | Cited, not independently re-run |
| GitHub: about rulesets | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets | Official docs | Rulesets exist; 75/repo; bypass actors | High | Jina |
| GitHub: available rules for rulesets | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets | Official docs | Required status checks; **additional approval for unattributed Copilot PRs (default on)**; restrict file paths/size; CODEOWNERS option | High | **A’s smoking gun** |
| GitHub: protected branches | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches | Official docs | Required reviews, code owners, strict/loose checks, duplicate job-name warning | High | |
| GitHub: about code owners | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners | Official docs | Request vs require; write access; drafts; empty owner lines | High | |
| GitHub: Copilot code review concepts | https://docs.github.com/en/copilot/concepts/code-review | Official docs | Auto review; agentic capabilities; unlicensed org members | High | |
| GitHub: configure Copilot automatic review | https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/configure-automatic-review | Official docs | Auto request Copilot; Copilot approvals can **count toward merge requirements**; file globs | High | |
| GitHub: managing a merge queue | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue | Official docs | Queue + required checks; only merge non-failing; `merge_group` | High | Older URL 404’d; this path 200 |
| GitHub: troubleshooting required status checks | https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks | Official docs | Skipped workflows stay Pending and **block merge** | High | False-block evidence |
| CodeRabbit Pre-Merge Checks | https://docs.coderabbit.ai/pr-reviews/pre-merge-checks.md and `/pr-reviews/pre-merge-checks` | Vendor docs | Named **Pre-Merge Checks**; 4 built-ins; custom NL; warning vs **error that blocks**; Ignore checkbox | High | |
| CodeRabbit llms.txt | https://docs.coderabbit.ai/llms.txt | Vendor index | Triage, duplicates on issues, request-changes workflow, finishing-touches tests | High | |
| CodeRabbit Triage prioritization | https://docs.coderabbit.ai/triage/prioritization.md | Vendor docs | Priority vs next-action; CI-blocked ≠ important | High | Open beta / Team plan badges |
| Qodo code review | https://docs.qodo.ai/code-review | Vendor docs | Review experience; relevance; blast radius; requirement gaps; cross-repo conflicts | High | |
| Qodo blast radius | https://docs.qodo.ai/code-review/assess-risk-with-blast-radius | Vendor docs | Risk assessment of a change | High | Page exists; body mostly nav this fetch |
| Qodo rule enforcement | https://docs.qodo.ai/governance/rule-enforcement | Vendor docs | Governance / standards enforcement | High | |
| Qodo llms.txt | https://docs.qodo.ai/llms.txt | Vendor index | Code governance, rule miner, cross-repo | High | |
| Qodo 1.x overview | https://docs.qodo.ai/v1/qodo-merge | Vendor docs | Former “Qodo Merge”; descriptions, quality, best practices | High | |
| Qodo “Formerly Qodo Merge” | https://www.qodo.ai/blog/qodo-merge/ | Vendor | Git/IDE/CLI rename; PR descriptions; suggestions | Medium | Marketing |
| Graphite homepage | https://graphite.dev/ | Vendor | Cursor Cloud Agents in Graphite; stacking; merge queue; smaller PRs claim; AI reviewer resolves CI | High | |
| Graphite docs llms.txt | https://www.graphite.dev/docs/llms.txt | Vendor index | AI reviews, merge queue, mergeability status check, automations, stack structure | High | |
| Graphite mergeability status check | https://graphite-58cc94ce.mintlify.dev/docs/mergeability-status-check.md | Vendor docs | Optional GH status check to prevent mid-stack merges | High | |
| Danger JS | https://danger.systems/js/ | OSS | CI rules; `fail` blocks; examples **smaller PRs** and **more testing** | High | |
| OpenReplay CODEOWNERS | https://blog.openreplay.com/automatic-code-reviews-codeowners/ (Exa + later consistency with GH docs) | Blog 2026-08-06 | Empty team → merge blocked with no approver; CODEOWNERS ≠ block without ruleset | Medium–High | Matches GitHub docs |
| github/docs#16897 | https://github.com/github/docs/issues/16897 | GitHub | Ambiguity of “require all vs any code owner” | High | |
| Koalr CODEOWNERS | https://koalr.com/blog/codeowners-enforcement (Exa) | Blog 2026-03-31 | Advisory vs required; 4.1× incident claim is **vendor-ish / not independently audited** | Low on 4.1×; Medium on “file isn’t enough” | Do not treat 4.1× as fact |
| ResumeLens overlapping rulesets | https://www.resumelens.org/blog/github/github-codeowners-branch-protection (Exa) | Blog | Classic + ruleset + Code Scanning wait + dismiss-stale + solo CODEOWNER | Medium | One repo’s postmortem |
| SwitchMyTool Qodo vs Graphite | https://www.switchmytool.com/blog/qodo-vs-graphite-agent (Exa 2026-07-31) | Blog | Qodo multi-agent review + standards; Graphite stacks + merge queue; huge PRs already broke review | Medium | Secondary |
| Coderbuds AI review comparison | https://coderbuds.com/blog/ai-code-review-tools-comparison-2026 (Exa) | Blog | Graphite Agent folded Diamond Oct 2025; Cursor acquisition Dec 2025 claim | Medium | Used only as crowding, not financials |
| CodePulse AI review guide | https://codepulsehq.com/guides/ai-code-review-tools-guide (Exa) | Blog | Copilot / CodeRabbit / Qodo / Graphite table | Low–Medium | Vendor-adjacent |
| Respan Graphite vs Qodo | https://www.respan.ai/market-map/compare/graphite-vs-qodo (Exa) | Blog | Qodo test coverage analysis claim | Low–Medium | |
| HN Algolia CODEOWNERS / branch protection | `hn.algolia.com` search | Forum index | Almost no hits for those exact queries this pass | n/a | Negative; do not invent threads |
| Prior in-repo research | `research/00`, `04`–`11`, `05` #27, `06` #27, `sources.md` | Internal | Thesis, CodeRabbit noise, GitHub as named competitor, validate-on-20-PRs | High as prior work | Independently re-fetched GH/competitors/paper |
| HACK47 constraints | `research/01-hackathon-intelligence.md` | Internal | Originality, demo URL, unweighted criteria | High | Judge-says-no |
| Public PR metadata | `gh api repos/{owner}/{repo}/pulls/{n}` + `/files` + `/commits/{sha}/status` + `/check-runs` + issue comments | GitHub API | Table in `05-merge-preflight.md`; authors, files, +/- , tests/docs heuristic, CI | High for fetched fields | 26 URLs listed there; Codex toys excluded |
| Paper-cited example PRs | URLs in arXiv HTML bibliography GitHub (2025a–j) | GitHub | netdata, coder, vscode-cpptools, sentry-javascript, reflex-web, firecrawl, hyperlight, BMAD-METHOD, pygraphistry, ruv-FANN | High that they exist | Outcomes re-fetched 21 Sep 2026 |
| Live agent PR search | `gh search prs --author app/copilot-swe-agent` (and cursor, devin, claude, chatgpt-codex-connector) | GitHub search | Discovered live URLs; later search 403 secondary rate limit | High for hits before 403 | Codex: only daisy976/test-repo whitespace PRs |

## Intentionally not evidence

- Tweets (Twitter CLI not installed).
- Reddit (no backend).
- Invented PRs, star counts, or paper stats (all numbers above are from fetched pages/API).
- `daisy976/test-repo` Codex PRs as merge-success evidence (toy).
- Koalr 4.1× incident rate as a statistic.
- CodeRabbit dollar pricing this pass (not re-fetched; prior research conflict stands).
- Cursor↔Graphite acquisition dollar terms (secondary blogs only).
- Revert analysis (not measured).

## Agent Reach note

Used: GitHub (`gh`), web (Jina), Exa (partial). Not used: Twitter, Reddit, LinkedIn, Xiaohongshu, Bilibili. Doctor: `web` ok; `github` warn (gh present, not live-verified by doctor); `exa_search` warn then mixed success.
