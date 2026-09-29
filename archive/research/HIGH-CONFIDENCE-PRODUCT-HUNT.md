# HIGH-CONFIDENCE PRODUCT HUNT v2 — LAST discovery pass

> **SUPERSEDED (22 Sep 2026):** PackLock is **abandoned** as active OFFGRID direction. Active product direction is **SemaDiff** — see `docs/SEMADIFF-PRD.md`, `research/RESEARCH-STATUS.md`, `research/DECISION-LOG.md`. This hunt file is retained as historical evidence only. Do **not** implement PackLock from this document.

**Date:** 22 September 2026  
**Workspace:** repository root  
**Channels:** agent-reach `doctor --json` (Exa via `mcporter`; Jina Reader `r.jina.ai`; `gh` available; Reddit/Twitter backends off — not used as proof).  
**Scope:** Discovery only. No PRD body, architecture, application code, deps, or `src/`.  
**Labeling:** FACT = primary page / official docs fetched or Exa-extracted from primary URL. INTERPRETATION = reasoned from facts. HYPOTHESIS = untested.  
**Kill rule:** Kill only when same buyer + painful job + primary workflow + mechanism + enforcement/SoR position. Adjacent feature ≠ kill.

Starting set: **A OrderLock · B DockShield · C Chargeback Prevention Gate · D FlowDiff · E CaseProof.** One may be modified; no sixth abstract thesis; no revived forbidden names.

---

## 1. Executive conclusion

**MODIFY → PackLock** (OrderLock verticalized).

~~Advance **PackLock** to **PRD-next**.~~ **Historical only** — PackLock later abandoned; SemaDiff is active direction. Discovery remains **CLOSED**. Do not start another product hunt from this file.

**Original OrderLock (PO vs quote/MSA as primary for general SMB manufacturers) is KILLED** — exact primary workflow occupied by GroundControl PO Review (+ Near: ISO contract-review workflow software; Adjacent: Trueleveler buyer-side PO vs quote).

**B, C, D, E: KILLED** with direct primary-product evidence (below). No sixth hunt.

---

## 2. Why this product

### PRD-ready definition

**PackLock** — A pre-production **Golden Data Pack (GDP) acceptance firewall** for **EMS / PCBA contract manufacturers**.

An NPI / CAM / quality engineer uploads the customer manufacturing data pack (machine-readable BOM, Gerber or ODB++ fab set, centroid/XY pick-and-place, assembly drawing, optional PO/release note + stated archive hash). PackLock runs **deterministic cohesion and completeness checks**, then returns **PASS / BLOCK / REVIEW** with citations (rule ID + file + field/excerpt). **Traveler / CAM / procurement release stays locked** until PASS, or until a logged **customer-accepted deviation** unlocks a specific exception. Optional AI only assists OCR of title-block revision letters; it never invents PASS.

This is a **MODIFY of OrderLock**: same core thesis (*constrain acceptance before irreversible production*), different document set and ICP (EMS GDP pack vs general PO-vs-quote for all SMB manufacturers).

### Why not keep original OrderLock

| | |
|---|---|
| **Exact primary product** | [GroundControl PO Review](https://gndctl.com/solutions/po-review-software) — FACT: marketed to contract manufacturers / suppliers; AI ingest; **PO vs quote** and **PO revision compare**; “before releasing production”; cited findings; overrides; discrepancy email. Help docs describe dedicated PO Review apps (commercial + ITAR/GovCloud). |
| **Same buyer + job + mechanism** | Supplier-side CM catching PO/quote/revision conflicts before production — matches original OrderLock. |
| **Enforcement** | Review + override + email (not ERP lock). OrderLock’s “hard release block” without owning ERP collapses to the same review SoR GroundControl already sells. Claiming ERP lock fails the solo 3-week / no-5-integrations build test. |
| **Near** | [Database Providers ISO/AS9100 contract review](https://www.databaseproviders.com/contract-review-software-iso9001-as9100/) — cross-functional approve/hold before order entry. |
| **Adjacent (different buyer)** | [Trueleveler PO vs Quote](https://trueleveler.com/po-vs-quote) — **buyer/procurement** verifies vendor quote vs issued PO before signing (construction). |

**INTERPRETATION:** Original OrderLock fails the exact-primary-workflow kill. PackLock is not a rename of GroundControl: different artifacts (BOM/Gerber/XY/drawing cohesion), different primary marketed job (GDP intake gate), different SoR (pack release token).

### Why PackLock still has a gap

| Evidence | Label |
|---|---|
| [EMS handbook — Release Checklist and Freeze Rules](https://emshandbook.com/vol-03/1/release-checklist-and-freeze-rules/) | FACT (Exa extraction of primary page): NPI Data Intake Gate; liability transfers when traveler released; Stop/Go before Procurement/CAM; revision sync across BOM/Gerbers/drawings; completeness triad; TBD MPN reject; checksum vs PO/email; unsigned traveler hold. |
| [EMS handbook — RFQ / Golden Data Pack](https://emshandbook.com/vol-11/1/rfq-intake-checklist-golden-data-pack/) | FACT: BOM rev must match PCB rev → **hard stop**; missing XY/assembly drawing pauses quoting/engineering; machine-readable BOM required. |
| [Kaizen ISO — Contract Review in Small Manufacturing](https://kaizenisoconsulting.com/articles/contract-review-small-manufacturing-iso-9001) (2026-03-21) | FACT: Small shops often do mental review but lack auditable record; drawing-revision change mid-job requires stop + new PO — process pain, not a product. |
| Competitive search for primary **GDP acceptance gate SaaS** (PASS/BLOCK traveler before CAM) | FACT: **No exact primary product found** in this pass. |
| [CalcuQuote PCB Intelligence / Customer Portal + bee produced](https://www.elisaindustriq.com/calcuquote/features/pcb-intelligence) | FACT: Uploads Gerbers / data pack for **quoting** (extract specs, DFM for price) — Adjacent, not release firewall. |
| [Siemens Valor NPI](https://www.siemens.com/en-us/products/pcb/valor/valor-npi/) | FACT: Designer-side **DFM** manufacturability — Adjacent (different buyer/job). |
| [GroundControl PO Review](https://gndctl.com/solutions/po-review-software) | FACT: Contract/PO/quote review — Adjacent to PackLock (different documents). |

### Candidates A–E destruction (summary)

| ID | Outcome | Direct evidence (one line) |
|---|---|---|
| **A OrderLock (original)** | **KILL** | GroundControl owns supplier PO-vs-quote / PO-revision review before production. |
| **A→PackLock** | **MODIFY / ADVANCE** | Same pre-production firewall thesis; EMS GDP cohesion gate; no exact primary SaaS found; process primary in EMS handbook. |
| **B DockShield** | **KILL** | [Osa AI Retail Compliance](https://osacommerce.com/osa-ai-retail-compliance) (Manifest 2026 launch) + [AIMS360](https://www.aims360.com/features-integrations/edi-retailer-chargeback-management) pre-ship block + routing/ASN/label — same pre-dispatch compliance gate. |
| **C Chargeback Prevention Gate** | **KILL** | [Cleo Chargeback Prevention](https://www.cleo.com/solutions/supply-chain-orchestration/chargeback-prevention) named product; Osa/AIMS360 own pre-release decision point. |
| **D FlowDiff** | **KILL** | [D365 Procurement Agent impact analysis](https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/procurement-agent-impact-analysis-overview); [EquatorOps Impact Intelligence](https://equatorops.com/features/impact-intelligence/manufacturing); [Pathnovo P&ID→PO impact](https://pathnovo.com/solutions/procurement-intelligence/pid-revision-po-impact); Oracle/Bluestar ECM — change → affected orders/actions occupied. |
| **E CaseProof** | **KILL** | Any high-value retail exception vertical hits [Fask](https://fask.ai/use-cases/retail-deductions-chargebacks/), [ROIAI One](https://roiaione.com/solutions/chargeback-recovery), [RetailPath](https://www.retailpath.ai/deduction-recovery/); card disputes hit CertNode Reflex / Chargeflow — evidence reconstruction as primary product is occupied. |

---

## 3. Exact ICP

| Field | Definition |
|---|---|
| **Company** | Small–mid EMS / PCBA contract manufacturer (prototype → NPI → low/mid volume), not a full Siemens Valor enterprise CAD shop as the only buyer. |
| **Buyer / user** | NPI engineer, CAM engineer, or quality lead who accepts the customer data pack before traveler release / material buy. |
| **Economic buyer** | EMS owner / ops director who eats scrap and wrong buys when packs are accepted on hope. |
| **Trigger** | Every new RFQ/NPI pack and every customer revision release. |
| **Software today** | Email ZIP + Excel checklist + tribal knowledge; maybe quote tool (CalcuQuote-class) without a production release gate. |
| **Not ICP** | Retail brands fighting chargebacks; general metal job shops without electronics data packs; A&D PO-clause reviewers (GroundControl); OEMs doing designer DFM only (Valor). |

---

## 4. Failure

**Exact failure:** Customer ZIP / portal dump is accepted; BOM revision ≠ PCB/drawing revision, centroid RefDes missing from BOM, TBD MPNs remain, required XY/assembly files absent, or archive hash ≠ customer-stated hash. Traveler releases; procurement buys wrong/incomplete material or CAM programs wrong rev. Scrap, respin, schedule miss; liability sits with the EMS after acceptance.

**Frequency:** Per NPI and per revision — recurring process, not a one-off (EMS handbook treats intake gate as standing Stop/Go).

**Consequence:** Wrong material spend, scrap, late delivery, customer scorecard hit. Handbook cites delaying 24h as better than procuring on the order of tens of thousands of incorrect components (directional process example — not audited TAM).

**Workaround today:** Manual checklist, email “Data Hold,” hope. Record often missing (ISO contract-review gap for small manufacturers).

**Why insufficient:** Checklists don’t bind release; quote-time Gerber tools don’t gate production traveler; ERP suites are adjacent OS, not a focused GDP gate.

---

## 5. Alternatives table

| Alternative | Relation | Why not PackLock |
|---|---|---|
| **GroundControl PO Review** | Adjacent | PO/quote/clause review for suppliers — not GDP file cohesion / traveler lock. |
| **Trueleveler PO vs Quote** | Adjacent | Buyer signs PO; opposite side of trade. |
| **ISO contract-review Access apps** | Near workflow / different mechanism | Human checklist routing; not EMS pack deterministic gate. |
| **CalcuQuote + bee produced portal** | Adjacent | Data pack for **quoting**; not PASS/BLOCK production release. |
| **Siemens Valor NPI / Process Prep** | Adjacent | DFM / process prep enterprise stack; designer & large EMS CAM — not lightweight intake firewall SoR. |
| **Job-shop / EMS ERP (e.g. Tangle-class)** | Adjacent suite | Traveler/ERP OS; GDP cohesion gate is not the primary marketed product. |
| **Osa / Cleo / AIMS360** | Different job | Retail pre-ship compliance — killed DockShield/C, not PackLock competitors. |
| **EquatorOps / Pathnovo / D365 impact** | Different job | Change-impact graphs — killed FlowDiff. |
| **Fask / ROIAI / RetailPath** | Different job | Post-deduction evidence — killed CaseProof. |
| **Manual GDP checklist** | Workaround | No enforcement SoR; easy to skip under quick-turn pressure. |

---

## 6. Differentiation one-liner

**PackLock is the EMS Golden Data Pack Stop/Go gate — revision-cohesion and completeness PASS/BLOCK before traveler release — not PO-clause AI review, not quote-time Gerber pricing, not retail chargeback prevention.**

---

## 7. Mechanism diagram

```text
Customer ZIP / files
        │
        ▼
┌───────────────────┐
│ Ingest + classify │  BOM · Gerber/ODB++ · XY · drawing · PO note · hash
└─────────┬─────────┘
          │
          ▼
┌───────────────────────────────┐
│ Deterministic rule engine     │
│ • Rev sync BOM↔PCB↔drawing    │
│ • Required triad present      │
│ • TBD/placeholder MPN scan    │
│ • Centroid RefDes ⊆ BOM       │
│ • Optional SHA match vs note  │
└─────────┬─────────────────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
 BLOCK/REVIEW   PASS
 (cite rule+    unlock
  file+field)   RELEASE TOKEN
    │           (traveler/CAM/
    │            buy allowed)
    ▼
Deviation accept
(logged) → unlock
scoped exception
```

Core mechanism: **constrain before irreversible** + **cited exception taxonomy**. Not chatbot. Not dashboard-only.

---

## 8. AI boundary

| AI may | AI must not |
|---|---|
| OCR / extract revision strings from drawing title blocks when not in filename/manifest | Invent PASS when deterministic rules fail |
| Suggest which customer email fields might hold the stated hash | Be the source of truth for money, qty, or release |
| Draft “Data Hold” email listing BLOCK citations | Replace rule engine with free-form LLM judgment |

**INTERPRETATION:** AI is assistive; product value is the gate + citations. Matches engineering standards: validate at boundaries; no fake production integrations.

---

## 9. 90s demo

1. Open hosted PackLock; load fixture job “Board X — customer ZIP.”  
2. Show pack with **BOM Rev A** vs **Gerber Rev B** + one TBD MPN + missing XY → **BLOCK** with three citations.  
3. Release button disabled / token locked.  
4. Swap in corrected fixture pack (or accept one logged deviation) → **PASS** → unlock downloadable release certificate + Data Hold email cleared.  
5. URL on screen. Seeded files only; no live ERP/WMS; label fixtures honestly.

---

## 10. Post-hackathon

Narrow wedge for EMS NPI: more rule packs (IPC-ish completeness), customer portal upload, export into traveler PDF / simple CSV for shop systems, optional Gerber revision compare via existing tooling APIs — without becoming full MES/ERP. Continuation is “boring manufacturing intake gate,” not a platform spray.

---

## 11. Risks

1. **CalcuQuote / bee produced** expand from quote pack ingest into production release gate (feature adjacency → future exact).  
2. **Niche ICP** — founder without EMS access may struggle to validate willingness beyond handbook process writing (HYPOTHESIS until customer calls).  
3. **Valor / large MES perception** — judges or buyers may say “Siemens already does NPI” (Adjacent; must keep demo on intake gate, not DFM theater).  
4. **Bypass** — shops release offline on paper travelers (enforcement soft unless they treat PackLock certificate as SoR).  
5. **Domain complexity** — real Gerber compare is hard; V1 must stay deterministic cohesion/completeness or demo becomes fixture theater.

---

## 12. Kill criteria

Kill PackLock (do not rename and continue) if any of the following appear:

1. A shipped product whose **primary marketed workflow** is EMS/PCBA **Golden Data Pack acceptance** with **PASS/BLOCK before traveler/CAM/procurement release** and cited cohesion/completeness rules (same buyer + job + mechanism + SoR).  
2. Honest demo cannot show a **real locked→unlocked** release token without fake integrations or silent hardcoding of outcomes.  
3. Target EMS users refuse any gate friction under quick-turn pressure (validated interviews).  
4. Product collapses into generic doc-diff / RAG Q&A over PDFs.  
5. PRD cannot stay solo-buildable in the OFFGRID window without five enterprise connectors.

---

## 13. Files

| File | Role |
|---|---|
| `research/HIGH-CONFIDENCE-PRODUCT-HUNT.md` | This decision (sections 1–13) |
| `research/HIGH-CONFIDENCE-PRODUCT-HUNT-SOURCES.md` | Primary URLs + labels |
| `research/DECISION-LOG.md` | Discovery CLOSED; PackLock → PRD-next |
| `research/RESEARCH-STATUS.md` | Status sync |
| `research/STATUS-SUMMARY.md` | Status sync |

**Next:** PRD for PackLock only. No architecture dump. No `src/` until PRD accepted and product selected. No further discovery cycle.

---

## Appendix — Decision matrix (factual fields; qualitative recommendation)

| Field | A OrderLock (orig.) | B DockShield | C Chargeback Prev. Gate | D FlowDiff | E CaseProof | **PackLock (A modified)** |
|---|---|---|---|---|---|---|
| Exact competitor | GroundControl | Osa AI Retail Compliance; AIMS360 pre-ship | Cleo Chargeback Prevention; Osa | D365 impact; EquatorOps; Pathnovo | Fask; ROIAI; RetailPath (retail); CertNode (card) | **none found** |
| Pain evidence | Strong (CM PO miss) | Strong (retail chargebacks) | Strong | Strong (ECO cascades) | Strong (shortage disputes) | Strong (EMS handbook GDP gate) |
| Who pays | CM quality / ops | Brand / 3PL compliance | Brand / 3PL | Mfg eng / procurement | AR / deductions | EMS NPI / ops owner |
| Enforcement SoR | Occupied as review SaaS | Occupied pre-ship | Occupied named prevention | Occupied in ERP/PLM/impact SaaS | Occupied recovery agents | **Open as pack release token** |
| AI necessity | High in GC clone | High in Osa clone | Alerts/orchestration occupied | Graph/ERP occupied | Assembly occupied | **Low — deterministic rules** |
| Solo ~3 wk seeded V1 | Yes but clone | Needs retailer rule corpus | Same as B | Needs live order graph | Needs portals | **Yes — seeded ZIPs** |
| 90s demo | Collapses to GC | Collapses to Osa/AIMS | Same | ERP theater risk | Recovery clone | **Clear BLOCK→PASS** |
| **Recommendation** | **KILL** | **KILL** | **KILL** | **KILL** | **KILL** | **ADVANCE to PRD** |
