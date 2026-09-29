# Final Product Hunt

**Date:** 22 September 2026  
**Workspace:** repository root  
**Scope:** Discovery only. No application code, architecture, PRD, deps, or `src/` changes.  
**Mandate:** Last discovery cycle. Name one Working Product for validation. Do not return 0 survivors.  
**Territory:** Painful ops workflows outside AI infrastructure — SMBs, trades, freelancers/agencies, local business, field ops, education admin, healthcare admin (not diagnosis), logistics/receiving, procurement, hospitality/events, compliance-heavy small teams, creators/business ops.  
**Channels used:** agent-reach `doctor --json` (Exa via mcporter; Jina Reader; V2EX/web ok; Reddit/Twitter backends off — not used as proof); Exa web search; Jina Reader fetches of primary pages.  
**Kill rule applied:** Kill only when a competitor solves the **same user + same workflow + same core mechanism** sufficiently well. Adjacent suites / related Microsoft features / “enterprise can” ≠ auto-kill.  
**Engineering note:** Any eventual build must follow `docs/ENGINEERING-STANDARDS.md`. No architecture designed here.

---

## Previous kills (brief)

| Cycle / item | Outcome |
|---|---|
| Cycle 1 | CiteCheck, Action Receipt, Canary Session, Spec Triangle, Merge Preflight — killed |
| Cycle 2 | Residual wells → 0 survivors |
| Cycle 03 | “Silent non-occurrence of expected work” → occupied by heartbeat/freshness monitors |
| Cycle 04 | “Decision under fragmented truth” → occupied by MDM/CLM/CMDB/recon/search/RAG |
| Afterhours notes→brief | Rejected generic productivity |
| Discovery Reset | Working candidate **AliasTripwire** |
| 2026-09-22 validation | **AliasTripwire KILL** — Provider Sentinel / continuous provider-canary SaaS occupy primary workflow |
| Forbidden resurrect | AliasTripwire, CiteCheck, Action Receipt, Spec Triangle, Merge Preflight, Canary Session, generic observability / model eval / expected-event monitoring, Cycle-04 reconcilers, generic RAG/search, generic developer tooling as primary, Afterhours |

**This hunt:** New failure shapes in boring operational workflows. Mechanism-first (gate before irreversible, exception desks, evidence packs, dependency execution, unstructured→state). Not another AI-infra thesis.

---

## 30 Raw Problems (short template)

Each: **Who** · **Failure** · **Today** · **Why it still hurts** · **Mechanism hint**

1. **Mid-job scope creep (trades)** · Solo HVAC/plumber/electrician · Finds hidden condition; continues on handshake; extras appear on final invoice; customer disputes; tech eats labor/material · Text “ok?” / memory · Profit vanishes (industry guides cite ~10–15% project loss from uncontrolled change) · **simulate + constrain before irreversible**
2. **Prior-auth unit/expiry slip (clinic admin)** · Front desk / small practice · Service rendered after PA expired or units exhausted → denial; retro auth rare · Daily portal login + spreadsheet columns · Morning chase across payers; claim write-offs · **executable checklist from state**
3. **Packing-slip dead zone** · Receiving clerk / small warehouse · Packing slip never enters system; dock vs PO mismatch found later · Type into spreadsheet from paper/PDF · “Not invoice (no AP budget), not WMS transaction” · **unstructured→state + exception taxonomy**
4. **Three-way match exceptions (SMB AP)** · Owner/bookkeeper · Pay invoice for unordered/unreceived/wrong qty · Eyeball PDF vs email PO · Partial shipments and freight create silent overpays · **exception desk + evidence**
5. **Vendor bank-detail change fraud** · Anyone who pays vendors · Fraudulent email changes remittance; money wires to thief · Reply-in-thread “confirm” · Independent callback discipline fails under urgency · **validate before irreversible + audit log**
6. **COI lapse on active sub** · Small GC · Sub works after WC/GL expired; claim hits GC · Spreadsheet + calendar reminders nobody opens · Discover afterward when owner’s rep asks · **constrain pay/site entry from certificate state**
7. **Punch/snag WhatsApp burial** · Site PM · Defect “fixed” without verified photo; reappears at handover · Excel + WhatsApp group · Version chaos; trade demobilised · **verified closure evidence** *(category crowded — snag apps exist)*
8. **Move-out deposit evidence scramble** · Landlord / small PM · Deduction disputed; photos scattered; deadline window · Phone camera roll + Word letter · Courts favor tenant without paired evidence · **evidence pack** *(DepositPacket/RentSolve occupy exact packet workflow)*
9. **Grant report scramble** · Nonprofit program/finance · Deadline arrives; proof of outcomes scattered · Reconstruct from Drive/email · Work done; assembling proof is the project · **recover fragmented info → pack**
10. **Wedding/event day-of WhatsApp chaos** · Planner / coordinator · Dependency breaks (late truck → setup → ceremony) · Google Sheet run sheet + 6 WhatsApp groups · No live blocked-by state · **coordinate constrained workflows** *(Bekkn/Rundown occupy live runsheet class)*
11. **BEO vs kitchen drift** · Catering / hotel banquet lead · Kitchen cooks wrong version after verbal amendment · Print last BEO; hope · Guest count/allergen/menu mismatch at service · **compare + pre-service gate**
12. **Allergen matrix lag** · Multi-unit restaurant ops · Ingredient swap; printed/online allergen guide stale · Color-coded spreadsheet “LAST UPDATED…” · Guest-facing channels diverge · **propagate constraint from recipe state** *(meez occupies connected recipe→allergen)*
13. **HACCP paper log gaps** · Kitchen manager · Missing overnight reading / back-filled identical temps · Clipboard · Audit fails even if food was fine · **observe gaps / reconstruct honesty** *(sensor SaaS occupies continuous monitoring)*
14. **IEP accommodation delivery unproven** · SPED case manager · Gen-ed teacher never informed of accommodations · Email PDF; hope · File review finding · **delivery receipt + ack artifact**
15. **Lab freezer “where is vial X”** · Lab manager / student · Reagent expired or lost; experiment wasted · Spreadsheet box codes · Inventory drifts from physical boxes · **map/reconstruct location state**
16. **Invoice chase across WhatsApp** · Freelancer / small agency · Overdue balances; GST/VAT math errors · Word template + manual chase · Occupied by ClearWork/SimplifyClient-class CRMs · **(avoid — CRM forbidden)**
17. **Freelancer portal chaos (buyer side)** · Studio hiring freelancers · Briefs/invoices in email/Drive · Chase · Portal/CRM class · **(avoid — CRM)**
18. **Field truck stock miss** · Field tech · Parts not on truck; return trip · Tribal knowledge · Adjacent FSM inventory · thin alone
19. **Staff schedule last-minute swap** · Restaurant manager · Coverage hole; labor-rule risk · WhatsApp · Scheduling SaaS crowded
20. **Insurance claim evidence folder** · SMB owner after loss · Underpayment/denial for incomplete packet · Manual folder · Public adjuster / claim software adjacent
21. **Construction pay-app vs lien waiver gap** · GC AP · Pay without complete waiver packet · Email chase · Compliance suites adjacent
22. **School field-trip permission completeness** · Teacher / office · Bus leaves with incomplete forms · Clipboard · Gate from roster state
23. **Creator brand-deal deliverable drift** · Creator / manager · Missed post asset vs contract · Spreadsheet · Adjacent CRM/contract tools
24. **OSS release irreversible publish** · Maintainer · Tag/publish with version drift · Mental checklist · Executable checklist + stop gates (narrow, non-infra)
25. **Retail shelf vs invoice count** · Small retailer · Shrink/mismatch after delivery · Clipboard · Receiving exception cousin
26. **Property turnover task generation** · PM · Move-out notes don’t become work orders · Spreadsheet · PM platforms occupy
27. **DOT/audit evidence scramble (fleet SMB)** · Safety officer · Auditor asks; packet incomplete · Folder archaeology · Packet assemblers exist
28. **Peer-review / PR chase (small eng team)** · Dev lead · Ready code waits on invisible review · Slack ping · Board tools; developer-tooling primary — deprioritize
29. **Ops postmortem never written** · Ops lead · Knowledge dies after 3am incident · Manual Confluence · Adjacent AI doc tools; avoid generic
30. **Franchise visit checklist photo theater** · Area manager · Store “passes” without evidence · Paper checklist · Temporary ops + evidence

---

## 10 Products

| # | Name | User | One-line job | Core mechanism | Demo sketch | Notes |
|---|---|---|---|---|---|---|
| 1 | **ScopeBrake** | Solo trades tech | Block unpaid extras until customer signs a priced mid-job change | constrain + evidence before irreversible | Estimate → discover delta → SMS sign → unlock invoice line | **Advance** |
| 2 | **CallbackGate** | SMB AP / owner | Pause remittance-detail changes until independent callback + dual approve | validate before irreversible | Fake bank-change email → blocked pay → callback log → unlock | **Advance** |
| 3 | **AuthDayGate** | Clinic front desk | Day-of render gate from appointments + PA units/expiry export | executable checklist from state | CSV schedule + PA sheet → red/green at check-in | **Advance** |
| 4 | **BEODiff** | Banquet / catering lead | Diff approved BEO vs kitchen sheet / amendment dump before service | compare + gate | Two PDFs / paste amendments → mismatch list | Advance to concepts |
| 5 | **SlipException** | Receiving clerk | Packing-slip photo/PDF → lines → PO match → exception protocols | unstructured→state + exceptions | Upload slip + PO → qty mismatch queue | ThickDot/TableFlow same mechanism — **weaken** |
| 6 | **COIPayHold** | Small GC | COI expiry → hold pay-app / site badge | constrain from certificate state | Upload COI PDFs → expiry board → hold flag | Process blogs + modules adjacent |
| 7 | **ScramblePack** | Nonprofit admin | Funder requirement list + Drive dump → missing list + ZIP pack | recover → evidence pack | Template + folder → gaps + download | Sopact/Crafty/desk repos adjacent |
| 8 | **RunSheetLive** | Event planner | Temporary day-of dependency executor from run sheet | constrained coordination | Paste run sheet → blocked-by alerts | Bekkn/Rundown occupy — **weaken** |
| 9 | **ImplementAck** | SPED case manager | IEP-at-a-glance delivery + teacher ack receipt | evidence receipt | Generate glance → send → ack log | Narrow; education sales cycle slow |
| 10 | **TempGap** | Kitchen manager | Photo of paper HACCP log → structured + missing-window flags | observe gaps | Upload sheet photo → gap report | Sensor SaaS different mechanism; digital log apps crowded |

---

## 5 Concepts (tradeoffs)

### C1 — ScopeBrake
- **Tradeoff:** High demo clarity and personal visceral pain vs adjacent field-service suites (Jobber/ServiceTitan/FieldLoom) that already do estimates/signatures.
- **Why still open:** Suites sell “run the business”; primary job here is **mid-job hidden-condition → priced signed change → unlock continue/invoice**. Handshake unpaid extras remain the documented failure mode (Anvilfield field guide).
- **Risk:** Perceived as “Jobber feature.” Mitigation: one job; refuse CRM/scheduling/payments creep.

### C2 — CallbackGate
- **Tradeoff:** Extreme consequence (wire fraud) and crisp ritual vs thin “product” if it is only a checklist UI; AP fraud vendors exist for larger orgs.
- **Why still open:** SMB owners still follow reply-in-thread “verification”; independent-contact rule is process advice, not a hosted gate that **blocks** the payment update.
- **Risk:** Looks like compliance theater; need an irreversible action to gate (bank-detail write / payment release).

### C3 — AuthDayGate
- **Tradeoff:** Strong spreadsheet-hell evidence and cash impact vs PHI sensitivity and EHR modules (e.g. CharmHealth visit counters) for practices already on modern EHRs.
- **Why still open:** Billing blogs still prescribe **daily portal + tracking sheet**; small practices remain on spreadsheets; day-of **render gate** from exports is not “another EHR.”
- **Risk:** Demo honesty without live payer APIs; must use fixtures/exports, label clearly.

### C4 — BEODiff
- **Tradeoff:** Sharp pre-service failure and easy dual-document demo vs hospitality software + inspection templates (MangoApps BEO verification).
- **Why still open:** Template checklists ≠ automatic **version/amendment mismatch detection** from messy inputs.
- **Risk:** Niche buyer; event volume seasonality.

### C5 — ScramblePack
- **Tradeoff:** Universal “evidence scramble” pain vs crowded grant/compliance desk category (Sopact, Attainment, Crafty, OSS desks).
- **Why still open:** One-shot **requirement ↔ dump → gap → ZIP** for a single award deadline differs from portfolio grant platforms — but wedge is thinner under competitive pressure.
- **Risk:** Collapses into generic document folder UI.

**Cut from finalist advancement:** SlipException (exact dock PO-match agents), RunSheetLive (live runsheet platforms), TempGap/COIPayHold/ImplementAck (weaker wedge or slower GTM).

---

## 3 Finalists (full template each)

### Finalist 1 — ScopeBrake

- **One sentence:** A mid-job change-order gate that stops trades techs from eating unpaid extras — photo + priced delta + customer sign before work continues or the line hits the invoice.
- **User:** Solo / small-shop HVAC, plumbing, electrical technicians (and owners who still work in the field).
- **Pain:** Hidden conditions and customer “while you’re here” extras proceed on handshake; final invoice shocks; customer refuses; tech already spent labor and material. Field guides state verbal handshakes never get paid and uncontrolled change commonly costs ~10–15% of a job.
- **Existing workflow:** Text the customer; keep going; add lines later; argue; eat it. Or use a full FSM suite if they already live in Jobber/ServiceTitan — many solos do not, or still skip the CO ritual under time pressure.
- **Product workflow:** Load signed estimate/work order → on discovery, capture photo + description → generate priced change-order draft from price book / quick lines → send customer approval link (SMS/email) → **status machine:** `draft → sent → signed | rejected` → only `signed` unlocks “proceed” and unlocks those lines on the final invoice artifact → export signed CO PDF + photo evidence pack.
- **Core mechanism:** **constrain before irreversible** + **evidence pack** (not chat, not CRM).
- **Differentiation:** Not a scheduler/CRM/invoicing OS. Not FieldLoom’s primary “inspect→quote→get paid from driveway” close of the *original* estimate. ScopeBrake’s job is solely the **mid-job authorization gap**. Adjacent suites allowed under kill rule; exact primary-workflow duplicate not found as a focused product.
- **Demo (60–120s):** Open job with signed $500 drain repair → add “corroded line, +$800” with photo → invoice preview shows line **blocked** → mock customer sign → line unlocks → download signed CO + before photo. URL on screen.
- **Technical depth:** Authorization state machine; deterministic line-item join estimate↔invoice; photo evidence binding; anti-tamper timestamps; price-book assist without hallucinating totals as source of truth.
- **Production path:** Hosted demo with fixture jobs; later SMS provider + Stripe-free sign links; optional export into QuickBooks/Jobber — not required for OFFGRID.
- **Risks:** “Jobber does change orders”; SMS cost; users skip the gate anyway; scope creep into full FSM.
- **Kill condition:** Validation finds a product whose **primary marketed workflow** is mid-job priced change-order gate with sign-before-continue / sign-before-invoice-line for solo trades (same mechanism), or users refuse any friction mid-job.

### Finalist 2 — CallbackGate

- **One sentence:** A payment-detail change gate that blocks new vendor bank instructions until an independent callback and dual approval are logged.
- **User:** SMB owner, bookkeeper, or small AP clerk who pays vendors by ACH/wire/EFT.
- **Pain:** Urgent email/PDF asks to change bank details; staff “verify” by replying in-thread or calling the number in the request; funds leave; fraud discovered afterward. Primary process writing emphasizes: pause payment, call a number that existed *before* the request, dual approve, keep an audit log (insurers increasingly ask).
- **Existing workflow:** Tribal caution; spreadsheet of vendors; hope. Enterprise AP fraud tools exist for larger orgs — solos often have none.
- **Product workflow:** Vendor vault (known contacts/accounts, masked) → ingest change request → **hard pause** on remittance update / payment release → guided independent-contact picker (forces pre-existing number source) → callback log (who/when/what digits confirmed) → second approver → unlock change → first-payment watch flag.
- **Core mechanism:** **validate before irreversible** + deterministic audit artifact.
- **Differentiation:** Not a full AP automation suite or bank product. Not “AI that detects phishing.” The product is the **gated state transition** with an evidence log insurers/auditors can read.
- **Demo (60–120s):** Vendor “Acme” known account on file → paste urgent change email with new routing + new phone → UI refuses update → complete callback using *old* phone from vault → second approve → change unlocks → export verification receipt.
- **Technical depth:** State machine; contact-source provenance required fields; never trust in-request phone; masked account display; immutable event log.
- **Production path:** Hosted vault + gate; later email ingest; accounting export. Solo-buildable.
- **Risks:** Thin UX if no real payment integration; users bypass offline; fraud-category buzzword fatigue.
- **Kill condition:** Exact SMB-focused remittance-change gate with independent-callback enforcement as primary product is already dominant; or demo cannot show a real blocked action without fake banking theater.

### Finalist 3 — AuthDayGate

- **One sentence:** A day-of clinical-admin gate that tells front desk whether a scheduled service is renderable given prior-auth status, remaining units, and expiry — before the patient is in the chair.
- **User:** Front-desk / billing admin at small independent practices (PT, specialty clinic, outpatient) still running PA on spreadsheets/portals.
- **Pain:** PA pending/expired/units exhausted; service rendered; claim denied; retro auth rare. Guides still tell staff to update a tracking sheet every morning from payer portals and to confirm at check-in. AMA-linked burden narratives + billing vendors describe write-offs from slipped authorizations.
- **Existing workflow:** Spreadsheet + Availity/payer portals; EHR PA modules if on CharmHealth-class systems; otherwise human memory at check-in.
- **Product workflow:** Import today’s appointments (CSV) + PA register (auth #, CPT/units, expiry, status) → join on patient+service → **green / yellow / red** gate with reason codes (`expired`, `units=0`, `pending`, `mismatch modifier`) → printable day sheet + exception chase list → optional end-of-day unit decrement export.
- **Core mechanism:** **executable checklist from state** (not diagnosis, not clinical advice).
- **Differentiation:** Not an EHR, not a clearinghouse, not a chatbot. Standalone **renderability gate** for sheet-based shops. EHR visit counters are adjacent when the practice already bought that EHR — not the same user situation.
- **Demo (60–120s):** Fixture schedule of 12 patients → PA sheet with one expired, one units=0, one pending → check-in board lights red/yellow → one-click exception list for front desk. No live payer calls in MVP.
- **Technical depth:** Deterministic joins; unit arithmetic; expiry timezone honesty; reason codes; PHI-minimizing demo fixtures + clear non-production labeling.
- **Production path:** CSV-first hosted demo; later EHR export mappers. Strictly admin — no clinical claims.
- **Risks:** PHI/compliance; “our EHR already does this”; fixture-demo skepticism; healthcare sales cycle.
- **Kill condition:** For target sheet-based practices, a dedicated day-of PA render gate already owns the workflow; or cannot demo without implying live eligibility APIs we do not have.

---

## WORKING PRODUCT

# **ScopeBrake**

A mid-job change-order authorization gate for solo trades: capture the discovery, price the delta, get the customer’s signature, and only then unlock continued work and the invoice lines — so handshake extras stop eating the profit.

---

## Exact reason we should build it

The failure is concrete, frequent on jobs, and economically sharp: techs discover hidden conditions, keep working on a verbal “okay,” and later cannot collect — field practice writing treats unsigned extras as unpaid work and uncontrolled change as a double-digit profit leak. The product job is a **single constrained state machine** (unsigned → blocked; signed → allowed) with photo evidence, not another CRM, scheduler, notes app, or AI chat. Full field-service suites are adjacent competitors, not an exact primary-workflow duplicate of this gate. Demo is honest in a browser in under two minutes without fake enterprise connectors. Fits a solo builder’s Oct 1–4 hosted MVP and remains worth continuing as trades tooling after OFFGRID.

---

## Why this candidate (decision criteria)

1. **Sharp failure with primary evidence** — Anvilfield HVAC change-order guide: get the change signed before work or eat it; verbal handshakes never get paid; uncontrolled change ~10–15% of project. Plumbing work-order vs invoice guidance: mid-job expansion without written change order is how disputes start.
2. **Mechanism, not wrapper** — Authorization state + line-item constraint + bound evidence; LLM optional only for drafting descriptions, never as source of truth for money.
3. **Survives updated kill rule** — Jobber/ServiceTitan/FieldLoom/SoloPro/Roooster sell broader FSM/quote/pay OS. FieldLoom’s hero path is driveway close of inspections/estimates, not mid-job hidden-condition gating. No product found whose *primary* marketed job is this exact gate for solos.
4. **Demo honesty** — Blocked invoice line is a real observable, not fixture theater or dashboard cosplay.
5. **Builder fit** — AI/backend-strong solo can ship hosted state machine + PDF/photo + mock sign link without microservices.
6. **Continuation** — Trades still run on WhatsApp + hope; a narrow wedge can deepen (price books, jurisdiction templates) without becoming a fake “Uber for plumbers.”
7. **Why not CallbackGate / AuthDayGate as #1** — CallbackGate is slightly thinner as a standalone wow without payment rails; AuthDayGate carries PHI and “EHR already” objections that slow an honest OFFGRID demo. ScopeBrake is the clearest painful job → visible unlock.

---

## Competitive landscape (honest; competitors ≠ auto-kill)

| Player | What they do | Relation |
|---|---|---|
| **ServiceTitan / Jobber** | Full field service management; change orders exist as project/job features | Adjacent suite; CO is not the solo mid-job gate product |
| **FieldLoom** | HVAC inspect → report → estimate approval → payment on site | Adjacent; primary path is original estimate close, not hidden-condition CO gate |
| **SoloPro / Roooster / trAIde** | Solo trades quote/schedule/invoice OS | Adjacent business OS |
| **Anvilfield / LegalClarity guides** | Process education for change orders / work orders | Validate pain; not products |
| **DIY text + PDF** | Current workaround | No enforcement state machine |

**Not auto-killed:** crowded “trades software” category is fine; wedge is the gated mid-job authorization workflow.

---

## Risks

- **Suite-subset perception** — Mitigation: ruthless one-job positioning; no schedule/CRM/payments in MVP.
- **Behavior skip** — Techs may ignore the gate under customer pressure. Mitigation: owner-facing invoice lock is the enforcement surface.
- **SMS/sign dependency** — Mitigation: demo uses on-page mock customer sign; real SMS later.
- **Pricing accuracy** — Mitigation: human-entered lines + price book; no hallucinated totals.

---

## First three validation questions

1. **Willingness / friction:** Will 5 solo HVAC/plumbing techs (or owners who still wrench) actually pause mid-job to send a priced change-order link — or do they insist text “ok” is enough? What enforcement (invoice lock, owner notify) would make them use it?
2. **Exact-product search:** Does any shipped product market *mid-job sign-before-continue / sign-before-invoice-line change-order gating for solo trades* as its primary job (not as one screen inside a full FSM)? Name it with URL or clear it.
3. **Demo honesty:** Can we produce a hosted 90-second path (fixture estimate → blocked line → signature → unlock) that a judge believes without implying live Jobber/QuickBooks integrations we will not build for OFFGRID?

*(Next step = validation for ScopeBrake — **not** another discovery cycle.)*

---

## Fallback if ScopeBrake dies in validation

1. **CallbackGate**  
2. **AuthDayGate**  

Do not reopen AliasTripwire. Do not start a new discovery cycle unless both fallbacks also fail validation under the kill rule.

---

## Sources (URLs inspected)

Exa and/or Jina Reader this pass:

- https://anvilfield.com/field-guides/hvac/change-order-management-scope-control/ — change order signed before work; handshake unpaid; ~10–15% loss  
- https://legalclarity.org/plumbing-work-order-vs-real-invoice-what-to-include/ — work order vs invoice; change-order discipline  
- https://www.fieldloom.io/ — HVAC on-site report/estimate/pay (adjacent)  
- https://help.servicetitan.com/docs/create-a-change-order — ST change orders (suite feature)  
- https://community.getjobber.com/discussions/quoting/change-orders/1000 — Jobber CO confusion (supporting)  
- https://soloproapp.com/ / https://roooster.ai/trades/plumbing — solo trades OS (adjacent)  
- https://primecaremedicalbilling.com/blogs/build-a-prior-authorization-tracking-sheet/ — PA spreadsheet ritual; denials  
- https://staffingly.com/insights/blog/verify-eligibility-benefits-prior-authorization/ — eligibility vs benefits vs PA timeline  
- https://www.charmhealth.com/ehr/help/patientinfo/insurance/prior-authorizations-and-visit-counter-tracking.html — EHR-embedded PA counters (adjacent)  
- https://imagetotable.ai/blog/batch-extract-packing-slip-delivery-note-excel — packing-slip dead zone  
- https://beancount.io/blog/2026/09/01/three-way-match-accounts-payable-controls-duplicate-phantom-payments — SMB three-way match / exceptions / bank-change pause  
- https://agent.thickdot.com/ / https://tableflow.com/use-cases/packing-list-reconciliation — packing-list↔PO agents (exact adjacent to SlipException)  
- https://www.attainmentlabs.com/blog/grant-reporting-evidence-and-deadlines — grant evidence scramble  
- https://www.sopact.com/academy/grant-reporting-requirements — grant reporting re-collection pain  
- https://mandapchat.com/blog/wedding-day-run-sheet-template-indian-weddings — wedding run-sheet / WhatsApp chaos  
- https://bekkn.com/ / https://rundown.pro/ — live event runsheet platforms (exact adjacent to RunSheetLive)  
- https://www.inspectly360.com/industries/construction / https://insight-pro.io/en/blog/construction-task-management-software/ — snag/punch WhatsApp+Excel  
- https://dropcurb.com/blog/move-out-inspection-checklist — turnover / deposit evidence  
- https://taoapex.com/en/products/depositpacket-ca/ / https://rentsolve.ai/features/move-in-move-out-inspection — deposit evidence packet products (exact adjacent)  
- https://ezbilling.io/blog/certificate-of-insurance-tracking-a-gcs-checklist-for-renewals-and-lapsed-coverage — COI lapse → pay hold  
- https://workhand.app/blog/track-subcontractor-insurance-certificates/ — COI spreadsheet failure story  
- https://www.getmeez.com/blog/spreadsheets-fail-allergen-compliance-multi-unit-restaurants — allergen spreadsheet lag (meez occupies connected fix)  
- https://www.mangoapps.com/templates/inspections/banquet-event-order-beo-verification — BEO pre-service verification template  
- https://loopstring.io/tools/haccp-temperature-log — paper HACCP gap modes  
- https://compliantiep.com/learn/back-to-school-iep-case-manager-checklist — IEP teacher-inform requirement  
- https://news.ycombinator.com/item?id=38820465 / https://news.ycombinator.com/item?id=48820230 — SMB spreadsheet ops (supporting)  
- https://getclearwork.in/ / https://www.simplifyclient.com/ — freelancer invoice chase CRMs (forbidden shape)  

**Channels declared:** agent-reach Exa (`mcporter call exa.web_search_exa`) + Jina Reader (`curl https://r.jina.ai/URL`). Reddit/Twitter not used (backends off). Agent Reach version at check: v1.5.0 (latest).

---

**Status line for governance:** Working Product **ScopeBrake** named for validation — **not** permanently selected until validation passes. Discovery cycles **STOP**. Next: validation → (if pass) PRD → milestones. No `src/` / architecture until validation clears the reopen/selection path.
