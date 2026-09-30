# Getting started

This guide installs the CLI from source, runs the example, and then sets DiffWitness up on your own repository.

## Requirements

- Node.js 20 or newer (CI tests 20, 22 and 24)
- Git on `PATH`
- macOS or Linux. Windows is not supported (see [Limitations](../README.md#limitations)).

## Install

DiffWitness is not published to the npm registry yet. Build it from source:

```bash
git clone https://github.com/CodewithJha/diffwitness.git
cd diffwitness
npm ci
npm run build        # installs and builds packages/diffwitness
```

Then choose one way to get a `diffwitness` command.

**Link it globally** (simplest for trying it out):

```bash
cd packages/diffwitness
npm link             # puts `diffwitness` on your PATH, pointing at this checkout
diffwitness --version
```

Undo with `npm rm -g diffwitness`. Rebuild (`npm run build`) after pulling changes.

**Install a packed tarball into one project** (pins a version per project):

```bash
cd packages/diffwitness
npm pack                                   # writes diffwitness-0.1.0.tgz
cd /path/to/your/repo
npm install --save-dev /path/to/diffwitness/packages/diffwitness/diffwitness-0.1.0.tgz
npx diffwitness --version
```

**Run it once without installing:**

```bash
npx --package /path/to/diffwitness-0.1.0.tgz diffwitness --version
```

## Quick start: the example

From the repository root:

```bash
bash examples/behavioral-change/run.sh
```

This copies a small project into a temporary Git repository, captures a baseline, changes one constant, shows that the project's tests still pass, and runs `diffwitness check`, which reports the quote changing from `{"subtotal":45,"shipping":5.99,"total":50.99}` to `{"subtotal":45,"shipping":0,"total":45}`. The [example README](../examples/behavioral-change/README.md) walks through each step by hand.

## Use it on your own repository

### 1. Initialize

```bash
cd /path/to/your/repo          # must be a Git repository with at least one commit
diffwitness init
```

`init` writes a commented `.diffwitness/config.yaml` and a `.diffwitness/.gitignore` for the local evidence directories.

### 2. Choose workflows

A workflow is a command whose output you care about. Good candidates print something deterministic: a report, a CLI's output for fixed input, a JSON API response from a fixture, or your test suite. Edit the placeholder:

```yaml
version: 1
baseRef: main
workflows:
  - id: report
    command: ["node", "scripts/print-report.mjs"]     # argv, no shell
    timeoutMs: 30000
  - id: tests
    command: ["npm", "test", "--silent"]
    normalize:
      ignoreLinePatterns: ["^# duration", "\\d+ms"]    # drop volatile lines
```

Commands are argv lists run from the repository root without a shell, so pipes and `&&` don't work; wrap them in a script. Output must be deterministic: timestamps, durations and random ids show up as changes unless you drop them with `normalize.ignoreLinePatterns`. Every field is in the [configuration reference](reference/configuration.md).

### 3. Commit the config and capture a baseline

```bash
git add .diffwitness && git commit -m "Add DiffWitness config"
diffwitness baseline
```

Commit first: a baseline from a dirty tree can't be related to later Git changes.

### 4. Change code, then check

```bash
# ...edit code...
diffwitness check
```

`check` reruns the workflows and reports `NO BEHAVIOR CHANGE`, `BEHAVIOR CHANGED` with a before/after per finding, or `ANALYSIS ERROR` (a timeout or crash; never shown as clean). Findings list the files Git says changed alongside them, as co-occurrence only.

Useful next steps:

```bash
diffwitness check --fail-on warn     # exit 1 if any behavior changed
diffwitness explain                  # offline MockAI explanation of the evidence
diffwitness baseline --force         # accept the new behavior as the reference
```

Evidence lives in `.diffwitness/` (gitignored). See the [CLI reference](reference/cli.md) for every command and exit code.

## Use it in CI

`ci` compares against the local active baseline, so capture it on the base commit in the same job. There is no merge-base or pull-request inference. The equivalent local sequence is covered by the test suite; this workflow is a sketch you adapt:

```yaml
# .github/workflows/diffwitness.yml
name: diffwitness
on: pull_request
permissions:
  contents: read
jobs:
  behavior:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v7
        with: { node-version: 22 }
      - name: Install DiffWitness outside the checkout (packed tarball committed under tools/)
        run: |
          npm install --prefix "$RUNNER_TEMP/diffwitness" ./tools/diffwitness-0.1.0.tgz
          echo "$RUNNER_TEMP/diffwitness/node_modules/.bin" >> "$GITHUB_PATH"
      - name: Baseline on the PR base
        run: |
          git checkout --detach ${{ github.event.pull_request.base.sha }}
          diffwitness baseline
      - name: Check the PR head
        run: |
          git checkout --detach ${{ github.event.pull_request.head.sha }}
          diffwitness ci --fail-on warn
```

`.diffwitness/config.yaml` must exist on both commits, and `ci` refuses a source-dirty tree, so install tools outside the checkout. `ci` prints versioned JSON on stdout and exits `0` (acceptable), `1` (findings at or above `--fail-on`), `2` (user or config error), `3` (analysis error) or `4` (explain error); precedence `3 > 1 > 4 > 0`.

## Optional: explanations

`diffwitness explain` uses MockAI by default: a deterministic offline template, no network, no key. To use a live model instead, set `ai.provider: featherless` and export your own `FEATHERLESS_API_KEY`; see [Featherless provider](reference/featherless-provider.md). Either way the explanation can't change findings, status or exit codes.
