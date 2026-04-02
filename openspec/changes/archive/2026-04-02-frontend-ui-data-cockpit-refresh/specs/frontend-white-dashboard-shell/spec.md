## MODIFIED Requirements

### Requirement: White-first dashboard shell
The frontend SHALL provide a cockpit-style dashboard shell as the primary board presentation, including high-contrast background layering, elevated panel surfaces, and restrained semantic status accents.

#### Scenario: Dashboard loads in cockpit style mode
- **WHEN** the user opens the main dashboard page
- **THEN** the board renders with cockpit-style layered background and panel surfaces
- **AND** status colors are applied to semantic indicators without overwhelming data readability

### Requirement: White-shell readability for dense widgets
The dashboard SHALL preserve readable hierarchy for telemetry labels, values, and chart annotations under cockpit-style visual treatments.

#### Scenario: Widget content remains legible
- **WHEN** dashboard widgets render mixed labels, numbers, and chart elements
- **THEN** text and data marks meet readable contrast against cockpit-oriented surfaces
- **AND** no critical widget text blends into decorative effects or background layers

### Requirement: White-shell responsive consistency
The cockpit-style shell SHALL remain visually consistent and functional across existing desktop and mobile breakpoints.

#### Scenario: Layout scales across breakpoints
- **WHEN** viewport width transitions between configured screen sizes
- **THEN** dashboard panel spacing and typography remain usable
- **AND** cockpit visual framing does not cause clipping or overlap of critical content
