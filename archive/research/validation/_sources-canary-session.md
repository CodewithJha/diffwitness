# Sources — Canary Session kill test

**Date accessed:** 21 September 2026  
**Method:** agent-reach (Jina Reader `r.jina.ai`, `gh`, `mcporter` Exa — Exa free MCP rate-limited after first successful query; Cursor WebFetch/WebSearch used as fallback for remaining URLs).  
**Rule:** pages actually fetched or `gh` JSON. Search snippets are labeled. Do not treat unfetched pages as read.

---

## GitHub CLI (`gh`) — live 21 Sep 2026

| Repo | Stars | Other | Command |
|---|---:|---|---|
| [promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) | **25,332** | homepage https://promptfoo.dev; updated 2026-09-21T12:58:28Z; description includes agents + CI/CD | `gh repo view promptfoo/promptfoo --json …` |
| [langfuse/langfuse](https://github.com/langfuse/langfuse) | **34,891** | homepage https://langfuse.com; updated 2026-09-21T13:17:47Z | `gh repo view langfuse/langfuse --json …` |
| [promptfoo/promptfoo-action](https://github.com/promptfoo/promptfoo-action) | **72** | GitHub Action for evals | `gh repo view promptfoo/promptfoo-action --json …` |
| [theagentplane/chronicle](https://github.com/theagentplane/chronicle) | **23** | created 2026-06-17; updated 2026-09-20; “Record-and-replay for agent decision graphs” | `gh repo view theagentplane/chronicle --json …` |
| [hoomanesteki/tracegym-ai-agent-evaluation](https://github.com/hoomanesteki/tracegym-ai-agent-evaluation) | **1** | created 2026-07-25; record/replay/CI slogan | `gh repo view hoomanesteki/tracegym-ai-agent-evaluation --json …` |

In-repo Promptfoo code hits (not star counts): `gh search code "replay"` and `trajectory:tool-sequence` on `promptfoo/promptfoo` — `src/assertions/trajectory.ts`, `site/docs/tracing.md`, `site/docs/guides/evaluate-coding-agents.md`, `site/docs/red-team/llm-agents.md`, `/api/eval/replay`.

---

## Promptfoo docs (fetched)

| URL | What was verified |
|---|---|
| https://www.promptfoo.dev/docs/configuration/guide/ | YAML tests + assertions; matrix of prompts/providers |
| https://www.promptfoo.dev/docs/configuration/expected-outputs/ | Assertion table including `trajectory:*`, `trace-*`, function/tool-call, `cost`, `llm-rubric` |
| https://www.promptfoo.dev/docs/tracing/ | OTel traces per test case; multi-turn same trace; tool attributes; `trajectory:tool-sequence` |
| https://www.promptfoo.dev/docs/guides/evaluate-openai-agents-python/ | Long-Horizon Tasks; `steps_json`; SQLiteSession; trajectory asserts; last updated **21 Sep 2026** |
| https://www.promptfoo.dev/docs/guides/evaluate-coding-agents/ | Claude Agent SDK / Codex; dozens of steps; cost/path asserts; `--repeat 3`; last updated **21 Sep 2026** |
| https://www.promptfoo.dev/docs/integrations/github-action/ | `promptfoo/promptfoo-action@v1`; before vs after on PR |
| https://www.promptfoo.dev/docs/integrations/ci-cd/ | `--fail-on-error`; GH/GitLab/Jenkins; JUnit; quality gates |
| https://www.promptfoo.dev/docs/configuration/caching/ | Cache replay of evals; `--no-cache`; `--repeat` namespaces |
| https://www.promptfoo.dev/docs/usage/command-line/ | `promptfoo eval` flags; `--tag` for CI |

**404 / not used as evidence:** `https://www.promptfoo.dev/docs/integrations/ci-github-action/` (404). `https://www.promptfoo.dev/docs/red-team/llm-agents/` (WebFetch 404). Trajectory/red-team claims for that path taken from **in-repo** `site/docs/red-team/llm-agents.md` via `gh search code`.

---

## Langfuse docs (fetched)

| URL | What was verified |
|---|---|
| https://langfuse.com/docs/observability/features/sessions | Session replay; `sessionId`; annotate/score sessions |
| https://langfuse.com/docs/evaluation/experiments/datasets | Datasets from production traces; versioned datasets; experiment runs |
| https://langfuse.com/docs/evaluation/get-started/offline | Offline eval walkthrough; SDK experiment runner |
| https://langfuse.com/docs/evaluation/experiments/experiments-ci-cd | `RegressionError`; `langfuse/experiment-action`; comparison view link; dataset_version |
| https://langfuse.com/guides/cookbook/example_evaluating_multi_turn_conversations | Multi-turn N+1: traces → dataset → rerun → scores (search + cookbook; video is secondary) |

Langfuse data-model / best-practices session grouping: cited from search hits pointing at `https://langfuse.com/docs/observability/data-model` and `https://langfuse.com/docs/observability/best-practices` — **full page not independently re-fetched**; sessions page above is the primary fetch.

---

## LangSmith / AgentEvals (fetched)

| URL | What was verified |
|---|---|
| https://docs.langchain.com/langsmith/trajectory-evals | `agentevals` strict/unordered/subset/superset trajectory match; LLM-as-judge trajectory |
| https://docs.langchain.com/langsmith/evaluate-complex-agent | Complex agent eval + trajectory evaluator (WebFetch saved full page) |
| https://docs.langchain.com/langsmith/run-backtests-new-agent | Production runs → dataset → new agent version experiment compare (search + listed; treat as LangSmith official docs) |

Braintrust LangGraph/LangSmith integration pages appeared in search; **not used as primary kill evidence** (not fully fetched as product docs for trajectory canaries).

---

## Anthropic official postmortem (CONFIRMED this pass)

| URL | Status |
|---|---|
| https://www.anthropic.com/engineering/april-23-postmortem | **Fetched.** Published Apr 23, 2026. Three product-layer issues; evals initially did not reproduce; broader evals/soak/prompt audit going forward. |
| https://www.anthropic.com/engineering/april-23-postmortem?pubDate=20260425 | Same article (search duplicate). |

Secondary coverage (not quoted as Anthropic): InfoQ `https://www.infoq.com/news/2026/05/anthropic-claude-code-postmortem/`; Implicator; postmortem.io mirror. Use official engineering page only for quotes.

**Prior research status:** UNCONFIRMED / not found. **This pass:** official page exists and was read.

---

## Academic / OSS record-replay

| Source | Accessed how | Use |
|---|---|---|
| arXiv:2609.20625 Chronicle | Exa search (full abstract) + WebFetch HTML `https://arxiv.org/html/2609.20625` + abs page timeout | Cut-point replay; live rerun rarely repeats; cites eval frameworks including promptfoo; GitHub theagentplane/chronicle |
| https://github.com/theagentplane/chronicle | `gh` + WebFetch README | 23★; record envelopes; cut-point replay; CI regression tests |
| https://pypi.org/project/agent-chronicle/ | WebFetch | v0.4.0 same pitch |
| HORIZON arXiv HTML 2604.11978v1 | Exa highlights | Long-horizon agent breakdown; benchmark not a SaaS gap |
| Beyond Final Scores arXiv HTML 2608.13417v1 | Exa highlights | Long-horizon R&D eval; final-score mismatch |
| TraceGym README via Exa | Search highlights + `gh` stars | 1★ record/replay/CI; slogan overlap only |

---

## Practitioner (already in repo research; re-fetched)

| URL | Note |
|---|---|
| https://hamel.dev/blog/posts/evals/ | Re-fetched. Unit tests + looking; not a “long-session product” claim. |
| https://hamel.dev/blog/posts/evals-faq/ | Prior research; not re-fetched this pass. Do not add new FAQ quotes. |

---

## Isolated experiment (this pass)

| Path | What |
|---|---|
| `/tmp/canary_session_kill_experiment.py` | Scripted agent; `reasoning_effort` high vs medium; golden tool sequence + token band |
| `/tmp/canary_session_experiment/report.json` | Deterministic 10/10 regression **true**; 15% stochastic baseline 7/10 pass → 10/10 regression **false** |

Not in repo `src/`. No product architecture. No npm.

---

## Workspace research (read, not re-fetched)

`research/00-executive-summary.md`, `11-report-A-to-O.md`, `01-hackathon-intelligence.md`, `04-competitive-analysis.md`, `05-problem-opportunities.md` (Problem #1), `06-product-concepts.md` (Product #1 Canary Session), `07-shortlist.md`, `08-competitive-destruction.md`, `09-technical-feasibility.md`, `10-final-recommendation.md`.

Prior star counts (Promptfoo 25,332; Langfuse 34,889) were from 21 Sep 2026 earlier the same day. This pass: Promptfoo **unchanged 25,332**; Langfuse **34,891**.

---

## Failed / unused fetches

- Exa MCP: first two Promptfoo/Langfuse queries hit **free rate limit**; third query (long-horizon papers) succeeded.
- Reddit / Twitter: doctor `off` / CLI missing; not used.
- Promptfoo CI github-action path 404 (correct path is `/docs/integrations/github-action/`).
- arXiv abs `https://arxiv.org/abs/2609.20625` WebFetch timeout; HTML version succeeded.

---

## Intentionally not evidence

Random “AI feels worse” social posts; unofficial Anthropic quotes from blogs; TraceGym README metrics (`10/10`, `$0`) as independent science (1★ demo, vendor self-report); Promptfoo “used by OpenAI and Anthropic” beyond being a **vendor README claim**; Chronicle production customers (Unknown).
