# Final recommendation — shortlist of five, no winner

**Date:** 21 September 2026  
**This file is not a build order.** It is what remains after kill tests.  
**Strongest honest conclusion:** we have **not** found a sufficiently strong, uncrowded opportunity that is also a 3-week hosted demo *and* a post-hackathon company. The five below are the remaining *investigations*, not a product pick.

---

## Kill tests first

### CiteCheck — Why we shouldn’t
Westlaw/Lexis/Harvey can add “verify citations” as a checkbox. CourtListener is public; a weekend wrapper is plausible. False reds on real obscure cases are worse than no product. Legal buyers are slow. Looks like a search box on stage.

### CiteCheck — Why we might
Mata is a **court-documented** professional failure of unverified model output. The job is gatekeeping, not writing. Product-without-AI is strong. 20-second demo is brutal and visual. Local-first (cite-only egress) is honest. Builder can implement lookups without pretending to be a copilot.

**What would kill it:** Harvey shipping a badge before 14 Oct; or demo false-reds; or judges yawning at “search.”

**Validate next (no product code required):** (1) Time-box a CourtListener lookup of the *actual* Mata fake reporter numbers vs real cases at those cites. (2) Ask 3 lawyers whether they would paste a draft into a hosted tool. (3) Check rate limits.

**Hackathon version:** Fixture memo + existence checks + one quote search on a public opinion.  
**Post-hackathon:** Pinpoint, local PDF, jurisdictions.

### Action Receipt — Why we shouldn’t
HumanLayer exists (Launch HN 354). Cursor/Claude Code will add plan modes. A mock-agent demo looks fake. Logging is not original.

### Action Receipt — Why we might
The failure mode is *successful* destructive commands plus a lying narrator — APM-blind. Non-AI is the product. Complements coding-agent chaos (Codex issue #25426 lifecycle hangs) without being another copilot.

**What would kill it:** Judges require a real IDE integration we cannot finish; or HumanLayer is “already the answer.”

**Validate next:** Watch how current Claude Code / Cursor / Codex expose tool logs. If they already show a trustworthy receipt, **stop**.

**Hackathon version:** Mock agent + real append-only log + approval.  
**Post-hackathon:** MCP proxy.

### Canary Session — Why we shouldn’t
Promptfoo 25k★, Langfuse 35k★. Long-session evals are expensive and flaky. Secondary 2026 “Claude felt off” posts are **not** a substitute for an official Anthropic postmortem (unconfirmed this pass). Looks like “we built evals.”

### Canary Session — Why we might
Hamel: unsuccessful LLM products lack evals; 60–80% of work is looking at failures; short unit tests are necessary but insufficient. This is the builder’s home turf **if** the object is a *golden long session*, not a dashboard.

**What would kill it:** Demo flake on judging day; or indistinguishable from Promptfoo README.

**Validate next:** Can we fail a canary by changing **one** documented config knob in a **scripted** runtime, reliably, 10/10?

**Hackathon version:** Scripted agent + assertions.  
**Post-hackathon:** Real CLI replay.

### Spec Triangle — Why we shouldn’t
oasdiff 1.3k★; Fern/Speakeasy/Stainless/Pact/Postman. Reproducibility: weekend. Technical depth score cannot rescue this.

### Spec Triangle — Why we might
20-second 404 vs green spec is judge-legible. Deterministic. Honest local-first (spec in browser, probe our fixture API).

**What would kill it:** View-source wrapper accusation.

**Validate next:** Is there a *single* visual that oasdiff CLI cannot match in 20 seconds? If no, **stop**.

**Hackathon version:** Fixture API we control.  
**Post-hackathon:** CI app — probably still not a company.

### Merge Preflight — Why we shouldn’t
Branch protection + “don’t use agents for large PRs” is a paragraph in CONTRIBUTING. GitHub will ship agent policies. Paper heuristics are copyable.

### Merge Preflight — Why we might
arXiv:2601.15195 gives **empirical** merge failure modes (size, CI, docs vs bugfix, social). CodeRabbit failed on nits; this product *refuses to comment* and only gates. Non-AI.

**What would kill it:** Looks like a linter; GitHub App not approved in time.

**Validate next:** Replay the paper’s quantitative rules on 20 public agent PRs — do they separate merged vs not at a glance?

**Hackathon version:** Fixture PRs + gates.  
**Post-hackathon:** Per-repo thresholds.

---

## Why these five survived (and nothing else)

- Generators, copilots, notes, overlays, AP suites, flag cleanup, flake platforms, metering, data observability, questionnaires: **killed** with named incumbents and/or failures.
- Afterhours notes→brief: **killed** as generic productivity.
- Remaining share: **verification, gates, receipts**, public fixtures, hosted 20s wow.

They survived because they were **less dead**, not because they are obviously winning.

## Strongest evidence overall

1. Mata v. Avianca sanctions opinion (ChatGPT fake citations).
2. Hamel evals + 60–80% error analysis (looking beats dashboards).
3. Zheng et al. LLM-as-judge position bias (do not *be* an uncalibrated judge).
4. Overlay Fact Sheet (1,031 signatories) + FTC accessiBe $1M + EAA 28 Jun 2025 (do not sell compliance).
5. Tidelift 2024 maintainer burnout (pain real, **WTP for bots low**).
6. Adept/Inflection/Humane/Builder.ai (generic agent / hardware / “AI app” graveyard).
7. Langfuse 34.9k★ / Promptfoo 25.3k★ (evals crowding).
8. arXiv 33k agent PRs (merge is socio-technical).
9. **Humanloop sunset (2025)** after Anthropic hire — independent eval SaaS can vanish; extra kill for Trace Autopsy / Canary-as-dashboard.
10. **AgentGPT archived (36k★)** and **gpt-engineer archived (55k★)** — extra kill for generic agents.
11. **Sweep issue-to-PR abandoned** after users left for Cursor (founders, HN; repo pivoted to JetBrains) — extra kill for Merge Preflight’s *agent-opens-PRs* cousin, not for *blocking* bad PRs.
12. **Bench Dec 2024 shutdown** — extra kill for holding financial records in a hackathon demo.

## Strongest competitor per survivor

| Survivor | Strongest competitor |
|---|---|
| CiteCheck | Westlaw/Harvey (badge risk) |
| Action Receipt | HumanLayer + IDE vendors |
| Canary Session | Promptfoo |
| Spec Triangle | oasdiff + Fern |
| Merge Preflight | GitHub branch protection |

## What we need to learn before writing a single line of product code

1. **CiteCheck:** 3 lawyer conversations; CourtListener live probe of Mata-listed reporter collisions; rate limits.
2. **Action Receipt:** Do current coding agents already expose a trustworthy tool log?
3. **Canary Session:** 10/10 reliable fail on a config change in a scripted harness.
4. **Spec Triangle:** A visual oasdiff cannot match in 20s — or drop.
5. **Merge Preflight:** Heuristics vs 20 real agent PRs.
6. **Prize checkbox / credits issuance:** still unanswered (hackathon intel file).
7. **Do not reopen visual-diff** because Lost Pixel is sunsetting: Chromatic still owns paid review; Figma absorption is Magician.

## Explicit non-recommendation

Do **not** pick a final product from this memo. Do **not** start Afterhours-as-brief. Do **not** start a generic agent. Do **not** start an overlay. If ChatGPT strategy chat wants a single name, send them this file and `10`’s ending paragraph, not a slogan.

---

After attempting to kill these opportunities, these are the few problems that still appear worth investigating, this is the evidence supporting them, this is what could invalidate them, and this is what we need to learn before writing a single line of product code.
