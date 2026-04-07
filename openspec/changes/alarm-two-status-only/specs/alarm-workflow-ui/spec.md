## MODIFIED Requirements

### Requirement: Alarm panel SHALL support status filtering
The frontend alarm panel SHALL provide status filtering for `new` and `resolved` alarms, with the default view showing `new` alarms. The dashboard alarm panel SHALL remain monitoring-focused and SHALL present only alarm basic information and manual scroll behavior without timer-driven auto-rotation. Alarm status presentation SHALL use backend-provided data only and SHALL maintain high text/background contrast for operational readability.

#### Scenario: Operator switches alarm status filter
- **WHEN** the operator selects a status filter in the alarm panel
- **THEN** the panel requests and renders alarms for the selected status
- **AND** empty-state messaging remains readable when no alarms match

#### Scenario: Dashboard panel allows manual scrolling of alarm basic info
- **WHEN** alarm panel contains more records than the visible area
- **THEN** panel displays basic fields such as device name, reason/event, level, and time
- **AND** records are browsed by user-driven manual scrolling instead of automatic row rotation

#### Scenario: Footer alarm popup loads from backend API only
- **WHEN** the operator opens the footer alarm popup
- **THEN** frontend MUST request alarm data from backend alarm API
- **AND** frontend MUST NOT render locally hardcoded mock alarm items

#### Scenario: Backend is unavailable for footer alarm popup
- **WHEN** the footer alarm popup request fails due to backend unavailability or network error
- **THEN** frontend displays an explicit error or empty-state message in the popup
- **AND** frontend MUST NOT silently fallback to local mock data

#### Scenario: Alarm status card keeps readable contrast in dark cockpit theme
- **WHEN** alarm cards render statuses such as `resolved`
- **THEN** text color and background color combination remains visually distinguishable
- **AND** frontend uses shared design tokens rather than component-local deep-color overrides

### Requirement: Alarm panel SHALL support lifecycle actions
The frontend SHALL allow operators to transition alarm status through backend-supported lifecycle actions (`new -> resolved`) from the device list operation surface rather than the dashboard alarm panel.

#### Scenario: Operator resolves an alarm from device list surface
- **WHEN** the operator triggers `resolved` on a `new` alarm item in the device list page
- **THEN** frontend calls `PATCH /api/alarms/{id}/status` with `resolved`
- **AND** the alarm updates or exits the current filtered list consistently across modules after refresh

