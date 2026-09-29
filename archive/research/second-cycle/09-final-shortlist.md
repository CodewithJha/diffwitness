# HACK47 OFFGRID - Second Discovery Cycle

**Date:** 21 September 2026  
**Outcome:** **ZERO survivors.**  
**Rule:** Do not choose a product because research time was spent. Prefer kill.

---

## 1. What we investigated

Three residual areas left after cycle-1 killed CiteCheck, Action Receipt, Canary Session, Spec Triangle, and Merge Preflight:

1. **World-state evidence outside the agent wrapper** — prove external SoT without trusting agent logs (`02`).
2. **Socio-technical duplication / nobody-will-look failures** — valid changes fail because humans don’t notice, trust, own, or act (`03`).
3. **Non-live reproduction of long-horizon failures** — deterministic artifacts without reconstituting production (`04`).

Class forbids: receipts, merge heuristics, Promptfoo/Chronicle/Langfuse replay, Afterhours brief, overlays, cyber builds.

---

## 2. What we learned

- **Pain is abundant; product gaps are not.** GitLab empty backups, Equifax 400-person email, Daytona SQLite outside git, Cursor incomplete export — all real.
- **Area 1 leftover after Action Receipt is the vendor SoT**, and every SoT already ships lookup/console/API.
- **Area 2 leftover after Merge Preflight is “make humans look / own / ack,”** already owned by GitHub gates, CMDB/vuln vendors, PagerDuty/incident.io, PROSPERO.
- **Area 3 leftover after Canary/Chronicle is world-state (machines), not envelopes** — and machine snapshot is already Daytona/E2B/OpenSandbox/CRIU.
- **The only thin KEEP (RF-1) was measured by the incumbent that sells the fix.**

---

## 3. Problems discovered

**24** numbered opportunities across three areas (`01` catalog).

| Status after destruction | Count |
|---|---:|
| KEEP | **0** |
| WEAK | **8** |
| KILLED | **16** |

Strongest *pain* URLs (not gaps): GitLab 2017 postmortem; Equifax House report; Daytona 18 Sep 2026 snapshots post; aios#2027; Cursor forum staff on export; BMJ Open PROSPERO duplicates.

---

## 4. Existing solutions

Mapped in `05-competitive-landscape.md`. Capsule:

- SoT consoles: AWS Backup/SES/CloudTrail, Stripe, Argo, git-lfs, Debezium, Terraform/HCP.
- Socio-tech: GitHub Copilot extra approval, Backstage, Tenable/Wiz, incident.io/Shiftctl, Langfuse labels, dupehound, PROSPERO.
- Replay: Promptfoo, Chronicle, Langfuse, Playwright traces, Daytona/E2B snapshots, CRIU/Docker checkpoint, ReproZip, OpenSandbox.

---

## 5. Concepts generated

**Zero.** `06-product-concepts.md` is a refusal record: no concept cards.

---

## 6. Concepts killed

Nothing was promoted to a named concept. **RF-1** (the only area KEEP) was kill-tested and **KILLED** before concept stage. Eight WEAK rows were refused concept cards.

Cycle-1 products remain **dead** and were not reopened.

---

## 7. Why they were killed

**RF-1 (mandatory tests):**

1. Daytona/E2B already ship sandbox snapshot / checkpoint-agent-work.  
2. Snapshot category is crowded (OpenSandbox, agent-sandbox, CRIU, Docker checkpoint).  
3. Core demo is weekend-reproducible with bind mounts + `docker commit` / experimental `docker checkpoint` (aios#2027 shows mounts *are* the durable object).  
4. 30s demo collapses to “we took a snapshot” / reprint of Daytona’s 0/5 vs 4/5 chart.  
5. Capsule is private customer state — hosted demo privacy fail or fixture theater.  
6. Post-hackathon path is a Daytona/E2B feature, not a company.

**WEAK rows:** incumbent checkbox, first-party bug, or weekend CLI — pain without gap.

---

## 8. Survivors

**None.**

*(Sections Problem / Evidence / Existing alternatives / Differentiation / Technical mechanism / Demo / Three-week feasibility / Biggest risk / What must be validated next — omitted because survivor count is zero.)*

---

## 9. Cross-candidate comparison

| Candidate shape | Pain | Gap | Diff vs incumbent | 3-wk honest demo | Post-hackathon | Advance? |
|---|---|---|---|---|---|---|
| RF-1 bounded capsule | Medium–High (Daytona/aios) | **None** | None vs Daytona/E2B | Theater | Feature | **No** |
| WS-1 / WS-2 | High / Medium | Packaging | None | Fixture | Action | **No** |
| ST-4 / ST-5 / ST-8 | High / Medium / Medium | Process / occupied | None | Spreadsheet / form / table | Vendor feature | **No** |
| RF-2 / RF-3 / RF-4 | Medium | First-party / research | None | Forum / mp4 scrub / ddmin | IDE / bench / Daytona | **No** |
| All Area 1–3 KILLED rows | Varies | Occupied | — | — | — | **No** |

No pairwise survivor comparison is required.

---

## 10. Final conclusion

> **No candidate currently meets the evidence threshold.**

Second discovery cycle investigated the three residuals the kill phase left. All three areas fail as product wells. The sole thin KEEP fails every RF-1 kill test against Daytona, E2B, CRIU/Docker checkpoint, and aios bind-mount salvage. Preferring zero survivors over inventing a product is the correct OFFGRID move.

**Do not write architecture. Do not start product code. Do not force a sixth (or seventh) idea to justify the research calendar.**

### Residual research posture

| Option | Recommendation |
|---|---|
| Third discovery cycle now | **Not warranted** as more of Areas 1–3. Those wells are exhausted. A third cycle would need a *new* failure-mode thesis with primary evidence — not another pass over SoT lookup, “make humans look,” or sandbox snapshots. |
| Pause research | **Yes, preferred until ~30 Sep 2026 research-only gate resolves.** |

Unknown whether a *different* professional job outside these three shapes exists with court/incident-grade evidence and an empty mechanism. That Unknown does **not** authorize brainstorming products without evidence.
