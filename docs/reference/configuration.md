# Configuration reference

DiffWitness reads one YAML file per repository: `.diffwitness/config.yaml`, created by `diffwitness init`. Pass `--config <path>` to use a different file; a relative path is resolved from the current working directory.

This page lists every field the config validator accepts ([`packages/diffwitness/src/infrastructure/config/schema.ts`](../../packages/diffwitness/src/infrastructure/config/schema.ts)). Validation is strict:

- Unknown keys at any level are rejected (exit `2`).
- `version` is required and must be `1`. Any other value fails closed (exit `2`, `unsupported_config_version`).
- A workflow still using the `init` template command (`node path/to/workflow.mjs`) is refused before anything runs (exit `2`).
- NUL bytes in `command` or `cwd` are rejected.

Never put credentials in this file. The only credential-related field is `ai.featherless.apiKeyEnv`, which holds the *name* of an environment variable, not a key.

## Minimal example

```yaml
version: 1
workflows:
  - id: report
    command: ["node", "scripts/print-report.mjs"]
```

Everything else has a default. The [behavioral-change example](../../examples/behavioral-change/diffwitness.config.yaml) is a complete, working config.

## Top level

| Field | Type | Default | Notes |
|---|---|---|---|
| `version` | `1` | required | Config schema version. |
| `baseRef` | string | `origin/main` | Git ref recorded as the base identity (merge-base is recorded when it resolves). It does **not** choose what is compared: comparisons always use the stored active baseline. Must match `^[A-Za-z0-9][A-Za-z0-9._/-]*$` and contain no `..` path segment when used. |
| `workflows` | list of [workflow](#workflows) | `[]` | `baseline` and `check` exit `2` if empty. |
| `assumptions` | list of [assumption](#assumptions) | `[]` | Listed in reports when a finding exists. |
| `ai` | [ai](#ai) | see below | Explanation settings (`explain`, `ci --explain`). |
| `privacy` | [privacy](#privacy) | `{ sendCodeBodies: false }` | |
| `execution` | [execution](#execution) | see below | Process execution policy. |

## `workflows`

A workflow is a command DiffWitness runs to observe behavior. Each run records the exit code, normalized stdout and stderr, and any listed artifact files as evidence.

| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | string (non-empty) | required | Used in findings and with `--workflow <id>`. |
| `name` | string | the `id` | Display name. |
| `command` | list of strings (≥ 1, each non-empty) | required | **argv, not a shell string.** Spawned with `shell: false`: no pipes, globs, `&&` or variable expansion. The first item is looked up on `PATH` (see `execution.envPolicy`). |
| `cwd` | string | repository root | Relative to the repository root. Must stay inside it (exit `2` otherwise) and must exist. |
| `timeoutMs` | positive integer | `60000` | The workflow's process group is killed at the limit, and the run is an analysis error (exit `3`), never evidence. |
| `env` | map of string → string | none | Extra environment variables for this workflow. Combined with `execution.envPolicy`. |
| `artifactGlobs` | list of strings | none | Despite the name, **exact repository-relative file paths** only. `*` or `?` is rejected (exit `2`). Paths outside the repository are rejected. A listed file that is missing after the run is an analysis error (exit `3`). |
| `normalize` | [normalize](#workflowsnormalize) | none | Applied to stdout and stderr before hashing. |
| `maxStdoutBytes` | positive integer | `execution.maxStdoutBytes` | Per-workflow capture limit. Output beyond it is dropped and recorded as truncated. |
| `maxStderrBytes` | positive integer | `execution.maxStderrBytes` | Same, for stderr. |

Security note: workflows run with your user's permissions. DiffWitness is not a sandbox; only use configs you trust. See the [security model](../security/README.md).

### `workflows[].normalize`

Output must be deterministic, or every run looks like a change. Normalization happens in this order: ANSI stripping, line-ending normalization (`\r\n` and `\r` become `\n`, always on), dropping ignored lines, sorting, redaction, byte limit. The digest is computed over the result.

| Field | Type | Default | Notes |
|---|---|---|---|
| `stripAnsi` | boolean | `false` | Remove ANSI color codes. |
| `ignoreLinePatterns` | list of strings | none | JavaScript regular expressions. Matching lines are dropped (for example `"^duration"` or `"took \\d+ms"`). |
| `stableSortLines` | boolean | `false` | Sort lines, for output whose order is not meaningful. |
| `redactEnv` | list of strings | none | Environment variable **names**. If the variable is set in DiffWitness's own environment and its value appears in the output, the value is replaced with `[REDACTED:<NAME>]` before hashing and storage. Best-effort: exact value match only. |
| `maxBytes` | positive integer | none | Keep only the first N bytes of normalized output. |

## `assumptions`

Declared, human-written expectations. DiffWitness does not infer or verify them. When a check has findings, all declared assumptions are listed as "declared assumptions" in the report and the evidence packet.

| Field | Type | Default |
|---|---|---|
| `id` | string (non-empty) | required |
| `description` | string (non-empty) | required |

## `ai`

Settings for the optional explanation layer. AI never decides findings, status or exit codes; see [AI architecture](../architecture/ai.md).

| Field | Type | Default | Notes |
|---|---|---|---|
| `provider` | `mock` \| `featherless` \| `none` | `mock` | `mock`: deterministic offline template, no network, no key. `none`: no explanation, findings still shown. `featherless`: live model over HTTP (opt-in). `explain --provider` overrides this. |
| `model` | string | none | Model id. Used for Featherless when `ai.featherless.model` is not set. |
| `maxChars` | positive integer | `8000` | Hard character budget for the serialized evidence packet. If it cannot be reduced below this, `explain` fails with exit `4`. |
| `maxFindings` | positive integer | `20` | Findings included in the packet. |
| `maxExcerpts` | positive integer | `10` | Evidence excerpts included. |
| `maxExcerptChars` | positive integer | `200` | Characters per excerpt. |
| `maxPaths` | positive integer | `40` | Changed-file paths included. |
| `featherless` | [featherless](#aifeatherless) | none | Only read when the provider is `featherless`. |

### `ai.featherless`

| Field | Type | Default | Notes |
|---|---|---|---|
| `apiKeyEnv` | string | `FEATHERLESS_API_KEY` | Name of the environment variable holding the key. The key itself never appears in config, logs or JSON output. |
| `baseUrl` | URL | `https://api.featherless.ai/v1` | OpenAI-compatible endpoint. |
| `model` | string | `ai.model` | Required (here or in `ai.model`) when the provider is `featherless`. |
| `timeoutMs` | positive integer | `30000` | Request timeout. |
| `maxResponseBytes` | positive integer | `512000` | Larger responses are rejected. |
| `preferJsonObjectFormat` | boolean | `true` | Request `response_format: json_object`. |
| `httpReferer` | URL | none | Optional `HTTP-Referer` header. |
| `xTitle` | string | none | Optional `X-Title` header. |

Details: [Featherless provider](featherless-provider.md).

## `privacy`

| Field | Type | Default | Notes |
|---|---|---|---|
| `sendCodeBodies` | boolean | `false` | Accepted for forward compatibility; currently **has no effect**. No provider ever receives file contents, whatever this is set to. |

## `execution`

| Field | Type | Default | Notes |
|---|---|---|---|
| `allowCommands` | boolean | `true` | `false` makes `baseline` and `check` refuse to run workflows (exit `2`). |
| `maxConcurrent` | positive integer | `1` | Accepted; currently **has no effect**. Workflows always run one at a time. |
| `maxStdoutBytes` | positive integer | `1048576` | Default stdout capture limit per workflow. |
| `maxStderrBytes` | positive integer | `1048576` | Default stderr capture limit per workflow. |
| `envPolicy` | `none` \| `path` \| `all` | `path` | Environment for workflow processes. `none`: only `workflows[].env`. `path`: `PATH` from the host plus `workflows[].env` (needed to find `node`, `npm`, and so on). `all`: the full host environment plus `workflows[].env`; least deterministic and exposes every host variable to the workflow. |

## Files DiffWitness writes

`diffwitness init` creates the layout below and a `.diffwitness/.gitignore` that ignores the operational directories, so only `config.yaml` and the `.gitignore` itself are committed.

```text
.diffwitness/
  config.yaml        commit this
  .gitignore         commit this
  baselines/         baseline records; active.json points at the active one
  evidence/          one JSON file per workflow run (ev_<uuid>.json)
  blobs/             normalized output, content-addressed by SHA-256
  runs/              stored comparisons (bd_<id>.json) and last-check.json
  cache/
```

Persisted records carry a schema version; unknown versions fail closed. Nothing is ever pruned automatically, so the directories grow with each `baseline` and `check`. Deleting them is safe; you then need a new `baseline`.
