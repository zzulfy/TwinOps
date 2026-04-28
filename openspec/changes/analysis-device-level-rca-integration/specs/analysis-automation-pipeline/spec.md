## MODIFIED Requirements

### Requirement: System SHALL decouple analysis execution through Kafka
The backend SHALL publish analysis requests to Kafka and process them through a Kafka consumer to decouple request intake from analysis execution. Consumer-side execution SHALL support RCA enrichment before final report generation.

#### Scenario: Consumer persists RCA-enriched analysis result
- **WHEN** Kafka consumer receives a valid aggregate analysis job message
- **THEN** consumer queries required device and telemetry data from database
- **AND** consumer attempts RCA enrichment using the configured RCA engine before final report generation
- **AND** consumer stores one aggregated report result into `analysis_reports`
- **AND** persisted report status reflects success, fallback, or failure outcome

### Requirement: System SHALL trigger analysis via backend auto-aggregation workflow
The backend SHALL execute one-click trigger through a producer-consumer split: producer enqueues one aggregate job, consumer queries all target devices and their current telemetry context, derives an RCA evidence window, and then runs final report generation asynchronously.

#### Scenario: One-click trigger aggregates RCA-ready context
- **WHEN** admin triggers analysis from frontend one-click action
- **THEN** producer enqueues one aggregate analysis job without requiring frontend device inputs
- **AND** consumer loads all target devices and required runtime metrics from database during job execution
- **AND** consumer may invoke RCA inference using the assembled device-level window before producing the final report

#### Scenario: RCA fallback does not break async pipeline
- **WHEN** backend starts asynchronous aggregate analysis workflow and RCA inference is unavailable
- **THEN** trigger API still returns accepted response promptly
- **AND** consumer completes the job through fallback behavior instead of leaving the report in perpetual `processing`
