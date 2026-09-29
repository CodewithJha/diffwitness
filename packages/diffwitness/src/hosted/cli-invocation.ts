import { realpathSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PACKAGE_ROOT } from "./scenarios.js";
import type { Workspace } from "./workspace.js";

/**
 * argv prefix that launches the real DiffWitness CLI entry point.
 * Built server → `node dist/cli/main.js`; source server (tsx, tests) → `node --import tsx src/cli/main.ts`.
 * Resolved from this module's own location only — never from env or request input.
 */
export function defaultCliCommand(): readonly string[] {
  if (fileURLToPath(import.meta.url).endsWith(".ts")) {
    return [
      process.execPath,
      "--import",
      import.meta.resolve("tsx"),
      path.join(PACKAGE_ROOT, "src", "cli", "main.ts"),
    ];
  }
  return [process.execPath, path.join(PACKAGE_ROOT, "dist", "cli", "main.js")];
}

/**
 * Minimal allowlisted child environment. The server's own env (API keys such as
 * FEATHERLESS_API_KEY, host secrets) is never forwarded. HOME points into the run workspace and
 * system/global git config is disabled so host configuration cannot alter the demo.
 */
export function buildChildEnv(workspace: Workspace): Record<string, string> {
  return {
    PATH: process.env.PATH ?? "",
    HOME: workspace.homeDir,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: os.devNull,
    GIT_TERMINAL_PROMPT: "0",
    NO_COLOR: "1",
    LC_ALL: "C",
  };
}

/** Fixed identity + timestamps so fixture commits are reproducible. */
const GIT_IDENTITY_ENV = {
  GIT_AUTHOR_NAME: "DiffWitness Demo",
  GIT_AUTHOR_EMAIL: "demo@diffwitness.invalid",
  GIT_AUTHOR_DATE: "2026-10-01T00:00:00Z",
  GIT_COMMITTER_NAME: "DiffWitness Demo",
  GIT_COMMITTER_EMAIL: "demo@diffwitness.invalid",
  GIT_COMMITTER_DATE: "2026-10-01T00:00:00Z",
} as const;

export function buildGitEnv(workspace: Workspace): Record<string, string> {
  return { ...buildChildEnv(workspace), ...GIT_IDENTITY_ENV };
}

/** git argv with hooks, signing, and CRLF conversion disabled regardless of host config. */
export function gitArgv(args: readonly string[]): string[] {
  return [
    "git",
    "-c",
    `core.hooksPath=${os.devNull}`,
    "-c",
    "commit.gpgsign=false",
    "-c",
    "core.autocrlf=false",
    "-c",
    "core.pager=cat",
    ...args,
  ];
}

export const WORKSPACE_PLACEHOLDER = "<workspace>";
export const APP_PLACEHOLDER = "<app>";

const APP_ROOTS = [...new Set([PACKAGE_ROOT, safeRealpath(PACKAGE_ROOT)])];

/**
 * Replace the run's temp directory (as created and canonicalized) with `<workspace>`, and the
 * app install directory (only seen in crash stack traces) with `<app>`, so server filesystem paths
 * never reach visitors. These paths are only ever prefixes of locations, so the replacement does
 * not change any finding, id, digest, or status.
 */
export function scrubWorkspacePaths(text: string, workspace: Workspace): string {
  const replacements: [string, string][] = [
    ...[workspace.realRoot, workspace.root].map((r): [string, string] => [r, WORKSPACE_PLACEHOLDER]),
    ...APP_ROOTS.map((r): [string, string] => [r, APP_PLACEHOLDER]),
  ].sort((a, b) => b[0].length - a[0].length);
  let out = text;
  for (const [root, placeholder] of replacements) {
    out = out.split(root).join(placeholder);
  }
  return out;
}

function safeRealpath(p: string): string {
  try {
    return realpathSync(p);
  } catch {
    return p;
  }
}
