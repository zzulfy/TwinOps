## ADDED Requirements

### Requirement: Dashboard scene SHALL present daylight visuals
The dashboard simulation scene SHALL render with daylight-oriented visual settings, including bright neutral sky/background, balanced sunlight-style lighting, and readable device materials aligned with the light UI shell.

#### Scenario: Scene renders in daylight mode on dashboard load
- **WHEN** the user opens the dashboard page and the simulation canvas initializes
- **THEN** the scene background and primary lighting SHALL use daylight-oriented tones instead of night-style dark tones
- **AND** device models or fallback geometries SHALL remain visually distinguishable against the brighter environment

### Requirement: Daylight visual migration SHALL preserve interaction behavior
The daylight visual update MUST NOT alter existing camera interaction semantics, model loading paths, or fallback trigger conditions.

#### Scenario: Existing camera and loading behavior remains unchanged
- **WHEN** users drag and zoom in the simulation canvas after the daylight update
- **THEN** central rotate, edge pan, and wheel zoom interactions SHALL behave exactly as before
- **AND** model loading SHALL still use existing GLB/DRACO paths with fallback activation only when model loading fails
