## Why

TwinOps currently lacks core enterprise capabilities required for scalable operations: authenticated admin access, AI-assisted metric analysis, and an efficient device browsing workflow. A unified upgrade is needed now to improve security, decision support, and device management usability without fragmenting implementation across multiple unrelated releases.

## What Changes

- Add admin-only authentication flow (login/logout/session identity) and route-level access control for protected frontend pages.
- Add backend analysis module to run LLM-assisted prediction on telemetry/metric signals and expose analysis report APIs.
- Add frontend analysis page/module to display prediction results, confidence levels, risk tags, and recommended actions.
- Refactor device experience from a bulky aggregate-only detail surface to a searchable device list + focused device detail navigation.
- Add device keyword search (`deviceCode` / name) and a watchlist-style pinned device list for quick admin access.
- Keep existing dashboard and legacy APIs compatible; new modules are additive and integrated incrementally.

## Capabilities

### New Capabilities
- `admin-authentication`: Admin login, session validation, and protected-route behavior across frontend and backend.
- `ai-analysis-center`: Backend analysis pipeline and frontend analysis center for LLM-based metric prediction and explanation.
- `device-watchlist-navigation`: Device list + watchlist interaction model with searchable navigation into focused device detail views.

### Modified Capabilities
- `device-list-view`: Evolve aggregate device page behavior to include searchable list-first browsing and detail drill-down path.
- `frontend-device-detail-page-navigation`: Extend navigation requirements to support list-to-detail transitions with selected device context.
- `device-detail-panel-ux`: Adjust detail page expectations for focused single-device rendering when entered from list/watchlist.

## Impact

- Affected frontend areas:
  - Router and page map (`/login`, `/analysis`, `/devices`, `/devices/:deviceCode`)
  - Auth state/guard logic
  - Device list, watchlist, and detail pages/components
  - Analysis center module and API client layer
- Affected backend areas:
  - New auth module and admin identity endpoints
  - New analysis module (controller/service/mapper/model)
  - Optional device-watchlist persistence endpoints
- APIs/systems:
  - New auth and analysis APIs
  - Existing device/alarm/dashboard APIs retained for compatibility
- Dependencies:
  - Potential LLM provider SDK/client integration and secure key management
  - No breaking requirement on existing frontend dashboard runtime
