## Purpose

Define the aggregate device list-view behavior and route resolution expectations for device browsing.
## Requirements
### Requirement: Aggregate device list display
The device module SHALL provide a searchable list-first experience for all devices and SHALL allow navigation from list items to focused single-device detail pages. The device list surface SHALL include alarm lifecycle operations so operators can acknowledge and resolve alarms in an operational context.

#### Scenario: Default list view shows all devices
- **WHEN** admin opens `/devices`
- **THEN** page renders a structured device list with all available devices
- **AND** no single device is forced unless explicitly selected

#### Scenario: Admin searches devices by keyword
- **WHEN** admin enters keyword matching device name or deviceCode
- **THEN** list updates to matching entries
- **AND** clearing keyword restores full list

#### Scenario: Operator executes alarm action in device list
- **WHEN** a device-associated alarm is actionable in the list page
- **THEN** operator can trigger `acknowledged` or `resolved` action according to current state
- **AND** action result updates visible status and related dashboard-alarm snapshots after data refresh

### Requirement: Independent device routing
The device route model SHALL support both list route (`/devices`) and focused detail route (`/devices/:deviceCode`) with resilient fallback behavior.

#### Scenario: Direct detail route access
- **WHEN** admin opens `/devices/:deviceCode` directly
- **THEN** page resolves selected device detail if found
- **AND** shows safe fallback/empty-not-found state without app crash

### Requirement: Device module SHALL be hosted in the global two-pane shell
The device list and detail experience SHALL be hosted by the global two-pane shell, with module tabs in the left pane and device content in the right pane.

#### Scenario: Open device module in two-pane shell
- **WHEN** a user navigates to `/devices` or `/devices/:deviceCode`
- **THEN** the UI SHALL keep left-pane module navigation visible and render device list/detail content in the right pane

### Requirement: Device content interactions SHALL remain behavior-compatible
Device filter, watchlist, and alarm operation interactions SHALL preserve existing behavior while being displayed in the right-pane dominant area.

#### Scenario: Perform existing device interactions after layout migration
- **WHEN** a user executes filter, watchlist pin/unpin, or alarm status action
- **THEN** the behaviors and resulting state transitions SHALL remain functionally equivalent to pre-migration behavior
