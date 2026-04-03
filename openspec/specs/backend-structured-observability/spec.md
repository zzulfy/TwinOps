## Purpose

Define backend structured observability requirements for consistent event logging, request correlation, and sensitive-data redaction.

## Requirements

### Requirement: Backend SHALL emit structured logs for critical operations
The backend MUST emit structured logs with stable keys for critical operational events, including request correlation context and execution outcome.

#### Scenario: Structured log fields on critical events
- **WHEN** a critical backend event is logged (auth, analysis, DB failure, exception boundary)
- **THEN** the log entry SHALL include `request_id`, `module`, `event`, `result`, `latency_ms`, and `error_code` (when applicable)
- **AND** field names SHALL remain stable across modules for queryability

### Requirement: Request correlation id SHALL be propagated per HTTP request
The backend MUST support request-level correlation by accepting or generating a request id and binding it to logs for the duration of request processing.

#### Scenario: Incoming request contains request id
- **WHEN** an HTTP request includes `X-Request-Id`
- **THEN** backend logs for that request SHALL use the same request id
- **AND** the same id SHALL be available to downstream service and exception logs via context propagation

#### Scenario: Incoming request lacks request id
- **WHEN** an HTTP request does not include `X-Request-Id`
- **THEN** backend SHALL generate a new request id
- **AND** generated id SHALL be used consistently across logs for that request

### Requirement: Sensitive fields SHALL be redacted from logs
The backend MUST prevent credential and secret leakage in structured logs.

#### Scenario: Logging auth and LLM events
- **WHEN** logging auth or LLM provider events
- **THEN** logs SHALL NOT contain raw passwords, API keys, or authorization tokens
- **AND** any sensitive value representation SHALL be redacted or omitted
