# ScopeBrake — Product Validation

**Date:** 22 September 2026  
**Candidate status entering validation:** Working Product (Final Product Hunt) — not permanently selected  
**Method:** agent-reach Exa (`mcporter`) + Jina Reader (`r.jina.ai`); Reddit/Twitter backends off (doctor) — Reddit URLs used only as Exa search highlights, labeled secondary. No application code. No architecture. No PRD.  
**Labeling:** FACT = fetched primary source. INTERPRETATION = reasoned from facts. HYPOTHESIS = untested.  
**Discovery:** CLOSED. This pass validates ScopeBrake only.

---

## Verdict (one line)

**KILL** — the mid-job unpaid-extra pain is real and recurring for solo residential trades, but a shipped product already markets that **same primary workflow** (priced mid-job change order + photo evidence + customer e-sign → invoice path) for the same ICP.

---

## 1. Core pain

### Exact failure

**FACT:** Solo / small residential trades discover mid-job extras (hidden conditions, “while you’re here,” code upgrades). Work proceeds on verbal handshake or text “ok.” Extras appear on the final invoice or never get billed. Customer disputes; tech already spent labor/material.

### Who

Solo / small-shop HVAC, plumbing, electrical, roofing, remodeling, general residential service — techs and owner-operators who still work in the field.

### Evidence of pain (not generic GC commercial CO alone)

| Source | What it shows | Label |
|---|---|---|
| [Anvilfield HVAC change-order field guide](https://anvilfield.com/field-guides/hvac/change-order-management-scope-control/) | “Get the change signed before you do the work, or you eat it. Verbal handshakes never get paid.” Uncontrolled change ~10–15% of project / whole profit on thin jobs. Mid-job customer extras + hidden conditions as triggers. | FACT |
| [Contractor+ HVAC CO process guide](https://contractorplus.app/blog/how-to-handle-change-orders-in-an-hvac-business/) | Pause until documented, priced, approved in writing (except safety/code). Verbal approvals and delayed pricing erode margin. | FACT (vendor blog; process claims) |
| [LegalClarity plumbing work order vs invoice](https://legalclarity.org/plumbing-work-order-vs-real-invoice-what-to-include/) | Mid-job expansion without clear authorization → scope disputes; invoice should reference work order; significant overrun should contact customer before doing. | FACT |
| [Joist: charge for extra work](https://www.joist.com/workshop/estimating-pricing/how-to-use-change-orders-for-extra-work/) | “While you’re here” unpaid favors; script to send CO and get Approve before starting; digital signature before extra work. | FACT (vendor education; same failure narrative) |
| [NudgePay scope-creep billing](https://nudgepay.app/blog/scope-creep-contractor-billing) | Stop → document → price → signed approval → bill. Claims $25K–$50K/yr unbilled extras for contractors lacking a system — **vendor estimate, not audited**. | FACT that the *workflow advice* exists; dollar range = vendor claim |
| Exa highlights of Reddit/homeowner dispute threads (plumber/HVAC verbal vs invoice) | Customer-side disputes when extras appear without mid-job written approval. | SECONDARY (backends off; snippet-only — not sole proof) |

**INTERPRETATION:** Pain is industry-process consensus for residential trades, not only commercial construction COR bureaucracy. Frequency is “every job with unknowns / add-ons,” not a one-off.

**Economic consequence:** Labor + material already spent; dispute or write-off; Anvilfield’s ~10–15% uncontrolled-change figure is an industry estimate cited in a field guide — treat as directional, not audited study.

---

## 2. Narrowest initial customer (A–F)

| | |
|---|---|
| **A. Role** | Owner-operator / solo tech who still prices and talks to the homeowner on site |
| **B. Trade** | Residential HVAC service/install or residential plumber (highest “open wall / find surprise” rate in sources) |
| **C. Job type** | Same-day or 1–3 day service/repair with a signed estimate or work order already in place |
| **D. Software today** | Often none for mid-job CO — text + memory; or Joist/Jobber/Housecall Pro estimate→invoice without a clean CO ritual; **not** ServiceTitan-scale commercial PM |
| **E. Device** | Phone in the truck / at the fixture; intermittent connectivity |
| **F. Refusal path** | Customer declines priced change → tech stops extra work, finishes original scope, invoices original only |

### Typical workflow today (INTERPRETATION from process guides + suite help docs)

1. Job sold / estimate approved (or verbal on small jobs).  
2. Tech discovers delta mid-job.  
3. **Who talks to customer:** the tech on site (solos); sometimes office by phone.  
4. **Pricing:** head math, price book memory, or callback to office — often delayed.  
5. **Approval today:** verbal / SMS “ok” / keep working.  
6. **Invoicing:** add lines at end or forget; argue later.  
7. **Signature practicality:** high when customer is home; remote link needed when not.  
8. **Connectivity:** offline creation matters (MyChangeOrder / ApproveIt market this).

---

## 3. Enforcement — invoice-lock + auth state

### Is invoice-lock valuable?

**INTERPRETATION:** Yes *inside* a system that is the invoice source of truth: unauthorized lines stay `NOT_BILLABLE` until `AUTHORIZED`. That matches Anvilfield/Joist discipline (“don’t bill what wasn’t signed”).

### Bypass risk

**FACT / INTERPRETATION:** High. A gate that does not own remittance still allows: cash invoice, QuickBooks draft, paper invoice, “Pro approve” overrides (Housecall Pro docs allow Pros to approve estimates on customer behalf). Owner-operators can skip their own gate under time pressure — Anvilfield acknowledges friction is the hard part.

### Strongest enforcement (ordered)

1. **Line-level `NOT_BILLABLE` until auth** in the same artifact that becomes the customer invoice (hardest soft-bypass inside the product).  
2. **Immutable signed snapshot** (scope + price + timestamp + signer identity artifact) — dispute evidence.  
3. **Photo/evidence bound to that snapshot** — condition proof.  
4. **Post-approval edit clears signature / requires re-auth** (Joist documents signature removal on edit).  
5. **Owner exception path** with logged override reason (for safety/code proceed) — without silent free billables.

**INTERPRETATION:** Enforcement is useful as *discipline + evidence*, not as legally binding court guarantee. Do **not** claim “legally binding” as product truth; claim strong authorization evidence only.

**HYPOTHESIS:** Invoice-lock alone does not differentiate ScopeBrake if a focused competitor already does sign → one-click invoice from the signed CO (see MyChangeOrder).

---

## 4. Competitors deep

### Kill rule reminder

Suite feature ≠ auto-kill. Kill when **same user + same primary workflow + same core mechanism** is solved sufficiently well.

### Twelve competitor questions (applied to each named player)

1. Primary marketed job?  
2. Mid-job priced CO / variation?  
3. Customer remote approval link?  
4. On-device / mid-job signature?  
5. Hard invoice / billable lock until authorized?  
6. Photo / evidence binding?  
7. Solo residential ICP fit?  
8. Complexity / price barrier for solos?  
9. Same **primary** workflow as ScopeBrake?  
10. Same core mechanism (auth gate before billable)?  
11. Suite-buried feature vs focused CO product?  
12. Implication for ScopeBrake?

### Named competitors

| Competitor | Q1 Primary job | Q2 Mid-job CO | Q3 Remote approve | Q4 On-device sign | Q5 Invoice lock | Q6 Evidence | Q7 Solo fit | Q8 Barrier | Q9 Same primary WF? | Q10 Same mechanism? | Q11 Shape | Q12 Implication |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Jobber** | Full FSM (schedule/quote/job/invoice) | Academy teaches COs; community asks for estimate-within-job CO (“VERY clunky”); DocuSign for change sign-off | Quote Client Hub yes; native mid-job CO weak | Job collect signature exists | Not a hard unauthorized-line lock found | Notes/PDF | Yes (SMB homeservices) | Mid | **No** | Partial | Suite + education | Adjacent; gap acknowledged by users |
| **Housecall Pro** | Full FSM | **Estimates on Jobs** for upsell/change on ongoing job; copy approved option to job | Email/text estimate approve | Mobile finger-sign on estimate | Pro can approve on behalf | Photos in broader product | Yes | Mid–high | **No** (estimate-on-job inside suite) | Partial | Suite feature | Adjacent |
| **ServiceTitan** | Enterprise FSM / projects | Project **change orders** + COR statuses; commercial playbook | Project/estimate sold flow | Contract/job signatures in suite | Project billing / App for Payment oriented | File upload on COR | Weak for true solos | High | **No** | Partial (project CO) | Enterprise suite | Adjacent / wrong ICP |
| **FieldPulse** | SMB FSM estimate→pay | Estimate/invoice conversion (help); not fetched as CO-primary | Estimate/invoice flows typical of class | Typical of class | Not verified as hard lock | Typical | Yes | Mid | **No** | Unknown/partial | Suite | Adjacent |
| **Workiz** | Residential FSM | Signatures on estimates/invoices/custom docs; not CO-primary product | Client portal sign on estimates | Mobile signatures | Signature optional on invoice | Custom docs | Yes | Mid | **No** | No | Suite | Adjacent |
| **ServiceM8** | Mobile job card FSM (AU/NZ skew) | **Contract Variation form** template (nature, cost, tax, **mandatory signature**) | Forms / job card | Signature on form | Form completion ≠ invoice lock proven | Photos on job cards | Solo-friendly | Lower tier exists | **No** (form inside FSM) | Partial | Suite + form recipe | Adjacent |
| **Fergus** | Trade quote→cash OS | **Variations** = linked jobs for extra work; invoice from parent+variations | Quote/sign-off features | Mobile sign-off | Variation invoicing, not UNAUTH lock | Photos | Small crews | Mid | **No** | Partial | Suite | Adjacent |
| **Tradify** | Job costing / multi-stage trade projects | Quote revisions / costing (comparison blogs) | Not verified as ScopeBrake twin | Mobile field features | Costing-focused | Typical | Builders more than solo service | Mid | **No** | No | Suite | Adjacent |
| **Joist** | Solo estimate / invoice OS | **Native Change Orders** on invoices (Elite); optional signature; SMS/email send; edit clears signature | Yes | Yes | CO appends to invoice; signature optional toggle — **not** proven hard `NOT_BILLABLE` without sign | Limited vs GPS CO apps | **Strong** solo fit | Elite paywall for CO | **Close but no** — primary job is estimate/invoice, CO is feature | Strong partial | Focused invoicing OS + CO feature | Strong adjacent; still not CO-only primary |
| **Contractor Foreman** | Construction PM + financials | Dedicated CO / COR → e-sign; updates contract amounts | Online e-sign | Yes | Financials update on approve | Custom fields | Builders/GCs more than solo service | Full suite | **No** | Partial | Construction suite | Adjacent / ICP skew |
| **Buildxact** | Builder estimating / jobs / variations | Variations with digital signature share; accepted → invoice selection | Client portal / email sign | Digital signature | Accepted variations become invoiceable selections | Job costing | Residential builders | Mid | **No** (builder OS) | Partial | Estimating suite | Adjacent |
| **Others — MyChangeOrder** | **60-second change orders & T&M tags** for contractors | **Yes — hero product** | Remote email sign link | On-phone finger sign | One-click invoice **from signed** CO/T&M | GPS-stamped before/after photos | Explicit electrician/plumber/HVAC/GC | Free 3 CO/mo; $3.99/CO; $29/mo Pro (**site pricing**) | **YES** | **YES** (document → sign → invoice) | **Focused CO product** | **KILL evidence** |
| **Others — TradeTab** | Invoice-first for solos ($9/mo site) | Dedicated change-order page: scope+price → Approve link → invoice | No-login Approve link | Approve tap | Convert approved CO → invoice | Job photos in broader app | Solo trades | Low | **Close** — CO is major marketed path but homepage primary is invoicing | Strong partial | Lightweight invoice + CO | Adjacent-to-exact; not sole kill |
| **Others — ApproveIt** | On-site quote sign-off + CRM/P&L | Markets disputed CO pain; hero is quote builder + CRM | Hand phone to customer | Finger sign | Quote/PDF path | Job photos | Trades | $97/mo (site) | **No** (broader OS) | Partial | Mini business OS | Adjacent |
| **Others — Clearstory / eSUB** | Commercial COR logs / sub PM | Yes, purpose-built commercial CO | Stakeholder review workflows | T&M tags / e-sign class | COR → billing systems | Heavy backup | Commercial GC/subs | High | **No** (wrong ICP/complexity) | Related mechanism, different user | Commercial CO platforms | Irrelevant to solo residential kill |
| **Others — Digital Change Orders** | (marketed as digital CO) | — | — | — | — | — | — | — | Unknown | Unknown | Site returned **402 Deployment Paused** on fetch | Not usable as proof of a live competitor |

### Closest competitor

**MyChangeOrder** (`https://mychangeorder.com/`) — **same primary workflow: YES.**

**FACT (homepage fetch):** Markets change orders + T&M tags with GPS photos, rate cards, on-site or remote e-sign, instant PDF, one-click invoicing; built for electricians, plumbers, HVAC, GCs; “get it signed before you open the wall”; free tier + pay-per-CO + $29/mo Pro.

**Joist** is the strongest *suite-adjacent* for the same solos already invoicing in-app, but its primary marketed job is estimates/invoices, not a CO-only gate.

### Discovery correction

Final Product Hunt stated no product whose *primary* marketed job is this gate for solos. **Validation falsifies that claim** for MyChangeOrder.

---

## 5. MVP boundary

### Necessary (if this were advanced — recorded for completeness)

- Job/estimate baseline reference  
- Mid-job CO draft: scope lines + human-entered prices + photo  
- Customer approval link + signature capture  
- Auth state machine + invoice artifact where unsigned extras cannot be marked billable  
- Export signed CO PDF + evidence pack  
- Hosted demo URL  

### NOT in MVP / not the product

CRM, scheduling, dispatch, payroll, inventory, full accounting, payments theater, generic AI “writes your change orders,” multi-crew PM, commercial COR logs.

---

## 6. AI necessity verdict

**Not needed.**

Pricing and authorization must be deterministic human/price-book inputs. Optional later: draft *description* text from a photo — never money, never auto-approve. Product must not be “AI writes change orders.”

---

## 7. Honest 90s demo (would have been)

Fixture: signed $500 drain repair → tech adds corroded line +$800 with photo → invoice preview shows line **blocked / NOT_BILLABLE** → customer mock-sign in-browser → line **BILLABLE** → download signed CO PDF. No fake Stripe/QuickBooks.

**INTERPRETATION:** Demo remains *technically* honest and strong — but **undifferentiated** vs MyChangeOrder’s marketed path. Demo quality does not resurrect a killed wedge.

---

## 8. Conceptual state machine (recorded; not architecture)

### Change-order document states

`DRAFT` → `SENT` → `VIEWED` → `APPROVED` | `REJECTED` | `EXPIRED` | `CANCELLED`

### Authorization states (per CO / line bundle)

`UNAUTHORIZED` → `AUTHORIZED` | `REJECTED` | `EXPIRED`

### Billing states (per line)

`NOT_BILLABLE` | `BILLABLE`

### Invariant

**A line must not become `BILLABLE` from technician create alone.** Only `AUTHORIZED` (customer approve/sign path, or logged owner exception) may flip `BILLABLE`.

### Edge cases (list, not over-engineer)

- Customer not on site → remote link  
- Customer refuses → stay `NOT_BILLABLE`; finish original scope  
- Safety/code proceed without sign → logged `EXCEPTION` override; still not silent billable without policy choice  
- Edit after approve → invalidate signature; return toward `UNAUTHORIZED` / `NOT_BILLABLE`  
- Expiry of unapproved send  
- Partial approve (out of MVP)  
- Offline draft sync (nice-to-have; MyChangeOrder already markets it)

---

## 9. Security / trust (conceptual requirements only)

| Concern | Stance |
|---|---|
| Signed approvals | Capture signature image/gesture + signer name + time; claim **authorization evidence**, not “legally binding” in product copy |
| Timestamps | Server-side event times on send/view/sign |
| Tamper resistance | Immutable snapshot of approved scope+price; edits require re-auth |
| Identity | Link does not prove legal identity; SMS/email delivery + optional signer typed name |
| Audit | Append-only event log (created/sent/viewed/signed/rejected/overridden) |
| Link security | Unguessable token; expiry; single-purpose approve URL |
| Replay | Signed snapshot version id; replaying old link cannot alter new prices |
| Post-approval change | Any material edit clears `AUTHORIZED` / signature |
| Permissions | Tech can draft/send; only customer auth or owner exception flips billable |

---

## Decision criteria check

| Criterion | Result |
|---|---|
| User clear | Yes — solo residential trades |
| Pain real / recurring | Yes |
| Financial consequence meaningful | Yes (directional) |
| Credible **workflow gap** | **No** — MyChangeOrder (+ Joist CO feature) occupy |
| Enforcement useful | Useful in principle; not a unique empty wedge |
| Focused feasible | Yes, but clone risk |
| Demo strong | Yes, but undifferentiable |
| Production path credible | Yes technically; **not** a differentiation win |

**ADVANCE** fails on workflow gap / undifferentiable.  
**MODIFY** would require a *different* primary job without rediscovery — no honest revision found that keeps “mid-job CO auth gate for solos” without colliding with MyChangeOrder/Joist. Narrowing to “invoice-lock only” without owning invoicing is weaker than MyChangeOrder’s signed→invoice path.  
**KILL** applies: exact primary workflow solved sufficiently well by a focused product.

---

## DECISION: KILL

### Evidence (summary)

1. **Pain valid** — Anvilfield, Contractor+, LegalClarity, Joist education, vendor process blogs.  
2. **Exact primary-workflow occupation** — [MyChangeOrder](https://mychangeorder.com/): mid-job priced CO + evidence + customer e-sign + invoice from signed CO for electrician/plumber/HVAC/solo crews.  
3. **Strong adjacent for same solos** — [Joist Change Orders](https://support.joistapp.com/en/articles/9212730-change-orders) with optional signature and SMS/email.  
4. **FSM suites** (Jobber/HCP/ServiceTitan/etc.) are adjacent features, not the kill alone — kill is MyChangeOrder primary match.  
5. Building ScopeBrake as proposed would be an undifferentiable clone under OFFGRID originality / anti-forcing standards.

### Fallback (from Final Product Hunt; not validated here)

1. CallbackGate  
2. AuthDayGate  

Do not rename ScopeBrake and continue. Do not start architecture/PRD/`src/` for ScopeBrake.
