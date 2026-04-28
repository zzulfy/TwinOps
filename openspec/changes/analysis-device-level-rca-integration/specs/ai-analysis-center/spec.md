## MODIFIED Requirements

### Requirement: Analysis module SHALL provide LLM-assisted metric prediction reports
The backend SHALL generate prediction reports using telemetry/metric inputs through an LLM-assisted analysis pipeline and expose report query APIs. When RCA enrichment is available, reports SHALL also include structured device-level root-cause evidence and engine metadata.

#### Scenario: Trigger pipeline processes RCA-enriched analysis prediction
- **WHEN** manual trigger publishes one valid aggregate analysis job to Kafka and RCA enrichment succeeds
- **THEN** backend creates and stores one aggregated analysis report with prediction output
- **AND** the persisted report includes structured root-cause ranking, causal relationship evidence, engine identity, and evidence-window metadata

#### Scenario: Fallback report remains queryable without RCA evidence
- **WHEN** aggregate analysis completes through LLM-only fallback
- **THEN** persisted report remains compatible with list/detail APIs
- **AND** RCA-specific fields are either empty or explicitly marked as fallback rather than causing API incompatibility

### Requirement: Frontend SHALL provide analysis center page
The frontend SHALL expose a dedicated analysis center page that displays analysis report list and detail, including prediction summary, recommended actions, and RCA evidence when present.

#### Scenario: Admin views RCA-enriched analysis detail
- **WHEN** admin opens a report detail that includes structured RCA output
- **THEN** the page shows root-cause device ranking, causal chain or edge evidence, and engine metadata alongside existing text prediction detail

#### Scenario: Admin views fallback analysis detail
- **WHEN** admin opens a report detail generated without RCA evidence
- **THEN** the page still shows report text, status, and existing fields correctly
- **AND** the RCA section degrades gracefully with explicit fallback or unavailable messaging
