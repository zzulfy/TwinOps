## Context

The frontend currently renders business data from fixed arrays and random values. This blocks realistic integration testing and creates drift between environments. The change introduces a Java backend using a modular monolith style and a MySQL data model seeded with sample data.

Constraints and confirmed decisions for this phase:
- Backend stack: Java + MyBatis Plus.
- Deployment shape: single application with internal modules.
- Auth: out of scope for this phase.
- Data retention: telemetry data retained for 30 days.
- Seed scale: 50 devices.

## Goals / Non-Goals

**Goals:**
- Provide backend ownership for device, telemetry, alarm, and dashboard summary data.
- Remove fixed/random frontend business data from dashboard and device detail flows.
- Keep UI structure stable while changing data sources.
- Make sample environments reproducible via MySQL seed data.

**Non-Goals:**
- Introduce authentication/authorization.
- Split into microservices.
- Redesign frontend pages/components.
- Build full production observability and platform automation.

## Decisions

1. Backend architecture: modular monolith
- Decision: Implement one Spring Boot application with modules `device`, `telemetry`, `alarm`, `dashboard`.
- Rationale: Faster integration, lower operational complexity, easy refactor path later.
- Alternative considered: microservices.
- Why not now: premature operational overhead for current scope.

2. Persistence strategy: MyBatis Plus + MySQL
- Decision: Use MyBatis Plus repositories/mappers over MySQL tables.
- Rationale: Matches team preference and allows explicit SQL/index control for telemetry workloads.
- Alternative considered: JPA/Hibernate.
- Why not now: less predictable SQL shape for high-volume time-window queries.

3. Data identity and mapping
- Decision: Use `device_code` as business unique key and `label_key` to align with 3D label identity.
- Rationale: Device names can change; 3D mapping must remain stable.
- Alternative considered: use device name directly.
- Why not now: high risk of naming drift and broken mapping.

4. Seed and lifecycle strategy
- Decision: Provide deterministic seed scripts for 50 devices plus related telemetry/alarm records.
- Rationale: Stable demos and repeatable local/test setup.
- Alternative considered: frontend-generated random demo values.
- Why not now: non-deterministic and not database-backed.

5. Retention and query window
- Decision: Keep telemetry for 30 days and expose APIs that default to bounded time windows.
- Rationale: prevents unbounded table growth and keeps dashboard responses fast.
- Alternative considered: indefinite retention.
- Why not now: storage/performance risk without value for this phase.

6. Migration tool stance
- Decision: Keep schema/seed initialization script-driven now, with clear hook to adopt Flyway in next step.
- Rationale: User requested no strict Flyway dependency at this stage.
- Alternative considered: immediate Flyway adoption.
- Why not now: reduce initial setup friction.

## Risks / Trade-offs

- [Risk] Script-only schema evolution can drift across environments -> Mitigation: keep versioned SQL files in repo and enforce ordered execution docs.
- [Risk] 50-device seed may not reflect peak load behavior -> Mitigation: add optional higher-volume synthetic dataset in later perf change.
- [Risk] Frontend and backend field naming mismatch during cutover -> Mitigation: define response DTO contracts and mapping table before coding.
- [Risk] No auth endpoints in this phase -> Mitigation: restrict usage to trusted internal environments.

## Migration Plan

1. Create MySQL schema objects for devices, telemetry, and alarms.
2. Import deterministic seed data for 50 devices and related records.
3. Implement backend module APIs and dashboard aggregation endpoint.
4. Switch frontend panels/pages to backend APIs behind a feature toggle or environment base URL.
5. Validate data parity and remove random/fixed business data paths.
6. Add retention cleanup job and verify 30-day bound behavior.
7. Rollback path: revert frontend API switch and keep previous static path in emergency branch while backend fixes are applied.

## Open Questions

- Confirm whether schema migration should move to Flyway immediately after MVP stabilization.
- Confirm exact dashboard aggregation payload shape needed by all widget panels.
- Confirm cleanup execution mechanism (scheduled SQL job vs application scheduler).
