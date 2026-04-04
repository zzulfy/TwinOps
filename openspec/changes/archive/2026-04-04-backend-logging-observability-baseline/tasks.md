## 1. OpenSpec Artifact Completion

- [x] 1.1 Finalize proposal/design/spec deltas for backend logging baseline and source-traceability requirements.
- [x] 1.2 Ensure capability alignment across `backend-logging-baseline`, `backend-structured-observability`, and `readme-documentation-overhaul`.

## 2. Logging Configuration Baseline

- [x] 2.1 Add backend logging output pattern that includes request correlation and code source location (class/method/line).
- [x] 2.2 Validate that configured pattern does not leak sensitive auth/secret values.

## 3. Controller Logging Coverage

- [x] 3.1 Add structured `info` request-entry logs for backend controllers lacking baseline logs.
- [x] 3.2 Add `warn` logs for invalid/bounded/noop request branches where applicable.
- [x] 3.3 Ensure unhandled failures still surface via existing global exception `error` logging.

## 4. Service Logging Coverage

- [x] 4.1 Add structured `info` logs for critical service start/success checkpoints in uncovered modules.
- [x] 4.2 Add `warn` logs for recoverable anomalies (empty result, bounded limit, compatibility path).
- [x] 4.3 Add `error` logs for irrecoverable service failures before exception propagation.

## 5. Analysis/Kafka Chain Observability

- [x] 5.1 Ensure trigger, producer, consumer, and aggregation flow has complete `info/warn/error` coverage.
- [x] 5.2 Ensure batch/legacy branch and publish/consume failures are explicitly logged with stable error codes.

## 6. Tests and Regression Safety

- [x] 6.1 Update backend tests impacted by logging baseline and ensure existing behavior contracts remain unchanged.
- [x] 6.2 Run backend test suite (`mvn test -DskipITs`) to validate stability after logging changes.
- [x] 6.3 Run frontend checks (`npm run type-check`, `npm run build`) for cross-module regression safety.

## 7. Documentation and Engineering Policy

- [x] 7.1 Update root README with backend logging baseline policy and tri-level logging requirements.
- [x] 7.2 Update backend README with source-traceable logging format and module logging conventions.
- [x] 7.3 Explicitly document requirement that backend code changes must include suitable logs.

## 8. Change Readiness and Archive Path

- [x] 8.1 Mark completed tasks and verify OpenSpec change is apply-ready.
- [x] 8.2 Sync resulting spec deltas to main specs and resolve wording contradictions if any.
