## 1. Provider Adapter Refactor

- [x] 1.1 Replace manual HTTP request/response logic in `OpenAiLlmProviderAdapter` with LangChain4j OpenAI chat model invocation.
- [x] 1.2 Preserve existing prompt contract and response field mapping (`prediction`, `confidence`, `riskLevel`, `recommendedAction`).
- [x] 1.3 Keep adapter-side normalization for confidence bounds, risk-level normalization, and default recommended action behavior.

## 2. Runtime Configuration and Compatibility

- [x] 2.1 Map existing LLM config (`base-url`, `api-key`, `model`, `temperature`, `max-tokens`) to LangChain4j model initialization.
- [x] 2.2 Ensure `fallback-to-mock` behavior remains compatible for both provider-failure and success paths.
- [x] 2.3 Keep structured observability events for start/success/fallback/failure with existing field conventions.

## 3. Testing and Regression Coverage

- [x] 3.1 Update/add unit tests for adapter success path with valid JSON output.
- [x] 3.2 Update/add unit tests for malformed response, timeout/provider failure, and fallback-enabled behavior.
- [x] 3.3 Run analysis pipeline regression tests (service/controller/kafka integration) to verify report lifecycle behavior is unchanged.

## 4. Validation and Rollout Readiness

- [x] 4.1 Verify `openspec` artifacts and code changes stay consistent with `analysis-langchain4j-provider` and `ai-analysis-center` requirements.
- [x] 4.2 Validate local backend startup using current LLM config and confirm no initialization failures from LangChain4j wiring.
- [x] 4.3 Record final verification evidence and prepare change for `/opsx:apply` implementation execution.

## Validation Notes

- `mvn -Dtest=OpenAiLlmProviderAdapterTest test` passed (7 tests, 0 failures).
- `mvn -Dtest=OpenAiLlmProviderAdapterTest,AnalysisServiceTest,AnalysisAutomationConsumerTest,AnalysisKafkaIntegrationTest,AnalysisControllerTest,AnalysisAutomationProducerTest,AnalysisAutomationTriggerServiceTest test` passed (35 tests, 0 failures).
- `mvn clean compile` passed after LangChain4j migration changes.
- `mvn test` passed (77 tests, 0 failures, 0 errors), including auth integration, analysis integration, and existing regression suites.
- Startup wiring validation: `OpenAiLlmProviderAdapterTest.shouldInitializeLangChainModelFromConfigValues` constructs real LangChain4j-backed adapter using config-like values without initialization failure.
