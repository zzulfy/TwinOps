## Purpose

Define deterministic frontend chunking rules and acceptance behavior for bundle-size optimization.
## Requirements
### Requirement: Deterministic vendor chunk split
The build system SHALL split heavy third-party dependencies into deterministic chunks to reduce the primary entry payload, improve browser caching efficiency, and align heavy groups with defer-loading boundaries.

#### Scenario: Build output uses deterministic vendor groups
- **WHEN** a production build is executed
- **THEN** output contains multiple stable vendor chunks instead of a single monolithic vendor chunk
- **AND** chunk grouping rules are defined in source-controlled build configuration
- **AND** heavy chart and 3D dependencies are grouped to support deferred execution outside the startup-critical path

### Requirement: Entry chunk budget guardrail
The build process SHALL expose, track, and compare entry-related chunk size warnings as a release quality signal across optimization iterations.

#### Scenario: Build emits actionable size feedback
- **WHEN** a production build exceeds configured warning thresholds
- **THEN** the build output reports specific oversized chunks
- **AND** optimization work can map each warning to a configured split rule
- **AND** maintainers can compare warning targets with the previous optimization baseline

### Requirement: Critical path assets remain eagerly available
Optimization SHALL NOT move critical startup assets behind unintended lazy boundaries.

#### Scenario: Startup route remains functional after chunk split
- **WHEN** the application is loaded on the default route
- **THEN** all required startup modules resolve without runtime import failures
- **AND** first-screen core layout renders successfully

