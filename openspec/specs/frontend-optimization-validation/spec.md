## Purpose

Define required validation and documentation checks for frontend optimization changes.
## Requirements
### Requirement: Optimization verification checklist
The change process SHALL include a repeatable checklist for performance and visual validation before completion, including CI-friendly smoke evidence. For auto-refresh related changes, the checklist SHALL include polling-behavior validation, duplicate-request prevention validation, and visible-state rendering stability checks. For alarm-panel scroll interaction changes, the checklist SHALL verify that no timer-driven auto-scroll remains and manual scrolling stays smooth.

#### Scenario: Checklist is executed before change completion
- **WHEN** optimization implementation is marked complete
- **THEN** build verification, runtime smoke checks, and visual regression checks are recorded
- **AND** unresolved blockers are documented explicitly
- **AND** at least one reproducible smoke result is produced in a non-interactive execution mode

#### Scenario: Auto-refresh optimization checklist is explicitly verified
- **WHEN** frontend introduces or changes automatic refresh logic
- **THEN** validation records include polling cadence, in-flight dedup behavior, and re-render stability outcomes
- **AND** verification confirms no browser reload dependency for core data updates

#### Scenario: Alarm manual-scroll checklist is explicitly verified
- **WHEN** frontend changes alarm panel scrolling interaction
- **THEN** validation confirms timer-driven auto-scroll is removed
- **AND** validation confirms manual scroll interaction remains responsive without jitter

### Requirement: Build verification is mandatory
The optimization process SHALL require a successful production build as an acceptance gate and SHALL record remaining heavy chunk warnings for trend tracking.

#### Scenario: Build gate prevents unverified completion
- **WHEN** build fails or critical runtime errors are detected
- **THEN** the optimization change is not marked complete
- **AND** follow-up tasks are created to resolve failures
- **AND** remaining chunk warnings are recorded as explicit optimization debt when build succeeds

### Requirement: Documentation synchronization
The process SHALL update developer-facing documentation when optimization conventions change.

#### Scenario: README reflects new optimization conventions
- **WHEN** chunking strategy or token conventions are introduced or modified
- **THEN** frontend documentation is updated with current commands and conventions
- **AND** examples align with actual project structure and scripts
