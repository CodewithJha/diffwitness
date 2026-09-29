# Shortlist, scoring, and demo-first top 10

**Date:** 21 September 2026  
**Competition score:** higher = more crowded = **worse**. Do not invert.

## Scoring matrix (1–10)

Scores are adversarial. Technical depth does **not** rescue a weak problem.

| Concept | Pain | Freq | Competition (worse if high) | Diff | Tech depth | AI lev. | Non-AI value | Demo | 3-wk | Prod pot. | Repeat | Econ | Defend | Continue |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| CiteCheck | 9 | 7 | 8 | 6 | 6 | 3 | 9 | 9 | 8 | 5 | 7 | 6 | 3 | 6 |
| Action Receipt | 8 | 6 | 7 | 5 | 6 | 1 | 9 | 8 | 7 | 5 | 8 | 5 | 3 | 6 |
| Canary Session | 8 | 7 | 9 | 4 | 7 | 2 | 8 | 7 | 6 | 5 | 8 | 5 | 2 | 5 |
| Trace Autopsy | 8 | 6 | 8 | 4 | 4 | 3 | 7 | 7 | 8 | 4 | 6 | 4 | 2 | 4 |
| Spec Triangle | 7 | 7 | 8 | 3 | 5 | 2 | 8 | 8 | 8 | 4 | 7 | 4 | 1 | 4 |
| Merge Preflight | 7 | 6 | 7 | 5 | 5 | 2 | 8 | 8 | 8 | 4 | 7 | 4 | 2 | 5 |
| SourceFix | 8 | 6 | 8 | 4 | 5 | 1 | 8 | 8 | 7 | 4 | 7 | 4 | 2 | 4 |
| SQL Grain Diff | 7 | 4 | 8 | 4 | 5 | 1 | 8 | 7 | 8 | 3 | 4 | 5 | 1 | 3 |
| Docs Click | 6 | 6 | 7 | 3 | 4 | 2 | 7 | 6 | 5 | 3 | 6 | 3 | 1 | 3 |
| Honest Patch | 6 | 5 | 7 | 3 | 4 | 1 | 8 | 7 | 7 | 3 | 5 | 3 | 1 | 3 |
| Afterhours notes→brief | 3 | 5 | 10 | 1 | 2 | 8 | 1 | 8 | 10 | 1 | 3 | 1 | 1 | 1 |

**Why high/low (evidence):**

- **CiteCheck pain 9:** Mata opinion is a federal sanctions order, not a tweet. Competition 8 because Westlaw/Harvey exist — they are *research* suites, not “is this string a real case.”
- **Canary Session competition 9:** Promptfoo 25.3k★, Langfuse 34.9k★.
- **AI leverage** is *low* on purpose for the survivors: Hamel and Mata both show uncritical LLM use *is the failure*.
- **Afterhours:** demo 8 (easy), everything else that matters is 1–3.

**Decision frame (qualitative product, not a formula winner):**  
Pain × Frequency × Differentiation × Depth × Usefulness × Demoability × Continuation.

No row dominates. CiteCheck leads on pain×demo×non-AI; loses on competition and defensibility. Action Receipt leads on non-AI and repeat use; loses to HumanLayer. Canary Session is the “AI eng” fit for this builder and the most crowded.

## Top 10 — demo-first

### 1. CiteCheck
- **10s:** “It checks whether the citations in this AI-written brief actually exist.”
- **30s demo:** Paste fixture with Mata-style fakes → red. One real citation → green.
- **60s:** Show quote mismatch on a real public opinion snippet.
- **3-min technical:** Citation parse; CourtListener/Crossref/HTTP; no generation; local parse / cite-only egress.
- **Hardest judge Q:** “Isn’t this just Ctrl+F on CourtListener?” **A:** The job is *gatekeeping a document*, including reporter-number collisions (Mata lists Gibbs v. Maxwell House at a fake case’s cite). Westlaw KeyCite is the incumbent; we are not claiming to replace it in 3 weeks.
- **Architecture:** Browser UI; serverless functions for lookups; no DB of user docs; cache public metadata; rate-limit; observability on API errors; no auth required for demo; deploy Fly/Cloudflare.
- **Build:** Moderate. **3-wk:** Yes with fixtures. **Unknown:** pinpoint quote accuracy. **Demo risks:** CourtListener rate limits, false reds, looks like a search box. **Security:** privileged memos — never send full text if we can avoid it.

### 2. Action Receipt
- **10s:** “It records what the agent actually ran, not what it claimed.”
- **30s:** Agent says drop is irreversible; log shows DELETE + backup.
- **60s:** Approval gate blocks the next destructive call.
- **3-min technical:** Tool proxy; append-only log the agent cannot write; allowlist.
- **Hardest judge Q:** “HumanLayer?” **A:** Yes they exist (Launch HN 354). We demo *receipt vs narrative*, a Mata-shaped failure, not a generic HITL API.
- **Architecture:** Mock agent in-browser or tiny Node; log store; no real prod DB.
- **Build:** Moderate. **3-wk:** Yes as theater-with-real-log. **Unknown:** wrapping real Cursor/Codex. **Demo risks:** looks fake. **Security:** redaction.

### 3. Canary Session
- **10s:** “It replays a 30-minute golden agent session after you change the prompt.”
- **30s:** Toggle config → canary fails assertions / token spike.
- **60s:** Bisect the config commit.
- **3-min technical:** Replay harness; assertions; snapshot of model+prompt+CLI.
- **Hardest judge Q:** “Promptfoo?” **A:** Yes 25k★. Our bet is long-session canaries as the default object, because short evals miss compact/cache failures (Hamel + secondary 2026 essays; official Anthropic postmortem **unconfirmed**).
- **Architecture:** Job runner, object storage for traces, HTML report.
- **Build:** Hard if real; Moderate if scripted fixture. **Unknown:** flake vs real regression. **Demo risks:** timeout, cost, “you faked the fail.”

### 4. Trace Autopsy
- **10s:** “It makes you look at 100 traces the way Hamel says you must.”
- **30s:** Tags + counts.
- **60s:** Export assertions.
- **3-min technical:** Sampling UX; optional cluster; export promptfoo YAML.
- **Hardest judge Q:** “LangSmith?” **A:** They optimize dashboards; Hamel still used Excel. If they copy this, we lose — say that.
- **Architecture:** Static fixture JSONL + client app.
- **Build:** Easy–Moderate. **Unknown:** anyone pays. **Demo risks:** boring vs generators.

### 5. Spec Triangle
- **10s:** “It shows when your spec, live API, and SDK disagree.”
- **30s:** 404 vs green spec.
- **60s:** SDK missing method.
- **3-min technical:** oasdiff + probe + scan.
- **Hardest judge Q:** “oasdiff?” **A:** 1.3k★ CLI. We are a hosted triangle. Honest: weekend wrapper risk.
- **Architecture:** Serverless probe; don’t DDoS.
- **Build:** Easy–Moderate. **Unknown:** auth APIs. **Demo risks:** using a public API that changes.

### 6. Merge Preflight
- **10s:** “It blocks agent PRs that the data says won’t merge.”
- **30s:** 40-file no-test diff blocked; 2-file docs allowed.
- **60s:** Cite arXiv:2601.15195 heuristics.
- **3-min technical:** Size, files, tests present, CI dry-run optional.
- **Hardest judge Q:** “Isn’t that a branch protection rule?” **A:** Partly. The product is *agent-specific* thresholds backed by the 33k-PR study, not style nits (CodeRabbit failure mode).
- **Architecture:** GitHub App or demo without App using fixtures.
- **Build:** Moderate. **Unknown:** GitHub App review delay. **Demo risks:** need demo repo.

### 7. SourceFix
- **10s:** “It finds real a11y bugs in source and will not sell you a WCAG badge.”
- **30s:** Overlay still fails; axe on source.
- **60s:** Component name + PR.
- **3-min technical:** axe-core; no overlay JS.
- **Hardest judge Q:** “Lighthouse?” **A:** Same engine family. Difference is anti-compliance-theater after FTC $1M and EAA 28 Jun 2025.
- **Architecture:** Browser scan; optional GH.
- **Build:** Moderate. **Unknown:** component mapping quality. **Demo risks:** looks like Lighthouse.

### 8. SQL Grain Diff
- **10s:** “It shows why two revenue queries disagree without a warehouse.”
- **30s:** Fanout join highlighted.
- **60s:** Tie to MC $16k/day *shape* (synthetic SQL, not their data).
- **3-min technical:** sqlglot.
- **Hardest judge Q:** “Monte Carlo?” **A:** They monitor data; we static-diff SQL. They already own the budget.
- **Architecture:** Client parser.
- **Build:** Easy. **Unknown:** dialect coverage. **Demo risks:** homework vibe.

### 9. Docs Click
- **10s:** “It clicks your getting-started guide and fails when the button is gone.”
- **30s:** Step 3 404.
- **60s:** Screenshot.
- **3-min technical:** Playwright.
- **Hardest judge Q:** “Checkly?” **A:** Yes. Docs-as-script is the only twist.
- **Architecture:** Headless browser on server — **demo fragile**.
- **Build:** Moderate. **3-wk feasibility:** Risky. **Unknown:** judge network to your staging. **Demo risks:** highest flake.

### 10. Honest Patch
- **10s:** “It catches a ‘patch’ that deletes an export.”
- **30s:** npm pack diff.
- **60s:** Report.
- **3-min technical:** export surface.
- **Hardest judge Q:** “api-extractor?” **A:** Yes. Hosted JS-only is the whole product.
- **Architecture:** Sandbox install (**supply-chain risk**).
- **Build:** Moderate. **Unknown:** sandboxing. **Demo risks:** installing attacker tarball if we allow uploads.

## Architecture sketch (feasibility only) — shared for hosted demo

All survivors: **static or SSR frontend** + **minimal Node/worker** + **no customer PII in git** + **public fixtures** + **health check** + **disclose models**. Auth optional for demo. Queue only if canary/replay. Observability: request logs, upstream API errors. Deploy: Fly/Render/Cloudflare; **keep up through 25 Oct 2026**.

## Biggest shared unknowns

1. Will judges value *verifiers* over *generators* in an AI-credit prize?
2. Rate limits (CourtListener, model APIs).
3. Whether a competent engineer calling it a weekend wrapper is fatal to Originality/Technical Depth.

## Afterhours default

Scored last row. **Do not shortlist.**
