## Purpose

Define dedicated device detail page routing and navigation patterns separate from the dashboard overview.

## Requirements

### Requirement: Dedicated device detail route
The frontend SHALL provide dedicated list and detail routes for device browsing, with detail route bound to explicit device identity context.

#### Scenario: Admin navigates from list to detail
- **WHEN** admin selects a device from list or watchlist
- **THEN** app navigates to `/devices/:deviceCode`
- **AND** detail page renders selected device data

### Requirement: Dashboard detail entry button
The dashboard SHALL include a visible action button that navigates to the dedicated device detail page.

#### Scenario: User uses explicit dashboard action
- **WHEN** the user clicks the dashboard "view device details" action
- **THEN** the app navigates to the dedicated detail route
- **AND** the transition does not require opening a modal on the dashboard page

### Requirement: Device label navigation with context
Device label interactions SHALL navigate to the dedicated detail page with selected device context.

#### Scenario: User clicks a device label in 3D scene
- **WHEN** the user clicks a labeled device in the dashboard scene
- **THEN** the app navigates to the dedicated detail page
- **AND** the detail page receives selected device identity context for rendering

### Requirement: Navigation fallback resilience
The detail page SHALL render a valid fallback state when device context is missing or invalid.

#### Scenario: Invalid deviceCode route
- **WHEN** `/devices/:deviceCode` references a non-existent device
- **THEN** page shows clear not-found fallback
- **AND** provides navigation path back to `/devices`
