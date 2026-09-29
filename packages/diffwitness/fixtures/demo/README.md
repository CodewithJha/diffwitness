# DiffWitness demo fixture (M1/M2)

Deterministic workflow target for `diffwitness baseline` and `diffwitness check`.

```bash
node fixtures/demo/run.mjs
```

- Input: `behavior.json` (mutate `rank` to simulate behavioral change for check demos)
- Output: stdout JSON + `out/result.json`
- No network, timestamps, randomness, or absolute paths in the payload

Config (from `diffwitness init`) references:

```yaml
command: ["node", "fixtures/demo/run.mjs"]
artifactGlobs: ["fixtures/demo/out/result.json"]
```

M2 wow-path: `baseline` → mutate `behavior.json` → `check` → findings (stdout + artifact) with Evidence IDs.
