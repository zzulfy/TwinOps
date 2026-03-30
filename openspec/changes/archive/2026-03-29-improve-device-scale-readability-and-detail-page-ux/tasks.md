## 1. Contrast and Typography Fixes

- [x] 1.1 Update text-related tokens in `src/assets/design-tokens.css` to increase readability for the device scale module under white backgrounds.
- [x] 1.2 Audit and remove local style overrides in device scale display components that weaken token contrast.

## 2. Detail Panel Visual Redesign

- [x] 2.1 Refactor `src/components/DeviceDetailPanel.vue` to remove dark-window styling and align with white-theme dashboard visuals.
- [x] 2.2 Improve detail panel information hierarchy (title, labels, values, sections) for clearer scanning and cleaner presentation.

## 3. Scroll and Completeness Fixes

- [x] 3.1 Ensure `src/pages/DeviceDetailPage.vue` supports vertical scrolling when device content exceeds viewport height.
- [x] 3.2 Adjust grid/container overflow rules so no device cards are clipped or hidden when device count increases.
- [x] 3.3 Validate all expected device entries and detail fields are rendered without omission in aggregate view.

## 4. Verification

- [x] 4.1 Run `npx tsc --noEmit` and `npm run build` in `frontend` to verify no regression.
- [x] 4.2 Verify both navigation paths (`/devices` direct entry and dashboard detail entry) show readable text, improved panel design, and complete scrollable device information.
