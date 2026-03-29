## MODIFIED Requirements

### Requirement: Aggregate device list display
The device detail page SHALL present all available devices in the aggregate view with responsive wrapping, and SHALL NOT omit device entries due to container clipping or fixed-height truncation.

#### Scenario: Full device set is visible with many items
- **WHEN** the number of devices exceeds the first viewport height
- **THEN** users can continue browsing all devices through normal page scrolling
- **AND** no device card is silently hidden or dropped from rendering due to layout overflow

### Requirement: Independent device routing
The `/devices` route SHALL always render a complete aggregate view and SHALL remain navigable even when no device-specific context is supplied.

#### Scenario: Direct route entry still shows complete data
- **WHEN** users enter `/devices` directly from URL or refresh
- **THEN** the page resolves without error and displays the full available device set
- **AND** the page behavior is consistent with dashboard-entry navigation
