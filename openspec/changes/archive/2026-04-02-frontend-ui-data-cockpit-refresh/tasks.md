## 1. Token and Visual Baseline

- [x] 1.1 Update `frontend/src/assets/design-tokens.css` with Data Cockpit color, border, and shadow primitives while preserving existing variable names.
- [x] 1.2 Verify token usage compatibility so existing components render correctly after token replacement.
- [x] 1.3 Define consistent CTA and status-message style primitives for reuse in dashboard and device-detail pages.

## 2. Shared Shell UI Restyling

- [x] 2.1 Restyle `frontend/src/components/LayoutHeader.vue` to Data Cockpit appearance with stronger title hierarchy and cleaner status/meta strip.
- [x] 2.2 Restyle `frontend/src/components/LayoutPanel.vue` to cockpit card language (higher contrast, clearer frame, improved depth cues).
- [x] 2.3 Ensure shared shell components keep current interactions and do not introduce behavior changes.

## 3. Page-level UI Alignment

- [x] 3.1 Refresh `frontend/src/pages/DashboardPage.vue` shell visuals (background layers, entry button, panel context framing).
- [x] 3.2 Refresh `frontend/src/pages/DeviceDetailPage.vue` card grid and status message appearance for cockpit consistency.
- [x] 3.3 Keep existing layout flow and scrolling behavior intact while applying new styling.

## 4. Validation and Sign-off

- [x] 4.1 Run frontend validation commands (`npm run type-check`, `npm run build`) to confirm style-only changes do not break build.
- [x] 4.2 Perform manual visual pass on dashboard and device-detail pages for hierarchy, contrast, and responsive consistency.
- [x] 4.3 Confirm no performance-focused changes were introduced in this change scope.
