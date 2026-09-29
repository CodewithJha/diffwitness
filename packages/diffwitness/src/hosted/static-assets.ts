import { readFileSync } from "node:fs";
import path from "node:path";
import { PACKAGE_ROOT } from "./scenarios.js";

export interface StaticAsset {
  readonly body: Buffer;
  readonly contentType: string;
}

export const DEFAULT_PUBLIC_DIR = path.join(PACKAGE_ROOT, "hosted", "public");

/**
 * Fixed URL → file allowlist, loaded once at startup. Request paths are only ever map keys,
 * never joined onto the filesystem, so traversal is impossible by construction.
 */
const ASSET_FILES: Readonly<Record<string, { file: string; contentType: string }>> = {
  "/": { file: "index.html", contentType: "text/html; charset=utf-8" },
  "/index.html": { file: "index.html", contentType: "text/html; charset=utf-8" },
  "/app.js": { file: "app.js", contentType: "text/javascript; charset=utf-8" },
  "/styles.css": { file: "styles.css", contentType: "text/css; charset=utf-8" },
};

export function loadStaticAssets(publicDir: string): ReadonlyMap<string, StaticAsset> {
  const assets = new Map<string, StaticAsset>();
  for (const [urlPath, { file, contentType }] of Object.entries(ASSET_FILES)) {
    assets.set(urlPath, { body: readFileSync(path.join(publicDir, file)), contentType });
  }
  return assets;
}
