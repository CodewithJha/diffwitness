# Cross-candidate comparison — five kill-tested OFFGRID survivors

**Date:** 21 September 2026  
**Inputs:** `research/validation/01`–`05` plus their `_sources-*.md` files. Skim of `research/00-executive-summary.md` and `research/10-final-recommendation.md` for prior context only.  
**Rule:** Scores summarize evidence. They are not evidence. FACT vs INFERENCE labeled in the kill files; this table does not invent new facts.  
**Status:** all five **KILLED** unless a kill file says otherwise. None does.

Scoring (1–10):

| Column | High means |
|---|---|
| Direct competitor strength | More crowded / named incumbents already do the job. **Worse.** |
| Differentiation | Remaining mechanism incumbents do not ship. Higher = better. |
| Evidence strength | Primary pages/APIs/PRs actually inspected this cycle. Higher = we know more, not that the product is good. |
| Technical novelty | New mechanism, not a hosted CLI. Higher = better. |
| Demo strength | Original 20s wow that is not search/fixture/wrapper theater. Higher = better. |
| 3-week feasibility | Can a solo ship a hosted demo. Higher = easier. Easy is not a win condition. |
| False-positive risk | False greens/blocks that destroy trust. **Worse.** |
| Post-hackathon potential | Durable independent company, not absorption. Higher = better. |

---

## Comparison table

| Candidate | Direct competitor strength | Differentiation | Evidence strength | Technical novelty | Demo strength | 3-week feasibility | False-positive risk | Post-hackathon potential | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| CiteCheck | 10 | 2 | 9 | 1 | 3 | 9 | 9 | 1 | **KILLED** |
| Action Receipt | 9 | 1 | 8 | 2 | 2 | 8 | 4 | 2 | **KILLED** |
| Canary Session | 10 | 1 | 9 | 1 | 2 | 5 | 9 | 1 | **KILLED** |
| Spec Triangle | 9 | 2 | 8 | 1 | 4 | 10 | 3 | 1 | **KILLED** |
| Merge Preflight | 9 | 2 | 9 | 1 | 3 | 9 | 9 | 1 | **KILLED** |

No candidate has a score profile that survives. High feasibility + high competitor strength + low differentiation is the shared fingerprint of a weekend wrapper.

---

## Score explanations

### CiteCheck

**Direct competitor strength — 10.**  
FACT (`01`): Westlaw Quick Check uploads a brief and “will verify your citations and quotations” (product + help pages, 21 Sep 2026). Lexis+ Brief Analysis Quote Check verifies quote text and pin cites against the primary source and runs Shepard’s. Bloomberg Brief Analyzer checks citations. CourtListener, 17 Sep 2026, shipped ChatGPT/MCP “verify every citation in an incoming brief,” with sample prompt “Verify every citation in this brief and flag any unknown citations.” OSS: `eyecite` 283★, `citegate` 102★, `john-walkoe/courtlistener_citations_mcp` already demos *Mata*. `gh search` returned at least twenty similarly named citation-checker repos. This is not a gap. It is the category.

**Differentiation — 2.**  
Claimed delta (“we only verify AI output; public APIs; local-first”) does not change the buyer’s screen. Quick Check does not care who wrote the brief. CourtListener `/c/` + MCP already is the public path. Quote-at-pinpoint is Lexis Quote Check. Remaining true differences are quality gaps a 3-week app will not close.

**Evidence strength — 9.**  
Primary product pages, Mata PACER PDF, live CourtListener HTML + REST lookups of the opinion’s own cites, Crossref DOI 200/404, HEAD 403 trap. Lawyer interviews: **0 of 3** (Unknown). ABA ethics PDFs not extracted. Deduct one for those holes; Tests A/B/C do not depend on them.

**Technical novelty — 1.**  
Parser + HTTP/API existence lookup. Span detection can be `eyecite` (rules). No model required. Copy-me is an afternoon.

**Demo strength — 3.**  
Paste → red/green on a Mata fixture is <30s and is CourtListener citation lookup with CSS. The repo’s own wow (Gibbs at `738 F.2d 1153`) **is** `/c/F.2d/738/1153/`. Looks-like-a-search-box rule: kill. Stage risk: HTML resolver **false-greens** Miller/Petersen/Holliday.

**3-week feasibility — 9.**  
FACT: existence check is a day (`01` copy-me; already in `06`). Hosted textarea is a weekend. That ease is why Originality dies.

**False-positive risk — 9.**  
Live this pass: fake Holliday/Petersen/Zaunbrecher/Gen. Wire Spring/Hyatt/BDC 56 **resolve to real other cases**. Fake Miller: HTML maps to *Greenleaf* (174 F.3d 352); REST citation count 0 — the two public APIs disagree. Real-case wrong-proposition (Rimsat, El Al) is **false green** on existence. Possible false red: `360 N.J. Super. 360` 404 on CL (real vs missing: Unknown). A single false red shown to a lawyer ends trust. Uncontrollable at hackathon quality.

**Post-hackathon potential — 1.**  
Success looks like absorption into KeyCite / Shepard’s / Quick Check / Harvey / Clio-Fastcase / OpenAI+CourtListener. Name CiteCheck is taken (arXiv 2502.10881; GitHub skill).

**Status — KILLED.** File `01` verdict.

---

### Action Receipt

**Direct competitor strength — 9.**  
FACT (`02`): [agentreceipts.ai](https://agentreceipts.ai/) uses the overnight-destructive-call story and an out-of-process daemon. Pipelock 894★ publishes an **Action Receipt** spec (Ed25519, hash chain, signed outside the agent) plus Cursor/Claude Code/Codex/LangGraph integrations and a live playground. HumanLayer 11,592★ + PyPI `@require_approval()` + Enterprise Audit Logs. Claude Code OTEL already emits `tool_decision` / `tool_result` joinable on `tool_use_id`, with a SIEM example. Cursor hooks (`preToolUse` / `beforeShellExecution` / MCP) and Cloud Agents SSE `tool_call`. OpenAI Agents SDK tracing on by default. MCP audit-proxy junkyard. Not a 10 only because Cursor’s *team* audit API still omits agent tool calls (open FR 156247) — a vendor hole, not whitespace.

**Differentiation — 1.**  
Claimed deltas (receipt vs narrator; agent-unwritable log; approval gate; hash chain; MCP sequel) are respectively native tool_use vs message, Obsigna daemon / Pipelock mediator, HumanLayer / Run Modes / execpolicy / `interrupt()`, published receipt specs, and an occupied proxy category. Kill file: “There is **no remaining mechanism** that is not logging, wrapping MCP, or copying a published receipt spec.”

**Evidence strength — 8.**  
Official Cursor/Claude/Codex/MCP/OpenAI/LangGraph/Langfuse docs + GitHub APIs + Pipelock spec + agentreceipts.ai fetched 21 Sep 2026. Computer-use screenshot journals not re-fetched. HumanLayer live Enterprise audit schema not fetched (docs 404). Deduct for those; A–E still kill.

**Technical novelty — 2.**  
Independent-of-prose logging is how tool-calling APIs work. Off-process signing is already specified. Mock-agent same-process log is a second `console.log`.

**Demo strength — 2.**  
Mock: judges reject theater (`09` already; `02` confirms the log is written by the demo). Real Claude Code hook / MCP proxy: indistinguishable from Obsigna getting-started or `pipelock demo`. Cannot actually drop a DB. Name collision on stage.

**3-week feasibility — 8.**  
MCP stdio proxy is a weekend (multiple README config diffs). Claude Code hook is one JSON object. Cursor `hooks.json` is documented. The mock is even easier and is the failure mode.

**False-positive risk — 4.**  
Not the primary kill. The trust failure is **theater** (same-process receipt) and **bypass** (Pipelock/Obsigna state they cannot see a DELETE around the proxy), not a numeric false-positive rate on a classifier. Lower than CiteCheck/Merge Preflight because we did not measure a gate painting good work red.

**Post-hackathon potential — 2.**  
`06`/`10` sequel “Real MCP” **is** the occupied category. Humanloop sunset (8 Sep 2025) extra-kills independent audit SaaS next to a lab’s agent. Platforms (Cursor FR, Anthropic OTEL, OpenAI traces, CNCF Pipelock) own two-year outcome.

**Status — KILLED.** File `02` verdict. Tests A–E all KILL.

---

### Canary Session

**Direct competitor strength — 10.**  
FACT (`03`): Promptfoo **25,332★**; docs last updated **21 Sep 2026**. Long-Horizon Tasks (`steps_json` + persistent session), coding-agent providers (Claude Agent SDK, Codex, …), `trajectory:tool-sequence` / `trajectory:tool-used` / `cost`, GitHub Action `promptfoo-action@v1`. That sentence *is* the product. Langfuse **34,891★**: session replay, datasets from traces, experiment compare, `RegressionError` CI. LangSmith `agentevals` strict reference-trajectory match + backtests. Chronicle (arXiv:2609.20625, 17 Sep 2026; `theagentplane/chronicle` 23★) is cut-point record-replay. TraceGym 1★ occupies the slogan.

**Differentiation — 1.**  
Material difference vs Promptfoo is README/UX (“golden long session as default object,” config bisect). Not a mechanism. If the job is envelope replay, that is Chronicle, and Chronicle argues the *naive rerun thesis does not work*.

**Evidence strength — 9.**  
Promptfoo/Langfuse/LangSmith pages fetched; Anthropic official April 23 2026 postmortem **confirmed** this pass (previously unconfirmed in `10`); local stdlib experiment in `/tmp` (not `src/`). Independent TAM: Unknown. Literal 30-minute Claude Code CLI replay via Promptfoo: not verified — does not save.

**Technical novelty — 1.**  
YAML + a runner. Config-commit bisect is `git bisect` + the same eval.

**Demo strength — 2.**  
Deterministic 10/10 is a scripted agent we wrote to fail when a flag flips. Stochastic 15% skip-`test` destroys 10/10 on the baseline (7/10 pass). Promptfoo’s own coding-agent guide: 30–120s tasks, `--repeat 3` because runs differ. Opposite of a 20-second reliable wow. “Flip reasoning effort” is Anthropic’s documented knob.

**3-week feasibility — 5.**  
Scripted runtime: yes (`09`). True multi-hour Claude Code replay: **Extremely hard**. Split score: the shippable demo is fake; the real product is not 3 weeks.

**False-positive risk — 9.**  
Standing kill rule: a canary that cannot distinguish regression from flake on a non-scripted agent is dead. Chronicle: live re-run **rarely repeats**. Anthropic: “evals initially [did not] reproduce the issues”; worst bug needed a stale session. Promptfoo already treats flake as the central coding-agent eval problem.

**Post-hackathon potential — 1.**  
Eval SaaS crowded; Humanloop sunset is the prior; Anthropic will eat the canary with the eval suite they promised; ClickHouse will keep shipping Langfuse experiments.

**Status — KILLED.** File `03` verdict. Test A alone sufficient.

---

### Spec Triangle

**Direct competitor strength — 9.**  
FACT (`04`): oasdiff **1,373★**, pushed 21 Sep 2026, **hosted** paste-two-specs visual at oasdiff.com/diff and CLI `--open`. Intentionally not live/SDK; authors say live response monitoring is “a different kind of tool.” That tool exists: Schemathesis **3,616★**; Postman contract tests against `env-server`; Prism validations. Vertex 3: Speakeasy SDK PRs report removed methods / signature changes; Fern (a Postman company) generates so copies cannot rot; Stainless winding down into Anthropic (15 May 2026) is consolidation, not a vacancy. drift/ci.com adjacent. Deduct one vs CiteCheck/Canary because no single giant owns all three vertices — the *stack* does.

**Differentiation — 2.**  
“Nobody ships this exact three-column HTML.” Packaging. CSS. Not a mechanism. Shallower than Schemathesis (status code vs schema-deep) and than Speakeasy (regex over `src/` vs SDK PR surface).

**Evidence strength — 8.**  
oasdiff README + BREAKING-CHANGES.md + monitor-external-apis + Fern/Speakeasy/Stainless/Schemathesis/Prism/Dredd fetched. Postman.com marketing 403; learning.postman.com + postman-cs docs used. Prism Validation Proxy body failed to render. Deduct; B still kills.

**Technical novelty — 1.**  
`research/07` tech depth 5, defensibility 1 — confirmed. No algorithm. oasdiff is optional garnish for the 404-vs-200 thesis demo; vertex 2 is curl.

**Demo strength — 4.**  
404 vs 200 is immediately understandable in <20s **on a fixture we control**. oasdiff `--open` is a competing 20s visual a tab away. Fixture smell (`09`). Highest demo-legibility of the five; still not a product demonstration of a new failure class.

**3-week feasibility — 10.**  
Afternoon: fixture API + curl + grep + HTML table. Copy-me: **hours**. Fatal wrapper. Prior research said weekend; this pass is worse (oasdiff not even required).

**False-positive risk — 3.**  
Demo avoids the hard problem (auth against production) by using a canned 404. Not a measured false-block rate. Lower than CiteCheck/Merge because we did not ship a gate on other people’s APIs this pass. The *real* job’s FP/auth risk is Unknown and was never the kill — occupancy was.

**Post-hackathon potential — 1.**  
OpenAPI contract-governance CI. `10`: “CI app — probably still not a company.” Two years: checkbox on Postman/Fern or a thin oasdiff Pro clone.

**Status — KILLED.** File `04` verdict. Test C fatal.

---

### Merge Preflight

**Direct competitor strength — 9.**  
FACT (`05`): GitHub rulesets include **additional approval for unattributed Copilot PRs, default on**. Required status checks, CODEOWNERS, merge queues, file-size restrictions. Copilot review can count toward merge requirements. CodeRabbit **named** “Pre-Merge Checks” (docstring coverage, title, description, issue assessment; custom NL; `error` blocks merge). Danger.js homepage examples: “Encourage smaller PRs,” “Encourage more testing.” Qodo blast-radius + rule enforcement. Graphite (bundled with Cursor Cloud Agents) stacking. Deduct one vs a 10 because GitHub has not shipped first-party max-*file-count* (file *size* exists) and duplicate/abandonment are not a checkbox — those holes are not a 3-week product.

**Differentiation — 2.**  
Claimed deltas: (1) agent-specific thresholds from arXiv:2601.15195 — GitHub already shipped agent-specific extra approval; paper effect sizes are small and the 25-PR replay **did not separate**. (2) Gate not comments — Danger `fail`, required checks, CodeRabbit Request Changes, merge queues already gate. “We refuse to comment” is a minus (no bot to mute), not a plus.

**Evidence strength — 9.**  
Paper HTML v1 fetched (MSR 2026 accepted; n=33,596). GitHub docs fetched. CodeRabbit/Qodo/Graphite/Danger fetched. **n=25** public agent PRs via `gh api` (11 merged / 14 closed-unmerged). Revert rate not measured. Codex public sample weak. Deduct one; A–E still kill.

**Technical novelty — 1.**  
`if changed_files > 40 and no test paths: exit 1`. A linter. Product-without-AI reveals there was never a model-shaped wedge.

**Demo strength — 3.**  
20s “40-file no-test → block” is visually identical to a red required check named `size`. Citing the paper backfires if a judge asks for Cliff’s δ (−0.10 files) or RQ2 (38% abandonment). GitHub App may miss 14 Oct; fixture-only is a webpage over `changed_files`.

**3-week feasibility — 9.**  
Weekend required workflow / Dangerfile / tick CodeRabbit error / tick extra Copilot approval.

**False-positive risk — 9.**  
Paper: docs PRs merge at **84%**; a “must include tests” gate false-blocks the highest-success class. Replay: **8/11 merged** had zero test-path files; **12/14 closed** were ≤6 files (a size gate would have *allowed* them). GitHub’s own docs: skipped/path-filtered required checks stay Pending and **block merge**. CodeRabbit defaults Pre-Merge Checks to `warning` and documents Ignore — they know `error` is politically expensive. The product’s failure mode is the documented failure mode of branch protection.

**Post-hackathon potential — 1.**  
GitHub is already writing agent merge policy into rulesets. CodeRabbit owns the phrase. Paper’s own recommendation is to *agent vendors* (validate CI, split diffs). Sweep/JetBrains abandoned “agent opens PRs” as a company.

**Status — KILLED.** File `05` verdict. Tests A–E all kill.

---

## Copy-me times

| Candidate | Copy-me (from kill file) | What a competent engineer ships |
|---|---|---|
| CiteCheck | **Afternoon** (existence) | `eyecite` + CourtListener `/c/` or REST; print red/green. john-walkoe already did Mata. Weekend: hosted textarea. |
| Action Receipt | **Weekend** (fatal) | MCP stdio proxy from public README; or one Claude Code `PostToolUse` JSON object; or Cursor `hooks.json`. Receipt JSON + SHA-256 is homework once Pipelock/Obsigna schemas are public. |
| Canary Session | **Weekend** | `npx promptfoo@latest init --example openai-agents`; `steps_json` + `trajectory:tool-sequence` + `cost` + `promptfoo-action@v1`. |
| Spec Triangle | **Hours** (fatal) | Fixture 404 + `openapi.yaml` 200 + `getUser` still exported + HTML table. oasdiff Apache-2.0 optional. |
| Merge Preflight | **Weekend** | Required Action: files>40 and no tests → exit 1. Or Danger homepage examples. Or CodeRabbit Pre-Merge Checks → error. |

All five are inside the OFFGRID originality rule’s blast radius: “do not simply submit an existing project with minimal changes” applies to *us wrapping them* as much as to anyone wrapping us.

---

## No-AI tests

| Candidate | Product-without-AI? | Does it save the candidate? |
|---|---|---|
| CiteCheck | **Yes / strong.** Parsing + lookups; eyecite is rules, not NER. | **No.** It is why copy-me is a day and why judges can call it a wrapper. Prize is OpenAI credits. |
| Action Receipt | **Yes** (better with the LLM narrator *off*). | **No.** Category is policy engines and proxies. No-AI was why it survived the *earlier* shortlist; investigation is over. |
| Canary Session | Core assertions/token bounds work without an LLM judge. | **No.** That is a Promptfoo feature. LLM-as-judge (`trajectory:goal-success`) reintroduces Zheng et al. bias (already used to kill Judge Swap CI in this repo). |
| Spec Triangle | **Yes** (stronger with the model off). | **No.** No model-shaped moat; a curl table next to a credits prize has no Technical Depth story. “Explain the break in English” is ChatGPT glued to oasdiff JSON — worse. |
| Merge Preflight | **Yes** (gates are the product). | **No.** Removing AI reveals a linter. Never a wedge. |

Shared INFERENCE: “works without a model” was a shortlist *filter*, not a survival condition. After kill tests it is evidence of **wrapper / homework**.

---

## Judge-says-no one-liners

Quoted from the kill files. No rescue angles added.

**CiteCheck**

> “This is CourtListener citation lookup — they even shipped ‘verify every citation in this brief’ into ChatGPT last week — plus Westlaw Quick Check / Lexis Quote Check if I already have a login. You pasted Mata, the cases went red, Gibbs showed up at 738 F.2d 1153. That’s `/c/F.2d/738/1153/`. Nicer UI on a search box is not a product. Next.”

If they have used Quick Check: “I already upload the brief and it verifies citations and quotations.”

**Action Receipt**

1. “That’s just logging.”  
2. “HumanLayer / Pipelock / Obsigna.” (Two of those use the same words.)  
3. “Show me a real agent.” (Mock dies.)  
4. “Cursor already asks me to approve the command.” (Run Modes.)

**Canary Session**

Hardest question in `07`: “Promptfoo?”  
Updated answer: **yes**, and their coding-agent / long-horizon / trajectory docs were updated 21 Sep 2026.  
Follow-ups: “Langfuse sessions?” “LangSmith agentevals?” “Isn’t this the Anthropic postmortem?” All yes.

**Spec Triangle**

“oasdiff?” Honest answer after this pass: **oasdiff is already hosted**, and live/SDK are Schemathesis/Speakeasy. Organizer aesthetic (live software, not tutorial CRUD) does not rescue a CRUD-shaped report over three files.

**Merge Preflight**

“Isn’t that a branch protection rule?” Honest answer: **yes, plus Danger.js, plus CodeRabbit’s actual ‘Pre-Merge Checks’ page.**

---

## 2-year product answers (all weak / killed)

| Candidate | If it “succeeded,” what category is it? | 2-year owner | Independent company? |
|---|---|---|---|
| CiteCheck | Thin citator / pre-filing verification gate | Thomson Reuters, Lexis, Bloomberg, Harvey, Clio/Fastcase, or OpenAI+CourtListener toggle | **No.** Feature changelog line. |
| Action Receipt | Signed action receipts + MCP gateway + SIEM of tool calls | Cursor Enterprise (FR or partners), Anthropic OTEL, OpenAI traces/execpolicy, Pipelock/Obsigna | **No.** Checkbox on platforms + one or two security vendors. |
| Canary Session | Golden-session / long-horizon agent eval | Promptfoo providers, Langfuse (ClickHouse), Anthropic internal eval suite, Chronicle if cut-point replay is even a category | **No.** Humanloop is the prior. |
| Spec Triangle | OpenAPI contract governance / API compatibility CI | oasdiff Pro, Postman/Fern, Speakeasy leftover, Schemathesis Workbench | **No.** Three-pane dashboard over diffs other people compute. |
| Merge Preflight | Agent-aware merge policy | GitHub rulesets, Copilot, CodeRabbit Pre-Merge Checks, Graphite stacking, agent vendors following the MSR paper | **No.** Feature request, not a company. |

`10` already: we have **not** found a sufficiently strong, uncrowded opportunity that is also a 3-week hosted demo *and* a post-hackathon company. Kill tests closed the five remaining investigations. They did not open a sixth.

---

## Cross-cutting pattern (INFERENCE, labeled)

All five share: **documented professional pain** + **named incumbent that is the job** + **copy-me ≤ weekend** + **demo that is a fixture, a search box, a YAML, a curl table, or a required check**. Two of five (CiteCheck, Merge Preflight) are additionally **unsafe as gates** (false greens / false blocks). One (Canary) cannot tell regression from flake except on a fake runtime. One (Action Receipt) cannot be an independent observer in the hackathon architecture. One (Spec Triangle) has no mechanism left after composing existing tools.

Pain without a product gap is not a shortlist. It is a stop.

---

## What this file does not do

Does not pick a winner. Does not invent a sixth product. Does not start architecture or code. Does not reopen Afterhours notes→brief, generic agents, or overlays.
