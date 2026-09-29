# Technical feasibility — shortlist only

**Date:** 21 September 2026  
**Depth:** enough to kill infeasible ideas, not an implementation spec. No product code in this repo from this workstream.

## Shared constraints

- Solo builder; **MVP 1–4 Oct**; submit **14 Oct**; hard clock **15 Oct 2026 04:00 UTC**; demo live through **25 Oct**.
- Hosted URL required. Local-first = honest about what leaves the browser.
- Disclose AI tools used to build/run.
- Prefer Node as in scaffold; not mandatory.
- **Do not** depend on judge OAuth to Gmail/Stripe/GitHub if the wow-path can use fixtures.

## Per-concept feasibility

### CiteCheck — Moderate — 3-week **Yes** (existence); pinpoint **Maybe**

| Layer | Sketch |
|---|---|
| Frontend | Paste document; highlight cites; red/green list |
| Backend | Parse citations; call CourtListener / Crossref / HTTP HEAD |
| DB | Optional cache of public metadata only |
| Queue | Only if batch PDFs |
| AI | Optional NER; **default off** |
| Storage | None of user docs if possible |
| Observability | Upstream 429s |
| Auth | Demo none |
| Deploy | Worker + static |

**Hardest:** reporter collisions, pinpoint quotes, unpublished cases.  
**Biggest unknown:** false reds on valid cites destroy trust (Mata-level irony).  
**Demo reality:** CourtListener rate limits; network; fixture must include *known* fakes from the public opinion so we don’t invent new fake cases.  
**Security:** privileged text; cite-only egress; no training; CSP; prompt injection if we ever send full memo to an LLM — **don’t**.  
**Kill if:** we cannot get a real CourtListener success in the demo environment.

### Action Receipt — Moderate — 3-week **Yes** as simulated agent

Real wrapping of Cursor/Codex: **Hard / Extremely hard** in 3 weeks.

| Layer | Sketch |
|---|---|
| Frontend | Split view: agent chat vs receipt |
| Backend | Tool proxy; append-only log (hash chain optional) |
| DB | Log store |
| Queue | No |
| AI | Mock or one billed model with **no** prod tools |
| Auth | Demo none |

**Hardest:** covering real runtimes.  
**Unknown:** whether judges accept a mock agent. If they don’t, this dies.  
**Demo reality:** don’t actually drop a real DB.  
**Security:** log redaction; agent must not write the log.

### Canary Session — Hard — 3-week **Yes only with a fake/scripted runtime**

True multi-hour replay against Claude Code: **Extremely hard** (cost, flake, provider).

| Layer | Sketch |
|---|---|
| Frontend | Report |
| Backend | Runner + assertions |
| Queue | Yes |
| Storage | Golden traces |
| AI | Provider API — **rate/cost** |

**Hardest:** distinguishing flake from regression.  
**Unknown:** timeout on judge laptop/network.  
**Security:** sanitize goldens.

### Trace Autopsy — Easy/Moderate — 3-week **Yes**

All fixture JSONL. Langfuse import later.

**Kill if:** demo is indistinguishable from a spreadsheet.

### Spec Triangle — Easy/Moderate — 3-week **Yes**

Use a **fixture API we control** so live doesn’t move.

**Kill if:** judges view-source and see `npx oasdiff`.

### Merge Preflight — Moderate — 3-week **Yes** without GitHub App; App review may miss 14 Oct

Use a demo repo + local page if App delayed.

**Unknown:** GitHub marketplace timing.

### SourceFix — Moderate — 3-week **Yes** for axe-on-URL; component mapping **Maybe**

**Kill if:** overlay-comparison demo is confusing. **Never** say compliant.

### SQL Grain Diff — Easy — 3-week **Yes**

sqlglot in worker or WASM.  
**Kill if:** looks like CS homework.

### Docs Click — Hard — 3-week **Risky**

Headless browsers on cheap hosts flake. **Not recommended as primary.**

### Honest Patch — Moderate — 3-week **Yes** if we **never** execute untrusted install scripts

Prefer parse `package.json` + `.d.ts` without `npm install`. If install required, isolate.

## Builder fit vs evidence

Builder is strong at AI/LLM/agents. That is a **trap** (cluster D failures). Feasible ≠ should. The feasible *and* less-killed ideas are verifiers with a deterministic core.

## What is Extremely hard / out of scope

Warehouse observability, AP ERP, wrapping all agent IDEs, hardware, legal research completeness, EAA certification product.
