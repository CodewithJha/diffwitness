# DiffWitness

**A local-first behavioral intelligence CLI that detects observable behavior changes that ordinary tests and Git diffs can miss.**

```text
 your commands          evidence               after a code change
┌──────────────┐    ┌────────────────┐    ┌──────────────────────────────────────┐
│ workflows    │ -> │ baseline       │ -> │ check: rerun, deterministic diff     │
│ (argv, no    │    │ SHA-256 digest │    │   findings: before / after values    │
│  shell)      │    │ + redacted     │    │   evidence IDs, Git change surface   │
└──────────────┘    │ preview per    │    │   causality: not established         │
                    │ observation    │    └──────────────────┬───────────────────┘
                    └────────────────┘                       │ optional
                                                             v
                                          explain: bounded, redacted evidence packet
                                          (MockAI offline by default; cannot change results)
```

- **Live demo:** https://diffwitness.onrender.com
- **Source:** https://github.com/CodewithJha/diffwitness

## Why

A one-line change to a constant ships. The unit tests pass, and the diff looks harmless:

```diff
-export const DISCOUNT = 0.1;
+export const DISCOUNT = 0.2;
```

The tests check the shape of the result, not the value. The Git diff shows *what text* changed, not *what the program now does*. Nobody notices that the quote for the same order went from **315 to 280** until a customer does.

DiffWitness runs the commands whose output you care about, stores the results as evidence, and after a change reports exactly which observable behavior changed, with before/after values and evidence IDs. It never guesses and never claims a file *caused* a change.

This is real output from `diffwitness check` on that change (`npm run demo` reproduces it):

```text
BEHAVIOR CHANGED (status: findings)
Observations: 11 unchanged · 1 changed · 0 appeared · 0 disappeared

Workflows (2):
  pricing  CHANGED    exit 0 (pass)  1 finding(s)
  tests    unchanged  exit 0 (pass)

Finding 1/1  [warn] pricing · stdout — Normalized stdout changed (stdout_changed)
  Before:   {"total":315}
  After:    {"total":280}
  Evidence: baseline ev_c5656baf-… → current ev_36196e16-…
  Changed alongside (Git): src/pricing.mjs (modified)
  Causality: not established
```

The `tests` workflow is the project's own test suite. It is unchanged and passing, and that is the point.

![The DiffWitness hosted demo after a run: the tests pass, the verdict reads BEHAVIOR CHANGED, and the pricing total moves from 315 to 280](docs/assets/demo.png)

| | What it tells you | What it misses |
|---|---|---|
| **Git diff** | Which lines of text changed | What the program now *does* |
| **Unit tests** | Whether the assertions you wrote still hold | Everything you didn't assert, like the exact total above |
| **Snapshot tests** | That a stored snapshot no longer matches | Needs a test per output; no link to evidence or to the change |
| **DiffWitness** | Which observable outputs of real commands changed, with before/after values, evidence IDs and the files that changed alongside | Anything your workflows don't exercise; *why* it changed (it reports co-occurrence, not cause) |

DiffWitness sits next to your tests; it doesn't replace them.

## Install

Requirements: Node.js 20 or newer, Git, macOS or Linux. DiffWitness is not published to the npm registry yet, so build it from source:

```bash
git clone https://github.com/CodewithJha/diffwitness.git
cd diffwitness
npm ci
npm run build                          # installs and builds packages/diffwitness
cd packages/diffwitness && npm link    # puts `diffwitness` on your PATH
diffwitness --version                  # 0.1.0
```

To pin a version per project instead, install a packed tarball (`npm pack` in `packages/diffwitness`, then `npm install --save-dev <path>/diffwitness-0.1.0.tgz`). All options are in [Getting started](docs/getting-started.md#install).

## Quick start

From the repository root, after `npm run build`:

```bash
bash examples/behavioral-change/run.sh
```

The script copies a small shipping-quote project into a temporary Git repository, captures a baseline, lowers the free-shipping threshold from 50 to 40, shows that the project's tests still pass, and runs `diffwitness check`:

```text
Finding 1/1  [warn] quote · stdout — Normalized stdout changed (stdout_changed)
  Before:   {"subtotal":45,"shipping":5.99,"total":50.99}
  After:    {"subtotal":45,"shipping":0,"total":45}
  ...
  Changed alongside (Git): src/shipping.mjs (modified)
  Causality: not established
```

The [example README](examples/behavioral-change/README.md) walks through the same steps by hand.

## Use it on your repository

```bash
cd /path/to/your/repo                  # a Git repository with at least one commit
diffwitness init                       # writes a commented .diffwitness/config.yaml
# edit the placeholder workflow: a command whose output you care about
git add .diffwitness && git commit -m "Add DiffWitness config"
diffwitness baseline                   # run workflows, store evidence
# ...change code...
diffwitness check                      # what behavior changed, with evidence
diffwitness explain                    # offline explanation of that evidence (MockAI)
diffwitness check --fail-on warn       # exit 1 if any behavior changed
diffwitness baseline --force           # accept the new behavior as the reference
```

A minimal config:

```yaml
version: 1
baseRef: main
workflows:
  - id: report
    command: ["node", "scripts/print-report.mjs"]   # argv, run without a shell
  - id: tests
    command: ["npm", "test", "--silent"]
    normalize:
      ignoreLinePatterns: ["\\d+ms"]                 # drop volatile lines
```

Output must be deterministic: timestamps, durations and random IDs show up as changes unless you normalize them away. [Getting started](docs/getting-started.md) covers choosing workflows and running DiffWitness in CI.

## CLI

| Command | What it does |
|---|---|
| `diffwitness init` | Create `.diffwitness/config.yaml` and the local evidence layout |
| `diffwitness baseline` | Run the workflows and store the evidence as the active baseline (`--force` to supersede) |
| `diffwitness check` | Rerun the workflows and compare against the baseline (`--fail-on warn\|error\|never`, default `never`) |
| `diffwitness explain` | Explain the last check from its evidence (`--provider mock\|featherless\|none`) |
| `diffwitness ci` | Non-interactive gate: JSON on stdout, refuses a source-dirty tree, `--fail-on` defaults to `error` |

Global options: `--repo`, `--config`, `--json`, `--quiet`. Exit codes: `0` acceptable, `1` findings at or above `--fail-on`, `2` user or config error, `3` analysis error, `4` explain error, `130`/`143` interrupted; for `ci` the precedence is `3 > 1 > 4 > 0`. See the [CLI reference](docs/reference/cli.md) and the [configuration reference](docs/reference/configuration.md).

## Evidence model

- Each workflow run records its exit code, normalized stdout and stderr, and any listed artifact files as separate **observations**.
- Normalization is explicit and configured: ANSI stripping, line endings, ignored line patterns, optional line sorting, masking of listed environment values, and a size cap.
- Each observation is stored as an evidence record (`ev_…`) with a SHA-256 digest and a short redacted preview. Full content goes to a content-addressed blob store under `.diffwitness/` (gitignored).
- `check` compares digests. The result is `clean`, `findings` or `analysis_error`; a timeout or crash is an analysis error and is never reported as clean.
- Files that Git reports as changed since the baseline commit are listed beside findings as **co-occurrence only**. Every finding says `Causality: not established`.

## AI architecture

AI is optional and never decides anything. The deterministic diff engine alone decides findings, status, evidence and exit codes.

- `explain` builds a bounded, redacted **evidence packet** (finding summaries, evidence IDs, digests, previews, changed file paths). A provider sees only that packet: no file contents, no keys.
- The default provider is **MockAI**, a deterministic offline template: no network, no key. The hosted demo uses only MockAI.
- **Featherless** is an optional live model. It runs only if you choose it and export your own `FEATHERLESS_API_KEY`. `none` turns explanations off.
- Model output passes a wording gate that rejects causal claims ("caused", "root cause", …) and "safe to merge" claims on an analysis error. A rejected explanation is never shown. The gate filters wording; it does not prove the model is right.
- `ci` runs with AI off unless you pass `--explain`, and an AI failure never turns a result clean.

Details: [AI architecture](docs/architecture/ai.md).

## Security model

- Workflows are argv commands spawned without a shell, in their own process group, with a timeout and a scrubbed environment (`envPolicy`).
- Git is invoked with a minimal environment, validated refs, and external diff and text conversion disabled.
- Evidence masks the values of environment variables you list in `normalize.redactEnv`. Explanation packets are additionally redacted for common credential shapes (bearer tokens, JWTs, AWS keys, `token=`/`password=` assignments) before any provider sees them.
- Evidence blobs are content-addressed and never overwritten.
- DiffWitness runs the commands in *your* config. It is not a sandbox for untrusted repositories.

The full list of controls, and where each lives in the code, is in the [security model](docs/security/README.md) and [threat model](docs/security/threat-model.md). Report vulnerabilities privately: [SECURITY.md](SECURITY.md).

## Hosted demo

The hosted demo is a controlled demonstration, not a simulation: it runs the same DiffWitness CLI and engine you install locally, on a built-in scenario, in a fresh temporary Git repository, so anyone can reproduce the result safely.

Its limits are deliberate: it runs only the built-in scenario, never executes visitor input or visitor repositories, uses MockAI only, and has no accounts, database or tracking. To analyze your own code, run the CLI locally. See the [hosted demo reference](docs/reference/hosted-demo.md) and [deployment guide](docs/DEPLOYMENT.md).

## Limitations

- Evidence is only as good as your workflows. Behavior they don't exercise is invisible.
- Output must be deterministic, or volatile lines must be normalized away.
- Comparison is against a stored local baseline: no pull-request merge-base inference and no history browsing.
- Findings are linked to changed files by co-occurrence, never causality. There is no symbol-level attribution.
- Workflows run one at a time; there is no watch mode.
- Evidence accumulates under `.diffwitness/` with no automatic pruning.
- Windows is not supported (evidence blob filenames contain `:`, and there are no process groups).

## Related work

- **Snapshot and approval testing** (Jest snapshots, ApprovalTests) compare stored output inside a test framework. DiffWitness works on arbitrary commands outside any framework, keeps evidence IDs, and links findings to the Git change surface.
- **CLI transcript tests** (cram, trycmd) assert expected output written by hand. DiffWitness records the baseline for you and reports what moved.
- **[RealDiff](https://github.com/issacnitin/RealDiff)** produces runtime behavior diffs for pull requests using multi-language instrumentation. DiffWitness is a small local CLI over command-level evidence.
- DiffWitness was developed under the working name "SemaDiff". That name is also used by unrelated projects.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md); for questions, see [SUPPORT.md](SUPPORT.md).

## Development

```bash
npm ci && npm run build
npm test              # node:test suite for packages/diffwitness
npm run typecheck
npm run demo          # the pricing example end to end
npm start             # hosted demo on http://127.0.0.1:3000 (after build)
```

The [development guide](docs/development/README.md) covers the layout, every script, tests and packaging. The [architecture overview](docs/architecture/README.md) explains the layers. All docs are indexed in [docs/README.md](docs/README.md).

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) and the [changelog](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE)
