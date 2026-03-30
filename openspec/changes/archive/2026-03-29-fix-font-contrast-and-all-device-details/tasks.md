## 1. Contrast Token Hardening

- [x] 1.1 Update `src/assets/design-tokens.css` text token values so primary and secondary text remain highly readable on white backgrounds.
- [x] 1.2 Validate that updated tokens are consumed by key dashboard/detail containers without local overrides reducing contrast.

## 2. Aggregate Device Detail Behavior

- [x] 2.1 Refactor `src/pages/DeviceDetailPage.vue` to render all device detail cards by default.
- [x] 2.2 Ensure `src/router/index.ts` and detail-page logic work without requiring single-device query/param context.
- [x] 2.3 Verify responsive list/grid rendering for multiple devices and remove residual single-device-only behavior.

## 3. Verification

- [x] 3.1 Run type/build checks and fix any regressions introduced by this change.
- [x] 3.2 Manually verify `/devices` direct entry and dashboard-to-detail navigation show aggregate device details with improved text clarity.
