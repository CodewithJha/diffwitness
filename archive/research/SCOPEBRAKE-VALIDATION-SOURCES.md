# ScopeBrake validation — sources

**Date accessed:** 22 September 2026  
**Method:** agent-reach (`agent-reach doctor --json`; Exa via `mcporter call exa.web_search_exa`; Jina Reader `curl https://r.jina.ai/URL`). Reddit/Twitter backends **off** — Reddit threads only as Exa highlights (secondary).  
**Rule:** Only URLs fetched (or explicitly labeled search-snippet-only) count as evidence. Do not invent pricing beyond what pages state. Do not claim “legally binding” as verified legal advice.  
**Agent Reach:** doctor run; Exa used until free MCP rate limit mid-pass; thereafter Jina Reader. `agent-reach check-update`: **v1.5.0** already latest.

---

## A. Pain / process (fetched)

| URL | What was verified | Label |
|---|---|---|
| https://anvilfield.com/field-guides/hvac/change-order-management-scope-control/ | Sign before work; verbal handshakes unpaid; ~10–15% uncontrolled change; mid-job extras + hidden conditions | FACT |
| https://contractorplus.app/blog/how-to-handle-change-orders-in-an-hvac-business/ | Pause until priced+approved; verbal approvals erode margin; document with photos | FACT (vendor process blog) |
| https://legalclarity.org/plumbing-work-order-vs-real-invoice-what-to-include/ | Work order vs invoice; authorization specificity; contact before large overrun | FACT |
| https://www.joist.com/workshop/estimating-pricing/how-to-use-change-orders-for-extra-work/ | Unpaid “while you’re here”; CO before start; Joist CO steps + signature | FACT |
| https://nudgepay.app/blog/scope-creep-contractor-billing | Stop→document→price→sign→bill; $25K–$50K/yr claim | FACT workflow; dollar range = vendor claim |
| https://www.getjobber.com/academy/what-is-a-change-order/ | Jobber Academy CO definition + process + template guidance | FACT (education; not native product depth) |

---

## B. Exact / near-exact primary-workflow products (fetched)

| URL | What was verified | Relation |
|---|---|---|
| https://mychangeorder.com/ | **Primary product:** 60s CO + T&M; GPS photos; rate cards; on-site/remote e-sign; PDF; one-click invoice; plumber/electrician/HVAC/GC; free 3/mo, $3.99/CO, $29/mo Pro | **KILL — same primary workflow** |
| https://mychangeorder.com/change-order-form | Digital CO form path fill→sign→PDF; same claims | Supports kill |
| https://tradetab.co/change-orders | Mid-job CO: scope+price → Approve link → invoice; plumbing/electrical/HVAC examples | Near-exact; homepage is invoice-primary |
| https://tradetab.co/ | Hero: invoice for solos; estimates + change orders included; $9/mo claim | Adjacent-to-exact |
| https://approveitapp.com/ | Quote + on-site sign + CRM/P&L; uses disputed-CO pain in copy | Adjacent mini-OS |
| https://digitalchangeorders.com/ | **402 Deployment Paused** | Not live evidence |
| https://www.clearstory.build/ | Commercial COR / T&M platform | Wrong ICP |
| https://esub.com/change-orders/ | Commercial subcontractor CO software | Wrong ICP |

---

## C. Named FSM / estimate suites (fetched)

| URL | Competitor | Notes |
|---|---|---|
| https://community.getjobber.com/discussions/team-management/requests-6-months-in/6071 | Jobber | User request: estimate within approved job for COs — “VERY clunky” |
| https://help.getjobber.com/hc/en-us/articles/15504167546391-Jobber-and-DocuSign-Integration | Jobber | DocuSign called out for change-order client sign-off (Exa + help; partial) |
| https://help.housecallpro.com/en/articles/9196840-estimates-on-jobs | Housecall Pro | Estimates on ongoing jobs; approve then copy to job |
| https://help.housecallpro.com/en/articles/918072-estimates-approvals-and-signatures | Housecall Pro | Mobile finger-sign estimates (Exa highlights + related) |
| https://www.housecallpro.com/features/estimating-software/ | Housecall Pro | Marketing: update change orders / additional work on-site |
| https://help.servicetitan.com/docs/create-a-change-order | ServiceTitan | Project-level CO via new estimate + Change Order toggle |
| https://help.servicetitan.com/docs/rfis-and-change-order-requests-overview | ServiceTitan | COR Draft/Sent/Responded/Approved/Rejected |
| https://www.servicetitan.com/commercial-playbook/commercial-change-orders | ServiceTitan | Commercial CO = new labeled job/contract (Exa) |
| https://support.joistapp.com/en/articles/9212730-change-orders | Joist | Native CO on invoices; Elite; optional signature; SMS/email; edit clears signature |
| https://contractorforeman.com/features/financials/change-orders/ | Contractor Foreman | COR → CO; e-sign; contract amounts update |
| https://help.buildxact.com/en/articles/3038641-how-do-i-make-variations-change-orders-on-contract-jobs | Buildxact | Variations → accepted → invoice selection |
| https://help.buildxact.com/en/articles/10763842-how-do-i-use-digital-signatures-in-buildxact | Buildxact | Digital signature on variations |
| https://help.fergus.com/en/articles/4034719-creating-and-managing-variations | Fergus | Variations as linked jobs for extra work |
| https://support.servicem8.com/help-center/servicem8-add-ons/forms/creating-a-simple-contract-variation-form | ServiceM8 | Contract Variation form + mandatory client signature |
| https://help.workiz.com/hc/en-us/articles/18053159710737-Collecting-client-signatures | Workiz | Estimate/invoice/custom-doc signatures (Exa) |

---

## D. Secondary / search-only (supporting; not sole kill)

| URL / item | Notes | Label |
|---|---|---|
| Exa Reddit highlights (e.g. r/legaladvice, r/HVAC, r/homeowners verbal vs invoice disputes) | Backends off; snippets only | SECONDARY |
| https://fieldservicesoftware.io/glossary/change-order-capture/ | Glossary of mid-job CO capture in FSM class | Secondary definition |
| Comparison blogs (ServiceM8 vs Tradify vs Fergus; FieldPulse vs Workiz) | Positioning; not feature-depth proof | Secondary |
| https://community.getjobber.com/discussions/quoting/change-orders/1000 | Prior hunt reference; not re-fetched this pass if redundant | Supporting only if previously cited |

---

## E. Failed / incomplete

| URL | Status |
|---|---|
| https://digitalchangeorders.com/ | Jina: 402 Deployment Paused |
| Exa after rate limit | “You’ve hit Exa’s free MCP rate limit” — remaining discovery via Jina |
| Live product signup / end-to-end MyChangeOrder click-through | **Not performed** — marketing + form pages only |
| FieldPulse deep CO help article | Not fully fetched; classified Adjacent on class evidence |

---

## F. Internal governance read this pass

- `research/FINAL-PRODUCT-HUNT.md`
- `research/DECISION-LOG.md`
- `research/REOPEN-GATE.md`
- `research/ANTI-FORCING.md`
- `research/PRODUCT-DISCOVERY-RESET.md`
- `research/ALIAS-TRIPWIRE-VALIDATION.md` (format reference)
- `docs/ENGINEERING-STANDARDS.md` (skim — no architecture written)
- `docs/FUTURE-ARCHITECTURE-RULES.md` (skim)
- `docs/WIN-PLAN.md` (skim)
- `docs/SUBMISSION.md` (not heavily cited)
- `AGENTS.md` / hackathon rules

---

## G. Channels declared

| Channel | Status this pass |
|---|---|
| Exa via mcporter | Used (until rate limit) |
| Jina Reader | Used extensively |
| Reddit / Twitter | Off — not used as primary proof |
| GitHub `gh` | Not required |
| Agent Reach version | v1.5.0 (latest) |
