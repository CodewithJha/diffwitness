# Spec Triangle — adversarial kill test

**Date:** 21 September 2026  
**Candidate:** Spec Triangle only. Do not defend. Do not generate alternatives.  
**Method:** Primary-page fetch (GitHub `gh` + Jina Reader + Exa + Cursor WebSearch/WebFetch). No product code. oasdiff was **not** installed; `src/` was not touched.  
**Prior suspicion (confirmed):** `research/06` reproducibility = weekend; `research/08` “fatal wrapper risk”; `research/10` “if no visual oasdiff cannot match in 20s, stop.”

**Verdict: KILLED**

---

## Thesis (to attack)

API contracts disagree across (1) declared OpenAPI (2) live/production behavior (3) generated SDK surface. The product exposes the contradiction visually. Example: OpenAPI `GET /users/{id}` → 200; live → 404; SDK `getUser(id)` exists.

The thesis is real as a *failure mode*. It is not a product. Each vertex is already owned. Collating three strings into a hosted table is a weekend wrapper around tools that already exist, one of which already has a hosted visual.

---

## Kill test A — oasdiff (fetched, not guessed)

**Repo:** https://github.com/oasdiff/oasdiff  
**Inspected 21 Sep 2026:** `gh repo view` + Jina of README + Jina of https://www.oasdiff.com/ + Jina of https://www.oasdiff.com/docs/breaking-changes + Jina of https://github.com/oasdiff/oasdiff/blob/main/docs/BREAKING-CHANGES.md + Jina of https://www.oasdiff.com/docs/monitor-external-apis. `gh issue list` (latest 30). `gh search code` for live/SDK in-repo.

| Fact | Evidence |
|---|---|
| What it is | “Command-line tool to compare and detect breaking changes in OpenAPI specs.” Apache-2.0. **1,373** stars, **107** forks, last push **21 Sep 2026**. Homepage https://www.oasdiff.com. |
| Inputs | Two OpenAPI documents (local files, http/s URLs, git revisions). YAML or JSON. OpenAPI 3.0 / 3.1 / 3.2. |
| What it detects | Spec-to-spec diffs. Homepage claim: **755** distinct change checks; “more than 15,000 possible edits” classified. Commands: `breaking`, `changelog`, `diff`, `summary`, plus `validate` / `upgrade` / `flatten` on a *single* spec. |
| Breaking rule (quoted) | “oasdiff judges a change against the API contract your OpenAPI definition declares, **not against what a particular server happens to accept**.” A change is breaking if a consumer that followed the old contract can stop working under the new one. |
| CI / product | GitHub Action; pre-commit; `--fail-on ERR\|WARN\|INFO`; HTML / Markdown / JSON / JUnit / GitHub Actions output. |
| Hosted visual **already exists** | CLI `--open` uploads the comparison and opens a **side-by-side review in the browser**. Free web tool at https://www.oasdiff.com/diff: “Paste two OpenAPI specs and get breaking changes, changelog, raw diff, or a side-by-side view — instantly, no install required.” oasdiff Pro: PR comment + approve/reject + commit status. HTML changelog example is a published artifact. |
| Traction (vendor homepage, not independently audited) | “★ 1.4K GitHub stars · 14M+ downloads”. Logo row: MongoDB, Stripe, LEGO, IKEA, Spotify, Microsoft. |
| Sync sibling | `oasdiff/sync` watches *published OpenAPI files* (GitHub URLs) and Slack-notifies on spec diffs. Still spec-to-spec. |

### Live API drift? Production responses? SDK surface?

**No. Intentionally not.**

Quoted from BREAKING-CHANGES.md (same text in the GitHub file and restated on the site):

> This matters because an OpenAPI definition declares which requests and responses are valid, but **most servers do not enforce it at runtime**, and a server may quietly accept a request that the contract says is invalid. oasdiff still reports the change as breaking, because other consumers of the same contract do enforce it: API gateways and validators reject non-conforming requests, and **generated client SDKs turn the contract into typed code that no longer compiles**. Whether your own server is lenient is your choice to make; it does not mean the contract is unchanged.

That paragraph *names* runtime leniency and generated SDKs as *consumers of the spec*. It does **not** probe them. oasdiff treats SDK breakage as a *consequence of a spec edit*, not as an independent scanned artifact.

Quoted from https://www.oasdiff.com/docs/monitor-external-apis (their own “monitor a third-party API” recipe):

> Keep a baseline copy of the provider’s spec, then periodically compare the **live spec** against it.

“Live spec” here means `curl` the provider’s `openapi.yaml`, then `oasdiff breaking baseline.yaml latest.yaml`. It is **not** hitting `GET /users/{id}` and comparing the HTTP status or body to the declared response.

And, explicitly, when the provider publishes nothing machine-readable:

> that case needs **live response monitoring, a different kind of tool**.

oasdiff’s authors know the live-response job exists. They refuse it. They point elsewhere.

`gh search code "SDK"` in the repo hit the BREAKING-CHANGES paragraph above, not an SDK parser. `gh search code "live API"` hit a sample changelog line about `/health/live` being *removed from a spec*. Issue list (latest 30) is flatten/cycle/checker bugs — not “please probe production.” A keyword issue-search later 403’d (GitHub secondary rate limit); that absence is **not** proof no such issue exists, only that the README/docs already settle the product boundary.

### What oasdiff intentionally does NOT solve

1. Whether production returns the status/schema the spec declares (the thesis’s vertex 2).
2. Whether a generated or hand-written SDK still exposes `getUser(id)` (vertex 3 as a *scanned surface*).
3. Traffic, HAR, shadow requests, auth against a live host, semantic compatibility of payloads.

**A does not create a wedge.** The gap is documented, then filled by other incumbents (kill test B). oasdiff already shipped the hosted visual that prior research treated as Spec Triangle’s only remaining hope.

Correction to prior research: the wrapper accusation is **not** `npx oasdiff`. oasdiff is Go: `brew install oasdiff`, `go install`, Docker `tufin/oasdiff`, GitHub Action, or the browser tool. That is *easier* than npm, not harder.

**A result: KILL evidence.** oasdiff owns vertex 1 completely, including a 20-second browser visual. Vertices 2 and 3 are out of scope *by design*, and the design doc tells you to use another tool.

---

## Kill test B — Fern / Speakeasy / Stainless / Postman (workflow → capability → gap)

Proposed Spec Triangle workflow (`research/06`): upload spec + hit a URL + scan SDK folder → breaking report. 20s demo: rename a path in spec → live still 200 on old path → SDK missing method → red.

Map against **fetched product docs**, not a list.

### Vertex 1 — declared OpenAPI vs a previous spec

| Actor | Capability (fetched) | Gap vs our workflow |
|---|---|---|
| **oasdiff** | 755-check spec diff; CI gate; hosted side-by-side; Pro PR review. | None on this vertex. |
| **Speakeasy** | Docs still live: `speakeasy openapi diff --base v1.yaml --revision v2.yaml`; registry tags a spec PR; breaking-change report at **OpenAPI spec level** (removed endpoints, required params added, response fields removed/type-changed, auth changed, enum values removed). | Homepage on 21 Sep 2026 is an **AI control plane**, not SDK gen. SDK docs remain. Spec-diff still exists. |
| **Fern** | `fern check` validates definition + `generators.yml` / `docs.yml`. Aug 2026 post names oasdiff as the spec-diff gate and `fern check` as the lint gate. Fern blog also claims breaking-change halt on SDK release + version-bump analysis (vendor). | `fern check` is schema/config validity, not live HTTP. |

### Vertex 2 — live / production behavior vs the spec

| Actor | Capability (fetched) | Gap vs our workflow |
|---|---|---|
| **oasdiff** | Explicitly **not**. “A different kind of tool.” | This *is* the named hole. It is already occupied. |
| **Schemathesis** (not in the asked four; required to be honest) | https://schemathesis.io/ — “Validates API responses against your OpenAPI specification. Detects when your implementation doesn't match the documented behavior.” CLI: `uvx schemathesis run https://…/openapi.json`. GitHub Action. Workbench dashboard. **3,616** stars (`gh`, 21 Sep 2026). Claims Netflix/SAP/Red Hat/IBM/JetBrains. | Deeper than our curl-404 demo (property-based, stateful, schema validation). Makes a 20s 404 table look like a toy. |
| **Prism** | GitHub `stoplightio/prism`: “Turn any OpenAPI2/3 and Postman Collection file into an API server with mocking, transformations and **validations**.” **5,034** stars. Fern’s Aug 2026 post: Prism “can run as a validation proxy against a live API.” Stoplight docs page for Validation Proxy **failed to render body** (JS error on fetch); capability is from README + Fern’s description, not from the JS docs body. | Validation proxy is the live vertex. |
| **Dredd** | `apiaryio/dredd`, **4,223** stars, **archived 8 Nov 2024**. Historical proof the job “hit the API, compare to spec” is old. | Archived; Schemathesis/Postman replaced it. |
| **Postman** | Official docs (learning.postman.com): generate a collection from OpenAPI 2.0/3.0/3.1; **alert when collection and spec drift**; bidirectional sync. Contract Test Generator (Postman public workspace + `postman-cs` bootstrap docs): generate tests from OAS3 and **execute them against `env-server`** (localhost, mock, or live). Generated assertions include “response body matches OpenAPI schema,” status declared in spec, content-type, operation mapping. www.postman.com was **Jina 403** this pass; evidence is learning.postman.com + GitHub `postman-cs` docs + the public Contract Test Generator workspace pages via search. | Postman already runs spec-derived tests against a live URL. That *is* vertex 2. |
| **Fern** | Generated **mock-server (wire) tests** run the SDK against a server built from the API definition (TS/Go default on). **Integration tests against the real API server** exist as an **Enterprise** feature. | Fern’s architecture: don’t drift; regenerate. If you still want live vs spec, they sell integration tests, not a triangle UI. |

### Vertex 3 — generated SDK surface vs the spec

| Actor | Capability (fetched) | Gap vs our workflow |
|---|---|---|
| **Fern** | Docs, SDKs, CLI, Postman collections **from one spec**. Homepage: “from one source of truth.” Footer: **“© 2026 Fern • Birch Solutions, Inc., a Postman company.”** Mock-server tests: SDK HTTP shape vs spec. `fern generate --preview` writes SDK locally for inspection. Claims 8,000+ customers (vendor). | They prevent vertex 3 by construction. Scanning a stale SDK folder is the failure mode they sell you out of. |
| **Speakeasy** | Breaking changes tracked at **two levels**. Spec level (above) **and SDK level**: “The generated SDK PR reflects these as concrete code changes: **removed methods, changed function signatures, modified type definitions**. Reviewers see the actual impact on the **public API surface** of each SDK.” SDK PR annotations: OpenAPI change report, breaking-change callout, version bump, changelog. `Files changed` tab is the SDK surface diff. | This *is* vertex 3, with a PR visual, not a regex over `src/`. |
| **Stainless** | SDKs + docs + MCP “all derived from your OpenAPI spec.” Spec change → GitHub PR with updated SDK. **15 May 2026** blog: “Stainless is joining Anthropic.” “we’ll be **winding down all hosted Stainless products, including our SDK generator**. Starting today, new signups, projects, and SDKs will not be available.” Product pages still describe generation; the company is an acquihire in progress. | Wind-down is not a greenfield opening. Fern (now Postman) and remaining Speakeasy docs occupy the generator slot. |
| **Postman** | Nav documents “Generate SDKs from collections and API specifications” (page not fully fetched this pass). Native Fern integration: Fern homepage “Native Postman support” — generate/publish Postman collections from the same source of truth as Docs and SDKs. | Postman+Fern is one company as of the 2026 footers. |

### Workflow → competitor → gap (the only table that matters)

| Our proposed step | Who already does it | Remaining gap |
|---|---|---|
| Parse / lint OpenAPI | oasdiff `validate`; Spectral (named by Fern); `fern check`; Postman spec validation | None |
| Diff spec vs last spec | oasdiff (755 checks, hosted visual, Pro); `speakeasy openapi diff` | None |
| Hit a live URL, compare status/schema to spec | Schemathesis (3.6k★); Postman contract tests; Prism validations; Fern Enterprise integration tests; Dredd (archived) | None that a 3-week demo can own |
| Show SDK method missing / signature changed | Speakeasy SDK PRs (“removed methods… public API surface”); Fern regenerate + preview + wire tests; Stainless (winding down) PRs | Scanning a *stale* folder is a grep. Generators treat staleness as “you didn’t run generate.” |
| Hosted 20s visual of the three together | **Nobody ships this exact three-column HTML.** | Packaging. CSS. Not a mechanism. oasdiff `--open` already is a 20s visual for vertex 1. Postman Collection Runner is a visual for vertex 2. Speakeasy SDK PR is a visual for vertex 3. |

**Adjacent crowding (Exa, not in the asked four):** drift/ci.com diffs n8n/Make integration *code* against a live OpenAPI spec (`endpoint_removed`, `method_mismatch`, `auth_mismatch`) and exits 1. That is spec-vs-client-surface, which is closer to vertex 3 than our proposed TypeScript scan.

**B result: KILL.** The only gap is “three columns on one page.” Fern’s gospel is *don’t let the copies exist*. Speakeasy already diffs SDK surface. Postman already runs the spec against a server. oasdiff already diffs specs in a browser. Combining them is not a company and not a hackathon-original mechanism.

---

## Kill test C — Weekend reproduction

**Question:** Competent engineer has OpenAPI, curl, TypeScript, oasdiff. Can they reproduce the **core product** in one weekend?

**Yes. In an afternoon.** The core product, as specified, is a fixture API plus a report that spec / live / SDK disagree.

Recipe (not product code; reproducibility evidence):

1. **Fixture.** Tiny Node/static server: `GET /users/1` returns 404; `openapi.yaml` still declares `GET /users/{id}` → 200; a `sdk.ts` still exports `getUser(id)`.
2. **Vertex 1.** Read the spec path + declared status (or `oasdiff changelog` against a previous spec if you want a changelog). Optional: `oasdiff changelog a.yaml b.yaml --open` for the official visual.
3. **Vertex 2.** `curl -sS -o /dev/null -w "%{http_code}" "$BASE/users/1"` → `404`.
4. **Vertex 3.** `rg "export function getUser|getUser\(" sdk.ts` (or `tsc` + list exports). No AST required for the demo claim “SDK `getUser(id)` exists.”
5. **Visual.** HTML table: Spec 200 / Live 404 / SDK present. Red. Deploy on Fly/Cloudflare Pages.

Nothing in that list is secret, patented, or hard. oasdiff is Apache-2.0. curl is POSIX. TypeScript surface scan at demo depth is a regex.

### What prevents us from being a wrapper?

Evaluated, then discarded:

| Candidate moat | Why it fails |
|---|---|
| “We hit live, oasdiff doesn’t” | Schemathesis / Postman / Prism already do, with schema validation, not just status codes. |
| “We scan SDK surface” | Speakeasy already reports removed methods / signature changes on the SDK PR. Fern regenerates so the scan is unnecessary. `api-extractor` exists for TS exports (named in `research/07` Honest Patch). |
| “Hosted wow-path” | oasdiff.com/diff and `--open` are hosted wow-paths *today*. Postman Collection Runner is hosted. |
| “Triangle as object” | Three columns is layout. A judge who view-sources sees fetch + YAML parse + grep. |
| “Auth / production” | Hardest real problem (`research/06`, `research/09`). A hackathon demo **avoids it** with a fixture API we control — which makes the demo *less* like the real job, not more defensible. |
| Technical depth | `research/07` scored tech depth **5**, defensibility **1**. Confirmed: no algorithm. |

**If nothing prevents wrapper: KILL.** Nothing does.

Prior research called this a weekend oasdiff wrap. That was slightly wrong in a way that **worsens** the kill: you do not even need oasdiff for the thesis demo. oasdiff compares two specs. The 404-vs-200 demo is curl. oasdiff is optional garnish.

**C result: KILL.** Fatal.

---

## Kill test D — Demo novelty

**Required:** ONE visual that (1) oasdiff CLI does not naturally provide, (2) immediately understandable, (3) <20 seconds, (4) exposes a genuinely important failure. If none: KILL.

**Candidate considered:** three-column view — spec declares `GET /users/{id}` 200; live returns 404; SDK still has `getUser(id)`.

| Criterion | Holds? |
|---|---|
| oasdiff CLI does not naturally provide it | **Yes.** oasdiff never issues the HTTP request and never parses SDK source. `--open` is a spec-spec side-by-side, not live/SDK. |
| Immediately understandable | **Yes.** 404 vs 200 is judge-legible. |
| <20 seconds | **Yes**, on a fixture. |
| Genuinely important failure | The *failure* (client 404 while docs/SDK lie) is important. The *visual* is not. `curl -w "%{http_code}"` is the demonstration. Schemathesis already fails CI when responses violate the spec. Postman contract tests already fail the run. Putting the status next to two other strings does not expose a **new** failure class. |

oasdiff CLI **does** naturally provide a competing 20-second visual: `oasdiff changelog HEAD~1:openapi.yaml HEAD:openapi.yaml --open` opens a hosted side-by-side review, “with the diff anchored at each change site,” no account, 7-day URL. The free web tool is the same checks with paste. A judge who has seen that will not experience our table as novel.

No other candidate was found: heatmaps, traces, HAR overlays, and SDK AST graphs are either incumbent (Schemathesis Workbench / Postman / Speakeasy PR) or too slow/confusing for 20 seconds.

**D result: KILL.** The only visual that is not oasdiff is a curl status code in a table. That is not a product demonstration. Prior research’s stop condition (“a single visual oasdiff cannot match in 20 seconds — if no, stop”) is met as a *packaging* trick and failed as a *product* visual.

---

## Strongest alternative (not a new idea — the thing that already is the product)

**oasdiff** for contract review, **plus** (if you actually need live) **Schemathesis** or **Postman contract tests**, **plus** (if you generate SDKs) **Fern or Speakeasy** so vertex 3 cannot rot.

That stack is the category. Spec Triangle is a screenshot of it.

Strongest *named* competitor for an OFFGRID judge who opens GitHub: **oasdiff** (1,373★, hosted visual, Pro, Stripe/MongoDB logos). Strongest *architecture* competitor: **Fern (a Postman company)**. Strongest *live* competitor: **Schemathesis**.

---

## Difference

| They | We |
|---|---|
| oasdiff: spec vs spec, 755 checks, hosted side-by-side, CI | Spec vs live vs SDK on one page |
| Fern/Speakeasy: generate so copies cannot drift | Detect drift after copies already drifted |
| Schemathesis/Postman: live vs spec, schema-deep | Live vs spec, demo-deep (status code) |

The difference is **composition and shallowness**, not mechanism.

## Does it matter?

**No.** Detecting drift after Fern-class generation is the thing customers pay Fern not to need. Detecting spec-edit breakage is oasdiff. Detecting live mismatch is Schemathesis/Postman. A hosted collage does not change who owns the job. Switching cost (`research/06`): **low**. Defensibility: **none**.

---

## Demo breakage

- Fixture API we control (`research/09`) — judges smell a canned 404.
- Public third-party API — moves under us; auth walls; we look like we DDoSed (`research/07`).
- View-source / repo: YAML + `fetch` + string match. Originality and Technical Depth die in the same click.
- oasdiff.com/diff is a tab away; `--open` is one flag.
- If we *use* oasdiff in the demo, we prove the wrapper. If we *don't*, vertex 1 is a YAML pretty-print and we look thinner.

## Business breakage

- Not a 2-year company (`research/10`: “CI app — probably still not a company”).
- Buyers already have Postman / Fern / CI. Seats for “another OpenAPI gate” compete with **oasdiff Pro** (priced; page not fully quoted this pass) and Postman plans.
- Stainless wind-down (15 May 2026) and Speakeasy homepage pivot to AI control plane are **consolidation**, not a vacancy. Fern is already Postman.
- Economic value of broken integrations: **Unknown** (`research/05`). Do not invent TAM.

---

## Copy-me

**Fatal.** Apache-2.0 CLI + curl + a static HTML table. Any of ~87 OFFGRID participants can ship the same fixture in a day. The originality rule (“do not simply submit an existing project with minimal changes”) is aimed at *our* wrapping of oasdiff as much as at anyone wrapping *us*. Copy-me time: **hours**, not a weekend.

## No-AI

The product is stronger with the model **off** (`research/06` product-without-AI: yes). That does not save it. There is **no model-shaped moat**, and the prize is **$10k OpenAI credits**. A judge scoring Technical Depth on a curl table, in a contest whose only prize is model credits, has no reason to pick this. Optional “explain the break in English” is ChatGPT glued to oasdiff JSON — worse.

## Judge-says-no

First question in `research/07`: “oasdiff?” Honest answer then: “1.3k★ CLI. We are a hosted triangle. Weekend wrapper risk.” After this pass the honest answer is worse: **oasdiff is already hosted**, and live/SDK are Schemathesis/Speakeasy. Organizer aesthetic (live software, no “Uber of”, not tutorial CRUD) does not rescue a CRUD-shaped report over three files. Execution can look fine; Originality, Product Thinking, Technical Depth, Potential do not.

## 2-year category (not “SaaS dashboard”)

**OpenAPI contract governance / API compatibility CI.** Incumbents: oasdiff (CLI → hosted Pro), Spectral, Optic, Bump.sh (not re-fetched this pass; named in prior landscape), Postman, Fern, Speakeasy leftover SDK pipeline, Schemathesis Workbench. In two years this is a feature checkbox on Postman/Fern or a thin oasdiff Pro clone — not a new category, not a durable verifier franchise. Calling it “not a dashboard” does not change the category; the triangle *is* a three-pane dashboard over diffs other people compute.

---

## Unknowns (do not flatten into hope)

- GitHub issue-search for oasdiff + live/runtime 403’d after the first issue list succeeded. Unlikely to overturn the README boundary.
- Postman.com marketing pages 403 via Jina; learning.postman.com + contract-test generator docs were enough for vertex 2.
- Prism Validation Proxy **docs body** failed to render; README + Fern’s description used instead.
- Exact oasdiff Pro pricing: page linked, not fully extracted.
- Whether Fern’s `fern diff` (mentioned in Fern’s 2026 testing blog via search snippet) is a first-class CLI command; the fetched CLI reference listed `fern check` / `fern generate`, not a `diff` subcommand in the general-commands table. Do not depend on the snippet.
- How complete Postman’s first-party SDK generator is (nav exists; full page not fetched).
- Stainless transition timeline for existing customers; hosted generator already closed to new signups as of the 15 May 2026 post.
- Judge taste: a pretty 404 table might still score Execution. That is not a reason to build.

None of these unknowns reopen C or B.

---

## Kill-test scorecard

| Test | Result | One-line |
|---|---|---|
| A oasdiff | **KILL** | Spec-to-spec only; hosted visual already ships; live/SDK refused in writing. |
| B Fern/Speakeasy/Stainless/Postman | **KILL** | Each vertex owned; gap is CSS. Fern is Postman. Stainless winding down. Speakeasy still diffs SDK surface. |
| C Weekend | **KILL (fatal)** | Afternoon: fixture + curl + grep + HTML. Nothing prevents wrapper. |
| D Demo novelty | **KILL** | Only non-oasdiff visual is a curl status in a table. Not a new failure. |
| Copy-me | **KILL** | Hours. Apache-2.0. |
| No-AI | **KILL as moat** | Works without AI; therefore anyone copies it; credits-prize judges get nothing. |
| Judge-says-no | **KILL** | “oasdiff?” now has a hosted counter-demo. |
| 2-year | **KILL** | Contract-governance CI. Incumbent category. |

Prior suspicion of weekend wrapper: **confirmed**, and slightly worse (oasdiff is optional for the thesis demo).

---

## Verdict

**KILLED**
