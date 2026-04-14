## ADDED Requirements

### Requirement: Frontend SHALL own simulation device UI definitions
The system SHALL define simulation-device UI objects (including object identity, display label, clickability, and `deviceCode` binding) in frontend-managed configuration files, and SHALL NOT require backend APIs to provide UI layout semantics.

#### Scenario: Dashboard initializes simulation UI from frontend config
- **WHEN** the dashboard simulation panel loads
- **THEN** interactive and decorative simulation objects are resolved from frontend configuration
- **AND** no backend response field is required to construct UI object layout

#### Scenario: Frontend config declares stable object-to-device mapping
- **WHEN** a simulation object is marked as interactive in frontend config
- **THEN** that object MUST include a valid `deviceCode` binding
- **AND** the binding SHALL be used as the single join key for runtime data merge

### Requirement: Backend SHALL provide data-only simulation device payloads
The backend device APIs used by the simulation page SHALL return business data fields (status, telemetry, alarms, and related operational attributes) and SHALL NOT return UI rendering metadata such as scene coordinates, visual style directives, or layout hierarchy instructions.

#### Scenario: Device list payload excludes UI metadata
- **WHEN** frontend requests simulation device data from backend APIs
- **THEN** each device item contains operational data fields only
- **AND** payload does not include frontend layout/config-only fields

#### Scenario: Runtime telemetry remains available for simulation rendering
- **WHEN** backend returns device data
- **THEN** frontend receives enough fields to render state and details (including status, CPU, temperature, humidity, power, and alarms)
- **AND** frontend can update scene status visuals without additional UI metadata from backend

### Requirement: Frontend SHALL enforce 1:1 config-data consistency
The frontend simulation module SHALL compare configured interactive `deviceCode` set and backend device `deviceCode` set at runtime and SHALL surface explicit diagnostics when mismatch is detected.

#### Scenario: Config and data sets are consistent
- **WHEN** frontend config device codes exactly match backend device codes
- **THEN** simulation scene renders all configured interactive devices normally
- **AND** click interaction is enabled for the complete set

#### Scenario: Config and data sets are inconsistent
- **WHEN** frontend detects device codes present in only one side (config-only or data-only)
- **THEN** frontend logs a structured mismatch diagnostic including missing and extra codes
- **AND** frontend SHALL NOT silently fabricate missing devices

### Requirement: Device details SHALL be opened from object clicks only
The simulation page SHALL open a centered device information dialog only after the user clicks an interactive simulation device object bound by frontend config, and SHALL keep non-device objects non-interactive.

#### Scenario: Click interactive device object
- **WHEN** user clicks a configured interactive simulation object
- **THEN** frontend resolves target by `deviceCode` and opens centered dialog with latest backend data
- **AND** dialog content reflects current device status and telemetry

#### Scenario: Click decorative or unbound object
- **WHEN** user clicks a decorative object or empty scene area
- **THEN** no device dialog is opened
- **AND** existing dialog is closed or remains closed
