# DiffWitness — CLI Specification

**Status:** M0–M7 implemented (`packages/diffwitness/`); finalization for submission in progress  
**Date:** 22 September 2026  
**Binary name:** `diffwitness`
---

## 1. Global flags

| Flag | Meaning |
|---|---|
| `--help` / `-h` | Help |
| `--version` / `-V` | Version |
| `--config <path>` | Config file (default `.diffwitness/config.yaml`) |
| `--repo <path>` | Repo root (default cwd) |
| `--json` | Machine-readable JSON on stdout |
| `--verbose` | Extra diagnostics on stderr |
| `--quiet` | Summary only |

**Unknown options / arguments:** any unknown option, unexpected argument, or unknown command exits with code `2` (user_error) and prints a single `error: <message>` line on stderr.

---

## 2. Commands

### `diffwitness init`

Create `.diffwitness/` with default config + `.gitignore` entries for cache.

| Flag | Meaning |
|---|---|
| `--force` | Overwrite config (keep evidence unless `--wipe`) |

Exit: `0` success; `2` already exists without force.

**Template config:** `init` writes a commented template `.diffwitness/config.yaml` with a placeholder workflow `example` whose `command` must be edited to a real argv command. Running `diffwitness baseline` against the unedited template fails with exit `2` and a message telling the user to edit `.diffwitness/config.yaml`.

### `diffwitness baseline`

Run selected workflows; persist Baseline + Evidence.

| Flag | Meaning |
|---|---|
| `--workflow <id>` | Subset (repeatable) |
| `--force` | Supersede active baseline explicitly |

Exit: `0` ok; `3` analysis_error; `2` user_error.

### `diffwitness check`

Compare current evidence vs baseline (or dual-run when implemented).

| Flag | Meaning |
|---|---|
| `--base <ref>` | Git base hint |
| `--workflow <id>` | Subset (repeatable) — compares **only** the selected workflows' baseline Evidence; unselected workflows are never reported as disappeared. A selected workflow absent from the active baseline → exit `2` (`workflow_not_in_baseline`); unknown id → exit `2`. Without `--workflow`, all baseline Evidence is compared. |
| `--fail-on <severity\|error\|never>` | Local severity gate (default: warn prints, exit 0) |
| `--allow-dirty` | Permit dirty tree |

Exit: see §3. The change surface never affects status or exit code. A check that starts replaces `.diffwitness/runs/last-check.json` with a `check_incomplete` marker until it persists its own BehavioralDiff, so a failed / interrupted check never leaves an older result behind for `explain`.

**M6 change surface:** after findings, human output prints a compact block (≤10 files; hunks from `--unified=0`; explicit truncation; never a full git diff):

```text
Change surface (Git: baseline <sha12> → current <sha12> + working tree): 2 file(s)
  M  README.md  +1 -0  (hunks: -1,0 +2)
  M  fixtures/demo/behavior.json  +1 -1  (hunks: -3 +3)
Association: 2 of 2 finding(s) co-occurred with this change surface (workflow demo @ source state <sha12> + working tree)
Causality: not established — change-surface membership means co-occurrence only, not that a file caused a finding.
```

With no findings, the association line reads `Association: not applicable — no findings`.

**Human `check` output (finalization):** leads with a verdict line (e.g. `BEHAVIOR CHANGED (status: findings)`), then an `Observations:` count line and a per-workflow table, then per-finding **Before / After** previews (bounded, taken from stored evidence previews, truncated with `…`), Evidence IDs, `Changed alongside (Git)` files, and `Causality: not established`. JSON output (`--json`) contracts are unchanged (`schemaVersion: 2`).

When Git cannot relate the states: `Change surface (Git): not_comparable — <reason>` (e.g. baseline captured from a dirty tree) or `unavailable — <reason>` (git failed; repo changed during execution). `--base` does not change the surface (base is always the active baseline commit).

### `diffwitness explain`

Explain last BehavioralDiff (or `--run <id>`) with configured AiProvider. DiffEngine status is never rewritten.

| Flag | Meaning |
|---|---|
| `--provider <mock\|featherless\|none>` | Override `ai.provider` (default from config: `mock`) |
| `--run <id>` | Target BehavioralDiff id (default: `.diffwitness/runs/last-check.json`) |

Exit: `0` explained (or provider=`none` with findings still shown); `2` no prior check / bad args / no current result; `4` explain_error (provider failure, invalid Explanation — schema, citations, or semantic wording — missing Featherless credentials, packet budget failure). Does not rewrite check status. `explain` never gates on findings, so it never returns `1` or `3`.

**No stale results (exit `2`):** `code: check_incomplete` when the most recent `check`/`ci` failed or was interrupted; `code: check_stale` when the BehavioralDiff (last check or `--run <id>`) was computed against a baseline other than the current active baseline (e.g. after `baseline --force`). Re-run `diffwitness check`.

**M5 behavior:**

- Requires a prior `diffwitness check` (loads last BehavioralDiff).  
- `clean` → honest “nothing to explain” (no fabricated findings).  
- `analysis_error` → refuses clean bill of health; does not narrate as ordinary findings.  
- `findings` → build/redact EvidencePacket.v2 → provider → FACT→EVIDENCE→CHANGE SURFACE (co-occurrence only)→INTERPRETATION (`explain.v2`).  
- `none` → explanation unavailable; findings remain.  
- `mock` → offline deterministic MockAI (default; no network).  
- `featherless` → live OpenAI-compatible HTTP (`docs/FEATHERLESS-PROVIDER.md`); requires `FEATHERLESS_API_KEY`; **no** silent mock fallback.  

Human output: findings first, then explanation sections. JSON: `{ command: "explain", status, behavioralDiff, explanation, packet, metadata: { provider, model, promptVersion, explanationStatus }, ... }`.

### `diffwitness history` — Not implemented (future)

List recent runs / baselines. Not part of the shipped CLI; invoking it exits `2` as an unknown command.

| Flag | Meaning |
|---|---|
| `--limit <n>` | Default 20 |

### `diffwitness ci`

Non-interactive check with CI defaults. Always emits versioned machine-readable JSON on stdout.

| Flag | Meaning |
|---|---|
| `--fail-on <warn\|error\|never>` | Severity gate (CI default: **error**) |
| `--allow-dirty` | Permit source-dirty working tree (CI default: refuse) |
| `--workflow <id>` | Subset (repeatable) |
| `--base <ref>` | Git identity hint only (compare still uses local-active baseline) |
| `--explain` | Optional explain after check (AI **off** by default) |
| `--provider <mock\|featherless\|none>` | Used only with `--explain` |
| `--json-out <file>` | Also write the same JSON report to a file |

**Defaults / invariants:**

- Non-interactive; no TTY prompts  
- AI disabled unless `--explain`; AI never rewrites DiffEngine status  
- Baseline model: **local-active** only (`.diffwitness/baselines/active.json`) — no PR / merge-base inference  
- Source-clean required (operational `.diffwitness/{evidence,blobs,baselines,runs,cache}/` ignored); config edits count as source  
- Exit: `0` acceptable; `1` findings≥fail-on; `2` user/config (incl. missing baseline, source-dirty); `3` analysis/execution; `4` explain failure when `--explain`  
- Exit precedence with `--explain`: **`3` > `1` > `4` > `0`** — analysis error → `3` and findings≥fail-on → `1` whether explain succeeds or fails; `4` only when the check itself is acceptable. JSON keeps `status`, `findings`, and `ai.status: "error"`.  
- `--workflow` subset: same semantics as `check --workflow`  
- Never: `analysis_error`→clean; missing baseline→clean; AI fail→clean  

**Severity mapping:** info always exit 0 for the findings gate; warn fails on `--fail-on warn`; error fails on `--fail-on warn|error`. Typical stdout/artifact findings are **warn**; exit-code changes are **error**.

**Important:** `ci --fail-on` defaults to `error`. Warn-severity findings (e.g. a stdout change) are reported but do **not** fail CI (exit `0`) unless `--fail-on warn` is passed.

**CI JSON (`schemaVersion: 2`, M6):** `status`, `baseline`, `current`, `behavioralDiff` (incl. `changeSurface`), `findings` (incl. `associationStatus`, `changeSurfaceRefs`), `evidenceRefs`, `ai`, `limitations` (incl. `causality: "not_established"`, `changeSurfaceNote`), `metadata` (volatile timestamps only under `metadata.generatedAt` with `volatile: true`). Deterministic ordering; no ANSI/secrets in the contract fields. v1→v2 is additive; exit semantics unchanged. Human stderr summary includes the change-surface block.

---

## 3. Exit codes (proposed)

| Code | Class | Meaning |
|---|---|---|
| `0` | success | Clean, or findings below fail threshold |
| `1` | findings | Behavioral findings at/above fail threshold (`ci` / `--fail-on`) |
| `2` | user_error | Bad args, missing config, invalid ref, missing baseline, CI source-dirty |
| `3` | analysis_error | Could not complete evidence/diff honestly |
| `4` | explain_error | AI/explain failed (check may have succeeded) |
| `130` | interrupted | SIGINT (Ctrl-C) received by DiffWitness |
| `143` | interrupted (terminated) | SIGTERM received by DiffWitness |

**Invariant:** Code `0` must not mean “no regression” when analysis did not finish (`3`).

**Interruption (SIGINT / SIGTERM):** DiffWitness records the signal, kills running workflow process groups, and persists nothing further: an interrupted `baseline` never creates or replaces the active baseline; an interrupted `check`/`ci` never writes Evidence or a BehavioralDiff and never prints a verdict (and `explain` then reports `check_incomplete`). The interrupted workflow is never recorded as Evidence. Interruption is only inferred from signals DiffWitness itself receives — a workflow that exits `130` on its own is ordinary behavior; a workflow killed by a signal DiffWitness did not send is an execution failure (`3`), never Evidence. A second signal exits immediately with the same code. A signal that arrives after the final atomic write cannot undo it; the written artifact is complete and valid.

---

## 4. Output formats

### Human (default) — progressive disclosure

1. One-line verdict (e.g. `BEHAVIOR CHANGED (status: findings)`; status is `clean` / `findings` / `analysis_error`)  
2. Observation counts (`Observations: N unchanged · N changed · N appeared · N disappeared`), then the per-workflow table  
3. Per-finding Before / After previews (bounded, from stored evidence previews, truncated with `…`), Evidence IDs, `Changed alongside (Git)`, `Causality: not established`  
4. Optional explain section if invoked  

### JSON (`check` / `explain`)

Stable top-level:

```json
{
  "schemaVersion": 2,
  "command": "check",
  "status": "findings",
  "behavioralDiff": { "findings": [], "changeSurface": { "associationStatus": "associated", "causality": "not_established" } },
  "explanation": null
}
```

`check --json` and `explain --json` are `schemaVersion: 2` since M6 (`behavioralDiff.changeSurface`; explain `packet` is EvidencePacket.v2). Pre-M6 persisted BehavioralDiffs (no `changeSurface`) still load.

### JSON (`ci`)

Always on stdout (see §2 `ci`). Companion human summary may appear on stderr unless `--quiet`.

---

## 5. Smallest surface confirmation

MVP ships: **init, baseline, check, explain, ci**.  
`history`: not implemented (future). No `fix`, `agent`, `login`, or plugin marketplace in MVP.

---

## 6. Examples (illustrative)

```bash
diffwitness init
# commit .diffwitness/config.yaml before CI
diffwitness baseline
# ... make a behavior change ...
diffwitness check
diffwitness explain --provider mock
diffwitness ci
diffwitness ci --fail-on warn
```

Offline MockAI requires **no credentials**.
