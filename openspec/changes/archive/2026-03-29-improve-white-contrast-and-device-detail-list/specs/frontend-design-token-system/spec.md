## ADDED Requirements

### Requirement: High contrast text tokens
The frontend token system SHALL provide primary and secondary text color tokens that maintain optimal readable contrast ratios against the standard white background (`#FFFFFF` or similar light shades).

#### Scenario: Text maintains reading contrast on white backgrounds
- **WHEN** a user views textual content within widgets, panels, or lists in the white theme
- **THEN** the primary text color displays clearly with high contrast against the surrounding background
- **AND** the secondary text colors provide sufficient visual hierarchy without becoming illegible or washed out
