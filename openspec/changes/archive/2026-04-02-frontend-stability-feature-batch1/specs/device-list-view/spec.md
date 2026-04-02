## MODIFIED Requirements

### Requirement: Aggregate device list display
The device detail view SHALL render all available devices by default as an aggregate list or grid, and SHALL provide client-side search and status filters without changing the default all-device behavior.

#### Scenario: Default detail view shows all devices
- **WHEN** the user opens the device detail page from dashboard actions or direct navigation
- **THEN** the interface renders multiple device detail cards/items in one view
- **AND** no explicit single-device parameter is required to see complete device coverage

#### Scenario: Full device set is visible with many items
- **WHEN** the number of devices exceeds the first viewport height
- **THEN** users can continue browsing all devices through normal page scrolling
- **AND** no device card is silently hidden or dropped from rendering due to layout overflow

#### Scenario: User filters aggregate device list
- **WHEN** the user enters a keyword or selects a status filter
- **THEN** displayed cards are filtered by name/deviceCode and selected status
- **AND** clearing filters restores the default all-device aggregate view

### Requirement: Independent device routing
The device detail route SHALL resolve correctly without requiring an individual device identifier and SHALL render the aggregate device detail view as the fallback default.

#### Scenario: Route without device identifier remains valid
- **WHEN** the user accesses `/devices` directly without query or param context
- **THEN** the page loads successfully with full-device aggregate content
- **AND** the app does not degrade into an empty or single-device-only state

#### Scenario: Direct route entry still shows complete data
- **WHEN** users enter `/devices` directly from URL or refresh
- **THEN** the page resolves without error and displays the full available device set
- **AND** the page behavior is consistent with dashboard-entry navigation
