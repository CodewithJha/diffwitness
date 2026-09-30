# Hosted demo reference

The hosted demo (live at <https://diffwitness.onrender.com>) is a small `node:http` server in [`packages/diffwitness/src/hosted/`](../../packages/diffwitness/src/hosted/) with a static page in [`packages/diffwitness/hosted/public/`](../../packages/diffwitness/hosted/public/). It is a controlled demonstration, not a simulation: it runs the same DiffWitness CLI and engine you install locally, on a built-in scenario, in a fresh temporary Git repository, so anyone can reproduce the result safely.

It is not part of the npm package. To deploy it, see [Deployment](../DEPLOYMENT.md).

## What one run does

For each **Run investigation** click, the server:

1. creates a fresh temporary workspace and copies the built-in pricing project into it (`src/pricing.mjs`, `bin/quote.mjs` printing `{"total":315}`, a `node --test` suite);
2. commits it to a new Git repository (no hooks, no host Git config);
3. runs the real CLI: `diffwitness init`, installs the project's workflow config, `diffwitness baseline`;
4. applies the built-in change (`DISCOUNT = 0.1` → `0.2` in `src/pricing.mjs`) and captures `git diff`;
5. runs `diffwitness check`, `diffwitness explain --provider mock` and `explain --json`;
6. returns every stage's command, exit code and output, and deletes the workspace.

The expected result is one finding: the quote goes from `{"total":315}` to `{"total":280}` while the tests stay green. The page shows it as a verdict readout (**BEHAVIOR CHANGED**, baseline 315 → current 280), an investigation rail, the detected finding, an evidence ledger, the change surface, an execution trace and a causality section ("Not established"). The MockAI explanation and raw output are under "Deeper technical details".

## Limitations

- One built-in scenario. You can't upload code, paste a repository URL or change the config.
- MockAI only; no live model is ever called.
- No accounts, analytics, visitor ids, database or stored history.
- Free-tier hosting may add a cold start of several seconds after idle.
- POSIX hosts only.

## API

| Endpoint | Response |
|---|---|
| `GET /health` | `200 {"status":"ok"}` whenever the process is up (liveness). |
| `GET /ready` | `200 {"status":"ready","checks":{"git":"ok"}}` once `git --version` succeeds; `503` with `reason: "git_unavailable"` or `"starting"` otherwise. Point platform health checks here. |
| `GET /api/scenarios` | The built-in scenario list. |
| `POST /api/demo` | Runs the scenario. Body must be exactly `{"scenario":"pricing-discount-change"}` with `Content-Type: application/json`. |

`POST /api/demo` errors: unknown or extra fields, path-like or unknown ids → `400`; wrong content type → `415`; body too large → `413`; not ready or at capacity → `503` (with `Retry-After` at capacity; there is no queue). HTTP `200` only for a completed run; timeouts return `504`, interruption `503`, anything else `500`.

Response (`schemaVersion: 2`):

- `scenario` (including the installed `config` text) and `status` (`completed` or `failed`)
- `failure`, with `kind` one of `stage_failed`, `analysis_error`, `explain_error`, `unexpected_result`, `stage_timeout`, `request_timeout`, `interrupted`, `internal_error`
- `stages[]`: `id`, `label`, `command` (display string), `outcome`, `exitCode`, `stdout`, `stderr`, `truncated`, `json`, `durationMs`
- `findings` (each with `before` / `after` = `{evidenceId, preview}`) and `explanation`, copied from the CLI's `explain --json`, never recomputed
- `summary`: a presentation view derived from the same JSON (verdict, tests PASS/FAIL from the tests workflow's exit-code digest, output before → after, observation counts, evidence IDs)

Output scrubbing: the run's temporary directory is shown as `<workspace>` and the app directory as `<app>`. Command labels omit the internal `--repo <workspace>` argument. Nothing else in CLI output is changed; ids and durations differ per run.

## Configuration

All optional; invalid values stop startup with an error naming the variable. See [`.env.example`](../../.env.example).

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | Listen port (`0` = ephemeral; the `listening` log line shows it). |
| `HOST` | `0.0.0.0` | Bind address. Use `127.0.0.1` locally. |
| `DEMO_MAX_CONCURRENT` | `2` | Concurrent runs (1–16); beyond that `503` + `Retry-After`. |
| `DEMO_REQUEST_TIMEOUT_MS` | `30000` | Hard limit for one `POST /api/demo`. |
| `DEMO_STAGE_TIMEOUT_MS` | `15000` | Limit per child process. |
| `DEMO_WORKSPACE_TTL_MS` | `120000` | The sweeper removes tracked workspaces older than this; must be at least the request timeout + 5 s. |
| `DEMO_MAX_OUTPUT_BYTES` | `262144` | Cap on captured stdout and stderr, per child. |
| `DEMO_MAX_BODY_BYTES` | `1024` | Request body cap. |
| `DEMO_SHUTDOWN_GRACE_MS` | `10000` | On SIGINT/SIGTERM, time for active runs to stop and clean up. |

`FEATHERLESS_API_KEY` is never read or forwarded by the server.

## Run it locally

```bash
npm ci && npm run build
HOST=127.0.0.1 npm start          # http://127.0.0.1:3000
npm run demo:m7                   # smoke test: build, start, /health, /ready, one run, SIGTERM; prints DEMO M7 OK
```

Security controls: [Security model](../security/README.md#hosted-demo-boundary) and [threat model §8](../security/threat-model.md#8-m7-hosted-demo-surface-29-september-2026).
