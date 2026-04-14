# dashboard-scene-daylight-visuals Specification

## Purpose
Define the dashboard simulation scene as a modern indoor control-room environment while preserving the existing manual interaction model and 1:1 simulation-device mapping behavior.

## Requirements
### Requirement: Dashboard scene SHALL present modern indoor control-room visuals
The dashboard simulation scene SHALL render as an enclosed modern control-room environment centered on indoor equipment visibility, using restrained indoor lighting, device-led composition, and no exterior shell or sky-first presentation.

#### Scenario: Scene opens with indoor device-first composition
- **WHEN** the user opens the dashboard page and the simulation canvas initializes
- **THEN** the default view SHALL present near-field equipment and interior depth as the primary visual focus
- **AND** the initial composition SHALL NOT be dominated by empty floor, exterior shell, or sky-like background treatment

#### Scenario: Scene remains indoor and enclosed during interaction
- **WHEN** the user rotates, pans, or zooms within the simulation canvas
- **THEN** walls, ceiling, and end-of-room boundaries SHALL continue to define an indoor control-room setting
- **AND** the camera SHALL remain constrained to interior viewpoints rather than exposing an outside-house view

### Requirement: Control-room visual migration SHALL preserve manual interaction behavior
The control-room visual refresh MUST NOT alter existing manual camera interaction semantics, device click behavior, or 1:1 simulation-device data mapping.

#### Scenario: Existing interaction model remains intact after visual refresh
- **WHEN** users drag and zoom in the simulation canvas after the visual rebuild
- **THEN** left-drag zone behavior, wheel zoom, indoor camera constraints, and device click-to-dialog behavior SHALL continue to work
- **AND** visual changes SHALL NOT break the configured 1:1 device mapping between scene objects and runtime data
