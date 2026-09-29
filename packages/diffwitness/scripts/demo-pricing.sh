#!/usr/bin/env bash
# DiffWitness golden demo: tests stay green, behavior changes, DiffWitness shows the evidence.
# Copies fixtures/pricing into a throwaway Git repo, baselines it, changes one constant in the
# source (DISCOUNT 0.1 → 0.2), then runs check → explain (MockAI) → ci --fail-on warn.
# Offline; no API key. Usage: npm run demo   (KEEP=1 keeps the temp repo for inspection)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

say() { printf '\n\033[1m== %s ==\033[0m\n' "$1"; }
sd() { node --import tsx "$ROOT/src/cli/main.ts" --repo "$DEMO" "$@"; }
g() { git -C "$DEMO" -c user.name=Demo -c user.email=demo@example.com -c commit.gpgsign=false "$@"; }

DEMO="$(mktemp -d "${TMPDIR:-/tmp}/diffwitness-pricing-XXXXXX")"
cleanup() { if [ "${KEEP:-0}" = "1" ]; then echo "kept: $DEMO"; else rm -rf "$DEMO"; fi; }
trap cleanup EXIT
cd "$ROOT"

cp -R fixtures/pricing/. "$DEMO"
git -C "$DEMO" init -q -b main
g add -A && g commit -qm "pricing project"

say "diffwitness init (then install the project's workflow config)"
sd init >/dev/null
cp "$DEMO/diffwitness.config.yaml" "$DEMO/.diffwitness/config.yaml"
g add .diffwitness && g commit -qm "diffwitness config"
sed -n '/^workflows:/,/^assumptions:/p' "$DEMO/.diffwitness/config.yaml" | sed '$d'

say "diffwitness baseline"
sd baseline

say "the change: one constant in src/pricing.mjs"
sed -i.bak 's/DISCOUNT = 0.1;/DISCOUNT = 0.2;/' "$DEMO/src/pricing.mjs" && rm "$DEMO/src/pricing.mjs.bak"
g --no-pager diff --no-color

say "the project's tests still pass"
(cd "$DEMO" && node --test --test-reporter=dot test/pricing.test.mjs) && echo "tests: exit 0"

say "diffwitness check"
sd check

say "diffwitness explain --provider mock"
sd explain --provider mock

say "diffwitness ci --fail-on warn (CI gate; commit first — CI refuses a dirty tree)"
g add -A && g commit -qm "discount tweak"
set +e
sd ci --fail-on warn >/dev/null
code=$?
set -e
echo "exit=$code (1 = findings at or above warn)"
test "$code" -eq 1

echo
echo "DEMO OK"
