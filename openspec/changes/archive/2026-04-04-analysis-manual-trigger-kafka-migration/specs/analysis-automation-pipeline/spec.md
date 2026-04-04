## MODIFIED Requirements

### Requirement: System SHALL decouple analysis execution through Kafka
The backend SHALL publish analysis requests to Kafka and process them through a Kafka consumer to decouple request intake from analysis execution.

#### Scenario: Producer publishes analysis request message
- **WHEN** backend receives a valid analysis trigger payload
- **THEN** producer publishes message to the configured Kafka topic
- **AND** message payload contains device identity and analysis context fields required by consumer

#### Scenario: Consumer persists analysis result
- **WHEN** Kafka consumer receives a valid analysis request message
- **THEN** consumer invokes analysis pipeline and stores report result into `analysis_reports`
- **AND** persisted report status reflects success or failure outcome

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
