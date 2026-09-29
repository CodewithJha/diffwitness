import {
  assertExplanationCitationsInPacket,
  parseExplanation,
} from "../../domain/schemas.js";
import type { EvidencePacket, Explanation } from "../../domain/types.js";
import { validateExplanationSemantics } from "../../domain/validate-explanation-semantics.js";
import type { AiProvider, ExplainOptions } from "../../ports/ai-provider.js";
import {
  EXPLAIN_PROMPT_VERSION,
  EXPLAIN_SYSTEM_PROMPT,
  buildExplainUserPrompt,
} from "./prompts/explain.v2.js";
import {
  DEFAULT_FEATHERLESS_BASE_URL,
  DEFAULT_FEATHERLESS_MAX_RESPONSE_BYTES,
  DEFAULT_FEATHERLESS_TIMEOUT_MS,
  featherlessError,
  postChatCompletions,
  type FetchLike,
} from "./featherless/http-client.js";
import {
  asCitationValidationError,
  asSchemaValidationError,
  extractChatCompletionContent,
  parseExplanationJsonFromContent,
} from "./featherless/parse-response.js";

export interface FeatherlessProviderOptions {
  /** Resolved API key — never log. */
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly model: string;
  readonly timeoutMs: number;
  readonly maxResponseBytes: number;
  readonly preferJsonObjectFormat?: boolean;
  readonly httpReferer?: string;
  readonly xTitle?: string;
  readonly fetchImpl?: FetchLike;
  /** Env accessor for tests — provider never reads repo/git/storage. */
  readonly env?: NodeJS.ProcessEnv;
}

export interface FeatherlessConfigInput {
  readonly apiKeyEnv: string;
  readonly baseUrl: string;
  readonly model: string;
  readonly timeoutMs: number;
  readonly maxResponseBytes?: number;
  readonly preferJsonObjectFormat?: boolean;
  readonly httpReferer?: string;
  readonly xTitle?: string;
}

/**
 * Live Featherless AI provider — OpenAI-compatible chat/completions only.
 * Receives ExplanationPacket / EvidencePacket only. No Git / Storage / ProcessExecutor / repo.
 * Never silently falls back to MockAI.
 */
export class FeatherlessAIProvider implements AiProvider {
  readonly name = "featherless";
  readonly promptVersion = EXPLAIN_PROMPT_VERSION;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly maxResponseBytes: number;
  private readonly preferJsonObjectFormat: boolean;
  private readonly httpReferer?: string;
  private readonly xTitle?: string;
  private readonly fetchImpl: FetchLike;

  constructor(options: FeatherlessProviderOptions) {
    if (options.apiKey.trim().length === 0) {
      throw featherlessError("missing_credentials", "Featherless API key is empty");
    }
    if (options.model.trim().length === 0) {
      throw featherlessError("configuration_error", "Featherless model is required");
    }
    if (options.baseUrl.trim().length === 0) {
      throw featherlessError("configuration_error", "Featherless baseUrl is required");
    }
    if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
      throw featherlessError("configuration_error", "Featherless timeoutMs must be positive");
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl;
    this.model = options.model;
    this.timeoutMs = options.timeoutMs;
    this.maxResponseBytes = options.maxResponseBytes;
    this.preferJsonObjectFormat = options.preferJsonObjectFormat !== false;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
    if (options.httpReferer !== undefined) {
      this.httpReferer = options.httpReferer;
    }
    if (options.xTitle !== undefined) {
      this.xTitle = options.xTitle;
    }
  }

  /**
   * Build from config + env. Does not hardcode secrets.
   * Throws missing_credentials / configuration_error when misconfigured.
   */
  static fromConfig(
    config: FeatherlessConfigInput,
    env: NodeJS.ProcessEnv = process.env,
    fetchImpl?: FetchLike,
  ): FeatherlessAIProvider {
    const apiKey = env[config.apiKeyEnv];
    if (apiKey === undefined || apiKey.trim().length === 0) {
      throw featherlessError(
        "missing_credentials",
        `Missing credentials: set env ${config.apiKeyEnv} for Featherless`,
      );
    }
    if (config.model.trim().length === 0) {
      throw featherlessError(
        "configuration_error",
        "ai.featherless.model (or ai.model) is required when provider=featherless",
      );
    }

    return new FeatherlessAIProvider({
      apiKey,
      baseUrl: config.baseUrl || DEFAULT_FEATHERLESS_BASE_URL,
      model: config.model,
      timeoutMs: config.timeoutMs > 0 ? config.timeoutMs : DEFAULT_FEATHERLESS_TIMEOUT_MS,
      maxResponseBytes: config.maxResponseBytes ?? DEFAULT_FEATHERLESS_MAX_RESPONSE_BYTES,
      preferJsonObjectFormat: config.preferJsonObjectFormat !== false,
      ...(config.httpReferer !== undefined ? { httpReferer: config.httpReferer } : {}),
      ...(config.xTitle !== undefined ? { xTitle: config.xTitle } : {}),
      ...(fetchImpl !== undefined ? { fetchImpl } : {}),
      env,
    });
  }

  async explain(packet: EvidencePacket, opts?: ExplainOptions): Promise<Explanation> {
    const modelId = opts?.modelId ?? this.model;
    const packetJson = JSON.stringify(packet);
    const userPrompt = buildExplainUserPrompt(packetJson);

    const requestBody = {
      model: modelId,
      messages: [
        { role: "system" as const, content: EXPLAIN_SYSTEM_PROMPT },
        { role: "user" as const, content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 2048,
      ...(this.preferJsonObjectFormat
        ? { response_format: { type: "json_object" as const } }
        : {}),
    };

    const httpResult = await postChatCompletions(
      {
        baseUrl: this.baseUrl,
        apiKey: this.apiKey,
        timeoutMs: this.timeoutMs,
        maxResponseBytes: this.maxResponseBytes,
        ...(this.httpReferer !== undefined ? { httpReferer: this.httpReferer } : {}),
        ...(this.xTitle !== undefined ? { xTitle: this.xTitle } : {}),
      },
      requestBody,
      this.fetchImpl,
    );

    let content: string;
    try {
      content = extractChatCompletionContent(httpResult.parsed);
    } catch (error) {
      throw error;
    }

    let rawJson: unknown;
    try {
      rawJson = parseExplanationJsonFromContent(content);
    } catch (error) {
      throw error;
    }

    // Ensure provider/model/promptVersion metadata — model may omit them.
    const enriched = enrichExplanationPayload(rawJson, {
      provider: this.name,
      modelId,
      promptVersion: EXPLAIN_PROMPT_VERSION,
    });

    let explanation: Explanation;
    try {
      explanation = parseExplanation(enriched);
    } catch (error) {
      throw asSchemaValidationError(error);
    }

    try {
      assertExplanationCitationsInPacket(explanation, packet);
    } catch (error) {
      throw asCitationValidationError(error);
    }

    try {
      validateExplanationSemantics(explanation, packet);
    } catch (error) {
      throw asSchemaValidationError(error);
    }

    return explanation;
  }
}

function enrichExplanationPayload(
  raw: unknown,
  meta: { provider: string; modelId: string; promptVersion: string },
): unknown {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw featherlessError("invalid_response", "Explanation payload must be a JSON object");
  }
  const obj = raw as Record<string, unknown>;
  return {
    ...obj,
    schemaVersion: obj.schemaVersion ?? 1,
    promptVersion: typeof obj.promptVersion === "string" ? obj.promptVersion : meta.promptVersion,
    provider: meta.provider,
    modelId: typeof obj.modelId === "string" ? obj.modelId : meta.modelId,
    facts: Array.isArray(obj.facts) ? obj.facts : [],
    hypotheses: Array.isArray(obj.hypotheses) ? obj.hypotheses : [],
    citations: Array.isArray(obj.citations) ? obj.citations : [],
    caveats: Array.isArray(obj.caveats) ? obj.caveats : [],
    narrative: typeof obj.narrative === "string" ? obj.narrative : "",
  };
}
