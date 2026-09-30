# DiffWitness — Threat model

**Scope:** the local-first CLI, which executes repository workflows and optionally sends reduced evidence to an AI provider, and the hosted demo server. First written 22 September 2026 as a planning document; sections 6–8 record the controls as implemented. For a summary of the controls that exist today, start with the [security model](README.md).

---

## 1. Assets

| Asset | Why valuable |
|---|---|
| Source code in target repo | Confidentiality / integrity |
| Secrets in env, `.env`, CI tokens | Credential theft |
| Evidence blobs / baselines | Integrity of regression claims; may contain secrets in outputs |
| AI API keys | Billing abuse |
| Developer trust in “clean” result | Safety — false clean is high impact |
| Host running DiffWitness (laptop / CI / demo server) | RCE via malicious tests |

---

## 2. Actors

- Benign developer  
- Malicious dependency / malicious test in analyzed repo  
- Malicious PR author targeting DiffWitness CI  
- Compromised AI provider / MITM on provider HTTP  
- Anonymous visitor on the shared hosted demo  

---

## 3. Threats and controls

### T1 — Prompt injection via evidence / stdout

**Threat:** Model instructed (via captured output) to claim “no regression” or to exfiltrate secrets.  
**Controls:**

- AI receives schema-bound EvidencePacket only; outputs validated  
- System prompt: explain only; never assert clean against empty/error packets  
- `explain` cannot change BehavioralDiff  
- Redact secrets before packet build  
- Citations required; UI shows evidence above narrative  

### T2 — Malicious tests / postinstall / workflow commands

**Threat:** `diffwitness check` runs attacker-controlled commands from repo config or from `package.json` scripts invoked by workflow.  
**Controls:**

- Workflows only from **local config** the operator owns; document risk of running untrusted repos  
- Timeouts, max output bytes, no shell unless explicitly configured (prefer argv arrays)  
- CI: run in ephemeral runners; demo host: **locked fixture repo only**  
- Never execute commands proposed by AI (no such tool)  

### T3 — Secrets in evidence / logs / AI payload

**Threat:** Tokens printed by tests uploaded to provider or committed.  
**Controls:**

- Per-workflow `normalize.redactEnv`: values of named env vars are masked before hashing and storage  
- Pattern redaction (Bearer tokens, JWTs, AWS access key ids, `api_key=`/`token=`/`password=`-style assignments) on the evidence packet before any AI provider sees it  
- The evidence packet never contains file contents  
- `.diffwitness/` operational directories are gitignored by the `init` layout  
- Not implemented: high-entropy secret detection. Redaction is best-effort; treat evidence as potentially sensitive  

### T4 — Unsafe AI-driven execution

**Threat:** Model returns shell to run.  
**Controls:**

- **Hard invariant:** AiProvider has no execution API  
- Architecture review gate: reject PRs adding tool-calling to shell  

### T5 — False “clean” on analysis failure

**Threat:** Timeout masked as success.  
**Controls:**

- Distinct exit classes; `analysis_error` never maps to clean  
- CI fails closed on analysis_error  

### T6 — Git ref injection / path traversal

**Threat:** `--base` or paths escape intended repo.  
**Controls:**

- Validate refs; resolve under repo root; refuse `..` in artifact paths outside root  

### T7 — Supply chain / dependency

**Threat:** Malicious npm dependency in DiffWitness itself.  
**Controls:**

- Minimal dependencies (three runtime: `commander`, `yaml`, `zod`); committed lockfiles; `npm ci` in CI; Dependabot for npm and GitHub Actions; prefer stdlib  

### T8 — Shared demo multi-tenant abuse

**Threat:** A visitor tries to run an arbitrary repository or command on the hosted demo.  
**Controls:**

- MVP demo does not accept arbitrary repos; fixed fixture or local-run instructions  
- If interactive host added later: strong sandbox (containers) + auth — out of MVP  
- **M7 (implemented):** hosted demo executes only the shipped `pricing-discount-change` scenario; see §8  

---

## 4. STRIDE-style summary

| STRIDE | Example | Control theme |
|---|---|---|
| Spoofing | Fake baseline | Content addressing + Git SHA in records |
| Tampering | Edit evidence blobs | Blobs are named by their SHA-256 digest and never overwritten; comparisons use the digests in evidence records. Blobs are not re-verified on read, and local files are only as trustworthy as the machine |
| Repudiation | “Check passed” | Stored comparisons in `.diffwitness/runs/` with evidence IDs (no append-only history log) |
| Info disclosure | Secrets to AI | Redaction + opt-in provider |
| DoS | Infinite test | Timeouts / concurrency 1 |
| Elevation | AI → root shell | No AI execution |

---

## 5. Residual risk (accepted for MVP)

Running any developer tool that executes repo tests inherits **repo trust**. DiffWitness documents this; it does not claim secure multi-tenant execution of untrusted code.

## 6. M4 CI hardening notes (22 September 2026)

| Control | Status |
|---|---|
| Argv-only executor, timeouts, stream bounds, cwd validation | Implemented |
| Child cleanup on SIGINT/SIGTERM / AbortSignal / timeout | Implemented (six-blocker remediation, 28 Sep 2026): POSIX process group per workflow, SIGKILL to the group + pipes released; interrupted runs exit 130/143 and persist nothing; interrupted / signal-killed workflows never become Evidence. **Windows:** direct child only — descendants may survive. Not covered: processes that leave the group (`setsid`) |
| `envPolicy` none\|path\|all | Implemented + tested |
| Persistence / config unknown schema versions fail closed | Implemented |
| CI: AI off by default; DiffEngine status authoritative | Implemented |
| CI: missing baseline / analysis_error never → clean | Implemented |
| CI: source-dirty refuse (operational `.diffwitness/` excluded) | Implemented |
| Local-active baseline only (no PR inference) | Documented limitation |
| Sandbox for untrusted repos | **Not** claimed — residual T2 risk remains |

## 7. M5 Featherless / external AI notes (22 September 2026)

| Control | Status |
|---|---|
| Provider receives redacted EvidencePacket only | Implemented |
| No repo / Git / Storage / ProcessExecutor on provider | Implemented + tested |
| API key via env name only (`FEATHERLESS_API_KEY`); never in config/logs/errors | Implemented |
| AbortController timeout; bounded response size; no infinite retries | Implemented |
| HTTP status taxonomy (401/403/408/429/5xx/…) | Implemented |
| Schema + citation + semantic validation before accepting Explanation | Implemented — one shared gate (provider + `runExplain`, all providers) over every model-generated string; causal assertions rejected with or without a change surface; `analysis_error` clean/pass/safe claims rejected. Wording filter, not a guarantee of honesty |
| No silent featherless→mock fallback | Implemented |
| AI failure never rewrites BehavioralDiff to clean | Implemented |
| Live integration opt-in only (`DIFFWITNESS_FEATHERLESS_LIVE=1`) | Implemented (skipped in normal CI) |
| Compromised provider / MITM | Residual — TLS via `fetch`; packet already redacted; fail soft |

## 8. M7 hosted demo surface (29 September 2026)

Surface: `GET /health` (liveness), `GET /ready` (readiness — 503 when `git` is unavailable; checked once at startup, bounded), `GET /api/scenarios`, `POST /api/demo`, four static files. Implementation: `packages/diffwitness/src/hosted/`.

| Threat | Control | Status |
|---|---|---|
| Remote code execution via request | Only input is a scenario id: JSON content-type, ≤ `DEMO_MAX_BODY_BYTES`, strict zod object (unknown keys → 400), id regex `^[a-z0-9]+(-[a-z0-9]+)*$`, then registry lookup. No endpoint accepts commands, argv, repos/URLs, paths, workflows, configs, providers, env, or files. Executed argv is built from constants + a server-created temp path | Implemented + tested |
| Command injection | All children spawned argv-only (`shell: false`); git and CLI argv contain no request data | Implemented + tested |
| Path traversal | Static files are a fixed URL→file map loaded at startup (request paths never touch the filesystem); fixture path resolved from the package location; workspaces from `mkdtemp` | Implemented + tested |
| Host git config / hooks altering the demo | `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, private `HOME` in the workspace, `git init --template=` (no hooks), `-c core.hooksPath=/dev/null`, `commit.gpgsign=false` | Implemented |
| Secret exposure | Child env allowlist (`PATH`, workspace `HOME`, git/locale vars) — server env such as `FEATHERLESS_API_KEY` never forwarded; always `--provider mock`; `/health` returns only `{"status":"ok"}`; errors are fixed strings, no stack traces; logs carry no bodies, headers, IPs, env, or paths | Implemented + tested |
| Filesystem path leakage | Workspace path (created + canonical) → `<workspace>`, package root → `<app>` in all relayed output | Implemented + tested |
| Unbounded concurrency / lifetime | `DEMO_MAX_CONCURRENT` (503 + `Retry-After`), per-request deadline, per-child timeout, output caps, `headersTimeout`/`requestTimeout`, no queue | Implemented + tested |
| Temp dir leakage | Workspace removed on success, failure, timeout, client disconnect, shutdown; tracked set + TTL sweeper for failed removals | Implemented + tested |
| Subprocess leakage | Each child in its own process group; stop = SIGTERM (CLI kills its workflow groups, exits 143) then SIGKILL after 2 s; shutdown aborts active runs within `DEMO_SHUTDOWN_GRACE_MS` | Implemented + tested (POSIX) |
| Failed demo shown as success | Exit codes, CLI JSON status, `explanationStatus`, and expected scenario status all checked; any mismatch → `status: "failed"` with a failure kind and non-200 HTTP status | Implemented + tested |
| XSS via CLI output | Frontend uses `textContent` only; CSP `default-src 'none'; script-src 'self'` (no inline); `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` | Implemented |
| Abuse / DoS by repeated requests | Bounded by concurrency and timeouts only; no per-client rate limiting (no visitor identifiers by design) | **Residual** — rely on host-level protections |
| Orphans after hard server kill (SIGKILL/OOM) | Not reclaimed on next start | **Residual** |
| Windows hosts | Direct child only is killed | **Residual** — deploy on POSIX |
| Untrusted code | Not accepted; hosted demo is **not** a sandbox | By design |
