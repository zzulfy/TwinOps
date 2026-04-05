# dashboard-summary-sync-refresh Specification

## Purpose
TBD - created by archiving change frontend-stability-feature-batch1. Update Purpose after archive.
## Requirements
### Requirement: Dashboard summary SHALL use a shared fetch source
Dashboard summary consumers SHALL use a coordinated summary data source so panel snapshots remain consistent during the same refresh cycle. Fault-rate chart data in the summary SHALL be provided as time-bucketed series with unique ordered labels.

#### Scenario: Multiple summary consumers render from one snapshot
- **WHEN** dashboard panels requiring summary data initialize together
- **THEN** they consume the same resolved summary snapshot
- **AND** values shown across scale and fault-rate panels are time-consistent

#### Scenario: Fault-rate summary labels are unique by time bucket
- **WHEN** backend assembles fault-rate chart data from telemetry
- **THEN** data is aggregated by configured hourly bucket rather than raw per-device rows
- **AND** returned x-axis labels are unique, ordered, and readable without repeated same-time collisions

### Requirement: Dashboard SHALL provide manual refresh and update timestamp
The dashboard SHALL provide both automatic periodic refresh and explicit manual refresh action, and SHALL display the last successful summary update timestamp.

#### Scenario: Operator refreshes dashboard summary manually
- **WHEN** the operator triggers manual refresh
- **THEN** summary consumers re-render from a newly fetched snapshot
- **AND** the displayed last-update timestamp reflects the successful refresh time

#### Scenario: Dashboard auto-refreshes summary without browser reload
- **WHEN** dashboard page remains active and auto-refresh interval is reached
- **THEN** frontend fetches a new summary snapshot automatically
- **AND** panels update without requiring browser reload
- **AND** last-update timestamp is updated after successful auto-refresh
