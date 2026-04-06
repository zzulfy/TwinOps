## Purpose

Define fault-rate chart presentation semantics so dashboard users can read minute-level trends with consistent metric naming.

## Requirements

### Requirement: Fault-rate chart SHALL present minute-only time labels
The system SHALL render the device fault-rate chart x-axis in one-minute granularity and display each label in `HH:mm` format only.

#### Scenario: Minute labels hide date parts
- **WHEN** fault-rate chart points are rendered in dashboard
- **THEN** each x-axis label SHALL display only hour and minute (`HH:mm`)
- **AND** date components such as month/day SHALL NOT be shown in axis labels

### Requirement: Fault-rate chart SHALL use fault-rate semantics consistently
The system SHALL express the chart metric as "fault rate" in all user-facing chart semantics, including title, y-axis meaning, legend, and tooltip.

#### Scenario: Chart semantics use fault rate wording
- **WHEN** users view the fault-rate module
- **THEN** panel and chart text SHALL describe the y-axis metric as fault rate
- **AND** wording implying "fault-rate change" SHALL NOT be used

