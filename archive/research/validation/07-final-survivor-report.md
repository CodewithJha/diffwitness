# HACK47 OFFGRID - Survivor Validation

**Date:** 21 September 2026  
**Scope:** Five kill-tested candidates only. No architecture. No product code. No replacement product.  
**Sources:** `research/validation/01-citecheck.md` through `05-merge-preflight.md`, their `_sources-*.md` files, skim of `research/00-executive-summary.md` and `research/10-final-recommendation.md`.  
**FACT vs INFERENCE:** facts are those the kill files labeled and sourced. Inferences are labeled. Unknown stays Unknown.

---

## Executive conclusion

**Zero candidates survived.** After adversarial kill tests on 21 September 2026, CiteCheck, Action Receipt, Canary Session, Spec Triangle, and Merge Preflight are all **KILLED**. The prior shortlist in `research/10-final-recommendation.md` treated them as remaining *investigations*, not a product pick. Investigation is over.

> **No candidate currently meets the evidence threshold.**

That threshold, as used in this cycle: a painful professional job that is not already a shipped feature of the system of record or a named OSS/CLI; a mechanism that is not a weekend wrapper; a demo that is not fixture theater or a search box; a gate that is not empirically false-green or false-blocking; a 3-week hosted URL that could still be a company after 14 October. None of the five clear it.

Do not force a winner. Do not invent a sixth product. Do not start Afterhours-as-brief, a generic agent, an overlay, or architecture for any of these five.

---

### Candidate 1: CiteCheck

### Verdict

**KILLED** (`research/validation/01-citecheck.md`).

CiteCheck is a real professional failure mode (*Mata v. Avianca* is a federal sanctions opinion) attached to a **non-existent product gap**.

### Strongest evidence

- **FACT:** Westlaw Quick Check product + help pages (fetched 21 Sep 2026): upload or paste a brief; “Quick Check will verify your citations and quotations”; KeyCite warnings; quotation analysis; opponent mode.
- **FACT:** Lexis+ Quote Check: verifies each quote against the cited primary source, including pin cites; Shepard’s on citations.
- **FACT:** Free Law Project, **17 September 2026**: CourtListener in ChatGPT/MCP — “verify every citation in an incoming brief against primary sources”; sample prompt *is* the demo.
- **FACT:** Live CourtListener lookups of Mata-listed cites this pass: existence checks **false-green** reporter collisions (Holliday → *Gibbs v. Maxwell House*; Petersen → ISS Marine; HTML Miller → *Greenleaf*). Existence ≠ proposition (Rimsat, El Al). HTML vs REST **disagree** on `174 F.3d 366`.
- **FACT:** `john-walkoe/courtlistener_citations_mcp` README already uses Mata as real / fabricated / wrong-case.

### Strongest competitor

**Westlaw Quick Check** (Thomson Reuters) — same vendor as CoCounsel. Runner-up that kills the hackathon clone: CourtListener MCP + ChatGPT plugin (17 Sep 2026) + `eyecite` + the Mata MCP. Lexis Quote Check is as strong on quotes/pin cites specifically.

### Why it could work

The pain is court-documented, not a blog. Gatekeeping (not drafting) is the right job shape. Product-without-AI is strong. A 20-second red/green on a public fixture is visually brutal. Local-first cite-only egress is the honest privilege mitigation.

None of that is a remaining wedge after Tests A–F.

### Why it could fail

Incumbents already upload-and-verify inside the system firms file from. Public path is CourtListener as of this week. Existence checks certify ChatGPT collisions as real. Hosted paste box is a privilege non-starter (Harvey’s security page exists because that buyer will not use a tool without SSO, no-training, in-region, SOC 2). Local-first collapses into the vendor’s own lookup. Demo is a search box. Copy-me is a day.

### Kill test results

| Test | Result |
|---|---|
| A Existing products | **KILL** — Quick Check / Quote Check / Brief Analyzer / CL ChatGPT 17 Sep / crowded OSS |
| B Incumbent response | **KILL** — they already ship it; CoCounsel is TR; Harvey $15.5B; Fastcase is Clio |
| C Mata real fakes | **WEAK as product** — opinion real; existence systematically fails collisions and fake quotes of real cases |
| D False-positive risk | **KILL** — live false greens; possible false reds on state reporters; uncontrollable at hackathon quality |
| E User willingness | **KILL** for hosted paste; local-first is CL lookup. **0 of 3** lawyer interviews (Unknown; not invented) |
| F Demo | **KILL** — search box; fixture is a known exam question |

### Remaining unknowns

- Lawyer willingness to paste drafts (0 interviews).
- Whether *Ehrlich*, 360 N.J. Super. 360, is a real NJ opinion missing from CL or a fake.
- Numeric false-red rate on a sample of real briefs.
- ABA Formal Opinion 512 / CA / NYC ethics **wording** (pages not extracted).
- Harvey-specific “verify citations” marketing page (not found; capability inferred from platform).
- Chrome extensions, Product Hunt, Reddit, Twitter: not inspected.
- CourtListener REST vs HTML resolver contract.

None of these unknowns reopen Test A or B.

---

### Candidate 2: Action Receipt

### Verdict

**KILLED** (`research/validation/02-action-receipt.md`). Tests A–E all KILL.

### Strongest evidence

- **FACT:** [agentreceipts.ai](https://agentreceipts.ai/) (page timestamp 15 Sep 2026): overnight production data gone; log says “maintenance task completed”; daemon outside the agent. Obsigna: protocol + MCP proxy + Claude Code `PostToolUse` hook + signing daemon.
- **FACT:** Pipelock **894★**, published **Action Receipt** spec (Ed25519, hash chain, signed from outside the agent trust boundary); integrations include Cursor, Claude Code, Codex, LangGraph, OpenAI Agents SDK; live playground.
- **FACT:** Claude Code OTEL: tool spans with permission-wait child + execution child; events `tool_decision` / `tool_result`; SIEM export example; `OTEL_LOG_TOOL_DETAILS` / `OTEL_LOG_TOOL_CONTENT`.
- **FACT:** Cursor JSONL stores tool **inputs** separately from assistant text (staff, 13 Apr 2026); Cloud Agents SSE `tool_call` includes args/result; hooks can block; team `/teams/audit-logs` event-type enum has **no** agent tool-call types (open FR 156247, last reply 25 Jul 2026, not closed as shipped).
- **FACT:** HumanLayer homepage is a multiplayer coding-agent IDE (Pro $100/user/mo; Enterprise Audit Logs); PyPI `humanlayer` 0.7.9 still ships `@hl.require_approval()`.

### Strongest competitor

**Co-primary:** Agent Receipts / Obsigna (same name, same story) **and** Pipelock (named spec, 894★). Distribution incumbents: Cursor hooks + Run Modes + partners (MintMCP, Oasis, Runlayer, Snyk); Claude Code hooks + OTEL; HumanLayer.

### Why it could work

The pain is real: successful destructive calls plus a lying narrator; APM-green ≠ safe. Non-AI is the right mechanism. A split view of “agent said X / log says Y” is judge-legible. Cursor’s team audit API omitting agent actions is a documented hole.

That hole is a vendor feature request and a listed partner category. It is not an OFFGRID original.

### Why it could fail

“We log tool calls” is the default of every serious agent runtime in 2026. Tool_use vs message already answers “said DELETE, no DELETE tool call.” Independent observer requires a **separate process** on the execution path — mock-agent-in-one-Node-process fails by construction; real path is Pipelock/Obsigna. Real hook/proxy is tiny, therefore the mock is inexcusable and the real path is occupied. Post-hackathon “MCP proxy” is an existing category. Humanloop sunset extra-kills adjacent audit SaaS.

### Kill test results

| Test | Result |
|---|---|
| A Existing infrastructure | **KILL** — host logs, hooks, OTEL, traces, HITL, MCP proxies, signed receipts all exist |
| B Claim vs DELETE log | **KILL** — native tool_use vs prose; Claude OTEL; signed receipts already named |
| C Independent observer | **KILL** — mock is same-process; real independence is Pipelock/Obsigna daemon |
| D Mock-agent | **KILL** — real hook/proxy is tiny; mock inexcusable; real path occupied |
| E Post-hackathon | **KILL** — “MCP proxy” is an existing category, not a sequel |

### Remaining unknowns

- Whether Cursor closes FR 156247 before 14 Oct 2026 (if yes, last talking point dies; if no, hooks/partners still occupy it).
- Whether HumanLayer Enterprise audit logs include per-tool-call receipts (schema not fetched; docs 404).
- Full Codex session-transcript schema (execpolicy fetched; JSONL dump not).
- Computer-use screenshot journals (not re-fetched).
- Whether a judge who has never heard of Pipelock would clap at a split view (luck, not strategy).

Do not treat as rescue.

---

### Candidate 3: Canary Session

### Verdict

**KILLED** (`research/validation/03-canary-session.md`). Test A (Promptfoo) alone is sufficient.

### Strongest evidence

- **FACT:** Promptfoo **25,332★**; docs updated **21 Sep 2026**. Official guide “Evaluate OpenAI Agents”: Long-Horizon Tasks via `vars.steps_json` on a persistent session; “regressions in tool usage across longer trajectories.” Coding-agent guide: Claude Agent SDK / Codex / etc.; `trajectory:*` assertions; `cost` thresholds; `--repeat 3`; GitHub Action before-vs-after.
- **FACT:** Assertions include `trajectory:tool-used`, `trajectory:tool-args-match`, `trajectory:tool-sequence` (`mode: exact`), `trajectory:step-count`, `trajectory:goal-success`, `cost`.
- **FACT:** Langfuse **34,891★**: session replay, datasets from production traces, experiment comparison, `RegressionError` CI, `langfuse/experiment-action`.
- **FACT:** Anthropic official postmortem `https://www.anthropic.com/engineering/april-23-postmortem` **fetched this pass** (was UNCONFIRMED in `10`). Published 23 Apr 2026. Three product-layer changes; “neither our internal usage nor evals initially reproduced the issues”; going forward: broader eval suite, soak, prompt-change audit. Supports the *failure mode*; they will eat the canary.
- **FACT:** Chronicle arXiv:2609.20625 (17 Sep 2026): live re-run of an agent **rarely repeats**. GitHub `theagentplane/chronicle` 23★.
- **FACT:** Local experiment (not in `src/`): deterministic scripted agent 10/10 regression **true**; 15% stochastic skip-`test` → baseline 7/10 pass → 10/10 regression **false**.

### Strongest competitor

**Promptfoo** for the specified live-rerun canary. **Chronicle** if the job is actually record/cut-point replay (not the thesis, and already OSS). **Langfuse / LangSmith** for session replay + datasets + experiment CI.

### Why it could work

Long-horizon / config regressions are real (Anthropic postmortem confirmed; HORIZON / Beyond Final Scores are diagnosis papers). Hamel: unsuccessful LLM products lack evals; looking beats dashboards. A golden session as the default object is a coherent UX. Builder’s home turf if the object is a session, not another eval dashboard.

UX is not a new mechanism. Promptfoo’s coding-agent + tracing + `trajectory:*` + `cost` + GitHub Action *is* that product as a configuration.

### Why it could fail

Indistinguishable from Promptfoo README. Live replay flakes (Promptfoo documents this; Chronicle says it rarely repeats; our stochastic run destroyed 10/10). True Claude Code replay is Extremely hard in 3 weeks; the shippable demo is a fake agent. “Flip reasoning effort” is a book report on a public postmortem. Eval SaaS is the most common-looking AI-eng submission in a ~87-person field. Humanloop sunset.

### Kill test results

| Test | Result |
|---|---|
| A Promptfoo | **KILL** — long-horizon + coding-agent + `trajectory:*` + cost + GitHub Action **is** the product |
| B Langfuse | **KILL** — session replay + datasets + experiment compare + `RegressionError` CI |
| C Long-session thesis | **Pain real, job owned** — postmortem confirmed; incumbents + Chronicle/LangSmith already instrument it |
| D 10/10 reliability | **KILL** — 10/10 only on deterministic fake; flake destroys 10/10; live replay unproven |
| E Distinction | **KILL** — Promptfoo YAML; Chronicle is the actual record-replay paper (17 Sep 2026) |

### Remaining unknowns

- Independent 2026 TAM for “agent session canaries”: **Unknown**.
- Whether Promptfoo’s Claude Agent SDK provider can replay a *literal* 30-minute Claude Code CLI session including compact/cache internals: **not verified**. If it cannot, wrapping the real CLI is Extremely hard (`09`) — does not save us.
- Chronicle production usage / funding: **Unknown** (23★, paper 4 days old).
- TraceGym quality: Unknown; 1★ existence is enough for copy-me.
- Whether judges value verifiers over generators given an OpenAI-credits prize: still Unknown (hackathon intel). Irrelevant once Originality is gone.

---

### Candidate 4: Spec Triangle

### Verdict

**KILLED** (`research/validation/04-spec-triangle.md`). Weekend-wrapper suspicion from prior research: **confirmed**, and slightly worse (oasdiff is optional for the thesis demo).

### Strongest evidence

- **FACT:** oasdiff **1,373★**, last push 21 Sep 2026. 755 change checks. Hosted visual: CLI `--open` and https://www.oasdiff.com/diff (“Paste two OpenAPI specs… no install required”). BREAKING-CHANGES.md: judges the **declared contract**, not what a server happens to accept. Monitor-external-apis: “live spec” = curl the OpenAPI *file*; if the provider publishes nothing machine-readable, that case needs “live response monitoring, **a different kind of tool**.”
- **FACT:** Schemathesis **3,616★**: “Detects when your implementation doesn't match the documented behavior.” Prism **5,034★** validations. Dredd **4,223★**, archived 8 Nov 2024 (job is old). Postman: generate collection from OAS; alert when collection and spec drift; Contract Test Generator runs against a live `env-server`.
- **FACT:** Speakeasy still documents breaking changes at **SDK level** (“removed methods, changed function signatures… public API surface”). Fern homepage footer: **a Postman company** (© 2026). Stainless joining Anthropic **15 May 2026**; hosted generator winding down — consolidation, not a vacancy.
- **FACT (reproducibility, not product code):** afternoon recipe is fixture 404 + spec 200 + `getUser` still in `sdk.ts` + HTML table.

### Strongest competitor

**oasdiff** for an OFFGRID judge who opens GitHub (hosted visual, Pro, Stripe/MongoDB logos). Strongest architecture competitor: **Fern (a Postman company)**. Strongest live competitor: **Schemathesis**.

### Why it could work

The failure mode is real: client 404 while docs/SDK lie. 404 vs 200 is immediately understandable in <20 seconds. Deterministic. Honest local-first if the live vertex is a fixture we control. oasdiff CLI does not naturally issue the HTTP request or parse SDK source, so a three-column view is not a screenshot of `--open`.

The visual is packaging. Putting a curl status next to two other strings does not expose a new failure class. Schemathesis/Postman already fail CI when responses violate the spec.

### Why it could fail

Each vertex is owned. The only gap is “three columns on one page.” Fern’s gospel is *don’t let the copies exist*. Speakeasy already diffs SDK surface. Copy-me is hours. View-source: YAML + `fetch` + string match. Fixture API we control smells canned; public third-party API moves under us and looks like a DDoS. No 2-year company (`10`: “CI app — probably still not a company”). Prize is model credits; a curl table has no Technical Depth story.

### Kill test results

| Test | Result |
|---|---|
| A oasdiff | **KILL** — spec-to-spec only; hosted visual already ships; live/SDK refused in writing |
| B Fern/Speakeasy/Stainless/Postman | **KILL** — each vertex owned; gap is CSS |
| C Weekend | **KILL (fatal)** — afternoon: fixture + curl + grep + HTML; nothing prevents wrapper |
| D Demo novelty | **KILL** — only non-oasdiff visual is a curl status in a table; not a new failure |

Copy-me **KILL**. No-AI **KILL as moat**. Judge-says-no **KILL**. 2-year **KILL**.

### Remaining unknowns

- oasdiff GitHub issue-search for live/runtime 403’d after the first issue list; unlikely to overturn the README boundary.
- Postman.com marketing 403; learning.postman.com + contract-test generator docs were enough for vertex 2.
- Prism Validation Proxy **docs body** failed to render.
- Exact oasdiff Pro pricing: linked, not extracted.
- Whether Fern’s `fern diff` (search snippet) is a first-class CLI command; fetched CLI reference listed `fern check` / `fern generate`, not `diff`. Do not depend on the snippet.
- How complete Postman’s first-party SDK generator is (nav exists; full page not fetched).
- Stainless transition timeline for existing customers.
- Judge taste: a pretty 404 table might still score Execution. That is not a reason to build.

None of these unknowns reopen C or B.

---

### Candidate 5: Merge Preflight

### Verdict

**KILLED** (`research/validation/05-merge-preflight.md`). Tests A–E all kill.

### Strongest evidence

- **FACT:** GitHub rulesets “available rules” page: **additional approval for unattributed Copilot PRs**, default **on**, because the usual author+reviewer assumption “doesn’t hold when Copilot opens a pull request.” Required status checks, CODEOWNERS, merge queues, file-size restrictions. Copilot review can count toward merge requirements.
- **FACT:** CodeRabbit docs: product named **Pre-Merge Checks**; built-ins (docstring coverage default 80%, title, description, issue assessment); custom natural-language checks; `error` + Request Changes **blocks merge**; Triage ranks PRs by priority vs next action; issue enrichment detects duplicates.
- **FACT:** Danger.js homepage examples include **“Encourage smaller PRs”** and **“Encourage more testing.”** `fail` is blocking. ~decade old.
- **FACT:** arXiv:2601.15195 (MSR 2026 accepted; HTML v1 fetched). n=**33,596** agent PRs; overall merge **71.48%**. Files Cliff’s **δ = −0.10** (small); LOC δ = **−0.17**; failed CI δ = −0.24 (and GitHub required checks already do this). RQ2 of 562 labeled rejected: **38%** abandoned / not reviewed; **23%** duplicate; 17% CI/test. Paper: socio-technical patterns **not captured by the quantitative metrics**. Docs task type merges at **84%**.
- **FACT:** 25-PR replay via `gh api` (11 merged / 14 closed-unmerged): files>10 did not separate; no-tests was the **majority of both** sides; 12/14 closed were ≤6 files (size gate would allow); 8/11 merged had zero test-path files (tests gate would block). pygraphistry#706: 38 files, 14 test files, CI success, paper class **duplicate**. BMAD-METHOD#196: 129 files — maintainer asked for smaller PRs (CONTRIBUTING + Graphite), not a startup.

### Strongest competitor

**GitHub rulesets** (required checks + extra Copilot approval + CODEOWNERS) **plus** a required Action or **Dangerfile**, **or** CodeRabbit Pre-Merge Checks in `error` mode. Graphite stacking if the actual pain is large diffs.

### Why it could work

Maintainer complaint is real (huge agent diffs, missing tests, wasted review). CodeRabbit lost the “no comment spam” fight in public; a silent gate is a coherent product stance. The paper is on-topic and large-n. Non-AI. 20-second red badge is Execution-legible.

The paper **does not validate** the product. It is evidence **against** a size/test gate. GitHub already shipped the agent-specific policy. CodeRabbit already named Pre-Merge Checks.

### Why it could fail

Looks like a linter / branch protection because it is. Heuristics vs 25 real agent PRs failed to separate. False-blocking docs PRs (paper’s highest-success class) and GitHub’s own skipped-check Pending trap. Buyer already pays GitHub and maybe CodeRabbit. Copy-me is a weekend YAML. Paper’s own recommendation is to *agent vendors* (run CI, split diffs). Sweep abandoned issue-to-PR as a company.

### Kill test results

| Test | Result |
|---|---|
| A GitHub first-party | **KILL** — extra Copilot approval exists; CI/size/ownership are first-party; 20-line Action is the heuristic gate |
| B CodeRabbit / Qodo / Graphite / Copilot / Danger | **KILL** — CodeRabbit named the job; Danger is the non-AI core |
| C Paper 2601.15195 | **KILL as empirical foundation** — small size effects; plurality failure is abandonment/duplicates the heuristic cannot see |
| D ~25 PR replay | **KILL** — signal absent |
| E False blocks | **KILL** — product failure mode = documented failure mode of branch protection |

### Remaining unknowns

- Exact CodeRabbit pricing this pass (prior research conflict $24–$72 vs Unknown). Not needed for kill.
- Whether GitHub will add first-party “max files in PR” (file *size* already exists). Would only make A stronger.
- Revert rate of merged agent PRs: **not measured**.
- Codex public PRs beyond toy `test-repo`: search did not yield a usable sample this pass.
- Paper camera-ready vs arXiv v1 deltas.
- Whether a *warning-only* UX survives as a hackathon demo (it would still be Danger `warn`). Not reopened as BUILD.

---

## Second discovery cycle — problem areas (not products)

These are **areas to research**, not named products, not a sixth candidate, not 30 ideas. They are inferred from what the kill tests actually revealed. **Even these areas are weak.** Do not treat this section as a shortlist.

Kill tests showed a repeating pattern: the *pain* is court-documented, paper-documented, or vendor-postmortem-documented; the *job* is already a named feature of the system of record (Westlaw/Lexis, Promptfoo, GitHub, Pipelock/Obsigna, oasdiff+Schemathesis+Fern). Remaining research should not re-enter those gravity wells with a hosted wrapper.

Three residual *shapes* that look **less dead than these five**, still not meeting the evidence threshold:

### Area 1 — Evidence of the world that never crossed the agent wrapper

**Why it showed up:** Action Receipt died because host logs already separate narrator vs `tool_use`, and signed “action receipts” already exist **on the mediated path**. Pipelock and Obsigna state the limit in writing: verification of the mediated slice does not prove a DELETE that went around the proxy; in-process keys are forgeable.

**What to research (not build):** whether a painful professional job exists where the **system of record** already emits evidence the agent cannot author (bank ledger, email provider sent-items, database WAL, cloud deploy log) *and* no security/observability vendor already sells that comparison as a product. This is still adjacent to the HumanLayer/Pipelock well.

**Conservative status:** **Unknown / weak.** May die on first inspection the same way Action Receipt died. Not a product name.

### Area 2 — Socio-technical duplicate / “nobody will look,” as distinct from size/CI gates

**Why it showed up:** Merge Preflight died because GitHub already shipped **identity-based** extra Copilot approval, CodeRabbit already named Pre-Merge Checks, and the paper’s own RQ2 says the plurality of rejected agent PRs is **abandonment (38%)** and **duplicates (23%)** — patterns **not captured by quantitative size/CI metrics**. The 25-PR replay confirmed size/test heuristics do not separate merged vs closed.

**What to research (not build):** whether “this is duplicate or unwanted work **before** a reviewer is taxed” is a job anyone has actually shipped as a **merge policy**, not an issue-comment bot. CodeRabbit issue-duplicate detection is adjacent occupancy. Graphite stacking is the incumbent answer to *size*. This remains **inside the GitHub gravity well**.

**Conservative status:** **Weak.** Less dead than the size heuristic; not empty; not a 3-week company on present evidence.

### Area 3 — Non-live reproduction of long-horizon failures that evals miss

**Why it showed up:** Canary Session died because Promptfoo **is** live rerun (docs updated the day of the kill test) and Chronicle (arXiv **17 Sep 2026**) argues a live re-run **rarely repeats**. Anthropic’s official postmortem confirms evals initially did **not** reproduce a stale-session bug — then listed **more evals**, soak, and prompt audit as their fix.

**What to research (not build):** whether there is a working reproduction object for config/prompt regressions that is **not** Promptfoo YAML and **not** a Chronicle clone. Chronicle is 23★ and four days old at time of this memo; treating that as whitespace would be building Chronicle.

**Conservative status:** **Nearly dead.** Listed only as the residual of Tests C/D. Do not “just build Chronicle.”

### What this section is not

CiteCheck’s remaining interesting class (real case, fake quote / wrong proposition) is **not** listed. Lexis Quote Check / Shepard’s already sell it; public existence checks are unsafe. Spec Triangle’s “oasdiff refused live” hole is **not** listed; Schemathesis/Postman filled it. Cursor FR 156247 is **not** listed; hooks and named partners occupy it.

If a second cycle cannot find a painful job **outside** Westlaw / Promptfoo / GitHub-merge / HumanLayer-Pipelock / OpenAPI-diff wells, the honest output is another zero-survivor report — not a forced product.

---

## What not to do next

- **No architecture.** No system diagrams, no MCP proxy design, no GitHub App spec, no OpenAPI fixture design.
- **No product code.** Do not touch `src/`. Do not swap the Afterhours stub for a model. Do not scaffold a sixth app.
- **No Afterhours brief.** The scaffold default (notes → shippable brief) remains rejected as generic productivity (`00`, `10`).
- **No generic agent.** AgentGPT / gpt-engineer graveyard still applies.
- **No overlay.** Overlay Fact Sheet + FTC accessiBe still apply.
- **No rebuilding** Promptfoo, oasdiff, signed action receipts, pre-merge checks, or citation verify — including “hosted visual of the same CLI,” “triangle of three existing tools,” “Mata paste box,” “mock agent + log,” or “files>40 required check.”
- **Do not write** `research/validation/08-next-step.md`. That file is only if a candidate survived to BUILD/CONDITIONAL architecture. None did.

Hackathon operational unknowns (unchanged, not product facts): prize checkbox / OpenAI credit issuance.

---

After attempting to kill these opportunities, none currently meet the evidence threshold. This is the evidence, this is what killed them, and this is what we need to learn in a second discovery cycle before writing a single line of product code.
