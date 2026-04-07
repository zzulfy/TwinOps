## MODIFIED Requirements

### Requirement: Aggregate device list display
The device module SHALL provide a searchable list-first experience for all devices and SHALL allow navigation from list items to focused single-device detail pages. The device list surface SHALL include alarm lifecycle operations so operators can resolve alarms in an operational context.

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
- **THEN** operator can trigger `resolved` action on `new` alarms according to current state
- **AND** action result updates visible status and related dashboard-alarm snapshots after data refresh

