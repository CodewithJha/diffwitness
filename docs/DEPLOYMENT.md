# Deploying the DiffWitness hosted demo

The hosted demo is one Node.js process with no database, no disk persistence, no API keys, and no provider SDKs. Any host that can run `npm` and has `git` on `PATH` works. There are no provider-specific files in this repository. What the demo does and its API: [Hosted demo reference](reference/hosted-demo.md).

## Requirements

| | |
|---|---|
| Runtime | Node.js **20+** (tested on 20.20 and 26.3) |
| System tools | `git` **≥ 2.28** on `PATH` (the demo creates a temporary Git repository per request) |
| OS | POSIX (Linux or macOS). Windows is not supported for the hosted demo. |
| Resources | Small: one run takes ~1 s and a few MB of temp disk, removed after the run. 512 MB RAM is plenty. |
| Network | Inbound HTTP only. The demo makes no outbound calls. |

## Commands (from the repository root)

```bash
npm install && npm run build     # build: installs packages/diffwitness dev deps (TypeScript) even if NODE_ENV=production
npm start                        # node packages/diffwitness/dist/hosted/server.js
```

- **Root directory:** repository root (not `packages/diffwitness`).
- **Build command:** `npm install && npm run build` (or `npm ci && npm run build`; a root lockfile is committed).
- **Start command:** `npm start`
- **Health check path:** `/ready` for readiness (503 until `git` is confirmed; 503 forever if `git` is missing). `/health` is liveness only (200 whenever the process is up).

## Environment

All optional. Invalid values stop startup with an error naming the variable. See `.env.example`.

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `3000` | Most hosts inject this; leave it to the platform. |
| `HOST` | `0.0.0.0` | Keep the default in containers/PaaS. |
| `NODE_ENV` | — | `production` is fine; the build still installs dev dependencies it needs. |
| `DEMO_MAX_CONCURRENT` | `2` | Extra requests get `503` + `Retry-After` (no queue). |
| `DEMO_REQUEST_TIMEOUT_MS` | `30000` | Per `POST /api/demo`. |
| `DEMO_STAGE_TIMEOUT_MS` | `15000` | Per child process. |
| `DEMO_WORKSPACE_TTL_MS` | `120000` | Must be ≥ request timeout + 5 s. |
| `DEMO_MAX_OUTPUT_BYTES` | `262144` | Per stream, per child. |
| `DEMO_MAX_BODY_BYTES` | `1024` | Request body cap. |
| `DEMO_SHUTDOWN_GRACE_MS` | `10000` | Drain time on SIGTERM. |

Do **not** set `FEATHERLESS_API_KEY` on the host. The demo never reads or forwards it; it uses MockAI only.

## Cold starts

Hosts that sleep idle instances (free tiers) add a cold start of several seconds to the first request after idle. The page loads `/api/scenarios` first; if the demo button stays disabled for a few seconds, that is the cold start. To avoid it, use an always-on instance or an external uptime ping on `/health` if the host's terms allow it.

## Example host steps

These are illustrations of the generic settings above. Nothing here is required by the code.

- **Render (Web Service, Node):** connect the repository → Root Directory empty → Build `npm install && npm run build` → Start `npm start` → Health Check Path `/ready`. After the first deploy, `/ready` confirms whether `git` is available in the runtime.
- **Railway / other Nixpacks or buildpack hosts:** set Build and Start commands as above; confirm `git` is present (add it as a system package if the image lacks it — `/ready` will tell you).
- **Fly.io / any container host:** use a Node 20+ base image that includes `git` (e.g. a Debian-based `node:20` image), run the two commands, expose `PORT`, and point the HTTP health check at `/ready`.
- **Plain VM:** install Node 20+ and git, clone, run the commands under a process manager (systemd), put a reverse proxy with TLS in front.

## Post-deploy verification

Replace `$BASE` with the public URL.

```bash
BASE=https://your-demo.example

curl -fsS "$BASE/health"                     # {"status":"ok"}
curl -fsS "$BASE/ready"                      # {"status":"ready","checks":{"git":"ok"}}
curl -fsS "$BASE/api/scenarios"              # one scenario: pricing-discount-change

# one full run: expect HTTP 200, status completed, the 315 → 280 headline
curl -sS -X POST "$BASE/api/demo" -H 'Content-Type: application/json' \
  -d '{"scenario":"pricing-discount-change"}' \
  | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>{const r=JSON.parse(s);console.log(r.status, "|", r.summary && r.summary.headline)})'

# repeat a few times: identical headline each time, only ids/durations differ
for i in 1 2 3; do curl -sS -o /dev/null -w '%{http_code} %{time_total}s\n' -X POST "$BASE/api/demo" \
  -H 'Content-Type: application/json' -d '{"scenario":"pricing-discount-change"}'; done

# concurrency: 10 parallel requests → a mix of 200 and bounded 503 (never 500)
seq 10 | xargs -P10 -I{} curl -sS -o /dev/null -w '%{http_code}\n' -X POST "$BASE/api/demo" \
  -H 'Content-Type: application/json' -d '{"scenario":"pricing-discount-change"}' | sort | uniq -c

# input is never executed: extra fields are rejected with 400
curl -sS -o /dev/null -w '%{http_code}\n' -X POST "$BASE/api/demo" \
  -H 'Content-Type: application/json' -d '{"scenario":"pricing-discount-change","command":"id"}'
```

Then open `$BASE` in a browser, click **Run investigation**, and check that the verdict readout shows **BEHAVIOR CHANGED** (baseline 315 → current 280), the investigation rail completes, and the Detected pane lists one finding on `pricing · stdout` with the tests unchanged. Check on a phone-width window as well.

**Failure path (local only):** `DEMO_STAGE_TIMEOUT_MS=200 npm start` (200 is the minimum) then run the demo — the baseline stage exceeds the limit, the page shows a `stage_timeout` failure message, the server returns `504`, and the temp workspace is removed. Don't set this on the public host.

## Checklist

- [ ] The host builds from the public repository
- [ ] Service created with the build/start commands and `/ready` health check above
- [ ] No secrets configured on the host
- [ ] Post-deploy verification passes (all commands above)
- [ ] Demo URL in `README.md` matches the deployment
