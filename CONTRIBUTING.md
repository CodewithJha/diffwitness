# Contributing to DiffWitness

Thanks for your interest. Bug reports, documentation fixes, tests and focused features are all welcome.

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues go through [SECURITY.md](SECURITY.md), not public issues.

## Before you start

- **Bugs:** open an issue with the bug report form. Include the command, the output and your Node and Git versions.
- **Features:** open a feature request or a discussion first, so we can agree on scope before you write code. Check the [roadmap](docs/ROADMAP.md) and the [architecture rules](#architecture-rules) below.
- **Small fixes** (typos, docs, obvious bugs) can go straight to a pull request.

## Setup

Requirements: Node.js 20 or newer, Git, macOS or Linux.

```bash
git clone https://github.com/CodewithJha/diffwitness.git
cd diffwitness
npm ci
npm run build
npm run typecheck
npm test
```

Run the canonical example to see the tool work end to end:

```bash
bash examples/behavioral-change/run.sh
```

The code lives in `packages/diffwitness/`. For the repository layout, all scripts, and how the tests are organized, read the [development guide](docs/development/README.md). For how the pieces fit together, read the [architecture overview](docs/architecture/README.md).

## Making a change

1. Fork the repository and create a branch from `main`.
2. Keep the change focused: one bug or one feature per pull request.
3. Add or update tests for any behavior change.
4. Update the docs the change affects: the [CLI reference](docs/reference/cli.md), the [configuration reference](docs/reference/configuration.md), the README, and `CHANGELOG.md` under **Unreleased**.
5. Run the checks below and open a pull request using the template.

### Checks

From the repository root:

```bash
npm run build
npm run typecheck
npm test
bash examples/behavioral-change/run.sh
(cd packages/diffwitness && npm pack --dry-run)   # when you touch packaging or file layout
```

CI runs the same steps on Node 20, 22 and 24.

## Testing expectations

- New behavior comes with tests; bug fixes come with a test that fails without the fix.
- Prefer integration tests that drive the CLI against a temporary Git repository for anything user-visible, and unit tests for domain logic.
- Tests must be deterministic and offline: no network, no reliance on timing or on the machine's Git configuration (set the identity per test repository).
- Don't weaken or delete existing tests to make a change pass. If a test encodes behavior you intend to change, say so in the pull request.

## Architecture rules

These keep DiffWitness trustworthy. Pull requests that break them won't be merged.

- **Don't bypass the evidence model.** Findings come only from comparing stored evidence digests. Nothing may add, remove or alter a finding, severity or status outside the diff engine.
- **Keep the diff engine deterministic.** Same evidence in, same result out. No network, clocks or randomness in comparison.
- **Keep the AI boundary.** AI providers implement only `explain(packet)`. They never execute commands, read files, access Git, or influence findings, status or exit codes. Explanations stay validated (schema, citations, wording gate). No silent fallback between providers.
- **Never claim causality.** The change surface is co-occurrence only. Output and docs must not say a file caused a change.
- **Fail closed.** An analysis error, missing baseline or AI failure must never become a clean result. Unknown schema versions must be rejected.
- **Keep execution safe.** argv only (`shell: false`), timeouts, bounded output, process-group cleanup. Never execute anything derived from command output or model output.
- **Keep the hosted demo closed.** It runs only built-in scenarios with MockAI. No visitor-supplied code, repositories, URLs, configs or commands, and no accounts, tracking or databases.
- **Dependencies need a reason.** The CLI has three runtime dependencies. Adding one requires a justification in the pull request.
- **Small modules, typed interfaces, explicit errors.** Validate input at boundaries, and keep domain logic free of I/O.

## Pull request requirements

- A clear description of what changed and why, linked to an issue where one exists.
- Tests added or updated; `npm run typecheck` and `npm test` pass.
- Docs and `CHANGELOG.md` updated for user-visible changes.
- No secrets, credentials, personal data or machine-specific paths in code, tests, fixtures or docs.
- Exit codes, JSON output and persisted formats unchanged unless the pull request says so explicitly (they are contracts).
- Disclose AI tools used to write substantial parts of the change.

The maintainer reviews pull requests as time allows. Please be patient, and feel free to ask for feedback on a draft.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
