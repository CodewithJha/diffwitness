/**
 * Parse Featherless chat.completion content into Explanation JSON.
 * Adapter-only — domain uses parseExplanation after this.
 */
import { DiffWitnessError } from "../../../domain/errors.js";
import type { ChatCompletionResponse } from "./http-client.js";
import { featherlessError, redactSecrets } from "./http-client.js";

/**
 * Extract assistant message content from an OpenAI-compatible chat completion body.
 */
export function extractChatCompletionContent(parsed: unknown): string {
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw featherlessError("invalid_response", "Featherless response is not a JSON object");
  }
  const body = parsed as ChatCompletionResponse;
  const choices = body.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    throw featherlessError("invalid_response", "Featherless response missing choices[]");
  }
  const content = choices[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw featherlessError("invalid_response", "Featherless response missing message.content");
  }
  return content;
}

/**
 * Parse Explanation JSON from model content (raw JSON or fenced ```json block).
 */
export function parseExplanationJsonFromContent(content: string): unknown {
  const trimmed = content.trim();
  const candidates = [trimmed, stripMarkdownFence(trimmed)].filter(
    (c, i, arr) => c.length > 0 && arr.indexOf(c) === i,
  );

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch {
      // try next
    }
  }

  // Last resort: first {...} object substring
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const slice = trimmed.slice(start, end + 1);
    try {
      return JSON.parse(slice) as unknown;
    } catch {
      // fall through
    }
  }

  throw featherlessError(
    "invalid_response",
    "Featherless content is not valid Explanation JSON",
  );
}

function stripMarkdownFence(text: string): string {
  const match = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i);
  return match?.[1]?.trim() ?? text;
}

/**
 * Map schema validation failures to taxonomy code.
 */
export function asSchemaValidationError(error: unknown): DiffWitnessError {
  if (error instanceof DiffWitnessError) {
    const code = error.details?.code;
    if (code === "schema_validation_error" || code === "citation_validation_error") {
      return error;
    }
    return new DiffWitnessError("provider", redactSecrets(error.message), {
      exitClass: "explain_error",
      details: { code: "schema_validation_error", ...(error.details ?? {}) },
      ...(error.cause !== undefined ? { cause: error.cause } : {}),
    });
  }
  const message = error instanceof Error ? error.message : String(error);
  return featherlessError("schema_validation_error", message);
}

export function asCitationValidationError(error: unknown): DiffWitnessError {
  if (error instanceof DiffWitnessError) {
    return new DiffWitnessError("provider", redactSecrets(error.message), {
      exitClass: "explain_error",
      details: { code: "citation_validation_error", ...(error.details ?? {}) },
      ...(error.cause !== undefined ? { cause: error.cause } : {}),
    });
  }
  const message = error instanceof Error ? error.message : String(error);
  return featherlessError("citation_validation_error", message);
}
