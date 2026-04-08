## MODIFIED Requirements

### Requirement: White-shell responsive consistency
The cockpit-style shell SHALL remain visually consistent and functional across existing desktop and mobile breakpoints, and desktop simulation camera control SHALL support zone-based left-drag behavior where center drag rotates and edge drag pans.

#### Scenario: Layout scales across breakpoints
- **WHEN** viewport width transitions between configured screen sizes
- **THEN** dashboard panel spacing and typography remain usable
- **AND** cockpit visual framing does not cause clipping or overlap of critical content

#### Scenario: Desktop scene interaction follows zone-based behavior
- **WHEN** a desktop user left-drags on simulation canvas
- **THEN** center-area drag SHALL rotate camera
- **AND** edge-area drag SHALL pan camera
