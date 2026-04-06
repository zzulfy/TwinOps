## Purpose

Define the global two-pane frontend shell requirements for shared navigation and right-pane-dominant module content.

## Requirements

### Requirement: Global two-pane application shell
The frontend SHALL provide a global application shell with a left navigation pane and a right content pane for all primary modules.

#### Scenario: Render unified shell for primary modules
- **WHEN** a user enters any primary module route (`/`, `/devices`, `/analysis`)
- **THEN** the UI SHALL render a two-pane shell where navigation is on the left and module content is on the right

### Requirement: Left pane is narrow and right pane is dominant
The layout SHALL enforce a narrow left pane and a significantly wider right pane using responsive width constraints.

#### Scenario: Apply width ratio on desktop viewport
- **WHEN** the viewport is in desktop range
- **THEN** the left pane SHALL remain within configured narrow bounds and the right pane SHALL occupy the remaining majority width

### Requirement: Navigation ownership is centralized in left pane
Module entry tabs SHALL be centralized in the left pane and SHALL NOT be duplicated as primary module-entry controls inside right-pane content.

#### Scenario: Module switch from left pane
- **WHEN** a user clicks a module tab in the left pane
- **THEN** the route SHALL switch to the target module and the right pane SHALL display corresponding module details
