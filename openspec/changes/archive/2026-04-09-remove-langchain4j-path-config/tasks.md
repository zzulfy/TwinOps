## 1. Provider Configuration Refactor

- [x] 1.1 Remove `twinops.analysis.llm.path` binding and path-based endpoint composition from `OpenAiLlmProviderAdapter`.
- [x] 1.2 Keep LangChain4j initialization base-url-only, including safe normalization for completion-suffixed base URLs.
- [x] 1.3 Preserve existing prediction parsing, fallback behavior, and logging semantics after config input simplification.

## 2. Test Updates

- [x] 2.1 Update `OpenAiLlmProviderAdapterTest` to verify adapter initialization and endpoint mapping without `path` input.
- [x] 2.2 Remove or replace legacy test cases that assert `base-url + path` composition behavior.
- [x] 2.3 Ensure adapter error/fallback tests still pass with the new base-url-only contract.

## 3. Config and Documentation Alignment

- [x] 3.1 Remove `twinops.analysis.llm.path` from backend configuration examples and defaults where it is declared.
- [x] 3.2 Add migration note that `path` is no longer used and `base-url` is the only endpoint property.

## 4. Validation

- [x] 4.1 Run backend compile (`mvn clean compile`) and fix any wiring errors.
- [x] 4.2 Run unit + integration + regression test suites and record evidence in this change task file.

## Validation Notes

- `mvn clean compile` passed.
- `mvn -Dtest='*Test,!*IntegrationTest' test` passed (71 tests, 0 failures, 0 errors).
- `mvn -Dtest='*IntegrationTest' test` passed (6 tests, 0 failures, 0 errors).
- `mvn -Dtest='OpenAiLlmProviderAdapterTest,AnalysisServiceTest,AnalysisAutomationConsumerTest,AnalysisKafkaIntegrationTest,AnalysisControllerTest,AnalysisAutomationProducerTest,AnalysisAutomationTriggerServiceTest' test` passed (35 tests, 0 failures, 0 errors).
- `mvn test` passed (77 tests, 0 failures, 0 errors).
- `npm run smoke:analysis-trigger && npm run smoke:analysis-auto-refresh && npm run smoke:auth-expiry` passed.
- Integration suite compatibility note: `AnalysisKafkaIntegrationTest` now uses `twinops.analysis.llm.provider=openai` with empty `api-key` and `fallback-to-mock=true` so tests remain deterministic even when `MockLlmProviderAdapter` is absent.
