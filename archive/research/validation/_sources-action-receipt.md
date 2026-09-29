# Sources inspected — Action Receipt validation

**Date accessed:** 21 September 2026  
**Rule:** only pages/APIs actually fetched or `gh`-queried this pass. Search snippets were discovery until the underlying page was read.  
**Agent Reach:** `agent-reach doctor --json` first. Used **Exa via mcporter** (then 429), **GitHub `gh`**, **Jina Reader** (`curl https://r.jina.ai/…`). Web backend OK. Reddit off. Twitter CLI not installed. LinkedIn MCP unverified. `agent-reach check-update`: v1.5.0, current.

Repo files read (not internet): `research/00-executive-summary.md`, `11-report-A-to-O.md`, `01-hackathon-intelligence.md`, `04-competitive-analysis.md`, `05-problem-opportunities.md` (Problem #5), `06-product-concepts.md` (Product #5), `07-shortlist.md`, `08-competitive-destruction.md`, `09-technical-feasibility.md`, `10-final-recommendation.md`, `sources.md`.

---

| Source | URL | Type | What it showed (this pass) | Reliability |
|---|---|---|---|---|
| Agent Reach doctor | local CLI `--json` | Tooling | gh present unverified-live; Exa configured; Jina OK; Reddit/Twitter off | High |
| Exa search: Cursor tool transcripts | `mcporter call exa.web_search_exa` | Search | Hit Cursor forum 157311, 150214, 155837, 166592, 156247; Cloud Agents API tool_call SSE | Medium until page fetch |
| Exa: MCP audit | same | Search | mcp-audit-trail, mcpaudit, mcp-audit, mcp-audit-proxy READMEs | Medium until GitHub |
| Exa: OpenAI Agents tracing | same | Search | Agents API tracing dashboard; Agents SDK function_span | Medium until page fetch |
| Exa: HumanLayer / Claude Code / Codex | same | Search | **429** after first few calls | N/A — failed |
| HumanLayer homepage | https://humanlayer.dev/ | Company | Multiplayer coding agent IDE; Pro $100/user/mo; Enterprise Audit Logs; BYOK Claude Code/Codex | High |
| HumanLayer GitHub | `gh api repos/humanlayer/humanlayer` | GitHub | 11,592★; updated 2026-09-21; homepage https://humanlayer.dev/code | High |
| HumanLayer README (Jina) | https://github.com/humanlayer/humanlayer | GitHub | Coding-agent product tree (hld, hlyr, WUI); conversation events include tool_use | High on repo existence |
| HumanLayer require-approval docs | https://www.humanlayer.dev/docs/core/require-approval | Docs | **404** | High that URL is dead |
| HumanLayer docs root | https://humanlayer.dev/docs | Docs | Jina **429** | Unknown |
| HumanLayer PyPI | https://pypi.org/pypi/humanlayer/json | Registry | v0.7.9; `@hl.require_approval()`; HITL SDK copy still live | High |
| 12-factor-agents | `gh api repos/humanlayer/12-factor-agents` | GitHub | 26,331★ | High |
| HumanLayer Launch HN | https://news.ycombinator.com/item?id=42247368 | Forum | Prior research: 354 points; not re-quoted this pass | High on existence (from `sources.md`) |
| Cursor forum: full transcript | https://forum.cursor.com/t/accessing-the-full-agent-transcript-in-cursor/157311 | Forum + staff | JSONL = messages + assistant text + **tool inputs only**; no outputs; use `postToolUse` | High (staff Colin) |
| Cursor forum: export regression | https://forum.cursor.com/t/transcripts-no-longer-exported-in-full/150214 | Forum + staff | Export omits collapsed terminal I/O; tracked as FR not bug | High |
| Cursor forum: export commands | https://forum.cursor.com/t/exporting-transcript-doesnt-export-agent-commands/155837/4 | Forum + staff | Same: export is text-only | High |
| Cursor forum: richer transcripts | https://forum.cursor.com/t/richer-agent-transcripts-lifecycle-data-for-observability-langfuse-stop-hooks/166592 | Forum | JSONL thinner than Claude Code; no tool_result; SDK `index.db` has run_events | High on user report + staff gaps |
| Cursor forum: platform audit FR | https://forum.cursor.com/t/platform-level-audit-trail-for-agent-tool-call-proposals-and-user-approval-decisions/156247 | Forum | Open FR Mar 30–Jul 25 2026; propose/decide/complete records; no staff “already shipped” | High that FR exists; requester quote of Enterprise copy is **second-hand** |
| Cursor Cloud Agents API | https://cursor.com/docs/cloud-agent/api/endpoints | Docs | SSE `tool_call` with args + result | High |
| Cursor hooks | https://cursor.com/docs/agent/hooks | Docs | pre/postToolUse; before/afterShellExecution; before/afterMCPExecution; partners MintMCP, Oasis, Runlayer, Snyk | High |
| Cursor Run Modes | https://cursor.com/docs/agent/security/run-modes | Docs | Auto-review / Allowlist / Run Everything; sandbox; “Auto-review is not a security boundary” | High |
| Cursor Terminal tool | https://cursor.com/docs/agent/tools/terminal | Docs | Shell in terminal; Run Mode gates | High |
| Cursor Admin API audit logs | https://cursor.com/docs/account/teams/admin-api.md | Docs | `/teams/audit-logs` eventTypes: login, mcp_server_config, team_hook, … **no tool-call types** | High |
| Cursor audit-logs old paths | `/docs/account/teams/audit-logs`, `/docs/account/enterprise/audit-logs`, `/docs/security/audit-logs` | Docs | **404** | High that those URLs 404 |
| Cursor llms.txt | https://cursor.com/docs/llms.txt | Index | Points at admin-api#get-audit-logs and hooks.md | High |
| Claude Code overview | https://docs.anthropic.com/en/docs/claude-code/overview | Docs | Agent reads/edits/runs commands | High |
| Claude Code hooks | https://code.claude.com/docs/en/hooks | Docs | PreToolUse can block; example deny `rm -rf`; PermissionRequest/Denied; PostToolUse | High |
| Claude Code data usage | https://code.claude.com/docs/en/data-usage | Docs | Transcripts plaintext `~/.claude/projects/` | High |
| Claude Code directory | https://code.claude.com/docs/en/claude-directory | Docs | permissions + hooks locations | High |
| Claude Code monitoring/OTEL | https://code.claude.com/docs/en/monitoring-usage | Docs | tool spans + permission wait + execution; tool_decision / tool_result; SIEM; full_command gated | High |
| Codex repo | `gh api repos/openai/codex` | GitHub | 125,698★ | High |
| Codex execpolicy README | https://raw.githubusercontent.com/openai/codex/main/codex-rs/execpolicy/README.md | Repo | allow/prompt/forbidden prefix rules; preview CLI | High |
| Codex CLI docs | https://developers.openai.com/codex/cli | Docs | Nav-heavy; little execution-log detail on this fetch | Low for logs |
| Codex security URL | https://developers.openai.com/codex/security | Docs | Redirected/nav; **not** a useful security-log spec this pass | Low |
| MCP transports | https://modelcontextprotocol.io/docs/concepts/transports | Spec | JSON-RPC tools/call over stdio or HTTP | High |
| MCP Python SDK | `gh api repos/modelcontextprotocol/python-sdk` | GitHub | 24,352★ | High |
| Pipelock README | https://raw.githubusercontent.com/luckyPipewrench/pipelock/main/README.md | Repo | Mediator-signed action receipts; Cursor/Claude Code/Codex/LangGraph; playground | High |
| Pipelock GitHub API | `gh api repos/luckyPipewrench/pipelock` | GitHub | 894★; created 2026-02-08; desc names action receipts | High |
| Pipelock Action Receipt spec | https://pipelab.org/learn/action-receipt-spec/ | Spec | Ed25519 envelope; hash chain; signed outside agent; MCP transports | High |
| Agent Receipts homepage | https://agentreceipts.ai/ | Product | Overnight production data deleted; log “maintenance task completed”; daemon outside agent | High |
| Obsigna GitHub | https://github.com/agent-receipts/obsigna | Repo | Protocol + mcp-proxy + hook + daemon; Claude Code snippet; Codex setup link | High |
| Obsigna API | `gh api repos/agent-receipts/obsigna` | GitHub | 20★; updated 2026-09-17 | High |
| agent-receipts org repos | `gh api orgs/agent-receipts/repos` | GitHub | obsigna, dashboard, openclaw; beacon/attest **archived** | High |
| Beacon README | https://raw.githubusercontent.com/agent-receipts/beacon/main/README.md | Repo | Archived; MCP proxy; intent-to-action; superseded by Obsigna | High |
| Beacon API | `gh api repos/agent-receipts/beacon` | GitHub | 1★ archived | High |
| Jongerius blog | https://jongerius.solutions/post/your-ai-agent-just-sent-an-email/ | Blog 2026-04-03 | Same problem statement; “a receipt”; points at agentreceipts.ai | Medium-High (author of the protocol) |
| mcp-audit-proxy | `gh api repos/firatmio/mcp-audit-proxy` | GitHub | 2★; transparent MCP audit | High |
| JohnSilly1/mcp-audit-proxy | `gh api` | GitHub | 0★; hash-chained | High |
| agent-warden | `gh api repos/yli769227-jpg/agent-warden` | GitHub | 0★; Claude Code MCP proxy | High |
| gh search repos mcp audit proxy | `gh search repos` | GitHub | Listed the above plus others | High on listing |
| OpenAI Agents SDK tracing | https://openai.github.io/openai-agents-python/tracing/ | Docs | Default function_span I/O; traces dashboard | High |
| OpenAI Agents API tracing | https://developers.openai.com/api/docs/guides/agents-api/tracing | Docs | Tool spans: name, args, result, MCP | High |
| LangGraph persistence | https://langchain-ai.github.io/langgraph/concepts/persistence/ | Docs | Checkpointers persist thread state | High |
| LangGraph interrupts | https://docs.langchain.com/oss/python/langgraph/interrupts | Docs | HITL interrupt() + resume Command | High |
| LangGraph stars | `gh api repos/langchain-ai/langgraph` | GitHub | 42,073★ | High |
| Langfuse agent graphs | https://langfuse.com/docs/observability/features/agent-graphs | Docs | Tool observations / LangGraph graphs | High |
| Langfuse stars | `gh api repos/langfuse/langfuse` | GitHub | 34,892★ | High |
| Local Cursor agent-transcripts dir | `~/.cursor/projects/.../agent-transcripts` | Filesystem | Directory exists; **0 jsonl** in that slug this session — no local schema dump | High on empty |

---

## Intentionally not used as evidence

- Exa snippets after the 429 without a follow-up fetch (except as discovery pointers that were later opened).
- Requester’s paraphrase “We do not log agent responses or generated code content” on Cursor FR 156247 — treated as **user-quoted**, not verified on a current Cursor legal/security page (audit-log doc URLs 404’d; Admin API enum was used instead).
- Computer-use screenshot journals (OpenAI CUA / Anthropic computer use) — not re-fetched this pass.
- HumanLayer live Enterprise audit-log schema — marketing bullet only.
- Twitter/Reddit/HN body of HumanLayer launch — not re-fetched; Launch HN points from prior `sources.md`.
- Star counts for khushidahi/mcp-audit-trail and npm downloads for mcpaudit — README via Exa only.

## Agent Reach note

Doctor 21 Sep 2026: Jina/web OK; `gh` executable; Exa configured then **rate-limited**; Reddit **off**; Twitter CLI **not installed**. Used Jina, `gh`, Exa-until-429. `check-update`: v1.5.0 current.
