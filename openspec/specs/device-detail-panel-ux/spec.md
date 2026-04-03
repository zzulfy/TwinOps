## Purpose

Define white-theme visual consistency and content accessibility for the device detail panel.

## Requirements

### Requirement: White-theme detail panel visual consistency
The device detail panel SHALL prioritize focused single-device readability when opened via `/devices/:deviceCode`, while preserving cockpit visual consistency.

#### Scenario: Focused detail rendering from device route
- **WHEN** admin enters a specific device detail route
- **THEN** panel emphasizes selected device core fields, telemetry status, and alarm summary
- **AND** layout remains scannable without aggregate clutter

### Requirement: Detail content scroll accessibility
The detail page and panel containers SHALL support vertical scrolling when content exceeds viewport height so all device details remain accessible.

#### Scenario: Long content remains reachable
- **WHEN** selected device has extended field content or history blocks
- **THEN** admin can scroll to all sections
- **AND** no critical fields are clipped by fixed container height
