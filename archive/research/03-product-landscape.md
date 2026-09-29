# Product landscape — HACK47: OFFGRID

**Date:** 21 September 2026  
**This is a map of existing product *types*, not a winner pick.**

## How professionals currently get the job done

| Job | What people actually use | Product shape | LLM role |
|---|---|---|---|
| Summarize week / meetings | ChatGPT/Claude paste; Notion AI; Slack AI; Granola; Otter; Fireflies; Zoom/Teams copilots | Generator | Core |
| Ship code faster | Cursor, Copilot, Claude Code, Codex, Continue, Aider, JetBrains AI | Generator / agent | Core |
| Review PRs | Humans + CodeRabbit / Graphite / Copilot review / Qodo | Comment bot | Core |
| Know if the AI product got worse | Spreadsheets (Hamel); LangSmith; Langfuse; Promptfoo; Braintrust; “vibe check” | Dashboard + traces | Mixed; Hamel says humans first |
| Trust a citation | Westlaw/Lexis; CourtListener; Crossref; scite; manual PDF open | Lookup | Should be none |
| Trust a dashboard number | Slack argument; Monte Carlo; dbt tests; GX; “ask the analyst” | Observability | Optional |
| Close books vs Stripe | Spreadsheet; Stripe reports; Puzzle/Pilot/Bench-class; accountant | Reconciliation | Optional |
| Pay invoices | ERP + email; Bill.com/Stampli/Ramp | Workflow + OCR | Assist |
| Keep API clients working | oasdiff in CI; Fern/Speakeasy/Stainless codegen; Pact; Postman | Diff + codegen | Optional |
| Clean flags | LaunchDarkly Cleanup/Vega; grep | Code search | Optional |
| Flaky CI | Retry; Datadog/Buildkite quarantine | Telemetry | None needed |
| OSS triage | Humans; stale-bot (hated); Dosu; GitHub Models recipes | Bot | Assist, if gated |
| Make site “accessible” | Overlays (failed class); axe in CI; paid audit; ignore until lawsuit | Widget vs source fix | Overlay used AI as marketing |
| Meter AI cost | Helicone, Langfuse, OpenMeter, Lago, vendor bills | Metering | None |
| HitL for agents | HumanLayer; custom Slack approve buttons; “don’t give prod credentials” | Gate | None needed for the gate |

## Category crowding (death ratings for a 3-week solo)

**Avoid (incumbent or 2023–2026 gold rush):**

1. Generic chat / RAG / “second brain”
2. Generic coding copilots and issue-to-PR agents
3. Meeting notetakers
4. LLM observability dashboards (Langfuse 34.9k★, Promptfoo 25.3k★, Helicone 6.2k★ + closed LangSmith)
5. Data observability SaaS (Monte Carlo, Bigeye, Metaplane, Anomalo, Elementary, Soda, GX-now-Fivetran)
6. AP automation suites
7. Feature-flag platforms
8. Flaky-test platforms
9. Trust-center / security questionnaire (Vanta, Drata, SafeBase, Conveyor)
10. Accessibility overlays
11. Usage billing platforms (Lago 10.6k★, OpenMeter 2.3k★)

**Less crowded but not empty (possible wedges, still kill-tested in later files):**

1. **Citation / URL / DOI / case-law existence checks** as a *verifier*, not a researcher. Legal research SaaS exists; “does this cite exist and does the quote appear at that pinpoint?” is a narrower job. CourtListener + Crossref are public.
2. **Independent, non-model-authored audit log + approval for destructive agent tools.** HumanLayer occupies HITL API; coding-agent vendors are adding planning modes after incidents. A demo of “receipt vs agent’s story” is distinctive; distribution is the killer.
3. **Error-analysis workflow for ~100 traces** (open coding, cluster, count) rather than another score dashboard. Hamel’s own method still uses Excel. That is a UX hole — and also a sign the market may not pay for it.
4. **Three-way live-vs-spec-vs-SDK** as a hosted 20-second demo. oasdiff is CLI; Fern/Speakeasy sell generation. Showing a live 404 vs a green spec is demoable. Crowded enough to be a feature, not a company, unless the UX is brutally specific.
5. **Source-level a11y CI that refuses to claim WCAG/EAA compliance** and opens a component repro. Overlay class is radioactive; axe is a library. Honesty could be the product. Market may still want the lie (overlays sold well until FTC).

## Mechanisms that are overused in 2026 hackathons (INFERENCE, labeled)

**INFERENCE from Exa/HN/GitHub this pass, not a census:** “agent that uses tools,” “RAG over your docs,” “dashboard of LLM scores,” “PR review bot,” “meeting notes to tickets.” Judges who click 87 demos will have pattern-matched these in the first 10 seconds.

Mechanisms that still look like *products* rather than prompts:

- Contract diff (OpenAPI, proto, SQL schema)
- Replay / canary of a **long session**, not a toy prompt
- Cryptographic or at least append-only **receipts** of tool calls
- HTTP/DOI/docket **existence probes**
- Accessibility **tree** inspection (axe, not a widget)
- Financial **identity keys** (payout `po_xxx`, invoice number) rather than NLP “match”

## Local-first vs hosted (constraint)

Hackathon requires a **public demo URL**. Local-first can mean: sample stays in the browser, optional model call disclosed, no silent training. It cannot mean localhost-only.

Sensitive domains (books, legal files, production traces) fight the demo: you need **fixtures that look real and are public**. Mata citations, a toy OpenAPI, a known-bad HTML page, a public GitHub issue corpus, and a synthetic Stripe payout CSV are demo-legal. Customer Gmail is not.

## Where AI is a genuine advantage vs a costume

| Mechanism | If you remove the LLM | Still a product? |
|---|---|---|
| Citation existence | Yes — HTTP 404 / CourtListener miss is the value | Yes |
| OpenAPI breaking diff | Yes — oasdiff | Yes (maybe too small) |
| Axe CI | Yes | Yes |
| Payout ID match | Yes | Yes |
| Trace clustering / open coding | Partial — embeddings help; humans still label | Maybe |
| “Shippable brief from notes” | No | No |
| Overlay “compliance” | The remaining JS widget is harmful | Must not exist |
| Uncalibrated LLM judge | You still have a biased rater | No |

**Rule used in later scoring:** high AI-leverage scores are only allowed when the LLM is doing something a regex cannot, *and* the product still works if the LLM is wrong (human gate, or deterministic core).

## Adjacent research artifacts (not products)

- GROBID / Nougat / Marker / MinerU / Unstructured: PDF layout. Crowded libraries.
- SWE-bench / LiveCodeBench / Terminal-Bench: eval harnesses, not products.
- Overlay Fact Sheet: political/technical consensus document, 1,031 listed signatories on the fetched page.

## Landscape conclusion

The market is **full of generators** and **full of dashboards**. It is relatively less full of **boring verifiers with receipts**. That does not automatically make a verifier win OFFGRID: incumbents can add a checkbox, and a 3-week demo can look like a weekend CLI wrapper (reproducibility test will be harsh). See `04-competitive-analysis.md`.
