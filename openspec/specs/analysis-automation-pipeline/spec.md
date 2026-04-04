## Purpose

Define manual-trigger-first analysis execution and decoupled Kafka message-driven processing for analysis report generation.

## Requirements

### Requirement: System SHALL trigger analysis manually by default
The backend SHALL run analysis request generation through manual trigger API by default and SHALL not require half-day scheduler execution for normal operation.

#### Scenario: Scheduler is disabled in manual-trigger mode
- **WHEN** manual-trigger mode is enabled in runtime configuration
- **THEN** half-day scheduler does not emit analysis messages
- **AND** system still supports end-to-end analysis through manual trigger to Kafka pipeline

#### Scenario: Compatibility mode allows scheduled trigger fallback
- **WHEN** runtime explicitly enables scheduler compatibility mode
- **THEN** system allows scheduler to publish analysis requests
- **AND** downstream processing remains on Kafka consumer path

### Requirement: System SHALL decouple analysis execution through Kafka
The backend SHALL publish analysis requests to Kafka and process them through a Kafka consumer to decouple request intake from analysis execution.

#### Scenario: Producer publishes analysis request message
- **WHEN** backend receives an authenticated manual trigger request
- **THEN** producer publishes one analysis job message to the configured Kafka topic
- **AND** message payload identifies one aggregate analysis task instead of per-device tasks

#### Scenario: Consumer persists analysis result
- **WHEN** Kafka consumer receives a valid aggregate analysis job message
- **THEN** consumer queries all required device and telemetry data from database and invokes analysis pipeline
- **AND** consumer stores one aggregated report result into `analysis_reports`
- **AND** persisted report status reflects success or failure outcome

### Requirement: System SHALL enforce idempotent analysis consumption
The analysis consumer SHALL prevent duplicate effective report generation for the same trigger job identity.

#### Scenario: Duplicate message delivered by broker
- **WHEN** the same analysis request is delivered multiple times
- **THEN** consumer recognizes duplicate idempotency key
- **AND** consumer skips duplicate write or performs safe idempotent update without creating redundant aggregated reports

### Requirement: System SHALL trigger analysis via backend auto-aggregation workflow
The backend SHALL execute one-click trigger through a producer-consumer split: producer enqueues one aggregate job, consumer queries all target devices and their current telemetry context (including CPU/temperature class parameters), then runs LLM analysis asynchronously.

#### Scenario: One-click trigger aggregates all device contexts
- **WHEN** admin triggers analysis from frontend one-click action
- **THEN** producer enqueues one aggregate analysis job without requiring frontend device inputs
- **AND** consumer loads all target devices and required runtime metrics from database during job execution

#### Scenario: Long-running aggregation does not block API interaction
- **WHEN** backend starts asynchronous aggregate analysis workflow
- **THEN** trigger API returns accepted response promptly
- **AND** report lifecycle transitions are observable through subsequent report queries until one final report is ready
