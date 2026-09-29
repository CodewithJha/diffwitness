# Failure Mode Cycle 04

**Date:** 21 September 2026  
**Workspace:** repository root  
**Scope:** Research only. No application code, architecture, PRD, prototype, product selection, deps, or `src/` changes.  
**Method posture:** Adversarial. Prefer kill. 0 survivors preferred over mediocre product.  
**Do-not-resurrect:** Afterhours / notes→brief; CiteCheck, Action Receipt, Canary Session, Spec Triangle, Merge Preflight; cycle-2 world-state / socio-technical / replay wells; Cycle 03 absence-of-expected-work / heartbeat / freshness / webhook silence / automation quiet / generic observability; generic RAG / enterprise search / KM / summarization / doc management / dashboard / generic KG / generic workflow.

**Sources companion:** `research/FAILURE-MODE-CYCLE-04-sources.md`

**Evidence labels:** **FACT** = fetched/primary this pass. **INTERPRETATION** = reasoned from facts. **HYPOTHESIS** = unproven. **Unknown** stays Unknown. Reddit backends **off** this environment — Reddit not used as proof. HN used as **supporting** only.

---

## Thesis

> People routinely make consequential decisions using information that is technically available but operationally impossible to reconcile at the moment of action.

**Working attack:** Treat the sentence as a *product-gap claim*, not merely a *failure-description claim*. Pain without an empty wedge is a kill. Collapse into enterprise search / RAG / summarization / doc management / dashboard / generic KM / generic KG / generic workflow = **KILL**.

---

## Research Method

1. Read gate corpus: `RESEARCH-STATUS.md`, `REOPEN-GATE.md`, `ANTI-FORCING.md`, `DECISION-LOG.md`, `STATUS-SUMMARY.md`, `FAILURE-MODE-CYCLE-03.md` (+ sources), `docs/WIN-PLAN.md`, `docs/FUTURE-ARCHITECTURE-RULES.md`, `docs/ENGINEERING-STANDARDS.md`.
2. Internet research via **agent-reach**: `agent-reach doctor --json` first; Exa (`mcporter call exa.web_search_exa`); Jina Reader (`curl https://r.jina.ai/URL`); GitHub/HN via Exa+Jina. Reddit **off** — not used. Declared channels: Exa + Jina Reader (+ HN supporting).
3. Parallel streams: (A) failure evidence for conflicting versions / cross-system / buried context / manual reconciliation / provenance / decision-time ambiguity; (B) competitive destruction of MDM, lineage/catalogs, reconciliation, enterprise search/KM, CLM, CMDB, ERP/CRM SoT tools, Palantir ontology, doc-drift tooling.
4. Apply **REOPEN-GATE** (16 questions; any Unknown/unsupported/weak/assumption → **KILL**) to every concrete opportunity.
5. Decision standard (evidence narrative, **no** arbitrary 1–10 scores): Pain × Frequency × Consequence × Differentiation × Technical Depth × Demoability × Product Value × Continuation.
6. Fabrication ban: fictional “composite” case studies (e.g. invented trading desk narratives) are **not** FACT. Prefer SEC primary orders, vendor primary docs, operator primary pages.

---

## Evidence Summary

### What is true about the thesis (as description)

**FACT:** Organizations routinely hold the *same named business fact* in multiple systems with different answers. TDWI (2026-05): CRM, billing, and warehouse often disagree on “how many customers”; MDM exists to build a single version of the truth via entity resolution + golden records. Rex Black (2026-04) integration audit: board asks for a number; Sales / Marketing / Finance return three different pipelines — usually **definitional**, **temporal**, **hierarchy**, or **quality** disagreement, not a single “bug.”

**FACT:** Atlassian Community / FreshPage (2026-02): on-call engineer followed a Confluence runbook that referenced renamed services, deprecated tools, and departed escalations — ~45 minutes lost vs ~5 minutes without the bad runbook. Pages look equally authoritative regardless of age.

**FACT:** StandIn (2026-05): Confluence decision pages store authority/status/supersession as prose; two overlapping pages leave no queryable “current position”; AI grounding on stale prose produces fluent wrong answers.

**FACT:** Ironclad (2026-03): poor contract version control is framed as post-signature value leakage; CLM platforms sell centralized repo, redline comparison, locking, and e-sign routing as the fix for “which version is real?”

**FACT:** Palantir Foundry ontology docs name **System Silos** as an anti-pattern: same real-world entity as multiple object types → “conflicting information across object types with no clear source of truth”; prescribed fix is merge pipelines + **precedence rules** for conflicting values.

**FACT:** ServiceNow CMDB (primary product docs via Exa): **reconciliation rules** authorize which discovery sources may update which CI attributes so sources do not overwrite each other; dynamic rules via CMDB 360 pick values across sources.

**FACT:** Salesforce Help: duplicate rules / matching rules alert or **block** create/edit when a record matches an existing one — conflict surfacing *at the moment of record action* inside CRM.

**FACT:** Oracle CDM / SAP MDG: duplicate resolution, survivorship / best-record calculation, source-system confidence — enterprise products for composing authoritative master data when sources disagree.

**FACT:** Finance reconciliation category is productized: Trintech AI transaction matching (GL-to-bank, exceptions workflows); reconcile.one / Nanonets-class agents match bank/card/ERP lines with sourced audit trails.

**FACT:** Collibra / Alation / Monte Carlo document lineage for tracing transformations and impact — governance/observability answer to “where did this number come from?”

**FACT:** Glean (2026 enterprise search eval): multi-source queries require reconciling entities; vendor claims ChatGPT-class tools struggle to synthesize **conflicting** / older-vs-newer documents; Glean positions indexes + Enterprise Graph to find **canonical** docs (and even code as SoT vs Slack).

**FACT (HN supporting):** Ask HN on Confluence vs code drift (item 40317113) — payment-process docs drift from implementation; community answers: docs-in-repo, PR review of docs, accept code as SoT. Show-HN-class tools (`docdrift`, `doc-sync-check`) already target doc↔code drift in CI.

**INTERPRETATION:** The thesis correctly names a *failure modality*: consequential action under unresolved multi-source truth. That modality is old, named, and commercially colonized.

### What is false about the thesis (as product opportunity)

**FACT:** Every failure class under this thesis maps to a mature category:

| Failure class | Occupying category (primary evidence this pass) |
|---|---|
| Conflicting versions (docs/contracts) | SharePoint versioning; Ironclad CLM; VCS; FreshPage freshness banners |
| Cross-system disagreement | MDM (TDWI problem statement + Oracle/SAP MDG); CRM↔ERP integration discipline; Salesforce duplicates; ServiceNow CMDB reconciliation; Palantir ontology merge+precedence |
| Buried critical context | Enterprise search / answer layers (Glean, Copilot, Guru/Notion/Slab/Rovo class); catalogs |
| Manual reconciliation before action | Trintech / close automation; bank–ERP matching agents; RevOps “Entity Map” + nightly recon reports (consulting pattern) |
| Provenance loss | Collibra / Alation lineage; Monte Carlo lineage+impact; Purview lineage |
| Decision-time ambiguity | In-app gates (Salesforce duplicate alert/block); approval workflows; CMDB/MDM survivorship UIs; CLM locking |

**INTERPRETATION:** “Technically available but operationally impossible to reconcile at action time” is historically true for *uninstrumented* multi-system orgs and **commercially false as an empty OFFGRID wedge**. The industry answer is not a new cross-cutting “truth reconciler” — it is **domain SoT + survivorship + point-of-action validation** inside the system where the action happens, plus search/catalog for discovery.

**INTERPRETATION:** Any OFFGRID product that (a) indexes Slack/Drive/wiki and answers questions, (b) summarizes conflicting docs, (c) draws a knowledge graph of “everything,” or (d) dashboards “conflicts across systems” is **enterprise search / RAG / KM / data platform** — forbidden collapse shapes and incumbent-owned.

**Not used as FACT:** Fictional composite trading “case studies” (e.g. invented Cornerstone / FI-EXEC narratives found in secondary RegTech pages). Real SEC Knight Capital order (2013) is **config/deploy inconsistency** (dead code on one server; inadequate market-access controls) — adjacent socio-technical / controls failure, **not** a clean “Person reconciled sources A/B/C at click time” exemplar for this thesis, and not an empty product category.

---

## Failure Classes

### A — Conflicting versions

| Dimension | Finding |
|---|---|
| What fails | Actor acts on version N while version N+1 (or fork) is authoritative; or two “current” docs disagree |
| Who | Legal (contracts), eng on-call (runbooks), ops (SOPs), PMs (specs) |
| Sources at action | Email attachment vs CLM; Confluence page A vs page B; SharePoint major vs draft |
| Frequency | Standing; quantified rate Unknown |
| Consequence | Wrong procedure, wrong contract terms, wrong ship |
| Workaround | Filename discipline; “ask in Slack”; FreshPage-style freshness; CLM single repo |
| Software expose contradiction at action? | **Inside CLM/SharePoint version UI — yes.** Across arbitrary wikis — partially (freshness apps; search ranking) |
| Already solved? | **Yes as category** — VCS, SharePoint versioning, Ironclad CLM, Confluence freshness Marketplace apps |

**Class verdict:** Occupied. Pain real; gap is process/discipline or niche Marketplace, not empty platform.

### B — Cross-system disagreement

| Dimension | Finding |
|---|---|
| What fails | CRM vs ERP vs warehouse vs billing disagree on customer / revenue / inventory / CI |
| Who | RevOps, finance, sales ops, ITSM owners |
| Sources | Salesforce / HubSpot vs NetSuite/SAP vs BI vs Zendesk |
| Frequency | Canonical MDM problem (TDWI); RevOps audit papers treat as routine |
| Consequence | Wrong board number, bad credit decision, wrong part ordered (BOM literature), failed audits |
| Workaround | Spreadsheet recon; “Entity Map”; nightly match jobs; stewardship queues |
| Expose at action? | **Salesforce duplicate rules at create/edit**; **SAP/Oracle MDG at consolidate**; **ServiceNow IRE reconciliation** — yes when configured. Cross-SaaS without MDM — manual |
| Already solved? | **Yes** — MDM, iPaaS, CMDB reconciliation, Palantir ontology pipelines |

**Class verdict:** Occupied enterprise category. Solo OFFGRID “universal cross-system conflict detector” = fake connectors theater or MDM clone.

### C — Buried critical context

| Dimension | Finding |
|---|---|
| What fails | Decisive fact exists in Slack thread / old ticket / obscure doc; actor never sees it before acting |
| Who | IC professionals, support, eng, sales |
| Workaround | Search, ask teammate, tribal knowledge |
| Already solved? | **Enterprise search / Copilot / Glean / Guru** compete exactly here; quality debated, category full |

**Class verdict:** Occupied. Building another answer engine = RAG/KM kill.

### D — Manual reconciliation before action

| Dimension | Finding |
|---|---|
| What fails | Human must line-match bank↔GL, CRM↔ERP counts, inventory↔WMS before approving close / payout / ship |
| Who | Controllers, ops, treasury |
| Already solved? | **Trintech, Ripple Treasury recon, Nanonets/reconcile.one-class agents**, ERP native recs |

**Class verdict:** Occupied. High consequence, high config burden, enterprise sales motion — unfit empty solo wedge.

### E — Provenance loss

| Dimension | Finding |
|---|---|
| What fails | Actor cannot tell which transform/source produced the number/claim they are about to use |
| Who | Analysts, data stewards, auditors, AI-assisted writers |
| Already solved? | **Collibra / Alation lineage; Monte Carlo lineage+impact; Purview**; citation UIs in enterprise answer products |

**Class verdict:** Occupied catalog/observability. CiteCheck-adjacent shapes already killed in cycle-1.

### F — Decision-time ambiguity

| Dimension | Finding |
|---|---|
| What fails | At click/approve/ship time, UI shows one confident state; contradictory evidence not in the action surface |
| Who | Anyone approving in a single system of action |
| Gap claim | “Surface conflict at the button” |
| Reality | Domain systems already do this when configured (SFDC duplicates, approval rules, credit checks, CMDB authoritative source). Cross-system at button requires **integration + survivorship** = MDM/iPaaS/workflow — not a new category |
| Already solved? | **Partial by design of SoT apps**; residual is governance/config burden |

**Class verdict:** Mechanism either embeds in incumbent SoT or becomes generic workflow/decision-support platform — both kills.

---

## 15–20 Concrete Opportunities

Each uses REOPEN-GATE. Survivors require **all 16** with evidence — **none do**.

### Opp-01: Cross-CRM/ERP “board number” conflict banner

- **Class:** B / F  
- **Exact failure:** CFO asks pipeline; Sales CRM $X, Finance ERP $X−30%; meeting proceeds with unresolved definitions  
- **Who:** RevOps / finance partners  
- **Sources A/B/C:** CRM opportunity sum vs ERP booked/billed vs marketing automation  
- **Frequency:** Standing (Rex Black audit framing); market-wide rate Unknown  
- **Consequence:** Bad capital allocation / lost trust  
- **Workaround:** Manual recon meeting; Entity Map; nightly reports  
- **Proposed shape:** Connector SaaS that diffs CRM vs ERP metrics and Slack-alerts  
- **Competitive kill:** MDM + BI semantic layers + RevOps discipline; not empty; demo = dashboard  
- **REOPEN-GATE:** Fails Q9–Q12, Q13 (enterprise connectors), Q14 (fixture theater risk)  
- **Gate result:** **KILLED**

### Opp-02: Universal MDM-lite golden record for startups

- **Class:** B / E  
- **Exact failure:** Customer exists 3× across Stripe / HubSpot / Intercom with divergent emails/addresses  
- **Who:** Founder-ops / RevOps at SMB  
- **Workaround:** Spreadsheets; Clearbit-class enrichment; HubSpot dedupe; Salesforce matching  
- **Proposed shape:** “Open-source Collibra for indies”  
- **Competitive kill:** Oracle CDM / SAP MDG / Salesforce duplicates / countless CDP–MDM vendors; multi-year governance product  
- **Gate:** Q9–Q13, Q15 fail  
- **Gate result:** **KILLED**

### Opp-03: Confluence/Notion stale-runbook blocker at incident open

- **Class:** A / F  
- **Exact failure:** On-call follows stale Confluence runbook (FreshPage anecdote: renamed service, departed escalations)  
- **Who:** SRE / on-call eng  
- **Workaround:** Slack “is this current?”; FreshPage freshness banner; docs-in-repo  
- **Proposed shape:** PagerDuty extension that refuses runbook link if last-verified > N days  
- **Competitive kill:** FreshPage (Atlassian Marketplace) already sells freshness at page view; PagerDuty/Atlassian ecosystem owns hooks  
- **Gate:** Q9–Q12 (Marketplace niche clone)  
- **Gate result:** **KILLED**

### Opp-04: Decision-record SoT above Confluence

- **Class:** A / F  
- **Exact failure:** Two prose decision pages; superseded policy still retrieved; AI answers from stale page  
- **Who:** Platform / compliance / eng managers  
- **Evidence:** StandIn blog (vendor with motive) — supporting; HN docs-death threads supporting  
- **Proposed shape:** Structured decision status DB + silence when no ratified record  
- **Competitive kill:** ADR tools, Notion DB workflows, Jira; StandIn already pitches the gap; collapses to KM  
- **Gate:** Q8 weak (vendor blog), Q9–Q12, Q15 crowded  
- **Gate result:** **KILLED**

### Opp-05: Enterprise search that “flags conflicts instead of summarizing”

- **Class:** C / F  
- **Exact failure:** Copilot/Glean-class answer blends two contradictory policies into one fluent paragraph  
- **Who:** Knowledge workers  
- **FACT:** Glean eval claims ChatGPT struggles with conflicting/older docs; Glean sells better canonical retrieval  
- **Proposed shape:** Conflict-first answer UI  
- **Competitive kill:** **This is the enterprise search/RAG category** (Glean, M365 Copilot, Guru verification). Feature request to incumbents, not OFFGRID product  
- **Gate:** Q9–Q12 hard fail; anti-forcing RAG/KM  
- **Gate result:** **KILLED**

### Opp-06: Guru/Notion/Slab “verification layer” clone

- **Class:** C / A  
- **Exact failure:** Unverified wiki answer trusted in support reply  
- **Who:** Customer support / enablement  
- **Competitive kill:** Guru leads with verified knowledge / citations; Notion Enterprise Search; Atlassian Rovo  
- **Gate:** Q9–Q12  
- **Gate result:** **KILLED**

### Opp-07: Contract version fork detector (email vs CLM)

- **Class:** A  
- **Exact failure:** Negotiator signs attachment that is not the locked CLM version  
- **Who:** Legal ops / GCs  
- **Competitive kill:** Ironclad article + CLM category (version history, locking, e-sign routing)  
- **Gate:** Q9–Q13 (legal enterprise)  
- **Gate result:** **KILLED**

### Opp-08: SharePoint / Drive “which copy is authoritative?” assistant

- **Class:** A / C  
- **Exact failure:** Two near-duplicate Google Docs; 10 minutes wasted (HN anecdote supporting)  
- **Who:** Any knowledge worker  
- **Competitive kill:** SharePoint versioning + content approval; Drive version history; enterprise search ranking; still KM  
- **Gate:** Q8 anecdotal; Q9–Q12  
- **Gate result:** **KILLED**

### Opp-09: Bank↔ERP exception queue for SMBs

- **Class:** D  
- **Exact failure:** Controller cannot close until unmatched ACH lines cleared  
- **Who:** Controller / bookkeeper  
- **Competitive kill:** Trintech; reconcile.one; Nanonets Reconciliation Agent; QuickBooks/Xero bank rules  
- **Gate:** Q9–Q13  
- **Gate result:** **KILLED**

### Opp-10: Nightly source→destination count reconciler (generic)

- **Class:** B / D  
- **Exact failure:** 10 bookings in source SaaS, 9 in destination billing  
- **Who:** Ops / finance  
- **Competitive kill:** iPaaS ops hubs; custom jobs; data quality platforms; Cycle 03 Opp-16 already killed this shape  
- **Gate:** Q11–Q13; dashboard  
- **Gate result:** **KILLED**

### Opp-11: Data lineage “explain this dashboard cell” for analysts

- **Class:** E  
- **Exact failure:** Analyst cannot see transform path before publishing number  
- **Who:** Analytics eng / BI  
- **Competitive kill:** Collibra Data Lineage; Alation Lineage; Monte Carlo lineage+impact; Microsoft Purview  
- **Gate:** Q9–Q12  
- **Gate result:** **KILLED**

### Opp-12: Monte Carlo–lite conflict between two warehouses

- **Class:** B / E  
- **Exact failure:** Snowflake table and BigQuery replica disagree on row counts / sums  
- **Who:** Data platform  
- **Competitive kill:** Data observability freshness/volume/lineage vendors  
- **Gate:** Q9–Q12; Cycle 03 adjacency  
- **Gate result:** **KILLED**

### Opp-13: ServiceNow-adjacent multi-source CI conflict highlighter

- **Class:** B / F  
- **Exact failure:** Discovery and Import Set write different IPs to same CI; change ticket uses wrong value  
- **Who:** ITSM / CMDB owners  
- **Competitive kill:** ServiceNow reconciliation rules (static + dynamic) **are** the product  
- **Gate:** Q9–Q10  
- **Gate result:** **KILLED**

### Opp-14: Salesforce-at-create duplicate — but “cross Salesforce + HubSpot + ERP”

- **Class:** B / F  
- **Exact failure:** Rep creates Account that exists in ERP under different ID; CRM allows it  
- **Who:** Sales ops  
- **Workaround:** Salesforce duplicate rules (in-CRM); MDM hub; Clearbit; Zapier sync  
- **Proposed shape:** Cross-SaaS duplicate alert overlay  
- **Competitive kill:** MDM + Salesforce matching + Oracle/SAP duplicate resolution; overlay = brittle connector product  
- **Gate:** Q9–Q13  
- **Gate result:** **KILLED**

### Opp-15: Palantir-ontology-lite “precedence rules as a service”

- **Class:** B / E  
- **Exact failure:** HR title vs IT directory title disagree; apps show both  
- **Who:** Enterprise architects  
- **Competitive kill:** Palantir docs prescribe merge + precedence; SAP MDG survivorship; Informatica-class MDM  
- **Gate:** Q9–Q13, Q15  
- **Gate result:** **KILLED**

### Opp-16: PLM/ERP/MES BOM revision sync warner

- **Class:** B / A  
- **Exact failure:** EBOM revised in PLM; MBOM in MES stale → wrong part on line (industry literature)  
- **Who:** Manufacturing eng / quality  
- **Competitive kill:** PLM digital thread / Siemens–PTC-class PLM; multi-year industrial sales  
- **Gate:** Q8 mostly secondary blogs; Q9–Q13, Q15  
- **Gate result:** **KILLED**

### Opp-17: Doc↔code drift CI (payment/process docs)

- **Class:** A / E  
- **Exact failure:** Confluence payment-flow doc drifts from code (HN Ask)  
- **Who:** Fintech eng / compliance  
- **Competitive kill:** `docdrift`, `doc-sync-check`, docs-in-repo norms; **Spec Triangle** killed in cycle-1 for related “spec vs reality” shapes  
- **Gate:** Q9–Q12; anti-forcing resurrect adjacency  
- **Gate result:** **KILLED**

### Opp-18: Personal “fragmented truth” inbox for solo professionals

- **Class:** C / F  
- **Exact failure:** Solo adult reconciles calendar + email + notes before a client decision  
- **Who:** Solo professional (OFFGRID persona)  
- **Proposed shape:** AI that merges personal sources and flags conflicts  
- **Competitive kill:** Collapses to **Afterhours / notes→brief / generic AI assistant / RAG** — explicitly forbidden  
- **Gate:** Q9–Q12, Q11 none, anti-forcing  
- **Gate result:** **KILLED**

### Opp-19: “Conflict at the approve button” generic SDK

- **Class:** F  
- **Exact failure:** Approver clicks Approve; contradictory evidence lives in another SaaS  
- **Who:** “Any workflow owner”  
- **Proposed shape:** Embeddable conflict panel fed by connectors  
- **Competitive kill:** Becomes **generic workflow / decision-support / iPaaS**; ServiceNow/Salesforce/SAP already embed domain checks; no mechanism without domain model  
- **Gate:** Q1 vague; Q9–Q12; Q14 theater  
- **Gate result:** **KILLED**

### Opp-20: Provenance receipts for LLM answers across company docs

- **Class:** E / C  
- **Exact failure:** Model cites amalgam of conflicting pages without showing disagreement  
- **Who:** AI-assisted knowledge workers  
- **Competitive kill:** Glean/Guru citation+verification; Copilot grounding; **CiteCheck** killed; still RAG  
- **Gate:** Q9–Q12; cycle-1 adjacency  
- **Gate result:** **KILLED**

---

## Competitive Destruction

### Category truth

**FACT:** “Fragmented truth” is not an unnamed gap. It is the marketing and engineering center of **MDM**, **reconciliation**, **CMDB authoritative sources**, **CLM version control**, **data catalogs/lineage**, and **enterprise search / verified knowledge**.

### Competitor capsules (relevant)

| Product / class | Detect exact failure? | Reconcile conflicting sources? | Identify authoritative source? | Surface conflict at decision time? | Temporal validity? | Provenance? | Consequential contradictions? | Config burden | Merely search/RAG/KM? |
|---|---|---|---|---|---|---|---|---|---|
| **Glean** | Retrieval/answer errors | Claims graph + canonical doc preference; notes LLM conflict synthesis pain in competitors | Positions canonical retrieval / code-as-SoT examples | Via answer UX, not ERP approve button | Freshness signals claimed | Citations | Indirect | High (connectors) | **Yes — enterprise context/search** |
| **M365 Copilot** | In-M365 | Limited cross-SaaS vs Glean claims | Graph-weighted | In Office surfaces | Partial | Grounding | Indirect | M365-centric | **Yes** |
| **Guru / Notion AI / Slab / Rovo** | Stale/unverified KB | Verification workflows (Guru) | Verified cards / space norms | In helpdesk/wiki | Verification dates | Citations (Guru) | Support wrong answers | Medium | **Yes — KM** |
| **Confluence + FreshPage** | Stale page trust | No cross-system merge | Freshness as proxy | Banner at page open | Explicit freshness window | Weak | Runbook wrong actions | Low–medium | Wiki + signal |
| **SharePoint** | Version confusion in library | Version history / restore | Major/approved version | Checkout/approval | Version timeline | Version metadata | Doc mistakes | Admin config | DMS |
| **Collibra / Alation** | Lineage/quality governance | Catalog relations; not live CRM↔ERP cash match | Stewardship definitions | Analyst/catalog time | Sync schedules | **Lineage core** | Bad report trust | **High enterprise** | Catalog — not RAG chat alone |
| **Monte Carlo** | Pipeline/data incidents | Lineage impact; freshness/volume | Source trace for incidents | Data consumer alerts | Freshness SLA | Lineage | Bad dashboard decisions | Enterprise | Data observability |
| **Informatica / Oracle CDM / SAP MDG** | Duplicate/master conflicts | **Survivorship / best record** | Golden / best record | Stewardship + operational distribute | SCD-style / governance | Source confidence | Core MDM job | **Very high** | MDM platform |
| **Salesforce duplicate rules** | In-CRM dupes | Matching equations | Existing record wins/blocks | **Yes — create/edit** | N/A | Match keys | Bad CRM data | Admin rules | CRM feature |
| **ServiceNow CMDB recon** | Multi-source CI overwrite | Static/dynamic recon rules | Authorized discovery source per attribute | CI update time | Refresh rules | Source attribution | Wrong change targets | High | ITSM platform |
| **Palantir Foundry Ontology** | System silo anti-pattern | Merge pipelines + precedence | Explicit precedence | Workshop apps on unified objects | Pipeline cadence | Ontology lineage-ish | Ops decisions on unified objects | Extreme | Decision ontology platform |
| **Ironclad / CLM** | Contract version forks | Single repo + redlines | Locked approved → e-sign | Legal workflow | Version timestamps | Audit trail | Contract value leakage | Legal ops | CLM — not search |
| **Trintech / reconcile.one / Nanonets recon** | Unmatched financial lines | AI/rules matching | ERP-as-SoT positioning | Exception queues before close | As-of matching windows | Match provenance | Close / fraud / cash errors | Finance ops | Reconciliation — not KM |
| **docdrift / doc-sync-check** | Doc↔code signature/method drift | Flag for human | Code baseline pin | CI time (not prod action) | Pin/ack | Link nodes | Process compliance | Dev setup | Devtool niche |

### Skeptical question (user)

> Does enterprise search already solve “reconcile at moment of action”?

**INTERPRETATION:** Enterprise search solves **discovery and answer synthesis** under permissions. It does **not** replace MDM survivorship or in-SoT approval gates. That is not a gap for OFFGRID — it means a complete “fragmented truth” product must become **either** search/RAG (**KILL**) **or** MDM/recon/workflow (**KILL** as enterprise platform). There is no third mechanism that is both consequential and solo-demoable without collapsing into one of those.

**If LLM summarizes docs → KILL.** Explicitly applied to Opp-05, Opp-06, Opp-18, Opp-20.

### Strongest competitive kill

**Primary:** **MDM + in-SoT point-of-action controls** (SAP MDG / Oracle CDM survivorship; Salesforce duplicate alert/block; ServiceNow CMDB reconciliation; Palantir precedence merge) — they are the industry answer to cross-system disagreement at or before action.

**Co-primary for “find the buried fact / conflicting docs”:** **Glean / M365 Copilot / Guru-class enterprise search and verified knowledge** — any OFFGRID “reconcile my company’s truths” demo is a thinner Glean.

**Co-primary for money contradictions:** **Trintech / ERP reconciliation agents**.

**Co-primary for version forks:** **Ironclad CLM + SharePoint versioning**.

---

## Surviving Candidates (max 0–3)

**None. Survivors: 0.**

No opportunity passed all 16 REOPEN-GATE questions with primary evidence and a real empty mechanism gap.

---

## Killed Candidates

All Opp-01 … Opp-20 **KILLED**.

Do not resurrect as: “Afterhours for truth,” “CiteCheck for policies,” “Spec Triangle for CRM vs ERP,” Glean-lite, Collibra-lite, Trintech-lite, FreshPage clone, or “personal RAG that flags conflicts.”

---

## Final Decision

### **C — THESIS KILLED**

**Not** “fragmented truth is imaginary.” **FACT:** people and companies act under unresolved multi-source disagreement; primary pages and categories exist because the pain is chronic.

**Killed as an OFFGRID discovery thesis** because:

1. The modality is already the **center of multiple named markets** (MDM, reconciliation, CMDB authoritative sources, CLM versioning, catalogs/lineage, enterprise search/verified KM).  
2. “Surface contradiction at the moment of action” is already implemented **inside** systems of action (Salesforce duplicate rules; approval/credit checks; CMDB recon; CLM lock→sign) — the residual is **integration/governance**, not a missing app category.  
3. Cross-cutting “truth layer” demos inevitably become **search/RAG/KM**, **MDM**, or **workflow dashboards** — all forbidden or occupied.  
4. Solo hackathon scope cannot honestly host multi-SoT connectors + survivorship + decision-time embedding without fixture theater.  
5. Adjacent cycle kills already block the attractive renames (CiteCheck, Spec Triangle, Afterhours, Cycle 03 absence monitors).

### What would have kept a fragment alive (none found)

A KEEP would need: a **named professional job** with primary recurring evidence; sources A/B/C and action Y where **no** incumbent SoT, MDM, recon, CLM, CMDB, or search product can express the conflict; a mechanism that is **not** retrieve-and-summarize, **not** golden-record MDM, **not** generic workflow; solo-honest hosted demo; continuation path. **None found.**

### What would invalidate this kill (pre-committed)

- Primary evidence (court/postmortem/ops report — not vendor fiction) of a recurring role blocked by a **specific** A/B/C contradiction at action Y where named incumbents above **cannot** represent the conflict even when correctly configured — **and** a solo-buildable mechanism that is not a wrapper over their APIs or a RAG UI.  
- Until then: **do not reopen this thesis** under rename (“decision integrity,” “truth at click,” “conflict copilot,” etc.).

### Research posture after Cycle 04

Prefer continued **pause** (`ANTI-FORCING.md`). Zero survivors remains correct. Next reopen needs a **different** failure-mode thesis — not fragmented truth / reconciliation / search under a new label.

---

## Decision-standard narrative (no scores)

| Factor | Evidence-based read |
|---|---|
| Pain | Real (MDM problem statements, runbook anecdotes, RevOps audits, finance recon market) |
| Frequency | Real as class; quantified OFFGRID-buyer rate Unknown |
| Consequence | Can be severe (close, contract, ops, wrong ship) |
| Differentiation | **None** vs MDM / recon / search / CLM / CMDB / lineage |
| Technical depth | Real depth lives in enterprise platforms; hackathon slice is shallow wrapper |
| Demoability | Easy as search box or fake dual-source fixture — dishonest as differentiation |
| Product value | Commodity feature of incumbents |
| Continuation | Compete with Glean/Collibra/Trintech/SAP — not a post-hackathon wedge |

**Pain without Differentiation → do not build.**
