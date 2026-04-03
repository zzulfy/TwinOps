## ADDED Requirements

### Requirement: Analysis module SHALL provide LLM-assisted metric prediction reports
The backend SHALL generate prediction reports using telemetry/metric inputs through an LLM-assisted analysis pipeline and expose report query APIs.

#### Scenario: Admin triggers analysis prediction
- **WHEN** an admin submits analysis request with required metric context
- **THEN** backend creates and stores an analysis report with prediction output
- **AND** report includes confidence/risk metadata for frontend rendering

### Requirement: Frontend SHALL provide analysis center page
The frontend SHALL expose a dedicated analysis center page that displays analysis report list and detail, including prediction summary and recommended actions.

#### Scenario: Admin views latest analysis results
- **WHEN** admin opens analysis center page
- **THEN** the page shows available reports with status/summary metadata
- **AND** selecting a report reveals structured prediction detail content

### Requirement: Analysis failures SHALL degrade gracefully
The system SHALL surface analysis execution failures as explicit report states without crashing the dashboard or device modules.

#### Scenario: LLM provider timeout occurs
- **WHEN** analysis request exceeds configured timeout or provider call fails
- **THEN** backend stores failure state/message for the report
- **AND** frontend shows failure status with retry guidance
