## ADDED Requirements

### Requirement: Frontend SHALL auto-refresh critical operational data
Frontend MUST periodically refresh critical operational data (dashboard summary, alarm snapshots, analysis report list) without requiring browser-level manual reload.

#### Scenario: Visible page triggers scheduled refresh
- **WHEN** user stays on a supported page and the configured refresh interval elapses
- **THEN** frontend automatically requests latest data from backend APIs
- **AND** UI updates from the newly fetched snapshot

#### Scenario: Hidden page suppresses unnecessary refresh
- **WHEN** browser tab/page becomes hidden
- **THEN** frontend pauses or reduces refresh frequency for non-critical polling
- **AND** normal refresh cadence resumes when the page becomes visible again

### Requirement: Frontend auto-refresh SHALL avoid duplicate in-flight fetches
Auto-refresh logic MUST prevent overlapping fetches for the same resource to avoid wasted requests and UI jitter.

#### Scenario: Interval fires before previous request completes
- **WHEN** the next auto-refresh tick occurs while the same API request is still in progress
- **THEN** frontend skips or coalesces the duplicate trigger
- **AND** only one in-flight request updates that resource state
