# Area 3 — Non-live reproduction of long-horizon failures

**Date:** 21 September 2026  
**Cycle:** second discovery (not a product pick, not architecture, not code).  
**Question:** Can expensive, difficult-to-reproduce agent failures be converted into deterministic replayable artifacts **without reproducing the entire live environment**?  
**Method:** Adversarial. Search the failure mode first. Kill anything that is Promptfoo YAML, Langfuse session replay, Chronicle with a nicer UI, a trajectory evaluator, or a long-session replay dashboard. FACT vs INFERENCE labeled. Unknown stays Unknown. No application code.

**Tooling this pass:** agent-reach `doctor --json` first. GitHub via `gh` (`active_backend: null`; `gh` succeeded where listed). Web via Jina Reader. Exa via mcporter: **one** call succeeded, then free-tier 429. HN via Algolia. V2EX public API (no on-topic hits). Reddit backend **off**. Twitter CLI **not installed**. `agent-reach check-update`: **v1.5.0, current**.

---

## Class kills (do not reopen)

These are **not** numbered opportunities. They are the gravity well this area was born from.

| Class | Status | Why |
|---|---|---|
| Live rerun of a golden agent session | **KILLED** last cycle as Canary Session | Promptfoo **25,332★**, docs updated **21 Sep 2026**: Long-Horizon Tasks, coding-agent providers, `trajectory:*`, `cost`, GitHub Action. See `research/validation/03-canary-session.md`. |
| Cut-point / envelope record-replay of LLM and tool boundaries | **KILLED** as Chronicle clone | arXiv:2609.20625 (17 Sep 2026); `theagentplane/chronicle` **23★**. Paper: a live re-run **rarely repeats**. Full replay is bit-stable only when model calls are stubbed from a record. |
| Trace dashboard / session replay UI / dataset experiments | **KILLED** | Langfuse **34,891★** (prior cycle) sessions + datasets + `RegressionError` CI. LangSmith `agentevals` + backtests. Humanloop sunset 8 Sep 2025. |
| “VCR for agents / time-travel debugger” OSS junkyard | **KILLED as a category** | `gh search repos "agent record replay"` on 21 Sep 2026 returned a page of slogan clones: OrcaReplay **259★** (updated today), plus `agent-tape`, `agentgate`, `mimic-recording`, `moviola`, `ReTrace`, `backspin`, `agentvcr`, `agentlens`, `flightrec`, `agentsnap`, … mostly 0–1★. Same README: record, replay, fork, diff. |
| LLM-as-judge failure localization | **KILLED** | Microsoft AgentRx (critical-step judge); TrajDebug arXiv:2608.06346; Zheng et al. already killed Judge Swap CI in this repo. |
| rr / CRIU / Temporal *as the product* | Occupied adjacent | mozilla `rr` **10,651★**; CRIU **3,998★**; Temporal **23,207★**. Chronicle’s related work **cites** rr (O’Callahan 2017) and Temporal replay tests as the lineage it adapts. |

**INFERENCE (labeled):** the residual of Area 3, if any, is **not** “replay the model.” It is whether a **world-state object** (filesystem, database, sandbox rootfs, GUI, closed-IDE export) can travel without reconstituting production.

---

## Direct answer

**FACT ( mechanistically, in other domains):** yes. Non-live reproduction already exists as shipped artifacts:

- Playwright `trace.zip` (actions + DOM snapshots + network; `retain-on-failure` / `on-first-retry`). Playwright **96,448★**. Hosted viewer: trace.playwright.dev.
- Temporal event-history JSON + SDK replayer (workflow code vs recorded history). Temporal **23,207★**.
- VCR.py HTTP cassettes. `kevin1024/vcrpy` **3,010★**.
- ReproZip `.rpz` (Linux syscall trace → binaries/files bundle). `VIDA-NYU/reprozip` **362★**. Packing is **Linux-only**. Cannot trace a **remote** server; cannot snapshot DB *before* mutation.
- E2B sandbox snapshots (filesystem + memory) and templates (declarative). `e2b-dev/E2B` **13,901★**. Docs fetched 21 Sep 2026.
- Daytona full sandbox snapshots. `daytonaio/daytona` **71,741★**. Engineering post 18 Sep 2026.
- mozilla rr process record-replay. **10,651★**.
- CRIU checkpoint/restore. **3,998★**.
- rrweb session replay for the DOM. **20,194★**.
- Testcontainers throwaway deps. Java repo **8,739★**.
- Nix hermetic builds. `NixOS/nix` **17,755★**.

**FACT (agents specifically):** envelope-level non-live replay is already the Chronicle paper (four days old at this memo) plus a 259★ product (OrcaReplay) plus Promptfoo live-or-cache rerun. Cloud sandbox snapshots are already E2B/Daytona/OpenSandbox (**15,445★**) / kubernetes-sigs/agent-sandbox (**3,973★**).

**INFERENCE:** converting *agent* failures into deterministic artifacts without the live world is **already a crowded mechanism**, split across (a) stub the model/tools, (b) snapshot the VM, (c) cassette the HTTP, (d) pack the syscalls. The remaining *jobs* below are slices of (b) and “export from a closed IDE,” not a new layer.

**Unknown:** independent 2026 TAM for “agent failure capsules.” Not invented.

---

## Counts

| Status | n | IDs |
|---|---:|---|
| **KEEP** | 1 | RF-1 |
| **WEAK** | 3 | RF-2, RF-3, RF-4 |
| **KILLED** | 4 | RF-5, RF-6, RF-7, RF-8 |

Eight opportunities. None is a 3-week OFFGRID company on present evidence. RF-1 is the only KEEP and is **thin**.

---

## RF-1 — Bounded world-state capsule for progress that does not live in git or in LLM envelopes

**Status: KEEP (thin)**

**User.** Staff engineer (or sandbox-platform operator) whose coding agent did real work in a database, package install, or running service, then failed. Later-self or a teammate must restore **that machine state** without re-running the live agent and without `docker commit` of the entire writable layer (caches, apt, playwright browsers).

**Exact workflow.** After failure: emit a bounded artifact = workspace bind-mounts + named data dirs (e.g. SQLite at a known path) + env manifest (image digest, packages) **excluding** `/root` caches. Another process restores that artifact and continues or debugs. Not a Promptfoo rerun. Not a Chronicle envelope stub.

**Failure.** Git diff restores source and loses the warehouse DB. Transcript / tool envelopes record that `sqlite3` ran, not a bootable `/var/lib/inventory/store.db`. Retry from `S0` throws away hours. Full overlay commit is too large and times out (see RF-6 evidence).

**Frequency.** **Unknown** as a weekly job in the wild. **FACT:** Daytona constructed `staged-service-repair` (SQLite at `/var/lib/inventory/store.db`): from the same planted checkpoint and 200k remaining tokens, clean restart **0/5**, Git-diff **0/5**, full snapshot **4/5**. Successful snapshot continuations finished in ~21k–41k tokens. On ordinary Terminal-Bench file tasks the opposite held: independent retry **17/25** vs snapshot branching **6/25**. So the failure is **real and conditional**, not universal.

**Current workaround.** `docker commit` of the corpse; zip the laptop; `pg_dump` if you happen to know the path; share an incomplete IDE transcript; retry from scratch (often cheaper on file-centric tasks). aios salvage: host root, insurance copies of `/root` + `/etc`, then `docker rm` (RF-6).

**Existing software.** E2B snapshots + templates (docs: templates are faster when state is declarative; snapshots for live runtime). Daytona snapshots (the measurement above is *their* product blog). OpenSandbox **15,445★**. kubernetes-sigs/agent-sandbox **3,973★** + FR #949. ReproZip **362★**. CRIU **3,998★**. git. Testcontainers **8,739★**. Chronicle envelopes.

**Why existing software fails (the KEEP claim).** Hosted sandbox vendors occupy the case where the agent **already ran inside** E2B/Daytona. Local Cursor / Claude Code on a developer laptop is not that VM. ReproZip packing is Linux-only and **does not save pre-mutation DB state**; remote servers cannot be traced. Chronicle stubs **tool bytes**, which is the right CI object for “did the gate still fire,” and the **wrong** object for “the next agent needs the mutated SQLite.” git is the object people actually share; Daytona measured that it is insufficient when the verifier’s truth is outside the repo.

**Evidence (URLs, fetched 21 Sep 2026).**

- https://www.daytona.io/dotfiles/snapshots-as-search-states-go-explore-with-daytona (18 Sep 2026; 0/5 vs 4/5; 17/25 vs 6/25)
- https://docs.e2b.dev/sandbox/snapshots (templates vs snapshots; checkpoint/rollback/fork)
- https://github.com/eumemic/aios/issues/2027 (3.37 GB overlay; bind mounts held the real session data)
- https://docs.reprozip.org/en/stable/faq.html (Linux pack; remote server; DB after mutation)
- https://arxiv.org/html/2609.20625 (Chronicle: envelopes, not rootfs)

**Economic impact.** aios: **22 hours** of total sandbox loss on one session (RF-6). Daytona: tens of thousands of tokens saved **when** the DB was the missing state. Independent TAM: **Unknown**. Do not cite a market size.

**Technical opportunity.** Overlay-aware packer: include bind-mounted workspace and declared data paths; exclude package caches; emit tar/OCI + manifest. Deterministic restore. Optional: derive the include-list from the agent’s file/tool log rather than from a human who does not know what was touched.

**Non-AI.** The packer is tar/overlay/OCI. Product-without-AI is strong.

**AI.** Optional “what did this session touch?” from a tool log. Not required. LLM-as-selector of checkpoints is RF-4 and is weaker.

**Security/privacy.** The capsule **is** the customer database and `.env`. Sharing it is a data-handling product, not a zip file. Hosted restore is a SOC-2 sale.

**Three-week feasibility.** Fixture SQLite + docker restore: **weekend**, and it is a book report on the Daytona chart. Local macOS Cursor packer (FSEvents/DTrace, not a container): **Extremely hard**. Hosted demo of E2B snapshot: **wrapper**.

**Demo possibility.** 20-second 0/5 vs 4/5 on a planted DB is judge-legible **and already published by Daytona**. Repeating it is fixture theater (`09` kill pattern).

**Post-hackathon potential.** Absorbed as a checkbox on E2B templates-vs-snapshots, Daytona, or agent-sandbox SnapshotProvider. Independent company: **unlikely**.

**Strongest reason NOT to solve it.** The measurement that makes the problem real was published by the incumbent that already snapshots sandboxes. The local-laptop remainder is OS-tracing on Mac/Windows, which ReproZip declined. A 3-week demo that is not Daytona’s chart is a docker-compose of SQLite.

---

## RF-2 — Closed-IDE export is not an executable failure object

**Status: WEAK**

**User.** Professional using Cursor (or similar closed coding agent) who must file a bug, hand off to a teammate, or send a vendor Request ID. They believe “Export Transcript” is the repro.

**Exact workflow.** Finish a long agent session that ran terminal commands and edited files → Export Transcript / share JSONL → expect the receiver to see commands, file bodies, terminal I/O → they do not.

**Failure.** Export is **text parts of the conversation**. Agent commands, file edits, terminal I/O, thinking, git commits are omitted. Staff confirmed this as a **known issue**, no ETA (25 Mar 2026). Earlier thread (28 Jan 2026): multi-megabyte transcripts became kilobyte summaries after ~16 Jan 2026. JSONL (separate staff thread, prior cycle) stores tool **inputs** separately from assistant text; collapsed terminal I/O is omitted from export.

**Frequency.** Repeated public reports Jan–Jul 2026 on the Cursor forum (150214 still receiving posts in Jul 2026 per the fetched thread). Not a one-off.

**Current workaround.** Copy Request ID for staff; ask to DM the transcript; screenshots of the collapsible command pane; paste summaries into a new chat; hope the vendor can see server-side logs the user cannot.

**Existing software.** Cursor Export Transcript (first-party, incomplete). Cursor hooks (`postToolUse`, `beforeShellExecution`) — prior-cycle Action Receipt kill: partners already sit here. Claude Code plaintext transcripts under `~/.claude/projects/` (prior cycle). Chronicle / OrcaReplay if you instrument **your** agent, not Cursor. Langfuse if you wrap.

**Why existing software fails.** The painful job is **inside a closed product the user does not instrument**. Hooks are the vendor-shaped answer and were the Action Receipt occupancy. Chronicle cannot attach to Cursor without those hooks. Export is the object users actually try to share; staff say it is not that object.

**Evidence.**

- https://forum.cursor.com/t/transcripts-no-longer-exported-in-full/150214 (user + staff deanrie, Jan 2026; thread still live months later)
- https://forum.cursor.com/t/exporting-transcript-doesnt-export-agent-commands/155837/4 (staff: “Transcript export currently doesn’t include agent tool calls like terminal commands and file edits, it only exports the text parts”; related to 150214; no ETA)
- Prior cycle: https://forum.cursor.com/t/accessing-the-full-agent-transcript-in-cursor/157311 (JSONL = messages + assistant text + tool inputs only)

**Economic impact.** Unknown. Users said it does **not** stop them using Cursor. That is a weak WTP signal.

**Technical opportunity.** An out-of-process capsule from hooks: commands + diffs + env. That sentence is **Action Receipt / Pipelock / Obsigna**, already **KILLED**.

**Non-AI.** Yes (log the tools).

**AI.** None required.

**Security/privacy.** Full command export is secret-bearing (the reason vendors collapse it). User in 150214 asked to **DM** a transcript — they already treat it as too sensitive for the public thread.

**Three-week feasibility.** Hook → zip: weekend, occupied. Parsing Cursor JSONL and calling it a product: afternoon, and staff already described the file.

**Demo possibility.** Split view “chat said X / export omitted the `ls`.” Judge-says-no: “that’s a Cursor bug, star the forum thread.”

**Post-hackathon potential.** Cursor ships export. Zero.

**Strongest reason NOT to solve it.** It is a first-party export bug with staff acknowledgement. Wrapping hooks is the killed Action Receipt category. Weak KEEP only because the **shareable object** users reach for is empty, which is a real failure-reproduction hole — owned by the IDE.

---

## RF-3 — Computer-use failures are archived as screenshots and MP4, not as executable traces

**Status: WEAK**

**User.** Researcher or applied engineer debugging a long-horizon computer-use / GUI agent (OSWorld-class). Task ran 1+ hours, hundreds of clicks, failed. They have a video and `traj.jsonl`. They cannot **replay** the GUI the way Playwright replays a `trace.zip`.

**Exact workflow.** Failed CUA run → open `recording.mp4` + `step_N.png` + `traj.jsonl` (`pyautogui.click(x,y)`) → try to reproduce the same UI state on a fresh VM → coordinates miss, streaming UI moved, accessibility tree differs.

**Failure.** Screenshot journals and coordinate clicks are **observations**, not a restore primitive. OSWorld 2.0 (site fetched via search + repo this pass) describes workflows with median **~1.6 hours** human time and **~318 tool calls** (Claude Opus 4.7, vendor/benchmark claim — treat as the benchmark’s own number, not independent TAM). Streaming / dynamic environments are an explicit challenge class. Playwright traces restore DOM snapshots per action; CUA stacks generally do not emit them.

**Frequency.** Unknown in production SaaS. **FACT:** OSWorld is a standard CUA bench; `xlang-ai/OSWorld` **3,152★**; `OSWorld-V2` **324★**. Eval result datasets on Hugging Face store traj + screenshots + `recording.mp4`, not Playwright traces.

**Current workaround.** `manual_examine.py`; watch `recording.mp4`; keep the original VM if you still have it; rerun the task (live, expensive, non-replay).

**Existing software.** Playwright traces **96,448★** + trace.playwright.dev. rrweb **20,194★**. Sentry/FullStory-class session replay (not re-fetched this pass; occupied category). OSWorld’s own traj/screenshot/mp4 bundle. Browserbase / computer-use vendors (not fully fetched; occupancy **INFERENCE**). E2B/Daytona VM snapshots if the CUA ran in their sandbox.

**Why existing software fails.** Playwright requires the test to have been a Playwright script. CUA agents emit `pyautogui` / screenshot observations. rrweb requires JS injection into the page, not the desktop (LibreOffice, VS Code, Thunderbird are OSWorld domains). VM snapshot (RF-5/E2B) restores the machine but is not a 20-second DOM time-travel of one click. Chronicle envelopes do not restore pixels.

**Evidence.**

- https://github.com/xlang-ai/OSWorld (README: results include screenshots, actions, video)
- https://osworld-v2.xlang.ai/ (long-horizon; 318 tool calls claim on that page)
- https://playwright.dev/docs/trace-viewer (`trace.zip`, `on-first-retry`, DOM snapshots)
- Hugging Face UI-MOPD/OSWorld-Eval-Results layout: `traj.jsonl` + `recording.mp4` + `step_N.png` (search snippet; dataset page not fully Jina’d — **Medium** reliability)

**Economic impact.** Unknown. Benchmark compute is expensive; that is not WTP for a product.

**Technical opportunity.** Compile CUA steps into a Playwright-like snapshot log (a11y tree + screenshot + action) that a viewer can step **without** the live VM. That is **OSWorld’s existing result directory plus a nicer viewer** — dashboard-shaped, forbidden class.

**Non-AI.** Viewer is non-AI. Replaying `pyautogui` against a live desktop is not deterministic.

**AI.** A judge over screenshots is AgentRx/TrajDebug — killed class.

**Security/privacy.** Desktop recordings are full-PII (email clients are an OSWorld domain).

**Three-week feasibility.** Hosted mp4 + image stepper: **yes**, and it looks like a homework trace viewer. True DOM-equivalent replay of LibreOffice: **no**.

**Demo possibility.** Scrub a failed OSWorld `recording.mp4`. Judges who know Playwright ask where the `trace.zip` is.

**Post-hackathon potential.** Feature of OSWorld / Browserbase / the CUA vendor.

**Strongest reason NOT to solve it.** The archive format already exists (png+mp4+jsonl). The missing bit is Playwright’s restore semantics on a **desktop**, which is a research VM problem, not a 3-week app. Session-replay UI is an explicit forbid.

---

## RF-4 — Which checkpoint is the failure? Minirepro / selection, not recording

**Status: WEAK**

**User.** Team that **already** snapshots (Daytona/E2B) or already records envelopes (Chronicle) and still cannot cheaply turn a 2-hour failure into a **minimal** failing artifact.

**Exact workflow.** Long failed trajectory with many snapshots or many envelope crossings → pick the smallest prefix / snapshot from which a fresh agent still fails (or from which a child should continue) → check that into CI.

**Failure.** Recording is the easy half. **Selection** is the hard half. Daytona, in writing: deciding which state to restore was “one of the harder parts”; activity signals ≠ verifier; snapshots **preserve mistakes**; child inherits the machine but not the parent’s understanding (handoff cost: one restored child ~**190k tokens / 26 steps** vs a successful fresh retry ~**90k**). Chronicle’s contribution is cut-point choice for **code** changes, not minimization of world state. Delta debugging (Zeller) and C-Reduce exist for programs, not agent worlds.

**Frequency.** Unknown professionally. Documented as the failure mode of snapshot-search in a **18 Sep 2026** vendor experiment (n=25 file-task pairs where snapshot search **lost**).

**Current workaround.** Human picks a snapshot by gut; retry from scratch (won 17/25 on file tasks); keep the whole VM; paste the last N messages.

**Existing software.** Daytona snapshot archive + Go-Explore loop (their post). E2B list/delete snapshots. Chronicle cut-point replay (code, not FS). AgentRx / TrajDebug (LLM localizes a step — judge class). C-Reduce / Lithium / Perses (program reduction). Playwright trace is already scoped to one test, not a 318-step CUA.

**Why existing software fails.** Incumbents snapshot; they do not ship a **minimizer** that is not an LLM judge. Human selection is the ugly workaround. That is not yet a product gap with buyers — it is an unsolved research knob Daytona named.

**Evidence.**

- Daytona post (handoff cost, sticky wrong state, weak selection, 17/25 vs 6/25)
- https://arxiv.org/html/2609.20625 (cut-point is for live vs recorded **boundaries**)
- Microsoft AgentRx GitHub (LLM judge on critical step — occupancy of “localize,” not minimize-the-world)

**Economic impact.** Token waste on bad restores (Daytona: 190k vs 90k anecdote). Not a budget line.

**Technical opportunity.** ddmin over restore-and-reverify, with a **non-LLM** verifier (tests, SQLite assertion). Research-shaped.

**Non-AI.** ddmin + verifier is non-AI. That is also why it looks like a compiler homework.

**AI.** Using a model to pick the snapshot reintroduces judge bias.

**Security/privacy.** Same as holding N snapshots of customer state.

**Three-week feasibility.** Demo ddmin on a toy FS: yes, homework. On real Cursor sessions: no.

**Demo possibility.** “We hid the bug in snapshot 7 of 12.” Cute. Not a painful professional job with a named buyer.

**Post-hackathon potential.** Paper or a flag on Daytona.

**Strongest reason NOT to solve it.** Daytona already described the problem in the same post that sells snapshots. Localization papers occupy “which step.” Minimization without a deterministic verifier is flake (Canary kill test D).

---

## RF-5 — Portable sandbox rootfs as an OCI image (cloud ↔ laptop)

**Status: KILLED**

**User.** Platform team running developer sandboxes on Kubernetes who also want Docker-on-laptop, both directions.

**Exact workflow.** Cloud sandbox → commit rootfs to a registry → `docker pull` on the laptop (and the reverse, which already works via local `docker commit` + push).

**Failure.** Cloud → local is **blocked**: no in-cluster commit-and-push of the running container to a portable OCI image. GKE Pod Snapshot is GKE-only and not an OCI image. PVC suspend is a volume, not a runnable image.

**Frequency.** Named by an internal platform for **~800 engineers** (issue author’s claim, not independently counted).

**Current workaround.** **local → cloud already:** `docker commit` locally, push to shared registry, schedule a Pod from that image. Cloud → local: cannot. Ugly, privileged, and they are asking SIG to build it.

**Existing software.** kubernetes-sigs/agent-sandbox **3,973★**, issue **#949** (open, `priority/important-longterm`), 0 comments at fetch. OpenSandbox **15,445★** already implements commit Job + containerd socket + registry push (cited as prior art in #949). E2B snapshots (cloud, not laptop OCI). Daytona. `docker commit`.

**Why existing software fails.** It does not, as a *category*. The gap is a **pluggable SnapshotProvider** on a CNCF/k8s SIG repo with a public reference implementation. That is a contribution, not an OFFGRID product.

**Evidence.** https://github.com/kubernetes-sigs/agent-sandbox/issues/949 (fetched body, 21 Sep 2026).

**Economic impact.** Engineering hours on an 800-person internal platform. Not a startup TAM.

**Technical opportunity.** Privileged node Job + nerdctl/containerd commit + registry credentials. Security-sensitive; issue says off-by-default.

**Non-AI.** Entirely.

**AI.** None.

**Security/privacy.** Node-level runtime access; registry credentials; image contains the developer’s disk.

**Three-week feasibility.** A toy `docker commit && docker push` demo: hours. Production SnapshotProvider: a k8s SIG design review.

**Demo possibility.** Looks like a Kubernetes homework.

**Post-hackathon potential.** Merge into agent-sandbox. That is success-as-patch, not a company.

**Strongest reason NOT to solve it.** The users already named the incumbent repo and the reference implementation. Building it here is wrapping OpenSandbox’s commit Job.

---

## RF-6 — Full-overlay `docker commit` as the reproduction / salvage object

**Status: KILLED** (as a product). Kept as **evidence** that naive “snapshot the world” **fails operationally**.

**User.** Operator of a long-lived agent sandbox (aios/Ultron class) whose container OOM-kills and must be salvaged.

**Exact workflow.** Corpse → `_snapshot_and_record` → `docker commit` writable layer → restore later.

**Failure two ways.**

1. **Oversized layer:** 3.37 GB writable layer (caches in `/root` + apt/pip/npm into `/usr`) cannot commit in a 67s CLI timeout → salvage breaker stays open → **22h production outage** (2026-07-23→24). Real session data was on **bind mounts** (`/workspace` 16 GB, session repos, `/mnt/memory`) — the committable layer was the wrong object. Recovery: host root, copy `/root`+`/etc`, `docker rm`. Agent spent hours theorizing because the timeout reason was host-only.
2. **Poison snapshot:** durable snapshot faithfully committed a broken (empty-PATH) container; every resume crashlooped and **re-committed** the broken state. Fix that shipped in code did not help until an operator `UPDATE sessions SET snapshot_ref=NULL`. Faithful record of a bad world is not a repro; it is a crashloop.

**Frequency.** aios: this incident plus a named prior corpse `73b8a19c3b7c` (same session class). Not a broad survey.

**Current workaround.** Host root. SQL to null the snapshot pointer. Bound caches onto bind mounts so they never enter the layer (their own recommended fix).

**Existing software.** `docker commit`. CRIU. E2B pause (`memory: false` = filesystem-only cold boot — they already split memory vs disk). E2B templates vs snapshots (templates restart guest OS so memory is compact; snapshots fragment). PraisonAI #3670 wants capture-after-setup via the same `docker commit` primitive.

**Why existing software fails.** Full-layer commit is the **wrong artifact size and fidelity**. Vendors already document the split (templates vs snapshots; bind mounts vs overlay; poison health-gate as a 50-line check). A startup that “does salvage better” is an infra patch on aios.

**Evidence.**

- https://github.com/eumemic/aios/issues/2027
- https://github.com/eumemic/aios/issues/937
- https://docs.e2b.dev/sandbox/snapshots (template compactness vs snapshot fragmentation)

**Economic impact.** **22 hours** sandbox loss, documented. That is an incident, not a market.

**Technical opportunity.** Health-gate + timeout-by-layer-size + bind-mount caches. aios already listed the ranked fixes.

**Non-AI.** Yes.

**AI.** None.

**Security/privacy.** Root on the host to clear a breaker.

**Three-week feasibility.** Not a hosted wow.

**Demo possibility.** Cannot demo a 22h outage honestly.

**Post-hackathon potential.** None as a company.

**Strongest reason NOT to solve it.** The issue *is* the runbook. Shipping it as OFFGRID software is a docker-timeout wrapper. Use it only as evidence that **unbounded snapshots are not the Area 3 answer**.

---

## RF-7 — Freeze the stale session / KV-cache / idle-hour bug as an artifact

**Status: KILLED**

**User.** Lab or platform engineer trying to reproduce a quality regression that **evals did not catch** because it required a stale session.

**Exact workflow.** Capture the exact cache/session blob that made the model “forgetful, repetitive, odd tool choices” after one idle hour → reload it after a prompt/config change → assert.

**Failure.** Anthropic official postmortem (23 Apr 2026, previously unconfirmed in `10`, confirmed last cycle and not re-litigated): 26 Mar 2026 cache/idle thinking-clear bug; “neither our internal usage nor **evals initially reproduced** the issues”; “only happening in a corner case (stale sessions).” Their going-forward fix: broader eval suite, soak, prompt-change audit — **more evals**, not a third-party cache artifact.

**Frequency.** One documented lab incident with three product-layer causes. Not a customer-facing weekly job.

**Current workaround.** You cannot. If you do not own the inference stack, you do not snapshot KV-cache. Live rerun misses it (Promptfoo/Canary). Envelope stub (Chronicle) **hides** it by not calling the model.

**Existing software.** Provider eval suites. Promptfoo. Langfuse. Chronicle (wrong layer). CRIU of the **client** process does not include remote cache.

**Why existing software fails.** The object is **inside the model provider**. A 3-week app cannot freeze Anthropic’s cache. Chronicle/Promptfoo are the wrong altitude; that is why Canary died and why this is not a resurrection.

**Evidence.** https://www.anthropic.com/engineering/april-23-postmortem (fetched last cycle, 21 Sep 2026; not re-fetched this pass — cite as already-inspected). Chronicle abstract: live rerun rarely repeats.

**Economic impact.** Provider-scale quality incident. Not a tool budget.

**Technical opportunity.** None that is not “be Anthropic.”

**Non-AI.** Capture would be infra.

**AI.** N/A.

**Security/privacy.** Session blobs are user prompts.

**Three-week feasibility.** No.

**Demo possibility.** Book report on the postmortem (Canary’s original demo sin).

**Post-hackathon potential.** Zero.

**Strongest reason NOT to solve it.** Official owner already claimed the fix. Envelope replay would **not** have caught it. This kill protects Area 3 from becoming Canary with extra steps.

---

## RF-8 — Hermetic capture-after-setup so evals/CI do not reinstall the world every run

**Status: KILLED**

**User.** Agent-framework maintainer or eval engineer whose environment definition re-runs `packages` + `setup:` on every provision (minutes), so “reproducible env” made every run **slower**.

**Exact workflow.** Hash the environment definition → if hit, start from captured image/snapshot → optional cheap `refresh:` → run the agent/eval.

**Failure.** Without capture, every worker pays full pip/npm/playwright install. With naive capture, you get RF-6.

**Frequency.** Named in PraisonAI #3670 (closed as an enhancement they intend to wire). Common in CI generally (Docker layer cache, Nix, Testcontainers).

**Current workaround.** Docker layer cache; rebuild from base; cloud sandbox that already snapshots; “sandbox recreate” that **deletes** rather than captures (PraisonAI today).

**Existing software.** E2B templates (declarative, recommended over snapshots for this). Daytona. `docker commit` / BuildKit cache. Testcontainers **8,739★**. Nix **17,755★**. Bazel. Devcontainers. PraisonAI’s own issue: E2B/Daytona SDKs **already support** snapshot/pause and their adapters **never call them** — wiring, not a gap.

**Why existing software fails.** It does not. The issue is an integration TODO.

**Evidence.** https://github.com/MervinPraison/PraisonAI/issues/3670 ; E2B snapshots vs templates table; Testcontainers/Nix star counts this pass.

**Economic impact.** CI minutes. Not a company.

**Technical opportunity.** `definition_hash` → `docker commit`. They wrote the TDD list.

**Non-AI.** Yes.

**AI.** None.

**Security/privacy.** Cached images contain whatever setup downloaded.

**Three-week feasibility.** Fatal wrapper.

**Demo possibility.** Second run is faster. That is Docker.

**Post-hackathon potential.** None.

**Strongest reason NOT to solve it.** Copy-me is the PraisonAI issue body plus `docker commit`. Originality = 0.

---

## Also inspected, not numbered

| Topic | Outcome |
|---|---|
| Temporal replay tests for agent workflows | Chronicle related work already claims this lineage. aios #795 (closed) implements `HOST_SEMANTICS_EPOCH` so in-flight runs fail honestly when the **engine** that replays the journal changes. That is Temporal discipline inside one product, not a vacancy. |
| VCR.py / HTTP cassettes for tools | **3,010★**. Chronicle envelopes are the agent-native form. Not a gap. |
| mozilla rr for the agent process | **10,651★**, not a 3-week browser demo, poor fit for GPU/Mac/remote model. |
| CRIU Claude SDK handoff repo `lwhere1314/claude-sdk-criu-handoff` | Listed by `gh search`; GraphQL/README **403** this pass (sandbox). Existence of a canary repo is occupancy, not a read. **Do not overclaim.** |
| tianpan.co “incident ticket with no repro steps” (17 May 2026) | WebSearch snippet was rich; **Jina fetch returned 404**. **Not used as evidence.** |
| AmtocSoft blogspot “time-travel patterns” | SEO-shaped; LangGraph + Streamlit debugger. **Not used as occupancy or as pain.** |
| DEV.to “You can’t reproduce your agent’s bugs” + AgentLens | Vendor essay selling a tracer + scorer. Class-kill (evals). |
| Exa query 1 (Heisenbug) | Partial hits; then **429**. |
| V2EX hot + programmer node | No on-topic threads this pass. |
| HN Algolia `cannot reproduce agent failure` | Essentially empty (1 off-topic hit). `reproducibility LLM` surfaced Pipelex (declarative workflows), not capsules. |

---

## Cross-cutting verdict

Area 3’s motivating sentence is true as **physics** (live agent reruns do not reproduce; Anthropic evals missed a stale session; Daytona git diffs miss DBs) and false as an **unsolved product job**.

The non-live artifacts that already exist:

1. **Envelopes** — Chronicle / OrcaReplay / VCR / Temporal history / Promptfoo cache.  
2. **Machines** — E2B / Daytona / OpenSandbox / docker commit / CRIU / k8s SnapshotProvider FR.  
3. **Browsers** — Playwright `trace.zip` / rrweb.  
4. **Syscalls** — ReproZip (Linux) / rr.

RF-1 is the only KEEP: a **bounded** capsule of outside-git state, because unbounded commit is operationally lethal (RF-6) and envelopes do not restore SQLite. It is thin because Daytona and E2B already sell the hosted form, and the local-laptop form is ReproZip’s unsolved Mac/remote-server case.

Do not build: Promptfoo YAML, Langfuse, Chronicle UI, OSWorld mp4 viewer, `docker commit` as a service, Cursor export clone, KV-cache fanfic.

---

## What this file does not do

Does not pick a product. Does not start `src/`. Does not resurrect Canary Session. Does not design a snapshot format. Does not claim TAM.
