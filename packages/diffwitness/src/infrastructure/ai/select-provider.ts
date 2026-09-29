import { DiffWitnessError } from "../../domain/errors.js";
import type { AiProvider } from "../../ports/ai-provider.js";
import { FeatherlessAIProvider, type FeatherlessConfigInput } from "./featherless-ai-provider.js";
import type { FetchLike } from "./featherless/http-client.js";
import { MockAIProvider } from "./mock-ai-provider.js";

export type AiProviderName = "mock" | "featherless" | "none";

export interface SelectAiProviderInput {
  readonly provider: AiProviderName;
  readonly modelId?: string;
  /** Required when provider=featherless (from config.ai.featherless + resolved model). */
  readonly featherless?: FeatherlessConfigInput;
  readonly env?: NodeJS.ProcessEnv;
  readonly fetchImpl?: FetchLike;
}

export type SelectedAiProvider =
  | { readonly kind: "provider"; readonly provider: AiProvider }
  | { readonly kind: "none"; readonly reason: string }
  | { readonly kind: "unavailable"; readonly reason: string };

/**
 * Resolve configured AI provider for `explain`.
 * Mock is mandatory offline path. Featherless is optional live HTTP — never silent mock fallback.
 * `none` means explanation skipped; findings remain visible.
 */
export function selectAiProvider(input: SelectAiProviderInput): SelectedAiProvider {
  switch (input.provider) {
    case "mock":
      return { kind: "provider", provider: new MockAIProvider() };
    case "none":
      return {
        kind: "none",
        reason: "ai.provider=none — explanation unavailable; BehavioralDiff findings unchanged",
      };
    case "featherless": {
      if (input.featherless === undefined) {
        return {
          kind: "unavailable",
          reason:
            "Featherless selected but ai.featherless config is missing — set baseUrl/model/apiKeyEnv",
        };
      }
      try {
        const provider = FeatherlessAIProvider.fromConfig(
          {
            ...input.featherless,
            model:
              input.featherless.model.trim().length > 0
                ? input.featherless.model
                : (input.modelId ?? ""),
          },
          input.env ?? process.env,
          input.fetchImpl,
        );
        return { kind: "provider", provider };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Surface as unavailable so runExplain keeps findings and exit 4 — no mock fallback.
        return { kind: "unavailable", reason: message };
      }
    }
    default: {
      const _exhaustive: never = input.provider;
      void _exhaustive;
      throw new DiffWitnessError("config", `Unknown ai.provider: ${String(input.provider)}`, {
        exitClass: "user_error",
      });
    }
  }
}
