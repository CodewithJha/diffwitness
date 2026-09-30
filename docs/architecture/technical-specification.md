# DiffWitness — Technical Specification (design document)

> **Design document, written before and during implementation.** It explains the domain model, invariants and pipeline, and most of it matches the code. For current behavior, the references win: [CLI reference](../reference/cli.md), [configuration reference](../reference/configuration.md), [architecture overview](README.md).
>
> Known differences from the shipped code:
>
> - There is no `history.jsonl`, `RunRecord` history, `listHistory`, or `history` command. Stored comparisons live in `.diffwitness/runs/`.
> - There is no `.diffwitness/config.schema.json`, and config is YAML only (`.diffwitness/config.yaml`).
> - `artifactGlobs` accepts exact relative paths only; globs such as `**` are rejected.
> - There is no `when.paths` workflow selection and no environment-variable interpolation in config values (for example `${DIFFWITNESS_MODEL}`).
> - `execution.maxConcurrent` and `privacy.sendCodeBodies` are accepted but have no effect.
> - `--base` never materializes a base worktree; comparisons always use the stored active baseline.

**Originally written:** 22 September 2026 (change-surface update 27 September 2026)  
**Planning background:** [`docs/DIFFWITNESS-PRD.md`](../DIFFWITNESS-PRD.md) (historical)

---

## 1. Purpose

Specify domain model, interfaces, pipeline, Git/AI/config/persistence contracts, CLI semantics, and test strategy for DiffWitness — enough to implement Milestone 0 without inventing requirements.

---

## 2. Domain model

### 2.1 Core types (conceptual)

```text
RepoContext
  rootPath, git: GitIdentity

GitIdentity
  headSha?, baseSha?, dirty: boolean, mergeBase?

Baseline
  id, createdAt, git: GitIdentity, envFingerprint, workflowIds[], evidenceIds[]

Workflow
  id, name, command[], cwd?, timeoutMs, env?, artifactGlobs?, normalize?: NormalizeSpec

Evidence
  id, workflowId, capturedAt, git: GitIdentity
  exitCode, durationMs
  stdoutRef?, stderrRef?          # content-addressed blobs
  artifactRefs[]                  # hash + path + optional kind
  observations[]                  # structured Observation
  redactionApplied: boolean

Observation
  key, kind: exit|stdout|stderr|artifact|metric|structured
  valueDigest, rawPreview?        # preview redacted / truncated
  severityHint?

BehavioralDiff
  id, baselineId, against: GitIdentity
  status: clean|findings|analysis_error
  findings: Finding[]
  affectedWorkflows: string[]
  affectedAssumptions: string[]   # "Declared assumptions (for affected workflows)": all declared config assumptions whenever any finding exists — no inference, no linking
  evidencePacketRef

Finding
  id, workflowId, observationKey
  change: changed|appeared|disappeared
  beforeDigest?, afterDigest?
  summary, evidenceIds[]
  severity: info|warn|error
  associationStatus?: associated|unavailable|not_comparable   # M6; co-occurrence only
  changeSurfaceRefs?: ChangeSurfaceId[]                       # M6; [surface.id] when associated

ChangeSurface (M6; attached as BehavioralDiff.changeSurface — additive, schemaVersion stays 1)
  schemaVersion: 1, id: cs_<sha256-24>          # identity of the source state (not part of BehavioralDiff.id)
  baseRevision (active baseline headSha), currentRevision (HEAD), workingTreeIncluded
  associationStatus: associated|unavailable|not_comparable
  causality: "not_established"                  # literal; DiffWitness never establishes causality
  limitation: string|null
  files[]: ChangedFile { path, status: added|modified|deleted|renamed, oldPath?, additions?, deletions?, untracked? }
  locations[]: ChangeLocation { path, baseStart, baseLines, currentStart, currentLines }   # raw hunk headers
  locationsComplete, excludedOperationalPaths
  truncation { truncated, filesTotal, filesIncluded, locationsTotal, locationsIncluded,
               omittedLongPaths, gitOutputCapped, limits }

EvidencePacket (v2 since M6 — see ai.md)
  # bundle sent to AI (reduced)
  diffSummary, findings[], evidenceExcerpts[], assumptions[], changeSurface? (files + association + causality)

RunRecord
  id, command, startedAt, finishedAt, exitClass, paths to artifacts
```

### 2.2 Invariants

1. **BehavioralDiff without AI** must be computable from Evidence alone.
2. **Analysis error** never serializes as `status: clean`.
3. AI outputs are **not** Findings; they are `Explanation` objects referencing Finding/Evidence IDs.
4. Provider adapters cannot execute workflows.
5. Content-addressed blobs are immutable once written.
6. **Change surface never alters findings** (which exist, ids, severity, type, evidenceIds) or BehavioralDiff status/id. Association = co-occurrence (“the finding occurred during an execution of a repository state containing these changes”), never causality. No LLM decides membership.

---

## 3. Interfaces (ports)

```text
GitPort
  revParse, mergeBase, isDirty, listChangedFiles(base, head), checkoutWorktree?(policy)

WorkflowRunner
  run(workflow, ctx) → EvidenceCapture (pre-persist)

Normalizer
  apply(raw) → normalized text/bytes per NormalizeSpec

EvidenceStore
  putBlob, putEvidence, getEvidence, putBaseline, getBaseline, listHistory

DiffEngine
  compare(baseline, currentEvidence[]) → BehavioralDiff

AiProvider
  explain(packet: EvidencePacket, opts) → Explanation (schema-validated)
  # implementations: MockAIProvider (required), FeatherlessAdapter (optional)

ConfigLoader
  load(.diffwitness/config) → DiffWitnessConfig

Clock / IdGenerator / Logger
  injectable for tests
```

---

## 4. State machines

### 4.1 Run lifecycle

```text
idle → configuring → resolving_git → selecting_workflows
    → executing → normalizing → persisting_evidence
    → diffing → (optional) explaining → reporting → terminal
```

Terminal classes: `ok_clean` | `ok_findings` | `analysis_error` | `user_error` | `interrupted`.

### 4.2 Baseline lifecycle

```text
absent → creating → active
active → superseded (new baseline id; old retained in history)
active → force_replaced (explicit --force only)
```

---

## 5. Pipeline L0–L6

| Level | Name | Deterministic? | MVP |
|---|---|---|---|
| **L0** | Load config, validate schema, env | Yes | Required |
| **L1** | Git change surface (files vs baseline commit; M6 — context only, attached after L5) | Yes | Implemented (M6) |
| **L2** | Workflow/test selection from config + optional path filters | Yes | Required (config-first; heuristics thin) |
| **L3** | Execute selected workflows under policy | Yes (side-effecting) | Required |
| **L4** | Normalize, redact, persist Evidence | Yes | Required |
| **L5** | BehavioralDiff | Yes | Required |
| **L6** | AI explain (optional) | No (model) | Mock required; live optional |

**Progressive evidence reduction (for L6):**

1. Diff summary + finding list only  
2. Add short evidence excerpts (bounded chars)  
3. Add changed-file path list (not full file bodies by default)  
4. Stop; never dump entire repos into prompts  

---

## 6. Git strategy

| Mode | Behavior |
|---|---|
| Local `check` | Compare Evidence from current tree vs stored Baseline (or re-run base worktree if configured) |
| `--base <ref>` | Git identity hint only — compare always uses the locally stored active baseline (no merge-base resolution or base worktree materialization implemented) |
| CI | Prefer SHAs; refuse ambiguous dirty unless `--allow-dirty` |

### 6.1 Change surface (M6, implemented)

- **Base:** active baseline `GitIdentity.headSha` (local-active model). `--base` / `baseRef` do **not** affect the change surface.
- **Current:** HEAD + working tree: `git diff --name-status -z -M <base>`, `git diff --numstat -z -M <base>` (metadata only), `git ls-files --others --exclude-standard -z` (untracked, not ignored), `git diff --unified=0 <base>` (hunk headers → locations). Argv-only; fixed prefixes; `--no-ext-diff --no-textconv --no-color`.
- **not_comparable:** baseline has no SHA; baseline captured from a dirty tree; current has no HEAD SHA; baseline commit not present locally.
- **unavailable:** git failed; surface before vs after workflow execution differs (executed state ambiguous); `analysis_error`; finding cites no current-execution evidence.
- **Exclusions:** gitignored files (git semantics) and DiffWitness operational dirs (`.diffwitness/{evidence,blobs,baselines,runs,cache}`) — counted in `excludedOperationalPaths`. Operator files (`.diffwitness/config.yaml`, `.diffwitness/.gitignore`) are reported.
- **Limits** (`DEFAULT_CHANGE_SURFACE_LIMITS`, domain-owned): 200 files, 500 locations, 512-char paths (longer omitted + counted, never shortened), 64 000 serialized chars (drop locations then files), 4 MiB git stdout per command. Sorted by path (code-unit order). Any reduction sets `truncation.truncated`.
- **Renames:** reported with `oldPath` only when git detects them (new path tracked). **Generated files:** ordinary changed files. **Symbols:** deferred.

**MVP recommendation:** Store baseline Evidence from `diffwitness baseline` at known SHA. For `check`, re-run workflows on current tree and diff Evidence. Optional later: dual worktree run for base+head without relying on stored baseline (heavier).

Changed-file list informs **which workflows** to run (config `when.paths`), not a substitute for Evidence.

---

## 7. Normalization

`NormalizeSpec` (config):

- strip ANSI  
- redact patterns (env-driven regex list; never log secrets)  
- stable sort lines (opt-in per workflow)  
- ignore timestamp lines matching patterns  
- max bytes retained per stream  

Digest = hash(normalized bytes). Previews store truncated normalized text.

---

## 8. AI provider contract

```text
input:  EvidencePacket (JSON schema versioned)
output: Explanation {
  schemaVersion,
  narrative: string,
  citations: [{ findingId | evidenceId, claim }],
  caveats: string[],
  modelId?: string,   # from config, not hardcoded in code paths beyond defaults file
  provider: string
}
```

Validation failure → `explain` reports error; does not alter BehavioralDiff status.

**MockAIProvider:** deterministic template over packet (no network).  
**FeatherlessAdapter:** OpenAI-compatible HTTP (`https://api.featherless.ai/v1`); key from env (`FEATHERLESS_API_KEY`); timeout; bounded response; no retry storms. See [Featherless provider](../reference/featherless-provider.md).

---

## 9. Configuration

Path: `.diffwitness/config.yaml` (or `.json`) + `.diffwitness/config.schema.json`.

Conceptual fields:

```yaml
version: 1
baseRef: origin/main   # default hint
workflows:
  - id: demo
    command: ["node", "fixtures/demo/run.mjs"]
    timeoutMs: 60000
    artifactGlobs: ["fixtures/demo/out/**"]
    normalize:
      stripAnsi: true
      redactEnv: ["API_KEY", "TOKEN"]
assumptions:
  - id: demo-output-stable
    description: "Demo workflow stdout contract for ranking"
ai:
  provider: mock | featherless | none
  model: ${DIFFWITNESS_MODEL}   # from env
privacy:
  sendCodeBodies: false
execution:
  allowCommands: true        # must be explicit for CI images
  maxConcurrent: 1
```

No hardcoded API keys, ports, or model IDs in source — env/config only ([`docs/ENGINEERING-STANDARDS.md`](../ENGINEERING-STANDARDS.md)).

---

## 10. Persistence (`.diffwitness/`)

```text
.diffwitness/
  config.yaml
  baselines/
  evidence/
  blobs/
  runs/
  cache/          # gitignored
  history.jsonl
```

Recommend gitignore: `cache/`, large blobs optional policy; commit config + small fixture baselines for demo repo only when intentional.

---

## 11. Error semantics

| Situation | BehavioralDiff.status | CLI exit class |
|---|---|---|
| Diff computed, no findings | `clean` | success |
| Diff computed, findings ≥ threshold | `findings` | failure (ci) / success with warn (local default) |
| Workflow timeout / crash during capture | `analysis_error` | analysis_error |
| Git resolve failure | — | user_error |
| AI explain failure | Diff unchanged | explain_error (non-fatal to check) |

**Hard rule:** analysis fail ≠ no regression.

---

## 12. CLI contracts

See the [CLI reference](../reference/cli.md). Application layer maps commands → use cases; domain never imports CLI argv parsers.

---

## 13. Test strategy

| Layer | What |
|---|---|
| Unit | Normalizer, DiffEngine, schema validation, exit mapping |
| Contract | AiProvider Mock + Featherless (recorded HTTP or skip-live) |
| Integration | Temp git repo fixtures; `baseline` → mutate → `check` |
| Golden | JSON BehavioralDiff fixtures |
| Security | Redaction tests; refuse AI-proposed commands (no such API) |

Fixtures live under `fixtures/` (when implementation starts) — not in this planning pass.

---

## 14. AST / test selection (practical libs — planning note)

MVP: **config-declared workflows** + path filters.  
Later TypeScript options (do not add until needed): `ts-morph` or compiler API for symbol touch; reuse ideas from OSS TIA (`testless`, Azure TIA concepts) without vendoring platforms.

Python alternative stack would use `libcst`/`ast` + `pytest` plugins — not first language (see Implementation Plan).

---

## 15. Out of scope for this spec revision

Microservices, multi-tenant SaaS control plane.
