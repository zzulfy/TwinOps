## ADDED Requirements

### Requirement: Analysis Center SHALL integrate with the global two-pane shell
The Analysis Center SHALL be rendered inside the global two-pane shell, with module selection in the left pane and analysis list/detail content in the right pane.

#### Scenario: Open Analysis Center within shell
- **WHEN** a user navigates to `/analysis`
- **THEN** the page SHALL keep left-pane navigation visible and render analysis workflows only in the right pane

### Requirement: Analysis detail area SHALL prioritize readability in wide pane
Analysis report detail presentation SHALL use the right pane as the primary reading surface and SHALL preserve existing report data semantics.

#### Scenario: View selected report detail
- **WHEN** a user selects an analysis report item
- **THEN** the selected report detail SHALL be displayed in the right-pane detail area with unchanged data fields and meaning

