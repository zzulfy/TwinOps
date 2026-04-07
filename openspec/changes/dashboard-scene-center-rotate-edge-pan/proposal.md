## Why

Current desktop interaction still requires modifier keys or mixed mouse buttons, which is not intuitive for operators during rapid viewpoint adjustments.  
Users need a single left-button model where center-drag rotates and edge-drag pans to match expected cockpit interaction habits.

## What Changes

- Introduce zone-based left-button interaction for dashboard simulation canvas:
  - center area left-drag: rotate
  - edge area left-drag: pan
- Keep wheel zoom behavior unchanged.
- Preserve manual-control-only policy (no automatic camera motion).
- Update dashboard interaction documentation to describe zone-based left-button behavior.

## Capabilities

### New Capabilities
- `dashboard-scene-zone-based-left-drag`: Define zone-based left-drag camera behavior for simulation canvas on desktop.

### Modified Capabilities
- `frontend-white-dashboard-shell`: Extend dashboard interaction requirement to include zone-sensitive left-button behavior for simulation camera control.

## Impact

- Affected frontend scene control: `frontend/src/hooks/useDashboardScene.ts`.
- Possible minor integration update at dashboard canvas interaction boundary handling.
- Affected docs: `frontend/README.md` and root `README.md`.
- No backend API/database/dependency changes.
