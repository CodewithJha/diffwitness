/**
 * Thin OpenAI-compatible HTTP client for Featherless.
 * Domain code must not import this module — adapter boundary only.
 */
import { DiffWitnessError } from "../../../domain/errors.js";
import type { FeatherlessErrorCode } from "./error-codes.js";

export const DEFAULT_FEATHERLESS_BASE_URL = "https://api.featherless.ai/v1";
export const DEFAULT_FEATHERLESS_TIMEOUT_MS = 30_000;
export const DEFAULT_FEATHERLESS_MAX_RESPONSE_BYTES = 512_000;

export interface FeatherlessHttpConfig {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly timeoutMs: number;
  readonly maxResponseBytes: number;
  /** Optional app attribution headers (docs recommend HTTP-Referer + X-Title). */
  readonly httpReferer?: string;
  readonly xTitle?: string;
}

export interface ChatCompletionMessage {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
}

export interface ChatCompletionRequest {
  readonly model: string;
  readonly messages: readonly ChatCompletionMessage[];
  readonly temperature?: number;
  readonly max_tokens?: number;
  /** Preferred when supported (OpenAI-compat / Featherless tool-calling JSON guidance). */
  readonly response_format?: { readonly type: "json_object" };
}

export interface ChatCompletionChoiceMessage {
  readonly role?: string;
  readonly content?: string | null;
}

export interface ChatCompletionChoice {
  readonly index?: number;
  readonly message?: ChatCompletionChoiceMessage;
  readonly finish_reason?: string | null;
}

export interface ChatCompletionResponse {
  readonly id?: string;
  readonly object?: string;
  readonly model?: string;
  readonly choices?: readonly ChatCompletionChoice[];
}

export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface FeatherlessHttpResult {
  readonly status: number;
  readonly bodyText: string;
  readonly parsed: unknown;
}

/**
 * POST /chat/completions with AbortController timeout and bounded body read.
 * Never logs Authorization or request/response bodies.
 */
export async function postChatCompletions(
  config: FeatherlessHttpConfig,
  body: ChatCompletionRequest,
  fetchImpl: FetchLike = globalThis.fetch,
): Promise<FeatherlessHttpResult> {
  const base = config.baseUrl.replace(/\/+$/, "");
  const url = `${base}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`,
  };
  if (config.httpReferer !== undefined) {
    headers["HTTP-Referer"] = config.httpReferer;
  }
  if (config.xTitle !== undefined) {
    headers["X-Title"] = config.xTitle;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (cause) {
    if (isAbortError(cause)) {
      throw featherlessError("timeout", `Featherless request timed out after ${config.timeoutMs}ms`, {
        cause,
      });
    }
    throw featherlessError("network_error", "Featherless network request failed", { cause });
  } finally {
    clearTimeout(timer);
  }

  const bodyText = await readBoundedText(response, config.maxResponseBytes);
  let parsed: unknown = null;
  if (bodyText.length > 0) {
    try {
      parsed = JSON.parse(bodyText) as unknown;
    } catch {
      parsed = null;
    }
  }

  if (response.status >= 200 && response.status < 300) {
    return { status: response.status, bodyText, parsed };
  }

  throw mapHttpStatusToError(response.status, sanitizeProviderMessage(parsed, bodyText));
}

function mapHttpStatusToError(status: number, message: string): DiffWitnessError {
  if (status === 401) {
    return featherlessError("authentication_error", message || "Featherless authentication failed (401)");
  }
  if (status === 403) {
    return featherlessError("authorization_error", message || "Featherless authorization failed (403)");
  }
  if (status === 408) {
    return featherlessError("timeout", message || "Featherless request timed out (408)");
  }
  if (status === 429) {
    return featherlessError("rate_limited", message || "Featherless rate limited (429)");
  }
  if (status === 400) {
    // Docs: cold/not-ready model often returns 400 — treat as provider_unavailable.
    return featherlessError(
      "provider_unavailable",
      message || "Featherless rejected request (400) — model may be cold or invalid",
    );
  }
  if (status >= 500 && status < 600) {
    return featherlessError(
      "provider_unavailable",
      message || `Featherless provider unavailable (${status})`,
    );
  }
  return featherlessError(
    "invalid_response",
    message || `Unexpected Featherless HTTP status ${status}`,
  );
}

async function readBoundedText(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader();
  if (reader === undefined || reader === null) {
    const text = await response.text();
    if (byteLengthUtf8(text) > maxBytes) {
      throw featherlessError(
        "invalid_response",
        `Featherless response exceeded maxResponseBytes (${maxBytes})`,
      );
    }
    return text;
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (value === undefined) {
        continue;
      }
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw featherlessError(
          "invalid_response",
          `Featherless response exceeded maxResponseBytes (${maxBytes})`,
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const merged = concatUint8(chunks, total);
  return new TextDecoder("utf-8").decode(merged);
}

function concatUint8(chunks: readonly Uint8Array[], total: number): Uint8Array {
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

function byteLengthUtf8(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

function sanitizeProviderMessage(parsed: unknown, raw: string): string {
  // Never echo secrets; prefer short provider error message if present.
  if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
    const err = (parsed as { error?: unknown }).error;
    if (typeof err === "string") {
      return redactSecrets(err).slice(0, 400);
    }
    if (err !== null && typeof err === "object" && !Array.isArray(err)) {
      const msg = (err as { message?: unknown }).message;
      if (typeof msg === "string") {
        return redactSecrets(msg).slice(0, 400);
      }
    }
  }
  if (raw.length === 0) {
    return "";
  }
  return redactSecrets(raw).slice(0, 200);
}

/** Strip Bearer tokens / long hex-like secrets from error strings. */
export function redactSecrets(text: string): string {
  return text
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [REDACTED]")
    .replace(/\bsk-[A-Za-z0-9]{8,}\b/g, "[REDACTED]")
    .replace(/\b[A-Fa-f0-9]{32,}\b/g, "[REDACTED]");
}

export function featherlessError(
  code: FeatherlessErrorCode,
  message: string,
  options?: { cause?: unknown },
): DiffWitnessError {
  return new DiffWitnessError("provider", redactSecrets(message), {
    exitClass: "explain_error",
    details: { code },
    ...(options?.cause !== undefined ? { cause: options.cause } : {}),
  });
}

function isAbortError(error: unknown): boolean {
  if (error === null || typeof error !== "object") {
    return false;
  }
  const name = (error as { name?: string }).name;
  return name === "AbortError" || name === "TimeoutError";
}
