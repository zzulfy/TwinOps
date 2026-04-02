## ADDED Requirements

### Requirement: Alarm panel SHALL support status filtering
The frontend alarm panel SHALL provide status filtering for `new`, `acknowledged`, and `resolved` alarms, with the default view showing `new` alarms.

#### Scenario: Operator switches alarm status filter
- **WHEN** the operator selects a status filter in the alarm panel
- **THEN** the panel requests and renders alarms for the selected status
- **AND** empty-state messaging remains readable when no alarms match

### Requirement: Alarm panel SHALL support lifecycle actions
The frontend SHALL allow operators to transition alarm status through backend-supported lifecycle actions (`new -> acknowledged -> resolved`) from the alarm panel.

#### Scenario: Operator acknowledges an alarm
- **WHEN** the operator triggers `acknowledged` on a `new` alarm item
- **THEN** frontend calls `PATCH /api/alarms/{id}/status` with `acknowledged`
- **AND** the updated status is reflected in current panel state

#### Scenario: Operator resolves an alarm
- **WHEN** the operator triggers `resolved` on an `acknowledged` alarm item
- **THEN** frontend calls `PATCH /api/alarms/{id}/status` with `resolved`
- **AND** the alarm updates or exits the current filtered list consistently
