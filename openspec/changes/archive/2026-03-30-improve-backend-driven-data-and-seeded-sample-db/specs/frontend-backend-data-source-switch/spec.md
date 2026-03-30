## ADDED Requirements

### Requirement: Frontend business data must come from backend APIs
The frontend SHALL source business data for dashboard and device detail experiences from backend APIs instead of fixed arrays or random runtime generation.

#### Scenario: Device detail reads backend data
- **WHEN** the device detail page loads
- **THEN** it renders device and metric values from backend responses rather than generated local fallback business data

### Requirement: Dashboard panels consume backend summaries
The frontend SHALL render device scale, alarm panel, and metric chart business data from backend summary/detail endpoints.

#### Scenario: Dashboard panels are API-driven
- **WHEN** the dashboard is opened
- **THEN** panel values are populated from backend APIs covering scale, alarms, and metrics

### Requirement: Graceful handling for empty and failed backend responses
The frontend SHALL provide deterministic empty/error rendering for API-driven panels and pages when backend data is unavailable.

#### Scenario: Empty result handling
- **WHEN** backend returns no records for a panel query
- **THEN** the panel renders an explicit empty state instead of fabricated random business values

#### Scenario: API failure handling
- **WHEN** backend request fails
- **THEN** the UI renders a visible error/fallback state without breaking page layout
