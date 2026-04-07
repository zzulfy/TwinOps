## ADDED Requirements

### Requirement: Desktop simulation camera SHALL support mouse pan
The dashboard simulation camera controls MUST support desktop pan translation so users can drag the view across the scene while keeping rotate and zoom available.

#### Scenario: Desktop user pans scene with mouse drag
- **WHEN** a desktop user performs the configured pan mouse drag gesture on the simulation canvas
- **THEN** the camera target and viewpoint SHALL translate in scene space
- **AND** the scene SHALL remain responsive without forced reset to the previous camera position

### Requirement: Desktop pan fix SHALL preserve existing manual interaction model
The dashboard simulation SHALL remain manual-control-driven, and pan support MUST NOT reintroduce automatic camera motion.

#### Scenario: Pan works without auto camera movement
- **WHEN** the user stops interacting after pan/rotate/zoom
- **THEN** the camera SHALL stay at the user-controlled position
- **AND** no timer-driven rotation or floating motion SHALL be applied
