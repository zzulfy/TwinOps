## MODIFIED Requirements

### Requirement: Dashboard summary SHALL use a shared fetch source
Dashboard summary consumers SHALL use a coordinated summary data source so panel snapshots remain consistent during the same refresh cycle. Fault-rate chart data in the summary SHALL be provided as minute-bucketed series with unique ordered labels formatted as `HH:mm`.

#### Scenario: Multiple summary consumers render from one snapshot
- **WHEN** dashboard panels requiring summary data initialize together
- **THEN** they consume the same resolved summary snapshot
- **AND** values shown across scale and fault-rate panels are time-consistent

#### Scenario: Fault-rate summary labels are unique by minute bucket
- **WHEN** backend assembles fault-rate chart data from telemetry
- **THEN** data is aggregated by configured minute bucket rather than raw per-device rows
- **AND** returned x-axis labels are unique, ordered, and formatted as `HH:mm` without month/day text

