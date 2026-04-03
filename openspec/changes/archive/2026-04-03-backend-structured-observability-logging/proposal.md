## Why

TwinOps backend currently lacks a consistent, structured observability baseline across critical runtime paths (auth, analysis, and database error surfaces). As LLM integration and admin workflows are now in active use, clear and standardized logs are required to reduce MTTR and make fallback/error behavior auditable in production.

## What Changes

- Introduce structured logging conventions for backend critical paths, including common fields (`request_id`, `module`, `event`, `result`, `latency_ms`, `error_code`).
- Add analysis-module logs for LLM invocation lifecycle: request start, success, provider failure, fallback-to-mock path, and terminal failure.
- Add auth-module logs for login success/failure and logout events with safe, non-sensitive context.
- Add database-related operational logs:
  - startup datasource summary log (sanitized, no credentials),
  - explicit error logs for database access failures via centralized exception handling.
- Add request-level correlation id propagation to improve traceability across controller/service/exception logs.
- Keep existing API behavior and response contract unchanged; this change focuses on observability semantics.

## Capabilities

### New Capabilities
- `backend-structured-observability`: Defines backend-wide structured logging and correlation-id requirements for critical operational flows.

### Modified Capabilities
- `admin-authentication`: Add logging requirements for admin auth success/failure/logout events and safe redaction behavior.
- `ai-analysis-center`: Add logging requirements for LLM lifecycle events, fallback-to-mock transitions, and failure observability.

## Impact

- Affected code:
  - `backend/src/main/java/com/twinops/backend/analysis/**`
  - `backend/src/main/java/com/twinops/backend/auth/**`
  - `backend/src/main/java/com/twinops/backend/common/exception/**`
  - new request-correlation/logging support classes in `backend/src/main/java/com/twinops/backend/common/**`
- Affected runtime behavior:
  - richer INFO/WARN/ERROR logs with consistent fields and request traceability.
- APIs and DTO contracts:
  - no breaking API contract changes.
- Dependencies/systems:
  - no new external logging platform required for this phase; use Spring Boot logging stack and SLF4J.
