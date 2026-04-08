## MODIFIED Requirements

### Requirement: White-shell responsive consistency
The cockpit-style shell SHALL remain visually consistent and functional across existing desktop and mobile breakpoints.

#### Scenario: Layout scales across breakpoints
- **WHEN** viewport width transitions between configured screen sizes
- **THEN** dashboard panel spacing and typography remain usable
- **AND** cockpit visual framing does not cause clipping or overlap of critical content

#### Scenario: Simulation view remains user-controllable across breakpoints
- **WHEN** users interact with the dashboard simulation canvas on supported breakpoints
- **THEN** the scene view SHALL remain manually controllable by pointer interactions
- **AND** automatic camera/scene movement SHALL NOT override user-controlled perspective

