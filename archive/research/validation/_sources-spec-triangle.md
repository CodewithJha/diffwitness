# Sources — Spec Triangle kill test

**Date accessed:** 21 September 2026  
**Rule:** only pages actually fetched/read this pass. Search snippets are discovery unless the page was then opened.  
**Agent Reach:** `doctor --json` first. GitHub via `gh` (Doctor `active_backend: null` but `gh repo view` / `gh api` / `gh issue list` succeeded). Web via Jina Reader (`r.jina.ai`). Exa via `mcporter` (one call rate-limited; one call returned results). Cursor `WebSearch` / `WebFetch` as fallback. Twitter/Reddit backends off — not used. `agent-reach check-update`: v1.5.0, current.

| Source | URL | Type | What it proves for this kill | Reliability | Notes |
|---|---|---|---|---|---|
| oasdiff GitHub repo metadata | `gh repo view oasdiff/oasdiff` | GitHub API | 1,373 stars, 107 forks, Apache-2.0, homepage oasdiff.com, pushed 2026-09-21, description “OpenAPI Diff and Breaking Changes” | High | |
| oasdiff README | https://github.com/oasdiff/oasdiff (Jina) | OSS README | CLI compares two OpenAPI specs; commands breaking/changelog/diff/validate; Docker/brew/go; GitHub Action; hosted PR review at oasdiff.com; `--open` / MCP mentioned; HTML/MD output | High | `gh api …/readme` 403 in sandbox; Jina used |
| oasdiff.com homepage | https://www.oasdiff.com/ (Jina) | Vendor | Hosted paste-two-specs tool; 755 checks; Pro PR review + side-by-side; 14M+ downloads claim; Stripe/MongoDB/etc logos; OpenAPI 3.0–3.2 | Medium on logos/downloads (vendor); High on product claims matching README | |
| oasdiff breaking-changes catalog | https://www.oasdiff.com/docs/breaking-changes (Jina) | Vendor docs | Check IDs exist (schema/params/paths/security/responses…) | High that the catalog page exists | Body is a long check list |
| oasdiff BREAKING-CHANGES.md | https://github.com/oasdiff/oasdiff/blob/main/docs/BREAKING-CHANGES.md (Jina) | OSS docs | `--open` hosted visual; judges contract **not** server behavior; servers often don’t enforce at runtime; SDKs named as spec consumers; `--fail-on`; HTML example URL; known limitations (no callback checks) | High | Primary quote source for “not live” |
| oasdiff monitor external APIs | https://www.oasdiff.com/docs/monitor-external-apis (Jina) | Vendor docs | “Live spec” = curl the OpenAPI file, then oasdiff; if no machine-readable spec, needs “live response monitoring, **a different kind of tool**” | High | Kills vertex-2-as-oasdiff |
| oasdiff issue list | `gh issue list -R oasdiff/oasdiff --limit 30` | GitHub | Recent issues are flatten/cycle/checker — not live/SDK product requests | Medium | Not exhaustive |
| oasdiff code search | `gh search code` in oasdiff/oasdiff for live/SDK | GitHub | SDK mention is the BREAKING-CHANGES paragraph; “live” sample is `/health/live` path | High for those hits | Later issue search 403 rate limit |
| oasdiff/sync README (WebSearch snippet + known URL) | https://github.com/oasdiff/sync | OSS | Slack notify on **spec file** changes via GitHub webhook | Medium | WebSearch snippet; not fully Jina’d this pass |
| Fern homepage | https://buildwithfern.com/ (Jina) | Vendor | Docs+SDK+CLI from one spec; Postman collections from same source; **“© 2026 Fern, a Postman company”** / docs footer **Birch Solutions, Inc., a Postman company**; 8,000+ customers claim | High on positioning/ownership footer; Medium on customer count | |
| Fern schema-drift post | https://buildwithfern.com/post/stopping-schema-drift-coupling-sdks-documentation-claude | Vendor blog | Drift as pipeline; names Spectral, oasdiff, Schemathesis, Pact, Prism; `fern check`; generate docs+SDKs together | Medium (sells Fern) | Fetched this research stream via Exa highlights + prior `research/sources.md` |
| Fern testing docs | https://buildwithfern.com/learn/sdks/deep-dives/testing (Jina) | Vendor docs | Generated unit + mock-server tests; **integration tests against real API = Enterprise** | High | |
| Fern CLI general commands | https://buildwithfern.com/learn/cli-api-reference/cli-reference/general-commands (Jina) | Vendor docs | `fern init`, `fern check`, `fern api update`, login via Postman/GitHub/Google | High | No `fern diff` in this table |
| Fern SDK commands | https://buildwithfern.com/learn/cli-api-reference/cli-reference/sdk-commands (Jina) | Vendor docs | `fern generate`, `--preview` local SDK, `--local` | High | |
| Speakeasy homepage | https://www.speakeasy.com/ (Jina) | Vendor | **AI control plane** (agents/MCP/policy). Not SDK-gen as the homepage job. | High for current homepage | Prior research “pivot” confirmed live |
| Speakeasy SDK preview / breaking changes | https://www.speakeasy.com/docs/sdks/guides/sdk-preview-breaking-changes (Jina) | Vendor docs | Spec PR → SDK PRs; breaking at **OpenAPI spec level and SDK level** (removed methods, signatures, types = public API surface) | High that docs still exist | Homepage and docs disagree on what the company is |
| Speakeasy forward-compat / openapi diff | https://www.speakeasy.com/docs/sdks/manage/forward-compatibility (WebSearch) | Vendor docs | `speakeasy openapi diff --base v1.yaml --revision v2.yaml` | Medium | Search highlights; full page not Jina’d |
| Speakeasy SDK changelogs | https://www.speakeasy.com/docs/sdks/manage/sdk-changelogs (WebSearch) | Vendor docs | Removed/modified methods flagged breaking in PR | Medium | Search highlights |
| Stainless homepage | https://www.stainless.com/ (Jina) | Vendor | Banner: **Stainless is joining Anthropic**; SDKs/docs/MCP from OpenAPI | High | |
| Stainless joining Anthropic | https://www.stainless.com/blog/stainless-is-joining-anthropic/ (Jina) | Company | Dated **2026-05-15**. Winding down **all hosted Stainless products including SDK generator**. New signups/projects/SDKs unavailable. | High | |
| Stainless SDKs product | https://www.stainless.com/products/sdks/ (Jina) | Vendor | Generate TS/Python/Go/… from OpenAPI; spec change → GitHub PR | High that pages still describe the old product | Contradicts wind-down for *new* customers |
| Stainless editions / transforms | https://www.stainless.com/docs/… (WebSearch) | Vendor docs | OpenAPI→SDK mapping; transforms when spec ≠ API | Medium | Not needed for kill |
| Postman generate collections | https://learning.postman.com/docs/design-apis/specifications/generate-collections/ (Jina) | Official docs | Generate collection from OAS 2/3/3.1; **alert when collection ≠ spec**; bidirectional sync | High | |
| Postman Contract Test Generator | https://www.postman.com/postman/contract-test-generator/overview and OAS3 docs (WebSearch) | Official workspace | Generate tests from OAS3; run against `env-server` live URL | Medium–High | www.postman.com Jina **403** AbuseAlleviation; used search + GitHub copies |
| postman-cs generated-assertions | https://github.com/postman-cs/postman-bootstrap-action/blob/main/docs/generated-assertions.md (WebSearch/fetch) | GitHub docs | Live-response tests: status in spec, content-type, **response body matches OpenAPI schema**, operation mapping | High if file matches | Fetched to agent-tools |
| postman-cs dynamic-contract-tests | https://github.com/postman-cs/postman-bootstrap-action/blob/main/docs/dynamic-contract-tests.md | GitHub docs | Drift between generated requests, live responses, and OpenAPI | High | |
| Postman.com API testing | https://www.postman.com/api-platform/api-testing/ | Vendor | **Not used** — Jina 403 | — | Do not cite body |
| Schemathesis homepage | https://schemathesis.io/ (Jina) | Vendor/OSS | Live/schema validation from OpenAPI; CLI, GH Action, Workbench; production users claimed | High on product; Medium on logos | |
| Schemathesis GitHub | `gh repo view schemathesis/schemathesis` | GitHub | **3,616** stars | High | |
| Prism GitHub | `gh repo view stoplightio/prism` + WebFetch https://github.com/stoplightio/prism | GitHub | **5,034** stars; mocking + **validations** from OpenAPI/Postman | High | |
| Prism Validation Proxy docs | https://docs.stoplight.io/docs/prism/72d69fb629de0-validation-proxy (Jina) | Vendor docs | **Body failed to render** (JS error). Nav proves the page exists. Capability cited via README + Fern blog, not this body. | Low for the docs body | Do not quote proxy CLI from this fetch |
| Dredd GitHub | `gh repo view apiaryio/dredd` | GitHub | **4,223** stars; archived **2024-11-08**; “Language-agnostic HTTP API Testing Tool” | High | Historical occupancy of live-vs-spec |
| drift/ci | https://www.driftci.com/ (Exa) | Vendor | Diff n8n/Make calls vs OpenAPI; exit 1 on breaking; “unlike openapi-diff or prism” (their claim) | Medium | Adjacent crowding; vendor |
| DEV.to schema drift comparison 2026 | https://dev.to/flarecanary/api-schema-drift-detection-tools-compared-2026-1ib4 (WebSearch) | Blog | States oasdiff cannot tell if live API matches spec | Low–Medium | Author discloses competing product; used only as consistent with oasdiff’s own docs |
| Fern API testing blog | https://buildwithfern.com/post/api-testing-complete-guide-developers (WebSearch) | Vendor | Mentions `fern diff` in CI — **not confirmed** on fetched CLI reference. Do not treat as fact. | Low until CLI confirms | Flagged unknown in the report |
| Prior in-repo research | `research/00`, `01`, `04`–`11`, `sources.md` | Internal | Thesis, weekend-wrapper suspicion, scores, Fern Aug 2026 post already logged | High as prior work | This pass independently re-fetched oasdiff/Fern/Speakeasy/Stainless/Postman/Schemathesis |
| HACK47 constraints | `research/01-hackathon-intelligence.md` | Internal | Originality, demo URL, unweighted criteria, ~87 field | High | Used for judge-says-no / copy-me |

## Intentionally not evidence

- Tweets (Twitter CLI not installed).
- Reddit (no backend).
- oasdiff Pro pricing page (linked, not extracted).
- Postman.com marketing (403).
- Prism validation-proxy **body**.
- Invented TAM for broken integrations.
- `npx oasdiff` (prior research wording; oasdiff is Go/Docker/brew — corrected in the report).

## Tooling log

- `agent-reach doctor --json` — web=ok (Jina); github=warn (gh present); exa=warn (configured); reddit/twitter off.
- `mcporter call exa.web_search_exa` — first query rate-limited; second returned Fern/Speakeasy/drift-ci highlights.
- `agent-reach check-update` — v1.5.0 current.
