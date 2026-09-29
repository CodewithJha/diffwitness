# Sources — Area 1 world-state evidence (second cycle)

**Date accessed:** 2026-09-21  
**Used for:** `research/second-cycle/02-world-state-evidence.md` only.  
**Rule:** pages, APIs, `gh` queries actually inspected this pass. Search snippets were discovery until the body was read. Deduplicated. Unfetched pages are not evidence.  
**Do not treat as read:** unopened Exa hits, Reddit (backend off), Twitter (CLI not installed).

**Tooling:** Agent Reach `doctor --json` first. GitHub via `gh` (doctor `warn` / `active_backend: null`; `gh repo view` / `gh api` / `gh search` succeeded where listed). Web via Jina Reader (`r.jina.ai`) and Cursor WebSearch as discovery then Jina/`gh` for bodies. Exa via `mcporter` until free-tier **429** (after the first batch). HN Algolia (titles often empty on comment hits; used as discovery). Reddit/Twitter **off**. `agent-reach check-update`: **v1.5.0, current**.

**Reliability:** High = body read this pass. Medium = snippet + partial fetch or vendor marketing. Low = title-only. N/A = failed fetch, listed for audit.

---

## Internal repo files (read, not internet)

`research/00-executive-summary.md`, `research/11-report-A-to-O.md`, `research/validation/06-cross-candidate-comparison.md`, `research/validation/07-final-survivor-report.md`, `research/validation/08-validation-sources.md`, `research/validation/02-action-receipt.md`, `research/05-problem-opportunities.md` (template), `docs/WIN-PLAN.md` (skim). Cycle-1 kill of Action Receipt / Payout Exceptions used as prior FACT, not re-litigated except where Stripe docs were re-fetched.

---

## Deduplicated inspected sources

| Source | URL | Type | What it proved this pass | Reliability |
|---|---|---|---|---|
| Agent Reach doctor | local `--json` | Tooling | gh present; Exa configured then 429; Jina OK; Reddit/Twitter off; V2EX/HN usable | High |
| GitLab.com DB outage postmortem | https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/ | Postmortem | Jina. 31 Jan 2017. Accidental primary wipe. `pg_dump` to S3 **empty** (9.2 vs 9.6). Cron emails rejected (DMARC not enabled). WAL archiving off. Lost window 17:20–00:00 UTC; ~5k projects / 5k comments / 700 accounts. Self-managed/Enterprise unaffected. | High |
| InfoQ GitLab postmortem | https://www.infoq.com/news/2017/02/gitlab-outage-postmortem/ | News | WAL-E follow-up; automatic restore-test intent. Secondary to GitLab primary. | Medium–High |
| AWS Backup restore testing | https://docs.aws.amazon.com/aws-backup/latest/devguide/restore-testing.html | Official docs | Jina. Scheduled restore jobs; optional validation; cleanup. First-party occupancy of Problem 1. | High |
| AWS Backup restore-testing blog | https://aws.amazon.com/blogs/storage/implementing-restore-testing-for-recovery-validation-using-aws-backup/ | Official blog | EventBridge + Lambda for app-level checks. The “remaining gap” is a documented hook. | High |
| Veeam SureBackup | https://helpcenter.veeam.com/docs/vbr/userguide/surebackup_recovery_verification.html | Vendor docs | Named recovery verification (isolated lab). Page exists; deep lab behavior not fully extracted. | High that product exists |
| pgBackRest | https://github.com/pgbackrest/pgbackrest | GitHub | **4,393★**, pushed 2026-09-17, not archived | High |
| SES “email sent never received” | https://aws.amazon.com/blogs/messaging-and-targeting/how-to-investigate-what-happened-to-the-email-that-was-sent-via-ses-but-was-never-received-in-recipient-inbox/ | Official blog | Jina. 27 Jun 2023. Three drop zones. MessageId = accepted. RenderingFailure/Reject/suppression. Delivery = ISP `250`. | High |
| SendGrid Delivered ≠ inbox | https://support.sendgrid.com/hc/en-us/articles/4408443310619-Email-Delivered-But-Not-Appearing-in-Inbox | Vendor support | Jina. Delivered = `250 OK`; then spam/quarantine/drop. Names Proofpoint/Mimecast. | High |
| Terraform resource drift tutorial | https://developer.hashicorp.com/terraform/tutorials/state/resource-drift | Official | Jina. State vs real infra; `-refresh-only`; import; HCP Terraform Standard drift detection. | High |
| Terraform repo | https://github.com/hashicorp/terraform | GitHub | **49,695★**, pushed 2026-09-21 | High |
| driftctl | https://github.com/snyk/driftctl | GitHub | **2,662★**, not archived, pushed 2026-09-21. Snyk-owned drift detector. | High |
| Spacelift drift detection | https://docs.spacelift.io/self-hosted/latest/concepts/stack/drift-detection | Vendor docs | Scheduled proposed runs; optional reconcile. | High |
| env0 drift tutorial | https://www.envzero.com/blog/tutorial-achieving-auto-remediation-with-envzero | Vendor | Scheduled plan as drift detection. | Medium (vendor) |
| Firefly cloud drift | https://www.firefly.ai/use-cases/cloud-drift-management | Vendor | Estate drift + ClickOps attribution. Marketing. | Medium |
| Stripe PaymentIntent status | https://docs.stripe.com/payments/payment-intents/verifying-status | Official | Jina. `succeeded` = funds in account; GET the intent. | High |
| Stripe payout reconciliation | https://docs.stripe.com/payouts/reconciliation | Official | Jina. Dashboard, report, `BalanceTransactions?payout=po_xxx`. Manual payouts: you reconcile. | High |
| Stripe undelivered webhooks | https://docs.stripe.com/webhooks/process-undelivered-events | Official | Retries 3 days; `delivery_success=false`; Dashboard resend 15d; CLI 30d. | High |
| Stripe webhooks overview | https://docs.stripe.com/webhooks | Official | Event deliveries tab; retry policy. | High |
| git-lfs repo | https://github.com/git-lfs/git-lfs | GitHub | **14,510★**, pushed 2026-09-02 | High |
| git-lfs#2446 | https://github.com/git-lfs/git-lfs/issues/2446 | Issue | Closed. Missing objects; `fetch --all`; copy to `04/dd/<oid>`; `allowincompletepush`. 3 comments. | High |
| git-lfs#2017 | https://github.com/git-lfs/git-lfs/issues/2017 | Issue | Closed. Server missing, no backups, unretrievable; BFG rewrite. | High |
| git-lfs#4927 | https://github.com/git-lfs/git-lfs/issues/4927 | Issue | Closed. `fsck` finds hole; restore via `git add` of real bytes. 7 comments. | High |
| GitLab LFS troubleshooting | https://docs.gitlab.com/topics/git/lfs/troubleshooting/ | Official | Pointer detected on push; verify object exists; `git lfs push --all` for external LFS. | High |
| Debezium | https://github.com/debezium/debezium | GitHub | **13,139★**, pushed 2026-09-21. CDC / WAL as event SoT. | High |
| Outbox + Debezium explainer | https://mdsanwarhossain.me/blog-outbox-pattern-debezium.html | Blog 2026-03-20 | Dual-write failure modes; WAL → Debezium. Pedagogy. | Medium |
| Transactional outbox explainer | https://www.designgurus.io/blog/transactional-outbox-pattern | Blog | Dual-write matrix. Pedagogy. | Medium |
| Helios#1048 | https://github.com/ls1intum/Helios/issues/1048 | Issue | `gh api`. Open, created 2026-05-25. Stale `commit_sha`; deploy success; live `git.commit.id` mismatch; proposed post-deploy curl. | High |
| Argo CD repo | https://github.com/argoproj/argo-cd | GitHub | **24,211★**, pushed 2026-09-21 | High |
| Argo CD#26585 | https://github.com/argoproj/argo-cd/issues/26585 | Issue | Progressive sync OutOfSync after image SHA patch; dummy source workaround. | High |
| Argo CD#7333 | https://github.com/argoproj/argo-cd/issues/7333 | Issue | UI Synced, live digest wrong; kustomize image-list order. | High |
| Argo OutOfSync debug (Cheveo) | https://www.cheveo.de/en/blog/argocd-outofsync-debug-systematically | Blog 2026-05-25 | OutOfSync = Git ≠ cluster; `argocd app diff`. Operator runbook. | Medium–High |
| CloudFront invalidation | https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html | Official | Versioned filenames vs invalidate; Completed ≠ every cache gone. | High |
| CloudFront still old (re:Post) | https://repost.aws/questions/QUG__vuLtlS-Wf_z2iNxOFtw/cloudfront-continues-to-serve-old-content-after-invalidation-and-s3-update | AWS re:Post | Invalidation Completed; still old content. | High |
| S3 strong consistency | https://aws.amazon.com/s3/consistency/ | Official | Read-after-write + list strong consistency. Kills old PUT-vs-GET wedge. | High |
| AWS CloudTrail user guide | https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html | Official | Jina. Event history 90 days management events; Lake. | High |
| pgaudit | https://github.com/pgaudit/pgaudit | GitHub | **1,707★**. Postgres audit extension. | High |
| Courier SES error page | https://www.courier.com/error-solutions/aws-ses-email-not-received | Vendor | MessageId ≠ delivery; RenderingFailure. Competitor copy. | Medium |
| NAYA Stripe recon guide | https://naya.finance/blog/stripe-reconciliation-guide | Vendor | Match on charge/PI IDs; missing_in_local. Competitor copy. | Medium |

---

## GitHub star counts recorded 21 Sep 2026 (`gh repo view`)

| Repo | Stars |
|---|---:|
| hashicorp/terraform | 49,695 |
| argoproj/argo-cd | 24,211 |
| git-lfs/git-lfs | 14,510 |
| debezium/debezium | 13,139 |
| pgbackrest/pgbackrest | 4,393 |
| snyk/driftctl | 2,662 |
| pgaudit/pgaudit | 1,707 |

`gh search issues "git lfs Object does not exist on the server"` still returns live user issues (e.g. FuseAI#26, Nitrokey/nethsm#6). Occupancy of the failure mode, not a product.

`gh search repos "terraform drift detection"`: many <15★ wrappers including “AI-powered” clones — evidence the category is a homework magnet, not whitespace.

---

## HN Algolia (discovery)

| Query | Result this pass |
|---|---|
| terraform drift | Hits exist (CloudQuery 2021, terraformdriftdetection.com, tfdrift). Confirms crowding. Comment-only hits sometimes have empty `title` in this client. |
| GitLab database outage backup | `nbHits` 9; item ids include 13778180 (classic thread candidate). **Full item JSON for 13778180 returned empty title this pass — not quoted.** |
| git lfs missing object | `nbHits` 0 this query. Negative; GitHub issues used instead. |
| terraform force-unlock destroy | `nbHits` 0 this query. Negative. |

Do not invent HN comment text.

---

## Exa (`mcporter call exa.web_search_exa`) — discovery, then filtered

Successful queries before **429**: terraform state drift; SES/SendGrid never delivered; dual-write/outbox; backup restore failed; S3 PUT vs GET; Argo OutOfSync.

**429** on: production git SHA mismatch (later covered by WebSearch + Helios `gh api`).

### Exa hits inspected then **not used as facts**

| URL | Why discarded |
|---|---|
| https://www.72technologies.com/blog/terraform-state-corruption-recovery-postmortem | Exa body looks like a 22 Jul 2026 incident write-up (spot runner, force-unlock). **Not Jina-verified as a named independent incident.** Commands match HashiCorp docs; those docs are the evidence. |
| https://johal.in/postmortem-sendgrid-39-api-bug-caused-10k-password | Exa. Claims 10,427 emails, “70% of API clients by 2025.” Reads generated. **Not a fact.** |
| https://vivianvoss.net/blog/the-backup-that-wasnt | Retelling of GitLab 2017. Use GitLab primary. |
| https://dev.to/vivian-voss/the-backup-that-wasnt-20gi | Same retelling. |
| https://hafiq.dev/blog/your-nightly-database-backup-has-never-been-tested-7cf8cde64afe | 20 May 2026 personal anecdote; 812-byte dump. Not corroborated. Pattern already in GitLab. |
| https://antigravitylab.net/en/articles/app-dev/antigravity-deploy-green-but-stale-build-version-verification-gate-field-notes | SHA-stamp recipe. Looks content-farm. Recipe independently confirmed by Helios#1048. |
| https://dev.to/sergey_shinder_ab2d943365/the-deploy-that-finished-while-a-third-of-the-fleet-stayed-behind-fn6 | “14/40 instances” fleet split. Not corroborated. Not used as an incident. |
| StackOverflow S3 consistency threads (2015–2018) | Pre strong-consistency. Historical only. |
| https://oneuptime.com/blog/post/2026-02-12-fix-s3-404-not-found-errors-existing-objects/view | Vendor SEO; delete markers / CRR lag. Not a new product gap. |
| Let's Encrypt / crt.sh threads | CT monitor lag ≠ “cert not issued.” Occupied by crt.sh, Censys, SSLMate. Not promoted to a problem writeup. |

---

## Failed / blocked / not used

| Attempt | Outcome |
|---|---|
| Exa after first batch | HTTP **429** free MCP | 
| Reddit | Doctor **off** — not used |
| Twitter | CLI **not installed** — not used |
| HN item 13778180 full JSON | Empty title/url in this client — not quoted |
| `gh repo view veeam` | No such repo; Veeam evidence is helpcenter URL |
| Kleppmann dual-write essay | Not re-fetched; not quoted |
| RDS Database Activity Streams docs | Named as AWS product; **body not fetched** — details Unknown |
| Datadog/Sentry/Honeycomb deploy tracking | Named as class incumbents for Problem 2; **bodies not fetched this pass** — do not cite features/pricing |
| DVC / git-annex | Adjacent pointer-vs-cache; **not fully fetched** — not claimed as inspected |
| Logistics/WMS, scientific ELN | No primary pages this pass; not forced |

---

## Intentionally not written

- `research/second-cycle/01-problem-discovery.md`, `03`–`10` — this agent’s scope is Area 1 files only (`02-world-state-evidence.md` + this sources file).
- Product concepts / architecture / `src/` changes.
- Resurrection of Action Receipt, Pipelock, Obsigna, HumanLayer, agentreceipts.ai.

---

## Cycle-1 occupancy carried in (already inspected 21 Sep 2026)

Not re-fetched; still binding so this area does not “discover” them as whitespace:

Pipelock Action Receipt spec, agentreceipts.ai / Obsigna daemon, HumanLayer, Claude Code OTEL, Cursor hooks, Stripe payout docs (re-confirmed live this pass), Monte Carlo / Stampli (money/data categories).

See `research/validation/08-validation-sources.md` and `research/validation/02-action-receipt.md`.
