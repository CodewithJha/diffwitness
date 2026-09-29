import { parse as parseYaml } from "yaml";
import { parseDiffWitnessConfig, type DiffWitnessConfig } from "./schema.js";

/** Placeholder script path in the init template; baseline/check refuse to run it. */
export const TEMPLATE_PLACEHOLDER_ARG = "path/to/workflow.mjs";

/**
 * Commented config written by `diffwitness init`. The example workflow is a placeholder the user
 * must edit; `defaultConfig()` is this template parsed, so both always agree.
 */
export const DEFAULT_CONFIG_TEMPLATE = `# DiffWitness configuration.
# Edit the example workflow below, commit this file, then run \`diffwitness baseline\`.
#
# A workflow is a command DiffWitness runs to observe behavior. Each run records the exit code,
# normalized stdout/stderr and any listed artifact files as evidence; \`diffwitness check\` reruns
# the workflows and reports what changed compared with the baseline.
#
#  - command is an argv list (no shell), run from the repository root.
#  - Output should be deterministic: no timestamps, random ids or durations. Drop volatile
#    lines with normalize.ignoreLinePatterns (regular expressions).
version: 1

# Git ref recorded as the base identity. Comparisons always use the stored baseline.
baseRef: origin/main

workflows:
  # TODO: replace this example with a command whose output you care about, e.g.
  #   command: ["node", "scripts/print-report.mjs"]
  #   command: ["npm", "test", "--silent"]
  - id: example
    name: Example workflow (edit me)
    command: ["node", "${TEMPLATE_PLACEHOLDER_ARG}"]
    timeoutMs: 60000
    # artifactGlobs: ["out/report.json"]   # exact repo-relative files to capture as evidence
    normalize:
      stripAnsi: true
      redactEnv: ["API_KEY", "TOKEN"]      # values of these env vars are masked in evidence
      # ignoreLinePatterns: ["^duration"]

# Declared assumptions are listed in reports whenever a finding exists (not inferred).
assumptions: []
#  - id: report-format-stable
#    description: The report format only changes on purpose.

ai:
  # mock: deterministic offline explainer (default).
  # featherless: live model via an OpenAI-compatible API; needs FEATHERLESS_API_KEY in the env.
  provider: mock
  # featherless:
  #   model: Qwen/Qwen2.5-7B-Instruct

privacy:
  sendCodeBodies: false

execution:
  allowCommands: true
  # Environment passed to workflows: none | path (PATH + workflow env) | all
  envPolicy: path
`;

/** Deterministic default config (the parsed init template). */
export function defaultConfig(): DiffWitnessConfig {
  return parseDiffWitnessConfig(parseYaml(DEFAULT_CONFIG_TEMPLATE));
}

export const DIFFWITNESS_DIR = ".diffwitness";
export const CONFIG_FILE_NAME = "config.yaml";
export const META_GITIGNORE = `.gitignore`;

export const DEFAULT_DIFFWITNESS_GITIGNORE = `# DiffWitness local state — do not commit operational artifacts
# Keep config.yaml (and this file) eligible for version control.
cache/
evidence/
blobs/
baselines/
runs/
`;

/** Persisted artifact schema version (Evidence / Baseline envelopes). */
export const PERSISTENCE_SCHEMA_VERSION = 1 as const;
export const ACTIVE_BASELINE_FILENAME = "active.json";
