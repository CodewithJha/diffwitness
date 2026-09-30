#!/usr/bin/env bash
# Runs the behavioral-change example end to end in a throwaway Git repository:
# baseline → one-line change → tests still pass → check → evidence → explain → gate.
# Nothing is written inside this repository. Every result below is computed by DiffWitness.
#
# Usage (repository root, after `npm ci && npm run build`):
#   bash examples/behavioral-change/run.sh
# Environment:
#   DIFFWITNESS_BIN=/path/to/diffwitness   use another CLI executable (e.g. from `npm link`)
#   KEEP=1                                 keep the temporary repository for inspection
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
DIST_CLI="$ROOT/packages/diffwitness/dist/cli/main.js"

if [ -z "${DIFFWITNESS_BIN:-}" ] && [ ! -f "$DIST_CLI" ]; then
  echo "error: $DIST_CLI not found. Run \`npm ci && npm run build\` in the repository root, or set DIFFWITNESS_BIN." >&2
  exit 2
fi

dw() {
  if [ -n "${DIFFWITNESS_BIN:-}" ]; then
    "$DIFFWITNESS_BIN" --repo "$WORK" "$@"
  else
    node "$DIST_CLI" --repo "$WORK" "$@"
  fi
}
g() { git -C "$WORK" -c user.name=Example -c user.email=example@example.com -c commit.gpgsign=false "$@"; }
say() { printf '\n== %s ==\n' "$1"; }

WORK="$(mktemp -d "${TMPDIR:-/tmp}/diffwitness-example-XXXXXX")"
cleanup() { if [ "${KEEP:-0}" = "1" ]; then echo "kept: $WORK"; else rm -rf "$WORK"; fi; }
trap cleanup EXIT

say "1. Before: a small project with passing tests, committed to a fresh Git repository"
cp -R "$HERE/project/." "$WORK"
git -C "$WORK" init -q -b main
g add -A
g commit -qm "shipping quote project"
(cd "$WORK" && node bin/quote.mjs)

say "2. diffwitness init, then install the example's workflow config"
dw init >/dev/null
cp "$HERE/diffwitness.config.yaml" "$WORK/.diffwitness/config.yaml"
g add .diffwitness
g commit -qm "diffwitness config"
echo "workflows: quote (node bin/quote.mjs), tests (node --test)"

say "3. diffwitness baseline"
dw baseline

say "4. The change: free-shipping threshold 50 -> 40"
sed -i.bak 's/FREE_SHIPPING_THRESHOLD = 50;/FREE_SHIPPING_THRESHOLD = 40;/' "$WORK/src/shipping.mjs"
rm "$WORK/src/shipping.mjs.bak"
grep -q 'FREE_SHIPPING_THRESHOLD = 40;' "$WORK/src/shipping.mjs" || { echo "error: the change was not applied" >&2; exit 1; }
g --no-pager diff --no-color

say "5. The project's tests still pass"
(cd "$WORK" && node --test --test-reporter=dot test/shipping.test.mjs)
echo "tests: exit 0"

say "6. diffwitness check"
dw check

say "7. The stored evidence behind each finding"
node - "$WORK/.diffwitness" <<'EOF'
const fs = require("node:fs");
const path = require("node:path");
const dir = process.argv[2];
const diff = JSON.parse(fs.readFileSync(path.join(dir, "runs", "last-check.json"), "utf8")).behavioralDiff;
for (const finding of diff.findings) {
  console.log(`${finding.id} (${finding.severity}, ${finding.workflowId} · ${finding.observationKey})`);
  for (const id of finding.evidenceIds) {
    const ev = JSON.parse(fs.readFileSync(path.join(dir, "evidence", `${id}.json`), "utf8")).evidence;
    const obs = ev.observations.find((o) => o.key === finding.observationKey);
    const preview = obs?.normalized?.preview ?? obs?.rawPreview ?? "";
    console.log(`  ${id}  ${obs?.valueDigest ?? ""}  ${JSON.stringify(preview)}`);
  }
}
EOF

say "8. diffwitness explain (MockAI: deterministic, offline)"
dw explain

say "9. Gate: check --fail-on warn exits 1 when behavior changed"
set +e
dw check --fail-on warn --quiet
code=$?
set -e
echo "exit=$code"
test "$code" -eq 1

echo
echo "EXAMPLE OK"
