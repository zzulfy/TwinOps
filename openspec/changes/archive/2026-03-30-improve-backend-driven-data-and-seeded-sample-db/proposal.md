## Why

The current frontend still relies on fixed and random runtime data for device scale, device detail, alarms, and chart metrics. As backend work begins, these views must become API-driven with persistent sample data in MySQL so environments are reproducible and testable.

## What Changes

- Add a Java backend (single application with modular boundaries) for device, telemetry, alarm, and dashboard aggregation.
- Use MyBatis Plus with MySQL to store device master data, telemetry, and alarms.
- Seed 50 devices and related sample telemetry/alarm data into MySQL for demo and integration testing.
- Replace frontend fixed/random business data sources with backend API calls while preserving existing UI structure.
- Enforce telemetry retention of 30 days and expose predictable query windows for dashboard usage.
- Defer authentication to a later change (no auth in this phase).

## Capabilities

### New Capabilities
- `backend-device-data-services`: Provide backend APIs and persistence for device master data, telemetry, alarms, dashboard summary, seed dataset, and 30-day retention behavior.
- `frontend-backend-data-source-switch`: Switch dashboard and device detail pages from fixed/random data to backend APIs with clear empty/error handling.

### Modified Capabilities
- None.

## Impact

- New backend Java modules and database access layer.
- New MySQL tables, indexes, and seed scripts for 50 devices.
- Frontend data-fetch logic in dashboard, device detail, alarm panel, and metric panels.
- Local/dev environment requires backend service and MySQL availability.
