# Competitive destruction — second discovery cycle

**Date:** 21 September 2026  
**Stance:** Adversarial. Prefer kill. Do not invent survivors. FACT vs INFERENCE. Unknown stays Unknown.

**Tooling this pass:** agent-reach `doctor --json` (gh warn / Exa configured then **429** / Jina OK / Reddit off / Twitter CLI missing). Jina Reader; `gh repo view` / `gh issue view` / `gh search`; Docker checkpoint `.md`; Cursor WebSearch for CRIU/Docker confirmation. `agent-reach check-update`: **v1.5.0, current**.

---

## Mandatory RF-1 kill tests

**Target:** RF-1 — bounded world-state capsule for progress that does not live in git or in LLM envelopes (`04-replayable-failures.md`, was KEEP thin).

### Test 1 — Is Daytona / E2B already the product?

**KILL. FACT.**

- Daytona post 18 Sep 2026 (Jina): full sandbox snapshots; SQLite outside git is *their* showcase (0/5 clean, 0/5 git-diff, **4/5** snapshot); they sell restoring machine state as search infrastructure.
- E2B docs (Jina): snapshots include filesystem + memory; documented use case **“Checkpointing agent work”**; templates vs snapshots guidance; pause/resume persistence.
- Stars this day: Daytona **71,741★**, E2B **13,901★**.

Hosted “emit a capsule of the sandbox so the next agent continues” is the incumbent pitch, not a wedge.

### Test 2 — Is “snapshot the sandbox” a category with many vendors?

**KILL. FACT.**

Same-day occupancy: Daytona, E2B, OpenSandbox **15,445★**, kubernetes-sigs/agent-sandbox **3,973★** (+ FR #949), CRIU **3,998★**, Docker experimental checkpoint, ReproZip **362★**, mozilla rr **10,651★**. Envelope layer separately crowded (Chronicle, OrcaReplay **259★**, Promptfoo).

This is a **crowded category**, not an empty job.

### Test 3 — Can a competent engineer reproduce the core in a weekend with docker commit / volumes / CRIU?

**KILL. FACT + INFERENCE.**

- **FACT:** Docker `checkpoint` CLI is documented (experimental) and uses CRIU; `docker commit` + bind-mounted volumes is the aios salvage path.
- **FACT (aios#2027, `gh issue view`):** real durable data already lived on bind mounts (`/workspace`, session repos); the 3.37 GB overlay was caches; recovery was host copy of mounts + `docker rm`.
- **INFERENCE:** A demo “pack SQLite path + env manifest, restore, continue” is a `tar` of declared paths plus an image digest — weekend homework that reprints Daytona’s chart. A production multi-tenant capsule product is *not* a weekend; that difficulty lives inside Daytona/E2B, not as OFFGRID whitespace.

### Test 4 — Is the 30-second demo just “we took a snapshot”?

**KILL. FACT.**

The only honest wow RF-1 has is Daytona’s own 0/5 vs 4/5 on a planted warehouse DB. Rebuilding that fixture is **fixture theater** of an incumbent blog post. Judges who read agent infra will name Daytona/E2B.

### Test 5 — Privacy: does the demo require private agent state?

**KILL. FACT (from area file) + INFERENCE.**

The capsule **is** the customer database and often `.env`. Hosted restore is a SOC-2 sale. Public demo with fixtures looks like tutorial CRUD; demo with real state is a privacy non-starter for OFFGRID judges clicking a URL.

### Test 6 — Post-hackathon: Daytona feature or a company?

**KILL. INFERENCE grounded in FACT.**

Daytona’s conclusion is that snapshots turn the sandbox into part of the search algorithm — their roadmap language. E2B already lists checkpoint/fork/share. OpenSandbox and agent-sandbox #949 are the k8s port. Independent company probability: **unlikely**. Absorption probability: **high**.

---

## RF-1 verdict

| Test | Result |
|---|---|
| Daytona/E2B already the product? | **KILL** |
| Snapshot category crowded? | **KILL** |
| Weekend docker/volumes/CRIU? | **KILL** |
| Demo = we took a snapshot? | **KILL** |
| Privacy / private state? | **KILL** |
| Post-hackathon company? | **KILL** |

**RF-1: KILLED.** Demote from KEEP. Shortlist must not include it.

---

## Destruction of WEAK rows that look concept-shaped

Tried the same attacks (“already solved / not painful enough / not 3 weeks / incumbent copies / demo theater”).

| ID | Attack that lands | Outcome |
|---|---|---|
| WS-1 restore test | AWS Backup + Veeam; leftover is documented Lambda hook | Stay **WEAK**; do not concept |
| WS-2 live SHA | Helios issue *is* the product text; Argo owns comparison | Stay **WEAK**; do not concept |
| ST-4 runtime ownership | Entire VM industry; Equifax is process failure | Stay **WEAK**; do not concept |
| ST-5 handoff | Shiftctl/incident.io; Sheets is workaround not empty category | Stay **WEAK**; do not concept |
| ST-8 zombie protocols | PROSPERO refuses gating; liveness = email author | Stay **WEAK**; do not concept |
| RF-2 IDE export | First-party Cursor bug; hooks = Action Receipt kill class | Stay **WEAK**; do not concept |
| RF-3 CUA traces | Archive format exists; executable desktop restore is research VM | Stay **WEAK**; do not concept |
| RF-4 checkpoint pick | Daytona named selection hardness; AgentRx/TrajDebug occupy “localize” | Stay **WEAK**; do not concept |

No WEAK row upgrades to KEEP. None earns a concept card.

---

## Area-level destruction (confirm)

| Area | Destruction result |
|---|---|
| 1 | Confirmed dead — SoT vendors |
| 2 | Confirmed dead — socio-technical gravity wells |
| 3 | Envelope replay dead; machine snapshot dead via RF-1 tests; no residual KEEP |

---

## Concepts generated then killed

**Zero concepts were written.** Nothing survived long enough to deserve a `06` card. Hypothetical “BoundCapsule / SnapPack / WorldTar” names were **not** developed — naming would invent a product to fill the vacuum.

---

## Final destruction scoreboard

- Problems catalogued: **24**
- KEEP after destruction: **0**
- WEAK retained (not shortlisted): **8**
- KILLED: **16** (includes RF-1)

**Do not start architecture. Do not write a next-step design file.**
