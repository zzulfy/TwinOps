## ADDED Requirements

### Requirement: System SHALL provide device-level RCA through a dedicated sidecar
The system SHALL expose a dedicated RCA runtime for device-level root cause inference, implemented as a separately deployable service around `causaltrace-rca/`, and SHALL NOT depend on direct per-request execution of training-oriented scripts.

#### Scenario: Backend requests device-level RCA inference
- **WHEN** backend submits a structured device time-window inference request
- **THEN** the RCA runtime returns structured JSON containing ranked root-cause devices, causal edges, engine/profile metadata, and evidence window information
- **AND** the response is suitable for direct persistence and frontend rendering without parsing console output

#### Scenario: RCA runtime health is checked
- **WHEN** backend or operator calls the RCA runtime health endpoint
- **THEN** the runtime reports whether the model is loaded and ready
- **AND** health output includes enough metadata to identify the active profile or model version

### Requirement: Backend SHALL derive device-level RCA from recent telemetry windows
The backend SHALL construct a recent telemetry time window for current anomalous devices, convert each device into a device-level stress series, and use that matrix as the input for RCA inference.

#### Scenario: Aggregated analysis assembles device stress matrix
- **WHEN** aggregated analysis processing starts for a batch of anomalous devices
- **THEN** backend selects the configured device set and evidence window
- **AND** backend transforms recent telemetry into a device-by-time stress matrix before invoking the RCA engine

#### Scenario: Telemetry window quality is insufficient
- **WHEN** backend cannot construct a valid RCA input window because telemetry is missing or too sparse
- **THEN** backend skips or downgrades RCA invocation with explicit diagnostics
- **AND** the analysis job continues through fallback behavior instead of remaining stuck

### Requirement: Analysis pipeline SHALL degrade gracefully when RCA is unavailable
The system SHALL preserve analysis report generation when the RCA sidecar is unavailable, timed out, or returns invalid output.

#### Scenario: RCA sidecar call fails
- **WHEN** RCA inference fails due to timeout, transport error, or invalid response
- **THEN** backend records RCA fallback state and structured diagnostics
- **AND** backend still produces an analysis report through the existing LLM-only path
