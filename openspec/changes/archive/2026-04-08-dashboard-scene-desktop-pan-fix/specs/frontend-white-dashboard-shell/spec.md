## MODIFIED Requirements

### Requirement: White-shell responsive consistency
The cockpit-style shell SHALL remain visually consistent and functional across existing desktop and mobile breakpoints, and desktop simulation interactions SHALL include available drag pan controls in addition to rotate/zoom.

#### Scenario: Layout scales across breakpoints
- **WHEN** viewport width transitions between configured screen sizes
- **THEN** dashboard panel spacing and typography remain usable
- **AND** cockpit visual framing does not cause clipping or overlap of critical content

#### Scenario: Desktop simulation interaction remains usable
- **WHEN** a desktop user operates the dashboard simulation canvas
- **THEN** rotate, zoom, and pan interactions SHALL all be available through configured mouse inputs
- **AND** interaction controls SHALL remain functional without requiring page reload or mode switch
