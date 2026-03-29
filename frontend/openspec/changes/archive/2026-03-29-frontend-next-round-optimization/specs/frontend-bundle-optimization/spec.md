## ADDED Requirements

### Requirement: Deterministic vendor chunk split
The build system SHALL split heavy third-party dependencies into deterministic chunks to reduce the primary entry payload and improve browser caching efficiency.

#### Scenario: Build output uses deterministic vendor groups
- **WHEN** a production build is executed
- **THEN** output contains multiple stable vendor chunks instead of a single monolithic vendor chunk
- **AND** chunk grouping rules are defined in source-controlled build configuration

### Requirement: Entry chunk budget guardrail
The build process SHALL expose and track entry-related chunk size warnings as a release quality signal.

#### Scenario: Build emits actionable size feedback
- **WHEN** a production build exceeds configured warning thresholds
- **THEN** the build output reports specific oversized chunks
- **AND** optimization work can map each warning to a configured split rule

### Requirement: Critical path assets remain eagerly available
Optimization SHALL NOT move critical startup assets behind unintended lazy boundaries.

#### Scenario: Startup route remains functional after chunk split
- **WHEN** the application is loaded on the default route
- **THEN** all required startup modules resolve without runtime import failures
- **AND** first-screen core layout renders successfully
