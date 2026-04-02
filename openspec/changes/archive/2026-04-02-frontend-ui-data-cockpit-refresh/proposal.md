## Why

Current frontend visuals are readable but still close to a soft/light dashboard style, which under-delivers the expected "data cockpit" identity for a digital twin operations product. We need a UI-focused refresh now to improve visual hierarchy, perceived professionalism, and operator confidence without changing performance behavior or business logic.

## What Changes

- Introduce a unified `Data Cockpit` visual language with higher contrast, stronger panel separation, and clearer focus states.
- Refresh global design tokens (color, shadow, border, radius, interaction states) for dark-cockpit aesthetics while preserving existing component structure.
- Redesign key shell surfaces (`LayoutHeader`, `LayoutPanel`, dashboard and device pages) to improve information density and scanability.
- Standardize CTA/button and status-message styling across dashboard/device pages for visual consistency.
- Keep runtime behavior, API interactions, and performance strategy unchanged (no lazy-loading/perf optimization scope in this change).

## Capabilities

### New Capabilities
- `frontend-ui-data-cockpit-theme`: Define UI requirements for cockpit-style theming, hierarchy, and shell-level visual consistency.

### Modified Capabilities
- `frontend-white-dashboard-shell`: Update shell visual requirements from light/white dashboard presentation to cockpit-style high-contrast presentation while preserving existing interaction behavior.
- `device-detail-panel-ux`: Refine device detail page/card visual requirements for cockpit consistency, readability, and status signaling.

## Impact

- Affected code: frontend styles and shell/page components, primarily:
  - `frontend/src/assets/design-tokens.css`
  - `frontend/src/components/LayoutHeader.vue`
  - `frontend/src/components/LayoutPanel.vue`
  - `frontend/src/pages/DashboardPage.vue`
  - `frontend/src/pages/DeviceDetailPage.vue`
- APIs/systems: No backend API contract change and no database schema/data change.
- Dependencies: No new runtime dependency required.
- Risk profile: Mainly visual regression risk; mitigated through existing build/type-check and manual UI validation.
