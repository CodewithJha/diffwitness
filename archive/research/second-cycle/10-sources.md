# Sources — second discovery cycle (merged)

**Date accessed:** 2026-09-21  
**Used for:** `01`–`09` synthesis plus Areas 1–3.  
**Rule:** Merge of `_sources-world-state.md`, `_sources-socio-technical.md`, `_sources-replayable.md`, plus pages fetched during RF-1 destruction / synthesis. Deduplicated. Search snippets are not evidence until the body was read. Unfetched pages are not evidence.

**Reliability:** High = body/API read. Medium = partial fetch or vendor marketing. Low = title-only / blocked. N/A = failed fetch, listed for audit.

**Tooling (all area agents + synthesis):** agent-reach `doctor --json` first. GitHub via `gh` (doctor `warn` / `active_backend: null`; commands succeeded where listed). Web via Jina Reader (`r.jina.ai`) and official `.md` where available. Exa via `mcporter` until free-tier **429**. HN Algolia / V2EX public API as discovery. Reddit **off**. Twitter CLI **not installed**. Cursor WebSearch as discovery then fetch. `agent-reach check-update`: **v1.5.0, current**.

---

## Internal repo files (read, not internet)

`research/00-executive-summary.md`, `research/11-report-A-to-O.md`, `research/05-problem-opportunities.md`, `research/06-product-concepts.md` (template only), `research/07-shortlist.md` (structure skim), `research/validation/02`–`08`, `research/validation/07-final-survivor-report.md`, `docs/WIN-PLAN.md` (skim), `AGENTS.md` (rules).  
Area files: `02-world-state-evidence.md`, `03-socio-technical-failures.md`, `04-replayable-failures.md`, and the three `_sources-*.md` inputs to this merge.

---

## Synthesis / RF-1 destruction — newly inspected this pass

| Source | URL | Type | What it proved | Reliability |
|---|---|---|---|---|
| Daytona snapshots-as-search (re-fetch) | https://www.daytona.io/dotfiles/snapshots-as-search-states-go-explore-with-daytona | Vendor eng 18 Sep 2026 | Jina. 17/25 vs 6/25; SQLite 0/5 / 0/5 / 4/5; 24/24 restores; handoff ~190k vs ~90k; snapshots as search states | High |
| E2B snapshots (re-fetch) | https://docs.e2b.dev/sandbox/snapshots | Official docs | Jina. FS+memory; checkpoint/rollback/fork/share; templates vs snapshots | High |
| E2B persistence | https://docs.e2b.dev/sandbox/persistence | Official docs | Jina. Pause FS+memory; `keep_memory: false` filesystem-only; indefinite pause | High |
| Docker checkpoint | https://docs.docker.com/reference/cli/docker/checkpoint.md | Official docs | Experimental C/R via CRIU; create/ls/rm; `docker start --checkpoint`; limitations | High |
| CRIU main | https://criu.org/Main_Page | Project site | Jina. v4.2.1 (21 Jul 2026); Docker/Podman/K8s integration | High |
| CRIU Docker page (WebSearch) | https://criu.org/Docker | Project docs | Experimental Docker mode; CRIU ≥2.0 | Medium–High (snippet + prior) |
| aios #2027 (re-fetch) | `gh issue view 2027 -R eumemic/aios` | GitHub | 22h outage; 3.37 GB commit timeout; bind mounts held data; zero paths under `/workspace` in layer | High |
| Star counts (re-confirm) | `gh repo view` Daytona/E2B/CRIU/OpenSandbox/agent-sandbox | GitHub | 71,741 / 13,901 / 3,998 / 15,445 / 3,973 | High |
| Exa during synthesis | `mcporter call exa.web_search_exa` | Search | **429** free tier — no new hits used | High that 429 |
| Jina GitHub issue HTML | `r.jina.ai/https://github.com/eumemic/aios/issues/2027` | Fetch | **403** AbuseAlleviationError — used `gh` instead | N/A for Jina |

---

## Area 1 — world-state (from `_sources-world-state.md`)

| Source | URL | Reliability |
|---|---|---|
| GitLab.com DB outage postmortem | https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/ | High |
| InfoQ GitLab follow-up | https://www.infoq.com/news/2017/02/gitlab-outage-postmortem/ | Medium–High |
| AWS Backup restore testing | https://docs.aws.amazon.com/aws-backup/latest/devguide/restore-testing.html | High |
| AWS Backup validation blog | https://aws.amazon.com/blogs/storage/implementing-restore-testing-for-recovery-validation-using-aws-backup/ | High |
| Veeam SureBackup | https://helpcenter.veeam.com/docs/vbr/userguide/surebackup_recovery_verification.html | High (exists) |
| pgBackRest | https://github.com/pgbackrest/pgbackrest (**4,393★**) | High |
| SES never received | https://aws.amazon.com/blogs/messaging-and-targeting/how-to-investigate-what-happened-to-the-email-that-was-sent-via-ses-but-was-never-received-in-recipient-inbox/ | High |
| SendGrid Delivered ≠ inbox | https://support.sendgrid.com/hc/en-us/articles/4408443310619-Email-Delivered-But-Not-Appearing-in-Inbox | High |
| Terraform resource drift | https://developer.hashicorp.com/terraform/tutorials/state/resource-drift | High |
| Terraform | https://github.com/hashicorp/terraform (**49,695★**) | High |
| driftctl | https://github.com/snyk/driftctl (**2,662★**) | High |
| Spacelift drift | https://docs.spacelift.io/self-hosted/latest/concepts/stack/drift-detection | High |
| env0 drift | https://www.envzero.com/blog/tutorial-achieving-auto-remediation-with-envzero | Medium |
| Firefly drift | https://www.firefly.ai/use-cases/cloud-drift-management | Medium |
| Stripe PaymentIntent status | https://docs.stripe.com/payments/payment-intents/verifying-status | High |
| Stripe payout reconciliation | https://docs.stripe.com/payouts/reconciliation | High |
| Stripe undelivered webhooks | https://docs.stripe.com/webhooks/process-undelivered-events | High |
| Stripe webhooks overview | https://docs.stripe.com/webhooks | High |
| git-lfs | https://github.com/git-lfs/git-lfs (**14,510★**) | High |
| git-lfs#2446, #2017, #4927 | GitHub issues | High |
| GitLab LFS troubleshooting | https://docs.gitlab.com/topics/git/lfs/troubleshooting/ | High |
| Debezium | https://github.com/debezium/debezium (**13,139★**) | High |
| Outbox explainers | https://mdsanwarhossain.me/blog-outbox-pattern-debezium.html ; https://www.designgurus.io/blog/transactional-outbox-pattern | Medium |
| Helios#1048 | https://github.com/ls1intum/Helios/issues/1048 | High |
| Argo CD | https://github.com/argoproj/argo-cd (**24,211★**); #26585; #7333 | High |
| Cheveo OutOfSync | https://www.cheveo.de/en/blog/argocd-outofsync-debug-systematically | Medium–High |
| CloudFront invalidation | https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html | High |
| CloudFront re:Post | https://repost.aws/questions/QUG__vuLtlS-Wf_z2iNxOFtw/cloudfront-continues-to-serve-old-content-after-invalidation-and-s3-update | High |
| S3 strong consistency | https://aws.amazon.com/s3/consistency/ | High |
| CloudTrail user guide | https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html | High |
| pgaudit | https://github.com/pgaudit/pgaudit (**1,707★**) | High |
| Courier / NAYA (competitor copy only) | courier.com SES page; naya.finance Stripe recon | Medium |

**Discarded Area 1 (not facts):** 72technologies terraform postmortem; johal.in SendGrid; vivianvoss/hafiq GitLab retellings; antigravitylab / DEV.to fleet-split blogs; pre-2010 S3 consistency SO threads as 2026 wedges.

---

## Area 2 — socio-technical (from `_sources-socio-technical.md`)

| Source | URL | Reliability |
|---|---|---|
| Habituation paper | https://arxiv.org/html/2606.22721v1 | High |
| Tang PLATEAU / Zare HCII / Don’t Trust Don’t Verify / NSF PLATEAU | PDFs listed in area sources | High on PDF; Low as product |
| Knight SEC 34-70694 | https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf | High |
| Openwall xz / Ars / Otto / NixOS Discourse | openwall; arstechnica; optimizedbyotto; discourse.nixos.org | High |
| dishball / auth-tarball-from-git | GitHub 1★ / 17★ | High |
| whyisthisdown Scorecard + ossf/scorecard#370 | whyisthisdown.com; GitHub (**5,699★**) | High |
| Equifax House + Senate HSGAC PDFs | oversight.house.gov; hsgac.senate.gov | High |
| Surfing Complexity / Payne / govinfosecurity | blogs + courtlistener + news | High / Medium–High |
| Backstage docs + GitHub | backstage.io; **34,462★** | High |
| DevOpsNess Backstage rot | devopsness.com | Medium–High |
| Honor PD+Sheets / incident.io / Shiftctl / PagerDuty docs | medium; incident.io; shiftctl; support.pagerduty.com | High / Medium vendor |
| NEJM I-PASS / TJC SEA 58 / CRICO PubMed | nejm.org; jointcommission.org; pubmed | High |
| Langfuse prompt VC + CI; PromptLayer; tianpan essay | langfuse.com; promptlayer; tianpan.co (paywall) | High / Low as incident |
| dupehound / Deslop | **94★** / **47★** | High |
| BMJ Open PROSPERO / York CRD / Zombie reviews / Frontiers 2026 / Glasziou | bmjopen; york.ac.uk; repub.eur.nl; doi.org/10.3389/frma.2026.1738112; blogs.bmj.com | High |
| NTSB / CrowdStrike / Target / Zylo (not promoted) | as listed in area sources | High / Medium |

---

## Area 3 — replayable (from `_sources-replayable.md`)

| Source | URL | Reliability |
|---|---|---|
| Daytona / E2B snapshots | (see synthesis re-fetch) | High |
| Chronicle arXiv HTML + GitHub | https://arxiv.org/html/2609.20625 ; theagentplane/chronicle **23★** | High |
| OrcaReplay | Continuum-AI-Corp/OrcaReplay **259★** | High |
| agent record-replay search | `gh search` slogan clones | High for names |
| agent-sandbox #949 / OpenSandbox | GitHub **3,973★** / **15,445★** | High |
| aios #2027 / #937 / #795 | GitHub | High |
| PraisonAI #3670 | GitHub | High |
| ReproZip docs + FAQ + GitHub | docs.reprozip.org; **362★** | High |
| Playwright / Temporal / rr / CRIU / Testcontainers / Nix / vcrpy / rrweb | star counts in area file | High |
| OSWorld / OSWorld-V2 / site / HF eval results | GitHub + osworld-v2.xlang.ai + HF | High / Medium |
| Cursor forum 150214 / 155837/4 | forum.cursor.com | High |
| AgentRx / TrajDebug / PROTEA / DEV.to AgentLens | class-kill discovery | Medium–Low |
| Anthropic Apr 23 postmortem | prior-cycle High in validation sources; **not re-fetched** this cycle | Prior High |

**Failed Area 3:** Exa 429; tianpan 2026-05-17 Jina **404**; some README GraphQL **403**; AmtocSoft SEO unused.

---

## Cycle-1 occupancy carried forward (binding; not “whitespace”)

Westlaw Quick Check / Lexis Quote Check / CourtListener ChatGPT MCP; Pipelock / Obsigna / HumanLayer / agentreceipts.ai; Promptfoo / Langfuse; oasdiff; CodeRabbit Pre-Merge Checks; GitHub Copilot extra approval. Details: `research/validation/08-validation-sources.md`.

---

## Not used / blocked

| Attempt | Outcome |
|---|---|
| Exa after first batches (all areas + synthesis) | Free-tier **429** |
| Reddit | doctor **off** |
| Twitter | CLI **not installed** |
| Invented TAM / user interviews | None |
| Product Hunt | Not inspected |

---

## Intentionally not written

- Architecture / next-step design file (zero survivors).
- Application code / `src/` changes.
- Resurrection of any cycle-1 killed product.
