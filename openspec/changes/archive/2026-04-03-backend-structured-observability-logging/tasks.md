## 1. Logging Foundation and Correlation

- [x] 1.1 Add common structured-logging helpers/constants for stable fields (`request_id`, `module`, `event`, `result`, `latency_ms`, `error_code`).
- [x] 1.2 Add HTTP request correlation-id filter/interceptor that reads or generates `X-Request-Id` and binds it to MDC context.
- [x] 1.3 Ensure correlation context is available in service/exception logs and cleared safely at request completion.

## 2. Analysis Module Observability

- [x] 2.1 Add structured lifecycle logs in `AnalysisService` for report creation start/success/failure with latency and outcome.
- [x] 2.2 Add `OpenAiLlmProviderAdapter` logs for provider request start, provider failure, fallback decision, fallback success, and terminal failure.
- [x] 2.3 Enforce sensitive-value redaction rules in analysis logs (no API key/token raw output).

## 3. Auth and Database Error Observability

- [x] 3.1 Add auth logs for login success/failure and logout events with request correlation and safe identity context.
- [x] 3.2 Extend global exception handling to log `DataAccessException`/JDBC-related failures with sanitized diagnostics and request path.
- [x] 3.3 Add startup datasource summary log (host/schema only, no credential leakage).

## 4. Validation and Documentation

- [x] 4.1 Update backend documentation for structured logging fields, log levels, and fallback logging semantics.
- [x] 4.2 Add notes/examples for request-id usage (`X-Request-Id`) and expected log behavior on LLM fallback and DB failures.
- [x] 4.3 Run backend verification command (`mvn test -DskipITs`) after implementation completion.
