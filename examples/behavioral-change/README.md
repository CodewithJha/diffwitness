# Example: a behavior change the tests don't catch

A tiny shipping-quote project. Its unit tests check the shape of a quote and input validation, but not the numbers. You lower the free-shipping threshold from 50 to 40. The tests still pass, yet the quote for the sample cart changes. DiffWitness reports it with before/after evidence.

Every result comes from running DiffWitness. Nothing in this directory contains stored DiffWitness output.

```text
project/
  src/shipping.mjs          quote(items): subtotal, shipping, total (FREE_SHIPPING_THRESHOLD = 50)
  bin/quote.mjs             prints the quote for data/cart.json as one JSON line
  data/cart.json            the sample cart (subtotal 45)
  test/shipping.test.mjs    4 unit tests; none pins the quoted numbers
diffwitness.config.yaml     two workflows: quote (node bin/quote.mjs) and tests (node --test)
run.sh                      runs every step below in a throwaway Git repository
```

## Run it in one command

From the repository root:

```bash
npm ci && npm run build
bash examples/behavioral-change/run.sh
```

The script copies `project/` into a fresh temporary Git repository, so it never modifies this repository. It ends with `EXAMPLE OK`. Set `KEEP=1` to keep the temporary repository for inspection, and `DIFFWITNESS_BIN=$(command -v diffwitness)` to use a linked CLI instead of `packages/diffwitness/dist`.

The same script runs in the test suite (`packages/diffwitness/tests/example-behavioral-change.test.ts`).

## Walk through it by hand

You need a `diffwitness` command. Either link the package once (see [Getting started](../../docs/getting-started.md#install)):

```bash
cd packages/diffwitness && npm link && cd ../..
```

or define a shell function for this session (run from the repository root):

```bash
DW_CLI="$PWD/packages/diffwitness/dist/cli/main.js"
diffwitness() { node "$DW_CLI" "$@"; }
```

### 1. Before: a project with passing tests

DiffWitness compares Git states, so the example needs its own repository. From the repository root, copy it somewhere outside this repository:

```bash
EXAMPLE="$PWD/examples/behavioral-change"
WORK=$(mktemp -d)
cp -R "$EXAMPLE/project/." "$WORK"
cd "$WORK"
git init -q -b main
git add -A && git commit -qm "shipping quote project"
node bin/quote.mjs          # {"subtotal":45,"shipping":5.99,"total":50.99}
```

If Git has no identity configured on your machine, add `-c user.name=you -c user.email=you@example.com` after `git`.

### 2. Configure DiffWitness

```bash
diffwitness init                                                # writes .diffwitness/config.yaml (a template)
cp "$EXAMPLE/diffwitness.config.yaml" .diffwitness/config.yaml  # use the example's two workflows instead
git add .diffwitness && git commit -qm "diffwitness config"
```

A workflow is an argv command (no shell) whose output you care about. Here `quote` prints the customer-facing quote and `tests` runs the project's own test suite.

### 3. Baseline

```bash
diffwitness baseline
```

This runs both workflows and stores their exit codes and normalized stdout/stderr as evidence under `.diffwitness/evidence/` (each with a SHA-256 digest and an `ev_…` ID). The baseline pins that evidence as the reference.

### 4. The change

```bash
sed -i.bak 's/FREE_SHIPPING_THRESHOLD = 50;/FREE_SHIPPING_THRESHOLD = 40;/' src/shipping.mjs && rm src/shipping.mjs.bak
git diff
```

### 5. The tests still pass

```bash
node --test test/shipping.test.mjs     # pass 4, fail 0
```

### 6. Check

```bash
diffwitness check
```

`check` reruns the workflows and compares digests against the baseline. You should see `BEHAVIOR CHANGED`, the `tests` workflow `unchanged` and passing, and one finding on `quote · stdout`:

```text
Before:   {"subtotal":45,"shipping":5.99,"total":50.99}
After:    {"subtotal":45,"shipping":0,"total":45}
Changed alongside (Git): src/shipping.mjs (modified)
Causality: not established
```

"Changed alongside" is co-occurrence: Git says that file differs from the baseline commit. DiffWitness never claims a file caused a finding.

### 7. Evidence

The finding cites two evidence IDs: the baseline run and the current run. Each is a JSON file you can open:

```bash
ls .diffwitness/evidence/
cat .diffwitness/runs/last-check.json     # the stored comparison, including finding.evidenceIds
```

Inside an evidence file, the `stdout` observation holds the digest the comparison used and a bounded preview of the normalized output.

### 8. Explain (optional)

```bash
diffwitness explain
```

The default explainer is MockAI: a deterministic, offline template with no network access and no API key. It only narrates the evidence packet. It can't change the finding, the status, or the exit code.

### 9. Use it as a gate

```bash
diffwitness check --fail-on warn; echo "exit=$?"    # exit=1: behavior changed
```

In CI, use `diffwitness ci` instead (see the [CLI reference](../../docs/reference/cli.md#diffwitness-ci)).

### Clean up

```bash
cd - && rm -rf "$WORK"
```
