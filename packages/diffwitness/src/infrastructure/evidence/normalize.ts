import type { BoundedNormalizedRep, NormalizeSpec } from "../../domain/types.js";
import { digestBytes } from "./digest.js";

/**
 * Normalization version — bump when rules change so digests are not silently incompatible.
 * M1: minimal deterministic rules; no LLM; full redaction/sort deferred.
 */
export const NORMALIZER_VERSION = "normalize-v1" as const;

export interface NormalizeResult {
  readonly version: typeof NORMALIZER_VERSION;
  readonly bytes: Buffer;
  readonly truncatedByMaxBytes: boolean;
  readonly rep: BoundedNormalizedRep;
  readonly redactionApplied: boolean;
}

export interface Normalizer {
  readonly version: typeof NORMALIZER_VERSION;
  apply(raw: Buffer, spec?: NormalizeSpec, previewMaxChars?: number): NormalizeResult;
}

const ANSI_RE = /\u001b\[[0-9;]*m/g;

/**
 * Deterministic Normalizer:
 * 1. Decode as UTF-8 (lossy replacement kept stable via Buffer round-trip of filtered text)
 * 2. Optional strip ANSI
 * 3. Normalize line endings to `\n`
 * 4. Optional ignoreLinePatterns (drop matching lines)
 * 5. Optional stableSortLines
 * 6. Bound to maxBytes from spec (default: no extra bound beyond caller-provided raw)
 * Digests use the final normalized bytes.
 */
export class DeterministicNormalizer implements Normalizer {
  readonly version = NORMALIZER_VERSION;

  apply(raw: Buffer, spec?: NormalizeSpec, previewMaxChars = 256): NormalizeResult {
    let text = raw.toString("utf8");
    let redactionApplied = false;

    if (spec?.stripAnsi === true) {
      text = text.replace(ANSI_RE, "");
    }

    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    if (spec?.ignoreLinePatterns !== undefined && spec.ignoreLinePatterns.length > 0) {
      const patterns = spec.ignoreLinePatterns.map((p) => new RegExp(p));
      text = text
        .split("\n")
        .filter((line) => !patterns.some((re) => re.test(line)))
        .join("\n");
    }

    if (spec?.stableSortLines === true) {
      const lines = text.split("\n");
      const endsWithNl = text.endsWith("\n");
      const body = endsWithNl ? lines.slice(0, -1) : lines;
      body.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      text = endsWithNl ? `${body.join("\n")}\n` : body.join("\n");
    }

    // redactEnv: replace exact env *values* if present in process.env — best-effort, marks redaction.
    if (spec?.redactEnv !== undefined) {
      for (const key of spec.redactEnv) {
        const value = process.env[key];
        if (value !== undefined && value.length > 0) {
          if (text.includes(value)) {
            text = text.split(value).join(`[REDACTED:${key}]`);
            redactionApplied = true;
          }
        }
      }
    }

    let bytes = Buffer.from(text, "utf8");
    let truncatedByMaxBytes = false;
    const maxBytes = spec?.maxBytes;
    if (maxBytes !== undefined && bytes.byteLength > maxBytes) {
      bytes = bytes.subarray(0, maxBytes);
      truncatedByMaxBytes = true;
    }

    const digest = digestBytes(bytes);
    const previewSource = bytes.toString("utf8");
    const truncatedPreview = previewSource.length > previewMaxChars;
    const preview = truncatedPreview
      ? previewSource.slice(0, previewMaxChars)
      : previewSource;

    return {
      version: NORMALIZER_VERSION,
      bytes,
      truncatedByMaxBytes,
      redactionApplied,
      rep: {
        digest,
        preview,
        maxChars: previewMaxChars,
        truncated: truncatedPreview || truncatedByMaxBytes,
        byteLength: bytes.byteLength,
      },
    };
  }
}
