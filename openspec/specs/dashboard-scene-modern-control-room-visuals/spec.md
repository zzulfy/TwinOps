# dashboard-scene-modern-control-room-visuals Specification

## Purpose
Define the device-led spatial composition, cabinet-family differentiation, and immersive scene-overlay behavior required for the dashboard's modern control-room simulation presentation.

## Requirements
### Requirement: Dashboard scene SHALL use device-led spatial composition
The dashboard simulation scene SHALL organize visible equipment into front, mid, rear, and end-wall cabinet bands so that devices remain the primary visual subject from the default viewpoint and during manual exploration.

#### Scenario: Front, mid, rear, and end-wall bands are all populated
- **WHEN** the scene places the current interactive device set
- **THEN** devices SHALL be distributed across near-field, mid-field, rear-field, and end-wall cabinet zones
- **AND** no single view direction should be dominated by an obviously empty structural band when interactive devices remain available

#### Scenario: Central corridor no longer dominates the composition
- **WHEN** the scene is viewed from its default camera
- **THEN** the visible corridor area SHALL act as a guide path rather than the main subject
- **AND** device platforms and cabinet faces SHALL occupy the majority of the user's visual attention

### Requirement: Cabinet families SHALL remain distinguishable by silhouette and panel language
The scene SHALL render different simulation `visualFamily` groups with visibly distinct proportions and front-face structure so that the user can differentiate major cabinet classes without relying only on color changes.

#### Scenario: Mixed device families render with distinct cabinet forms
- **WHEN** multiple `visualFamily` values are present in the scene
- **THEN** cabinet width/height/depth, front-panel layout, and feature density SHALL vary by family
- **AND** the result SHALL avoid presenting all devices as repeated identical rectangular cabinets

### Requirement: Scene overlay chrome SHALL support an immersive control-room presentation
The simulation panel's title board and scene-adjacent UI overlays SHALL support the room's visual atmosphere without competing with device visibility or reading as generic management cards.

#### Scenario: Title board remains legible but visually restrained
- **WHEN** the simulation scene title and device-count badge are displayed
- **THEN** the overlay SHALL remain readable against the scene
- **AND** its style SHALL feel integrated with the control-room presentation rather than floating as a separate dashboard card
