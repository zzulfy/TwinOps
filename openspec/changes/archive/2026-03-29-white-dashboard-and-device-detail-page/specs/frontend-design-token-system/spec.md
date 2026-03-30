## MODIFIED Requirements

### Requirement: Shared visual token source
The frontend SHALL define a shared token source for core visual primitives, including color, spacing, radius, border, and shadow, and SHALL support white-first dashboard shell tokens alongside existing operational semantics.

#### Scenario: Components consume centralized token values
- **WHEN** core layout components define visual styles
- **THEN** style values reference shared token definitions
- **AND** direct hard-coded duplicates are minimized in component-local styles

#### Scenario: White-first shell tokens are available
- **WHEN** the dashboard applies white-dominant presentation
- **THEN** component surfaces, borders, and typography derive from shared white-shell token entries
- **AND** white-shell styling does not require per-component hard-coded overrides as the primary mechanism

### Requirement: Semantic state token coverage
The token set SHALL provide semantic tokens for primary states, including normal, warning, danger, and success, and SHALL keep these semantics consistent across both white-first and dark-oriented shells.

#### Scenario: Stateful UI uses semantic tokens
- **WHEN** a component renders state-specific UI
- **THEN** the visual treatment is mapped to semantic state tokens
- **AND** state color usage remains consistent across header, panel, and footer surfaces

#### Scenario: State semantics persist across shell modes
- **WHEN** dashboard shell style changes between white-first and other approved themes
- **THEN** warning, danger, normal, and success states remain visually distinguishable
- **AND** state meaning does not depend on shell-specific custom color mappings
