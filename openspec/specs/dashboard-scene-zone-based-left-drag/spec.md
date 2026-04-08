# dashboard-scene-zone-based-left-drag Specification

## Purpose
TBD - created by archiving change dashboard-scene-center-rotate-edge-pan. Update Purpose after archive.
## Requirements
### Requirement: Simulation canvas SHALL support zone-based left-drag interaction
On desktop, the simulation canvas MUST use zone-based left-drag behavior: center-drag rotates camera and edge-drag pans camera.

#### Scenario: Center drag rotates camera
- **WHEN** a desktop user starts left-drag in the canvas center area
- **THEN** the scene camera SHALL rotate around the target
- **AND** no pan translation SHALL be applied for that drag gesture

#### Scenario: Edge drag pans camera
- **WHEN** a desktop user starts left-drag in the canvas edge area
- **THEN** the scene camera SHALL pan (translate target/viewpoint)
- **AND** no rotate behavior SHALL be applied for that drag gesture

### Requirement: Zone-based interaction SHALL preserve manual control guarantees
Zone-based drag control MUST keep simulation camera motion fully user-driven without introducing automatic camera movement.

#### Scenario: Camera remains stable after interaction ends
- **WHEN** user ends left-drag interaction
- **THEN** camera SHALL stay at the user-controlled transform
- **AND** no timer-driven rotation or floating motion SHALL be triggered

