# Roadmap

Ideas under consideration, in no particular order and with no dates. **Nothing on this page exists yet.** What exists today is described in the [README](../README.md) and the [CLI reference](reference/cli.md); what changed is in the [CHANGELOG](../CHANGELOG.md).

Proposals and discussion are welcome in [GitHub Discussions](https://github.com/CodewithJha/diffwitness/discussions) or an issue.

## Distribution

- **Publish to npm.** The package is private today; install is from source (see [Getting started](getting-started.md#install)).
- **A ready-made GitHub Action** wrapping `baseline` on the base commit and `ci` on the head.

## Comparison

- **Pull-request base comparison.** Today `check` and `ci` compare against the locally stored active baseline. Comparing against a merge-base automatically would remove the manual baseline step in CI.
- **Structured observations.** Findings are per stream today (for example, the whole stdout). Field-level before/after for JSON output would make findings more precise.
- **Previews around the change.** Evidence stores the first 256 characters of the normalized output as a preview, and the terminal shows the first 120 of those, so a change deep in long output can look identical in both. Showing the first differing lines (the digests already prove the difference) would make these findings readable.
- **Artifact globs.** `artifactGlobs` accepts exact paths only.
- **More normalizers** for common volatile output (timestamps, durations, temporary paths).

## Local workflow

### Watch mode (investigated, not implemented)

A `diffwitness watch` command for local filesystem-triggered behavioral re-analysis was assessed against the current architecture and deliberately not built yet:

- **Unbounded evidence growth.** Every `check` stores new evidence, blobs and a comparison under `.diffwitness/`, and nothing is pruned. Re-running on every save would grow the directory without limit. A retention policy has to exist first.
- **Self-triggering.** Workflows write files (artifacts, caches, coverage, test output), and DiffWitness writes `.diffwitness/`. A watcher must ignore those without re-implementing Git's ignore rules, or it re-triggers itself.
- **Platform behavior.** Recursive `fs.watch` is native on macOS and Windows but emulated on Linux (a per-directory watcher tree in Node), which is costly on large trees such as `node_modules` and has had correctness gaps for newly created directories.
- **Interruption semantics.** The interrupt controller is designed for one run per process: the first SIGINT ends the run with exit `130` and nothing is saved. A long-lived loop needs clear rules for a signal arriving between runs versus during one.

A clean design would be: opt-in only, local only (never in the hosted demo), debounced, at most one run in flight, a minimum interval between runs, the existing `check` path unchanged (baseline never modified), clear "running" output, and Ctrl-C stopping the loop with exit `130`. Until then, run `diffwitness check` after changes, or use an editor task.

### Other

- **Evidence retention**: a command or policy to prune old evidence and comparisons.
- **Windows support.** Blob file names contain `:` (`sha256:…`), which Windows filesystems reject, and there are no process groups for timeout cleanup.

## Explanations

- More optional providers behind the same `explain(packet)` interface, with the same validation gate. AI will stay optional and will never decide findings, status or exit codes.
