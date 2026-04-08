## Why

Desktop users cannot pan (translate) the dashboard simulation camera, so they cannot reposition the viewpoint for full-area inspection.  
This blocks practical scene operation and must be fixed now to restore expected mouse interaction on PC.

## What Changes

- Fix desktop camera interaction so drag-based panning works reliably in the dashboard simulation scene.
- Keep existing rotate/zoom behavior and manual-control-only policy (no automatic camera motion).
- Normalize OrbitControls desktop mouse mapping to avoid pan being overridden by rotation-only behavior.
- Update dashboard simulation interaction documentation to explicitly describe desktop pan behavior.

## Capabilities

### New Capabilities
- `dashboard-scene-desktop-pan-control`: Define required desktop pan interaction behavior for dashboard simulation camera controls.

### Modified Capabilities
- `frontend-white-dashboard-shell`: Refine dashboard simulation interaction requirements to include desktop drag pan availability.

## Impact

- Affected frontend scene control: `frontend/src/hooks/useDashboardScene.ts`.
- Potentially affected dashboard page wiring/styles only if interaction container constraints need adjustment.
- Affected docs: `frontend/README.md` and root `README.md` dashboard interaction notes.
- No backend API, database, or dependency changes.
