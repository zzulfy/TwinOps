## MODIFIED Requirements

### Requirement: Alarm panel SHALL support status filtering
The frontend alarm panel SHALL provide status filtering for `new`, `acknowledged`, and `resolved` alarms, with the default view showing `new` alarms. The dashboard alarm panel SHALL remain monitoring-focused and SHALL present only alarm basic information and auto-scroll behavior.

#### Scenario: Operator switches alarm status filter
- **WHEN** the operator selects a status filter in the alarm panel
- **THEN** the panel requests and renders alarms for the selected status
- **AND** empty-state messaging remains readable when no alarms match

#### Scenario: Dashboard panel auto-scrolls alarm basic info
- **WHEN** alarm panel contains one or more records
- **THEN** panel displays basic fields such as device name, reason/event, level, and time
- **AND** records rotate through configured scroll animation without action buttons

#### Scenario: Footer alarm popup loads from backend API only
- **WHEN** the operator opens the footer alarm popup
- **THEN** frontend MUST request alarm data from backend alarm API
- **AND** frontend MUST NOT render locally hardcoded mock alarm items

#### Scenario: Backend is unavailable for footer alarm popup
- **WHEN** the footer alarm popup request fails due to backend unavailability or network error
- **THEN** frontend displays an explicit error or empty-state message in the popup
- **AND** frontend MUST NOT silently fallback to local mock data
