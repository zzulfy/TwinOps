## Why

LangChain4j OpenAI-compatible model configuration is base-url centric, and keeping an extra `path` parameter introduces redundant wiring and avoidable misconfiguration risk. Removing `twinops.analysis.llm.path` now simplifies runtime behavior and keeps provider initialization aligned with the framework contract.

## What Changes

- Remove `twinops.analysis.llm.path` from analysis LLM provider configuration usage.
- Update `OpenAiLlmProviderAdapter` to initialize LangChain4j strictly from `base-url` (plus existing key/model/temperature/max-tokens), without endpoint stitching from `path`.
- Keep report output contract, fallback behavior, and logging semantics unchanged after configuration simplification.
- Update tests and configuration samples to validate `base-url`-only behavior.
- **BREAKING**: deployments that rely on `twinops.analysis.llm.path` as an active config input must migrate to `twinops.analysis.llm.base-url` only.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `analysis-langchain4j-provider`: provider configuration requirements are updated so LangChain4j adapter behavior no longer depends on `path`, and only `base-url` is required for endpoint routing.

## Impact

- Affected code: `backend/src/main/java/com/twinops/backend/analysis/service/OpenAiLlmProviderAdapter.java` and related adapter tests.
- Affected config surface: `twinops.analysis.llm.path` is removed from active provider configuration behavior.
- Affected docs/specs: `analysis-langchain4j-provider` delta spec and implementation task artifacts.
