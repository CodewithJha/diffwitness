# AliasTripwire validation — sources

**Date accessed:** 22 September 2026  
**Method:** agent-reach (Exa via `mcporter`, Jina Reader `r.jina.ai`, Cursor WebSearch as secondary discovery then primary fetch).  
**Rule:** Only URLs fetched (or explicitly labeled search-snippet-only) count as evidence. Do not invent incidents, pricing, or URLs.

**Agent Reach:** `agent-reach doctor --json` run; Exa used until free MCP rate limit; thereafter Jina + WebSearch. `agent-reach check-update`: v1.5.0 already latest.

---

## A. Provider primary docs (fetched)

| URL | What was verified | Label |
|---|---|---|
| https://api-docs.deepseek.com/updates | 2026-07-31: `deepseek-v4-flash` calling method unchanged; V4-Flash-0731 same arch/size, **re-post-trained** only. 2026-09-10: `deepseek-v4-flash` temporarily routed to V4.1 Flash. Other “calling method remains unchanged” entries. | FACT |
| https://developers.openai.com/api/docs/guides/advanced-usage | `seed` / `system_fingerprint`; backend config changes may change outputs; mostly-deterministic guidance | FACT |
| https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter | Residual nondeterminism even when seed + fingerprint match | FACT |
| https://docs.anthropic.com/docs/en/about-claude/models/model-ids-and-versions | Aliases vs pinned/dateless IDs; serving infrastructure can change observable behavior under fixed weights/ID | FACT |
| https://docs.anthropic.com/en/docs/about-claude/models/overview | Current model lineup / Models API pointer | FACT |
| https://platform.claude.com/docs/en/api/models/retrieve | Models API retrieve resolves alias → model info | FACT |
| https://platform.openai.com/docs/models | Models hub page fetched (nav-heavy); used only as existence of models surface, not for alias semantics | FACT (weak detail) |
| https://ai.google.dev/gemini-api/docs/models | Gemini models docs fetched; not heavily relied on for kill | FACT |

---

## B. Exact / near-exact primary-workflow products (fetched)

| URL | What was verified | Relation to AliasTripwire |
|---|---|---|
| https://vertrule.com/provider-sentinel/ | **Primary product:** sealed provider behaviour baselines; continuous rerun; alias vs behaviour vs context classification; exact canaries; evidence packs; proof boundary | **KILL evidence — primary workflow match** |
| https://vertrule.com/provider-sentinel/latest/ | Case study: 7 days × 5 providers; OpenAI reproducibility instability under sealed context | FACT — canary stability / honesty |
| https://www.promptcanary.dev/ | Hosted synthetic AI monitoring; scheduled canaries; pass/fail diffs; alerts; CI gates | Primary continuous-canary SaaS for AI endpoints |
| https://www.promptcanary.dev/docs/getting-started | Assertions: JSON/schema/keywords/latency/semantic similarity | FACT |
| https://www.promptcanary.dev/docs/ci-quality-gates | CI gate path (search + docs references) | FACT |
| https://www.promptcanary.dev/pricing | Free tier 2 monitors; paid cadences (search synthesis confirmed via pricing page discovery) | FACT via WebSearch + site |
| https://app.luxkern.com/aicanary | AICanary: continuous AI behavior testing; drift; silent updates; scheduled suites | Adjacent primary-workflow product |
| https://codeform.io/ | Coding harness as primary product; lists drift canary as one feature | Feature ≠ standalone product |
| https://codeform.io/docs/features/model-integrity/ | Pinning lint + nightly drift canary; hashes; fingerprint; warn/page rules | Mechanism overlap inside harness |
| https://driftwatchproxy.com/ | Proxy/firewall + drift marketing claims | Adjacent; proxy-primary |

---

## C. Adjacent platforms (fetched or partially fetched)

| URL | Notes |
|---|---|
| https://www.promptfoo.dev/docs/red-team/model-drift/ | Scheduled red-team/custom eval drift recipes — **primitive**, not AliasTripwire auto-kill alone |
| https://www.promptfoo.dev/docs/integrations/ci-cd/ | CI/CD eval gates (WebSearch + prior research) |
| https://docs.portkey.ai/docs/product/observability | Gateway/observability — adjacent |
| https://docs.helicone.ai/getting-started/quick-start | Observability quickstart — adjacent |
| https://github.com/egnaro9/model-drift | Public daily frozen suite / live tracker OSS |
| https://github.com/BerriAI/litellm/issues/29680 | Feature request for requested vs resolved model transparency — **metadata**, not canary product |

---

## D. Practitioner / secondary (supporting; not sole kill)

| URL | Notes | Label |
|---|---|---|
| https://dreaming.press/posts/how-to-catch-a-silent-model-upgrade-hosted-endpoint-drift.html | Pin + canary hash + alarms; DeepSeek framing | Secondary methodology; DeepSeek claims cross-checked against primary changelog |
| https://community.openai.com/t/where-can-i-check-the-model-alias-updates/1357643 | Developers asking for alias→snapshot history | FACT (community demand) |
| https://aitechconnect.in/tips/verify-model-provenance-cutoff-drift-2026 | Distributional canary advice (WebSearch full text saved) | Secondary |
| https://multigrid.ai/learn/silent-model-updates | **Fetch failed** (Jina timeout 422). Do **not** cite page body. WebSearch snippets only → HYPOTHESIS/secondary if used | NOT FETCHED |
| https://prompt-architects.com/blog/127-temperature-seeds-and-determinism-what-you-can-control | Secondary comparison of seed/fingerprint across providers (WebSearch); treat as INTERPRETATION aid, prefer OpenAI primary | Secondary |
| https://glama.ai/mcp/connectors/com.temsor/api/tools/model_drift | Temsor `model_drift` tool description (independent probes); connector catalog — not a full product UX audit | Secondary / catalog |

---

## E. Not used / failed fetches

| URL | Status |
|---|---|
| https://multigrid.ai/learn/silent-model-updates | Jina AssertionFailure / timeout — **excluded as primary evidence** |
| https://multigrid.ai/ | Incomplete fetch in batch — excluded |
| Live OpenAI/Anthropic canary runs | **Not run** — no API keys in env |

---

## F. Internal governance read for this pass

- `research/PRODUCT-DISCOVERY-RESET.md` (AliasTripwire kill condition)
- `research/REOPEN-GATE.md`
- `research/ANTI-FORCING.md`
- `research/DECISION-LOG.md`
- `research/FAILURE-MODE-CYCLE-03.md` / `04.md` (do-not-resurrect)
- `docs/ENGINEERING-STANDARDS.md`, `docs/FUTURE-ARCHITECTURE-RULES.md`, `docs/WIN-PLAN.md` (feasibility note only; no architecture)

---

## G. Search queries used (replayable)

- OpenAI system_fingerprint / seed / advanced usage
- LLM model change detection / alias canary / fingerprint / silent model swap
- Anthropic Models API retrieve / model IDs and versioning
- Promptfoo continuous monitoring model drift
- Codeform model integrity
- PromptCanary / AICanary / DriftWatch / Provider Sentinel
- DeepSeek V4-Flash-0731 changelog
- Temsor model_drift

---

## H. Evidence → decision map

| Claim | Strongest URL(s) |
|---|---|
| Silent same-name / routed model updates are real | https://api-docs.deepseek.com/updates |
| Backend/serving changes acknowledged by major provider | https://developers.openai.com/api/docs/guides/advanced-usage ; https://docs.anthropic.com/docs/en/about-claude/models/model-ids-and-versions |
| Exact-hash canaries need confirm-N / multi-surface | OpenAI advanced-usage + cookbook; Provider Sentinel case study |
| Primary-workflow clone exists | https://vertrule.com/provider-sentinel/ |
| Continuous hosted AI canary SaaS also exists | https://www.promptcanary.dev/ |
| Promptfoo adjacency ≠ sole kill | https://www.promptfoo.dev/docs/red-team/model-drift/ (recipe inside platform) |
