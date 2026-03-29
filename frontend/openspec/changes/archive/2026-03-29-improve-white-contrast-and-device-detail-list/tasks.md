## 1. Update Design Tokens

- [x] 1.1 Adjust `--tw-color-text-primary` in `src/assets/design-tokens.css` to a darker shade for better readability against white backgrounds.
- [x] 1.2 Adjust `--tw-color-text-secondary` in `src/assets/design-tokens.css` to an appropriate mid-dark shade to provide visual hierarchy while remaining legible.

## 2. Refactor Device Routing

- [x] 2.1 Update `src/router/index.ts` to optionally accept the device identifier (e.g., changing path to `/devices` or `/devices/:id?`).

## 3. Implement Device List View

- [x] 3.1 Refactor `src/pages/DeviceDetailPage.vue` to remove the hardcoded single-device logic.
- [x] 3.2 Implement a static list or mocked array of multiple available devices (e.g., Pump, Fan, Generator) in `src/pages/DeviceDetailPage.vue`.
- [x] 3.3 Apply a CSS Flexbox or Grid layout iterating over the device list to render multiple device "cards" or "panels" side-by-side or stacked vertically.
- [x] 3.4 Ensure the new device list layout displays correctly and fits visually with the updated white-dashboard theme without overflow issues.
