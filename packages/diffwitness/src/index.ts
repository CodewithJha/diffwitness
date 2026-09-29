export * from "./domain/index.js";
export type { AiProvider, ExplainOptions } from "./ports/ai-provider.js";
export type { StoragePort, WriteTextOptions, WriteBytesOptions } from "./ports/storage.js";
export type { GitPort } from "./ports/git.js";
export type { ProcessExecutor, ProcessExecuteRequest, ProcessExecuteResult } from "./ports/process-executor.js";
export type { Clock } from "./ports/clock.js";
export type { IdGenerator } from "./ports/id-generator.js";
export { MockAIProvider, assertProviderIsExplainOnly } from "./infrastructure/ai/mock-ai-provider.js";
export { FeatherlessAIProvider } from "./infrastructure/ai/featherless-ai-provider.js";
export { selectAiProvider } from "./infrastructure/ai/select-provider.js";
export { EXPLAIN_PROMPT_VERSION } from "./infrastructure/ai/prompts/explain.v2.js";
export {
  DEFAULT_FEATHERLESS_BASE_URL,
  DEFAULT_FEATHERLESS_TIMEOUT_MS,
} from "./infrastructure/ai/featherless/http-client.js";
export { FEATHERLESS_ERROR_CODES } from "./infrastructure/ai/featherless/error-codes.js";
export type { FeatherlessErrorCode } from "./infrastructure/ai/featherless/error-codes.js";
export { FsStorage } from "./infrastructure/storage/fs-storage.js";
export { LocalGitPort } from "./infrastructure/git/local-git.js";
export { ChildProcessExecutor } from "./infrastructure/execution/process-executor.js";
export { parseDiffWitnessConfig } from "./infrastructure/config/schema.js";
export { defaultConfig } from "./infrastructure/config/defaults.js";
export { initProject } from "./application/init-project.js";
export { createBaseline } from "./application/create-baseline.js";
export { runCheck, exitCodeForCheck } from "./application/run-check.js";
export { runExplain } from "./application/run-explain.js";
export {
  runCi,
  formatCiJson,
  formatCiHuman,
  normalizeCiReportForCompare,
  CI_REPORT_SCHEMA_VERSION,
} from "./application/run-ci.js";
export {
  isDiffwitnessOperationalPath,
  isSourceDirty,
  sourceDirtyFiles,
  isSourceRelevantPath,
} from "./application/dirty-policy.js";
export { assertPersistenceSchemaVersion } from "./infrastructure/evidence/evidence-store.js";
export { buildProcessEnv, resolveWorkflowCwd } from "./infrastructure/execution/env-policy.js";
export { buildExplanationPacket } from "./application/build-explanation-packet.js";
export { captureChangeSurface, confirmExecutedState } from "./application/capture-change-surface.js";
export { redactExplanationPacket } from "./application/redact-packet.js";
export { compareEvidence, findingTypeForKey } from "./domain/diff-engine.js";
export {
  parseEvidencePacket,
  parseExplanation,
  assertExplanationCitationsInPacket,
} from "./domain/schemas.js";
export { runCli, createProgram, CLI_VERSION } from "./cli/program.js";
export { digestBytes, digestUtf8, DIGEST_ALGORITHM, DIGEST_PREFIX } from "./infrastructure/evidence/digest.js";
export { DeterministicNormalizer, NORMALIZER_VERSION } from "./infrastructure/evidence/normalize.js";
export { EvidenceStore, parseBaseline } from "./infrastructure/evidence/evidence-store.js";
