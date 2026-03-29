## Purpose

Define white-theme visual consistency and content accessibility for the device detail panel.

## Requirements

### Requirement: White-theme detail panel visual consistency
The device detail panel SHALL use a white-theme visual style consistent with the dashboard shell, replacing dark-window styling with clear typography hierarchy, light surfaces, and readable section grouping.

#### Scenario: Detail panel matches dashboard visual language
- **WHEN** users open the device detail page
- **THEN** detail panels render with white-dominant surfaces and non-dark modal aesthetics
- **AND** titles, labels, and values are visually structured for quick scanning

### Requirement: Detail content scroll accessibility
The detail page and panel containers SHALL support vertical scrolling when content exceeds viewport height so all device details remain accessible.

#### Scenario: Long content remains reachable
- **WHEN** device count or detail fields exceed the visible area
- **THEN** users can scroll to reach all remaining content
- **AND** no critical detail fields are blocked by fixed-height containers
