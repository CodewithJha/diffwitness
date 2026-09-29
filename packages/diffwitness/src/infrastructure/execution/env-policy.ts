import path from "node:path";
import { DiffWitnessError } from "../../domain/errors.js";
import type { EnvPolicy } from "../config/schema.js";

/**
 * Build child env from policy. Never interpolates shell; values are plain strings.
 */
export function buildProcessEnv(
  policy: EnvPolicy,
  workflowEnv: Readonly<Record<string, string>> | undefined,
): Record<string, string> {
  const overrides = workflowEnv ?? {};
  switch (policy) {
    case "none":
      return { ...overrides };
    case "path": {
      const pathValue = process.env.PATH ?? "";
      return { PATH: pathValue, ...overrides };
    }
    case "all": {
      const base: Record<string, string> = {};
      for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined) {
          base[key] = value;
        }
      }
      return { ...base, ...overrides };
    }
    default: {
      const _exhaustive: never = policy;
      return _exhaustive;
    }
  }
}

export function resolveWorkflowCwd(repoRoot: string, cwd: string | undefined): string {
  if (cwd === undefined || cwd.length === 0) {
    return repoRoot;
  }
  const resolved = path.resolve(repoRoot, cwd);
  const rootWithSep = repoRoot.endsWith(path.sep) ? repoRoot : `${repoRoot}${path.sep}`;
  if (resolved !== repoRoot && !resolved.startsWith(rootWithSep)) {
    throw new DiffWitnessError("config", `Workflow cwd escapes repository root: ${cwd}`, {
      exitClass: "user_error",
    });
  }
  return resolved;
}
