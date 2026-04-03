## ADDED Requirements

### Requirement: Device list page SHALL support watchlist-style quick access
The frontend SHALL provide a device watchlist mechanism where admins can pin/unpin devices and quickly access their detail pages.

#### Scenario: Admin pins a device to watchlist
- **WHEN** admin marks a device as watched from device list
- **THEN** the device appears in watchlist section
- **AND** watchlist entry persists for subsequent sessions

### Requirement: Watchlist entries SHALL navigate to focused detail view
Watchlist entries SHALL navigate directly to the corresponding device detail route with explicit device context.

#### Scenario: Admin opens device from watchlist
- **WHEN** admin clicks a watchlist device item
- **THEN** app routes to `/devices/:deviceCode`
- **AND** detail page renders selected device information
