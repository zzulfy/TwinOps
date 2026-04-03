## 1. Frontend readability and alarm UX restructuring

- [x] 1.1 Add/adjust contrast policy tokens and apply them to deep/light surfaces in dashboard modules.
- [x] 1.2 Refactor WidgetPanel06 to read-only alarm monitoring card with basic info + auto-scroll (remove confirm/resolve buttons).
- [x] 1.3 Fix alarm reason/event text rendering by applying stable CJK fallback font stack to body text areas.
- [x] 1.4 Add alarm lifecycle operation UI in DeviceDetailPage (or device list operation section) with proper status transition guard.
- [x] 1.5 Wire alarm operation success to list/dashboard refresh flow so cross-module status stays consistent.

## 2. Backend alarm and dashboard data contract adjustments

- [x] 2.1 Keep using `PATCH /api/alarms/{id}/status` as source-of-truth update path and ensure updated fields are persisted consistently.
- [x] 2.2 Update dashboard fault-rate generation to hourly time-bucket aggregation with unique ordered labels.
- [x] 2.3 Ensure dashboard summary DTO/serialization preserves front-end compatibility while carrying aggregated fault-rate data.
- [x] 2.4 Add/update backend tests for alarm status transition and fault-rate label uniqueness.

## 3. Analysis automation pipeline with RocketMQ

- [x] 3.1 Introduce RocketMQ configuration and producer/consumer scaffolding for analysis request messages.
- [x] 3.2 Implement half-day scheduler (`00:00`, `12:00`) to collect target fault devices and publish analysis requests.
- [x] 3.3 Implement consumer-side analysis execution and report persistence into `analysis_reports`.
- [x] 3.4 Add idempotency control using `deviceCode + half-day slot` to avoid duplicate effective writes.
- [x] 3.5 Add structured logs around schedule trigger, publish, consume, success/failure, and idempotency skip paths.

## 4. Analysis center frontend transition and documentation

- [x] 4.1 Remove manual create-report input/submit flow from AnalysisCenterPage and switch to read-only report board.
- [x] 4.2 Ensure report list/detail rendering remains stable for scheduled results and failure states.
- [x] 4.3 Update backend/frontend README sections for alarm-operation relocation, fault-rate aggregation, and RocketMQ-based auto analysis.
- [x] 4.4 Run existing build/test commands for frontend and backend to confirm the change set is apply-ready.
