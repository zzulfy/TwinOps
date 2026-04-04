## 1. OpenSpec Scope Finalization

- [ ] 1.1 Finalize and validate delta specs for `auth-expiry-forced-logout`, `admin-authentication`, `ai-analysis-center`, `analysis-automation-pipeline`, and `readme-documentation-overhaul`.
- [ ] 1.2 Ensure artifact consistency across `proposal.md`, `design.md`, and all delta specs for one-click trigger, forced logout, Kafka alignment, and testing policy requirements.

## 2. Frontend Auth-Expiry Forced Logout

- [ ] 2.1 Update frontend unauthorized handling so `401` on non-login pages immediately clears session and redirects to `/login`.
- [ ] 2.2 Add explicit user-facing expired-auth prompt on login route after forced redirect.
- [ ] 2.3 Add route/API regression coverage to guarantee protected pages are exited immediately after auth expiry.

## 3. Analysis Center One-Click UX Refactor

- [ ] 3.1 Refactor analysis center page UI to remove device/metric input fields and keep only one manual trigger button.
- [ ] 3.2 Adapt frontend trigger API invocation to submit request without device identifiers or metric payload fields.
- [ ] 3.3 Add frontend regression test for one-click trigger behavior and asynchronous report list refresh.

## 4. Backend Auto-Aggregation Trigger Pipeline

- [ ] 4.1 Refactor analysis trigger service/controller contract so backend trigger no longer depends on frontend-supplied device information.
- [ ] 4.2 Implement backend workflow to query all target devices and telemetry context (including CPU/temperature-class fields) from database during trigger.
- [ ] 4.3 Publish aggregated per-device analysis workload to Kafka asynchronously and keep trigger API response non-blocking.
- [ ] 4.4 Ensure consumer processing persists report lifecycle states with observable status transitions for long-running execution.

## 5. Backend API, Integration, and Regression Tests

- [ ] 5.1 Add backend API tests for auth-expiry-triggered unauthorized flow, trigger acceptance response, and validation/error paths.
- [ ] 5.2 Add/extend Kafka integration tests covering aggregate -> publish -> consume -> persist end-to-end path.
- [ ] 5.3 Add backend regression tests to prevent reintroduction of login-after-auth-expiry access and manual-input trigger coupling.

## 6. README and Engineering Policy Alignment

- [ ] 6.1 Update root `README.md` architecture/module/flow diagrams and deployment narrative to match Kafka-based runtime implementation.
- [ ] 6.2 Update `backend/README.md` operational sections to align trigger behavior with backend auto-aggregation and async Kafka processing.
- [ ] 6.3 Document mandatory policy that every future code-change requirement must include integration tests and regression tests.

## 7. Validation and Change Readiness

- [ ] 7.1 Execute backend test suites (`mvn test -DskipITs`) and ensure newly added integration/regression coverage is green.
- [ ] 7.2 Execute frontend quality/build checks (`npm run type-check`, `npm run build`) and regression scripts for auth-expiry and analysis trigger flows.
- [ ] 7.3 Mark OpenSpec task checklist completion and verify change is ready for apply and archive workflow.
