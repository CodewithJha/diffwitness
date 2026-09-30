# DiffWitness — demo scripts

Two scripts: a **2–3 minute recorded video** and a **5-minute live walkthrough**. Both use the built-in pricing example, so every number below is reproducible: `{"total":315}` → `{"total":280}`.

## Setup (once, before recording)

```bash
# repository root
npm ci && npm run build
cd packages/diffwitness
KEEP=1 npm run demo        # prints the kept temp repo path at the end; rehearsal run
```

For the terminal parts, prepare a fresh copy of the example (commands from `packages/diffwitness`):

```bash
alias diffwitness="node $PWD/dist/cli/main.js"
DEMO=$(mktemp -d) && cp -R fixtures/pricing/. "$DEMO" && cd "$DEMO"
git init -q -b main && git add -A && git -c user.name=demo -c user.email=demo@example.com commit -qm "pricing app"
diffwitness init >/dev/null && cp diffwitness.config.yaml .diffwitness/config.yaml
git add .diffwitness && git -c user.name=demo -c user.email=demo@example.com commit -qm "diffwitness config"
diffwitness baseline
clear
```

Terminal: large font (≥ 18 pt), dark-on-light or light-on-dark, window ≥ 110 columns so check output does not wrap. Browser: the hosted demo URL open in a second tab, not yet run.

---

## Video (2:30–3:00)

| Time | On screen | Voice-over (say roughly this) | Exact action |
|---|---|---|---|
| **0:00–0:20** Problem | Hosted demo page, headline visible: “Your tests passed. Your behavior didn’t.” URL visible in the address bar. | “A one-line change ships. Tests pass. The diff looks harmless. But what the customer sees has changed — and nobody notices.” | None — let the page sit. |
| **0:20–0:50** Git diff | Terminal. | “Here’s the change: one constant, the order discount, from ten to twenty percent. As a diff, it’s one line.” | `sed -i.bak 's/DISCOUNT = 0.1;/DISCOUNT = 0.2;/' src/pricing.mjs && rm src/pricing.mjs.bak` then `git diff` |
| **0:50–1:20** Tests pass | Terminal. | “The project’s tests still pass — they check the shape of the quote and input validation, not the value.” | `node --test test/pricing.test.mjs` — point at `pass 4`, `fail 0`. |
| **1:20–1:50** DiffWitness | Terminal. | “DiffWitness reran the workflows from the baseline. Verdict: behavior changed. The tests workflow is unchanged and passing; the pricing workflow’s output went from 315 to 280.” | `diffwitness check` — highlight `BEHAVIOR CHANGED`, `tests unchanged exit 0 (pass)`, `Before: {"total":315}` / `After: {"total":280}`. |
| **1:50–2:20** Evidence | Switch to browser. Click **Run investigation**. The verdict readout and investigation rail fill in. | “Same thing in the browser — the real CLI running on the server in a fresh repo. Tests PASS, behavior CHANGED, 315 to 280, eleven observations unchanged, one changed. Every value has an evidence ID: here’s the stored before and after. Git lists the file that changed alongside — co-occurrence, not cause.” | Scroll slowly: verdict readout → investigation rail → Detected → Evidence ledger (IDs) → Change surface. |
| **2:20–2:40** Explanation | Browser: under **Deeper technical details**, expand **Optional explanation** (“MockAI · deterministic offline explainer”). | “The explanation is built only from that evidence packet. It’s a deterministic offline explainer here; it can’t change the verdict, and it never claims causality.” | Expand the details; point at `CAUSALITY: not established`. *(Optional, only if recorded locally with a key: `diffwitness explain --provider featherless` — label it on screen “live model, explain-only, no fallback”.)* |
| **2:40–3:00** Why it matters | Browser: the Causality section (“Not established”), then the README or repo URL. | “Tests check what you asserted. Diffs show what text changed. DiffWitness shows what behavior changed — with evidence, and exit code 1 in CI. Next: a GitHub Action and PR-base comparison.” | Optional terminal cut: `git commit -qam discount && diffwitness ci --fail-on warn >/dev/null; echo "exit=$?"` → `exit=1`. End on the URL. |

Rules: no slides, no mission statement, demo URL visible in the first 20 seconds, stop at 3:00.

---

## Live walkthrough (5 minutes)

1. **(0:00–0:45) Open the hosted demo.** Read the headline. Show the case label: “a small pricing project with passing unit tests; we’ll change one constant.”
2. **(0:45–1:30) Click Run investigation.** The button shows “Investigating…”; the server run takes about a second, then the result replays through the rail. Read the verdict readout: BEHAVIOR CHANGED, baseline 315 → current 280, observations 11 unchanged · 1 changed; then the case label: tests PASS (unchanged), the change.
3. **(1:30–2:15) Detected + Change surface.** One finding: `pricing · stdout`. Show the real `git diff` — one line. Point out: “the file is listed as changed alongside — DiffWitness does not claim it caused anything.”
4. **(2:15–3:00) Evidence ledger.** Before and after previews with their `ev_…` IDs. “These are what’s stored; the verdict is computed from their digests, not by a model.”
5. **(3:00–3:30) Explanation + trust.** Expand the MockAI explanation: facts cite evidence IDs, hypotheses are hedged, `CAUSALITY: not established`. Read the Causality section (“Not established”).
6. **(3:30–4:15) Deeper technical details.** Expand: the workflow config that was installed (two workflows: `pricing`, `tests`), then each stage’s raw terminal output — `diffwitness init`, `baseline`, `git diff`, `check`, `explain`, `explain --json`. “Nothing is mocked except the explainer; nothing you send is executed.”
7. **(4:15–5:00) Terminal: CI gate.** In the prepared repo after the change: `git commit -qam discount && diffwitness ci --fail-on warn; echo "exit=$?"` → JSON on stdout, `exit=1`. Close with: “exit codes 0 / 1 / 2 / 3 / 4, and an analysis error is never reported as clean.”

### If something goes wrong live

| Symptom | Say / do |
|---|---|
| Page shows “Demo unavailable” or `503 not_ready` | The host is missing Git or still starting; open `/ready` to show the reason, then use the terminal flow. |
| `503` busy | Concurrency limit (2 runs). Click again after a second. |
| Network down | Run everything from the terminal (setup above); `npm run demo` performs the full flow in one command. |
