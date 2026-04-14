## MODIFIED Requirements

### Requirement: White-shell responsive consistency
The GitHub Light dashboard shell SHALL remain visually consistent and functional across existing desktop and mobile breakpoints, and the 3D simulation area SHALL remain a light-shell card container whose internal scene chrome is visually subordinate to the equipment-focused control-room scene.

#### Scenario: Layout scales across breakpoints
- **WHEN** viewport width transitions between configured screen sizes
- **THEN** dashboard panel spacing and typography remain usable
- **AND** shell framing does not cause clipping or overlap of critical content

#### Scenario: Simulation panel chrome stays compatible with white shell
- **WHEN** the right-side simulation panel renders within the dashboard shell
- **THEN** the outer container SHALL continue to read as part of the white dashboard layout
- **AND** internal title boards, badges, and scene overlays SHALL use restrained scene-integrated styling rather than competing card chrome
