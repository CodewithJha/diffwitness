import { writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Config for the engine-test fixture (fixtures/demo): stdout + one artifact. `diffwitness init`
 * writes a placeholder template, so integration tests install this after init.
 */
export const DEMO_FIXTURE_CONFIG_YAML = `version: 1
baseRef: origin/main
workflows:
  - id: demo
    name: demo
    command: ["node", "fixtures/demo/run.mjs"]
    timeoutMs: 60000
    artifactGlobs: ["fixtures/demo/out/result.json"]
    normalize:
      stripAnsi: true
      redactEnv: ["API_KEY", "TOKEN"]
assumptions:
  - id: demo-output-stable
    description: Demo workflow stdout contract for ranking
ai:
  provider: mock
  maxChars: 8000
  maxFindings: 20
  maxExcerpts: 10
  maxExcerptChars: 200
  maxPaths: 40
  featherless:
    apiKeyEnv: FEATHERLESS_API_KEY
    baseUrl: https://api.featherless.ai/v1
    model: Qwen/Qwen2.5-7B-Instruct
    timeoutMs: 30000
    maxResponseBytes: 512000
    preferJsonObjectFormat: true
privacy:
  sendCodeBodies: false
execution:
  allowCommands: true
  maxConcurrent: 1
  maxStdoutBytes: 1048576
  maxStderrBytes: 1048576
  envPolicy: path
`;

export async function installDemoConfig(repo: string): Promise<void> {
  await writeFile(path.join(repo, ".diffwitness", "config.yaml"), DEMO_FIXTURE_CONFIG_YAML, "utf8");
}

/** After a successful `init` through a test CLI helper, point the config at fixtures/demo. */
export async function afterInit(repo: string, argv: readonly string[], code: number): Promise<void> {
  if (argv[0] === "init" && code === 0) {
    await installDemoConfig(repo);
  }
}
