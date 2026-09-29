# Failure Mode Cycle 04 — Sources

**Inspection date:** 2026-09-21  
**Companion:** `research/FAILURE-MODE-CYCLE-04.md`  
**Tooling:** agent-reach (`doctor --json` first). Channels used: **Exa** (`mcporter call exa.web_search_exa`), **Jina Reader** (`https://r.jina.ai/…`). Reddit backends **off** — not used. HN used as supporting only. `agent-reach check-update`: v1.5.0 current.

**Label key:** **FACT** = content retrieved this pass from URL. **INTERPRETATION** = reasoning in main report. **Not evidence** = fictional/composite narratives discarded.

---

## Gate / corpus (local, read first)

| Path | Role |
|---|---|
| `research/RESEARCH-STATUS.md` | Canonical paused / 0 survivors |
| `research/REOPEN-GATE.md` | 16-question FAIL=KILL |
| `research/ANTI-FORCING.md` | No force-build; no resurrect |
| `research/DECISION-LOG.md` | Chronology |
| `research/STATUS-SUMMARY.md` | Snapshot |
| `research/FAILURE-MODE-CYCLE-03.md` + `-sources.md` | Closed thesis — do not retread absence/heartbeat/freshness |
| `docs/WIN-PLAN.md`, `docs/FUTURE-ARCHITECTURE-RULES.md`, `docs/ENGINEERING-STANDARDS.md` | Constraints |

---

## Primary / official product & standards pages (inspected 2026-09-21)

| URL | How fetched | What it evidenced |
|---|---|---|
| https://palantir.com/docs/foundry/ontology/ontology-anti-patterns/ | Jina + Exa | System Silos anti-pattern; conflicting info across object types; merge + precedence rules |
| https://ironcladapp.com/resources/articles/contract-version-control | Jina + Exa | CLM version control, locking, e-sign routing vs email/filename chaos |
| https://www.trintech.com/platform/ai-transaction-matching/ | Jina + Exa | Enterprise GL-to-bank / multi-source financial matching + exceptions |
| https://reconcile.one/ | Exa | ERP-centric AI matching / close automation positioning |
| https://nanonets.com/agent/reconciliation | Exa | Bank/processor/ERP reconciliation agent |
| https://treasury.ripple.com/solutions/cash/liquidity-management/reconciliation | Exa | Cash recon matching bank vs ERP |
| https://productresources.collibra.com/docs/collibra/2026.02/Content/CollibraDataLineage/co_collibra-data-lineage.htm | Exa | Collibra technical/business lineage |
| https://www.collibra.com/us/en/products/data-lineage | Jina (thin) | Product surface for lineage |
| https://docs.alation.com/en/latest/analyst/Lineage/ | Jina + Exa | Alation lineage charts / V3 service |
| https://montecarlo.ai/platform/data-lineage-impact | Jina + Exa | Automated lineage + impact analysis |
| https://www.servicenow.com/docs/r/servicenow-platform/configuration-management-database-cmdb/r_ReconciliationRulesPrinciples.html | Exa (Jina blocked/tracker) | CMDB static/dynamic reconciliation rules; authoritative discovery sources |
| https://help.salesforce.com/s/articleView?id=sales.duplicate_detection_and_handling.htm&language=en_US&type=5 | Exa | Matching rules + duplicate rules |
| https://help.salesforce.com/s/articleView?id=sales.duplicate_prevention.htm&language=en_US&type=5 | Exa (Jina CAPTCHA) | Alert/block at create/edit |
| https://docs.oracle.com/en/cloud/saas/customer-data-management/fagcd/overview-of-duplicate-resolution-setup.html | Jina + Exa | Oracle CDM duplicate resolution / survivorship setup |
| https://docs.oracle.com/en/cloud/saas/customer-data-management/faicd/overview-of-duplicate-resolution.html | Exa | Merge vs link; golden master |
| https://learning.sap.com/courses/sap-master-data-governance-on-sap-s-4hana/explaining-consolidation-in-master-data-governance | Exa | SAP MDG consolidation, match, best record, survivorship rule types |
| https://support.microsoft.com/en-us/sharepoint/lists/documents-and-library/how-versioning-works-in-lists-and-libraries | Exa | SharePoint version history, major/minor, approval |
| https://www.glean.com/blog/enterprise-search-evaluation-2026 | Jina + Exa | Multi-source query difficulty; conflicting/old docs; canonical retrieval claims vs ChatGPT/Claude |
| https://www.glean.com/compare/glean-vs-copilot | Exa | Glean vs M365 Copilot positioning |
| https://sec.gov/files/litigation/admin/2013/34-70694.pdf | Jina + Exa | Knight Capital SMARS failure — **config/deploy/controls** (used only as adjacent; not thesis exemplar) |

---

## Industry / practitioner primary-ish pages

| URL | How | Notes |
|---|---|---|
| https://tdwi.org/blogs/data-101/2026/05/master-data-management.aspx | Jina + Exa | MDM as answer to multi-system customer-count disagreement |
| https://rexblack.com/resources/writing/crm-erp-disagreement-audit | Jina + Exa | CRM vs ERP disagreement categories + Entity Map / recon rhythm (consultancy) |
| https://www.datafuseai.com/blogs/multi-source-data-conflicts | Exa + Jina | Temporal / definitional / transform / integration conflict taxonomy (vendor blog) |
| https://marionoioso.com/2026/01/29/master-data-management-golden-record/ | Exa | Attribute-centric golden records, survivorship, SCD2 (practitioner monograph) |
| https://community.atlassian.com/forums/App-Central-articles/Your-Confluence-wiki-is-confidently-giving-people-wrong/ba-p/3192612 | Jina + Exa | Stale runbook incident anecdote; FreshPage Marketplace pitch |
| https://www.standin.co/blog/confluence-decision-log | Jina + Exa | Decision pages vs structured SoT (vendor with motive — supporting) |
| https://futurepicker.com/en/notion-ai-vs-guru-vs-rovo-vs-slab-ai-knowledge-management-2026/ | Exa | Secondary comparison of KM/AI answer products — supporting landscape only |
| https://blog.sap-press.com/performing-master-data-duplicate-checks-with-sap-mdg | Exa | SAP MDG duplicate checks (older secondary) |

---

## Supporting community (HN only; Reddit off)

| URL | How | Use |
|---|---|---|
| https://news.ycombinator.com/item?id=40317113 | Jina + Exa | Ask HN: Confluence process docs vs code drift — **supporting** |
| https://news.ycombinator.com/item?id=39375258 | Exa | “Confluence is where documentation goes to die” — supporting |
| https://news.ycombinator.com/item?id=31821328 | Exa | Design docs vs code SoT debate — supporting |
| https://news.ycombinator.com/item?id=45712448 | Exa | Show HN comments on conflicting company docs — supporting |

---

## OSS / niche tools (competitive occupancy)

| URL | How | Notes |
|---|---|---|
| https://github.com/NicoSchwandner/docdrift | Jina + Exa | Doc↔code drift detection CI |
| https://github.com/chetanbasuray/doc-sync-check | Exa | AST signature vs markdown drift CI |
| https://github.com/agent-sh/sync-docs | Exa | Stale refs / changelog helpers |

---

## Explicitly discarded / not FACT

| Item | Reason |
|---|---|
| https://datafield.dev/regulatory-technology-regtech/part-04/chapter-21/case-study-01.html (“Cornerstone Financial” / FI-EXEC-03) | **Fictional composite** — must not be cited as real incident |
| Reddit threads | Backend **off** this environment; policy: supporting only even when on |
| Guru homepage | Jina returned empty/iframe shell — claims taken from secondary comparison + category knowledge only where Exa returned product positioning elsewhere |

---

## Search queries run (Exa, non-exhaustive)

- conflicting data sources decision making operational failure reconciliation ERP CRM  
- data lineage provenance conflict detection Collibra Alation Monte Carlo  
- master data management MDM conflicting versions authoritative source  
- Glean Microsoft Copilot enterprise search knowledge management conflicting documents  
- postmortem wrong decision outdated documentation conflicting wiki Confluence  
- financial reconciliation software matching transactions ERP bank mismatch product  
- site:news.ycombinator.com conflicting documentation OR stale docs OR source of truth disagreement  
- Palantir Foundry ontology conflicting data sources decision support  
- Ironclad CLM contract version conflict negotiation source of truth  
- digital thread PLM BOM conflicting versions manufacturing decision  
- ServiceNow CMDB reconciliation CI conflicting records  
- Salesforce duplicate management OR matching rules conflicting records decision  
- Oracle MDM OR SAP Master Data Governance golden record conflict resolution  
- Microsoft Purview data lineage catalog  
- Show HN docs conflict detection OR documentation drift checker  
- Knight Capital SEC order (primary PDF used; not as fragmented-truth product gap)

---

## Method notes

- Parallel streams: failure evidence vs competitive destruction, then synthesis in `FAILURE-MODE-CYCLE-04.md`.  
- Prefer kill: thesis survives as *description*, dies as *empty product wedge*.  
- Cycle 03 topics (heartbeat, cron silence, freshness monitors, webhook quiet) deliberately not reopened.
