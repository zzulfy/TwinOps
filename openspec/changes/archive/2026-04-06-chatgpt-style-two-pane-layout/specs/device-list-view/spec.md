## ADDED Requirements

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

