## ADDED Requirements

### Requirement: Dashboard summary SHALL use a shared fetch source
Dashboard summary consumers SHALL use a coordinated summary data source so panel snapshots remain consistent during the same refresh cycle.

#### Scenario: Multiple summary consumers render from one snapshot
- **WHEN** dashboard panels requiring summary data initialize together
- **THEN** they consume the same resolved summary snapshot
- **AND** values shown across scale and fault-rate panels are time-consistent

### Requirement: Dashboard SHALL provide manual refresh and update timestamp
The dashboard SHALL provide an explicit manual refresh action and display the last successful summary update timestamp.

#### Scenario: Operator refreshes dashboard summary
- **WHEN** the operator triggers manual refresh
- **THEN** summary consumers re-render from a newly fetched snapshot
- **AND** the displayed last-update timestamp reflects the successful refresh time
