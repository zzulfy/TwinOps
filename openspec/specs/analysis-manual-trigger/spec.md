## Purpose

Define one-click manual analysis trigger behavior, Kafka asynchronous execution, and single-report persistence for on-demand analysis requests.

## Requirements

### Requirement: Analysis center SHALL support manual analysis trigger
The system SHALL provide a single manual trigger action in analysis center so admin users can start analysis on demand and persist one aggregated report through the backend pipeline.

#### Scenario: Admin triggers a new analysis task
- **WHEN** an authenticated admin clicks the trigger button
- **THEN** frontend calls the backend trigger API and receives an accepted response
- **AND** backend producer publishes one analysis job message to Kafka for asynchronous processing

#### Scenario: Triggered task result is persisted and queryable
- **WHEN** the consumer finishes processing the manually triggered analysis job
- **THEN** backend stores one aggregated analysis report with success or failed status
- **AND** the report appears in analysis center list/detail queries without requiring service restart

### Requirement: Manual trigger API SHALL enforce auth and input validation
The backend manual trigger endpoint SHALL require admin authentication and SHALL accept trigger requests without business payload fields.

#### Scenario: Unauthenticated trigger request is rejected
- **WHEN** a request calls the manual trigger endpoint without valid admin token
- **THEN** backend returns unauthorized response
- **AND** no analysis message is published

#### Scenario: Authenticated trigger request without payload is accepted
- **WHEN** an authenticated admin calls the manual trigger endpoint without device/metric input fields
- **THEN** backend returns accepted response
- **AND** backend queues one asynchronous analysis job for consumer-side data aggregation
