# Sources inspected — CiteCheck validation

**Date accessed:** 21 September 2026  
**Rule:** only pages/APIs actually fetched or `gh`-queried this pass. Search snippets were discovery until the underlying page was read.  
**Agent Reach:** `agent-reach doctor --json` first. Used **Exa via mcporter** (then free-tier 429), **GitHub `gh`**, **Jina Reader** (`curl https://r.jina.ai/…`), **CourtListener REST/HTML**, **Crossref REST**, **HN Algolia**. Web backend OK. Reddit **off**. Twitter CLI **not installed**. LinkedIn MCP unverified. `agent-reach check-update`: **v1.5.0, current**.

Repo files read (not internet): `research/00-executive-summary.md`, `11-report-A-to-O.md`, `01-hackathon-intelligence.md`, `04-competitive-analysis.md`, `05-problem-opportunities.md` (Problem #4), `06-product-concepts.md` (Product #4), `07-shortlist.md`, `08-competitive-destruction.md`, `09-technical-feasibility.md`, `10-final-recommendation.md`, `AGENTS.md`, `docs/WIN-PLAN.md`.

---

| Source | URL | Type | Date | What it proves (this pass) | Reliability |
|---|---|---|---|---|---|
| Agent Reach doctor | local CLI `--json` | Tooling | 2026-09-21 | gh present; Exa configured unverified-live; Jina OK; Reddit/Twitter off | High |
| Exa: legal citation verification | `mcporter call exa.web_search_exa` | Search | 2026-09-21 | Hits for Westlaw Quick Check, Lexis Quote Check, Shepard’s BriefCheck, Seattle U brief-analysis guide, WestCheck PDF | Medium until page fetch |
| Exa: “AI citation checker” / CiteCheck / DOI | same | Search | 2026-09-21 | **Free MCP rate limit** after first successful call | N/A — failed |
| Westlaw Quick Check product | https://legal.thomsonreuters.com/en/products/westlaw-edge/quick-check | Product | 2026-09-21 | Upload brief → warnings for cited authority, quotation analysis, TOA; verify citations using KeyCite | High (Jina; nav-heavy but claims present) |
| Westlaw Quick Check help | https://www.thomsonreuters.com/en-us/help/westlaw-edge/tools/quick-check.html | Docs | 2026-09-21 | “Quick Check will verify your citations and quotations”; Word/PDF size limits; opponent KeyCite + quotes | High |
| Seattle U Law Library guide | https://lawlibguides.seattleu.edu/c.php?g=1201978&p=8789738 | Library guide | 2026-09-21 | Exa: Litigation Document Analyzer (formerly Quick Check) reviews quotations; Bloomberg Brief Analyzer; Lexis Brief Analysis | Medium (Exa snippet; page not fully re-fetched via Jina) |
| Lexis+ Quote Check | https://supportcenter.lexisnexis.com/app/answers/answer_view/a_id/1123689/ | Support | 2026-09-21 | Quote vs primary source; pin-cite incorrect flag; Shepard’s on all citations | High |
| Lexis+ Brief Analysis marketing | https://www.lexisnexis.com/en-us/products/lexis-plus/brief-analysis.page | Product | 2026-09-21 | Page exists (AI brief review); body truncated in fetch | Medium |
| Bloomberg Brief Analyzer | https://pro.bloomberglaw.com/brief-analyzer/ | Product | 2026-09-21 | “easily check citations”; 2020 award | High |
| westcheck.com | https://westcheck.com/ | Sign-in | 2026-09-21 | Drafting Assistant US Signon; firm security can disable Remember me | High that TR still gates this URL |
| CoCounsel Legal | https://legal.thomsonreuters.com/en/products/cocounsel-legal | Product | 2026-09-21 | TR AI that unites research, analysis, drafting | High on vendor identity; not a cite-verify spec |
| Harvey homepage | https://www.harvey.ai/ | Company | 2026-09-21 | $550M at $15.5B valuation banner | High as self-reported |
| Harvey Knowledge | https://www.harvey.ai/platform/knowledge | Product | 2026-09-21 | Legal/regulatory/tax research; ecosystem “ground every answer in sources you trust” | High on copy; no dedicated cite-checker page found |
| Harvey Security | https://www.harvey.ai/security | Security | 2026-09-21 | No training on uploads; ethical walls; in-region; SSO; SOC 2/ISO/GDPR | High |
| Fastcase | https://www.fastcase.com/ | Company | 2026-09-21 | Now part of Clio; Vincent AI; bar-association distribution | High |
| CourtListener ChatGPT post | https://free.law/2026/09/17/grounded-legal-research-in-chatgpt/ | Announcement | 2026-09-21 | 17 Sep 2026: verify every citation in an incoming brief against primary sources; ChatGPT plugin + MCP; rate limits doubled through 1 Oct | High |
| CourtListener MCP wiki | https://wiki.free.law/c/courtlistener/help/api/mcp/using-the-courtlistener-mcp-in-claude-chatgpt-and-other-ai-assistants | Docs | 2026-09-21 | Tool: “Citation verification — Grounded citation checks to reduce hallucinations”; sample prompt “Verify every citation in this brief…” | High |
| Mata PACER PDF via CL | https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf | Court opinion | 2026-09-21 | Sanctions; fake cases/quotes; Gibbs collision; existence ≠ proposition; Schwartz failed lookup then filed | High |
| Mata Justia HTML | https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1:2022cv01461/575368/54/ | Court HTML | 2026-09-21 | **403** Cloudflare | High that this URL is blocked this pass |
| Mata Casetext | https://casetext.com/case/mata-v-avianca-inc | Vendor | 2026-09-21 | **410 Gone**; “visit Westlaw… CoCounsel” | High |
| Mata CL docket | https://www.courtlistener.com/docket/63107798/mata-v-avianca-inc/ | Docket | 2026-09-21 | Page fetched (27kB) | High on existence |
| CL `/c/F.3d/925/1339/` | https://www.courtlistener.com/c/F.3d/925/1339/ | Citation lookup | 2026-09-21 | 404 Unable to Find Citation “925 F.3d 1339” (fake Varghese) | High |
| CL Gibbs opinion | https://www.courtlistener.com/opinion/438784/frank-gibbs-jr-v-maxwell-house-a-division-of-general-foods-corporation/ | Opinion | 2026-09-21 | Real case at 738 F.2d 1153 | High |
| CL `/c/F.3d/516/1237/` | https://www.courtlistener.com/c/F.3d/516/1237/ | Citation lookup | 2026-09-21 | 404 fake Zicherman F.3d cite | High |
| CL Zicherman SCOTUS | https://www.courtlistener.com/opinion/117990/zicherman-ex-rel-estate-of-kole-v-korean-air-lines-co/ | Opinion | 2026-09-21 | Real Zicherman 516 U.S. 217 | High |
| CL Greenleaf | https://www.courtlistener.com/opinion/3011108/greenleaf-v-garlock-inc/ | Opinion | 2026-09-21 | 174 F.3d 352; HTML resolver target of fake 174 F.3d 366 | High |
| CL ISS Marine | https://www.courtlistener.com/opinion/2661490/united-states-of-america-v-iss-marine-services-inc/ | Opinion | 2026-09-21 | Real case at 905 F. Supp. 2d 121 (fake Petersen’s reporter) | High |
| CL `/c/F.2d/821/1147/` | https://www.courtlistener.com/c/F.2d/821/1147/ | Citation lookup | 2026-09-21 | Several citations found (Air Crash cluster); ChatGPT verify banner | High |
| CL Rimsat | https://www.courtlistener.com/opinion/768752/in-re-rimsat-limited-debtor-appeals-of-kauthar-sdn-bhd/ | Opinion | 2026-09-21 | Real 212 F.3d 1039; Rule 11 case | High |
| CL El Al Tseng | https://www.courtlistener.com/opinion/118253/el-al-israel-airlines-ltd-v-tsui-yuan-tseng/ | Opinion | 2026-09-21 | Real 525 U.S. 155; Montreal/purpose language is Warsaw-protocol context | High |
| CL `/c/F.3d/92/1074/` | https://www.courtlistener.com/c/F.3d/92/1074/ | Citation lookup | 2026-09-21 | Several citations found (fake Hyatt page) | High |
| CL `/c/F.2d/556/713/` | https://www.courtlistener.com/c/F.2d/556/713/ | Citation lookup | 2026-09-21 | Resolves to *United States v. Clerkley* | High |
| CL `/c/F.3d/772/1278/` | https://www.courtlistener.com/c/F.3d/772/1278/ | Citation lookup | 2026-09-21 | Resolves to *Witt v. Metropolitan Life* | High |
| CL `/c/B.R./330/466/` | https://www.courtlistener.com/c/B.R./330/466/ | Citation lookup | 2026-09-21 | Resolves to *In re 652 West 160th LLC* | High |
| CL `/c/N.J. Super./360/360/` | https://www.courtlistener.com/c/N.J.%20Super./360/360/ | Citation lookup | 2026-09-21 | 404 Unable to Find Citation | High |
| CL `/c/A.2d/823/122/` | https://www.courtlistener.com/c/A.2d/823/122/ | Citation lookup | 2026-09-21 | 404 Unable to Find Citation “823 A.2d 122” | High |
| CourtListener REST v4 search | https://www.courtlistener.com/api/rest/v4/search/ | API | 2026-09-21 | citation counts: Gibbs 1; 516 F.3d 1237 **0**; 516 U.S. 217 1; 174 F.3d 366 **0**; 174 F.3d 352 1; ISS Marine 1; 360 N.J. Super. 360 **0**; Rimsat 1; El Al 1; Ireland 1; Shaboon name **0**; Ehrlich name search hits 360 F.3d 366 2d Cir; `2013 IL App (1st)` count **7326** including Boykin 112696 | High |
| Crossref real DOI | https://api.crossref.org/works/10.1038/nature14539 | API | 2026-09-21 | 200; “Deep learning”; Nature | High |
| Crossref fake DOI | https://api.crossref.org/works/10.1038/nature999999 | API | 2026-09-21 | 404 Resource not found | High |
| HTTP HEAD CL home + fake path | https://www.courtlistener.com/ | HTTP | 2026-09-21 | Both **403 CloudFront** | High that HEAD≠existence here |
| eyecite | `gh repo view freelawproject/eyecite` | GitHub | 2026-09-21 | 283★; extract legal citations; updated 2026-09-20 | High |
| courtlistener_citations_mcp | `gh` + README via API | GitHub | 2026-09-21 | 5★; Mata demo: real / fabricated / wrong-case; eyecite + CL REST v4 | High |
| citegate | `gh` + README | GitHub | 2026-09-21 | 102★; CI gate vs Crossref/OpenAlex/DBLP; fabricated + retracted | High |
| color4-alt/CiteCheck | `gh` | GitHub | 2026-09-21 | 59★; name collision; academic citation skill | High |
| PHY041/claude-skill-citation-checker | `gh` | GitHub | 2026-09-21 | 32★; .bib hallucination detector | High |
| xzy-xzy/CiteCheck + arXiv | https://github.com/xzy-xzy/CiteCheck https://arxiv.org/abs/2502.10881 | Paper | 2026-09-21 | CiteCheck: Towards Accurate Citation Faithfulness Detection, 15 Feb 2025 | High |
| tanhakris/juris-citation-verify | `gh` | GitHub | 2026-09-21 | 0★; CL + eyecite CLI hallucination detector | High |
| gongahkia/lit-hackathon-2025 | `gh` | GitHub | 2026-09-21 | POFact AI-free parliamentary citation checker; archived | High |
| lizTheDeveloper/citation-checker | `gh` | GitHub | 2026-09-21 | 6★; git hook hallucinated citations | High |
| jet52/jetredline | `gh` | GitHub | 2026-09-21 | 2★; quote validation vs official sources | High |
| adamlechowicz / wzh4464 citation-checker | `gh` | GitHub | 2026-09-21 | Deterministic bib/PDF verifiers | High |
| benchoi93/refcheck | `gh` | GitHub | 2026-09-21 | 3★; academic MCP hallucination catcher | High |
| ethz-spylab/hallucinated-citations | `gh` | GitHub | 2026-09-21 | 3★; arXiv probably-hallucinated refs | High |
| scite.ai | https://scite.ai/ | Product | 2026-09-21 | Smart citations; “never generated or hallucinated”; 2M users claim | High on copy; vendor metrics |
| YC companies ?query=citation | https://www.ycombinator.com/companies?query=citation | Directory | 2026-09-21 | Filter UI “40 of 186”; Ritivel visible; no CiteCheck named in snippet | Low for completeness |
| Product Hunt search | https://www.producthunt.com/search?q=citation%20checker | Directory | 2026-09-21 | **CAPTCHA** | N/A |
| Chrome Web Store | https://chromewebstore.google.com/search/citation%20checker | Store | 2026-09-21 | **429** then generic homepage on `/detail/citation-checker` | N/A for extensions |
| recite.net | https://www.recite.net/ | Domain | 2026-09-21 | ReciteQuran CAPTCHA — **not** a legal citator | High that this URL is wrong product |
| recitelaw.com / recite.co.uk | same | Domain | 2026-09-21 | **DNS would not resolve** | High that those hosts are dead/unregistered this pass |
| HN Algolia | https://hn.algolia.com/api/v1/search?query=… | Forum index | 2026-09-21 | Dutch lawyer fined 2026 hallucinated citation (nltimes); 2024 lawyer-fined story; not a product | Medium (index + linked titles) |
| nltimes (via HN hit) | https://nltimes.nl/2026/08/24/dutch-lawyer-fined-eu2300-using-ai-hallucinated-citation | News | 2026-09-21 | Title only via Algolia; article body **not** fetched | Low |
| ABA Formal Opinion 512 PDF | guessed ABA path | Ethics | 2026-09-21 | **Page Not Found** / membership wall | Unknown — not read |
| ABA news 2024-07 generative AI | ABA news URL | Ethics | 2026-09-21 | **CAPTCHA / 404** | Unknown |
| Reuters ABA 512 | reuters.com legalindustry URL | News | 2026-09-21 | Jina **403 abuse block** | Unknown |
| Law.com ABA 512 | law.com legaltechnews URL | News | 2026-09-21 | **404** | Unknown |
| Florida Bar Opinion 24-1 | https://www.floridabar.org/etopinions/opinion-24-1/ | Ethics | 2026-09-21 | URL exists; fetched HTML was chrome; **no extractable confidentiality body** | Low for substance |
| CA Bar generative-AI PDF | calbar.ca.gov Portals PDF | Ethics | 2026-09-21 | **Page not found** | Unknown |
| NYC Bar 2024-5 | nycbar.org reports URL | Ethics | 2026-09-21 | **404** | Unknown |
| Ehrlich FindLaw guess | caselaw.findlaw.com/nj-…/1399730.html | Caselaw | 2026-09-21 | **404** | N/A |
| Google Scholar Ehrlich | scholar.google.com | Search | 2026-09-21 | **403** automated-query block | N/A |
| Casetext Ehrlich | https://casetext.com/case/ehrlich-v-american-airlines-inc | Vendor | 2026-09-21 | **410 Gone** | High that Casetext is shut |

**Intentionally not evidence:** Reddit threads (backend off); Product Hunt listings (CAPTCHA); Chrome extension names (store 429); ABA 512 quotations (PDF not obtained); Recite UK product claims (domains failed); fabricated competitor pricing; lawyer interview quotes (none conducted).
