## ADDED Requirements

### Requirement: Backend module boundaries for core data domains
The system SHALL provide backend modules for device, telemetry, alarm, and dashboard aggregation within a single Java application.

#### Scenario: Module API ownership is explicit
- **WHEN** backend APIs are implemented for this change
- **THEN** each endpoint is owned by one of the four modules: device, telemetry, alarm, or dashboard

### Requirement: Device master data persistence with stable identity
The system SHALL persist device master records in MySQL using `device_code` as a unique business key and store `label_key` for 3D label mapping.

#### Scenario: Device identity remains stable across name changes
- **WHEN** a device display name is updated
- **THEN** the record remains uniquely identifiable by `device_code` and linked to 3D mapping by `label_key`

### Requirement: Seeded sample dataset in MySQL
The system SHALL provide deterministic seed data that initializes at least 50 devices with related telemetry and alarm records in MySQL.

#### Scenario: Fresh environment can be initialized
- **WHEN** a clean database executes the provided seed process
- **THEN** at least 50 device rows and corresponding telemetry/alarm sample rows are available for API reads

### Requirement: Telemetry retention is limited to 30 days
The system SHALL enforce a 30-day telemetry data retention policy for dashboard and detail queries.

#### Scenario: Query excludes data older than retention window
- **WHEN** telemetry is requested for periods beyond 30 days
- **THEN** the response includes only data within the most recent 30 days according to retention policy

### Requirement: Dashboard aggregation endpoint
The system SHALL expose an aggregation API that returns device scale summary, alarm summary, and chart-ready metric summary for frontend dashboard consumption.

#### Scenario: Dashboard data is fetched in one request
- **WHEN** the frontend requests dashboard summary data
- **THEN** the backend responds with all required summary sections in a single payload
