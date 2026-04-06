## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Fault-rate series SHALL use device error ratio semantics
Dashboard fault-rate series values SHALL be computed from device status ratio, where fault rate equals the count of `error` devices divided by total device count and multiplied by 100.

#### Scenario: Error devices produce non-zero fault rate
- **WHEN** at least one device in the current dataset has `status=error`
- **THEN** dashboard fault-rate series values SHALL be greater than 0 for the corresponding sampling window
- **AND** the value semantics SHALL remain consistent with `errorDeviceCount / totalDeviceCount * 100`

