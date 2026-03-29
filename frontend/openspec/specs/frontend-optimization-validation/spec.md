## Purpose

Define required validation and documentation checks for frontend optimization changes.
## Requirements
### Requirement: Optimization verification checklist
The change process SHALL include a repeatable checklist for performance and visual validation before completion, including CI-friendly smoke evidence.

#### Scenario: Checklist is executed before change completion
- **WHEN** optimization implementation is marked complete
- **THEN** build verification, runtime smoke checks, and visual regression checks are recorded
- **AND** unresolved blockers are documented explicitly
- **AND** at least one reproducible smoke result is produced in a non-interactive execution mode

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

