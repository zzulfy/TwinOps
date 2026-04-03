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

### Requirement: Alarm panel SHALL support lifecycle actions
The frontend SHALL allow operators to transition alarm status through backend-supported lifecycle actions (`new -> acknowledged -> resolved`) from the device list operation surface rather than the dashboard alarm panel.

#### Scenario: Operator acknowledges an alarm from device list surface
- **WHEN** the operator triggers `acknowledged` on a `new` alarm item in the device list page
- **THEN** frontend calls `PATCH /api/alarms/{id}/status` with `acknowledged`
- **AND** the updated status is reflected in current list state and subsequent dashboard refresh

#### Scenario: Operator resolves an alarm from device list surface
- **WHEN** the operator triggers `resolved` on an `acknowledged` alarm item in the device list page
- **THEN** frontend calls `PATCH /api/alarms/{id}/status` with `resolved`
- **AND** the alarm updates or exits the current filtered list consistently across modules after refresh
