# Validation sources — merged, inspected 21 September 2026

**Date accessed:** 2026-09-21  
**Rule:** only pages, APIs, `gh` queries, and local files **actually inspected** during the five kill tests. Search snippets were discovery until the underlying page was read. Deduplicated URLs. Do not treat unfetched pages as read.  
**Merged from:** `_sources-citecheck.md`, `_sources-action-receipt.md`, `_sources-canary-session.md`, `_sources-spec-triangle.md`, `_sources-merge-preflight.md`.  
**Used for:** `01`–`05` kill files and synthesis `06`–`07`.  
**Not this file:** `08-next-step.md` is intentionally not written (no candidate survived to BUILD).

**Tooling (all five passes):** `agent-reach doctor --json` first. GitHub via `gh` (doctor often `warn` / `active_backend: null`; `gh repo view` / `gh api` succeeded where listed). Web via Jina Reader (`r.jina.ai`) and Cursor WebFetch/WebSearch as fallback. Exa via `mcporter` until free-tier **429**. Reddit backend **off**. Twitter CLI **not installed**. LinkedIn MCP unverified. `agent-reach check-update`: **v1.5.0, current**.

**Reliability key:** High = page/API body read this pass. Medium = snippet then partial fetch, or vendor metric. Low = title-only / blocked body. N/A = fetch failed; listed so the failure is auditable.

---

## Internal repo files (read, not internet)

`AGENTS.md`, `docs/WIN-PLAN.md`, `research/00-executive-summary.md`, `research/01-hackathon-intelligence.md`, `research/04-competitive-analysis.md`, `research/05-problem-opportunities.md`, `research/06-product-concepts.md`, `research/07-shortlist.md`, `research/08-competitive-destruction.md`, `research/09-technical-feasibility.md`, `research/10-final-recommendation.md`, `research/11-report-A-to-O.md`, `research/sources.md`, `research/sources-hackathon.md` (hackathon intel only; not re-litigated here).

---

## Deduplicated inspected sources

| Source | URL | Type | Used by | What it proved this pass | Reliability |
|---|---|---|---|---|---|
| Agent Reach doctor | local CLI `--json` | Tooling | all | gh present; Exa configured then rate-limited; Jina OK; Reddit/Twitter off | High |
| Westlaw Quick Check product | https://legal.thomsonreuters.com/en/products/westlaw-edge/quick-check | Product | CiteCheck | Upload brief → cited-authority warnings, quotation analysis, TOA; KeyCite verify | High |
| Westlaw Quick Check help | https://www.thomsonreuters.com/en-us/help/westlaw-edge/tools/quick-check.html | Docs | CiteCheck | “will verify your citations and quotations”; Word/PDF limits; opponent mode | High |
| Seattle U Law Library guide | https://lawlibguides.seattleu.edu/c.php?g=1201978&p=8789738 | Library guide | CiteCheck | Exa: Litigation Document Analyzer (formerly Quick Check) reviews quotations | Medium (snippet; not full Jina) |
| Lexis+ Quote Check | https://supportcenter.lexisnexis.com/app/answers/answer_view/a_id/1123689/ | Support | CiteCheck | Quote vs primary source; pin-cite flag; Shepard’s | High |
| Lexis+ Brief Analysis marketing | https://www.lexisnexis.com/en-us/products/lexis-plus/brief-analysis.page | Product | CiteCheck | Page exists; body truncated | Medium |
| Bloomberg Brief Analyzer | https://pro.bloomberglaw.com/brief-analyzer/ | Product | CiteCheck | “easily check citations”; 2020 award | High |
| westcheck.com | https://westcheck.com/ | Sign-in | CiteCheck | Drafting Assistant US Signon; firm security can disable Remember me | High |
| CoCounsel Legal | https://legal.thomsonreuters.com/en/products/cocounsel-legal | Product | CiteCheck | TR AI; research/analysis/drafting; same vendor as Quick Check | High on identity |
| Harvey homepage | https://www.harvey.ai/ | Company | CiteCheck | $550M at $15.5B valuation banner (self-reported) | High as copy |
| Harvey Knowledge | https://www.harvey.ai/platform/knowledge | Product | CiteCheck | Ground answers in sources you trust; no dedicated cite-checker page found | High on copy |
| Harvey Security | https://www.harvey.ai/security | Security | CiteCheck | No training on uploads; ethical walls; in-region; SSO; SOC 2/ISO/GDPR | High |
| Fastcase | https://www.fastcase.com/ | Company | CiteCheck | Now part of Clio; Vincent AI; bar-association distribution | High |
| CourtListener ChatGPT post | https://free.law/2026/09/17/grounded-legal-research-in-chatgpt/ | Announcement | CiteCheck | 17 Sep 2026: verify every citation in an incoming brief; plugin + MCP; rate limits doubled through 1 Oct | High |
| CourtListener MCP wiki | https://wiki.free.law/c/courtlistener/help/api/mcp/using-the-courtlistener-mcp-in-claude-chatgpt-and-other-ai-assistants | Docs | CiteCheck | Citation verification tool; sample prompt “Verify every citation in this brief…” | High |
| Mata PACER PDF via CL | https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf | Court opinion | CiteCheck | Sanctions; fake cases/quotes; Gibbs collision; existence ≠ proposition | High |
| Mata Justia HTML | https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1:2022cv01461/575368/54/ | Court HTML | CiteCheck | **403** Cloudflare | High that blocked |
| Mata Casetext | https://casetext.com/case/mata-v-avianca-inc | Vendor | CiteCheck | **410 Gone**; “visit Westlaw… CoCounsel” | High |
| Mata CL docket | https://www.courtlistener.com/docket/63107798/mata-v-avianca-inc/ | Docket | CiteCheck | Page fetched | High on existence |
| CL `/c/F.3d/925/1339/` | https://www.courtlistener.com/c/F.3d/925/1339/ | Citation lookup | CiteCheck | 404 fake Varghese | High |
| CL Gibbs opinion | https://www.courtlistener.com/opinion/438784/frank-gibbs-jr-v-maxwell-house-a-division-of-general-foods-corporation/ | Opinion | CiteCheck | Real case at 738 F.2d 1153 | High |
| CL `/c/F.3d/516/1237/` | https://www.courtlistener.com/c/F.3d/516/1237/ | Citation lookup | CiteCheck | 404 fake Zicherman F.3d | High |
| CL Zicherman SCOTUS | https://www.courtlistener.com/opinion/117990/zicherman-ex-rel-estate-of-kole-v-korean-air-lines-co/ | Opinion | CiteCheck | Real Zicherman 516 U.S. 217 | High |
| CL Greenleaf | https://www.courtlistener.com/opinion/3011108/greenleaf-v-garlock-inc/ | Opinion | CiteCheck | 174 F.3d 352; HTML target of fake 174 F.3d 366 | High |
| CL ISS Marine | https://www.courtlistener.com/opinion/2661490/united-states-of-america-v-iss-marine-services-inc/ | Opinion | CiteCheck | Real case at fake Petersen’s reporter 905 F. Supp. 2d 121 | High |
| CL `/c/F.2d/821/1147/` | https://www.courtlistener.com/c/F.2d/821/1147/ | Citation lookup | CiteCheck | Several citations found (Air Crash cluster) | High |
| CL Rimsat | https://www.courtlistener.com/opinion/768752/in-re-rimsat-limited-debtor-appeals-of-kauthar-sdn-bhd/ | Opinion | CiteCheck | Real 212 F.3d 1039 | High |
| CL El Al Tseng | https://www.courtlistener.com/opinion/118253/el-al-israel-airlines-ltd-v-tsui-yuan-tseng/ | Opinion | CiteCheck | Real 525 U.S. 155; Montreal/purpose is Warsaw-protocol context | High |
| CL `/c/F.3d/92/1074/` | https://www.courtlistener.com/c/F.3d/92/1074/ | Citation lookup | CiteCheck | Several citations found (fake Hyatt page) | High |
| CL `/c/F.2d/556/713/` | https://www.courtlistener.com/c/F.2d/556/713/ | Citation lookup | CiteCheck | Resolves to *United States v. Clerkley* | High |
| CL `/c/F.3d/772/1278/` | https://www.courtlistener.com/c/F.3d/772/1278/ | Citation lookup | CiteCheck | Resolves to *Witt v. Metropolitan Life* | High |
| CL `/c/B.R./330/466/` | https://www.courtlistener.com/c/B.R./330/466/ | Citation lookup | CiteCheck | Resolves to *In re 652 West 160th LLC* | High |
| CL `/c/N.J. Super./360/360/` | https://www.courtlistener.com/c/N.J.%20Super./360/360/ | Citation lookup | CiteCheck | 404 | High |
| CL `/c/A.2d/823/122/` | https://www.courtlistener.com/c/A.2d/823/122/ | Citation lookup | CiteCheck | 404 | High |
| CourtListener REST v4 search | https://www.courtlistener.com/api/rest/v4/search/ | API | CiteCheck | Citation counts as tabulated in `01` (Gibbs 1; 174 F.3d 366 **0**; ISS Marine 1; etc.) | High |
| Crossref real DOI | https://api.crossref.org/works/10.1038/nature14539 | API | CiteCheck | 200; “Deep learning”; Nature | High |
| Crossref fake DOI | https://api.crossref.org/works/10.1038/nature999999 | API | CiteCheck | 404 Resource not found | High |
| HTTP HEAD CL | https://www.courtlistener.com/ | HTTP | CiteCheck | Home and fake path both **403 CloudFront** | High that HEAD≠existence |
| eyecite | https://github.com/freelawproject/eyecite | GitHub | CiteCheck | 283★; extract legal citations; updated 2026-09-20 | High |
| courtlistener_citations_mcp | https://github.com/john-walkoe/courtlistener_citations_mcp | GitHub | CiteCheck | 5★; Mata demo real/fabricated/wrong-case | High |
| citegate | https://github.com/chrisyangsong/citegate | GitHub | CiteCheck | 102★; CI gate vs Crossref/OpenAlex/DBLP | High |
| color4-alt/CiteCheck | https://github.com/color4-alt/CiteCheck | GitHub | CiteCheck | 59★; name collision; academic skill | High |
| PHY041 citation-checker | https://github.com/PHY041/claude-skill-citation-checker | GitHub | CiteCheck | 32★; .bib hallucination detector | High |
| xzy-xzy/CiteCheck | https://github.com/xzy-xzy/CiteCheck | GitHub | CiteCheck | Paper+dataset name collision | High |
| CiteCheck arXiv | https://arxiv.org/abs/2502.10881 | Paper | CiteCheck | CiteCheck: Towards Accurate Citation Faithfulness Detection, 15 Feb 2025 | High |
| tanhakris/juris-citation-verify | https://github.com/tanhakris/juris-citation-verify | GitHub | CiteCheck | 0★; CL + eyecite CLI | High |
| gongahkia/lit-hackathon-2025 | https://github.com/gongahkia/lit-hackathon-2025 | GitHub | CiteCheck | POFact; archived hackathon | High |
| lizTheDeveloper/citation-checker | https://github.com/lizTheDeveloper/citation-checker | GitHub | CiteCheck | 6★; git hook | High |
| jet52/jetredline | https://github.com/jet52/jetredline | GitHub | CiteCheck | 2★; quote validation | High |
| benchoi93/refcheck | https://github.com/benchoi93/refcheck | GitHub | CiteCheck | 3★; academic MCP | High |
| ethz-spylab/hallucinated-citations | https://github.com/ethz-spylab/hallucinated-citations | GitHub | CiteCheck | 3★; arXiv hallucinated refs | High |
| scite.ai | https://scite.ai/ | Product | CiteCheck | Smart citations; “never generated or hallucinated”; 2M users claim | High on copy |
| YC companies ?query=citation | https://www.ycombinator.com/companies?query=citation | Directory | CiteCheck | “40 of 186”; Ritivel visible; no CiteCheck named in snippet | Low for completeness |
| Product Hunt citation checker | https://www.producthunt.com/search?q=citation%20checker | Directory | CiteCheck | **CAPTCHA** | N/A |
| Chrome Web Store citation checker | https://chromewebstore.google.com/search/citation%20checker | Store | CiteCheck | **429** | N/A |
| recite.net | https://www.recite.net/ | Domain | CiteCheck | ReciteQuran CAPTCHA — not a legal citator | High that wrong product |
| Florida Bar Opinion 24-1 | https://www.floridabar.org/etopinions/opinion-24-1/ | Ethics | CiteCheck | URL exists; HTML chrome; **no extractable body** | Low for substance |
| Casetext Ehrlich | https://casetext.com/case/ehrlich-v-american-airlines-inc | Vendor | CiteCheck | **410 Gone** | High that Casetext shut |
| nltimes hallucinated citation | https://nltimes.nl/2026/08/24/dutch-lawyer-fined-eu2300-using-ai-hallucinated-citation | News | CiteCheck | Title via HN Algolia; body **not** fetched | Low |
| HumanLayer homepage | https://humanlayer.dev/ | Company | Action Receipt | Multiplayer coding-agent IDE; Pro $100/user/mo; Enterprise Audit Logs | High |
| HumanLayer GitHub | https://github.com/humanlayer/humanlayer | GitHub | Action Receipt | 11,592★; updated 2026-09-21 | High |
| HumanLayer require-approval docs | https://www.humanlayer.dev/docs/core/require-approval | Docs | Action Receipt | **404** | High that URL is dead |
| HumanLayer docs root | https://humanlayer.dev/docs | Docs | Action Receipt | Jina **429** | Unknown |
| HumanLayer PyPI | https://pypi.org/pypi/humanlayer/json | Registry | Action Receipt | v0.7.9; `@hl.require_approval()` | High |
| 12-factor-agents | https://github.com/humanlayer/12-factor-agents | GitHub | Action Receipt | 26,331★ | High |
| HumanLayer Launch HN | https://news.ycombinator.com/item?id=42247368 | Forum | Action Receipt | Prior research 354 points; not re-quoted this pass | High on existence |
| Cursor forum 157311 | https://forum.cursor.com/t/accessing-the-full-agent-transcript-in-cursor/157311 | Forum + staff | Action Receipt | JSONL = messages + assistant text + **tool inputs only**; use `postToolUse` | High |
| Cursor forum 150214 | https://forum.cursor.com/t/transcripts-no-longer-exported-in-full/150214 | Forum + staff | Action Receipt | Export omits collapsed terminal I/O; FR not bug | High |
| Cursor forum 155837 | https://forum.cursor.com/t/exporting-transcript-doesnt-export-agent-commands/155837/4 | Forum + staff | Action Receipt | Export is text-only | High |
| Cursor forum 166592 | https://forum.cursor.com/t/richer-agent-transcripts-lifecycle-data-for-observability-langfuse-stop-hooks/166592 | Forum | Action Receipt | JSONL thinner than Claude Code; SDK `index.db` has run_events | High on reports |
| Cursor forum 156247 | https://forum.cursor.com/t/platform-level-audit-trail-for-agent-tool-call-proposals-and-user-approval-decisions/156247 | Forum | Action Receipt | Open FR Mar 30–Jul 25 2026; not closed as shipped | High that FR exists |
| Cursor Cloud Agents API | https://cursor.com/docs/cloud-agent/api/endpoints | Docs | Action Receipt | SSE `tool_call` with args + result | High |
| Cursor hooks | https://cursor.com/docs/agent/hooks | Docs | Action Receipt | pre/postToolUse; before/after Shell/MCP; partners MintMCP, Oasis, Runlayer, Snyk | High |
| Cursor Run Modes | https://cursor.com/docs/agent/security/run-modes | Docs | Action Receipt | Auto-review / Allowlist / Run Everything; “Auto-review is not a security boundary” | High |
| Cursor Terminal tool | https://cursor.com/docs/agent/tools/terminal | Docs | Action Receipt | Shell; Run Mode gates | High |
| Cursor Admin API audit logs | https://cursor.com/docs/account/teams/admin-api.md | Docs | Action Receipt | `/teams/audit-logs` eventTypes: **no** tool-call types | High |
| Cursor llms.txt | https://cursor.com/docs/llms.txt | Index | Action Receipt | Points at admin-api audit-logs and hooks.md | High |
| Claude Code overview | https://docs.anthropic.com/en/docs/claude-code/overview | Docs | Action Receipt | Agent reads/edits/runs commands | High |
| Claude Code hooks | https://code.claude.com/docs/en/hooks | Docs | Action Receipt | PreToolUse can block; deny `rm -rf` example | High |
| Claude Code data usage | https://code.claude.com/docs/en/data-usage | Docs | Action Receipt | Transcripts plaintext `~/.claude/projects/` | High |
| Claude Code directory | https://code.claude.com/docs/en/claude-directory | Docs | Action Receipt | permissions + hooks locations | High |
| Claude Code OTEL | https://code.claude.com/docs/en/monitoring-usage | Docs | Action Receipt | tool_decision / tool_result; SIEM; full_command gated | High |
| Codex repo | https://github.com/openai/codex | GitHub | Action Receipt | 125,698★ | High |
| Codex execpolicy README | https://raw.githubusercontent.com/openai/codex/main/codex-rs/execpolicy/README.md | Repo | Action Receipt | allow/prompt/forbidden prefix rules | High |
| Codex CLI docs | https://developers.openai.com/codex/cli | Docs | Action Receipt | Nav-heavy; little execution-log detail | Low for logs |
| Codex security URL | https://developers.openai.com/codex/security | Docs | Action Receipt | Redirected/nav; not a useful log spec | Low |
| MCP transports | https://modelcontextprotocol.io/docs/concepts/transports | Spec | Action Receipt | JSON-RPC tools/call over stdio or HTTP | High |
| MCP Python SDK | https://github.com/modelcontextprotocol/python-sdk | GitHub | Action Receipt | 24,352★ | High |
| Pipelock README | https://raw.githubusercontent.com/luckyPipewrench/pipelock/main/README.md | Repo | Action Receipt | Mediator-signed action receipts; playground | High |
| Pipelock GitHub | https://github.com/luckyPipewrench/pipelock | GitHub | Action Receipt | 894★; created 2026-02-08 | High |
| Pipelock Action Receipt spec | https://pipelab.org/learn/action-receipt-spec/ | Spec | Action Receipt | Ed25519; hash chain; signed outside agent | High |
| Agent Receipts homepage | https://agentreceipts.ai/ | Product | Action Receipt | Overnight destructive-call story; daemon outside agent | High |
| Obsigna GitHub | https://github.com/agent-receipts/obsigna | Repo | Action Receipt | Protocol + mcp-proxy + hook + daemon; 20★; updated 2026-09-17 | High |
| Beacon README | https://raw.githubusercontent.com/agent-receipts/beacon/main/README.md | Repo | Action Receipt | Archived; superseded by Obsigna | High |
| Beacon GitHub | https://github.com/agent-receipts/beacon | GitHub | Action Receipt | 1★ archived | High |
| Jongerius blog | https://jongerius.solutions/post/your-ai-agent-just-sent-an-email/ | Blog 2026-04-03 | Action Receipt | Same problem; points at agentreceipts.ai | Medium-High |
| firatmio/mcp-audit-proxy | https://github.com/firatmio/mcp-audit-proxy | GitHub | Action Receipt | 2★; transparent MCP audit | High |
| JohnSilly1/mcp-audit-proxy | https://github.com/JohnSilly1/mcp-audit-proxy | GitHub | Action Receipt | 0★; hash-chained | High |
| agent-warden | https://github.com/yli769227-jpg/agent-warden | GitHub | Action Receipt | 0★; Claude Code MCP proxy | High |
| OpenAI Agents SDK tracing | https://openai.github.io/openai-agents-python/tracing/ | Docs | Action Receipt | Default function_span I/O | High |
| OpenAI Agents API tracing | https://developers.openai.com/api/docs/guides/agents-api/tracing | Docs | Action Receipt | Tool spans: name, args, result, MCP | High |
| LangGraph persistence | https://langchain-ai.github.io/langgraph/concepts/persistence/ | Docs | Action Receipt | Checkpointers persist thread state | High |
| LangGraph interrupts | https://docs.langchain.com/oss/python/langgraph/interrupts | Docs | Action Receipt | HITL interrupt() + resume | High |
| LangGraph GitHub | https://github.com/langchain-ai/langgraph | GitHub | Action Receipt | 42,073★ | High |
| Langfuse agent graphs | https://langfuse.com/docs/observability/features/agent-graphs | Docs | Action Receipt | Tool observations / LangGraph graphs | High |
| Langfuse GitHub | https://github.com/langfuse/langfuse | GitHub | Action Receipt; Canary | **34,892★** (Action Receipt `gh`); **34,891★** (Canary `gh` later same day) | High on both counts |
| Promptfoo GitHub | https://github.com/promptfoo/promptfoo | GitHub | Canary | **25,332★**; updated 2026-09-21; agents + CI/CD in description | High |
| Promptfoo Action | https://github.com/promptfoo/promptfoo-action | GitHub | Canary | 72★ | High |
| Chronicle GitHub | https://github.com/theagentplane/chronicle | GitHub | Canary | 23★; created 2026-06-17; record-and-replay | High |
| TraceGym GitHub | https://github.com/hoomanesteki/tracegym-ai-agent-evaluation | GitHub | Canary | 1★; created 2026-07-25; record/replay/CI slogan | High |
| Promptfoo config guide | https://www.promptfoo.dev/docs/configuration/guide/ | Docs | Canary | YAML tests + assertions; matrix | High |
| Promptfoo expected outputs | https://www.promptfoo.dev/docs/configuration/expected-outputs/ | Docs | Canary | `trajectory:*`, `trace-*`, tool-call, `cost` | High |
| Promptfoo tracing | https://www.promptfoo.dev/docs/tracing/ | Docs | Canary | OTel per test; tool attributes; `trajectory:tool-sequence` | High |
| Promptfoo OpenAI Agents guide | https://www.promptfoo.dev/docs/guides/evaluate-openai-agents-python/ | Docs | Canary | Long-Horizon Tasks; `steps_json`; last updated **21 Sep 2026** | High |
| Promptfoo coding-agents guide | https://www.promptfoo.dev/docs/guides/evaluate-coding-agents/ | Docs | Canary | Claude Agent SDK / Codex; `--repeat 3`; last updated **21 Sep 2026** | High |
| Promptfoo GitHub Action docs | https://www.promptfoo.dev/docs/integrations/github-action/ | Docs | Canary | `promptfoo/promptfoo-action@v1`; before vs after | High |
| Promptfoo CI/CD | https://www.promptfoo.dev/docs/integrations/ci-cd/ | Docs | Canary | `--fail-on-error`; GH/GitLab/Jenkins; JUnit | High |
| Promptfoo caching | https://www.promptfoo.dev/docs/configuration/caching/ | Docs | Canary | Cache replay; `--no-cache`; `--repeat` namespaces | High |
| Promptfoo CLI | https://www.promptfoo.dev/docs/usage/command-line/ | Docs | Canary | `promptfoo eval` flags | High |
| Langfuse sessions | https://langfuse.com/docs/observability/features/sessions | Docs | Canary | Session replay; `sessionId` | High |
| Langfuse datasets | https://langfuse.com/docs/evaluation/experiments/datasets | Docs | Canary | Datasets from production traces | High |
| Langfuse offline eval | https://langfuse.com/docs/evaluation/get-started/offline | Docs | Canary | SDK experiment runner | High |
| Langfuse experiments CI | https://langfuse.com/docs/evaluation/experiments/experiments-ci-cd | Docs | Canary | `RegressionError`; `langfuse/experiment-action` | High |
| Langfuse multi-turn cookbook | https://langfuse.com/guides/cookbook/example_evaluating_multi_turn_conversations | Docs | Canary | Traces → dataset → rerun → scores | High |
| LangSmith trajectory evals | https://docs.langchain.com/langsmith/trajectory-evals | Docs | Canary | `agentevals` strict/unordered/subset/superset | High |
| LangSmith complex agent | https://docs.langchain.com/langsmith/evaluate-complex-agent | Docs | Canary | Trajectory evaluator | High |
| LangSmith backtests | https://docs.langchain.com/langsmith/run-backtests-new-agent | Docs | Canary | Production runs → new agent version compare | High |
| Anthropic April 23 postmortem | https://www.anthropic.com/engineering/april-23-postmortem | Engineering | Canary | Fetched. Published 23 Apr 2026. Three product-layer issues; evals initially did not reproduce; broader evals/soak going forward | High |
| Chronicle arXiv HTML | https://arxiv.org/html/2609.20625 | Paper | Canary | Cut-point replay; live rerun rarely repeats | High |
| Chronicle PyPI | https://pypi.org/project/agent-chronicle/ | Registry | Canary | v0.4.0 same pitch | High |
| HORIZON arXiv HTML | https://arxiv.org/html/2604.11978v1 | Paper | Canary | Long-horizon agent breakdown; benchmark not a SaaS gap (Exa highlights) | Medium |
| Beyond Final Scores arXiv | https://arxiv.org/html/2608.13417v1 | Paper | Canary | Long-horizon R&D eval; final-score mismatch (Exa highlights) | Medium |
| Hamel evals | https://hamel.dev/blog/posts/evals/ | Blog | Canary | Re-fetched. Unit tests + looking; not a “long-session product” claim | High |
| Canary kill experiment | `/tmp/canary_session_kill_experiment.py` | Local | Canary | Scripted agent; reasoning_effort high vs medium | High |
| Canary experiment report | `/tmp/canary_session_experiment/report.json` | Local | Canary | Deterministic 10/10 true; stochastic 7/10 baseline | High |
| oasdiff GitHub | https://github.com/oasdiff/oasdiff | GitHub | Spec Triangle | 1,373★, 107 forks, Apache-2.0, pushed 2026-09-21 | High |
| oasdiff.com homepage | https://www.oasdiff.com/ | Vendor | Spec Triangle | Hosted paste-two-specs; 755 checks; Pro; 14M+ downloads claim | High on product; Medium on logos/downloads |
| oasdiff breaking-changes catalog | https://www.oasdiff.com/docs/breaking-changes | Vendor docs | Spec Triangle | Check IDs exist | High that page exists |
| oasdiff BREAKING-CHANGES.md | https://github.com/oasdiff/oasdiff/blob/main/docs/BREAKING-CHANGES.md | OSS docs | Spec Triangle | `--open` hosted visual; judges contract **not** server behavior | High |
| oasdiff monitor external APIs | https://www.oasdiff.com/docs/monitor-external-apis | Vendor docs | Spec Triangle | “Live spec” = curl OpenAPI file; else “live response monitoring, a different kind of tool” | High |
| oasdiff/sync | https://github.com/oasdiff/sync | OSS | Spec Triangle | Slack notify on **spec file** changes | Medium (snippet; not full Jina) |
| Fern homepage | https://buildwithfern.com/ | Vendor | Spec Triangle | Docs+SDK+CLI from one spec; **© 2026 Fern, a Postman company** | High on positioning |
| Fern schema-drift post | https://buildwithfern.com/post/stopping-schema-drift-coupling-sdks-documentation-claude | Vendor blog | Spec Triangle | Names Spectral, oasdiff, Schemathesis, Pact, Prism | Medium (sells Fern) |
| Fern testing docs | https://buildwithfern.com/learn/sdks/deep-dives/testing | Vendor docs | Spec Triangle | Mock-server tests; real-API integration tests = Enterprise | High |
| Fern CLI general commands | https://buildwithfern.com/learn/cli-api-reference/cli-reference/general-commands | Vendor docs | Spec Triangle | `fern check`; no `fern diff` in this table | High |
| Fern SDK commands | https://buildwithfern.com/learn/cli-api-reference/cli-reference/sdk-commands | Vendor docs | Spec Triangle | `fern generate`, `--preview` | High |
| Speakeasy homepage | https://www.speakeasy.com/ | Vendor | Spec Triangle | AI control plane on homepage 21 Sep 2026 | High |
| Speakeasy SDK breaking changes | https://www.speakeasy.com/docs/sdks/guides/sdk-preview-breaking-changes | Vendor docs | Spec Triangle | Breaking at OpenAPI **and SDK** level (removed methods, signatures) | High |
| Speakeasy openapi diff | https://www.speakeasy.com/docs/sdks/manage/forward-compatibility | Vendor docs | Spec Triangle | `speakeasy openapi diff` (search highlights; full page not Jina’d) | Medium |
| Speakeasy SDK changelogs | https://www.speakeasy.com/docs/sdks/manage/sdk-changelogs | Vendor docs | Spec Triangle | Removed/modified methods flagged in PR (search highlights) | Medium |
| Stainless homepage | https://www.stainless.com/ | Vendor | Spec Triangle | Banner: Stainless is joining Anthropic | High |
| Stainless joining Anthropic | https://www.stainless.com/blog/stainless-is-joining-anthropic/ | Company | Spec Triangle | Dated **2026-05-15**. Winding down hosted generator; new signups unavailable | High |
| Stainless SDKs product | https://www.stainless.com/products/sdks/ | Vendor | Spec Triangle | Pages still describe generation | High that old product copy remains |
| Postman generate collections | https://learning.postman.com/docs/design-apis/specifications/generate-collections/ | Official docs | Spec Triangle | Generate from OAS; alert when collection ≠ spec | High |
| Postman Contract Test Generator | https://www.postman.com/postman/contract-test-generator/overview | Official workspace | Spec Triangle | Generate tests from OAS3; run against `env-server` (search + copies; www.postman.com Jina 403) | Medium–High |
| postman-cs generated-assertions | https://github.com/postman-cs/postman-bootstrap-action/blob/main/docs/generated-assertions.md | GitHub docs | Spec Triangle | Live-response tests: status, content-type, body matches OpenAPI schema | High |
| postman-cs dynamic-contract-tests | https://github.com/postman-cs/postman-bootstrap-action/blob/main/docs/dynamic-contract-tests.md | GitHub docs | Spec Triangle | Drift between generated requests, live responses, and OpenAPI | High |
| Schemathesis homepage | https://schemathesis.io/ | Vendor/OSS | Spec Triangle | Live/schema validation from OpenAPI; CLI, GH Action, Workbench | High on product |
| Schemathesis GitHub | https://github.com/schemathesis/schemathesis | GitHub | Spec Triangle | **3,616★** | High |
| Prism GitHub | https://github.com/stoplightio/prism | GitHub | Spec Triangle | **5,034★**; mocking + validations | High |
| Prism Validation Proxy docs | https://docs.stoplight.io/docs/prism/72d69fb629de0-validation-proxy | Vendor docs | Spec Triangle | **Body failed to render** (JS error). Capability via README + Fern, not this body | Low for body |
| Dredd GitHub | https://github.com/apiaryio/dredd | GitHub | Spec Triangle | **4,223★**; archived **2024-11-08** | High |
| drift/ci | https://www.driftci.com/ | Vendor | Spec Triangle | Diff n8n/Make vs OpenAPI; exit 1 | Medium |
| DEV.to schema drift 2026 | https://dev.to/flarecanary/api-schema-drift-detection-tools-compared-2026-1ib4 | Blog | Spec Triangle | States oasdiff cannot tell if live API matches spec; author discloses competing product | Low–Medium |
| Fern API testing blog | https://buildwithfern.com/post/api-testing-complete-guide-developers | Vendor | Spec Triangle | Mentions `fern diff` in CI — **not confirmed** on fetched CLI reference | Low until CLI confirms |
| arXiv abs 2601.15195 | https://arxiv.org/abs/2601.15195 | Paper | Merge Preflight | MSR 2026 accepted; 33k PRs; five agents | High |
| arXiv HTML 2601.15195v1 | https://arxiv.org/html/2601.15195v1 | Paper | Merge Preflight | n=33,596; merge rates; Cliff’s δ; RQ2 228/142/99 | High |
| GitHub about rulesets | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets | Official docs | Merge Preflight | Rulesets exist; 75/repo; bypass actors | High |
| GitHub available rules | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets | Official docs | Merge Preflight | Required checks; **additional approval for unattributed Copilot PRs (default on)**; file path/size | High |
| GitHub protected branches | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches | Official docs | Merge Preflight | Required reviews, code owners, duplicate job-name warning | High |
| GitHub about code owners | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners | Official docs | Merge Preflight | Request vs require; write access; drafts; empty owner lines | High |
| GitHub Copilot code review | https://docs.github.com/en/copilot/concepts/code-review | Official docs | Merge Preflight | Auto review; agentic capabilities | High |
| GitHub Copilot automatic review | https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/configure-automatic-review | Official docs | Merge Preflight | Copilot approvals can count toward merge requirements | High |
| GitHub merge queue | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue | Official docs | Merge Preflight | Queue + required checks; only merge non-failing | High |
| GitHub troubleshooting required checks | https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks | Official docs | Merge Preflight | Skipped workflows stay Pending and **block merge** | High |
| CodeRabbit Pre-Merge Checks | https://docs.coderabbit.ai/pr-reviews/pre-merge-checks.md | Vendor docs | Merge Preflight | Named Pre-Merge Checks; built-ins; custom NL; warning vs error that blocks | High |
| CodeRabbit llms.txt | https://docs.coderabbit.ai/llms.txt | Vendor index | Merge Preflight | Triage, duplicates, request-changes, finishing-touches tests | High |
| CodeRabbit Triage | https://docs.coderabbit.ai/triage/prioritization.md | Vendor docs | Merge Preflight | Priority vs next-action; CI-blocked ≠ important | High |
| Qodo code review | https://docs.qodo.ai/code-review | Vendor docs | Merge Preflight | Blast radius; requirement gaps; cross-repo conflicts | High |
| Qodo blast radius | https://docs.qodo.ai/code-review/assess-risk-with-blast-radius | Vendor docs | Merge Preflight | Risk assessment; body mostly nav this fetch | High that page exists |
| Qodo rule enforcement | https://docs.qodo.ai/governance/rule-enforcement | Vendor docs | Merge Preflight | Governance / standards | High |
| Qodo llms.txt | https://docs.qodo.ai/llms.txt | Vendor index | Merge Preflight | Code governance, rule miner | High |
| Qodo 1.x overview | https://docs.qodo.ai/v1/qodo-merge | Vendor docs | Merge Preflight | Former “Qodo Merge” | High |
| Qodo Merge blog | https://www.qodo.ai/blog/qodo-merge/ | Vendor | Merge Preflight | Git/IDE/CLI rename | Medium |
| Graphite homepage | https://graphite.dev/ | Vendor | Merge Preflight | Cursor Cloud Agents in Graphite; stacking; smaller PRs | High |
| Graphite docs llms.txt | https://www.graphite.dev/docs/llms.txt | Vendor index | Merge Preflight | AI reviews, merge queue, mergeability status check | High |
| Graphite mergeability check | https://graphite-58cc94ce.mintlify.dev/docs/mergeability-status-check.md | Vendor docs | Merge Preflight | Optional GH status check to prevent mid-stack merges | High |
| Danger JS | https://danger.systems/js/ | OSS | Merge Preflight | CI rules; `fail` blocks; smaller PRs / more testing examples | High |
| OpenReplay CODEOWNERS | https://blog.openreplay.com/automatic-code-reviews-codeowners/ | Blog 2026-08-06 | Merge Preflight | Empty team → merge blocked with no approver | Medium–High |
| github/docs#16897 | https://github.com/github/docs/issues/16897 | GitHub | Merge Preflight | Ambiguity of require all vs any code owner | High |
| ResumeLens overlapping rulesets | https://www.resumelens.org/blog/github/github-codeowners-branch-protection | Blog | Merge Preflight | Classic + ruleset + Code Scanning wait + dismiss-stale | Medium |
| SwitchMyTool Qodo vs Graphite | https://www.switchmytool.com/blog/qodo-vs-graphite-agent | Blog 2026-07-31 | Merge Preflight | Crowding; secondary | Medium |
| Coderbuds AI review comparison | https://coderbuds.com/blog/ai-code-review-tools-comparison-2026 | Blog | Merge Preflight | Crowding; Graphite/Cursor claims not used as financials | Medium |
| Public PR metadata | `gh api repos/{owner}/{repo}/pulls/{n}` + files + statuses + check-runs | GitHub API | Merge Preflight | Table in `05`; 25 PRs with full metadata | High for fetched fields |

### Public PRs fetched for Merge Preflight replay (21 Sep 2026)

Each URL was requested via `gh api`. Do not treat `ci_combined=pending` on old closed PRs as “CI failed.” Full table: `research/validation/05-merge-preflight.md`.

https://github.com/netdata/netdata/pull/20631  
https://github.com/coder/coder/pull/16917  
https://github.com/microsoft/vscode-cpptools/pull/13763  
https://github.com/getsentry/sentry-javascript/pull/16526  
https://github.com/reflex-dev/reflex-web/pull/1479  
https://github.com/firecrawl/firecrawl/pull/1645  
https://github.com/hyperlight-dev/hyperlight/pull/641  
https://github.com/bmad-code-org/BMAD-METHOD/pull/196  
https://github.com/graphistry/pygraphistry/pull/706  
https://github.com/ruvnet/ruv-FANN/pull/59  
https://github.com/emulator-wtf/actions/pull/150  
https://github.com/Inferoute/inferoute-client/pull/14  
https://github.com/Mikedan37/BlazeDB/pull/506  
https://github.com/beelin000/newsbot/pull/25  
https://github.com/cloud26/token-sprint/pull/37  
https://github.com/Sl0ppie/avscms/pull/12  
https://github.com/iging/sauron/pull/1  
https://github.com/Pooryamn/Pooryamn.github.io/pull/1  
https://github.com/Repom4n/botnav/pull/127  
https://github.com/kentcdodds/kody/pull/2412  
https://github.com/tylerreckart/arbiter/pull/366  
https://github.com/B-T-Group/renda-sua/pull/333  
https://github.com/ocean-ds/ocean-ios/pull/710  
https://github.com/Tauave/ONEPASS-FITNESS/pull/4  
https://github.com/Kimpossible7544/GT-Player-Dashboard/pull/96  
https://github.com/dxos/dxos/pull/13283 (open; not in merged/closed split)

---

## Failed / blocked / not used as evidence

| Attempt | URL or method | Outcome |
|---|---|---|
| Exa MCP | `mcporter call exa.web_search_exa` | Free-tier **429** after first successful calls on multiple passes |
| Reddit | agent-reach | Backend **off** — not used |
| Twitter | CLI | **Not installed** — not used |
| Product Hunt | citation checker search | **CAPTCHA** |
| Chrome Web Store | citation checker search | **429** |
| ABA Formal Opinion 512 PDF | guessed ABA path | Page Not Found / membership wall — **wording Unknown** |
| ABA news 2024-07 generative AI | ABA news URL | CAPTCHA / 404 |
| Reuters ABA 512 | reuters.com legalindustry | Jina **403** abuse block |
| Law.com ABA 512 | law.com legaltechnews | **404** |
| CA Bar generative-AI PDF | calbar.ca.gov | Page not found |
| NYC Bar 2024-5 | nycbar.org | **404** |
| Ehrlich FindLaw guess | caselaw.findlaw.com | **404** |
| Google Scholar Ehrlich | scholar.google.com | **403** automated-query block |
| recitelaw.com / recite.co.uk | DNS | Would not resolve |
| Promptfoo CI github-action path | https://www.promptfoo.dev/docs/integrations/ci-github-action/ | **404** (correct path is `/docs/integrations/github-action/`) |
| Promptfoo red-team llm-agents site path | https://www.promptfoo.dev/docs/red-team/llm-agents/ | WebFetch 404; claims taken from in-repo `site/docs/red-team/llm-agents.md` via `gh search code` |
| Chronicle arXiv abs | https://arxiv.org/abs/2609.20625 | WebFetch timeout; HTML version succeeded |
| Postman.com marketing | https://www.postman.com/api-platform/api-testing/ | Jina **403** AbuseAlleviation — **not used** |
| oasdiff later issue search | `gh search` | **403** secondary rate limit |
| Cursor old audit-log paths | `/docs/account/teams/audit-logs`, enterprise/security variants | **404** |
| Koalr CODEOWNERS 4.1× | https://koalr.com/blog/codeowners-enforcement | Exa; **4.1× not treated as fact** |
| HN Algolia CODEOWNERS / branch protection | hn.algolia.com | Almost no hits this pass — negative; do not invent threads |

Also not evidence (explicit in source files): unofficial Anthropic quotes from InfoQ/Implicator/postmortem.io; TraceGym self-reported `10/10` metrics; Promptfoo “used by OpenAI and Anthropic” beyond vendor README; Chronicle production customers; requester paraphrase on Cursor FR 156247 as Cursor legal copy; computer-use screenshot journals (not re-fetched); HumanLayer live Enterprise audit-log schema; star counts for khushidahi/mcp-audit-trail and npm downloads for `@josephgec/mcpaudit` (README via Exa only); `npx oasdiff` (oasdiff is Go/Docker/brew — corrected); invented TAM; invented PRs; `daisy976/test-repo` Codex toys as merge-success evidence; CodeRabbit dollar pricing this pass (prior conflict stands); Cursor↔Graphite acquisition dollar terms; revert analysis (not measured); lawyer interview quotes (none conducted).

---

## GitHub `gh` star counts recorded 21 Sep 2026

| Repo | Stars | Pass |
|---|---:|---|
| promptfoo/promptfoo | 25,332 | Canary |
| langfuse/langfuse | 34,891 / 34,892 | Canary / Action Receipt (same day, two `gh` calls) |
| promptfoo/promptfoo-action | 72 | Canary |
| theagentplane/chronicle | 23 | Canary |
| hoomanesteki/tracegym-ai-agent-evaluation | 1 | Canary |
| humanlayer/humanlayer | 11,592 | Action Receipt |
| humanlayer/12-factor-agents | 26,331 | Action Receipt |
| openai/codex | 125,698 | Action Receipt |
| modelcontextprotocol/python-sdk | 24,352 | Action Receipt |
| luckyPipewrench/pipelock | 894 | Action Receipt |
| agent-receipts/obsigna | 20 | Action Receipt |
| langchain-ai/langgraph | 42,073 | Action Receipt |
| oasdiff/oasdiff | 1,373 | Spec Triangle |
| schemathesis/schemathesis | 3,616 | Spec Triangle |
| stoplightio/prism | 5,034 | Spec Triangle |
| apiaryio/dredd | 4,223 (archived 2024-11-08) | Spec Triangle |
| freelawproject/eyecite | 283 | CiteCheck |

---

## Intentionally not written

`research/validation/08-next-step.md` — only if a candidate survived to BUILD/CONDITIONAL architecture. **None did.**
