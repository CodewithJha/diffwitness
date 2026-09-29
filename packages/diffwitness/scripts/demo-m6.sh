#!/usr/bin/env bash
# DiffWitness M6 offline demo: change surface + finding association (co-occurrence, not causality).
# baseline → clean check → mutate fixture (+ unrelated README edit) → check → explain mock → ci
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

say() { printf '\n== %s ==\n' "$1"; }

FIX="$(mktemp -d "${TMPDIR:-/tmp}/diffwitness-m6-XXXXXX")"
OUT="$(mktemp -d "${TMPDIR:-/tmp}/diffwitness-m6-out-XXXXXX")"
cleanup() { rm -rf "$FIX" "$OUT"; }
trap cleanup EXIT

say "fixture repo: $FIX"
git -C "$FIX" init -q
git -C "$FIX" config user.email demo@example.com
git -C "$FIX" config user.name Demo
mkdir -p "$FIX/fixtures"
cp -R fixtures/demo "$FIX/fixtures/demo"
printf 'demo\n' > "$FIX/README.md"
git -C "$FIX" add .
git -C "$FIX" commit -qm init

SD=(node --import tsx src/cli/main.ts --repo "$FIX")

"${SD[@]}" init >/dev/null
# `init` writes a placeholder template; point it at the engine fixture (same config as the tests).
node --import tsx --input-type=module -e "import { installDemoConfig } from './tests/support/demo-config.ts'; await installDemoConfig(process.argv[1]);" "$FIX"
git -C "$FIX" add .diffwitness/config.yaml .diffwitness/.gitignore
git -C "$FIX" commit -qm "diffwitness config"

say "baseline (commit $(git -C "$FIX" rev-parse --short=12 HEAD))"
"${SD[@]}" baseline

say "check (clean — no source change, no behavior change)"
"${SD[@]}" check

say "mutate: fixtures/demo/behavior.json rank 1→2, plus an unrelated README.md edit"
node -e "const fs=require('fs');const p='$FIX/fixtures/demo/behavior.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.rank=2;fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');"
printf 'demo\nunrelated docs edit\n' > "$FIX/README.md"

cat <<'EOF'

How to read the next output:
  Git       → "Change surface": files that differ from the baseline commit (metadata, not evidence)
  DiffWitness  → "Findings": deterministic behavioral deltas with EvidenceIds (the source of truth)
  DiffWitness  → "Association": the findings co-occurred with that source state
  Causality → never established; README.md is listed exactly like behavior.json
EOF

say "check (findings + change surface)"
"${SD[@]}" check

say "explain --provider mock (AI layer: narrates the packet only, offline)"
"${SD[@]}" explain --provider mock

say "commit the change (CI requires a source-clean tree)"
git -C "$FIX" add fixtures/demo/behavior.json README.md
git -C "$FIX" commit -qm "rank 2 + docs"

say "ci --fail-on warn (exit 1 from findings; association never changes exit codes)"
set +e
"${SD[@]}" ci --fail-on warn >"$OUT/ci.json"
code=$?
set -e
echo "exit=$code"
test "$code" -eq 1
node -e "
const j = require('$OUT/ci.json');
const cs = j.behavioralDiff.changeSurface;
if (j.schemaVersion !== 2 || j.status !== 'findings') process.exit(1);
if (cs.causality !== 'not_established' || cs.associationStatus !== 'associated') process.exit(1);
console.log('ci.json changeSurface:', JSON.stringify({ files: cs.files.map(f => f.status + ' ' + f.path), causality: cs.causality, associationStatus: cs.associationStatus }));
console.log('ci.json findings:', j.findings.map(f => f.id + ' → ' + f.associationStatus).join(', '));
"

echo
echo "DEMO M6 OK"
