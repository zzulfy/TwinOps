## ADDED Requirements

### Requirement: Analysis center SHALL support manual analysis trigger
The system SHALL provide a manual trigger action in analysis center so admin users can submit analysis requests on demand and persist resulting reports through the backend pipeline.

#### Scenario: Admin triggers a new analysis task
- **WHEN** an authenticated admin clicks the trigger button with valid analysis input
- **THEN** frontend calls the backend trigger API and receives an accepted response
- **AND** backend publishes the analysis request to the configured message pipeline for asynchronous processing

#### Scenario: Triggered task result is persisted and queryable
- **WHEN** the consumer finishes processing a manually triggered analysis request
- **THEN** backend stores an analysis report record with success or failed status
- **AND** the report appears in analysis center list/detail queries without requiring service restart

### Requirement: Manual trigger API SHALL enforce auth and input validation
The backend manual trigger endpoint SHALL require admin authentication and SHALL reject invalid payloads using existing API error conventions.

#### Scenario: Unauthenticated trigger request is rejected
- **WHEN** a request calls the manual trigger endpoint without valid admin token
- **THEN** backend returns unauthorized response
- **AND** no analysis message is published

#### Scenario: Invalid trigger payload is rejected
- **WHEN** a request omits required analysis fields or provides invalid values
- **THEN** backend returns validation failure response
- **AND** no analysis report record is created
