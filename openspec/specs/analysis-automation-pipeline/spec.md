## Purpose

Define automated half-day analysis scheduling and decoupled message-driven execution for analysis report generation.

## Requirements

### Requirement: System SHALL trigger analysis automatically every half day
The backend SHALL schedule analysis request generation at 00:00 and 12:00 daily without requiring manual submission.

#### Scenario: Scheduler emits half-day analysis batch
- **WHEN** system time reaches a configured half-day schedule slot
- **THEN** backend collects target fault devices with required metric summary context
- **AND** backend emits analysis request messages for downstream processing

### Requirement: System SHALL decouple analysis execution through RocketMQ
The backend SHALL publish analysis requests to RocketMQ and process them through a consumer to decouple scheduling from analysis execution.

#### Scenario: Producer publishes analysis request message
- **WHEN** scheduler creates analysis payloads
- **THEN** producer publishes messages to the configured RocketMQ topic
- **AND** message payload contains device identity and analysis context fields required by consumer

#### Scenario: Consumer persists analysis result
- **WHEN** consumer receives a valid analysis request message
- **THEN** consumer invokes analysis pipeline and stores report result into `analysis_reports`
- **AND** persisted report status reflects success or failure outcome

### Requirement: System SHALL enforce idempotent analysis consumption
The analysis consumer SHALL prevent duplicate effective report generation for the same `deviceCode + half-day slot`.

#### Scenario: Duplicate message delivered by broker
- **WHEN** the same analysis request is delivered multiple times
- **THEN** consumer recognizes duplicate idempotency key
- **AND** consumer skips duplicate write or performs safe idempotent update without creating redundant reports
