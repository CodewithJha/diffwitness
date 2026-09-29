# Sources — Area 2 socio-technical failures

**Date accessed:** 2026-09-21  
**Used for:** `research/second-cycle/03-socio-technical-failures.md` only.  
**Rule:** URLs, APIs, and `gh` queries **actually inspected** this pass. Search snippets were discovery until the page was read. Do not treat unfetched pages as read.  
**Tooling:** `agent-reach doctor --json` first. Declared backends: Jina Reader (`r.jina.ai`), `gh` CLI (doctor `warn` / `active_backend: null`; `gh repo view` / `gh issue view` / `gh search repos` succeeded where listed), HN Algolia HTTP API, V2EX public hot API, Exa via `mcporter` until **429**. Cursor WebSearch / WebFetch as fallback. Reddit **off**. Twitter CLI **not installed**. `agent-reach check-update`: **v1.5.0, current**.

**Reliability:** High = body read this pass. Medium = snippet then partial fetch, or vendor metric. Low = title-only / blocked body. N/A = fetch failed; listed so the failure is auditable.

---

## Internal repo files (read, not internet)

`research/00-executive-summary.md`, `research/11-report-A-to-O.md`, `research/05-problem-opportunities.md` (DupGate / Owner Diff / CODEOWNERS / problem 27), `research/validation/05-merge-preflight.md` (kill: 38% abandonment, 23% duplicates, extra Copilot approval, CodeRabbit Pre-Merge Checks), `research/validation/06-cross-candidate-comparison.md`, `research/validation/07-final-survivor-report.md` (Area 2 residual), `research/validation/08-validation-sources.md`.

---

## Inspected sources

| Source | URL | Type | Used by | What it proved this pass | Reliability |
|---|---|---|---|---|---|
| Agent Reach doctor | local `--json` | Tooling | all | gh present unverified; Exa configured; Jina OK; Reddit/Twitter off; V2EX OK | High |
| Exa MCP | `mcporter call exa.web_search_exa` | Search | discovery | Some calls returned (unreviewed-change, bus-factor, clinical handoff); later calls **429** free tier | High that 429 |
| HN Algolia | `https://hn.algolia.com/api/v1/search?...` | Forum index | discovery | Weak hits for “two teams same feature” / agent duplicate; xz GoFundMe thread exists | High on API; Low on relevance |
| V2EX hot | `https://www.v2ex.com/api/topics/hot.json` | Forum | coverage | Reachable; **no on-topic** items in hot list | High as negative |
| Habituation paper HTML | https://arxiv.org/html/2606.22721v1 | Paper | ST-1 | 400 reviewers, 11,429 reviews; AR 30.1→36.8%; comments −22%; latency +3.5×; no causality | High |
| Tang PLATEAU 2023 | https://www.nztang.com/assets/files/papers/tang_plateau23.pdf | Paper | ST-1 adjacent | n=9 eye-tracking; Copilot validation behavior | High on PDF; Low as product evidence |
| Zare 2026 HCII | http://perl.sce.carleton.ca/assets/pdfs/Zare2026_HCII.pdf | Paper | ST-1 adjacent | Novices accept then run tests; professionals read | High on PDF |
| Don’t Trust Don’t Verify | https://arxiv.org/pdf/2609.21020 | Paper | ST-1 adjacent | n=100; security attention in AI code | High that PDF fetched |
| NSF PLATEAU copy | https://par.nsf.gov/servlets/purl/10576279 | Paper | ST-1 | ~80% of uninformed group did not realize code was LLM-generated | High |
| Knight SEC order | https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf | Regulator | ST-2/ST-5 | $460M; 1 of 8 servers missed; no second technician; **97 BNET emails** unread; Power Peg flag reuse | High |
| postmortems.app Knight | https://postmortems.app/postmortem/ef3cc3e0-c51c-4f5d-8dd0-cc8a8dfdcbb2 | Secondary | ST-2 | Narrative consistent with SEC; not used over SEC | Medium |
| Openwall xz | https://www.openwall.com/lists/oss-security/2024/03/29/4 | Primary disclosure | ST-2 | Freund 29 Mar 2024: xz git **and** tarballs backdoored; SSH CPU / valgrind | High |
| Ars xz | https://arstechnica.com/security/2024/04/what-we-know-about-the-xz-utils-backdoor-that-almost-infected-the-world/ | News | ST-2 | Timeline JiaT75, sock puppets, oss-fuzz | High |
| The Verge xz | https://www.theverge.com/2024/4/2/24119342/xz-utils-linux-backdoor-attempt | News | ST-2 | Discovery path | Medium (search; Ars/Openwall preferred) |
| Akamai xz | https://www.akamai.com/blog/security-research/critical-linux-backdoor-xz-utils-discovered-what-to-know | Vendor | ST-2 | Tarball-only payload | Medium–High |
| Otto Kekäläinen git vs tarball | https://optimizedbyotto.com/post/xz-backdoor-debian-git-detection/ | Blog | ST-2 | gbp import-orig; legitimate tarball extras; Meld workaround | High |
| NixOS Discourse tarballs | https://discourse.nixos.org/t/reconsider-reusing-upstream-tarballs/42524 | Forum | ST-2 | Proposal to stop reusing upstream tarballs | High |
| dishball | https://github.com/alvarezp/dishball | GitHub | ST-2 | git vs tarball script; **1★** | High |
| auth-tarball-from-git | https://github.com/kpcyrd/auth-tarball-from-git | GitHub | ST-2 | Signed tag → reproduce archive; **17★** | High |
| whyisthisdown Scorecard | https://whyisthisdown.com/posts/reviewed-by-nobody | Blog 2026-08-31 | ST-3 | Gerrit substring; Prow label; lab table; pinned `d1fab88` | High on post; lab repos not cloned |
| ossf/scorecard#370 | https://github.com/ossf/scorecard/issues/370 | GitHub | ST-3 | Opened 2021-04-27; closed 2024-02-05; body asks better than `Reviewed-on:` substring | High |
| ossf/scorecard | `gh repo view` | GitHub | ST-3 | **5,699★** 21 Sep 2026 | High |
| Equifax House report | https://oversight.house.gov/wp-content/uploads/2018/12/Equifax-Report.pdf | Congress | ST-4 | 400-person email; no designated owners; 143M→148M; Payne fired | High |
| Equifax Senate HSGAC | https://www.hsgac.senate.gov/wp-content/uploads/imo/media/doc/FINAL%20Equifax%20Report.pdf | Congress | ST-4 | Meetings unattended; patching “six levels down” | High |
| Surfing Complexity Equifax | https://surfingcomplexity.blog/2018/12/14/the-equifax-breach-report/ | Blog | ST-4 | Quotes Payne transcript (matches House PDF) | High as concordance |
| Payne litigation PDF | https://storage.courtlistener.com/recap/gov.uscourts.gand.244824/gov.uscourts.gand.244824.791.0.pdf | Court | ST-4 | Smith blamed one forwarder; Payne disputed | High |
| govinfosecurity Smith | https://www.govinfosecurity.com/equifax-ex-ceo-blames-human-error-tech-failures-for-breach-a-10349 | News | ST-4 | Scans did not identify Struts | Medium–High |
| Backstage catalog docs | https://backstage.io/docs/features/software-catalog/ | Docs | ST-4 | Catalog job = ownership + discoverability | High |
| Backstage adopting | https://backstage.io/docs/overview/adopting/ | Docs | ST-4 | Needs a central team; treat as product | High |
| Backstage GitHub | `gh repo view spotify/backstage` | GitHub | ST-4 | **34,462★** | High |
| DevOpsNess Backstage rot | https://www.devopsness.com/blog/backstage-software-catalog-adoption | Blog | ST-4 | Manual YAML graveyard; auto-discovery fix | Medium–High (single shop) |
| Honor PD+Sheets | https://medium.com/@jkeung/a-homegrown-free-pagerduty-google-sheets-slack-integration-c93b9cc6f52d | Blog | ST-5 | Ugly workaround; `/pd oncall` private | High |
| incident.io handoff | https://incident.io/blog/async-on-call-handoff-template | Vendor | ST-5 | Ack required; quotes SRE book; pricing claim $45/user/mo **vendor** | High on copy |
| Shiftctl handoff guide | https://shiftctl.com/blog/on-call-handover-guide | Vendor | ST-5 | Claims alerting tools don’t enforce handover; sells Shiftctl | Medium (selling) |
| PagerDuty Recent Changes | https://support.pagerduty.com/main/docs/recent-changes | Docs | ST-5 | Change events **do not** create notifications | High |
| PagerDuty Slack | https://support.pagerduty.com/main/docs/slack-integration-guide | Docs | ST-5 | Incident cards, `/pd oncall` | High |
| PagerDuty Slack user | https://support.pagerduty.com/main/docs/slack-user-guide | Docs | ST-5 | `/pd note` | High |
| NEJM I-PASS | https://www.nejm.org/doi/full/10.1056/NEJMsa1405556 | Paper | ST-5 analog | −23% errors, −30% preventable AEs, n=10,740 | High |
| TJC SEA 58 | https://www.jointcommission.org/-/media/tjc/documents/resources/patient-safety-topics/sentinel-event/sea_58_hand_off_comms_9_6_17_final_(1).pdf | Regulator | ST-5 analog | 30% claims, 1744 deaths, $1.7B / 5y; 37% receiver-unsuccessful | High |
| CRICO PubMed | https://pubmed.ncbi.nlm.nih.gov/35188927/ | Abstract | ST-5 analog | 49% claims communication; 40% handoff | High on abstract |
| BMJ Open SBAR review | https://bmjopen.bmj.com/content/8/8/e022202 | Review | ST-5 analog | SBAR occupancy | High |
| BMJ Qual Saf MHS-IV | https://qualitysafety.bmj.com/content/34/10/680 | Review | ST-5 analog | Structured handoff evidence mixed | High |
| PSNet Signout Fallout | https://psnet.ahrq.gov/web-mm/signout-fallout | Case | ST-5 analog | Heparin signout death; I-PASS | High |
| SAGE Open Med Case | https://doi.org/10.1177/2050313x15584859 | Case | ST-5 analog | ED handover rock-in-jaw | High |
| Langfuse prompt versions | https://langfuse.com/docs/prompt-management/features/prompt-version-control | Docs | ST-6 | Versions, labels, protected production | High |
| Langfuse prompt CI/CD | https://langfuse.com/resources/engineering/prompt-cicd | Docs | ST-6 | Treat prompt change as deploy; approval via protected labels + CI | High |
| PromptLayer management | https://www.promptlayer.com/prompt-management/ | Vendor | ST-6 | Occupancy; Humanloop sunset mentioned | High on copy |
| PromptLayer RBAC | https://promptlayer.mintlify.app/why-promptlayer/rbac | Docs | ST-6 | `PROMPT_DEPLOY` | High |
| tianpan prompt postmortem | https://tianpan.co/blog/2026/05/18/prompt-nobody-owned-postmortem | Essay | ST-6 | Unnamed incident; paywall after intro; “1000 deployments” **unverified** | High that essay exists; Low as incident fact |
| dupehound | `gh repo view Rafaelpta/dupehound` | GitHub | ST-7 | **94★**; AI duplicate CI gate | High |
| Deslop | `gh repo view Nimblesite/Deslop` | GitHub | ST-7 | **47★**; MCP find-similar | High |
| Deslop C# blog | https://www.christianfindlay.com/blog/find-duplicate-code-csharp-deslop | Blog | ST-7 | Agent reimplementation pitch | High |
| Ford feature store | https://gauthamv.com/writing/feature-store-deep-dive/ | Blog | ST-7 adjacent | Teams rebuilt features; built on-prem store | Medium (author’s project) |
| BMJ Open PROSPERO dups | https://bmjopen.bmj.com/content/12/12/e061862 | Paper | ST-8 | 1054 slice; 138 dups; 14 HCQ; 85 “Not Similar”; 41/138 survey | High |
| CRD York news | https://www.york.ac.uk/crd/about/news/2023/duplication-prospero/ | Official | ST-8 | Same study summary | High |
| Zombie reviews PDF | https://repub.eur.nl/pub/109107/REPUB_109107_AAM.pdf | Paper | ST-8 | 7% PROSPERO 2011–2017 updated to published | High |
| Frontiers 2026 registries | https://doi.org/10.3389/frma.2026.1738112 | Paper | ST-8 | PROSPERO does not prevent duplicates; search other registries | High |
| Chalmers Lancet PDF | http://www.drcherylolson.com/wp-content/uploads/2013/03/Chalmers09_Lancet_Avoidable-waste-in-research.pdf | Paper copy | ST-8 | >85% cumulative estimate | High on PDF; Medium as host |
| Glasziou BMJ blog | https://blogs.bmj.com/bmj/2016/01/14/paul-glasziou-and-iain-chalmers-is-85-of-health-research-really-wasted/ | Authors | ST-8 | Explains 85% arithmetic | High |
| NTSB ASR-19-01 | https://www.ntsb.gov/investigations/accidentreports/reports/asr1901.pdf | Regulator | not promoted | MCAS assumptions; pilots’ alerts | High |
| NTSB recs A-19-010 | https://www.ntsb.gov/safety/safety-recs/recletters/A-19-010-016.pdf | Regulator | not promoted | Training/alerting recs | High |
| NPR 737 MAX | https://www.npr.org/2019/10/18/771451904/boeing-pilots-detected-737-max-flight-control-glitch-two-years-before-deadly-cra | News | not promoted | MCAS not in manuals | Medium–High |
| CrowdStrike RCA PDF | https://www.crowdstrike.com/wp-content/uploads/2024/08/Channel-File-291-Incident-Root-Cause-Analysis-08.06.2024.pdf | Vendor RCA | not promoted | 21 vs 20 inputs; validator trusted | High |
| CrowdStrike PIR blog | https://www.crowdstrike.com/en-us/blog/falcon-content-update-preliminary-post-incident-report/ | Vendor | not promoted | 19 Jul 2024 window | High |
| Target Bloomberg archive | https://web.archive.org/web/20150127015928/http:/www.businessweek.com/articles/2014-03-13/target-missed-alarms-in-epic-hack-of-credit-card-data | News | class kill | FireEye alerts; malware.binary | Medium (archive chrome + article body mixed) |
| Target Reuters | https://www.reuters.com/article/technology/target-says-it-declined-to-act-on-early-alert-of-cyber-breach-idUSBREA2C14F/ | News | class kill | Staff decided no immediate action | High on existence |
| Zylo redundancy | https://zylo.com/solutions/application-redundancy | Vendor | class kill | Duplicate SaaS occupied | High on occupancy |
| Zylo shadow IT | https://zylo.com/solutions/shadow-it | Vendor | class kill | 45% apps shadow IT **vendor** | Medium |
| Herrington bus factor | https://www.jonoherrington.com/blog/best-engineer-biggest-risk | Essay | class kill | One-person context; ADR workaround | Medium (unnamed companies) |
| Jono / tianpan | (above) | | | | |

---

## GitHub star counts recorded 21 Sep 2026

| Repo | Stars |
|---|---:|
| spotify/backstage | 34,462 |
| ossf/scorecard | 5,699 |
| Rafaelpta/dupehound | 94 |
| Nimblesite/Deslop | 47 |
| kpcyrd/auth-tarball-from-git | 17 |
| alvarezp/dishball | 1 |

Langfuse / Promptfoo stars not re-counted this pass; prior validation file stands.

---

## Failed / blocked / not used as evidence

| Attempt | Outcome |
|---|---|
| Exa after first batch | HTTP **429** free MCP — later queries used WebSearch/Jina/`gh` |
| Reddit | doctor **off** — not used |
| Twitter | CLI **not installed** — not used |
| Bloomberg.com Target article | subscriber wall; used Wayback + Reuters instead |
| tianpan members-only remainder | not extracted; “1000 deployments” **not** treated as a paper |
| `jscpd/jscpd` `gh repo view` | no JSON returned this call — star count **Unknown** |
| HN Algolia “two teams built the same feature” | mostly unrelated Show HNs — negative |
| Lab Scorecard repos from whyisthisdown | not cloned; detector claim corroborated via issue 370 instead |
| Equifax settlement / market-cap dollars | not fetched |
| Live PROSPERO search of 2026 protocols | not run |

**Intentionally not evidence:** invented TAM; tianpan unnamed incident as a court-grade fact; Zylo/Shiftctl/incident.io pricing as audited financials; “duplication doubled since AI” (dupehound README — vendor); Koalr CODEOWNERS 4.1× (prior cycle already discarded); Merge Preflight size heuristics.

---

## Intentionally not written

Any `research/second-cycle/01–02` or `04–10` files. No architecture. No `src/`.
