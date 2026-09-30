# Security policy

## Supported versions

DiffWitness is pre-1.0. Security fixes are made on the `main` branch and included in the next release.

| Version | Supported |
|---|---|
| `main` / 0.1.x | Yes |
| Anything older | No |

## Reporting a vulnerability

**Please do not report security vulnerabilities in public issues, discussions or pull requests.**

Report privately through GitHub:

1. Go to the repository's [Security tab](https://github.com/CodewithJha/diffwitness/security).
2. Choose **Report a vulnerability** to open a private security advisory.

Only the maintainer can see the report. If the button is unavailable, open a public issue that says only that you need a private channel for a security report, with no details, and the maintainer will follow up.

## What to include

- The affected component: the CLI (which command), the hosted demo, or the build and release setup
- The version or commit
- Steps to reproduce, or a proof of concept
- The impact you expect (for example, command execution on the hosted demo, secret exposure in evidence or AI packets, a false clean result)
- Any suggested fix

## Scope

In scope, for example:

- The hosted demo executing anything other than its built-in scenario, leaking server environment or filesystem paths, or failing to clean up
- The CLI executing commands that are not in the user's config, or passing model output to a process
- Secrets reaching an AI provider despite redaction, or API keys appearing in output or logs
- Findings, status or exit codes being alterable by AI output, or an analysis failure being reported as clean
- Path traversal outside the repository through config values

Out of scope, by design (see the [security model](docs/security/README.md)):

- Commands in a repository's own `.diffwitness/config.yaml` doing harmful things. DiffWitness runs the workflows you configure, like any test runner, and is not a sandbox for untrusted repositories.
- Denial of service against the hosted demo by volume alone; it has concurrency and time limits but no per-client rate limiting.
- Behavior on Windows, which is not supported.

## Process

1. The maintainer acknowledges the report and may ask follow-up questions in the private advisory.
2. The issue is confirmed and a fix is developed privately where possible.
3. A fix is released and the advisory is published, crediting the reporter unless they prefer otherwise.

This is a solo-maintained project, so there is no guaranteed response time. Reports are handled as quickly as possible, and please allow reasonable time for a fix before any public disclosure.
