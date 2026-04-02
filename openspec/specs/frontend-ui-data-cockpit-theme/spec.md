## Purpose

Define a shared Data Cockpit visual foundation for shell primitives and information hierarchy across cockpit-oriented frontend surfaces.
## Requirements
### Requirement: Data Cockpit token system SHALL define high-contrast shell primitives
The frontend SHALL provide a Data Cockpit token set for shell backgrounds, panel surfaces, border hierarchy, shadow elevation, semantic status accents, and reusable control primitives for CTA and status-message components.

#### Scenario: Shared tokens drive cockpit baseline
- **WHEN** shell and page components consume design tokens
- **THEN** visual contrast, depth, status accents, and CTA/status-message controls are derived from shared token variables rather than component-local hard-coded values

### Requirement: Data Cockpit visual language SHALL prioritize operational scanability
The UI SHALL present title, key value, status badge, and interaction focus with explicit hierarchy suitable for rapid operational scanning.

#### Scenario: Critical UI information is visually prioritized
- **WHEN** users open dashboard or device-detail views
- **THEN** key labels, values, and status indicators appear with stronger contrast and clearer hierarchy than secondary decorative elements

