# Development guide

How the repository is organized and how to build, test and package DiffWitness. The contribution process (issues, pull requests, review) is in [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Repository layout

```text
package.json, package-lock.json   workspace root: build/test/demo scripts, hosts the demo deploy (no runtime deps)
packages/diffwitness/             the CLI package (the product)
  src/cli/                        argv parsing, help, output, exit codes
  src/application/                use cases: init, baseline, check, explain, ci; formatters; packet building
  src/domain/                     types, diff engine, change surface + association, schemas, errors, wording gate
  src/ports/                      interfaces: Git, ProcessExecutor, Storage, AiProvider, Clock, IdGenerator, Interruption
  src/infrastructure/             config, git adapter, process executor, normalizer, evidence store, AI providers
  src/hosted/                     hosted demo server (excluded from the npm package)
  hosted/public/                  hosted demo page: static HTML/CSS/vanilla JS, strict CSP
  fixtures/pricing/               the built-in pricing project used by the hosted demo and tests
  fixtures/demo/                  deterministic engine-test workflow
  scripts/                        demo and smoke scripts (demo-pricing, demo-m4, demo-m6, demo-m7)
  tests/                          node:test suites (run with tsx)
examples/behavioral-change/       canonical example project + run.sh
docs/                             user, architecture, reference, security and development docs
archive/                          pre-product planning history (not built, not maintained)
```

Layer rules and the component map: [Architecture](../architecture/README.md).

## Setup

```bash
npm ci               # root (no dependencies; keeps the lockfile honest)
npm run build        # npm ci --include=dev + tsc inside packages/diffwitness
```

Day to day you can work inside the package:

```bash
cd packages/diffwitness
npm ci
npm run typecheck
npm test
npm run build
npm run diffwitness -- --help     # run the CLI from source via tsx
```

## Scripts

| Where | Script | What it does |
|---|---|---|
| root | `npm run build` | Install package dev dependencies and compile to `packages/diffwitness/dist/` |
| root | `npm test` / `npm run typecheck` | Forward to the package |
| root | `npm start` | Start the hosted demo from `dist/` |
| root | `npm run demo` / `npm run demo:m7` | Forward to the package demos |
| package | `npm test` | All suites: `node --import tsx --test tests/*.test.ts` |
| package | `npm run typecheck` | `tsc --noEmit` (strict, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) |
| package | `npm run build` | Clean and compile |
| package | `npm run demo` | Pricing example end to end in a temp repo (`KEEP=1` keeps it) |
| package | `npm run demo:m4` | CI gate variants on the engine fixture |
| package | `npm run demo:m6` | Change surface and association on the engine fixture |
| package | `npm run demo:m7` | Hosted demo smoke test: build, start, `/health`, `/ready`, one run, SIGTERM |
| root | `bash examples/behavioral-change/run.sh` | The canonical example against the built CLI |

## Tests

The suite uses `node:test` through `tsx`, with no test framework dependency. It covers:

- **Unit:** normalizer and digests, diff engine, schemas, config validation, exit-code mapping, change-surface parsing and limits, explanation wording gate, redaction.
- **Integration:** real temporary Git repositories driven through the CLI (`baseline` → change → `check` / `ci` / `explain`), dirty-tree policy, workflow subsets, stale-explain protection, reproducibility.
- **Process behavior (POSIX only):** timeouts killing process groups, real SIGINT/SIGTERM delivered to the CLI.
- **Hosted:** API validation and security, failure propagation, timeouts, concurrency, shutdown, and a production-path E2E (`npm run build && npm start`).
- **Packaging:** `npm pack` contents, and a packed-tarball user journey in a clean consumer project.
- **Example:** `examples/behavioral-change/run.sh` end to end.

Notes:

- Tests create temporary directories and Git repositories under the OS temp dir and remove them afterwards. They need `git` on `PATH` and set their own Git identity per repository.
- Some tests spawn servers and send signals; restricted sandboxes can cause spurious failures. Run them in a normal shell.
- One test is skipped by default: the live Featherless test, which needs `DIFFWITNESS_FEATHERLESS_LIVE=1` and a key. No test touches the network otherwise.
- Tests must be deterministic: no reliance on wall-clock values, ordering of filesystem listings or network access.

## Packaging

`packages/diffwitness/package.json` is `"private": true`; nothing is published yet. The tarball contains `dist/` (without `dist/hosted/`), `fixtures/`, `README.md` and `LICENSE`. Check it with:

```bash
cd packages/diffwitness
npm run build
npm pack --dry-run
```

`tests/packaging.test.ts` asserts that the CLI entry is present and the hosted server is not.

## Continuous integration

[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs on pushes to `main` and on pull requests, on Ubuntu with Node 20, 22 and 24: `npm ci`, build, typecheck, test, `npm pack --dry-run`, and the example. It has read-only permissions and uses no secrets. Dependabot proposes weekly updates for npm dependencies and GitHub Actions, and pull requests that change dependencies get a dependency review.

## Changing things safely

- **Findings, statuses or exit codes:** these are contracts. Change them only deliberately, with tests, a CHANGELOG entry, and updates to the [CLI reference](../reference/cli.md).
- **Persisted records and JSON output:** versioned (`schemaVersion`). Additive changes keep the version; incompatible changes bump it and must fail closed on unknown versions.
- **Config:** new fields go into the zod schema (strict), the `init` template if user-facing, and the [configuration reference](../reference/configuration.md).
- **AI:** providers only implement `explain(packet)`. Never give a provider execution, filesystem or repository access, and never let its output change findings or status. Prompt changes bump the prompt version.
- **Hosted demo:** it must keep running only built-in scenarios with MockAI. No visitor input may reach a command line.
