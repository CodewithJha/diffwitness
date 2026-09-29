# Product/market sources inspected

**Date:** 21 September 2026  
**Rule:** only pages actually fetched/read this workstream. Search snippets were discovery, not evidence.  
**Do not duplicate** a hackathon-only sources file if `research/sources-hackathon.md` exists — this file is product/market.

| Source name | URL | Type | Date on page / as fetched | What it proves | Relevant product/problem | Reliability | Notes |
|---|---|---|---|---|---|---|---|
| Hamel Husain — Your AI Product Needs Evals | https://hamel.dev/blog/posts/evals/ | Blog | 29 Mar 2024 | Unsuccessful LLM products lack evals; vendors overclaim replacing humans | Canary Session, Trace Autopsy | High (practitioner) | Not a survey |
| Hamel — Evals FAQ | https://hamel.dev/blog/posts/evals-faq/ | Blog | Fetched 21 Sep 2026 | 60–80% time on error analysis; 100+ traces; 2–4 week cycles | Trace Autopsy | High | Client-work heuristic |
| Hamel — LLM-as-judge Substack | https://hamelhusain.substack.com/p/llm-judge | Blog | Fetched 21 Sep 2026 | Critique shadowing; 1–5 scores often bad | Judge Swap | High | |
| Zheng et al. LLM-as-judge | https://arxiv.org/pdf/2306.05685.pdf | Paper | 2023 | Position/verbosity/self-enhancement biases | Do not be uncalibrated judge | High | NeurIPS |
| Self-preference bias paper | https://arxiv.org/abs/2410.21819 | Paper | 29 Oct 2024 | GPT-4 self-preference; perplexity hypothesis | Judge calibration | High | |
| Mata v. Avianca Justia | https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1:2022cv01461/575368/54/ | Court | 22 Jun 2023 | Fake ChatGPT citations; Rule 11 | CiteCheck | High | |
| Mata PACER PDF | https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf | Court | 2023 | Same; fake reporter collisions listed | CiteCheck | High | |
| Overlay Fact Sheet | https://overlayfactsheet.com/en/ | Statement | Fetched 21 Sep 2026 | Overlays cannot fully comply; 1,031 numbered signatories this fetch; WebAIM 67%/72% | SourceFix; reject overlays | High community / survey quoted | Counted numbered list |
| FTC accessiBe final order PR | https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million | Gov | 22 Apr 2025 | $1M; no WCAG-compliance claims without evidence | Reject overlay product | High | |
| FTC Jan 2025 accessiBe PR | https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-order-requires-online-marketer-pay-1-million-deceptive-claims-its-ai-product-could-make-websites | Gov | 3 Jan 2025 | Proposed complaint context | Overlays | High | |
| EUR-Lex Directive 2019/882 | https://eur-lex.europa.eu/eli/dir/2019/0882 | Law | 2019; applies after 28 Jun 2025 | EAA scope/date | SourceFix | High | |
| Commission EAA news | https://digital-strategy.ec.europa.eu/en/news/eu-becomes-more-accessible-all | Gov | 27 Jun 2025 | EAA enters application 28 Jun | SourceFix | High | |
| Adept update | https://www.adept.ai/blog/adept-update/ | Company | 28 Jun 2024 | Founders to Amazon; license models/agents | Reject generic agents | High | |
| CNBC Adept/Amazon | https://www.cnbc.com/2024/06/28/amazon-hires-execs-from-ai-startup-adept-and-licenses-its-technology.html | Press | 28 Jun 2024 | Confirms hiring + license | Failures | High | |
| Humane customer notice | https://support.humane.com/hc/en-us/articles/34374173951373-Important-Update-for-Consumer-Ai-Pin-Customers | Company | Fetched 21 Sep 2026 | Pin dies 28 Feb 2025 12:00 PST | Reject hardware | High | |
| HP press Humane | https://www.hp.com/us-en/newsroom/press-releases/2025/hp-accelerates-ai-software-investments-to-transform-the-future-of-work.html | Company | 18 Feb 2025 | $116M Cosmos + talent + IP | Failures | High | |
| TechCrunch Humane | https://techcrunch.com/2025/02/18/humanes-ai-pin-is-dead-as-hp-buys-startups-assets-for-116m/ | Press | 18 Feb 2025 | Refund window; brick | Failures | High | |
| CMA Inflection decision | https://assets.publishing.service.gov.uk/media/6719ff5f549f63039436b3c8/__Full_text_decision__.pdf | Regulator | 2024 | Almost all team hired; IP license; merger situation | Failures | High | Amounts redacted |
| Reuters Inflection $650M | https://www.reuters.com/technology/microsoft-agreed-pay-inflection-650-mln-while-hiring-its-staff-information-2024-03-21/ | Press | 21 Mar 2024 | ~$650M source | Failures | Medium | Anonymous source |
| TechCrunch Inflection hire | https://techcrunch.com/2024/03/19/microsoft-hires-inflection-founders-to-run-new-consumer-ai-division/ | Press | 19 Mar 2024 | Suleyman to Microsoft AI | Failures | High | |
| Bloomberg Builder.ai insolvency | https://www.bloomberg.com/news/articles/2025-05-20/microsoft-backed-builder-ai-to-enter-insolvency-proceedings | Press | 20 May 2025 | Insolvency; cash seized | Reject AI app builder | High paywall/snippet | |
| FT Builder.ai creditors | https://www.ft.com/content/16ee837a-1d89-448b-8a33-9741025334d6 | Press | 2025 | AWS ~$88M, MSFT ~$30M | Failures | High | |
| PitchBook Mutable.AI | https://pitchbook.com/profiles/company/512143-21 | Database | Fetched 2026 profile | Acquired/merged 11 Dec 2024 Google | Failures | High on deal flag | Paywall details |
| Tidelift 2024 maintainer report | PDF on kc-usercontent.com (fetched) | Survey | 2024 | 60% unpaid; 48% thankless; 60% quit/considered | OSS triage | Medium-High | Vendor survey |
| GitHub Blog maintainer Models | https://github.blog/open-source/maintainers/how-github-models-can-help-open-source-maintainers-focus-on-what-matters/ | Vendor blog | 28 Aug 2025 | 60% want triage, 30% dups; on-request AI | DupGate reject | Medium | Promotes GitHub Models |
| Bug dedup survey paper | https://doi.org/10.3390/app13158788 | Paper | 2023 | Long research history; Mozilla 300 bugs/day cited | OSS | Medium | Secondary cites |
| arXiv agent PRs 33k | https://arxiv.org/pdf/2601.15195 | Paper | 2026 | Merge outcomes; rejection taxonomy | Merge Preflight | High if methods hold | Not peer-review status checked |
| Langfuse GitHub | https://github.com/langfuse/langfuse | OSS | 21 Sep 2026 | 34,889 stars | Crowding | High | `gh` |
| Promptfoo GitHub | https://github.com/promptfoo/promptfoo | OSS | 21 Sep 2026 | 25,332 stars | Crowding | High | README vendor claim |
| Helicone GitHub | https://github.com/Helicone/helicone | OSS | 21 Sep 2026 | 6,168 stars | Crowding | High | |
| oasdiff GitHub | https://github.com/oasdiff/oasdiff | OSS | 21 Sep 2026 | 1,373 stars | Spec Triangle | High | |
| axe-core GitHub | https://github.com/dequelabs/axe-core | OSS | 21 Sep 2026 | 7,538 stars | SourceFix | High | |
| GX GitHub | https://github.com/fivetran/great_expectations | OSS | 21 Sep 2026 | 11,819 stars | Data DQ crowding | High | Fivetran-owned repo |
| Lago GitHub | https://github.com/getlago/lago | OSS | 21 Sep 2026 | 10,588 stars | Metering crowding | High | |
| OpenMeter GitHub | https://github.com/openmeterio/openmeter | OSS | 21 Sep 2026 | 2,327 stars | Metering | High | |
| Fern schema drift post | https://buildwithfern.com/post/stopping-schema-drift-coupling-sdks-documentation-claude | Vendor blog | Aug 2026 | Drift as pipeline | Spec Triangle | Medium | Sells Fern |
| Monte Carlo Business Wire survey | https://www.businesswire.com/news/home/20230502005377/en/Data-Downtime-Nearly-Doubled-Year-Over-Year-Monte-Carlo-Survey-Says | Vendor PR | 2 May 2023 | Wakefield n=200 commissioned | Data downtime | Medium-Low independent | Their survey |
| Monte Carlo $16k/day blog | https://montecarlo.ai/blog-how-tsa-caught-16k-a-day-bug | Vendor | Fetched 21 Sep 2026 | Cartesian join 379 days | SQL Grain Diff | Medium | First-party |
| Stripe payout recon | https://docs.stripe.com/payouts/reconciliation | Docs | Fetched 21 Sep 2026 | Payout batches; manual payouts on you | Payout Exceptions | High | |
| Stripe bank recon | https://docs.stripe.com/bank-reconciliation | Docs | Fetched 21 Sep 2026 | Reconcile payouts to bank | Same | High | |
| Puzzle Stripe FAQ | https://help.puzzle.io/en/articles/9426187-faq-stripe | Vendor | Fetched 21 Sep 2026 | Auto link if bank connected | Same | Medium | |
| Puzzle Stripe JEs | https://help.puzzle.io/en/articles/8422710-stripe-related-journal-entries | Vendor | Fetched 21 Sep 2026 | Clearing accounts 10920/10200 | Same | Medium | |
| LaunchDarkly flag debt | https://launchdarkly.com/docs/guides/flags/technical-debt | Vendor docs | Fetched 21 Sep 2026 | Archive heuristics; don’t game stale % | Reject Flag Reaper | High | |
| LaunchDarkly Vega | https://launchdarkly.com/docs/home/flags/manage/flag-cleanup-vega.md | Vendor docs | Fetched 21 Sep 2026 | Auto cleanup PRs | Same | High | |
| Google ICSME flaky tests | ICSME 2020 PDF (IEEE) | Paper | 2020 | Flakes at Google; TAP retries | Reject Flake Pack | High | |
| Datadog tests docs | https://docs.datadoghq.com/tests.md | Vendor | Fetched 21 Sep 2026 | Flake + TIA product | Same | High | |
| Buildkite Test Engine | https://buildkite.com/platform/test-engine/ | Vendor | Fetched 21 Sep 2026 | Flake workflows | Same | High | |
| Stampli PO matching | https://www.stampli.com/resources/po-matching-in-accounts-payable/ | Vendor | Fetched 21 Sep 2026 | Exception types | Reject AP | Medium | |
| Stampli accuracy | https://www.stampli.com/resources/invoice-extraction-accuracy-benchmarks/ | Vendor | Fetched 21 Sep 2026 | Don’t trust blended %; 87% coverage claim | Box Confirm | Low-Medium | Vendor-defined |
| Stampli 3-way | https://www.stampli.com/blog/all/po-matching-invoice/ | Vendor | Fetched 21 Sep 2026 | 97% agreement claim | Reject AP | Low-Medium | |
| Teams external bots | https://learn.microsoft.com/en-us/microsoftteams/manage-external-bots | Docs | Fetched 21 Sep 2026 | Detect/require approval | Reject notetakers | High | |
| Zoom community disable notetakers | https://community.zoom.com/meetings-2/how-do-i-disable-ai-notetakers-otter-ai-read-ai-fireflies-ai-etc-from-joining-our-meetings-17388 | Forum | Fetched 21 Sep 2026 | Admins trying to block bots | Reject notetakers | Medium | |
| Otter recording permissions | https://help.otter.ai/hc/en-us/articles/39339238308503-Recording-Permissions-with-Otter | Vendor | Fetched 21 Sep 2026 | All-party consent states | Reject notetakers | High on law framing | |
| HN CodeRabbit noise | https://news.ycombinator.com/item?id=42484498 | Forum | 22 Dec 2024 | Nitpick / low useful % | Reject PR bots | Medium | One commenter |
| HN CodeRabbit nitpicky | https://news.ycombinator.com/item?id=46320284 | Forum | Fetched 21 Sep 2026 | Nitpicky but often right | Same | Medium | |
| CodeRabbit verbosity KB | https://kb.coderabbit.ai/articles/6354480875-yaml-configuration-how-to-reduce-verbosity-and-nitpicks-during-a-code-review | Vendor | Fetched 21 Sep 2026 | They document the complaint | Same | High | |
| HumanLayer Launch HN | https://news.ycombinator.com/item?id=42247368 | Forum | Algolia 21 Sep 2026 | 354 points HITL API | Action Receipt competitor | High on traction | Page body not fully quoted |
| Codex close_agent hang | https://github.com/openai/codex/issues/25426 | GitHub | 2026 | Agent lifecycle hang | Action Receipt adjacent | High | Anecdote+repro |
| Afterhours README | repo README | Product | 21 Sep 2026 | Scaffold wow-path | Kill default | High | |
| WIN-PLAN | docs/WIN-PLAN.md | Internal | 2026 | Judging, deadlines | Constraints | High | Not market evidence |

| Humanloop sunset (via parallel sweep) | https://humanloop.com/ and HN 44592216 | Company + HN | 2025 | Eval platform sunset after Anthropic | Kill eval dashboards | High if copy matches | Details in `_raw-failures.md` |
| AgentGPT archive | https://github.com/reworkd/AgentGPT | OSS | last push 29 Apr 2025 | Archived 36k★ generic agent | Kill generic agents | High | Parallel `gh` |
| gpt-engineer archive | https://github.com/AntonOsika/gpt-engineer | OSS | last push 14 May 2025 | Archived 55k★ codegen experiment | Kill generic codegen | High | Parallel `gh` |
| TechCrunch Bench shutdown | https://techcrunch.com/2024/12/27/bench-shuts-down-leaving-thousands-of-businesses-without-access-to-accounting-and-tax-docs/ | Press | 27 Dec 2024 | Customers locked out of books | Kill hostage-data finance | High | Parallel sweep |
| Eugene Yan evals (raw-problems) | https://eugeneyan.com/writing/evals/ | Blog | 31 Mar 2024 | Off-the-shelf evals don’t correlate | Canary/Trace | High | Parallel fetch |
| Google Rules of ML (raw-problems) | https://developers.google.com/machine-learning/guides/rules-of-ml | Guide | page meta 2025-08-25 | Training-serving skew in production | Not shortlisted | High | Parallel fetch |
| Langfuse joining ClickHouse | https://langfuse.com/blog/joining-clickhouse | Company | via competitor sweep | Acquisition; crowding + acquihire risk | Kill eval clone | High if page matches | Amount Unknown |
| LangChain pricing | https://www.langchain.com/pricing | Vendor | competitor sweep | LangSmith Plus $39/seat | Crowding | High | |
| Braintrust pricing | https://www.braintrust.dev/pricing | Vendor | competitor sweep | Pro $249/mo unlimited users | Crowding | High | GitHub repo still Unknown |
| Chromatic pricing | https://www.chromatic.com/pricing | Vendor | competitor sweep | Starter $179/mo | Visual review gap still Chromatic-owned | High | |
| CodeRabbit exploit HN | https://news.ycombinator.com/item?id=44953032 | Forum | competitor sweep | 687 pts; RCE / 1M repos write | Kill PR bots | High on thread existence | Exploit details not re-audited here |
| Filippo Dependabot | https://words.filippo.io/dependabot/ | Blog | 20 Feb 2026 | Thousands of false PRs; alert fatigue | #17 evidence only | High | problem sweep |
| Uber Piranha | https://www.uber.com/blog/piranha/ | Eng blog | fetched in problem sweep | ~2,000 stale flags | #11 pain; product still rejected | High | |
| Figma acquired Diagram | https://www.figma.com/blog/ai-the-next-chapter-in-design/ | Company | 21 Jun 2023 | Magician plugin dies in host | Kill host plugins | High | failures sweep |

## Intentionally not used as evidence

- Artificialus Sweep AI “April 2026 discontinued” (aggregator). **Use Sweep GitHub README + HN pivot instead.**
- Secondary “Claude Code felt off” blogs as Anthropic quotes (official URL unconfirmed).
- Reddit r/vibecoding CodeRabbit thread (discovered; not fully authenticated fetch).
- Market TAM/CAGR from consulting decks (not fetched).
- Exa snippets until underlying page fetched.

## Agent Reach note

Doctor 21 Sep 2026: Jina/web OK; `gh` present; V2EX OK; Exa configured unverified-then-used; Reddit **off**; Twitter CLI **not installed**. Used Jina, `gh`, HN Algolia, Exa, Cursor WebSearch as discovery then fetch.
