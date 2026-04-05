## ADDED Requirements

### Requirement: Alarm panel SHALL use manual scrolling instead of automatic rotation
The dashboard alarm panel MUST present alarm rows in a manually scrollable list and MUST NOT auto-rotate rows by timer-driven animation.

#### Scenario: Alarm list remains stable without automatic movement
- **WHEN** the alarm panel is displayed with one or more records
- **THEN** list content does not auto-shift over time
- **AND** row order changes only when backend data changes

#### Scenario: Operator manually browses alarm rows
- **WHEN** the operator uses mouse wheel, trackpad, or touch scrolling on the alarm list
- **THEN** the list scrolls smoothly within the panel viewport
- **AND** no auto-scroll logic overrides the user’s current reading position
