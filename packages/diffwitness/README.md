# diffwitness

A local-first behavioral intelligence CLI that detects observable behavior changes that ordinary tests and Git diffs can miss.

DiffWitness runs the commands whose output you care about, stores the results as evidence (SHA-256 digests plus short redacted previews), and after a code change reports which observable behavior changed, with before/after values, evidence IDs, and the files Git says changed alongside (co-occurrence, never causality). An optional explainer (offline MockAI by default) can describe the evidence but never decides findings, status or exit codes.

Project home, full documentation and the example: https://github.com/CodewithJha/diffwitness

## Requirements

- Node.js 20 or newer
- Git on `PATH`
- macOS or Linux (Windows is not supported)

## Install

Not published to the npm registry yet. From a clone of the repository:

```bash
npm ci && npm run build              # at the repository root
cd packages/diffwitness && npm link  # `diffwitness` on your PATH
```

Or install a packed tarball into a project: `npm pack` here, then `npm install --save-dev <path>/diffwitness-0.1.0.tgz` and use `npx diffwitness`.

## Usage

```bash
cd /path/to/your/repo                # a Git repository with at least one commit
diffwitness init                     # writes a commented .diffwitness/config.yaml
# edit the placeholder workflow, then commit the config
diffwitness baseline                 # run workflows, store evidence
# ...change code...
diffwitness check                    # what behavior changed, with evidence
diffwitness explain                  # offline explanation of that evidence
diffwitness ci --fail-on warn        # CI gate: JSON on stdout, exit 1 on findings
```

`npm run demo` in this directory runs the pricing example in `fixtures/pricing` end to end: the unit tests still pass after a one-line change, and `check` reports `{"total":315}` → `{"total":280}`.

## Commands

| Command | What it does |
|---|---|
| `init` | Create `.diffwitness/config.yaml` and the local evidence layout (`--force`, `--wipe`) |
| `baseline` | Run workflows and store the evidence as the active baseline (`--workflow`, `--force`) |
| `check` | Rerun workflows and compare against the baseline (`--workflow`, `--fail-on warn\|error\|never`) |
| `explain` | Explain the last check from its evidence (`--provider mock\|featherless\|none`, `--run`) |
| `ci` | Non-interactive gate; refuses a source-dirty tree (`--fail-on`, default `error`; `--allow-dirty`, `--explain`, `--json-out`) |

Global options: `--repo <path>`, `--config <path>`, `--json`, `--quiet`.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Acceptable: clean, or findings below `--fail-on` |
| 1 | Findings at or above `--fail-on` |
| 2 | User, config or repository error (including a missing baseline) |
| 3 | Analysis or execution failure; never reported as clean |
| 4 | Explain failure |
| 130 / 143 | Interrupted by SIGINT / SIGTERM; nothing is saved |

With `ci --explain` the precedence is `3 > 1 > 4 > 0`.

## Documentation

- [Getting started](https://github.com/CodewithJha/diffwitness/blob/main/docs/getting-started.md)
- [CLI reference](https://github.com/CodewithJha/diffwitness/blob/main/docs/reference/cli.md)
- [Configuration reference](https://github.com/CodewithJha/diffwitness/blob/main/docs/reference/configuration.md)
- [Security model](https://github.com/CodewithJha/diffwitness/blob/main/docs/security/README.md)
- [Development guide](https://github.com/CodewithJha/diffwitness/blob/main/docs/development/README.md)

DiffWitness executes the workflow commands in your repository's config. It is not a sandbox for untrusted repositories.

## License

MIT
