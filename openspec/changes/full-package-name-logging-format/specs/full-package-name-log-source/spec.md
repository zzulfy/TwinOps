## ADDED Requirements

### Requirement: Backend logs SHALL show full package name in source location
Backend logging output MUST display logger source with full package name, class, method, and line information.

#### Scenario: Controller log shows complete source path
- **WHEN** backend prints a controller log line
- **THEN** source location contains full package path (for example `com.twinops.backend.analysis.controller.AnalysisController.detail:9`)
- **AND** abbreviated package segments such as `c.t.b.a` are not used
