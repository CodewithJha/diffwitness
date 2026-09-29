import path from "node:path";
import { DiffWitnessError } from "../domain/errors.js";
import {
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG_TEMPLATE,
  DEFAULT_DIFFWITNESS_GITIGNORE,
  defaultConfig,
  META_GITIGNORE,
  DIFFWITNESS_DIR,
} from "../infrastructure/config/defaults.js";
import { loadConfig, writeConfigText } from "../infrastructure/config/load.js";
import { parseDiffWitnessConfig } from "../infrastructure/config/schema.js";
import { detectRepositoryRoot } from "../infrastructure/git/detect-repository.js";
import type { StoragePort } from "../ports/storage.js";

export interface InitProjectInput {
  readonly cwd: string;
  readonly repoPath?: string;
  readonly force?: boolean;
  readonly wipe?: boolean;
}

export interface InitProjectResult {
  readonly repoRoot: string;
  readonly diffwitnessDir: string;
  readonly configPath: string;
  readonly created: readonly string[];
  readonly overwritten: boolean;
}

const LAYOUT_DIRS = ["baselines", "evidence", "blobs", "runs", "cache"] as const;

/**
 * `diffwitness init` use case: detect repo, create metadata/config, validate.
 * No AI. No full codebase scan. Deterministic.
 */
export async function initProject(
  storage: StoragePort,
  input: InitProjectInput,
): Promise<InitProjectResult> {
  const start = path.resolve(input.repoPath ?? input.cwd);
  const repoRoot = await detectRepositoryRoot(storage, start);
  const diffwitnessDir = path.join(repoRoot, DIFFWITNESS_DIR);
  const configPath = path.join(diffwitnessDir, CONFIG_FILE_NAME);
  const force = input.force === true;
  const wipe = input.wipe === true;

  const configExists = await storage.exists(configPath);
  if (configExists && !force) {
    throw new DiffWitnessError(
      "config",
      `DiffWitness already initialized at ${configPath} (pass --force to overwrite config)`,
      {
        exitClass: "user_error",
        details: { code: "already_exists", configPath },
      },
    );
  }

  if (wipe) {
    // M0: wipe only empties evidence-related dirs when --force --wipe; keep structure.
    if (!force) {
      throw new DiffWitnessError("config", "--wipe requires --force", {
        exitClass: "user_error",
      });
    }
    for (const name of ["baselines", "evidence", "blobs", "runs", "cache"] as const) {
      // ensureDir is enough for M0 foundation; full recursive delete deferred
      await storage.ensureDir(path.join(diffwitnessDir, name));
    }
  }

  const created: string[] = [];
  await storage.ensureDir(diffwitnessDir);
  created.push(DIFFWITNESS_DIR);

  for (const name of LAYOUT_DIRS) {
    const dir = path.join(diffwitnessDir, name);
    await storage.ensureDir(dir);
    created.push(`${DIFFWITNESS_DIR}/${name}/`);
  }

  const gitignorePath = path.join(diffwitnessDir, META_GITIGNORE);
  const gitignoreExists = await storage.exists(gitignorePath);
  if (!gitignoreExists || force) {
    await storage.writeText(gitignorePath, DEFAULT_DIFFWITNESS_GITIGNORE, {
      overwrite: force || gitignoreExists,
    });
    created.push(`${DIFFWITNESS_DIR}/${META_GITIGNORE}`);
  }

  // Validate the template before write (fail closed on schema drift).
  parseDiffWitnessConfig(defaultConfig());

  await writeConfigText(storage, configPath, DEFAULT_CONFIG_TEMPLATE, { overwrite: force });
  created.push(`${DIFFWITNESS_DIR}/${CONFIG_FILE_NAME}`);

  // Round-trip validate from storage.
  const loaded = await loadConfig(storage, configPath);
  parseDiffWitnessConfig(loaded);

  return {
    repoRoot,
    diffwitnessDir,
    configPath,
    created: Object.freeze([...new Set(created)]),
    overwritten: configExists && force,
  };
}

export function formatInitHuman(result: InitProjectResult): string {
  const lines = [
    result.overwritten ? "DiffWitness re-initialized." : "DiffWitness initialized.",
    `Repository: ${result.repoRoot}`,
    `Config:     ${result.configPath}`,
    "Layout:",
    ...result.created.map((p) => `  - ${p}`),
    "",
    "Next:",
    "  1. Edit .diffwitness/config.yaml: replace the example workflow command with a real one.",
    "  2. Commit .diffwitness/config.yaml and .diffwitness/.gitignore.",
    "  3. Capture a baseline: diffwitness baseline",
  ];
  return lines.join("\n");
}

export function formatInitJson(result: InitProjectResult): string {
  return `${JSON.stringify(
    {
      schemaVersion: 1,
      command: "init",
      status: "ok",
      repoRoot: result.repoRoot,
      configPath: result.configPath,
      overwritten: result.overwritten,
      created: result.created,
      configPreview: DEFAULT_CONFIG_TEMPLATE.trim(),
    },
    null,
    2,
  )}\n`;
}
