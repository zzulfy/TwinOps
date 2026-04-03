## MODIFIED Requirements

### Requirement: Dedicated device detail route
The frontend SHALL provide dedicated list and detail routes for device browsing, with detail route bound to explicit device identity context.

#### Scenario: Admin navigates from list to detail
- **WHEN** admin selects a device from list or watchlist
- **THEN** app navigates to `/devices/:deviceCode`
- **AND** detail page renders selected device data

### Requirement: Navigation fallback resilience
The detail page SHALL render a valid fallback state when device context is missing or invalid.

#### Scenario: Invalid deviceCode route
- **WHEN** `/devices/:deviceCode` references a non-existent device
- **THEN** page shows clear not-found fallback
- **AND** provides navigation path back to `/devices`
