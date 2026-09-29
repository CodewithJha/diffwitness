# Second discovery cycle — problem discovery synthesis

**Date:** 21 September 2026  
**Cycle:** Second discovery (Areas 1–3). Adversarial. No product. No architecture. No `src/`.  
**Method:** Synthesis of `02-world-state-evidence.md`, `03-socio-technical-failures.md`, `04-replayable-failures.md`. Do not invent shallow new problems. FACT vs INFERENCE labeled. Unknown stays Unknown.

**Prior cycle:** Five candidates killed (CiteCheck, Action Receipt, Canary Session, Spec Triangle, Merge Preflight). Do not resurrect them or their renames.

---

## What we investigated

Three residual problem *shapes* left after the kill phase — not product pitches:

| Area | Question | Files |
|---|---|---|
| **1** | Can we prove what happened in the external world without trusting the agent’s logs? | `02` |
| **2** | Why do technically valid changes fail because humans do not notice, understand, trust, own, or act? | `03` |
| **3** | Can expensive long-horizon agent failures become deterministic artifacts without reconstituting the live world? | `04` |

**Class forbids carried in:** Action Receipt / MCP receipts; Merge Preflight / CODEOWNERS / comment bots; Promptfoo / Chronicle / Langfuse session replay / trajectory judges; Afterhours notes→brief; overlays; cyber builds.

---

## Area verdicts (pre–competitive destruction)

| Area | KEEP | WEAK | KILLED | Verdict |
|---|---:|---:|---:|---|
| 1 World-state SoT | 0 | 2 | 6 | Dead as product well — vendor SoT already ships lookup |
| 2 Socio-technical | 0 | 3 | 5 | Dead as product well — GitHub / PD / CMDB / PROSPERO occupy |
| 3 Replayable failures | 1 (RF-1, thin) | 3 | 4 | Envelope replay is Chronicle/Promptfoo; RF-1 only KEEP |

**Catalog totals before RF-1 destruction:** **1 KEEP · 8 WEAK · 15 KILLED** across **24** numbered opportunities.

**After mandatory RF-1 kill tests (`07-competitive-destruction.md`):** **0 KEEP · 8 WEAK · 16 KILLED.** RF-1 demoted to KILLED.

---

## Problem opportunities (15–20 from Areas 1–3 only)

Statuses below are **post-destruction** for RF-1; others match the area files.

### From Area 1 — world-state evidence

| ID | Problem | Status | One-line why |
|---|---|---|---|
| WS-1 | Backup job green, artifact unrestorable | **WEAK** | Pain real (GitLab 2017); AWS Backup / Veeam already sell restore testing |
| WS-2 | Deploy/CI green, live fleet another identity | **WEAK** | Helios#1048 already proposes SHA curl; Argo *is* Git vs live |
| WS-3 | Email Send* 200 / MessageId ≠ ESP events ≠ inbox | **KILLED** | SES/SendGrid events are the SoT; post-`250` inbox unobservable |
| WS-4 | IaC state vs live cloud | **KILLED** | HCP/Spacelift/env0/Firefly/driftctl |
| WS-5 | App DB vs payment-provider objects | **KILLED** | Stripe first-party recon; prior-cycle reject |
| WS-6 | Git LFS pointer vs missing blob | **KILLED** | `git lfs fsck` *is* the verifier |
| WS-7 | Dual-write DB vs outbound event | **KILLED** | Outbox + Debezium |
| WS-8 | Independent mutation proof from WAL/CloudTrail | **KILLED** | SIEM / CloudTrail / pgaudit; Action Receipt leftover occupied |

### From Area 2 — socio-technical

| ID | Problem | Status | One-line why |
|---|---|---|---|
| ST-1 | Reviewers habituate on agent PRs | **KILLED** | Extra Copilot approval + Merge Preflight residual |
| ST-2 | Humans review git; install is tarball | **KILLED** | Cyber + dishball/`diff -r`; forbidden class |
| ST-3 | “Reviewed” attestations without a look | **KILLED** | Scorecard bug (#370), not a company |
| ST-4 | CVE alert to everyone = to no one (runtime ownership) | **WEAK** | Equifax-grade pain; Tenable/Wiz/Backstage/ServiceNow |
| ST-5 | Shift handoff sent but not acknowledged | **WEAK** | Sheets workaround real; incident.io / Shiftctl / I-PASS occupy |
| ST-6 | Unowned vendor-dashboard prompt | **KILLED** | Langfuse protected labels already |
| ST-7 | Agents reimplement existing helpers | **KILLED** | dupehound / Deslop / Sonar |
| ST-8 | Overlapping / zombie research protocols | **WEAK** | PROSPERO refuses to gate; slow buyers |

### From Area 3 — non-live reproduction

| ID | Problem | Status | One-line why |
|---|---|---|---|
| RF-1 | Bounded world-state capsule (outside git / envelopes) | **KILLED** *(was KEEP)* | Daytona/E2B *are* the product; weekend `tar`+`docker commit`; demo reprints Daytona chart |
| RF-2 | Closed-IDE export ≠ executable failure object | **WEAK** | Cursor staff-acked export bug; hooks = killed Action Receipt |
| RF-3 | CUA failures archived as mp4/png not executable traces | **WEAK** | OSWorld already ships traj+video; Playwright DOM replay ≠ desktop |
| RF-4 | Which checkpoint is the failure? (selection) | **WEAK** | Daytona named the knob; ddmin homework / LLM judge class |
| RF-5 | Portable sandbox rootfs as OCI (cloud↔laptop) | **KILLED** | k8s agent-sandbox #949 + OpenSandbox prior art |
| RF-6 | Full-overlay `docker commit` as salvage object | **KILLED** | aios#2027 runbook; wrong artifact size |
| RF-7 | Freeze stale session / KV-cache as artifact | **KILLED** | Inside model provider; Anthropic claimed the fix |
| RF-8 | Hermetic capture-after-setup for CI | **KILLED** | E2B templates / Docker cache; PraisonAI wiring TODO |

---

## Patterns (INFERENCE, labeled)

1. **Pain ≠ gap.** Congressional reports, arXiv, and vendor posts document real pain that already has a first-party checkbox.
2. **SoT vendors own Area 1.** Asking CloudTrail/Stripe/SES/WAL is asking the product that already sells the console.
3. **“Make humans look” is occupied.** GitHub identity gates, PagerDuty/incident.io, Scorecard (gameable), CMDB catalogs.
4. **Agent replay is split and crowded.** Envelopes (Chronicle/Promptfoo), machines (Daytona/E2B/OpenSandbox/CRIU), browsers (Playwright), syscalls (ReproZip).
5. **Bounded capsule looked like whitespace until kill tests.** The measurement that made RF-1 “KEEP” was published by Daytona selling snapshots.

---

## What this file does not do

Does not invent Area 4. Does not promote WEAK rows to shortlist. Does not start concepts (see `06` — none advanced). Does not name prior killed products as rebuildable.

**Return:** 24 problems catalogued · **0 KEEP · 8 WEAK · 16 KILLED** after RF-1 destruction.
