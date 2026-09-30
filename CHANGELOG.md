# Changelog

All notable changes to DiffWitness are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Before 1.0, minor versions may change CLI output, config or storage formats; such changes are called out here.

Planned work that does not exist yet lives in the [roadmap](docs/ROADMAP.md), not here.

## [Unreleased]

### Added

- `examples/behavioral-change/`: a runnable example project with `run.sh`, which runs the full workflow in a temporary Git repository, and an automated test that runs it.
- Documentation structure under `docs/`: getting started, CLI and configuration references, architecture overview with diagrams, security model, development guide, hosted demo reference and roadmap.
- Contributor files: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, issue and pull request templates, `CODEOWNERS`.
- GitHub Actions CI (Node 20, 22 and 24: build, typecheck, test, pack dry run, example), dependency review on pull requests, and Dependabot configuration.

### Changed

- README rewritten around local use of the CLI; the hosted demo is described as a controlled demonstration.
- `docs/ARCHITECTURE.md` and `docs/CLI-SPECIFICATION.md` were replaced by `docs/architecture/README.md` and `docs/reference/cli.md`; the AI architecture, technical specification, threat model and Featherless docs moved under `docs/architecture/`, `docs/security/` and `docs/reference/`. Planning-era documents are marked as historical.
- The package README is now a short CLI overview that links to the full documentation.

### Fixed

- `npm run build` keeps `dist/cli/main.js` executable, so a CLI installed with `npm link` keeps working after a rebuild (it failed with "permission denied" before).

## [0.1.0] - 2026-09-29

First public release. Install from source; the package is not published to npm.

### Added

- CLI commands `init`, `baseline`, `check`, `explain` and `ci`.
- Workflows: argv-only commands from `.diffwitness/config.yaml` with timeouts, output caps, per-workflow environment policy, working-directory confinement and exact-path artifacts.
- Evidence: exit code, normalized stdout and stderr, and artifacts, stored with SHA-256 digests, bounded previews and evidence IDs under `.diffwitness/`; deterministic normalization (ANSI stripping, ignored lines, sorting, environment-value redaction, byte caps).
- Deterministic diff engine with statuses `clean`, `findings` and `analysis_error`; per-finding before/after previews and severities (`warn` for output changes, `error` for exit-code changes).
- Git change surface since the baseline commit, associated with findings as co-occurrence only (`Causality: not established`).
- `ci` gate with versioned JSON output, source-clean enforcement and exit codes `0`/`1`/`2`/`3`/`4` (precedence `3 > 1 > 4 > 0`); `130`/`143` on interruption, with nothing persisted.
- Process-group cleanup of workflows on timeout and interruption (POSIX).
- `explain` with the deterministic offline MockAI provider (default) and `none`; bounded, redacted evidence packet; schema, citation and wording validation of every explanation.
- Hosted demo server running the real CLI on a built-in pricing scenario in a temporary repository, MockAI only, with `/health` and `/ready`.

### Experimental

- Featherless provider (`--provider featherless`): a live OpenAI-compatible model for explanations only. Opt-in, needs your own `FEATHERLESS_API_KEY`, never used by the hosted demo or CI by default, and tested against mocked HTTP (the live test is opt-in).

### Known limitations

- Comparison is against a locally stored baseline; no pull-request or merge-base inference.
- Findings are per output stream, not per field.
- `execution.maxConcurrent` and `privacy.sendCodeBodies` are accepted but have no effect.
- Windows is not supported.

[Unreleased]: https://github.com/CodewithJha/diffwitness/compare/83d4a20...HEAD
[0.1.0]: https://github.com/CodewithJha/diffwitness/commits/83d4a20
