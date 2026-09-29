# Pricing sample project

A tiny, deterministic project used by the DiffWitness hosted demo and golden tests.

- `src/pricing.mjs` — `calculateTotal(items, discount = DISCOUNT)` with `DISCOUNT = 0.1`
- `bin/quote.mjs` — prints the quote for `data/order.json` as one JSON line: `{"total":315}`
- `test/pricing.test.mjs` — unit tests that validate input handling and output shape (they do not pin the total)
- `diffwitness.config.yaml` — two workflows: `pricing` (the quote) and `tests` (the unit tests)

The demo change edits one constant, `DISCOUNT = 0.1` → `0.2`. The tests stay green, the quote
becomes `{"total":280}`, and DiffWitness reports exactly one finding on the `pricing` workflow.

Try it by hand (from `packages/diffwitness`, after `npm run build`):

```bash
DEMO=$(mktemp -d) && cp -R fixtures/pricing/. "$DEMO" && cd "$DEMO"
git init -q -b main && git add -A && git -c user.name=demo -c user.email=demo@example.com commit -qm init
diffwitness init && cp diffwitness.config.yaml .diffwitness/config.yaml
git add .diffwitness && git -c user.name=demo -c user.email=demo@example.com commit -qm "diffwitness config"
diffwitness baseline
sed -i.bak 's/DISCOUNT = 0.1;/DISCOUNT = 0.2;/' src/pricing.mjs && rm src/pricing.mjs.bak
diffwitness check
diffwitness explain --provider mock
```

(`diffwitness` here is the built CLI: `node <path-to>/packages/diffwitness/dist/cli/main.js`.)
