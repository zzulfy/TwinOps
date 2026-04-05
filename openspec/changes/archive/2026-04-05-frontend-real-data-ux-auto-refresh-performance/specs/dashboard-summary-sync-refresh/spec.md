## MODIFIED Requirements

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
