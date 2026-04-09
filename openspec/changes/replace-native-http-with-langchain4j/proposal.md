## Why

The current OpenAI provider adapter in backend analysis uses a hand-written HTTP client with custom JSON parsing, which increases maintenance cost and makes timeout/error handling inconsistent across provider evolutions. Since `langchain4j-open-ai` is already introduced in `pom.xml`, this is the right time to standardize LLM invocation on LangChain4j while preserving existing report behavior.

## What Changes

- Replace the manual `java.net.http.HttpClient` request path in `OpenAiLlmProviderAdapter` with LangChain4j OpenAI chat model invocation.
- Keep the existing analysis output contract unchanged (`prediction`, `confidence`, `riskLevel`, `recommendedAction`) and preserve fallback-to-mock behavior.
- Standardize provider exception mapping so timeout, non-2xx-like provider failures, and malformed model output are logged and surfaced consistently.
- Keep support for existing LLM runtime configuration (`base-url`, `api-key`, `model`, `temperature`, `max-tokens`) and align them with LangChain4j initialization.
- Add/adjust backend tests to verify successful generation, fallback path, and terminal failure path after the client migration.

## Capabilities

### New Capabilities
- `analysis-langchain4j-provider`: Defines requirements for invoking LLM analysis through LangChain4j with stable response parsing, observability, and fallback compatibility.

### Modified Capabilities
- `ai-analysis-center`: Clarify provider integration requirements so analysis behavior remains stable when the underlying client implementation changes.

## Impact

- Affected backend code:
  - `backend/src/main/java/com/twinops/backend/analysis/service/OpenAiLlmProviderAdapter.java`
  - `backend/src/main/java/com/twinops/backend/analysis/service/AnalysisService.java` (error propagation compatibility)
  - related LLM provider tests under `backend/src/test/java/com/twinops/backend/analysis/service/`
- Affected dependencies:
  - `dev.langchain4j:langchain4j-open-ai`
- Affected runtime config:
  - `backend/src/main/resources/llm.yml` and/or `application*.yml` fields used by provider adapter
- Expected outcome:
  - Lower adapter complexity with equivalent external behavior for manual trigger, Kafka consumption, and report persistence lifecycle.
