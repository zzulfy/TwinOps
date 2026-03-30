## Why

The current dashboard is optimized for a dark, control-room style and exposes detailed device information as an in-place modal. We now need a white-dominant dashboard presentation for broader readability and to move detailed device operations into a dedicated page for clearer workflow separation.

## What Changes

- Introduce a white-tone dashboard visual mode as the primary presentation for the main board page.
- Add a dedicated device detail page and move rich device information from modal-only interaction to route-based navigation.
- Add an explicit entry button on the main page to access the device detail page.
- Update device label interaction so clicking a device can open the dedicated detail page with context.
- Replace modal-first device detail behavior on the main page with page navigation-first behavior.

## Capabilities

### New Capabilities
- `frontend-white-dashboard-shell`: Provide a white-dominant dashboard shell with readable panel styling and preserved operational status semantics.
- `frontend-device-detail-page-navigation`: Provide dedicated device-detail page navigation from main dashboard actions and device interactions.

### Modified Capabilities
- `frontend-design-token-system`: Extend token requirements to support white-first dashboard styling while preserving state and motion consistency.

## Impact

- Affected code: application entry layout, dashboard page composition, shared design tokens, device label interaction, and detail presentation components.
- Affected architecture: introduce route-level separation between overview dashboard and detailed device information page.
- Affected UX: users navigate to a dedicated detail page instead of consuming full device details in the dashboard modal.
- Dependencies: Vue Router integration and route-aware state passing for selected device context.
