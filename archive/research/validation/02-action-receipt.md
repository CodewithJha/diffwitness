# Adversarial validation — Action Receipt

**Date:** 21 September 2026  
**Candidate:** Action Receipt only. No defense. No new ideas. No product code.  
**Method:** Repo research files + live docs/GitHub/UX-description inspection via Agent Reach (Exa; GitHub `gh`; Jina Reader). Reddit/Twitter backends were off. Exa hit a free-tier 429 mid-pass; remaining pages were fetched with Jina/`gh`.  
**FACT vs INFERENCE labeled.** Unknown stays Unknown.

---

## Thesis (to attack)

AI agents can claim they completed an action while execution tells a different story. Action Receipt records actual tool calls independently from the agent's narrative.

Claimed mechanism: Agent → tool call → receipt layer → execution evidence → approval gate.

Constraint from the brief: differentiation **cannot** merely be “we log tool calls.”

Repo version (`research/06-product-concepts.md` #5): “Independent, agent-unwritable log + approval gate for destructive tools; compare receipt vs the agent’s story.” Hackathon scope: “One mock agent + mock DB; hosted log viewer.” Post-hackathon: “Real MCP.”

---

## Kill test A — Existing infrastructure

**Result: KILL.** Execution logs, approval gates, and (separately) signed “action receipts” already exist. The remaining Cursor *enterprise* gap is a vendor feature request, not whitespace for a 3-week solo.

### HumanLayer

**FACT — company site (fetched 21 Sep 2026):** [humanlayer.dev](https://humanlayer.dev/) is no longer marketed as a generic HITL API. It is “The Multiplayer Coding Agent Workspace”: sessions, plan artifacts, diffs, BYOK for Claude Code/Codex/Copilot. Pricing: Starter free (≤3 seats, 200 sessions/mo); Pro **$100/user/mo**; Enterprise includes **SSO/SAML** and **Audit Logs**.

**FACT — GitHub:** [humanlayer/humanlayer](https://github.com/humanlayer/humanlayer) **11,592★**, updated 21 Sep 2026. Description: coding agents in complex codebases. Sister repo [humanlayer/12-factor-agents](https://github.com/humanlayer/12-factor-agents) **26,331★**.

**FACT — PyPI:** package `humanlayer` **0.7.9** still describes the original SDK: “API and SDK that enables AI Agents to contact humans for help, feedback, and approvals,” with `@hl.require_approval()` wrapping tools such as `send_email`. Homepage links on PyPI still point at `humanlayer.dev/docs/quickstart-python`. Live `humanlayer.dev/docs/core/require-approval` **404** on this fetch. So: the *approval-wrapper* product still exists as a published SDK; the *company* has pivoted the homepage to an agent IDE with enterprise audit logs.

**INFERENCE (labeled):** HumanLayer occupies both “require a human before the side effect” and “team control plane around coding agents.” It does **not** have to be the signed-receipt protocol to kill a HITL-shaped OFFGRID demo — it is the named incumbent the prior reports already feared (Launch HN item 42247368, 354 points).

### Cursor — what actually gets logged (docs + staff UX, not marketing)

| Surface | What it records | Independent of model text? | Queryable / exportable? |
|---|---|---|---|
| In-session UI | Collapsible terminal command **input/output**; approval prompts for shell, MCP, file edits | Yes — the host renders the tool block separately from assistant prose | Visible in the chat. **Export Transcript intentionally omits** collapsed tool I/O (staff, forum) |
| On-disk JSONL `~/.cursor/projects/.../agent-transcripts/` | User messages, assistant text, **tool call inputs (name + arguments)** | Yes vs the narrator | **Intentionally no tool outputs** (staff: too large). `postToolUse` hook is the documented way to capture outputs |
| SDK store `sdk-agent-store/.../index.db` | `runs` / `run_events`; tool calls collapsible by `call_id`; results (stdout, file, diffs) | Host/SDK, not the model | Local DB; community replay tools merge this onto JSONL |
| Cloud Agents API SSE | `tool_call` events: `{ callId, name, status, args?, result?, truncated? }` for `read_file`, `run_terminal_cmd`, `mcp` | Host stream, not the model | Public API: [cursor.com/docs/cloud-agent/api/endpoints](https://cursor.com/docs/cloud-agent/api/endpoints) |
| Hooks | `preToolUse` / `postToolUse` / `postToolUseFailure`; `beforeShellExecution` / `afterShellExecution`; `beforeMCPExecution` / `afterMCPExecution`; exit 2 **blocks** | Host hook process | You write the log. Official docs: [cursor.com/docs/agent/hooks](https://cursor.com/docs/agent/hooks). Partners: MintMCP, Oasis Security, Runlayer, Snyk Evo Agent Guard |
| Run Modes | Auto-review / Allowlist / Run Everything; sandbox; classifier; approval UI | Policy is host-side | [cursor.com/docs/agent/security/run-modes](https://cursor.com/docs/agent/security/run-modes). Docs warn: **“Auto-review is not a security boundary.”** |
| Enterprise `/teams/audit-logs` | `login`, `logout`, `add_user`, `mcp_server_config`, `team_hook`, `privacy_mode`, … | Admin events | **No event type for agent tool calls, shell commands, file edits, or approval decisions.** Official list: [cursor.com/docs/account/teams/admin-api](https://cursor.com/docs/account/teams/admin-api.md) |

**FACT — staff, Cursor forum, 13 Apr 2026:** JSONL “include your messages, the assistant’s text responses, and tool call inputs (tool name + arguments). They **intentionally do not include tool call outputs**.” Capture outputs with a `postToolUse` hook. [forum.cursor.com/t/157311](https://forum.cursor.com/t/accessing-the-full-agent-transcript-in-cursor/157311/5)

**FACT — staff, Export Transcript:** “Transcript export currently doesn’t include agent tool calls like terminal commands and file edits, it only exports the text parts.” Collapsed tool I/O is a **feature request**, not a regression they will treat as a bug. [forum.cursor.com/t/150214](https://forum.cursor.com/t/transcripts-no-longer-exported-in-full/150214), [forum.cursor.com/t/155837](https://forum.cursor.com/t/exporting-transcript-doesnt-export-agent-commands/155837/4)

**FACT — open FR, 30 Mar 2026, still unanswered as a ship as of last reply 25 Jul 2026:** “Platform-level audit trail for agent tool call proposals and user approval decisions.” Quote from the requester: Enterprise audit log “explicitly excludes agent actions.” Proposed records match Action Receipt’s lifecycle (propose / decide / complete). **Cursor staff did not close this as “already shipped.”** [forum.cursor.com/t/156247](https://forum.cursor.com/t/platform-level-audit-trail-for-agent-tool-call-proposals-and-user-approval-decisions/156247)

**Kill reading of the Cursor gap:** there *is* a missing **SIEM-shaped, queryable approval trail** in Cursor’s team audit API. That is exactly the kind of hole **Cursor, MintMCP, Runlayer, Oasis, Snyk, Pipelock, and Obsigna** are already pointing at. It is not an original OFFGRID wedge. Hooks already let a competent engineer log `beforeShellExecution` without a new product.

### Claude Code

**FACT — hooks (official):** `PreToolUse` (can **block**), `PermissionRequest`, `PermissionDenied`, `PostToolUse`, `PostToolUseFailure`. Documented example: deny `rm -rf` from a `PreToolUse` Bash matcher. Cloud sessions included. [code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)

**FACT — local transcripts:** “Claude Code clients store session transcripts locally in plaintext under `~/.claude/projects/`.” [code.claude.com/docs/en/data-usage](https://code.claude.com/docs/en/data-usage)

**FACT — OpenTelemetry (org-grade execution log):** Claude Code exports metrics, **events**, and optional traces. Tool spans include a child span for **permission wait** and a child span for **execution**. Events include `tool_decision` and `tool_result`, joinable on `tool_use_id`. With `OTEL_LOG_TOOL_DETAILS=1`, Bash `full_command` is an attribute. With `OTEL_LOG_TOOL_CONTENT=1`, Bash combined stdout/stderr can be a `tool.output` span event. Docs include a **SIEM** export example. [code.claude.com/docs/en/monitoring-usage](https://code.claude.com/docs/en/monitoring-usage)

That is a trustworthy-vs-narrator log **shipped by Anthropic**, independent of assistant prose (`assistant_response` is a separate gated event).

### Codex

**FACT:** [openai/codex](https://github.com/openai/codex) **125,698★**. `codex-execpolicy` is an in-tree policy engine: Starlark `prefix_rule(..., decision = "allow" | "prompt" | "forbidden")`, CLI `codex execpolicy check`. Preview, API may break. [raw README](https://raw.githubusercontent.com/openai/codex/main/codex-rs/execpolicy/README.md)

**Unknown this pass:** whether Codex session JSONL includes tool outputs as completely as Claude Code OTEL. Not required to kill: execpolicy + 125k★ CLI already owns “approval/forbid before exec” for this runtime.

### MCP (the protocol, not a product)

**FACT:** MCP is JSON-RPC `tools/call` with arguments and results. A stdio or HTTP intermediary sees every call. Official transport docs: [modelcontextprotocol.io/docs/concepts/transports](https://modelcontextprotocol.io/docs/concepts/transports). Official Python SDK **24,352★**.

**FACT — the “MCP proxy / audit log” category is already a junkyard of the same idea:**

| Repo | Stars (21 Sep 2026) | What it is |
|---|---:|---|
| [luckyPipewrench/pipelock](https://github.com/luckyPipewrench/pipelock) | **894** | Agent firewall; **mediator-signed action receipts**; MCP stdio/HTTP; works with Cursor, Claude Code, Codex, LangGraph, OpenAI Agents SDK; [live playground](https://pipelab.org/playground); [Action Receipt spec](https://pipelab.org/learn/action-receipt-spec/) |
| [agent-receipts/obsigna](https://github.com/agent-receipts/obsigna) | **20** | Protocol + MCP proxy + **Claude Code PostToolUse hook** + out-of-process signing **daemon**. Site: [agentreceipts.ai](https://agentreceipts.ai/) |
| [firatmio/mcp-audit-proxy](https://github.com/firatmio/mcp-audit-proxy) | 2 | “Wireshark + auditd, but for MCP.” JSONL of every `tools/call` |
| [JohnSilly1/mcp-audit-proxy](https://github.com/JohnSilly1/mcp-audit-proxy) | 0 | Tamper-evident MCP audit proxy, hash-chained logs, policy |
| [yli769227-jpg/agent-warden](https://github.com/yli769227-jpg/agent-warden) | 0 | MCP audit proxy **between Claude Code and any MCP server**, kill switch |
| [khushidahi/mcp-audit-trail](https://github.com/khushidahi/mcp-audit-trail) | (Exa README; stars not re-queried) | Transparent stdio proxy, HTML report of what the agent actually called |
| [@josephgec/mcpaudit](https://www.npmjs.com/package/@josephgec/mcpaudit) | npm | “Tamper-evident record of what your agents actually did”; SHA-256 chain |
| [agent-receipts/beacon](https://github.com/agent-receipts/beacon) | 1, **archived** | Intent-to-action MCP proxy; superseded by Obsigna |

Cursor’s own hooks docs list **MintMCP, Oasis Security, Runlayer** as MCP governance partners.

### OpenAI Agents SDK + Agents API

**FACT:** Built-in tracing is **on by default**. Each function tool call is a `function_span()` storing **inputs and outputs**. Dashboard: [platform.openai.com/traces](https://platform.openai.com/traces). Docs: [openai.github.io/openai-agents-python/tracing](https://openai.github.io/openai-agents-python/tracing/). Agents API tracing dashboard shows tool name, arguments, result, MCP `server_label`. [developers.openai.com/api/docs/guides/agents-api/tracing](https://developers.openai.com/api/docs/guides/agents-api/tracing)

These spans are **SDK-authored**, not model-authored. They live in the same process as the runner (see kill test C).

### LangGraph / Langfuse

**FACT:** LangGraph **42,073★**. Checkpointers persist graph state (including tool results) for HITL `interrupt()` approval workflows. [docs.langchain.com/oss/python/langgraph/interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts), [langchain-ai.github.io/langgraph/concepts/persistence](https://langchain-ai.github.io/langgraph/concepts/persistence/)

**FACT:** Langfuse **34,892★**. Agent graphs + tool observations; native LangGraph integration. This is *observability of what the framework recorded*, not a new trust boundary.

### Computer-use systems

**Not re-fetched end-to-end this pass.** Prior repo research already killed generic computer-use (Adept → Amazon, 28 Jun 2024). OpenAI/Anthropic computer-use products log screenshots/actions inside *their* harness. INFERENCE: they do not leave a 3-week “receipt vs story” demo as the category owner. Do not overclaim screenshot-log schemas without a fresh page.

**A conclusion:** “We log tool calls” is the default of every serious agent runtime in 2026. The *named* Action Receipt primitive is already specified and implemented (Pipelock; Agent Receipts/Obsigna).

---

## Kill test B — Can an agent say “I deleted the production database” while a trustworthy log says “No DELETE occurred”?

**Result: KILL** for the thesis as stated. The mismatch is already detectable wherever the **host** records tool calls separately from assistant text. Where a SIEM-grade signed receipt is the bar, **two products already use that exact phrase and scenario.**

### What “trustworthy” can mean (do not flatten)

1. **Independent of the model’s prose.** Already true in Cursor JSONL (`tool_use` inputs vs assistant text), Cursor Cloud `tool_call` SSE, Claude Code transcripts + OTEL `tool_result`/`tool_decision`, OpenAI Agents SDK `function_span`, MCP JSON-RPC at a proxy.
2. **Independent of the agent host process.** Only true if the log is written on the **execution path outside** the agent (MCP proxy, Pipelock mediator, Obsigna daemon, OS auditd, the database’s own WAL). Mock-agent-in-one-Node-process **fails this by construction**.
3. **Queryable enterprise audit.** Cursor team audit-logs API: **does not include tool calls** (event-type enum inspected). Claude Code OTEL: **does**, including permission source (`config` / `hook` / `user_permanent` / `user_temporary` / `user_abort` / `user_reject`).

### Direct answer to the key question

- **If the agent never issued a DELETE tool call** and only *said* it did: Claude Code OTEL `tool_result` / Cursor JSONL tool inputs / MCP proxy JSONL will not contain a DELETE. Assistant text can still lie. **This comparison is the default architecture of tool-using LLMs** (tool_use blocks vs message blocks). You do not need a new product.
- **If the agent issued DELETE and the host executed it:** a host log that says “No DELETE occurred” would be **false**. APM-green + successful DELETE is a *different* failure (the command worked). HumanLayer/sandboxes/plan mode are the existing answers. Pipelock receipts record mediator **verdict** (`allow`/`block`/`ask`) on the mediated slice — they still cannot see a DELETE that went around the proxy.
- **If you want a signed, hash-chained receipt the agent cannot rewrite:** that product’s homepage copy is already [agentreceipts.ai](https://agentreceipts.ai/) (overnight production data gone; log says “maintenance task completed”) and [pipelab.org/learn/action-receipt-spec](https://pipelab.org/learn/action-receipt-spec/).

**B does not survive** as an OFFGRID original. The only Cursor-shaped hole is “enterprise audit log omits agent actions,” which is an open FR on Cursor’s own forum and a listed partner category (MintMCP / Oasis / Runlayer).

---

## Kill test C — Independent observer

**Result: KILL** of both the demo architecture and the claimed trust story.

### Distinction that is real

| Log | Who writes it | What it proves | What it does not prove |
|---|---|---|---|
| Assistant narrative | The model | What the model *said* | Anything about the world |
| Host `tool_use` / JSON-RPC / OTEL span | The agent **runtime** | What the runtime was asked to run (and, if outputs are stored, what the tool returned to the runtime) | That a side door (raw shell, another MCP, stolen creds) did not also fire |
| Mediator receipt (Pipelock / Obsigna daemon) | A **separate process** on the mediated path | What crossed *that* boundary, signed with a key the agent is not supposed to hold | Anything that bypassed the wrapper. Pipelock states this limit in the evidence viewer. Obsigna trust-model page: in-process keys are forgeable by anyone with code execution in the agent |

**FACT — Obsigna README:** “anyone with code execution in the agent can forge receipts. To defend against a compromised agent, use the daemon-mediated path.” [github.com/agent-receipts/obsigna](https://github.com/agent-receipts/obsigna)

**FACT — Pipelock spec:** receipts are “signed from outside the agent trust boundary. … verification of the mediated slice does not depend on the agent transcript.” [pipelab.org/learn/action-receipt-spec](https://pipelab.org/learn/action-receipt-spec/)

**FACT — hackathon plan (`06`, `09`):** mock agent + append-only log in the same app. That log is **not** an independent observer. It is a second `console.log` from the same untrusted process. Hash-chaining it does not help: the process that appends can append a lying chain.

**C kills the demo’s mechanism.** A judge who understands trust boundaries will say the receipt is theater. A judge who does not will still have seen Pipelock’s “signed outside the agent” one-liner, which is the *actual* independent-observer design.

---

## Kill test D — Mock-agent problem

**Result: KILL.** Real instrumentation is **small** for the surfaces that matter; the mock is therefore both fake *and* unnecessary; wrapping those surfaces without being a clone is **not** available.

### What is actually easy (public docs, not built here)

1. **Claude Code:** one `PostToolUse` hook. Obsigna publishes the exact snippet (`obsigna-hook` in `~/.claude/settings.json`), then `obsigna list` / `verify`. Official Anthropic hooks can also deny `rm -rf` without Obsigna.
2. **Any MCP server:** stdio proxy as `command` in MCP config. Beacon/Obsigna/Pipelock/mcp-audit-proxy all document “replace the command with the proxy; spawn the real server.” Cursor MCP config is the same JSON shape. **Not an enormous integration.**
3. **Cursor:** `beforeShellExecution` / `afterShellExecution` / `preToolUse` / `postToolUse` in `.cursor/hooks.json`. Official, partner-supported. Cloud agents run repo hooks.
4. **OpenAI Agents SDK:** tracing is default; `function_span` already stores tool I/O.

### What is still hard

Wrapping **all** of Cursor’s IDE loop as a third-party product without hooks (injecting into the closed agent) is Hard / Extremely hard — which is what `09` already said. That hardness is **not** a moat for Action Receipt. It is a reason the mock demo exists, and the mock is the failure mode `10` named: “Judges require a real IDE integration we cannot finish.”

**D’s trap:**  
- Mock → judges reject as fake (`09`: “If they don’t [accept a mock], this dies”).  
- Real Claude Code hook / MCP proxy → you have rebuilt Obsigna/Pipelock’s getting-started in two files.  
There is no third path that is both real and original in three weeks.

---

## Kill test E — Post-hackathon product

**Result: KILL** as a company-shaped continuation. The post-hackathon plan in `06`/`10` is “Real MCP” / “MCP proxy.” That **is** a coherent category — and it is already a category with named incumbents, OSS, and Cursor distribution partners.

| Continuation story | Who already is that |
|---|---|
| MCP proxy | Obsigna `obsigna-mcp`, Pipelock `mcp_stdio`/`mcp_http`, mcp-audit-proxy, agent-warden, MintMCP, Runlayer |
| Execution gateway / agent firewall | Pipelock (CNCF Landscape: Security & Compliance badge on README); ThinkWatch “AI bastion host” (search hit; not fully audited) |
| Policy engine | Codex execpolicy; Claude Code permissions + hooks; Cursor Run Modes + `permissions.json`; LangGraph `interrupt`; HumanLayer `@require_approval`; Pipelock RBAC/verdicts |
| Audit layer | Claude Code OTEL → SIEM; OpenAI traces dashboard; Langfuse; Obsigna dashboard; Pipelock evidence viewer; Cursor team audit (admin-only, not tool calls) |
| Agent permission boundary | Cursor Auto-review + sandbox (first-party); Claude Code permission modes; Codex execpolicy |

A hosted “agent said X / log says Y” viewer is a **demo feature** on top of logs every runtime already emits. It is not a durable product unless you own the boundary (you will not: Cursor/Anthropic/OpenAI/MCP hosts do).

Humanloop sunset (8 Sep 2025) is the extra kill for “independent audit SaaS sitting next to a lab’s agent”: labs bundle, then delete the login.

---

## Strongest alternative (incumbent, not a new idea)

**Primary: Agent Receipts / Obsigna** — same name, same overnight-destructive-call story, same independent daemon, same MCP proxy, same Claude Code hook, public spec, SDKs in Go/TS/Python. [agentreceipts.ai](https://agentreceipts.ai/) (page timestamp 15 Sep 2026).

**Co-primary: Pipelock** — 894★, published **Action Receipt** format, Ed25519, hash chain, mediator outside the agent, integrations list includes Cursor / Claude Code / Codex / LangGraph / OpenAI Agents SDK, live playground.

**Distribution incumbents:** Cursor (hooks + Run Modes + partners), Claude Code (hooks + OTEL), HumanLayer (11.6k★ IDE + PyPI `require_approval` + Enterprise Audit Logs).

---

## Difference

What Action Receipt *claimed* vs what exists:

| Claimed delta | Reality |
|---|---|
| Receipt vs lying narrator | Tool_use vs message is how every tool-calling API already works; UIs already show expandable commands |
| Agent-unwritable log | Only true off-process. Mock demo is on-process. Off-process is Obsigna daemon / Pipelock mediator |
| Approval gate | HumanLayer `@require_approval`; Claude `PreToolUse` deny; Cursor Run Modes; LangGraph `interrupt`; Codex execpolicy `prompt`/`forbidden` |
| Hash-chained receipts | Pipelock spec; Obsigna spec (W3C VC `AgentReceipt`); `@josephgec/mcpaudit`; beacon/Obsigna hash verify |
| MCP post-hackathon | Occupied |

There is **no remaining mechanism** that is not logging, wrapping MCP, or copying a published receipt spec.

---

## Does it matter?

The underlying pain (successful destructive calls; untrustworthy narrator; overnight agents) is **real**. Agent Receipts’ homepage uses it. Pipelock’s README uses exfiltration. Cursor users filed the audit-trail FR for SOC 2 / NIS2 / HIPAA language.

That pain **does not matter for OFFGRID** if the fix is already a protocol, a 894★ firewall, first-party hooks, and OTEL. Shipping a prettier split-view of the same facts fails Originality and Product Thinking: it is a viewer on incumbents’ streams.

---

## Demo breakage

1. **Mock agent** — `09` already: judges reject theater. The log is written by the demo.
2. **Real Claude Code / MCP** — wow-path is indistinguishable from Obsigna’s getting-started or `pipelock demo --receipts-dir ./out`.
3. **Cursor-only wow** — in-session UI already shows the command. Export still omits tools (staff). You cannot honestly say “Cursor has no execution log”; you can only say “Cursor’s *team audit API* omits it,” which is an FR, not a product.
4. **Destructive fixture** — cannot actually drop a DB (`09`). Toy DELETE vs toy narrator is a slide, not a job.
5. **Name collision on stage** — a judge who googles “action receipt agent” hits Pipelock’s spec and agentreceipts.ai.

---

## Business breakage

- **Buyer already has a vendor:** Cursor Enterprise, Claude Code managed OTEL, HumanLayer Pro $100/seat, Pipelock Enterprise (ELv2), MintMCP/Runlayer.
- **Switching cost of an MCP proxy is low** until it is in the critical path — then you are a security vendor with liability, not a hackathon.
- **Acquihire/sunset pattern** (Humanloop) for agent-adjacent audit UIs.
- **WTP:** teams that care already pay Cursor/Anthropic. Teams that do not care will not install a fourth proxy.

---

## Copy-me

**Fatal.** MCP stdio proxy is a weekend (multiple READMEs are copy-paste config diffs). Claude Code hook is one JSON object. Cursor `hooks.json` is documented with partner case studies. Receipt JSON + SHA-256 chain is a CS homework once Pipelock/Obsigna schemas are public.

A competitor in the ~87-person field can replicate the *demo* from public snippets. They cannot replicate Cursor or Claude Code. That is the point.

---

## No-AI

**Passes as a mechanism** (the product is better without an LLM narrator). **Does not save it.** No-AI was the reason it survived the earlier shortlist; it is also why the category is policy engines and proxies, which do not need a hackathon.

---

## Judge-says-no

Likely lines, in order:

1. “That’s just logging.” (Correct.)
2. “HumanLayer / Pipelock / Obsigna.” (Correct; two of those use the same words.)
3. “Show me a real agent.” (Mock dies.)
4. “Cursor already asks me to approve the command.” (Run Modes.)
5. OpenAI-credits prize + unnamed judges: a verifier of tool calls is less legible than a generator. Shared unknown from `07`, still open.

Originality score in `07` was already **5/10** with defensibility **3**. Post-inspection it should be treated as **1**.

---

## 2-year category

**Owned by platforms.** Cursor will either ship FR 156247 or keep routing it to hooks/partners. Anthropic already ships OTEL tool_decision/tool_result to SIEMs. OpenAI ships traces and execpolicy. MCP gateways consolidate. Pipelock is on the CNCF landscape. Obsigna is trying to be C2PA-for-actions.

A solo 2026 OFFGRID entry cannot be the standard. In two years this is a checkbox on Cursor Enterprise and Claude Code admin, plus one or two security vendors.

---

## Unknowns (do not treat as rescue)

- Whether Cursor closes FR 156247 before 14 Oct 2026. If yes, even the last talking point dies. If no, hooks/partners still occupy it.
- Whether HumanLayer’s live product audit logs include per-tool-call receipts (Enterprise marketing says “Audit Logs”; schema **not** fetched — docs 404). Does not reopen originality vs Obsigna/Pipelock.
- Full Codex session-transcript schema (execpolicy was fetched; JSONL dump was not).
- Computer-use screenshot journals (not re-fetched).
- Whether a judge has never heard of Pipelock/Obsigna and would clap at a split view. That is luck, not a strategy. Copy-me still applies.

---

## Kill-test scorecard

| Test | Outcome | One-line |
|---|---|---|
| A Existing infrastructure | **KILL** | Host tool logs, hooks, OTEL, traces, HITL, MCP proxies, signed receipts all exist |
| B Claim vs DELETE log | **KILL** | Tool_use vs prose is native; Claude OTEL answers it; signed receipts already named |
| C Independent observer | **KILL** | Mock is same-process; real independence is Pipelock/Obsigna daemon |
| D Mock-agent | **KILL** | Real hook/proxy is tiny; therefore mock is inexcusable and the real path is occupied |
| E Post-hackathon | **KILL** | “MCP proxy” is an existing category, not a sequel |

---

## Verdict

**KILLED**
