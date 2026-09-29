# Competitive landscape — second discovery cycle

**Date:** 21 September 2026  
**Scope:** Occupancy of Areas 1–3 and mandatory RF-1 competitors. FACT vs INFERENCE. Star counts via `gh` this day unless noted. Bodies via Jina / official `.md` / `gh issue view`. Exa free-tier **429** after earlier area passes — not used for new discovery this synthesis.

---

## Landscape map by mechanism

| Mechanism | Who occupies it | Relevance |
|---|---|---|
| External SoT lookup | AWS (Backup, SES, CloudTrail, S3), Stripe, HashiCorp/HCP, Argo CD, git-lfs, Debezium | Area 1 dead — SoT *is* the product |
| Restore / drift verification | AWS Backup restore testing, Veeam SureBackup, Spacelift/env0/Firefly, driftctl **2,662★** | WS-1/WS-4 |
| “Make humans look” / ownership | GitHub Copilot extra approval, CODEOWNERS, Backstage **34,462★**, Tenable/Wiz/ServiceNow, Scorecard **5,699★** | Area 2 |
| On-call handoff | PagerDuty, incident.io, Shiftctl, Opsgenie; clinical I-PASS | ST-5 |
| Prompt change control | Langfuse protected labels, PromptLayer RBAC | ST-6 |
| Code clone gates | dupehound **94★**, Deslop **47★**, Sonar/PMD | ST-7 |
| Research protocol registry | PROSPERO / Cochrane / OSF / INPLASY | ST-8 |
| Envelope / cut-point replay | Chronicle arXiv:2609.20625 (**23★**), OrcaReplay **259★**, Promptfoo **25,332★** (prior), VCR.py **3,010★**, Temporal **23,207★** | Area 3 class kill |
| Trace / session dashboards | Langfuse **34,891★** (prior), LangSmith, rrweb **20,194★** | Class kill |
| Full sandbox snapshot / pause | **Daytona** **71,741★**, **E2B** **13,901★** (+ docs snapshots/persistence), OpenSandbox **15,445★**, k8s agent-sandbox **3,973★** | **RF-1 kill** |
| Process C/R | CRIU **3,998★** (v4.2.1, 21 Jul 2026), Docker `checkpoint` **experimental**, mozilla rr **10,651★** | RF-1 weekend path |
| Pack filesystem for repro | ReproZip **362★** (Linux; FAQ: no remote server; DB after mutation) | RF-1 local remainder |
| Browser executable traces | Playwright **96,448★** `trace.zip` | RF-3 contrast |
| CUA archives | OSWorld **3,152★** traj+mp4+png | RF-3 occupied format |

---

## RF-1 competitors (fetched this synthesis)

### Daytona — full sandbox snapshots as product

**FACT:** `daytonaio/daytona` **71,741★** (21 Sep 2026). Engineering post 18 Sep 2026, Jina body: full Daytona sandbox snapshots; Go-Explore branch from restored machine; Terminal-Bench independent retry **17/25** vs snapshot branching **6/25**; planted SQLite task `staged-service-repair` at `/var/lib/inventory/store.db`: clean restart **0/5**, Git-diff **0/5**, full snapshot **4/5**; 24/24 restores; handoff cost ~190k vs ~90k tokens on a bad restore. Post frames snapshots as the answer when progress lives outside Git.

**INFERENCE:** A third-party “bounded capsule” demo that reprints 0/5 vs 4/5 is a book report on Daytona’s marketing experiment.

### E2B — snapshots, templates, pause/resume

**FACT:** `e2b-dev/E2B` **13,901★**. Docs `docs.e2b.dev/sandbox/snapshots` (Jina): FS + memory snapshots; one-to-many spawn; use cases explicitly include **checkpointing agent work**, rollback, fork, cache, share. Templates vs snapshots table: prefer templates when state is declarative (faster, compact memory). Persistence docs: pause saves FS+memory indefinitely; `keep_memory: false` = filesystem-only cold boot.

**INFERENCE:** Hosted RF-1 *is* an E2B/Daytona checkbox, not a greenfield company.

### OpenSandbox + Kubernetes agent-sandbox

**FACT:** OpenSandbox **15,445★**; kubernetes-sigs/agent-sandbox **3,973★**; issue **#949** (prior area fetch): portable OCI snapshot FR; cites OpenSandbox commit Job as prior art; local→cloud via `docker commit` already works.

### CRIU + Docker checkpoint

**FACT:** CRIU **3,998★**; criu.org Main_Page: v4.2.1 released 21 Jul 2026; integrated into Docker/Podman/K8s/LXC. Docker docs `checkpoint.md` (fetched): **experimental** `docker checkpoint create` / `docker start --checkpoint`; uses CRIU ≥2.0; known limitations (seccomp, external TTY).

**INFERENCE:** Weekend engineer path for “freeze the machine” is documented first-party CLI, not a research gap.

### aios #2027 — bind mounts vs overlay (evidence against unbounded commit)

**FACT:** `gh issue view` 21 Sep 2026: 22h sandbox outage; 3.37 GB writable layer; `docker commit` timeout; **zero of 19,796** changed paths under `/workspace` — real session data on bind mounts. Owner-ranked fix: bound caches onto bind mounts so they never enter the layer.

**INFERENCE:** The “bounded capsule” insight (pack mounts, not full overlay) is already the salvage runbook of an incumbent sandbox operator — an infra patch, not OFFGRID whitespace.

### ReproZip

**FACT:** FAQ (prior fetch): Linux packing only; cannot trace remote servers; packs DB *after* mutation. Does not close Mac/Cursor local-laptop RF-1 as a 3-week product.

---

## Area 1 / 2 occupancy (summary; details in `02`/`03`)

- **Backup/restore:** AWS Backup restore testing + Lambda validation hook; Veeam SureBackup; pgBackRest **4,393★**.
- **Live SHA:** Argo CD **24,211★**; Spring `/management/info`; Helios maintainers’ own curl gate.
- **Email:** SES event publishing; SendGrid Activity — Delivered ≠ inbox by design.
- **IaC drift:** HCP Terraform Standard; Spacelift; Firefly; driftctl.
- **Money:** Stripe PaymentIntent GET + payout reconciliation + undelivered webhook docs.
- **Audit:** CloudTrail event history; pgaudit **1,707★**.
- **Habituation / PR gates:** GitHub rulesets extra Copilot approval (prior kill).
- **xz/tarball:** OpenSSF / reproducible-builds / dishball — cyber class.
- **Ownership:** Backstage catalog; vuln scanners.
- **Handoff:** incident.io template; Shiftctl; PagerDuty Change Events do **not** notify (docs).
- **PROSPERO:** registry exists and does not block duplicates (BMJ Open 2022; Frontiers 2026).

---

## What is *not* a gap

| Claim | Reality |
|---|---|
| “Nobody snapshots agent sandboxes” | Daytona + E2B + OpenSandbox ship it |
| “Nobody can prove world state” | Every SoT has an API/console |
| “Nobody forces humans to look” | GitHub extra approval; clinical I-PASS; PD ack products |
| “Agent failures can’t be non-live” | Chronicle envelopes + Playwright traces + VM snapshots |

---

## Synthesis implication

Second-cycle competitive landscape is **incumbent-saturated** on every residual shape the kill phase left. The thin KEEP (RF-1) sits inside the densest new category (agent sandbox platforms), not outside it.

Do not treat WEAK rows as “almost competitors we can outrun.” They are residual jobs without a demonstrated product gap.
