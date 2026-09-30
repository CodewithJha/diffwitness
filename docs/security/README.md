# Security model

This page lists the security controls DiffWitness actually implements, with the code that enforces each one. The detailed threat analysis is in the [threat model](threat-model.md). To report a vulnerability, see [SECURITY.md](../../SECURITY.md).

## Trust boundary: the CLI runs your commands

DiffWitness executes the workflows listed in `.diffwitness/config.yaml` with your user's permissions. **It is not a sandbox.** Running it on a repository means trusting that repository's config and everything its commands run (tests, scripts, package lifecycle hooks), exactly as running `npm test` would. Don't run it on untrusted repositories outside an isolated environment such as a disposable CI runner or container.

## Process execution

Enforced in [`infrastructure/execution/process-executor.ts`](../../packages/diffwitness/src/infrastructure/execution/process-executor.ts), [`env-policy.ts`](../../packages/diffwitness/src/infrastructure/execution/env-policy.ts) and [`application/capture-workflows.ts`](../../packages/diffwitness/src/application/capture-workflows.ts).

| Control | Detail |
|---|---|
| argv only | Workflows are spawned with `shell: false` from an argv list. No shell parsing, globbing or variable expansion. NUL bytes in argv or `cwd` are rejected. |
| Commands come from config only | Nothing from command output, an AI provider or the network is ever executed. Providers have no execution interface. |
| Working directory confinement | `workflows[].cwd` must resolve inside the repository root and exist. Artifact paths must be exact, repository-relative and inside the root (globs rejected). |
| Timeouts | Every workflow has a timeout (default 60 s). On expiry the run is an analysis error (exit `3`), never evidence. |
| Bounded output | stdout and stderr are capped per workflow (default 1 MiB each); excess is dropped and recorded as truncated. Stored previews are bounded (256 characters). |
| Process groups | On POSIX each workflow runs in its own process group. Timeout, SIGINT, SIGTERM and shutdown SIGKILL the whole group, including grandchildren, and release its pipes. Not covered: descendants that leave the group (`setsid`, daemonizing). On Windows only the direct child is killed. |
| Environment policy | `execution.envPolicy`: `none` (only `workflows[].env`), `path` (default: host `PATH` plus `workflows[].env`) or `all` (full host environment; least isolated). |
| Interruption | SIGINT/SIGTERM exit `130`/`143` and persist nothing: no new or replaced baseline, no evidence, no comparison, no verdict. |
| Opt-out | `execution.allowCommands: false` makes `baseline` and `check` refuse to run workflows. |

## Git access

Git is invoked as a binary through [`infrastructure/git/run-git.ts`](../../packages/diffwitness/src/infrastructure/git/run-git.ts): argv only, `shell: false`, with an environment containing only `PATH`. Refs and ref-like arguments must match `^[A-Za-z0-9][A-Za-z0-9._/-]*$` and may not contain a `..` path segment. Diff commands use `--no-ext-diff --no-textconv --no-color`, and change-surface output is capped at 4 MiB per command.

## Evidence integrity

| Control | Detail |
|---|---|
| Hashing | Every observation is compared by the SHA-256 digest of its normalized bytes ([`evidence/digest.ts`](../../packages/diffwitness/src/infrastructure/evidence/digest.ts), [`normalize.ts`](../../packages/diffwitness/src/infrastructure/evidence/normalize.ts)). |
| Content addressing | Normalized output is stored under its digest and never overwritten; an existing blob with different content is a storage error. |
| Baseline immutability | `check` verifies the active baseline pointer is unchanged before and after it stores results. Replacing a baseline requires `baseline --force`. |
| Fail closed | Unknown config or persisted-record schema versions are rejected. An analysis error, a missing baseline or an AI failure never becomes a clean result. |

Evidence files are local and unsigned. They are as trustworthy as the machine and the `.diffwitness/` directory they live in.

## Secret handling

| Control | Detail |
|---|---|
| No credentials in config | The only credential setting is `ai.featherless.apiKeyEnv`, the *name* of an environment variable. |
| Evidence redaction | `normalize.redactEnv` masks the values of named environment variables in workflow output before hashing and storage. Exact value match only. |
| Packet redaction | Before any provider sees the evidence packet, previews, summaries, assumption text and paths are scanned for Bearer tokens, JWTs, AWS access key ids and `api_key=`/`token=`/`secret=`/`password=`-style assignments ([`application/redact-packet.ts`](../../packages/diffwitness/src/application/redact-packet.ts)). |
| Key never echoed | The Featherless key is not written to logs, JSON output or error messages. |

Redaction is pattern-based and best-effort. There is no entropy-based secret detection. Treat `.diffwitness/` as potentially sensitive; it is gitignored by default.

## AI isolation

Detailed in [AI architecture](../architecture/ai.md).

- The provider interface has one method, `explain(packet)`. Providers get no filesystem, Git, storage or process access, and no repository path.
- The packet is bounded (`ai.maxChars` and related budgets) and never contains file contents or line diffs.
- Responses are schema-validated, every cited finding or evidence ID must exist in the packet, and a shared wording gate rejects causal claims and, on analysis errors, claims of a clean result. A rejected explanation is not shown.
- Featherless requests have a timeout (default 30 s) and a response-size cap (default 512 KB); failures are not retried and never fall back silently to MockAI.
- `ci` runs without AI unless `--explain` is passed. AI output never changes findings, status or exit codes.

## Hosted demo boundary

The hosted demo ([`src/hosted/`](../../packages/diffwitness/src/hosted/)) runs the real CLI on one built-in scenario and never executes visitor input. Its controls, each covered by tests in `tests/hosted-*.test.ts`:

- The only input is a scenario id: JSON body of at most 1 KiB, strict schema (unknown keys rejected), id regex, then lookup in a built-in registry. No endpoint accepts commands, repositories, URLs, paths, configs, providers or files.
- Every child process is spawned argv-only from constants plus a server-created temporary path.
- Each run gets a fresh `mkdtemp` workspace with a private `HOME`, system and global Git config disabled (`GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`) and hooks disabled (`core.hooksPath=/dev/null`).
- The child environment is an allowlist; server secrets such as `FEATHERLESS_API_KEY` are never forwarded, and the explainer is always MockAI.
- Concurrency, request time, per-process time, output size and body size are all bounded; the workspace is removed on success, failure, timeout, disconnect and shutdown.
- The page renders output with `textContent` only, under a strict Content-Security-Policy.
- No accounts, cookies, analytics, database or stored history.

Residual risks (see the [threat model](threat-model.md#8-m7-hosted-demo-surface-29-september-2026)): no per-client rate limiting, orphaned processes after a hard kill of the server, and Windows hosts. The hosted demo is not a sandbox; it is safe because it only ever runs the shipped scenario.

## Project practices

- Three runtime dependencies (`commander`, `yaml`, `zod`), committed lockfiles, `npm ci` in CI.
- CI runs with read-only repository permissions and no secrets.
- Dependabot watches npm dependencies and GitHub Actions.
- Vulnerabilities are reported privately; see [SECURITY.md](../../SECURITY.md).
