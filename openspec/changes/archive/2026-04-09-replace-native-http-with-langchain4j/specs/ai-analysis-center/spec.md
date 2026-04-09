## MODIFIED Requirements

### Requirement: Analysis module SHALL provide LLM-assisted metric prediction reports
The backend SHALL generate prediction reports using telemetry/metric inputs through an LLM-assisted analysis pipeline and expose report query APIs, and SHALL emit lifecycle logs that make provider and fallback behavior observable. The module SHALL support Kafka-driven message consumption flow for asynchronous report creation, and SHALL keep equivalent report semantics when provider client implementation is migrated to LangChain4j.

#### Scenario: Trigger pipeline processes analysis prediction
- **WHEN** manual trigger or compatibility scheduler publishes one valid aggregate analysis job to Kafka
- **THEN** consumer loads all required device/telemetry context from database and performs one LLM analysis run
- **AND** backend creates and stores one aggregated analysis report with prediction output
- **AND** backend logs structured events for analysis start and success, including module/event/result and latency context

#### Scenario: LangChain4j migration keeps report behavior stable
- **WHEN** backend provider adapter uses LangChain4j to invoke the configured OpenAI-compatible model
- **THEN** persisted report fields and status semantics remain compatible with existing analysis center list/detail rendering
- **AND** fallback-enabled and fallback-disabled paths keep observable failure/fallback events and expected success/failed persistence behavior
