# Featherless provider (DiffWitness M5)

**Verified against Featherless docs (22 September 2026)** via https://featherless.ai/docs

## API contract (verified)

| Item | Value |
|---|---|
| Compatibility | OpenAI-compatible |
| Base URL | `https://api.featherless.ai/v1` |
| Endpoint used | `POST /v1/chat/completions` |
| Auth | `Authorization: Bearer $FEATHERLESS_API_KEY` |
| Request | `{ model, messages[{role,content}], temperature?, max_tokens?, response_format? }` |
| Response | `{ choices[{ message: { content } }], model?, usage? }` |
| Structured output | Official `/v1/chat/completions` parameter table does **not** list `response_format`. Featherless tool-calling docs mention `response_format: { type: "json_object" }` for JSON. DiffWitness **prefers** sending it (`preferJsonObjectFormat: true`) and still parses `message.content` as Explanation JSON. |
| Model | Config-driven (`ai.featherless.model` or `ai.model`). Default in `init` config: `Qwen/Qwen2.5-7B-Instruct` (from Featherless quickstart examples — not hardcoded in domain). |

### Error codes (docs + DiffWitness mapping)

| HTTP | Featherless docs | DiffWitness code |
|---|---|---|
| 400 | Cold / not ready model | `provider_unavailable` |
| 401 | Unauthenticated | `authentication_error` |
| 403 | Unauthorized / gated | `authorization_error` |
| 408 | (timeout) | `timeout` |
| 429 | (rate limit; OpenAPI) | `rate_limited` |
| 5xx / 503 | Internal / capacity | `provider_unavailable` |

Also: `missing_credentials`, `configuration_error`, `network_error`, `timeout` (AbortController), `invalid_response`, `schema_validation_error`, `citation_validation_error`.

**No infinite retries.** Docs suggest retrying 503; DiffWitness does **not** auto-retry (fail soft once).

## Setup

```yaml
# .diffwitness/config.yaml
ai:
  provider: featherless
  featherless:
    apiKeyEnv: FEATHERLESS_API_KEY   # env var NAME only — never the key
    baseUrl: https://api.featherless.ai/v1
    model: Qwen/Qwen2.5-7B-Instruct
    timeoutMs: 30000
    maxResponseBytes: 512000
    preferJsonObjectFormat: true
```

```bash
export FEATHERLESS_API_KEY=...   # from https://featherless.ai/account/api-keys
diffwitness explain --provider featherless
# or
diffwitness ci --explain --provider featherless
```

## Privacy

- Only the **redacted** EvidencePacket / ExplanationPacket is sent.
- No repo path, Git, Storage, ProcessExecutor, or raw env on the provider.
- `privacy.sendCodeBodies` remains false by default; packet never includes file bodies.
- API key never appears in logs, JSON metadata, or error strings (Bearer redacted).

## AI independence

DiffEngine owns `clean` / `findings` / `analysis_error`. Featherless failure → `explain_error` (exit 4); findings stay findings; never silent mock fallback; never rewrite status to clean.

## Offline vs live demos

| Demo | Command | Network |
|---|---|---|
| Offline (default) | `npm run demo:m4` / `explain --provider mock` | None |
| Live (optional) | `DIFFWITNESS_FEATHERLESS_LIVE=1` + `FEATHERLESS_API_KEY` then run live test / `explain --provider featherless` | Featherless only |

## Live test

```bash
DIFFWITNESS_FEATHERLESS_LIVE=1 FEATHERLESS_API_KEY=... npm test -- tests/featherless-live.test.ts
```

Skipped automatically when env vars are missing — not part of normal CI.
