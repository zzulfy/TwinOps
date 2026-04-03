## MODIFIED Requirements

### Requirement: Shared visual token source
The frontend SHALL define a shared token source for core visual primitives, including color, spacing, radius, border, and shadow, and SHALL support white-first dashboard shell tokens alongside existing operational semantics. The token source SHALL also provide contrast policy tokens to guarantee deep-background/light-text and light-background/deep-text pairing across dashboard modules.

#### Scenario: Components consume centralized token values
- **WHEN** core layout components define visual styles
- **THEN** style values reference shared token definitions
- **AND** direct hard-coded duplicates are minimized in component-local styles

#### Scenario: White-first shell tokens are available
- **WHEN** the dashboard applies white-dominant presentation
- **THEN** component surfaces, borders, and typography derive from shared white-shell token entries
- **AND** white-shell styling does not require per-component hard-coded overrides as the primary mechanism

#### Scenario: Contrast policy is enforced for light and deep surfaces
- **WHEN** a component uses a light background surface token
- **THEN** text color tokens resolve to deep-tone text values
- **AND** component styles do not use light-tone text on light surfaces

### Requirement: Semantic state token coverage
The token set SHALL provide semantic tokens for primary states, including normal, warning, danger, and success, and SHALL keep these semantics consistent across both white-first and dark-oriented shells. For dynamically colored alarm rows, text color SHALL be selected with a contrast-aware strategy derived from semantic token luminance.

#### Scenario: Stateful UI uses semantic tokens
- **WHEN** a component renders state-specific UI
- **THEN** the visual treatment is mapped to semantic state tokens
- **AND** state color usage remains consistent across header, panel, and footer surfaces

#### Scenario: State semantics persist across shell modes
- **WHEN** dashboard shell style changes between white-first and other approved themes
- **THEN** warning, danger, normal, and success states remain visually distinguishable
- **AND** state meaning does not depend on shell-specific custom color mappings

#### Scenario: Dynamic alarm background selects readable text tone
- **WHEN** alarm list row background is generated from state color or gradient
- **THEN** text tone resolves to high-contrast light or deep variant based on background luminance
- **AND** users can read alarm title and reason without visual strain
