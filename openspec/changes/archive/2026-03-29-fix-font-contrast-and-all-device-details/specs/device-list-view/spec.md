## MODIFIED Requirements

### Requirement: Aggregate device list display
The device detail view SHALL render all available devices by default as an aggregate list or grid, and SHALL NOT default to a single-device-only detail panel.

#### Scenario: Default detail view shows all devices
- **WHEN** the user opens the device detail page from dashboard actions or direct navigation
- **THEN** the interface renders multiple device detail cards/items in one view
- **AND** no explicit single-device parameter is required to see complete device coverage

### Requirement: Independent device routing
The device detail route SHALL resolve correctly without requiring an individual device identifier and SHALL render the aggregate device detail view as the fallback default.

#### Scenario: Route without device identifier remains valid
- **WHEN** the user accesses `/devices` directly without query or param context
- **THEN** the page loads successfully with full-device aggregate content
- **AND** the app does not degrade into an empty or single-device-only state
