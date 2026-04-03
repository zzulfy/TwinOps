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
