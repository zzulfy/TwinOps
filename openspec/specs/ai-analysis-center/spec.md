## Purpose

Define analysis center capabilities for LLM-assisted prediction reports and resilient failure handling.

## Requirements

### Requirement: Analysis module SHALL provide LLM-assisted metric prediction reports
The backend SHALL generate prediction reports using telemetry/metric inputs through an LLM-assisted analysis pipeline and expose report query APIs, and SHALL emit lifecycle logs that make provider and fallback behavior observable. The module SHALL also support scheduler-driven message consumption flow for automatic report creation.

#### Scenario: Scheduled pipeline triggers analysis prediction
- **WHEN** scheduler and RocketMQ consumer deliver a valid analysis request for a target device and time slot
- **THEN** backend creates and stores an analysis report with prediction output
- **AND** backend logs structured events for analysis start and success, including module/event/result and latency context

### Requirement: Frontend SHALL provide analysis center page
The frontend SHALL expose a dedicated analysis center page that displays analysis report list and detail, including prediction summary and recommended actions. The page SHALL be read-only for report creation and SHALL not require manual analysis submission input.

#### Scenario: Admin views latest analysis results
- **WHEN** admin opens analysis center page
- **THEN** the page shows available reports with status/summary metadata
- **AND** selecting a report reveals structured prediction detail content

#### Scenario: Analysis center hides manual creation form
- **WHEN** admin enters analysis center page
- **THEN** no deviceCode/metric input form or manual submit button is presented
- **AND** page behavior remains focused on browsing scheduled analysis results

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
