## ADDED Requirements

### Requirement: Dedicated device detail route
The frontend SHALL provide a dedicated device detail page route separate from the overview dashboard route.

#### Scenario: User navigates to dedicated detail page
- **WHEN** the user selects a device detail navigation action
- **THEN** the application routes to a dedicated device detail page
- **AND** the overview dashboard remains a separate navigable page

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
The detail page SHALL render a valid default state when route context is partially missing.

#### Scenario: Detail page opens directly without prior dashboard state
- **WHEN** the detail route is accessed via refresh or direct URL
- **THEN** the page renders with fallback device context or selection prompt
- **AND** the app does not crash due to missing transient state
