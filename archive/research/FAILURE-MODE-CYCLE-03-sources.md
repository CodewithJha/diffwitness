# Failure Mode Cycle 03 — Sources

**Inspection date:** 2026-09-21  
**Method:** agent-reach (Exa search + Jina Reader primary fetches + GitHub `gh`). Reddit/Twitter not used (backends off). Search snippets are not evidence until the page body was read.

Reliability scale: **High** = vendor primary docs/product page fetched; **Medium** = reputable guide or community thread with concrete mechanism; **Low** = secondary blog/marketing comparison — use only as pointers, not market proof.

---

## Primary / High reliability

| Name | URL | Type | Date inspected | What it proves | Reliability |
|---|---|---|---|---|---|
| Healthchecks.io homepage | https://healthchecks.io/ | Product | 2026-09-21 | Cron/scheduled task monitoring via ping; alert when ping late/missing; Period + Grace states | High |
| Healthchecks cron monitoring docs | https://healthchecks.io/docs/monitoring_cron_jobs/ | Docs | 2026-09-21 | Dead man’s switch / heartbeat; detects machine down, cron broken, non-zero exit, long runtime; `&& curl` pattern | High |
| Healthchecks docs index | https://healthchecks.io/docs/ | Docs | 2026-09-21 | Listens for pings; silent while on time; alerts on miss | High |
| Healthchecks FAQ | https://healthchecks.io/faq/ | Docs | 2026-09-21 | Explicit dead-man / heartbeat framing; Cronitor comparison pointer | High |
| healthchecks/healthchecks GitHub | https://github.com/healthchecks/healthchecks | OSS repo | 2026-09-21 | **FACT:** 10,350 stars; open-source cron/background task monitoring | High |
| Cronitor heartbeat product | https://cronitor.io/heartbeat-monitoring | Product | 2026-09-21 | Alerts on absence without exit code; expected activity monitoring | High |
| Cronitor heartbeat docs | https://cronitor.io/docs/heartbeat-monitoring | Docs | 2026-09-21 | Expected interval, grace, failure/schedule tolerance | High |
| Dead Man’s Snitch homepage | https://deadmanssnitch.com/ | Product | 2026-09-21 | Cron/scheduled task absence alerts; “silent failures” positioning | High |
| Better Stack Uptime | https://betterstack.com/uptime | Product | 2026-09-21 | Heartbeats + cron monitoring marketed alongside uptime | High |
| Sentry Cron Monitoring | https://docs.sentry.io/product/crons/ | Docs | 2026-09-21 | First-party recurring job uptime/performance monitors | High |
| Sentry Crons getting started | https://docs.sentry.io/product/crons/getting-started/ | Docs | 2026-09-21 | Setup path for Sentry job monitoring (page fetched; nav confirmed) | High |
| Monte Carlo pipeline observability | https://docs.getmontecarlo.com/docs/pipeline-observability | Docs | 2026-09-21 | Freshness/volume anomaly without manual thresholds; table monitors | High |
| Bigeye Freshness & Volume | https://docs.bigeye.com/docs/freshness-and-volume-pipeline-reliability-copy | Docs | 2026-09-21 | Autothresholds on load gaps; HSLV; expected load timing | High |
| Metaplane monitor types | https://docs.metaplane.dev/docs/monitor-types | Docs | 2026-09-21 | Freshness monitors; anomaly on update lag | High |
| Metaplane continuous monitoring | https://www.metaplane.dev/data-observability/continuous-data-monitoring | Product/docs | 2026-09-21 | Volume/freshness as silent data-bug detectors | High |
| Acceldata Data Freshness Policy | https://documentation.acceldata.io/adoc/documentation/data-freshness-policy | Docs | 2026-09-21 | SLA + anomaly on stale data; exec-dashboard silent pipeline example | High |
| Temporal missed Schedule Actions | https://docs.temporal.io/troubleshooting/schedule-missed-actions | Docs | 2026-09-21 | `schedule_missed_catchup_window` metrics; DescribeSchedule miss counters | High |
| Stripe process undelivered events | https://docs.stripe.com/webhooks/process-undelivered-events | Docs | 2026-09-21 | List Events with `delivery_success=false`; retries window | High |
| Datadog adjusting No Data alerts | https://docs.datadoghq.com/monitors/guide/adjusting-no-data-alerts-for-metric-monitors/ | Docs | 2026-09-21 | First-party “No Data” metric monitor alerting (page exists; marketing chrome heavy on fetch) | High |
| Silent Fail homepage | https://silentfailapp.com/ | Product | 2026-09-21 | Dead-man for n8n/Make/Zapier; ping URL; email on miss | High |
| Silent Fail Zapier guide | https://silentfailapp.com/zapier | Product docs | 2026-09-21 | Distinguishes Zap *error* vs *did not run*; external deadline | High |

---

## Medium reliability

| Name | URL | Type | Date inspected | What it proves | Reliability |
|---|---|---|---|---|---|
| Cron job monitoring guide (statuspage.de) | https://statuspage.de/en/guides/cronjob-monitoring | Guide | 2026-09-21 | Practitioner explanation of heartbeat vs uptime; compares HC/Cronitor/DMS/Sentry Crons/Better Stack pricing snippets | Medium |
| Zapier community: silent failures | https://community.zapier.com/how-do-i-3/best-practice-for-monitoring-client-zaps-for-silent-failures-not-errors-missing-runs-53606 | Forum | 2026-09-21 | Builders describe quiet Zaps; recommend Healthchecks/Cronitor + reconciliation (**not** market census) | Medium |
| Workato community: no webhook activity | https://systematic.workato.com/t5/workato-pros-discussion-board/daily-alert-interfaces-with-no-webhook-activity-in-the-last-7/m-p/10839 | Forum | 2026-09-21 | Desire for silent non-receipt detection; RecipeOps last-run recipe as answer | Medium |
| Workato help: recipe failures / stops | https://z3n-workato-trial.zendesk.com/hc/en-us/articles/10973614837274-How-do-I-monitor-recipe-failures-and-get-alerted-when-a-Workato-automation-stops-running | Help | 2026-09-21 | First-party ops hub / RecipeOps alerting paths for stop/fail | Medium |
| CronAlert automation monitoring blog | https://cronalert.com/blog/automation-workflow-monitoring | Vendor blog | 2026-09-21 | Documents heartbeat pattern for n8n/Zapier/Make; competitor existence | Medium |
| Metaplane monitor forecasts | https://docs.metaplane.dev/docs/monitor-forecasts | Docs | 2026-09-21 | Expected freshness/volume forecasts from metadata | High/Medium |

---

## Low reliability (pointers only — not sole proof)

| Name | URL | Type | Date inspected | What it proves | Reliability |
|---|---|---|---|---|---|
| QuietPulse Zapier monitoring (DEV) | https://dev.to/quietpulse-social/zapier-monitoring-how-to-catch-silent-automation-failures-4b4d | Blog | 2026-09-21 | Another heartbeat-URL niche competitor narrative | Low |
| Notilens automation monitoring | https://www.notilens.com/solutions/automation-monitoring | Marketing | 2026-09-21 | Claims n8n/Zapier/Make silent failure product | Low |
| Kriv AI Zapier monitoring article | https://www.kriv.ai/articles/monitoring-alerting-and-rollback-for-zapier-keeping-automations-safe-in-production | Blog | 2026-09-21 | Secondary ops advice (zero-volume alerts, etc.) | Low |
| Monitrics Stripe webhook blog | https://monitrics.com/blog/monitor-stripe-webhooks-silently-fail | Blog | 2026-09-21 | Anecdote + monitoring pitch; Indie Hackers story not independently verified here | Low |
| Velprove Stripe webhook DEV post | https://dev.to/velprove/how-to-monitor-stripe-webhooks-and-payment-flow-uptime-672 | Blog | 2026-09-21 | Synthetic chain pattern; vendor-adjacent | Low |
| Inngest vs Temporal vs Trigger.dev | https://apiscout.dev/guides/inngest-vs-temporal-vs-trigger-dev-2026 | Comparison | 2026-09-21 | Secondary observability comparison (2026-03-16) | Low |
| Datadog Synthetic Monitoring marketing | https://www.datadoghq.com/product/synthetic-monitoring/ | Marketing | 2026-09-21 | Synthetics exist in Datadog portfolio (page chrome-heavy) | Medium/Low |
| PagerDuty Event Enrichment blog | https://www.pagerduty.com/blog/automation/get-the-context-your-alerts-are-missing-with-event-enrichment/ | Blog | 2026-09-21 | PD enriches/routes alerts — not absence detector | Medium (for negative: not the gap) |
| BrowserBash PagerDuty synthetics | https://browserbash.com/blog/pagerduty-alerts-from-synthetic-browser-checks | Blog | 2026-09-21 | Synthetic → PD pattern | Low |

---

## Related prior research (this repo — not re-fetched as new incidents)

| Name | Path | What it contributes |
|---|---|---|
| World-state evidence | `research/second-cycle/02-world-state-evidence.md` | GitLab empty backups; SoT packaging kill — adjacent, not resurrected |
| Cycle-2 shortlist | `research/second-cycle/09-final-shortlist.md` | 0 survivors; do not re-tread Areas 1–3 |
| Cycle-1 survivor report | `research/validation/07-final-survivor-report.md` | Killed CiteCheck / Action Receipt / etc. |

---

## Not relied upon

- Single Reddit posts as market-wide proof (Reddit backend off; not searched).  
- Fabricated pricing/TAM. Pricing snippets in statuspage.de guide treated as **secondary** only.  
- Claims that Stripe “never emails on disable” from Monitrics blog without Stripe primary confirmation — treated as **HYPOTHESIS/Low**, not FACT.
