#!/usr/bin/env bash
# DiffWitness M4 offline demo: init → baseline → check → mutate → check → explain mock → ci variants
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== build =="
npm run build >/dev/null

FIX="$(mktemp -d "${TMPDIR:-/tmp}/diffwitness-demo-XXXXXX")"
cleanup() { rm -rf "$FIX"; }
trap cleanup EXIT

echo "== fixture repo: $FIX =="
git -C "$FIX" init -q
git -C "$FIX" config user.email demo@example.com
git -C "$FIX" config user.name Demo
mkdir -p "$FIX/fixtures"
cp -R fixtures/demo "$FIX/fixtures/demo"
printf 'demo\n' > "$FIX/README.md"
git -C "$FIX" add .
git -C "$FIX" commit -qm init

SD=(node --import tsx src/cli/main.ts --repo "$FIX")
# `init` writes a placeholder template; point it at the engine fixture (same config as the tests).
install_demo_config() {
  node --import tsx --input-type=module -e "import { installDemoConfig } from './tests/support/demo-config.ts'; await installDemoConfig(process.argv[1]);" "$1"
}

echo "== init =="
"${SD[@]}" init
install_demo_config "$FIX"

echo "== commit config (CI expects source-clean tree) =="
git -C "$FIX" add .diffwitness/config.yaml .diffwitness/.gitignore
git -C "$FIX" commit -qm "diffwitness config"

echo "== baseline =="
"${SD[@]}" baseline

echo "== check (clean) =="
"${SD[@]}" check

echo "== ci (clean, AI off) =="
"${SD[@]}" ci | head -n 20

echo "== mutate behavior =="
node -e "const fs=require('fs');const p='$FIX/fixtures/demo/behavior.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.rank=2;fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');"
git -C "$FIX" add fixtures/demo/behavior.json
git -C "$FIX" commit -qm mutate

echo "== check (findings) =="
"${SD[@]}" check --fail-on never

echo "== explain mock =="
"${SD[@]}" explain --provider mock | head -n 30

echo "== ci fail-on never (findings, exit 0) =="
set +e
"${SD[@]}" ci --fail-on never >/tmp/diffwitness-ci-never.json
echo "exit=$?"
set -e
node -e "const j=require('/tmp/diffwitness-ci-never.json'); if(j.status!=='findings') process.exit(1); if(j.ai.enabled) process.exit(1);"

echo "== ci fail-on warn (expect exit 1) =="
set +e
"${SD[@]}" ci --fail-on warn >/tmp/diffwitness-ci-warn.json
code=$?
set -e
echo "exit=$code"
test "$code" -eq 1

echo "== ci missing baseline must not be clean =="
# fresh repo without baseline
FIX2="$(mktemp -d "${TMPDIR:-/tmp}/diffwitness-demo2-XXXXXX")"
git -C "$FIX2" init -q
git -C "$FIX2" config user.email demo@example.com
git -C "$FIX2" config user.name Demo
mkdir -p "$FIX2/fixtures"
cp -R fixtures/demo "$FIX2/fixtures/demo"
printf 'x\n' > "$FIX2/README.md"
git -C "$FIX2" add . && git -C "$FIX2" commit -qm init
node --import tsx src/cli/main.ts --repo "$FIX2" init
install_demo_config "$FIX2"
git -C "$FIX2" add .diffwitness/config.yaml .diffwitness/.gitignore
git -C "$FIX2" commit -qm cfg
set +e
node --import tsx src/cli/main.ts --repo "$FIX2" ci
code=$?
set -e
echo "no-baseline exit=$code"
test "$code" -eq 2
rm -rf "$FIX2"

echo "DEMO OK"
