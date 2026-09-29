# CiteCheck — Kill Validation

**Date:** 21 September 2026  
**Candidate:** CiteCheck only. Adversarial. No defense. No new product ideas. No application code.  
**Method:** Repo research files + Agent Reach (`doctor --json`; Exa via mcporter until free-tier 429; GitHub `gh`; Jina Reader; CourtListener REST/HTML; Crossref REST). Reddit backend **off**. Twitter CLI **not installed**. Product Hunt **CAPTCHA**. Chrome Web Store **429**. ABA/Reuters ethics PDFs **404 or blocked**.  
**FACT vs INFERENCE labeled.** Unknown stays Unknown.

---

## Thesis under attack

CiteCheck verifies whether citations, cases, DOIs, URLs, and quoted material in an AI-generated document actually exist and match the claimed source. Not legal research, advice, chatbot, generation, RAG, or a Westlaw replacement. Wedge: a verification gate for AI-generated claims and citations.

Repo version (`research/06-product-concepts.md` #4): paste a memo; probe case/DOI/URL existence and quote-at-pinpoint against public records; no drafting. 20-second demo: Mata-style fakes go red; reporter-number collision shows Gibbs v. Maxwell House at a fake case’s cite.

---

## Kill Test A — Existing products

**Result: KILL.** The job is already a shipped feature of the legal research incumbents, a named tool in CourtListener’s own ChatGPT/MCP docs, a GitHub MCP whose README demos *Mata v. Avianca*, and a crowded OSS/CI category for academic citations. A 3-week hosted paste box is a wrapper.

### Legal brief upload → citation + quote verification (the exact workflow)

**FACT — Westlaw Quick Check (pages fetched 21 Sep 2026):**

- Product page: “Simply upload a brief and Quick Check will produce a report with recommendations for additional relevant authority, **warnings for cited authority, an analysis of quotations**, and a table of authorities.” “Fully integrated with Westlaw Edge, Quick Check allows you to quickly **verify citations using KeyCite**.” Upload opponent’s document to “review warnings for cited authority, an analysis of quotations.”  
  https://legal.thomsonreuters.com/en/products/westlaw-edge/quick-check
- Help page: “Quick Check **will verify your citations and quotations**.” Upload Word ≤20MB or PDF ≤30MB (~120 pages), or paste text. Opponent mode: KeyCite on their citations + quotation analysis.  
  https://www.thomsonreuters.com/en-us/help/westlaw-edge/tools/quick-check.html
- Seattle University Law Library guide (fetched via Exa 21 Sep 2026): “Litigation Document Analyzer **(formerly Quick Check)** … analyzes uploaded drafts and briefs using KeyCite … and can **review quotations for accuracy**.”  
  https://lawlibguides.seattleu.edu/c.php?g=1201978&p=8789738

**FACT — Lexis+ Brief Analysis Quote Check (support article fetched 21 Sep 2026):**

- Upload extracts quotations and “**verifies that each quote accurately matches the cited primary source, including whether the pin cites provided are correct**.” UI labels: “This quote is incorrect / This quote is correct”; “The pinpoint page in your citation is Incorrect.” Also “a full *Shepard’s*® analysis of citations.”  
  https://supportcenter.lexisnexis.com/app/answers/answer_view/a_id/1123689/

**FACT — Lexis Shepard’s BriefCheck (Exa hit, 21 Sep 2026):** BriefCheck processes an uploaded document or a pasted citation list with Shepard’s, QuoteCheck, Get Document. Max 2,000 citations per uploaded document.  
  (Lexis support/training snippet returned by Exa; full BriefCheck UI not independently re-fetched as a standalone product page.)

**FACT — Bloomberg Law Brief Analyzer (page fetched 21 Sep 2026):** “With Brief Analyzer, easily **check citations**, search case law, find relevant content, and more.” Award winner 2020.  
  https://pro.bloomberglaw.com/brief-analyzer/

**FACT — WestCheck.com (fetched 21 Sep 2026):** URL resolves to “Drafting Assistant US Signon” (Thomson Reuters OnePass). Firm security copy on the sign-in page: “'Remember me' is not allowed by your firm’s security settings.” That is the incumbent citation-extraction product lineage (WestCheck.com), still gated behind firm SSO.  
  https://westcheck.com/

### The public-data vendor already named the wedge

**FACT — Free Law Project, 17 September 2026 (four days before this memo):** “Grounded Legal Research in ChatGPT: CourtListener Joins ChatGPT Enterprise.” Bullet: “An attorney can **verify every citation in an incoming brief against primary sources** before it goes out the door.” ChatGPT plugin + MCP. Rate limits doubled through 1 Oct 2026. Michael Lissner quoted on bringing research tools to people already asking legal questions in ChatGPT.  
  https://free.law/2026/09/17/grounded-legal-research-in-chatgpt/

**FACT — CourtListener MCP wiki (fetched 21 Sep 2026):** Available tools include “**Citation verification — Grounded citation checks to reduce hallucinations**.” Sample prompt, quoted: “**Verify every citation in this brief and flag any unknown citations**.”  
  https://wiki.free.law/c/courtlistener/help/api/mcp/using-the-courtlistener-mcp-in-claude-chatgpt-and-other-ai-assistants

**FACT — CourtListener citation-lookup UI exists as a first-party page:** `/c/` “Look Up Citations.” Banner on those pages repeats the ChatGPT verify-citations pitch. Example: https://www.courtlistener.com/c/F.3d/925/1339/ returned “Unable to Find Citation ‘925 F.3d 1339’” (404).

### OSS that is CiteCheck already (GitHub, `gh` 21 Sep 2026)

| Repo | Stars | What the description / README actually says |
|---|---:|---|
| [freelawproject/eyecite](https://github.com/freelawproject/eyecite) | **283** | “Find legal citations in any block of text.” The parser CiteCheck would wrap. Updated 20 Sep 2026. |
| [chrisyangsong/citegate](https://github.com/chrisyangsong/citegate) | **102** | “Citation integrity as a **CI gate**”: verify BibTeX vs Crossref/OpenAlex/DBLP; fail build on fabricated or retracted refs. PyPI package. Created 11 Aug 2026. |
| [color4-alt/CiteCheck](https://github.com/color4-alt/CiteCheck) | **59** | **Name collision.** “Agent Skill: Check academic paper citations for format, queryability, thematic relevance, and semantic accuracy.” |
| [PHY041/claude-skill-citation-checker](https://github.com/PHY041/claude-skill-citation-checker) | **32** | “AI citation hallucination detector — verify .bib files against CrossRef, Semantic Scholar, OpenAlex.” |
| [john-walkoe/courtlistener_citations_mcp](https://github.com/john-walkoe/courtlistener_citations_mcp) | **5** | “MCP server for validating legal citations against CourtListener’s 9M+ opinion database — detects AI-hallucinated citations, name mismatches, and ambiguous reporters.” README: “**Citation validation of *Mata v. Avianca*. The MCP detects which citations are real, which are fabricated, and which resolve to the wrong case entirely.**” Local eyecite pass + CourtListener REST v4. Created 4 Mar 2026. |
| [xzy-xzy/CiteCheck](https://github.com/xzy-xzy/CiteCheck) | **5** | Paper+dataset: [CiteCheck: Towards Accurate Citation Faithfulness Detection](https://arxiv.org/abs/2502.10881) (submitted 15 Feb 2025). RAG citation-faithfulness, not a legal product — **name taken in the literature**. |
| [tanhakris/juris-citation-verify](https://github.com/tanhakris/juris-citation-verify) | 0 | “CLI that verifies CourtListener REST API + Eyecite … (legal-tech hallucination detector).” |
| [gongahkia/lit-hackathon-2025](https://github.com/gongahkia/lit-hackathon-2025) | 2 | “POFact: **AI-free Parliamentary Citation Checker**” (archived hackathon). |
| [lizTheDeveloper/citation-checker](https://github.com/lizTheDeveloper/citation-checker) | 6 | Git hook for hallucinated citations in AI-generated text. |
| [jet52/jetredline](https://github.com/jet52/jetredline) | 2 | Claude skill: cite-check bench memos; “validates quotes against official sources.” |
| [benchoi93/refcheck](https://github.com/benchoi93/refcheck) | 3 | MCP: Crossref / Semantic Scholar / arXiv; “Catches hallucinated citations.” |
| Plus a pile of 2026 `citation-checker` repos | 0–1 | Deterministic .bib/PDF verifiers (adamlechowicz, wzh4464, etc.). |

`gh search repos "citation checker"` returned **at least twenty** similarly named repos on this pass. This is not an empty category.

### Academic / researcher adjacent (not the legal wedge, still crowding)

**FACT — scite.ai (fetched 21 Sep 2026):** “Smart Citations”; “**Every answer is grounded in real papers, never generated or hallucinated**”; “2,000,000 researchers.” That is existence+support/contradict for papers, not US case law — but it occupies “verifier of citations in AI-ish research answers.”  
https://scite.ai/

**FACT — YC directory search `citation` (fetched 21 Sep 2026):** filter UI rendered “Showing 40 of 186 companies” for query `citation`; first card visible was Ritivel (life-sciences documentation, W26), not a legal citator. No YC company named CiteCheck was identified in the truncated HTML. **Unknown** whether a YC legal-citation startup exists beyond this snippet.

**Not inspected this pass (blocked):** Reddit (no backend), Product Hunt (CAPTCHA), Chrome Web Store search (429), Twitter.

**INFERENCE (labeled):** the “paste document, red/green citations” job is not a new category. It is KeyCite/Shepard’s/Brief Analyzer for firms that pay, and eyecite+CourtListener MCP for everyone else. CiteCheck as an OFFGRID app is a hosted skin.

---

## Kill Test B — Incumbent response

**Result: KILL.** They did not need to “add a badge.” Westlaw, Lexis, and Bloomberg **already ship upload-a-brief citation and quote verification**. Thomson Reuters also owns CoCounsel. CourtListener, the public corpus CiteCheck would query, **already documents the exact prompt**. Harvey is a $15.5B legal AI platform with a Knowledge product that “ground[s] every answer in sources you trust” and an enterprise security page built for privileged uploads. There is no remaining defensible reason a standalone 3-week app still matters.

**FACT — CoCounsel is Thomson Reuters (fetched 21 Sep 2026):** https://legal.thomsonreuters.com/en/products/cocounsel-legal — “Complete legal work faster with AI that unites research, analysis, and drafting.” Same vendor as Westlaw Quick Check. Adding “verify the cites CoCounsel just drafted” is a product-management checkbox on an existing brief-upload pipeline, not a new company.

**FACT — Harvey (fetched 21 Sep 2026):** Homepage banner: “We Raised **$550M at a $15.5B Valuation**.” Knowledge: research across legal/regulatory/tax. Ecosystem: “ground every answer in sources you trust.” Security: SAML SSO, audit logs, IP allow-list, in-region (EU/CH, US, AU), **no model training** on inputs/outputs/uploads, ethical-wall sync, SOC 2 / ISO / GDPR addendum.  
https://www.harvey.ai/  https://www.harvey.ai/platform/knowledge  https://www.harvey.ai/security

**Unknown this pass:** a Harvey marketing page that literally says “citation existence checker.” Not required. They already ingest firm documents in Vault, ground answers, and sell to the same buyer. **INFERENCE (labeled):** shipping a Quick-Check-shaped verify step is trivial relative to a $15.5B platform. A hackathon URL cannot win that bake-off.

**FACT — Fastcase / the Mata firm’s actual stack:** Mata opinion (PACER PDF): the sanctioned firm “uses a legal research service called **Fastcase** and does not maintain Westlaw or LexisNexis accounts.” Fastcase homepage 21 Sep 2026: “Fastcase is now part of **Clio**”; Vincent AI trial; bar-association distribution.  
https://www.fastcase.com/  
The “lawyers without Westlaw” rescue is already a Clio/vLex customer, not an addressable void.

**No defensible standalone answer (this is the kill rule):**

- Firms with Westlaw/Lexis/Bloomberg already have the upload-and-verify workflow inside the system they will actually file from.
- Firms without them have Fastcase, CourtListener `/c/` lookup, and as of 17 Sep 2026 a CourtListener ChatGPT plugin whose documented job is “verify every citation in this brief.”
- A new hosted app is the *least* trusted place to paste a privileged draft (see Test E).
- Differentiating as “we only check AI output, we don’t do research” is a slogan. Quick Check does not care who wrote the brief.

**Kill CiteCheck on Test B.**

---

## Kill Test C — Real false citations (*Mata v. Avianca*)

**Result: WEAK as a product, not as a horror story.** The opinion is real. Existence checks catch *some* fakes. They systematically **fail** the cases the opinion itself treats as the interesting failure: reporter collisions, real cases cited for the wrong proposition, and fabricated quotations of real opinions. A deterministic “does this cite resolve?” system cannot do the job the thesis claims.

**Primary source used:** CourtListener-hosted PACER PDF of the 22 Jun 2023 sanctions opinion, 43 pages.  
https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf  
Justia HTML of the same opinion: **403 Cloudflare** this pass. Casetext: **410 Gone** (“visit Westlaw … check out CoCounsel”).

**FACT — what the court found (PDF, not paraphrase of blogs):**

- Respondents “submitted **non-existent judicial opinions with fake quotes and citations** created by … ChatGPT, then continued to stand by the fake opinions.”
- Rule 11 gatekeeping; “nothing inherently improper about using a reliable artificial intelligence tool.”
- Acknowledged ChatGPT fabrications: **Varghese, Miller, Petersen, Shaboon, Martinez, Durden**.
- Internal fake cites inside the fake Varghese opinion, with **real opinions sitting at those reporter numbers**.
- Class of real decisions with **correct names and citations that do not contain the quoted language or support the proposition** (Rimsat, PPI Enterprises, Begier, Kaiser Steel, El Al, Gandy).
- Schwartz **knew free lookup sites existed**, entered the Varghese citation, **could not find it**, and filed anyway. He “never thought it could be made up.”

That last point is an impact kill even if the detector is perfect: the human ignored a miss.

### Live lookups this pass (21 Sep 2026)

Method: CourtListener HTML citation URLs (`/c/…`) and REST v4 search `citation:"…"` unless noted.

| Input (from the opinion) | What a “does it exist?” checker would see | What is actually true (opinion + live lookup) |
|---|---|---|
| `Varghese … 925 F.3d 1339 (11th Cir. 2019)` | HTML **404** “Unable to Find Citation ‘925 F.3d 1339’”. REST timed out once. | **Nonexistent case.** Court: 11th Cir. clerk confirmed; docket 18-13694 is *Cornea*; 925 F.3d 1291 is *J.D. v. Azar*. Existence check: **correct red**. |
| `Holliday v. Atl. Capital Corp., 738 F.2d 1153` | HTML **202 →** *Gibbs v. Maxwell House*, opinion 438784. REST count **1**: Gibbs, 11th Cir. 1984. | **Nonexistent case at a real reporter cite.** Existence-only: **false green** (or “found something”). Name match required. This is the repo’s own wow-demo collision. |
| `Gen. Wire Spring Co. … 556 F.2d 713` | HTML → *United States v. Clerkley* (4th Cir.). | Fake name; real other case (court: Clerkley at 556 F.2d 709). **False green** if you trust the resolver. |
| `Hyatt v. N. Cent. Airlines, 92 F.3d 1074` | HTML: “**Several Citations Found**” for 92 F.3d 1074. | Court: Hyatt does not exist; two brief orders occupy that page. Existence: **ambiguous / false green**. |
| `Zaunbrecher … 772 F.3d 1278` | HTML → *Witt v. Metropolitan Life*, 11th Cir. 2014 (pages 1269+). | Fake name; real Witt. **False green**. |
| `Zicherman … 516 F.3d 1237 (11th Cir. 2008)` | HTML **404**. REST count **0**. | **Does not exist as cited.** Real *Zicherman* is **516 U.S. 217 (1996)** (REST count 1, opinion 117990). Federal Reporter slot is *Miccosukee Tribe*, 516 F.3d 1235. Existence on the fake reporter: **correct red**. Same-name different reporter: a name search would **false-green** the Supreme Court case. |
| `In re BDC 56 LLC, 330 B.R. 466` | HTML → *In re 652 West 160th LLC*, 330 B.R. 455 (Bankr. S.D.N.Y. 2005). | Fake-as-cited; real other bankruptcy case at the reporter. Court also notes a **real** 2d Cir. *BDC 56 LLC*, 330 F.3d 111, wrong reporter and wrong proposition. **False green** on reporter; **name collision** across reporters. |
| `Miller … 174 F.3d 366 (2d Cir. 1999)` | REST `citation:"174 F.3d 366"` count **0**. HTML **202 →** *Greenleaf v. Garlock*, **174 F.3d 352** (3d Cir.). | **Nonexistent Miller.** Court: 174 F.3d 352 is Greenleaf. CourtListener’s **page-range resolver mapped a fake pinpoint onto a nearby real opinion.** Existence via HTML: **false green**. Existence via exact REST citation: **correct red**. The two public APIs **disagree**. |
| `Petersen v. Iran Air, 905 F. Supp. 2d 121` | REST count **1**: *United States v. ISS Marine Services*, 905 F. Supp. 2d 121 (D.D.C. 2012), opinion 2661490. HTML 202 to that opinion. | Petersen **does not exist**. The reporter number **does**. Existence-only: **false green**. |
| `Shaboon … 2013 IL App (1st) 111279-U` | REST name search count **0**. | Acknowledged fake. **Correct red** on this corpus. Nearby **real** unpublished Illinois cites **do** resolve (below). |
| `Ehrlich … 360 N.J. Super. 360 (App. Div. 2003)` | HTML **404**. REST count **0**. Parallel `823 A.2d 122` HTML **404**. | Court **asked for a copy** of Ehrlich in the 11 Apr 2023 order and **did not** list it among later acknowledged ChatGPT fakes. Independent confirmation of this NJ Super reporter on Justia/FindLaw/Google Scholar: **failed this pass** (403/404). A **same-named** federal case **does** exist: *Ehrlich v. American Airlines*, **360 F.3d 366** (2d Cir. 2004) — REST hit. **Unknown** whether 360 N.J. Super. 360 is a real state opinion missing from CL (false red) or a fake (correct red). Name-only search: **false green** of the 2d Cir. case. |
| `In re Air Crash Disaster Near New Orleans, 821 F.2d 1147` | HTML: “**Several Citations Found**.” REST JSON truncated; `count: 2`; first result *Trivelloni-Lorenzi v. Pan American*. | **Real (ambiguous cluster).** Existence: green-ish, not a unique hit. |
| `In re Rimstat, Ltd., 212 F.3d 1039` | REST count **1**: *In re Rimsat*, 7th Cir. 2000, opinion 768752. | **Exists.** Court: it is a **Rule 11** opinion and “**does not discuss the federal bankruptcy stay**.” Existence: **false green on the actual legal claim**. |
| `El Al Israel Airlines v. Tseng, 525 U.S. 155` | REST count **1**, opinion 118253. Opinion text fetched via Jina: “Montreal” appears **7** times; “purpose of” **4** times; discussion is Warsaw/Montreal Protocol, not a ChatGPT-invented Montreal-Convention-purpose quote. | **Exists.** Court: “**does not contain the quoted language** discussing the purpose of the Montreal Convention.” Existence: **false green**. Quote-match is a different product. |
| `Ireland v. AMR Corp., 20 F. Supp. 3d 341` (court’s own real cite in n.11) | REST count **1**, E.D.N.Y. 2014. | **Real citation, real case.** Control **green**. |

**DOI / URL (non-Mata, to test the rest of the thesis):**

- Crossref `GET /works/10.1038/nature14539` → 200, title “Deep learning,” *Nature*. **Real DOI: green.**
- Crossref `GET /works/10.1038/nature999999` → **404** “Resource not found.” **Fake DOI: red.**
- HTTP HEAD `https://www.courtlistener.com/` and HEAD of a nonexistent path: **both HTTP/2 403 CloudFront**. URL “verification” by HEAD is **indistinguishable** for live vs dead on this CDN. **URL prong of the thesis is broken as specified.**

**FACT, not inference:** existence ≠ correctness. The Mata court said so in so many words for Rimsat, El Al, Begier, Kaiser Steel, PPI, Gandy. Live CourtListener lookups reproduce reporter-number **false greens** and an HTML-vs-REST **disagreement** on Miller. A 3-week CiteCheck that only paints reporter resolution red/green will **green the collisions that made Mata interesting** unless it also does name-match (weekend) **and** proposition/quote match (not 3 weeks; Lexis already sells Quote Check).

**INFERENCE (labeled):** john-walkoe’s MCP already claims the Mata fixture (real / fabricated / wrong-case). Building it again for OFFGRID is duplication, not a discovery.

---

## Kill Test D — False-positive risk

**Result: KILL.** Uncontrollable on public corpora. Both directions.

### False greens (simplistic existence)

Live, this pass:

- Fake Miller `174 F.3d 366` **HTML-resolved to a different real case** (*Greenleaf*, 174 F.3d 352).
- Fake Petersen `905 F. Supp. 2d 121` **is** ISS Marine.
- Fake Holliday `738 F.2d 1153` **is** Gibbs v. Maxwell House.
- Fake Zaunbrecher `772 F.3d 1278` **is** Witt.
- Fake Gen. Wire Spring `556 F.2d 713` **is** Clerkley.
- Fake Hyatt `92 F.3d 1074` **several real orders**.
- Fake BDC 56 `330 B.R. 466` **is** 652 West 160th LLC.

If the product only asks “does CourtListener know this volume/page?”, it will **certify ChatGPT collisions as real**. That is worse than no product (Mata-level irony, as `09` already warned).

Name+citation matching reduces this. It is exactly what `courtlistener_citations_mcp` already describes (“name mismatches”). It still does not catch **real case, wrong proposition, fake quote**.

### False reds (legitimate cites the checker misses)

**FACT — coverage holes observed:**

- `360 N.J. Super. 360` and `823 A.2d 122`: CL citation 404 / REST 0. If that Ehrlich opinion is real (court requested it; not in the acknowledged-fake list), a CL-backed checker **reds a legitimate state cite**. Existence of that reporter independently: **Unknown** this pass. The **risk class** is not unknown: regional reporters and A.2d are sparse on CL relative to F.3d.
- Unpublished Illinois: REST `2013 IL App (1st)` returned **count 7326**, including real *People v. Boykin*, 2013 IL App (1st) 112696, and *800 South Wells*, 2013 IL App (1st) 123660. So *some* unpublished IL is in. Fake Shaboon `111279-U` is 0. **INFERENCE:** unpublished is not automatically a false red, but **any opinion not ingested** is. CourtListener’s own help/coverage wiki exists; completeness vs Westlaw National Reporter + unpublished is not claimed as 100% on the pages fetched.
- Pinpoint quotes, unreported WL-only, sealed, and foreign materials: not in the public APIs CiteCheck would call. `09` already tagged pinpoint as **Maybe**.

**Frequency:** not measured on a large sample (no 1,000-cite gold set this pass). **Unknown** as a numeric false-red rate. **FACT:** a single false red on a real obscure cite, shown to a lawyer or a judge, ends trust. The collision table above is enough to show a **simplistic** checker is unsafe. Making it less simplistic is Quick Check / Shepard’s / Quote Check.

**Kill:** uncontrollable at hackathon quality; “we’ll only demo Mata fakes” is fixture theater.

---

## Kill Test E — User willingness

**Result: KILL for a hosted paste box. Local-first does not rescue a company; it collapses into CourtListener’s already-shipped lookup.**

**No lawyer interviews this pass.** Three conversations remain **Unknown**. Do not invent WTP.

**Evidence that is not vibes:**

1. **The documents are privileged.** Mata is a filed federal brief. The painful job is gatekeeping **before filing**, i.e. on drafts that are client confidential. Harvey’s security page exists because that buyer will not use a tool without SSO, no-training contracts, in-region storage, retention control, ethical walls, and SOC 2. CiteCheck-as-hackathon-URL has none of that.
2. **Firms already lock citation tools.** westcheck.com sign-in: firm security settings disable “Remember me.” That is the incumbent *citation checker* being treated as an enterprise surface.
3. **Westlaw/Lexis already take the upload inside the research system** the firm paid to keep confidential (Quick Check / Brief Analysis file-size limits above). Switching to a new host is a **security downgrade**, not a workflow improvement.
4. **Local-first, cite-only egress** (the repo’s mitigation) means the app sends citation strings to CourtListener/Crossref. That is **literally** the CourtListener `/c/` lookup and MCP “verify every citation in this brief” tool, plus Crossref (citegate). No remaining product after you honor privilege.
5. **Mata’s lawyer still filed after a failed lookup.** Willingness to *use* a red light is not the same as willingness to *obey* it. Impact of a detector given that record: **Unknown / weak**.
6. **State ethics opinions:** ABA Formal Opinion 512 PDF and CA/NYC pages **404 or CAPTCHA** this pass. Florida Bar Opinion 24-1 URL exists (https://www.floridabar.org/etopinions/opinion-24-1/) but the fetched HTML was chrome without extractable confidentiality body. **Do not quote ethics text that was not read.** Treat ABA/Florida/CA rules as **Unknown in wording**, not as “cleared.”

**INFERENCE (labeled):** researchers might paste a public preprint into citegate/scite; litigators will not paste a client brief into an OFFGRID demo. The demo must therefore use **public fixtures**, at which point it is a CourtListener tutorial.

---

## Kill Test F — Demo

**Result: KILL.** Paste → detect → verify → red/green can happen in <30s **on a fixture**. It will look like a search box, because it *is* a search box (CourtListener citation lookup + Crossref) with a list of traffic lights.

**FACT — first-party UI already is the demo:**

- CourtListener `/c/` : enter a cite, get a case or 404 or “several citations found.”
- Official sample prompt: “Verify every citation in this brief and flag any unknown citations.”
- john-walkoe README: Mata fixture, real vs fabricated vs wrong-case.

**The 20-second wow in `07` is:** “Paste fixture with Mata-style fakes → red. One real citation → green.” That is indistinguishable from opening CourtListener and pasting `925 F.3d 1339` (404) then `738 F.2d 1153` (Gibbs). The “collision callout” is a sentence of copy on top of the resolver’s redirect.

**Quote-mismatch at 60s:** Lexis Quote Check already labels incorrect quotes and pin cites. A hackathon Ctrl+F on one public opinion is not Quote Check. If the quote check is fake-shallow, judges who have seen Shepard’s will shrug. If it is real, it is still a weekend wrapper of opinion text search.

**Looks-like-a-search-box rule from the brief:** if it looks like a search box, kill it. It does.

CourtListener rate limits: they **doubled** limits through 1 Oct 2026 for the ChatGPT launch; membership raises them. Demo-day 429 is a real ops risk after 1 Oct (`09`). Not the primary kill.

---

## Strongest existing alternative

**Westlaw Quick Check** (Thomson Reuters): upload or paste a brief; KeyCite warnings on cited authority; **quotation analysis**; table of authorities; opponent-brief mode. Same vendor as CoCounsel.

**Runner-up that kills the hackathon clone, not the firm buyer:** CourtListener MCP + ChatGPT plugin (17 Sep 2026) + `eyecite` + `john-walkoe/courtlistener_citations_mcp` (Mata demo already in the README).

Lexis Brief Analysis Quote Check is as strong on **quotes/pin cites** specifically.

---

## Difference vs that alternative

| Claimed CiteCheck difference | Reality on inspected pages |
|---|---|
| “We only verify AI output, we don’t replace research.” | Quick Check does not care who wrote the brief. It already verifies cites and quotes on *your* draft and on *opponent* drafts. |
| “Public APIs / local-first / no Westlaw login.” | CourtListener `/c/`, MCP, and ChatGPT plugin already do public verification. eyecite is 283★. |
| “20-second red/green, including reporter collisions.” | CL resolver **is** the collision (Gibbs at 738 F.2d 1153; ISS Marine at Petersen’s cite). john-walkoe already flags wrong-case resolves. |
| “DOI + URL too.” | citegate/Crossref already fail fabricated DOIs. HTTP HEAD is a 403 trap. |
| “Quote at pinpoint.” | Lexis Quote Check already. Pinpoint is **Maybe** in 3 weeks (`09`). |

---

## Does the difference actually matter?

**No.** The differences that are true are either (a) already shipped by the public-data vendor into ChatGPT this week, or (b) quality gaps (proposition/quote) that incumbents already sell and a 3-week app will not close. The differences that sound good (“we’re a gate, not a research suite”) do not change the buyer’s screen: they already have a gate inside Westlaw/Lexis/Bloomberg, or they paste into CourtListener.

Do not invent a remaining wedge.

---

## Demo breakage

- **Looks like search:** CourtListener citation lookup with CSS.
- **False green on stage** if HTML resolver is used for Miller/Petersen/Holliday.
- **False red on stage** if a “real” control cite is a state reporter CL 404s.
- **Fixture-only honesty:** using Mata public opinion avoids privilege and also makes the demo a known exam question (john-walkoe already graded it).
- **Judge who has used Quick Check:** “this is the free version of a button I already have.”
- **OpenAI-credits prize field:** a non-AI lookup may look like a homework wrapper next to generators (`07` unknown #1). That is extra Execution/Originality risk, not a rescue.

---

## Business-case breakage

- Citators are a **century-old** category (Shepard’s / KeyCite). Brief-upload analyzers are a **2010s** category (Quick Check, Brief Analysis, Bloomberg Brief Analyzer 2020 award). Hallucination-checking is a **2023–2026** checkbox on those same pipelines plus MCP.
- Legal buyers are slow; they buy **Westlaw/Harvey**, not a Devpost URL. Privilege and ethical-wall requirements (Harvey security page) are the procurement.
- OSS is free and good enough for existence (eyecite, citegate, CL API). Price toward zero.
- Switching cost **out of** Westlaw is high; switching cost **onto** CiteCheck is a security review. Inverse of a wedge.
- Name **CiteCheck** is taken (arXiv 2502.10881; GitHub skill).

---

## Copy-me test

| Horizon | What a competent engineer ships |
|---|---|
| **1 day** | `eyecite` extract + CourtListener `/c/` or REST citation lookup; print red/green. john-walkoe already did Mata. |
| **Weekend** | Hosted textarea, highlight cites, show CL snippet. The OFFGRID “MVP.” |
| **1 week** | Add Crossref DOI + naive URL fetch. citegate already does the DOI CI version. |
| **1 month** | Name-match collisions; crude quote search in CL opinion text. Still not Shepard’s. |
| **3+ months** | Still not KeyCite completeness, unpublished coverage, or Lexis pin-cite Quote Check. Incumbents or CL MCP moved again. |

Reproducibility: **yes, an afternoon** for existence (`06`). That was already in the concept file. Confirmed.

---

## No-AI test

**Strong without AI.** Parsing + HTTP/API lookups do not need a model. Span detection can be eyecite (rules), not NER.

That is not a survival point here. It is why the copy-me clock is **one day** and why judges can call it a wrapper. The OFFGRID prize is OpenAI credits; a product whose honesty is “we refused to use a model” can still lose Originality to “CourtListener lookup.” Product-without-AI was a reason the shortlist *kept investigating*. Investigation is over.

---

## Judge-says-no response

Exact:

> “This is CourtListener citation lookup — they even shipped ‘verify every citation in this brief’ into ChatGPT last week — plus Westlaw Quick Check / Lexis Quote Check if I already have a login. You pasted Mata, the cases went red, Gibbs showed up at 738 F.2d 1153. That’s `/c/F.2d/738/1153/`. Nicer UI on a search box is not a product. Next.”

If they have used Quick Check: “I already upload the brief and it verifies citations and quotations.” No good reply that is not a rescue angle.

---

## 2-year product if it succeeded

Not a SaaS dashboard. It would be a **thin citator**: a pre-filing verification gate on model output.

That category already has a name: **citator + brief analysis** (KeyCite, Shepard’s, Quick Check, Quote Check, Brief Analyzer). Success looks like **absorption** — Thomson Reuters, Lexis, Bloomberg, Harvey, Clio/Fastcase, or OpenAI+CourtListener shipping a toggle. The independent company does not become Shepard’s. It becomes a feature changelog line.

---

## Remaining unknowns

- Written confirmation of lawyer willingness to paste drafts (0 of 3 interviews).
- Whether *Ehrlich*, 360 N.J. Super. 360, is a real NJ opinion (CL miss vs ChatGPT fake). Parallel 2d Cir. *Ehrlich*, 360 F.3d 366, is real.
- Numeric false-red rate on a sample of real briefs.
- ABA Formal Opinion 512 / CA / NYC ethics **wording** (pages not successfully extracted).
- Harvey-specific “verify citations” feature page (not found; capability inferred from platform).
- Chrome extensions, Product Hunt, Reddit, Twitter: **not inspected**.
- CourtListener REST vs HTML resolver contract (observed disagreement on 174 F.3d 366); whether they document page-range matching.
- Whether judges in this field reward verifiers over generators (hackathon unknown, not CiteCheck-specific).

None of these unknowns reopen Test A or B.

---

## Verdict: KILLED

CiteCheck is a **real professional failure mode** (Mata is a federal sanctions opinion) attached to a **non-existent product gap**.

Westlaw Quick Check and Lexis Quote Check already upload a brief and verify citations and quotations. CourtListener, four days before this memo, published the ChatGPT/MCP job as “verify every citation in an incoming brief,” with a sample prompt that *is* the demo. An OSS MCP already uses **Mata** as the screenshot. Existence checks **green** reporter collisions and **cannot** see fake quotes of real cases. False greens are live on the public API. A hosted paste box loses on privilege; local-first is the lookup the vendor already shipped. Copy-me is a day. Demo is a search box.

**Survives/Weak/Killed mapping:** KILLED = Killed.

Stop. No rescue angles.
