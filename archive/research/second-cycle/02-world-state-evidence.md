# Area 1 — World-state evidence outside the agent wrapper

**Date:** 21 September 2026  
**Cycle:** Second discovery. Adversarial. No product. No architecture. No `src/` changes.  
**Question:** Can we prove what actually happened in the external world without trusting the AI agent's own logs?  
**Hard constraint:** This is **not** Action Receipt / HumanLayer / Pipelock / Obsigna / agentreceipts.ai. Those were **KILLED** (`research/validation/02-action-receipt.md`). Do not resurrect, rename, or wrap them.  
**Method:** Agent Reach (`doctor --json` first; Exa via `mcporter` until free-tier **429**; GitHub `gh`; Jina Reader; HN Algolia; Cursor WebSearch as discovery then Jina/`gh` for bodies). Reddit/Twitter backends **off**. FACT vs INFERENCE labeled. Unknown stays Unknown. Search snippets are not evidence until the page was read.

---

## Area verdict

**The area does not currently meet the evidence threshold as an OFFGRID product space.**

Action Receipt died because host logs already separate narrator vs `tool_use`, and signed receipts already exist **on the mediated path**. Pipelock and Obsigna state the leftover in writing: the wrapper cannot prove a DELETE that went **around** the proxy.

This pass asked whether that leftover is a job: query the **system of record** the agent cannot author (WAL, bank/payment ledger, ESP events, object store, deploy/Git/cloud, external API).

**What we found:** the leftover is real as a *trust-boundary sentence* and false as a *product gap*. Every SoT already emits its own evidence and already sells a console, API, CLI, or scheduled comparison against that evidence. The ugly workarounds are real (`terraform import` / `state rm`; restore-from-backup cron; `git lfs fetch --all` then copy bytes into `.git/lfs/objects/xx/yy`; curl `/version` after deploy; enable SES event publishing and grep MessageId). They are also **exactly** what HashiCorp, AWS Backup, git-lfs, Argo CD, Stripe, and SES already document as the intended workflow.

**Counts this file:** **0 KEEP · 2 WEAK · 6 KILLED.**  
No product concepts are derived. Zero KEEP means do not open a sixth candidate from this area.

**Strongest evidence URL (pain is real):** [GitLab.com postmortem, 10 Feb 2017](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/) — `pg_dump` job existed; S3 bucket of backups was **empty** when they needed it; cron failure emails were rejected (DMARC); WAL archiving was off. World state contradicted the backup procedure. Not an agent-log problem.

**Strongest kill reason for the area:** the independent observer **is** the vendor system of record, and that vendor already ships lookup. A 3-week hosted “claim vs Stripe/AWS/Git/SES” viewer is a dashboard over first-party APIs. The remaining hole Pipelock named (side-door DELETE) is CloudTrail / `pgaudit` / WAL / OS audit — a **security-vendor** job, not a hackathon verifier.

**What this file is not:** an Action Receipt sequel, an MCP proxy, a signed tool-call log, a mock-agent split view, a sixth product.

---

## How to read statuses

- **KEEP** — evidenced painful job, remaining gap is not a named first-party feature or weekend CLI, 3-week honest demo possible. None this pass.
- **WEAK** — pain evidenced; remaining gap is a documented extension of an incumbent, or copy-me is a GitHub Action.
- **KILLED** — SoT already is the product, or the job is an architecture pattern, or OFFGRID constraints (privacy, fixture theater, originality) fail.

Adjacent to killed Action Receipt is allowed **only** when the source of truth is the external system, not an agent log. Problems 1–7 are that shape. Problem 8 is the residual “query WAL/CloudTrail for the DELETE” thesis and is killed on occupancy.

---

## Problem 1 — Backup job green, artifact unrestorable

### User
SRE / DBA / solo founder who “has backups” and will only find out they don’t during an incident.

### Exact workflow
1. Cron / managed backup job runs (`pg_dump` to S3, snapshot, vendor backup plan).
2. Monitoring is silence-as-success (no failure email, or job status `Complete`).
3. Primary is deleted, corrupted, or ransomware-locked.
4. Operator opens the backup location and attempts restore.
5. Artifact is missing, empty, wrong-version, or unrestorable. Recovery uses an accidental snapshot or accepts data loss.

### Failure
The **backup system of record** (object-store objects, snapshot list, WAL archive) does not contain a restorable copy, while the **backup job log** said the procedure ran. GitLab: S3 bucket empty; `pg_dump` 9.2 against Postgres 9.6 aborted; cron emails rejected because DMARC was not enabled for those messages. WAL archiving was not configured, so the lagged replica could not be rebuilt from segments.

### Frequency
Rare as a headline outage; continuous as a silent condition. GitLab’s empty dumps existed until the 31 Jan 2017 deletion made them visible. Recurrence of “we never tested restore” is a standing ops complaint, not a measured 2026 rate — **numeric frequency Unknown**.

### Current workaround
Positive restore tests: restore latest artifact to a throwaway instance, check size/checksum/row counts, **broadcast success** (silence = page). Check `PIPESTATUS` after `pg_dump | gzip`. GitLab’s own follow-up: WAL-E to S3 and “working on a system to automatically test recovery” (InfoQ report of the postmortem follow-through; WAL-E adoption is in that secondary article).

### Existing software
Direct: [AWS Backup restore testing](https://docs.aws.amazon.com/aws-backup/latest/devguide/restore-testing.html) (scheduled restore, then delete test resources; optional validation hook). [Veeam SureBackup](https://helpcenter.veeam.com/docs/vbr/userguide/surebackup_recovery_verification.html) (boot backup in an isolated lab; application tests). [pgBackRest](https://github.com/pgbackrest/pgbackrest) **4,393★** (21 Sep 2026). WAL-G / WAL-E class archive-and-restore. Vendor snapshot UIs (AWS, Azure, GCP).

Indirect: AWS Backup Audit Manager; compliance questionnaires that ask for restore-test dates; `pg_restore` in a cron a human wrote.

Internal: the restore-sandbox script in the runbook.

Scripts: `set -euo pipefail`, size floor, `rclone` + `psql -c 'SELECT COUNT(*)'`.

OSS: pgBackRest; restic/borg (not Postgres-PITR).

Abandoned / superseded: GitLab’s 2017 `pg_dump`-from-app-server path; they replaced it after the incident.

### Why existing software fails
AWS Backup restore testing, by the vendor’s own storage-blog extension, confirms the **resource becomes available**. Application-level proof (row counts, app boot, WAL completeness) is **your** Lambda/Step Functions on the EventBridge restore-completed event. Veeam SureBackup is enterprise VM-lab, not a 3-week SaaS for indie Postgres. pgBackRest is a tool you still have to schedule and alert on. The remaining sentence — “positive heartbeat that a *business* restore worked” — is a cron, not a category gap.

### Evidence (actual URLs)
- https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/ (Jina, 21 Sep 2026). S3 backups “not there”; bucket empty; `pg_dump` 9.2 vs 9.6; DMARC rejected cron emails; WAL archiving off; ~5,000 projects / 5,000 comments / 700 accounts in the lost window (17:20–00:00 UTC).
- https://docs.aws.amazon.com/aws-backup/latest/devguide/restore-testing.html (Jina). First-party scheduled restore testing.
- https://aws.amazon.com/blogs/storage/implementing-restore-testing-for-recovery-validation-using-aws-backup/ (WebSearch + fetch). Lambda validation is the documented leftover.
- https://helpcenter.veeam.com/docs/vbr/userguide/surebackup_recovery_verification.html (WebSearch). SureBackup is the named recovery-verification product.
- https://github.com/pgbackrest/pgbackrest — 4,393★, pushed 17 Sep 2026 (`gh repo view`).

Not used as independent incidents: 2026 retellings of GitLab (vivianvoss.net, hafiq.dev). They repeat the official postmortem; they are not new events.

### Economic impact
GitLab: hours of outage plus unrecoverable writes in a six-hour window; GitLab.com only (self-managed/Enterprise called out as unaffected). Dollar TAM for “restore-test SaaS” **Unknown**. Cost of a missed restore is unbounded (company-killing) and rare, which is why buyers already pay Veeam/AWS.

### Technical opportunity
Deterministic: restore + checksum + row-count heartbeat. No model required. Hard part is credentials to production backups and a sandbox expensive enough to restore into.

### Non-AI solution
The whole job. Cron + sandbox + Slack “restore-test passed: size=… users=…”.

### AI opportunity
None that is load-bearing. “Explain why pg_restore failed” is a chat overlay.

### Security/privacy
Backup bytes are the crown jewels. A hosted demo that restores *real* customer dumps is a non-starter. Fixture dumps are theater.

### Three-week feasibility
**Yes** as a toy: generate a small Postgres, take a deliberately empty dump, show restore fail vs a good dump heartbeat. **No** as a credible production product: restore testing needs the customer’s vault, IAM, and a disposable VPC.

### Demo possibility
Fixture `pg_dump` that is 812 bytes of header vs a real dump, restore both, green/red. Judges will say “check `PIPESTATUS`.” Honest, and fatal for Originality.

### Post-hackathon potential
Absorption into AWS Backup validation hooks / Veeam / pgBackRest docs. Not an independent company on this evidence.

### Strongest reason NOT to solve it
GitLab is a 2017 textbook; AWS and Veeam already sell restore testing; the remaining app-level check is a Lambda AWS already describes.

### Status
**WEAK**

### Research-standard answers
1. Who: operators who own backups.  
2. What: job log ≠ restorable object in the store.  
3. How often: silent until disaster; rate Unknown.  
4. Current workflow: cron/vendor backup, hope.  
5. Manual: restore in anger; or a handwritten restore-test.  
6. Cost: GitLab-scale outage + data loss; WTP Unknown vs AWS/Veeam.  
7. Goes wrong: you discover emptiness at RTO time.  
8. Software: AWS Backup restore testing, SureBackup, pgBackRest.  
9. Why not enough: app-level proof is a hook, not a missing product.  
10. Remaining gap painful? Only if you refuse to tick the vendor box.  
11. Solvable? Yes, deterministically.  
12. 3-week credible? Toy yes, product no.  
13. Public demo? Fixture only.  
14. Privacy? Extreme.  
15. Post-hackathon? No.

---

## Problem 2 — Deploy/CI green, live fleet or edge serving another identity

### User
On-call engineer whose pipeline is green while a subset of users still hit the bug that was “fixed.”

### Exact workflow
1. CI builds commit `abc`, deploy job reports success (rolling update finished, health checks pass, invalidation `Completed`).
2. Operator believes production is `abc`.
3. Users (or a later smoke test) still see old behavior.
4. Someone queries **live identity**: JVM `/management/info` `git.commit.id`, container image digest, launch-template AMI, CloudFront `ETag`/`X-Cache`, Argo sync vs live image.
5. World state ≠ the SHA the pipeline claimed.

### Failure
The pipeline is a record of **its own work list**, not of what is serving traffic. Documented cases this pass:

- [ls1intum/Helios#1048](https://github.com/ls1intum/Helios/issues/1048) (open, created 25 May 2026, `gh api`): deploy workflow dispatched a **stale** `commit_sha`; job `success`; `/management/info` showed yesterday’s `git.commit.id`. Suggested workaround: post-deploy curl that asserts live SHA == requested SHA.
- [argoproj/argo-cd#26585](https://github.com/argoproj/argo-cd/issues/26585) (Feb 2026): ApplicationSet image SHA patched after Argo had synced; apps stayed OutOfSync until a dummy source forced a revision. Workaround: extra Git source used only as a sync marker.
- [argoproj/argo-cd#7333](https://github.com/argoproj/argo-cd/issues/7333): UI **Synced** while live image digest ≠ git override (kustomize image-list ordering). Workaround: stop using aliases; put full image URL in base.
- AWS re:Post + official invalidation docs: CloudFront invalidation **Completed** while a viewer still gets old bytes (wrong path, browser cache, origin still old, 5–15 min POP lag). Official advice: **versioned filenames**, not a new verifier.

### Frequency
Every rolling deploy / CDN publish is an opportunity. Helios is one open issue, not a rate. Argo OutOfSync is the product’s normal state (Cheveo blog: OutOfSync means Git ≠ cluster). Numeric multi-SHA-fleet rate **Unknown**.

### Current workaround
Stamp SHA into the artifact; expose `/version` or `/management/info`; CI polls until match or fail. `argocd app diff`. `kubectl get pod -o jsonpath='{.status.containerStatuses[*].imageID}'`. `curl -I` and read `ETag`/`X-Cache`. Count distinct SHAs in metrics (`build_info` gauge) — described in secondary blogs; **not** treated as a named incident this pass.

### Existing software
Direct: [Argo CD](https://github.com/argoproj/argo-cd) **24,211★** (desired Git vs live cluster). Flux. Kubernetes ReplicaSet image IDs. AWS launch-template versions. CloudFront invalidation API + `Completed` status.

Indirect: Sentry Releases, Datadog deployment tracking, Honeycomb markers, LaunchDarkly (not fetched this pass as bodies; named as the usual “what version is serving” incumbents — **do not treat pricing/features as fetched**). Spring Boot Actuator `/info` git plugin. Helios’s own suggested check.

Internal: `echo $GIT_SHA > version.json` in the Dockerfile.

Scripts: 15-line GitHub Action `curl $PROD/version.json | jq -e --arg s "$GITHUB_SHA" '.sha==$s'`.

OSS: Argo CD, Flux, kube-score (not this job).

Abandoned: none named. The workaround **is** the product.

### Why existing software fails
Argo CD *is* Git vs cluster and still lies when rendering (kustomize order, AppSet progressive sync). That is a bug in Argo, not whitespace for a new company — they reproduce and patch (#26811 referenced on #26585). CloudFront `Completed` does not mean every POP served new bytes; AWS says use versioned names. The “SHA stamp + curl” gate is what Helios already proposed on the issue. Remaining gap is **packaging a curl**.

### Evidence (actual URLs)
- https://github.com/ls1intum/Helios/issues/1048 — `gh api` 21 Sep 2026: open; stale SHA; live `git.commit.id` mismatch; success checkmark.
- https://github.com/argoproj/argo-cd/issues/26585 — Exa/GitHub: OutOfSync after image SHA patch; dummy source workaround.
- https://github.com/argoproj/argo-cd/issues/7333 — Synced UI, live digest wrong; kustomize peculiarity.
- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html — versioned filenames vs invalidate.
- https://repost.aws/questions/QUG__vuLtlS-Wf_z2iNxOFtw/cloudfront-continues-to-serve-old-content-after-invalidation-and-s3-update — Completed ≠ new content.
- https://github.com/argoproj/argo-cd — 24,211★.

Not used as facts: antigravitylab.net “version verification gate” and DEV.to “third of the fleet stayed behind” (2026 blogs; bodies look like field-note content farms). The *workaround recipe* (stamp SHA, curl) is independently confirmed by Helios #1048.

### Economic impact
Wrong-SHA staging in Helios: wasted operator time + a dangerous prod variant they name. Fleet split: bugs that “won’t stay dead.” Dollars Unknown.

### Technical opportunity
Read live identity from the process/CDN/API, compare to the claimed SHA/digest. Deterministic. Hard part: getting a signal from every replica and every POP, not one `curl` from the CI runner’s region.

### Non-AI solution
The SHA stamp + required check. Argo diff. Versioned asset names.

### AI opportunity
None.

### Security/privacy
`/version` leaking SHA is usually fine. Hitting production from a public demo needs a fixture cluster. CloudFront probing many POPs can look like a scrape.

### Three-week feasibility
**Yes** as fixture: two containers, old/new SHA, deploy job that lies, probe that catches it. Copy-me: hours.

### Demo possibility
Strong visually (green check vs live SHA). Indistinguishable from the Helios issue’s “optional defense.” Originality dies.

### Post-hackathon potential
A GitHub Action. Argo/Sentry/Datadog already own “what version is live.”

### Strongest reason NOT to solve it
Helios maintainers already wrote the product on the bug ticket. Argo CD *is* the Git-vs-live comparison.

### Status
**WEAK**

### Research-standard answers
1. Who: whoever ships and then debugs “but we deployed that.”  
2. What: pipeline success vs live identity.  
3. How often: Unknown; one open 2026 issue plus standing Argo OutOfSync.  
4. Workflow: deploy, assume, get a ticket, query live SHA.  
5. Manual: curl `/info`, `kubectl`, Argo diff.  
6. Cost: debug hours; wrong-code risk. WTP Unknown.  
7. Goes wrong: split fleet, stale CDN, “fixed” bug returns.  
8. Software: Argo CD, actuator `/info`, CloudFront, Sentry/Datadog class.  
9. Why not: they *are* the comparison; bugs are theirs to patch.  
10. Gap painful? The curl is painful until you write it once.  
11. Solvable? Yes.  
12. 3-week? Yes, as a wrapper.  
13. Demo? Fixture SHA mismatch.  
14. Privacy? Low if SHA-only; high if probing customer prod.  
15. Post-hackathon? Action, not a company.

---

## Problem 3 — Email `Send*` 200 / MessageId vs provider events vs inbox

### User
Backend engineer or support agent: “we sent the password reset / OTP / receipt” but the user has nothing.

### Exact workflow
1. App calls SES `SendEmail` / SendGrid v3; logs MessageId; treats that as sent.
2. User says it never arrived.
3. Support searches app logs (have MessageId), then the **ESP event stream** (Send, RenderingFailure, Reject, Bounce, Delivery), then asks the user to check spam.
4. Possible worlds: app never reached SES; SES accepted then dropped (template render, suppression, virus); ISP accepted (`250`) then filtered/quarantined/dropped.

### Failure
Application log is not the email system of record. SES MessageId means **accepted for processing**, not delivered. SendGrid **Delivered** means receiving server `250 OK`, after which the ISP may spam-folder, quarantine (Proofpoint/Mimecast), or drop — SendGrid is “only notified of the email acceptance.”

### Frequency
AWS: “one common issue we hear from our customers.” No rate published on the fetched pages. Transactional email teams hit it whenever a user opens a ticket. Numeric Unknown.

### Current workaround
Enable SES event publishing / SNS notifications; grep MessageId through Send → Delivery/Bounce/RenderingFailure. Send a test from the SES console. Check suppression lists. Tell the user to look in spam. Open the ESP activity UI.

### Existing software
Direct: Amazon SES event publishing and SNS bounce/complaint notifications ([AWS Messaging blog, 27 Jun 2023](https://aws.amazon.com/blogs/messaging-and-targeting/how-to-investigate-what-happened-to-the-email-that-was-sent-via-ses-but-was-never-received-in-recipient-inbox/)). Twilio SendGrid Event Webhook + Activity. Postmark/Mailgun/SparkPost event APIs (not all re-fetched). Courier (vendor page describing SES MessageId vs delivery; used as competitor copy, not as a statistic).

Indirect: Gmail/Workspace admin audit (recipient-side). Proofpoint/Mimecast quarantine (SendGrid names them). Inbox placement tools (validity, GlockApps — **not fetched**; do not invent capabilities).

Internal: “search MessageId in CloudWatch.”

Scripts: Lambda on SES events writing to the user row `email_status`.

OSS: none that replaces the ESP’s own events.

Abandoned: none.

### Why existing software fails
It doesn’t. The SoT **is** the ESP event document. The remaining unprovable layer is **inside the recipient ISP** after `250`. AWS says you must ask the ISP. No third-party product can honestly show “in inbox” without the recipient’s mailbox. That is a physical limit, not a startup.

### Evidence (actual URLs)
- https://aws.amazon.com/blogs/messaging-and-targeting/how-to-investigate-what-happened-to-the-email-that-was-sent-via-ses-but-was-never-received-in-recipient-inbox/ (Jina). Three drop zones; MessageId = accepted; RenderingFailure/Reject/suppression; Delivery = ISP `250`.
- https://support.sendgrid.com/hc/en-us/articles/4408443310619-Email-Delivered-But-Not-Appearing-in-Inbox (Jina). Delivered ≠ inbox; post-acceptance filtering; enterprise quarantine.

Not used: johal.in “10k password reset emails” postmortem (Exa; reads as generated vendor-content; not treated as a fact).

### Economic impact
Support tickets, failed OTP/onboarding. Courier copy claims savings — **vendor, ignored**. Independent dollars Unknown.

### Technical opportunity
Join app MessageId to ESP events. A table. SES already emits the rows.

### Non-AI solution
Configuration set + event table + support UI that shows the last event for the MessageId.

### AI opportunity
None.

### Security/privacy
Email events include recipient addresses. Hosted demo of real mail is abuse-adjacent. Fixture MessageIds only.

### Three-week feasibility
Fixture: fake SES events JSON, show Send without Delivery. Looks like the AWS blog.

### Demo possibility
Yes, and it is a screenshot of SES docs.

### Post-hackathon potential
Feature of Courier/customer.io/the ESP. Not a company.

### Strongest reason NOT to solve it
AWS already published the runbook. Delivered-but-not-inbox is **unobservable** after ISP `250`.

### Status
**KILLED**

### Research-standard answers
1. Who: anyone sending transactional email.  
2. What: send() log ≠ ESP events ≠ inbox.  
3. How often: common support; rate Unknown.  
4. Workflow: log MessageId, enable events, grep.  
5. Manual: console test + spam ask.  
6. Cost: support; Unknown WTP.  
7. Goes wrong: user locked out; silent drop.  
8. Software: SES events, SendGrid events, ESP UIs.  
9. Why not: they solve the observable part.  
10. Gap painful? Only the ISP-blind zone, which is unsolvable.  
11. Solvable? Observable slice yes; inbox proof no.  
12. 3-week? Wrapper.  
13. Demo? Blog screenshot.  
14. Privacy? High.  
15. Post-hackathon? No.

---

## Problem 4 — IaC state file vs live cloud (partial apply, ClickOps, force-unlock)

### User
Platform engineer running Terraform/OpenTofu/Pulumi against AWS/GCP/Azure.

### Exact workflow
1. Apply starts; mutates cloud; process dies (spot runner, laptop sleep) **before** state is written.
2. Or a human changes a SG in the console.
3. Next plan compares **stale state** to live API and may want to destroy “duplicates.”
4. Incident workflow: freeze CI, pull S3 state versions, `terraform plan -refresh-only` / `-target`, `terraform import`, `terraform state rm`, two-person read of a full plan looking for unexpected `destroy`.

### Failure
Terraform state is a **cache of reality**, not reality. HashiCorp: do not make manual changes; drift means Terraform may destroy/recreate. HCP Terraform Standard includes drift detection as a paid feature. Locking protects the **state file**, not the cloud.

### Frequency
HashiCorp built a tutorial because it is the normal accident. Numeric Unknown. HCP selling drift detection implies it is routine enough to productize.

### Current workaround
`terraform plan -refresh-only`; `import` / `state rm`; scheduled `terraform plan -detailed-exitcode`; never `force-unlock` before asking why it is locked; S3 versioning on state. HashiCorp’s own tutorial is the workaround.

### Existing software
Direct: Terraform refresh; [HashiCorp drift tutorial](https://developer.hashicorp.com/terraform/tutorials/state/resource-drift); **HCP Terraform drift detection (Standard)**. [Spacelift drift detection](https://docs.spacelift.io/self-hosted/latest/concepts/stack/drift-detection) (scheduled proposed runs; optional reconcile). env0 scheduled plan. [Firefly cloud drift](https://www.firefly.ai/use-cases/cloud-drift-management) (estate-wide, ClickOps attribution — vendor page). [snyk/driftctl](https://github.com/snyk/driftctl) **2,662★**, not archived, pushed 21 Sep 2026. AWS Config (AWS-native config vs rules, not Terraform-aware by default).

Indirect: Terraform Cloud run history; CloudTrail as “who changed the SG.”

Internal: `make drift`.

Scripts: GitHub Action `terraform plan -detailed-exitcode`.

OSS: driftctl; tfdrift clones (`gh search` returned multiple <15★ including “AI-powered” wrappers).

Abandoned: none required. Category is full. driftctl is Snyk-owned and still updating.

### Why existing software fails
It doesn’t fail as a category. The ugly `import` surgery is what you do **once** when state is already corrupt; detection/prevention is a paid checkbox on HCP/Spacelift/env0/Firefly. A hosted “three-column state vs AWS vs tfvars” is Spec Triangle for Terraform — already killed as a shape.

### Evidence (actual URLs)
- https://developer.hashicorp.com/terraform/tutorials/state/resource-drift (Jina). State vs real infra; `-refresh-only`; import.
- https://github.com/hashicorp/terraform — 49,695★.
- https://github.com/snyk/driftctl — 2,662★, 21 Sep 2026.
- https://docs.spacelift.io/self-hosted/latest/concepts/stack/drift-detection
- https://www.firefly.ai/use-cases/cloud-drift-management (vendor).
- https://www.envzero.com/blog/tutorial-achieving-auto-remediation-with-envzero

Exa also returned a 22 Jul 2026 “72technologies” partial-apply postmortem (spot runner, force-unlock, `import`/`state rm`). **Not Jina-verified as a named company incident; not used as a fact.** The *commands* it describes are HashiCorp’s.

### Economic impact
Near-miss destroy of RDS is existential. Buyers already pay HCP Standard / Spacelift. Dollars Unknown.

### Technical opportunity
`terraform plan` already computes the diff. No new mechanism.

### Non-AI solution
HCP drift, Spacelift schedule, driftctl, refresh-only.

### AI opportunity
“Explain this plan” — Copilot glued to `terraform show`. Worse.

### Security/privacy
Cloud credentials in a hackathon demo; destroy risk. Fixture VPC only.

### Three-week feasibility
Yes as `terraform plan` HTML. Fatal wrapper.

### Demo possibility
HashiCorp tutorial is the 20-second demo.

### Post-hackathon potential
No. Firefly/Spacelift/HCP own it.

### Strongest reason NOT to solve it
HashiCorp sells this. driftctl exists. Copy-me is `terraform plan`.

### Status
**KILLED**

### Research-standard answers
1. Who: IaC owners.  
2. What: state cache ≠ cloud.  
3. How often: standing; rate Unknown.  
4. Workflow: plan/apply, then import surgery when it breaks.  
5. Manual: `import`, `state rm`, read destroys aloud.  
6. Cost: incident time; HCP already bills.  
7. Goes wrong: Terraform wants to destroy prod.  
8. Software: Terraform, HCP, Spacelift, env0, Firefly, driftctl, Config.  
9. Why not: they are the job.  
10. Gap? Packaging.  
11. Solvable? Already solved.  
12. 3-week? Wrapper.  
13. Demo? Official tutorial.  
14. Privacy? Cloud creds.  
15. Post-hackathon? No.

---

## Problem 5 — App database vs payment-provider objects (and payouts vs bank)

### User
Payments engineer / finance ops: order row says paid; Stripe disagrees — or Stripe has a charge the app never stored.

### Exact workflow
1. Checkout creates a PaymentIntent; webhook `charge.succeeded` should mark the order.
2. Webhook dropped, worker died, or idempotency failed.
3. Daily/weekly: list Stripe charges/Payouts/BalanceTransactions, join to local rows on `ch_` / `pi_` / `po_`.
4. Exceptions: missing_in_local (ghost charge), missing_in_provider (app lied or refunded elsewhere), amount/currency mismatch, payout lag.

Stripe docs: PaymentIntent `succeeded` means funds are in the account; **GET the PaymentIntent** is how you know. Payout reconciliation: Dashboard, payout reconciliation report, or `BalanceTransactions?payout=po_xxx`. Manual payouts: **you** reconcile. Undelivered webhooks: `GET /v1/events?delivery_success=false`, retries up to three days, Dashboard resend 15 days, CLI 30 days.

### Failure
The **provider ledger is the money**. The app DB is a cache. Dual-write (DB + assume webhook) is how they diverge. This is the same dual-write as Problem 7, with a bank attached.

### Frequency
Stripe publishes first-party recon docs because it is the default mature-integration job. Rate Unknown. Prior OFFGRID research already **REJECTED** “Payout Exceptions” (`06` concept #9) for sensitive data + incumbents.

### Current workaround
Stripe Dashboard + reports + a nightly job matching IDs. Puzzle-class GL clearing accounts (named in cycle-1 research; not re-litigated). Manual `events` replay.

### Existing software
Direct: [Stripe PaymentIntent status](https://docs.stripe.com/payments/payment-intents/verifying-status). [Payout reconciliation](https://docs.stripe.com/payouts/reconciliation). [Process undelivered webhook events](https://docs.stripe.com/webhooks/process-undelivered-events). Stripe Sigma / reports. Puzzle, NAYA (vendor recon guide fetched as competitor copy). Stampli/Ramp/Bill.com for AP — already rejected as category.

Indirect: bank CSV vs Stripe payout. Hookdeck/Svix for webhook reliability (sender/receiver infrastructure).

Internal: `reconcile.py`.

Scripts: the exception-queue snippet every payments blog pastes.

OSS: none that replaces Stripe’s objects.

Abandoned: Bench (bookkeeping hostage) — cycle-1 graveyard; do not become this.

### Why existing software fails
It doesn’t. Stripe **is** the SoT API. Cycle-1 already killed this as an OFFGRID default. Re-checking the docs confirms first-party recon and undelivered-event replay. The remaining work is accounting ops with PII and money, which a 3-week public demo cannot honestly hold.

### Evidence (actual URLs)
- https://docs.stripe.com/payments/payment-intents/verifying-status (Jina)
- https://docs.stripe.com/payouts/reconciliation (Jina)
- https://docs.stripe.com/webhooks/process-undelivered-events (WebSearch + docs)
- Cycle-1: `research/11-report-A-to-O.md` problem 9 KEEP then concept 9 REJECTED; `research/validation/07` does not reopen money.

### Economic impact
Ghost charges / unfulfilled paid orders. Real money. Buyers pay Stripe + accountants. Not a hackathon data story (`11` already).

### Technical opportunity
Join on provider IDs. Spreadsheet.

### Non-AI solution
Stripe reports + idempotent webhook handler + nightly list-and-diff.

### AI opportunity
Harmful (mis-classifying exceptions).

### Security/privacy
Secret keys, charges, PII. Public demo = fixtures, which look like tutorial CRUD (already rejected as Billy Junior).

### Three-week feasibility
Toy join on fixture JSON. Forbidden shape.

### Demo possibility
Fixture `pi_xxx` vs empty orders table. Judge: “that’s Stripe.”

### Post-hackathon potential
No. Already rejected.

### Strongest reason NOT to solve it
Killed last cycle as Payout Exceptions; Stripe first-party recon still is the product.

### Status
**KILLED**

### Research-standard answers
1. Who: payments/finance ops.  
2. What: app row ≠ Stripe object.  
3. How often: standing recon job.  
4. Workflow: webhooks + nightly Stripe list.  
5. Manual: Dashboard, CSV, replay events.  
6. Cost: money + accountant time.  
7. Goes wrong: fulfill unpaid / miss paid.  
8. Software: Stripe recon, GL tools, webhook infra.  
9. Why not: first-party.  
10. Gap? Integrations, not mechanism.  
11. Solvable? Yes, as ERP.  
12. 3-week? No (trust + CRUD).  
13. Demo? Tutorial.  
14. Privacy? Extreme.  
15. Post-hackathon? No.

---

## Problem 6 — Git LFS (or any content-addressed pointer) vs missing blob

### User
ML/game/design engineer: repo clones, Git history is fine, `git lfs pull` says object missing on the server. CI red on a pointer that never had bytes.

### Exact workflow
1. Commit writes an LFS pointer (OID, size) into Git. Git is happy.
2. `git lfs push` skipped (`--no-verify`, wrong remote, prune, fork).
3. Months later: clone, CI, or `git lfs fsck` discovers the OID is absent from `.git/lfs/objects` **and** the LFS server.
4. Restore: on a machine that still has the file, `git lfs fetch --all && git lfs push --all`; or copy raw bytes into `.git/lfs/objects/XX/YY/<OID>` (first four hex digits as directories); or rewrite history (BFG) to delete the pointer.

### Failure
Git’s object store is **not** the byte store. The pointer is a claim. The LFS server (or local `objects` dir) is the world. `git lfs fsck` can see the hole; restore is still manual path surgery. Maintainers: if nobody has the bytes, they are gone.

### Frequency
git-lfs/git-lfs issues span 2017–2022 at least (#2017, #2446, #4927). `gh search` still surfaces “Object does not exist on the server” in 2026 user repos. Not a measured rate. Recurring enough that GitLab publishes a troubleshooting page and the LFS README/issues document `lfs.allowincompletepush`.

### Current workaround
The OID→path copy. `git lfs push --all` from a lucky laptop. History rewrite. `lfs.allowincompletepush` (pushes the lie further).

### Existing software
Direct: [git-lfs](https://github.com/git-lfs/git-lfs) **14,510★** — `fsck`, `fetch --all`, `push --all`. GitHub/GitLab LFS servers. GitLab docs: on push, GitLab detects pointers and verifies objects exist (when LFS is on GitLab); separate LFS server needs `git lfs push --all`.

Indirect: git-annex, DVC (same pointer-vs-cache shape; DVC not fully fetched this pass — **do not overclaim**). GitHub storage quotas.

Internal: “don’t use `--no-verify`.”

Scripts: CI step `git lfs fsck` / `git lfs ls-files` + HEAD to LFS API.

OSS: git-lfs itself.

Abandoned: none. The tool exists; people misconfigure it.

### Why existing software fails
`fsck` finds; it does not resurrect bytes that no replica has. Server-side pointer verification is GitLab’s when LFS lives there; GitHub still lets history contain pointers whose objects were never uploaded if hooks were skipped. The “product” is a pre-push hook the project already has and users disable. A hosted scanner of public LFS OIDs is a `fsck` wrapper and cannot fetch private blobs.

### Evidence (actual URLs)
- https://github.com/git-lfs/git-lfs — 14,510★ (`gh`, 21 Sep 2026)
- https://github.com/git-lfs/git-lfs/issues/2446 — missing objects; `fetch --all`; copy into `04/dd/<oid>`; `allowincompletepush`
- https://github.com/git-lfs/git-lfs/issues/2017 — server missing, no backups, unretrievable; BFG rewrite
- https://github.com/git-lfs/git-lfs/issues/4927 — `fsck` finds hole; restore by `git add` of real bytes so clean filter relocates them
- https://docs.gitlab.com/topics/git/lfs/troubleshooting/ — pointer on push vs object existence

### Economic impact
Lost models/assets; unbuildable history. Unknown WTP: users already have git-lfs.

### Technical opportunity
HEAD every OID in the commit against the LFS batch API in CI. A hook. Not a company.

### Non-AI solution
`git lfs fsck` in required checks; deny `--no-verify`; GitLab-side verify.

### AI opportunity
None.

### Security/privacy
LFS objects may be proprietary weights. Scanning other people’s LFS is credentialed.

### Three-week feasibility
Yes: fixture repo with a dangling pointer, red report. Copy-me: `git lfs fsck`.

### Demo possibility
Looks like a git tutorial.

### Post-hackathon potential
No.

### Strongest reason NOT to solve it
git-lfs **is** the verifier. The ugly workaround exists because the bytes are gone, not because fsck is missing.

### Status
**KILLED**

### Research-standard answers
1. Who: repos with LFS.  
2. What: pointer in Git, blob missing in LFS store.  
3. How often: recurring issues; rate Unknown.  
4. Workflow: clone, fail, fsck, hunt a laptop.  
5. Manual: copy bytes to `objects/xx/yy`.  
6. Cost: lost artifacts.  
7. Goes wrong: history forever broken.  
8. Software: git-lfs, GitHub/GitLab LFS.  
9. Why not: bytes absence is unrecoverable by software.  
10. Gap? Discipline, not product.  
11. Solvable? Detection yes; resurrection no.  
12. 3-week? Wrapper.  
13. Demo? Tutorial.  
14. Privacy? High for weights.  
15. Post-hackathon? No.

---

## Problem 7 — Dual-write: database commit vs outbound event (Kafka/webhooks/email)

### User
Backend engineer in an event-driven service: Order row exists, Inventory never heard; or Inventory decremented, order rolled back.

### Exact workflow
1. `@Transactional` writes the order; then `kafka.send(OrderCreated)` (or HTTP webhook, or SES).
2. One of: DB commits, publish times out; publish succeeds, DB rolls back; retry duplicates.
3. Systems diverge silently until a downstream is “missing data.”
4. Intended fix: **outbox table in the same DB transaction**; relay (poller or CDC) publishes later; consumers idempotent.

### Failure
Two systems, no shared transaction. The database (or the broker, depending which you treat as SoT) is the world; the other write is a rumor. CDC reading **WAL** is how Debezium makes the DB the SoT without a second write from the app.

### Frequency
“Nearly every event-driven architecture eventually encounters it” (design-gurus explainer; treat as pedagogy, not a survey). Debezium **13,139★** and still pushed 21 Sep 2026 exists because the failure is standard.

### Current workaround
Transactional outbox; Debezium outbox event router; inbox/idempotency keys; nightly reconcilers (Problem 5 is the payments instance).

### Existing software
Direct: [debezium/debezium](https://github.com/debezium/debezium) **13,139★**. Outbox pattern (literature + every system-design blog). Kafka transactions (not 2PC with your SQL DB). Saga/compensating actions.

Indirect: Stripe undelivered events (Problem 5). Transactional email outbox tables.

Internal: `outbox` table + worker.

Scripts: `SELECT * FROM outbox WHERE published_at IS NULL`.

OSS: Debezium; Eventuate; Tram.

Abandoned: naive 2PC across DB+Kafka (people still try; it is the anti-pattern).

### Why existing software fails
The pattern **is** the solution. Remaining pain is operational (outbox growth, relay lag, idempotency bugs) — platform engineering, not a 3-week unique mechanism. A hosted “diff DB rows vs Kafka topic” is Debezium + a consumer lag dashboard (Kafka UI, Datadog).

### Evidence (actual URLs)
- https://github.com/debezium/debezium — 13,139★, 21 Sep 2026
- https://mdsanwarhossain.me/blog-outbox-pattern-debezium.html (Exa, 20 Mar 2026) — WAL → Debezium → Kafka; phantom inventory vs uncommitted order. Pedagogy; used for mechanism, not TAM.
- https://www.designgurus.io/blog/transactional-outbox-pattern (Exa) — dual-write matrix.

Kleppmann / microservices dual-write is the older literature; not re-fetched this pass; do not quote.

### Economic impact
Phantom inventory, missing notifications, double charges. Real, and why outbox is interview canon. WTP for a new SaaS Unknown and unlikely against Debezium.

### Technical opportunity
None new. CDC exists.

### Non-AI solution
Outbox + Debezium.

### AI opportunity
None.

### Security/privacy
CDC streams contain row data.

### Three-week feasibility
Demo two Docker containers that disagree. Homework.

### Demo possibility
System-design interview on a webpage.

### Post-hackathon potential
No.

### Strongest reason NOT to solve it
Debezium 13k★ *is* “WAL as world state for events.”

### Status
**KILLED**

### Research-standard answers
1. Who: event-driven backend teams.  
2. What: DB and bus diverge.  
3. How often: design-level; rate Unknown.  
4. Workflow: write twice, then outbox.  
5. Manual: SQL vs kafka-console-consumer.  
6. Cost: inconsistent domain.  
7. Goes wrong: phantom or lost side effects.  
8. Software: Debezium, outbox, Kafka UIs.  
9. Why not: they are the fix.  
10. Gap? Ops, not product whitespace.  
11. Solvable? Solved as a pattern.  
12. 3-week? Homework.  
13. Demo? Interview question.  
14. Privacy? CDC data.  
15. Post-hackathon? No.

---

## Problem 8 — Independent mutation proof from WAL / CloudTrail / audit tables (the area thesis)

### User
Security or platform engineer who needs to answer “did this DELETE/refund/deploy actually happen?” after an agent or human **might** have used a side door (raw `psql`, AWS console, stolen key) — i.e. the case Pipelock/Obsigna say they **cannot** see.

### Exact workflow
1. Something bad is claimed or suspected (row gone, bucket emptied, IAM changed).
2. Agent/runtime logs and MCP receipts are insufficient (bypass).
3. Query the **execution system’s own ledger**: Postgres WAL / `pgaudit` / logical decoding; AWS CloudTrail `LookupEvents`; RDS force-SSL logs; object-store access logs; Stripe Charge object (if money).
4. Correlate by time, principal, resource id — not by the agent’s story.

### Failure
Wrapper-mediated receipts do not commute with side doors. The world-state move is: stop asking the agent, ask CloudTrail/WAL. That sentence is correct. It is also the **job description of existing audit products**.

### Frequency
Every incident that involves “did someone actually run this?” SOC 2 / NIS2 language showed up on Cursor’s audit-trail FR (cycle-1). Rate of *agent* side-door DELETEs in the wild: **Unknown** (Pipelock/Obsigna marketing anecdotes are not counted as evidence here).

### Current workaround
CloudTrail event history (90 days, no extra charge for management events view). `pgaudit`. RDS logs. `pg_waldump` in anger (expert). SIEM export of Claude Code OTEL (cycle-1 — **agent-side**, out of scope except as occupancy). AWS GuardDuty. Database activity streams.

### Existing software
Direct: [AWS CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html) — Event history, Lake, immutable management events. [pgaudit/pgaudit](https://github.com/pgaudit/pgaudit) **1,707★**. Postgres logical decoding / WAL. Datadog/Splunk/Elastic SIEM. RDS Database Activity Streams (not re-fetched; **existence treated as named AWS product, details Unknown**).

Indirect: Pipelock/Obsigna **on the mediated path** (killed; cited only as the limit they publish). HumanLayer audit logs. Claude Code OTEL `tool_result`.

Internal: “grep CloudTrail for `DeleteTable`.”

Scripts: `aws cloudtrail lookup-events --lookup-attributes AttributeKey=ResourceName,AttributeValue=...`

OSS: pgaudit; pg_waldump (contrib).

Abandoned: none. This is a mature category.

### Why existing software fails
CloudTrail does not cover a DELETE issued inside a self-hosted Postgres on a VM except as the API that reached AWS (it may not). WAL/`pgaudit` does, if enabled **before** the incident — GitLab did **not** have WAL archiving. Enabling audit after the fact cannot reconstruct a side door. That is an ops-discipline problem (turn on WAL-E *before*), not a missing viewer. A hackathon app that tails WAL for a toy DB is `pgaudit` with CSS. Wrapping CloudTrail is an AWS console tab.

### Evidence (actual URLs)
- https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html (Jina). Event history 90 days; Lake; console/CLI/SDK actions.
- https://github.com/pgaudit/pgaudit — 1,707★
- GitLab postmortem: WAL archiving was **off**, so world-state for replication was already gone — the SoT must be configured in advance.
- Cycle-1 kill file: Pipelock “verification of the mediated slice does not prove a DELETE that went around the proxy”; Obsigna “in-process keys are forgeable.”
- https://github.com/debezium/debezium — WAL as published SoT for *events* (Problem 7); same primitive.

### Economic impact
Incident response, compliance. Buyers already pay AWS + SIEM. Unknown incremental WTP for “agent-shaped CloudTrail grep.”

### Technical opportunity
Query existing audit APIs. No new evidence channel. If audit was off, there is no evidence to recover.

### Non-AI solution
Turn on CloudTrail + pgaudit + WAL archive **before**. Lookup on incident.

### AI opportunity
NL-to-CloudTrail query — every SIEM already markets this. Not a wedge.

### Security/privacy
Audit logs are more sensitive than the original action. Hosting them is a security product with liability.

### Three-week feasibility
Toy WAL parser or CloudTrail fixture JSON. Real multi-account CloudTrail Lake is not 3 weeks. Judges who understand trust boundaries will name CloudTrail.

### Demo possibility
Fixture DELETE + CloudTrail-like event. “That’s the AWS console.” Cannot actually drop a real DB (`09` still applies, and we are not building).

### Post-hackathon potential
SIEM checkbox. Humanloop sunset extra-kills independent audit SaaS next to a platform.

### Strongest reason NOT to solve it
This *is* the Action Receipt leftover, and it is owned by CloudTrail / pgaudit / SIEMs. Building it is resurrecting a killed category with a different data source.

### Status
**KILLED**

### Research-standard answers
1. Who: security/SRE proving side effects.  
2. What: need evidence the wrapper never saw.  
3. How often: incidents; agent-specific rate Unknown.  
4. Workflow: CloudTrail / WAL / pgaudit lookup.  
5. Manual: console grep, `pg_waldump`.  
6. Cost: SIEM contracts.  
7. Goes wrong: no audit configured → GitLab-shaped hole.  
8. Software: CloudTrail, pgaudit, SIEMs, Debezium.  
9. Why not: they *are* the SoT query.  
10. Gap? Enabling audit earlier, not a new log.  
11. Solvable? Only if audit was on.  
12. 3-week? Theater.  
13. Demo? CloudTrail JSON.  
14. Privacy? Extreme.  
15. Post-hackathon? No — security vendor.

---

## Competitive destruction (area-level)

Tried, in order:

| Attack | Result |
|---|---|
| “This is already solved.” | **Yes** for 3–8. **Mostly** for 1–2 (AWS Backup / Veeam / Argo / `/version` curl). |
| “Not painful enough.” | GitLab and Helios say pain is real. Pain ≠ gap. |
| “Painful but nobody pays.” | People pay **the SoT vendor** (AWS, Stripe, HashiCorp, Veeam, Argo). They do not pay a fourth dashboard. |
| “Valuable but not 3 weeks.” | Real CloudTrail/WAL/restore-at-scale: not 3 weeks. Toy: 3 weeks and looks like homework. |
| “Buildable but not OFFGRID-interesting.” | Curl SHA, `terraform plan`, SES event table, `git lfs fsck` — tutorial CRUD adjacent. |
| “Incumbent copies immediately.” | Incumbents **already shipped**. |

No concept was formed after this screen. Do not write product concepts for a zero-KEEP area.

---

## Hackathon fit (if someone forced a demo anyway)

Would fail Originality (wrapper of the SoT’s own API), Product Thinking (judge opens Stripe/AWS), Technical Depth (join on IDs). Execution could look pretty. Potential is absorption. Prize is OpenAI credits; these jobs get **worse** with a model in the loop.

---

## What we searched and did not promote

Failure-mode searches (not `[idea] startup`): empty backups, pg_dump restore fail, terraform drift/force-unlock, SES never received, SendGrid delivered-not-inbox, S3 PUT vs GET (S3 is **strongly consistent** as of AWS’s current model — old eventual-consistency gap is largely closed; CRR lag remains a replication issue, not a 2026 product), Argo OutOfSync / image digest, CloudFront invalidation Completed, PaymentIntent vs DB, LFS missing object, dual-write/outbox, CT logs/crt.sh (occupied by crt.sh, Censys, SSLMate Cert Spotter; crt.sh lag ≠ “cert wasn’t issued”), Stripe undelivered webhooks.

Domains touched because evidence led there: SRE/backups, IaC, email ops, payments, Git/ML artifacts, data engineering (CDC), CDN, cloud audit. Not forced: logistics WMS, scientific ELNs, manufacturing — no primary pages in this pass showed a stronger ugly-workaround corpus than GitLab/Helios/SES.

S3 strong consistency: https://aws.amazon.com/s3/consistency/ — “what you write is what you will read.” Kills “S3 PUT 200 vs GET miss” as a 2026 wedge (historical SO questions remain, pre-change).

---

## Area conclusion

We can prove what happened in the world **only when the world was already recording it** (WAL archive on, CloudTrail on, SES events on, LFS objects uploaded, SHA stamped in the binary). Those recorders are first-party. When they were off, GitLab shows there is no post-hoc product that invents the missing S3 objects.

**Do not build** a claim-vs-SoT viewer, a WAL-tail for agents, a backup-restore startup, a Terraform drift UI, or an email-event dashboard for OFFGRID.

**Do not** treat the two WEAK problems as a shortlist. They are the least-dead wrappers.

Return: **0 KEEP, 2 WEAK, 6 KILLED.**
