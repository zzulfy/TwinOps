## Why

Current frontend still misses several high-value operational capabilities that can be added with low implementation risk: alarm lifecycle actions, shared dashboard summary fetch, and device-page filtering tools. Delivering these features now improves usability and operational efficiency while preserving stability by reusing existing backend contracts and limiting scope to incremental frontend changes.

## What Changes

- Add alarm status workflow actions in frontend (`acknowledged` / `resolved`) and alarm status filtering on the warning panel.
- Introduce shared dashboard summary fetch and manual refresh entry with last-update timestamp to keep panel data consistent.
- Add device detail page search and status filter (`normal` / `warning` / `error`) to improve large-list navigation.
- Keep existing routing, API response contract, and backend module boundaries unchanged.
- Update project documentation to reflect new interaction capabilities and verification steps.

## Capabilities

### New Capabilities
- `alarm-workflow-ui`: Define frontend alarm lifecycle interaction requirements (status filtering and state transitions with backend PATCH integration).
- `dashboard-summary-sync-refresh`: Define dashboard summary single-source fetch, coordinated refresh, and timestamp display requirements.

### Modified Capabilities
- `device-list-view`: Extend aggregate device page requirements with search and status filtering behavior while preserving existing all-device default rendering.
- `frontend-ui-data-cockpit-theme`: Extend cockpit UI requirements to include reusable CTA/status message primitives and refresh/action control consistency.

## Impact

- Affected code:
  - `frontend/src/api/backend.ts`
  - `frontend/src/components/WidgetPanel06.vue`
  - `frontend/src/components/WidgetPanel01.vue`
  - `frontend/src/components/WidgetPanel04.vue`
  - `frontend/src/components/LayoutHeader.vue`
  - `frontend/src/pages/DashboardPage.vue`
  - `frontend/src/pages/DeviceDetailPage.vue`
  - `README.md`, `frontend/README.md`, `backend/README.md`
- APIs/systems: frontend uses existing `GET /api/alarms` and `PATCH /api/alarms/{id}/status`; no new backend endpoint required.
- Dependencies: no new runtime dependency required.
- Stability profile: low-risk incremental frontend enhancement with existing build/test validation flow.
