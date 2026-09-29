# PackLock — Product Requirements Document

**Status:** PRD for selection / planning  
**Date:** 22 September 2026  
**Authority:** `research/HIGH-CONFIDENCE-PRODUCT-HUNT.md` (PackLock / MODIFY of OrderLock)  
**Scope:** Product requirements only. No application code in this pass.

---

## One-liner

**PackLock** is the EMS Golden Data Pack Stop/Go gate — revision cohesion and completeness **PASS / BLOCK** before traveler / CAM / procurement release — with a downloadable release certificate (token). Not PO-clause AI review, not quote-time Gerber pricing, not retail chargeback prevention.

---

## ICP

| Field | Definition |
|---|---|
| **Company** | Small–mid EMS / PCBA contract manufacturer (prototype → NPI → low/mid volume) |
| **Buyer / user** | NPI engineer, CAM engineer, or quality lead who accepts the customer data pack before traveler release / material buy |
| **Economic buyer** | EMS owner / ops director who eats scrap and wrong buys when packs are accepted on hope |
| **Trigger** | Every new RFQ/NPI pack and every customer revision release |
| **Software today** | Email ZIP + Excel checklist + tribal knowledge; maybe a quote tool without a production release gate |
| **Not ICP** | Retail brands; general metal job shops without electronics data packs; A&D PO-clause reviewers; OEMs doing designer-only DFM |

---

## Problem

**Exact failure:** Customer ZIP / portal dump is accepted; BOM revision ≠ PCB/drawing revision, centroid RefDes missing from BOM, TBD MPNs remain, required XY/assembly files absent, or archive hash ≠ customer-stated hash. Traveler releases; procurement buys wrong/incomplete material or CAM programs wrong rev. Scrap, respin, schedule miss; liability sits with the EMS after acceptance.

**Frequency:** Per NPI and per revision — standing Stop/Go process (EMS handbook intake / freeze rules).

**Workaround today:** Manual checklist, email “Data Hold,” hope. Auditable record often missing.

**Why insufficient:** Checklists do not bind release; quote-time Gerber tools do not gate production traveler; ERP suites are adjacent OS, not a focused GDP gate.

---

## Solution (primary job)

One painful job: **accept or refuse a customer Golden Data Pack before irreversible production steps**, with cited findings and an immutable release record when PASS (or scoped override) unlocks release.

---

## Core workflow

```text
Customer manufacturing pack (ZIP / files)
        │
        ▼
Ingest + artifact detection
        │
        ▼
Fact extraction (deterministic; AI only assistive where schema-validated)
        │
        ▼
Coherence + completeness validation (rule engine)
        │
        ├── BLOCK / REVIEW → human resolution (fix pack or logged override)
        │         │
        │         ▼
        │   Re-validation
        │
        └── PASS → RELEASE → immutable release snapshot + release token
```

**Hard rule:** Cannot release with unresolved blocking issues. Frontend never decides release.

---

## Non-goals (do not build)

- ERP / MES / PLM / CAM programming / DFM manufacturability suite
- BOM procurement / quote generation / pricing
- Generic DMS / RAG / AI assistant / customer portal platform
- Project management / generic compliance checklist SaaS
- Live fake ERP/MES/WMS integrations for demo theater
- Web3 / blockchain / offensive cyber
- Extending the historical Afterhours `src/` scaffold as the product

---

## MVP (OFFGRID)

1. Upload / load a manufacturing data pack (seeded fixtures + real upload path).
2. Detect and classify pack artifacts (machine-readable BOM, Gerber or ODB++ fab set, centroid/XY, assembly drawing, optional PO/release note + stated archive hash).
3. Extract deterministic facts (revisions, hashes, BOM fields, RefDes sets).
4. Run modular validation checks → issues with citations (rule ID + file + field/excerpt).
5. Aggregate to **PASS / BLOCK / REVIEW**; keep release locked while blocking issues remain.
6. Human resolution: fix pack (re-upload / new revision) or logged **customer-accepted deviation** (scoped override) by approver role.
7. Re-validation after changes.
8. On eligible PASS: mint **RELEASE** with immutable snapshot + downloadable release certificate/token.
9. Audit significant events; fail-closed on validation/system failure (never silent PASS).
10. Hosted demo URL with honest fixture labeling.

---

## Demo scenarios (90s)

1. Open hosted PackLock; load fixture job “Board X — customer ZIP.”
2. Pack with **BOM Rev A** vs **Gerber Rev B** + one TBD MPN + missing XY → **BLOCK** with three citations.
3. Release control disabled / token locked.
4. Corrected fixture pack (or one logged deviation) → **PASS** → unlock downloadable release certificate; Data Hold–style issue list cleared.
5. URL on screen. Seeded files only; no live ERP/WMS; label fixtures honestly.

---

## AI boundary

| AI may | AI must not |
|---|---|
| OCR / extract revision strings from drawing title blocks when not in filename/manifest | Invent PASS when deterministic rules fail |
| Suggest which note fields might hold the stated hash | Be source of truth for money, qty, hashes, revisions, or release |
| Draft “Data Hold” text listing BLOCK citations | Replace the rule engine with free-form LLM judgment |

AI outputs are **untrusted**: schema-validated at the boundary; never the sole authority for release.

---

## Success criteria

- Judge can complete BLOCK → (fix or override) → PASS → release certificate on a hosted URL in ~90s.
- Blocking issues prevent RELEASE; unresolved blockers cannot mint a token.
- Citations are rule-backed and inspectable.
- Release snapshot is immutable and auditable.
- Demo uses fixtures honestly; no claimed live ERP/MES.
- Solo-buildable within OFFGRID coding window without five enterprise connectors.

---

## Kill criteria

Kill PackLock (do not rename and continue) if:

1. A shipped product whose **primary marketed workflow** is EMS/PCBA **Golden Data Pack acceptance** with **PASS/BLOCK before traveler/CAM/procurement release** and cited cohesion/completeness rules (same buyer + job + mechanism + SoR).
2. Honest demo cannot show a **real locked→unlocked** release token without fake integrations or silent hardcoding of outcomes.
3. Target EMS users refuse any gate friction under quick-turn pressure (validated interviews).
4. Product collapses into generic doc-diff / RAG Q&A over PDFs.
5. Scope cannot stay solo-buildable in the OFFGRID window without five enterprise connectors.

---

## Differentiation

PackLock’s system of record is the **pack release token / certificate**, not PO-clause review (GroundControl), not quote-time Gerber extract (CalcuQuote-class), not designer DFM (Valor NPI).

---

## Post-hackathon (out of MVP)

More rule packs, customer portal upload, export into traveler PDF / CSV for shop systems, optional deeper Gerber tooling APIs — without becoming full MES/ERP.
