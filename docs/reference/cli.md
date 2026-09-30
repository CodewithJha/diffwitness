# CLI reference

The `diffwitness` binary has five commands: `init`, `baseline`, `check`, `explain` and `ci`. Everything below is checked against [`packages/diffwitness/src/cli/program.ts`](../../packages/diffwitness/src/cli/program.ts). Any other command (for example `history` or `watch`) is unknown and exits `2`.

- [Global options](#global-options)
- [`init`](#diffwitness-init) · [`baseline`](#diffwitness-baseline) · [`check`](#diffwitness-check) · [`explain`](#diffwitness-explain) · [`ci`](#diffwitness-ci)
- [Exit codes](#exit-codes) · [Interruption](#interruption) · [Change surface](#change-surface) · [JSON output](#json-output) · [Troubleshooting](#troubleshooting)

## Global options

Global options go before or after the command name.

| Option | Meaning |
|---|---|
| `-h`, `--help` | Help for the program or a command (`diffwitness check --help`). |
| `-V`, `--version` | Print the version. |
| `--repo <path>` | Repository to operate on. Default: the Git repository containing the current directory. |
| `--config <path>` | Config file. Default: `<repo>/.diffwitness/config.yaml`. A relative path is resolved from the current directory. |
| `--json` | Machine-readable JSON on stdout (`init`, `baseline`, `check`, `explain`; `ci` always prints JSON). |
| `--quiet` | Summary only: `check` prints just the status, `explain` prints `explained`, `explain_error` or `unavailable`, and `ci` drops its stderr summary. |
| `--verbose` | Accepted; currently has no effect. |

Unknown options, unexpected arguments and unknown commands print one `error: …` line on stderr and exit `2`.

## `diffwitness init`

Creates the `.diffwitness/` layout and a commented config template.

| Option | Meaning |
|---|---|
| `--force` | Overwrite an existing config. Evidence is kept. |
| `--wipe` | With `--force`, also reset the evidence layout directories. |

The template contains one placeholder workflow, `example`, running `node path/to/workflow.mjs`. `baseline` and `check` refuse to run it (exit `2`) until you edit `command`. See the [configuration reference](configuration.md).

Exit codes: `0` created; `2` already initialized (without `--force`) or not inside a Git repository.

```bash
diffwitness init
diffwitness init --force          # rewrite the template, keep evidence
```

## `diffwitness baseline`

Runs the configured workflows and stores the results as evidence, then records a baseline pointing at that evidence. Never calls AI.

| Option | Meaning |
|---|---|
| `--workflow <id>` | Run only this workflow. Repeatable. |
| `--force` | Replace the existing active baseline. Without it, an existing active baseline is an error. |

The baseline records the Git commit it was captured on and whether the working tree was dirty. Commit your changes and config first: a baseline captured from a dirty tree makes the [change surface](#change-surface) `not_comparable` later.

Exit codes: `0` baseline stored; `2` no config, template placeholder, no workflows, `execution.allowCommands: false`, or an active baseline exists without `--force`; `3` a workflow timed out, could not start, was killed by a signal, or a storage failure occurred (no baseline is stored); `130`/`143` interrupted.

```bash
diffwitness baseline
diffwitness baseline --force                     # re-baseline after an intended change
diffwitness baseline --workflow quote
```

## `diffwitness check`

Reruns the workflows and compares the new evidence with the active baseline, observation by observation, using SHA-256 digests. Never calls AI.

| Option | Meaning |
|---|---|
| `--fail-on <warn\|error\|never>` | Exit `1` when a finding at or above this severity exists. Default `never`: findings are printed and the exit code is `0`. |
| `--workflow <id>` | Compare only this workflow. Repeatable. Unselected workflows are not reported as disappeared. A selected workflow absent from the active baseline, or an unknown id, exits `2`. |
| `--base <ref>` | Recorded as the Git base identity only. It does not change what is compared. |
| `--allow-dirty` | Accepted for symmetry with `ci`; local `check` always allows a dirty tree. |

Output leads with a verdict line, then observation counts, a per-workflow table and each finding:

```text
BEHAVIOR CHANGED (status: findings)
Observations: 11 unchanged · 1 changed · 0 appeared · 0 disappeared

Workflows (2):
  quote  CHANGED    exit 0 (pass)  1 finding(s)
  tests  unchanged  exit 0 (pass)

Finding 1/1  [warn] quote · stdout — Normalized stdout changed (stdout_changed)
  Before:   {"subtotal":45,"shipping":5.99,"total":50.99}
  After:    {"subtotal":45,"shipping":0,"total":45}
  Evidence: baseline ev_56a566e3-… → current ev_1c10a4a5-…
  Changed alongside (Git): src/shipping.mjs (modified)
  Causality: not established
```

The status is one of `clean`, `findings` or `analysis_error`. An analysis error is never shown as clean. Before/After are bounded previews of the stored normalized output.

**Finding severity.** Changes to stdout, stderr or artifacts are `warn`. Exit-code changes are `error`.

| Finding severity | `--fail-on never` | `--fail-on warn` | `--fail-on error` |
|---|---|---|---|
| info | 0 | 0 | 0 |
| warn | 0 | 1 | 0 |
| error | 0 | 1 | 1 |

When `check` starts, it replaces `.diffwitness/runs/last-check.json` with an incomplete marker until it stores its own result, so a failed or interrupted check never leaves an older result behind for `explain`.

Exit codes: `0` clean, or findings below `--fail-on`; `1` findings at or above `--fail-on`; `2` no config, no active baseline, bad option, template placeholder; `3` analysis error; `130`/`143` interrupted.

```bash
diffwitness check
diffwitness check --fail-on warn          # exit 1 on any behavior change
diffwitness check --json > check.json
```

## `diffwitness explain`

Explains the last `check` result from a bounded, redacted evidence packet. It never changes the result: status, findings and severities come from the stored comparison.

| Option | Meaning |
|---|---|
| `--provider <mock\|featherless\|none>` | Override `ai.provider`. `mock` (default): deterministic offline template. `none`: no explanation; findings still shown. `featherless`: live model, needs `FEATHERLESS_API_KEY`; see [Featherless provider](featherless-provider.md). |
| `--run <id>` | Explain a specific stored comparison (`bd_…`) instead of the last check. |

Behavior by status: `clean` prints an honest "nothing to explain"; `analysis_error` refuses to give a clean bill of health; `findings` prints the findings first, then the explanation (facts citing evidence IDs, hedged hypotheses, caveats, `CAUSALITY: not established`).

Every model-generated string passes a wording gate that rejects causal claims ("caused", "because", "root cause", …) and, on analysis errors, claims such as "safe to merge". A rejected explanation is not printed. There is no silent fallback from Featherless to MockAI.

`explain` refuses stale results (exit `2`): `check_incomplete` when the most recent check failed or was interrupted, and `check_stale` when the stored comparison belongs to a baseline that has since been replaced. Re-run `diffwitness check`.

Exit codes: `0` explained, or provider `none`; `2` no prior check, stale or incomplete result, bad option; `4` explain error (provider failure, missing credentials, invalid or rejected explanation, packet over budget). `explain` never returns `1` or `3`.

```bash
diffwitness explain
diffwitness explain --json
diffwitness explain --provider featherless      # opt-in live model
```

## `diffwitness ci`

A non-interactive gate: runs a check against the active baseline and always prints versioned JSON on stdout (a human summary goes to stderr unless `--quiet` or `--json`). AI is off unless `--explain` is passed.

| Option | Meaning |
|---|---|
| `--fail-on <warn\|error\|never>` | Severity gate for exit `1`. **Default `error`**, so `warn` findings (such as a stdout change) are reported but do not fail CI unless you pass `--fail-on warn`. |
| `--allow-dirty` | Allow a source-dirty working tree. By default `ci` refuses one (exit `2`). |
| `--workflow <id>` | Same as `check --workflow`. Repeatable. |
| `--base <ref>` | Git identity hint only. |
| `--explain` | Run `explain` after the check. It can never change the status. |
| `--provider <mock\|featherless\|none>` | Provider for `--explain`. Default: `mock`. |
| `--json-out <file>` | Also write the JSON report to a file. |

**Dirty-tree policy.** Local `check` allows a dirty tree. `ci` requires a source-clean tree. The operational directories `.diffwitness/{evidence,blobs,baselines,runs,cache}/` never count as source changes; `.diffwitness/config.yaml` does, so commit it.

**Baseline model.** `ci` compares against the local active baseline (`.diffwitness/baselines/active.json`). There is no pull-request base or merge-base inference. Capture the baseline in the same job, or restore the `.diffwitness` directory, before gating. A sketch for GitHub Actions is in [Getting started](../getting-started.md#use-it-in-ci).

Exit codes: `0` acceptable; `1` findings at or above `--fail-on`; `2` user or config error (including no active baseline and a source-dirty tree); `3` analysis error; `4` explain error (only with `--explain`); `130`/`143` interrupted. With `--explain`, precedence is **`3` > `1` > `4` > `0`**: an explain failure never hides an analysis error or a gating finding.

```bash
diffwitness ci
diffwitness ci --fail-on warn
diffwitness ci --fail-on warn --json-out diffwitness-report.json
diffwitness ci --explain                  # optional MockAI explanation in the report
```

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success: clean, or findings below the `--fail-on` threshold |
| `1` | Findings at or above `--fail-on` (`check`, `ci`) |
| `2` | User, config or repository error: bad arguments, missing config, template placeholder, no active baseline, source-dirty `ci`, stale `explain` |
| `3` | Analysis error: a workflow timed out, failed to start or was killed by a signal DiffWitness did not send; missing artifact; corrupt or unknown-version storage |
| `4` | Explain error (`explain`, or `ci --explain`) |
| `130` | Interrupted by SIGINT (Ctrl-C) |
| `143` | Interrupted by SIGTERM |

Invariants: an analysis error never maps to clean; a missing baseline never maps to clean; an AI failure never maps to clean.

## Interruption

On SIGINT or SIGTERM, DiffWitness kills the running workflow's process group and saves nothing further. An interrupted `baseline` never creates or replaces the active baseline. An interrupted `check` or `ci` writes no evidence and no comparison, prints no verdict, and a later `explain` reports `check_incomplete`. A second signal exits immediately with the same code.

Only signals DiffWitness itself receives count as interruption. A workflow that exits `130` on its own is ordinary behavior. A workflow killed by a signal DiffWitness did not send is an analysis error (`3`), never evidence.

On Windows there are no process groups: only the direct child is killed.

## Change surface

After findings, `check`, `ci` and `explain` list the files Git reports as different from the baseline commit:

```text
Change surface (Git: baseline 662b7f0e491c → current 662b7f0e491c + working tree): 1 file(s)
  M  src/shipping.mjs  +1 -1  (hunks: -2 +2)
Association: 1 of 1 finding(s) co-occurred with this change surface (workflow quote @ source state 662b7f0e491c + working tree)
Causality: not established — change-surface membership means co-occurrence only, not that a file caused a finding.
```

- **What it covers:** committed, staged, unstaged and untracked-but-not-ignored files between the active baseline's commit and the executed state. `+/-` counts and hunk ranges are change metadata, never behavioral evidence.
- **Association:** `associated` only when the Git states are comparable, the executed state matched the surface before and after execution, and the finding cites current evidence. It never changes findings, severity, status or exit codes.
- **`not_comparable`:** the baseline was captured from a dirty tree (commit, then `baseline --force`), a commit SHA is missing, or the baseline commit is not present locally. **`unavailable`:** Git failed, or the repository changed while workflows ran.
- **Excluded:** gitignored files and the operational `.diffwitness/` directories.
- **Limits:** 200 files, 500 hunk locations, 512-character paths, 64,000 serialized characters, 4 MiB of Git output per command. Any reduction is flagged as truncated. The terminal shows at most 10 files.

## JSON output

`check --json`, `explain --json` and `ci` print versioned JSON (`schemaVersion: 2`) with deterministic ordering and no ANSI codes. The `ci` report contains `status`, `baseline`, `current`, `behavioralDiff` (including `changeSurface`), `findings` (including `associationStatus` and `changeSurfaceRefs`), `evidenceRefs`, `ai`, `limitations` (including `causality: "not_established"`) and `metadata`. Volatile timestamps appear only under `metadata.generatedAt`, labeled `volatile: true`.

## Troubleshooting

| Symptom | What to do |
|---|---|
| `Config not found` (exit 2) | Run `diffwitness init` in the repository, or pass `--config`. |
| `still uses the template command` (exit 2) | Edit `workflows[].command` in `.diffwitness/config.yaml`. |
| `Not a Git repository` (exit 2) | Run inside a Git repository, or pass `--repo`. |
| `Failed to resolve HEAD SHA` (exit 2) | The repository has no commits yet. Commit, then retry. |
| `No active baseline` (exit 2) | Run `diffwitness baseline` first. |
| `Active baseline already exists` (exit 2) | Use `diffwitness baseline --force` to replace it. |
| `ci` exits 2 on a source-dirty tree | Commit your changes, or pass `--allow-dirty`. |
| Exit 3 | A workflow timed out, could not start, was killed, or storage is corrupt. This is not a clean result. |
| `explain` exits 2 with `check_incomplete` or `check_stale` | Re-run `diffwitness check`. |
| Findings, but `ci` exits 0 | `ci` defaults to `--fail-on error`; pass `--fail-on warn`. |
| Every run reports a change | Output is not deterministic. Drop volatile lines with `normalize.ignoreLinePatterns`. |
| Change surface `not_comparable` | The baseline came from a dirty tree: commit, then `diffwitness baseline --force`. |
