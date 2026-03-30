## ADDED Requirements

### Requirement: Shared visual token source
The frontend SHALL define a shared token source for core visual primitives, including color, spacing, radius, border, and shadow.

#### Scenario: Components consume centralized token values
- **WHEN** core layout components define visual styles
- **THEN** style values reference shared token definitions
- **AND** direct hard-coded duplicates are minimized in component-local styles

### Requirement: Semantic state token coverage
The token set SHALL provide semantic tokens for primary states, including normal, warning, danger, and success.

#### Scenario: Stateful UI uses semantic tokens
- **WHEN** a component renders state-specific UI
- **THEN** the visual treatment is mapped to semantic state tokens
- **AND** state color usage remains consistent across header, panel, and footer surfaces

### Requirement: Responsive token compatibility
Token usage SHALL remain compatible with current desktop and mobile breakpoints.

#### Scenario: Layout remains readable across breakpoints
- **WHEN** viewport width transitions between desktop and mobile ranges
- **THEN** token-driven spacing and typography maintain readable hierarchy
- **AND** no critical panel content is visually clipped by tokenized spacing changes
