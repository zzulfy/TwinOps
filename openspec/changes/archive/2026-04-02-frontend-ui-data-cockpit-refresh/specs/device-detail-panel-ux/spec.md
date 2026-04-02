## MODIFIED Requirements

### Requirement: White-theme detail panel visual consistency
The device detail panel SHALL use cockpit-style visual language consistent with the dashboard shell, including high-contrast surfaces, clearer section framing, and readable typography hierarchy.

#### Scenario: Detail panel matches cockpit visual language
- **WHEN** users open the device detail page
- **THEN** detail panels render with cockpit-style surfaces instead of flat light-card styling
- **AND** titles, labels, and values are visually structured for fast operational scanning

### Requirement: Detail content scroll accessibility
The detail page and panel containers SHALL support vertical scrolling when content exceeds viewport height so all device details remain accessible.

#### Scenario: Long content remains reachable
- **WHEN** device count or detail fields exceed the visible area
- **THEN** users can scroll to reach all remaining content
- **AND** no critical detail fields are blocked by fixed-height containers
