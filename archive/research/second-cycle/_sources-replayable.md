# Sources — Area 3 non-live reproduction of long-horizon failures

**Date accessed:** 2026-09-21  
**Used for:** `research/second-cycle/04-replayable-failures.md` only.  
**Rule:** only pages, APIs, `gh` queries, and local files **actually inspected** this pass. Search snippets were discovery until the underlying page was read. Do not treat unfetched pages as read.  
**Reliability:** High = page/API body read this pass. Medium = snippet then partial fetch, or vendor metric. Low = title-only / blocked body. N/A = fetch failed; listed so the failure is auditable.

---

## Tooling

| Source | What happened | Reliability |
|---|---|---|
| `agent-reach doctor --json` | gh present (`warn`, `active_backend: null`); Exa configured; Jina OK; Reddit **off**; Twitter CLI **not installed**; V2EX OK; web = Jina | High |
| GitHub `gh` | `gh search` / `gh repo view` / `gh issue view` / `gh issue list` succeeded for listed items. GraphQL `gh repo view --json` + README API **403** in sandbox for some repos until re-run with permissions; later `gh repo view --json stargazerCount` succeeded for listed star counts | High where a body or JSON is quoted |
| Jina Reader `https://r.jina.ai/URL` | Used for Daytona, E2B snapshots, ReproZip docs/FAQ, Chronicle HTML, Cursor forum, tianpan 404 | High |
| Exa `mcporter call exa.web_search_exa` | First Heisenbug-style query returned hits (DEV.to, AgentRx, TrajDebug, PROTEA). Subsequent calls: **free-tier 429**. Same 429 pattern as validation cycle | Medium for the one success; 429 not used as content |
| Cursor WebSearch | Used for Daytona/Chronicle/tianpan, Playwright/Temporal/ReproZip, E2B, OSWorld. Some calls **errored**. Snippets not treated as read unless a URL was then fetched | Medium |
| HN Algolia | `cannot reproduce agent failure` ≈ empty; `record replay rr CRIU` returned near-empty titles; `reproducibility LLM agent replay` → Pipelex Show HN (122 pts) — off-topic | High that queries ran |
| V2EX public API | hot.json + programmer node; no on-topic agent-repro threads | High as negative |
| `agent-reach check-update` | **v1.5.0, current** | High |

Reddit: **not used** (backend off). Twitter: **not used** (CLI not installed). Xiaohongshu / Bilibili: not required for this English infra/agent failure mode; Bilibili search API was `ok` in doctor and was not queried.

---

## Internal repo files (read, not internet)

`research/00-executive-summary.md`  
`research/11-report-A-to-O.md`  
`research/validation/03-canary-session.md`  
`research/validation/06-cross-candidate-comparison.md`  
`research/validation/07-final-survivor-report.md`  
`research/validation/08-validation-sources.md`  
`AGENTS.md` (workspace rules; not cited as market evidence)

Prior-cycle facts reused with that label: Promptfoo 25,332★ and 21 Sep 2026 docs; Langfuse 34,891★; Anthropic April 23 postmortem fetch; Chronicle arXiv HTML; Cursor JSONL staff thread 157311; Canary 10/10 experiment. Those URLs live in `08-validation-sources.md`. This file does not pretend they were re-fetched unless listed below.

---

## Inspected this pass

| Source | URL | Type | Used for | What it proved | Reliability |
|---|---|---|---|---|---|
| Daytona snapshots-as-search | https://www.daytona.io/dotfiles/snapshots-as-search-states-go-explore-with-daytona | Vendor eng post 18 Sep 2026 | RF-1, RF-4 | Full Jina body. Terminal-Bench: retry 17/25 vs snapshot branch 6/25. `staged-service-repair` SQLite: restart 0/5, git-diff 0/5, full snapshot 4/5. 24/24 restores. Handoff ~190k vs ~90k tokens. Sticky wrong state | High |
| E2B snapshots docs | https://docs.e2b.dev/sandbox/snapshots | Official docs | RF-1, RF-6, RF-8 | FS+memory snapshots; pause vs snapshot; templates vs snapshots; templates faster/more compact; use cases: checkpoint, rollback, fork, cache, share | High |
| E2B auto-resume / pause | https://docs.e2b.dev/sandbox/auto-resume and pause API (WebSearch + SDK page) | Official docs | RF-6 | `keep_memory: false` = filesystem-only cold boot; connections drop on snapshot | Medium–High (SDK page saved to agent-tools; auto-resume via search) |
| Chronicle arXiv HTML | https://arxiv.org/html/2609.20625 | Paper | class kill, RF-1, RF-7 | Related work: rr (O’Callahan 2017), Temporal replay tests, LangGraph checkpoints, failure attribution / judges. Cut-point ≠ world snapshot | High |
| Chronicle GitHub | `gh repo view theagentplane/chronicle` | GitHub | class kill | **23★**, created 2026-06-17, updated 2026-09-20 | High |
| OrcaReplay | `gh repo view Continuum-AI-Corp/OrcaReplay` | GitHub | class kill | **259★**, updated 2026-09-21, “time travel for AI agents” | High |
| `gh search repos "agent record replay"` | GitHub search | Discovery | class kill | Page of slogan clones (OrcaReplay, agent-tape, agentgate, mimic-recording, moviola, ReTrace, backspin, agentvcr, agentlens, clanker03, agentrec, flightrec, agentsnap, mcp-time-travel). Star counts for most clones **not** individually `gh repo view`’d except OrcaReplay, agent-tape (1★), flightrec (0★) | High for names; Medium for unviewed star counts |
| k8s agent-sandbox #949 | https://github.com/kubernetes-sigs/agent-sandbox/issues/949 | Issue | RF-5 | Portable OCI snapshot; ~800 engineers claim; local `docker commit` works; cloud→local blocked; OpenSandbox cited as prior art | High |
| agent-sandbox repo | `gh repo view kubernetes-sigs/agent-sandbox` | GitHub | RF-5 | **3,973★** | High |
| OpenSandbox | `gh repo view opensandbox-group/OpenSandbox` | GitHub | RF-5 | **15,445★** | High |
| aios #2027 | https://github.com/eumemic/aios/issues/2027 | Issue | RF-1, RF-6 | 22h outage; 3.37 GB `docker commit` timeout 67s; bind mounts held real data; host-root recovery | High |
| aios #937 | https://github.com/eumemic/aios/issues/937 | Issue | RF-6 | Poison snapshot crashloop; `UPDATE sessions SET snapshot_ref=NULL`; pairs with #795 | High |
| aios #795 | https://github.com/eumemic/aios/issues/795 | Issue (closed) | also-inspected | Replay engine semantics epoch pin; Temporal-like; not a vacancy | High |
| PraisonAI #3670 | https://github.com/MervinPraison/PraisonAI/issues/3670 | Issue (closed) | RF-8 | No env snapshots today; wants `docker commit` / E2B/Daytona snapshot keyed by definition hash; SDKs already support capture, adapters unused | High |
| ReproZip docs | https://docs.reprozip.org/en/stable/ | Docs | RF-1 | Linux pack; `.rpz`; unpack on Win/Mac via VM | High |
| ReproZip FAQ | https://docs.reprozip.org/en/stable/faq.html | Docs | RF-1 | Remote server cannot be traced; DB packed **after** mutation; distributed untraced | High |
| ReproZip GitHub | `gh repo view VIDA-NYU/reprozip` | GitHub | RF-1 | **362★**, updated 2026-09-01 | High |
| Playwright trace viewer | https://playwright.dev/docs/trace-viewer | Official docs | RF-3 | `trace.zip`; `on-first-retry` / `retain-on-failure`; DOM snapshots; trace.playwright.dev | High (WebSearch + GitHub doc copy in agent-tools) |
| Playwright GitHub | `gh repo view microsoft/playwright` | GitHub | RF-3 | **96,448★** | High |
| Temporal safe deployments | https://docs.temporal.io/develop/safe-deployments | Official docs | class / also-inspected | Replay testing against Event Histories | High via WebSearch quotes |
| Temporal GitHub | `gh repo view temporalio/temporal` | GitHub | class | **23,207★** | High |
| rr | `gh repo view rr-debugger/rr` | GitHub | class | **10,651★** “Record and Replay Framework” | High |
| CRIU | `gh repo view checkpoint-restore/criu` | GitHub | class, RF-6 | **3,998★** | High |
| Testcontainers Java | `gh repo view testcontainers/testcontainers-java` | GitHub | RF-8 | **8,739★** | High |
| Nix | `gh repo view NixOS/nix` | GitHub | RF-8 | **17,755★** | High |
| E2B | `gh repo view e2b-dev/E2B` | GitHub | RF-1, RF-8 | **13,901★** | High |
| Daytona | `gh repo view daytonaio/daytona` | GitHub | RF-1 | **71,741★** | High |
| vcrpy | `gh repo view kevin1024/vcrpy` | GitHub | also-inspected | **3,010★** | High |
| rrweb | `gh repo view rrweb-io/rrweb` | GitHub | RF-3 | **20,194★** | High |
| OSWorld | `gh repo view xlang-ai/OSWorld` | GitHub | RF-3 | **3,152★** NeurIPS 2024 CUA bench | High |
| OSWorld-V2 | `gh repo view xlang-ai/OSWorld-V2` | GitHub | RF-3 | **324★** | High |
| OSWorld-V2 site | https://osworld-v2.xlang.ai/ | Benchmark site | RF-3 | WebSearch: ~1.6h median human, ~318 tool calls claim. Full Jina of this URL **not** completed this pass | Medium |
| OSWorld README (search) | https://github.com/xlang-ai/OSWorld | README via search | RF-3 | Results dir: screenshots, actions, video; `manual_examine.py` | Medium–High |
| Hugging Face OSWorld-Eval-Results | https://huggingface.co/datasets/UI-MOPD/OSWorld-Eval-Results | Dataset card via search | RF-3 | traj.jsonl + recording.mp4 + step_N.png layout | Medium |
| Cursor forum 150214 | https://forum.cursor.com/t/transcripts-no-longer-exported-in-full/150214 | Forum | RF-2 | Export became summaries; omits files, thinking, terminal I/O, git; staff sees it; user asks to DM transcript | High |
| Cursor forum 155837/4 | https://forum.cursor.com/t/exporting-transcript-doesnt-export-agent-commands/155837/4 | Forum + staff | RF-2 | Staff: export is text-only, not tool calls; known issue; no ETA; points at 150214 | High |
| Claude Code issues search | `gh issue list -R anthropics/claude-code --search "cannot reproduce"` | GitHub | negative | Hits were ordinary bugs using the word “reproduced,” not a repro-artifact product request | High as negative |
| Codex issues search | `gh search issues "cannot reproduce" repo:openai/codex` | GitHub | negative | No capsule-shaped thread in the returned set | High as negative |
| `gh search issues "docker commit" agent sandbox snapshot` | GitHub | Discovery | RF-5/6/8 | Surface: OpenSandbox #1917, aios #2027/#937, agent-sandbox #949, PraisonAI #3670, others | High for IDs that were then `gh issue view`’d |
| CRIU-related repos search | `gh search repos "criu checkpoint restore"` | GitHub | also-inspected | Includes `lwhere1314/claude-sdk-criu-handoff` (canary). README **not** read (API 403 then not retried) | Low for that repo’s contents |
| HN Algolia | https://hn.algolia.com/api/v1/search?... | Forum search | negative | No strong “cannot reproduce agent” thread this query | High as negative |
| V2EX | https://www.v2ex.com/api/topics/hot.json and `show.json?node_name=programmer` | Forum | negative | No on-topic hits | High as negative |
| DEV.to irreproducibility essay | https://dev.to/saurav_bhattacharya/you-cant-reproduce-your-agents-bugs-thats-why-you-cant-fix-them-223i | Vendor essay | class kill | Exa/WebSearch body: selling AgentLens + agent-eval; not used as independent pain | Medium (not Jina’d in full) |
| AgentRx | https://github.com/microsoft/AgentRx | GitHub via search | class kill, RF-4 | LLM judge localizes critical step; 10-category taxonomy | Medium (search body, not `gh repo view`) |
| TrajDebug | https://arxiv.org/html/2608.06346 | Paper via search | class kill | Long-horizon error lifecycle; not fetched in full | Low–Medium |
| PROTEA / agentpatterns.ai | https://www.agentpatterns.ai/observability/offline-trajectory-replay-multi-agent-debugging/ | Pattern page via Exa | class kill | Offline DAG replay; not a world capsule | Medium |

Star counts in `04` are from `gh repo view --json stargazerCount` on **21 Sep 2026** unless noted as prior-cycle.

---

## Failed / blocked / not used as evidence

| Attempt | URL or method | Outcome |
|---|---|---|
| Exa after first success | `mcporter call exa.web_search_exa` | Free-tier **429** |
| WebSearch (several) | Cursor WebSearch | Intermittent “An error occurred while searching the web” |
| tianpan.co 2026-05-17 post | https://tianpan.co/blog/2026-05-17-incident-ticket-with-no-repro-steps | WebSearch had a long snippet; **Jina = 404 Page Not Found**. **Not evidence** |
| AmtocSoft blogspot | https://amtocsoft.blogspot.com/2026/04/debugging-ai-agents-in-production.html | Search dumped a file; treated as SEO, **not used** |
| OrcaReplay README via `gh api .../readme` | GitHub | **403** in sandbox; description from `gh repo view` only |
| `lwhere1314/claude-sdk-criu-handoff` README | GitHub | **403**; existence only |
| `gh search repos "ReproZip OR sciunit..."` | GitHub | Empty first query; found via `reprozip` later |
| `gh search repos "e2b snapshot sandbox"` / OpenHands snapshot | GitHub | Empty (name mismatch); E2B found via `e2b-dev/E2B` |
| Claude Code `gh search issues "cannot reproduce" --match title` | GitHub | Empty title match |
| Chronicle arXiv **abs** | https://arxiv.org/abs/2609.20625 | Not fetched this pass; HTML used |
| Anthropic postmortem | https://www.anthropic.com/engineering/april-23-postmortem | **Not re-fetched** this pass; cited as prior-cycle High fetch in `08-validation-sources.md` |
| Product Hunt / Twitter / Reddit | — | Twitter not installed; Reddit off |
| Invented TAM / user interviews | — | None conducted |

---

## Intentionally not written

Any `research/second-cycle/0[1235-9]-*.md`. This pass writes only `04-replayable-failures.md` and this sources file.
