import { createHash } from "node:crypto";

/**
 * Digest algorithm (M1 lock):
 * - Algorithm: SHA-256
 * - Encoding: lowercase hexadecimal
 * - Wire form: `sha256:<hex>`
 *
 * Digests are computed over **normalized** bytes (see Normalizer), never raw unbounded streams.
 */
export const DIGEST_ALGORITHM = "sha256" as const;
export const DIGEST_PREFIX = "sha256:" as const;

export function digestBytes(bytes: Uint8Array | Buffer): string {
  const hex = createHash("sha256").update(bytes).digest("hex");
  return `${DIGEST_PREFIX}${hex}`;
}

export function digestUtf8(text: string): string {
  return digestBytes(Buffer.from(text, "utf8"));
}

export function isDigestString(value: string): boolean {
  return /^sha256:[0-9a-f]{64}$/.test(value);
}
