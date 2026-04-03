## MODIFIED Requirements

### Requirement: Analysis module SHALL provide LLM-assisted metric prediction reports
The backend SHALL generate prediction reports using telemetry/metric inputs through an LLM-assisted analysis pipeline and expose report query APIs, and SHALL emit lifecycle logs that make provider and fallback behavior observable.

#### Scenario: Admin triggers analysis prediction
- **WHEN** an admin submits analysis request with required metric context
- **THEN** backend creates and stores an analysis report with prediction output
- **AND** backend logs structured events for analysis start and success, including module/event/result and latency context

### Requirement: Analysis failures SHALL degrade gracefully
The system SHALL surface analysis execution failures as explicit report states without crashing the dashboard or device modules, and SHALL log provider failure and fallback transitions explicitly.

#### Scenario: LLM provider timeout occurs with fallback enabled
- **WHEN** analysis request exceeds configured timeout or provider call fails and fallback is enabled
- **THEN** backend logs provider failure and fallback decision events
- **AND** backend returns fallback-derived prediction result while preserving structured failure context in logs

#### Scenario: LLM provider timeout occurs with fallback disabled
- **WHEN** analysis request exceeds configured timeout or provider call fails and fallback is disabled
- **THEN** backend stores failure state/message for the report
- **AND** backend logs terminal failure event with `result=failed` and non-sensitive error diagnostics
