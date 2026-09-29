import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { DiffWitnessError } from "../../domain/errors.js";
import type { StoragePort } from "../../ports/storage.js";
import { CONFIG_FILE_NAME, DIFFWITNESS_DIR } from "./defaults.js";
import { parseDiffWitnessConfig, type DiffWitnessConfig } from "./schema.js";

export function configPathForRepo(repoRoot: string, override?: string): string {
  if (override !== undefined && override.length > 0) {
    return override;
  }
  return `${repoRoot.replace(/\/$/, "")}/${DIFFWITNESS_DIR}/${CONFIG_FILE_NAME}`;
}

export function serializeConfig(config: DiffWitnessConfig): string {
  return stringifyYaml(config, { lineWidth: 100 });
}

export async function loadConfig(
  storage: StoragePort,
  absoluteConfigPath: string,
): Promise<DiffWitnessConfig> {
  const exists = await storage.exists(absoluteConfigPath);
  if (!exists) {
    const defaultSuffix = `/${DIFFWITNESS_DIR}/${CONFIG_FILE_NAME}`;
    const shown = absoluteConfigPath.endsWith(defaultSuffix)
      ? `${DIFFWITNESS_DIR}/${CONFIG_FILE_NAME}`
      : absoluteConfigPath;
    throw new DiffWitnessError(
      "config",
      `Config not found: ${shown} — run \`diffwitness init\` in the repository first (or pass --config <path>)`,
    );
  }
  let raw: string;
  try {
    raw = await storage.readText(absoluteConfigPath);
  } catch (cause) {
    throw new DiffWitnessError("storage", `Failed to read config: ${absoluteConfigPath}`, { cause });
  }
  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (cause) {
    throw new DiffWitnessError("config", `Config is not valid YAML: ${absoluteConfigPath}`, { cause });
  }
  return parseDiffWitnessConfig(parsed);
}

export async function writeConfig(
  storage: StoragePort,
  absoluteConfigPath: string,
  config: DiffWitnessConfig,
  options: { overwrite: boolean },
): Promise<void> {
  await writeConfigText(storage, absoluteConfigPath, serializeConfig(config), options);
}

/** Write config YAML text verbatim (keeps comments). Callers validate the text first. */
export async function writeConfigText(
  storage: StoragePort,
  absoluteConfigPath: string,
  body: string,
  options: { overwrite: boolean },
): Promise<void> {
  const exists = await storage.exists(absoluteConfigPath);
  if (exists && !options.overwrite) {
    throw new DiffWitnessError("config", `Config already exists: ${absoluteConfigPath}`, {
      exitClass: "user_error",
      details: { code: "already_exists" },
    });
  }
  try {
    await storage.writeText(absoluteConfigPath, body, { overwrite: options.overwrite });
  } catch (cause) {
    if (cause instanceof DiffWitnessError) {
      throw cause;
    }
    throw new DiffWitnessError("storage", `Failed to write config: ${absoluteConfigPath}`, { cause });
  }
}
