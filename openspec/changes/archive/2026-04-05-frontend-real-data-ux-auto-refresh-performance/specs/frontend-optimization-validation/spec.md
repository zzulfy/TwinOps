## MODIFIED Requirements

### Requirement: Optimization verification checklist
The change process SHALL include a repeatable checklist for performance and visual validation before completion, including CI-friendly smoke evidence. For auto-refresh related changes, the checklist SHALL include polling-behavior validation, duplicate-request prevention validation, and visible-state rendering stability checks.

#### Scenario: Checklist is executed before change completion
- **WHEN** optimization implementation is marked complete
- **THEN** build verification, runtime smoke checks, and visual regression checks are recorded
- **AND** unresolved blockers are documented explicitly
- **AND** at least one reproducible smoke result is produced in a non-interactive execution mode

#### Scenario: Auto-refresh optimization checklist is explicitly verified
- **WHEN** frontend introduces or changes automatic refresh logic
- **THEN** validation records include polling cadence, in-flight dedup behavior, and re-render stability outcomes
- **AND** verification confirms no browser reload dependency for core data updates

### Requirement: Build verification is mandatory
The optimization process SHALL require a successful production build as an acceptance gate and SHALL record remaining heavy chunk warnings for trend tracking.

#### Scenario: Build gate prevents unverified completion
- **WHEN** build fails or critical runtime errors are detected
- **THEN** the optimization change is not marked complete
- **AND** follow-up tasks are created to resolve failures
- **AND** remaining chunk warnings are recorded as explicit optimization debt when build succeeds
