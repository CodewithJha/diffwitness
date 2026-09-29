/**
 * Featherless / live-provider error taxonomy (M5).
 * Mapped onto DiffWitnessError.details.code; never collapses BehavioralDiff to clean.
 */
export const FEATHERLESS_ERROR_CODES = [
  "missing_credentials",
  "configuration_error",
  "network_error",
  "timeout",
  "authentication_error",
  "authorization_error",
  "rate_limited",
  "provider_unavailable",
  "invalid_response",
  "schema_validation_error",
  "citation_validation_error",
] as const;

export type FeatherlessErrorCode = (typeof FEATHERLESS_ERROR_CODES)[number];

export function isFeatherlessErrorCode(value: unknown): value is FeatherlessErrorCode {
  return (
    typeof value === "string" &&
    (FEATHERLESS_ERROR_CODES as readonly string[]).includes(value)
  );
}
