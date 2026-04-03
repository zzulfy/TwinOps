## Context

TwinOps backend currently spans multiple operationally critical flows (`auth`, `analysis`, database-backed services) but lacks a unified logging schema and correlation strategy. Existing logs are mostly framework-default and inconsistent across modules, which makes incident triage difficult, especially for database failures and LLM fallback paths.

The current backend stack is Spring Boot + MyBatis-Plus, with centralized exception handling in `GlobalExceptionHandler` and explicit service orchestration in domain modules. This provides clear insertion points for structured logging without changing API contracts.

## Goals / Non-Goals

**Goals:**
- Establish a backend-wide structured logging format for critical events.
- Add request correlation id propagation so logs across controller/service/exception paths are traceable per request.
- Add explicit lifecycle logs in analysis flow (LLM call start/success/failure/fallback/terminal failure).
- Add explicit auth logs for success/failure/logout with sensitive-field redaction.
- Improve DB failure observability through startup datasource summary (sanitized) and centralized database exception logging.

**Non-Goals:**
- No external log platform integration (e.g., ELK/OTel collector) in this phase.
- No changes to API response structures or endpoint contracts.
- No broad metrics/tracing system rollout; this change is log-first observability.
- No SQL statement full-payload logging that risks exposing sensitive data.

## Decisions

1. Use SLF4J structured key-value style logs with stable field keys.
- Rationale: Fits existing Spring stack with zero infrastructure change and immediate readability.
- Alternative: introduce JSON encoder/logback custom appender now. Rejected for higher rollout complexity.

2. Add request correlation id via servlet filter (`X-Request-Id` passthrough/generation) and MDC.
- Rationale: One low-risk mechanism enables cross-module traceability for every backend request.
- Alternative: generate ad-hoc ids per module/service call. Rejected due to fragmented traces.

3. Centralize database failure logs in `GlobalExceptionHandler` for `DataAccessException`/JDBC-rooted errors.
- Rationale: Ensures consistent ERROR-level output and avoids duplicated per-controller handling.
- Alternative: local try/catch in each service. Rejected due to high duplication and inconsistent semantics.

4. Log LLM fallback transitions explicitly in `OpenAiLlmProviderAdapter`.
- Rationale: Fallback behavior changes operational meaning and must be visible in logs for incident auditing.
- Alternative: keep fallback silent and only store report status. Rejected because operators lose real-time signal.

5. Keep logs privacy-safe by redacting secrets and avoiding API key/password/raw credential output.
- Rationale: observability must not reduce security posture.
- Alternative: verbose payload logging. Rejected due to credential leakage risk.

## Risks / Trade-offs

- [Risk] Increased log volume from lifecycle logs in hot paths.  
  -> Mitigation: strict log levels (`INFO/WARN/ERROR` only for key events), keep DEBUG for optional payload summaries.

- [Risk] Correlation id implementation could be bypassed in non-HTTP execution paths.  
  -> Mitigation: apply filter at HTTP ingress and include fallback placeholder request id for asynchronous/internal contexts.

- [Risk] Overly generic error code mapping may reduce diagnostic precision.  
  -> Mitigation: define a small stable error-code set first, iterate after observing production incidents.

- [Risk] Startup datasource summary log might accidentally expose sensitive info.  
  -> Mitigation: sanitize URL and never log username/password/token secrets.

## Migration Plan

1. Add common logging support (request-id filter + MDC utility + standardized key constants).
2. Add analysis logs in `AnalysisService` and `OpenAiLlmProviderAdapter`.
3. Add auth logs in auth service/controller.
4. Add DB observability:
   - startup datasource summary log (sanitized),
   - `GlobalExceptionHandler` branch for `DataAccessException` and related DB exceptions.
5. Verify backend tests and ensure no API contract changes.
6. Rollback path: disable new structured logs by reverting logging support classes and module-level log statements; no data migration needed.

## Open Questions

- Should `X-Request-Id` always be echoed back in response headers for frontend troubleshooting UX?
- Should error-code values be standardized in logs only, or also surfaced in `ApiResponse.message` in a future change?
- Do we want optional log sampling for high-frequency endpoints in later phases?
