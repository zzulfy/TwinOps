## MODIFIED Requirements

### Requirement: System SHALL decouple analysis execution through Kafka
The backend SHALL publish analysis requests to Kafka and process them through a Kafka consumer to decouple scheduling from analysis execution.

#### Scenario: Producer publishes analysis request message
- **WHEN** backend receives a valid analysis trigger payload
- **THEN** producer publishes messages to configured Kafka topic
- **AND** message payload contains device identity and analysis context fields required by consumer

#### Scenario: Consumer persists analysis result
- **WHEN** Kafka consumer receives a valid analysis request message
- **THEN** consumer invokes analysis pipeline and stores report result into `analysis_reports`
- **AND** persisted report status reflects success or failure outcome

### Requirement: System SHALL trigger analysis via backend auto-aggregation workflow
The backend SHALL execute one-click trigger by querying all target devices and their current telemetry context (including CPU/temperature class parameters), constructing analysis messages asynchronously, and processing them through Kafka.

#### Scenario: One-click trigger aggregates all device contexts
- **WHEN** admin triggers analysis from frontend one-click action
- **THEN** backend queries target devices and required runtime metrics from database
- **AND** backend publishes per-device analysis messages asynchronously without requiring frontend device inputs

#### Scenario: Long-running aggregation does not block API interaction
- **WHEN** backend starts all-device aggregation and publish workflow
- **THEN** trigger API returns accepted response promptly
- **AND** report lifecycle transitions are observable through subsequent report queries
