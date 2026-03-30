## Why

After transitioning the application to a white-dominant dashboard theme, we identified two critical user experience issues:
1. Text readability: In the white background context, some text colors remain too dark or lack sufficient contrast, making them difficult to read.
2. Device detail limitations: The current device detail page only displays information for a single device. The user needs a comprehensive view of all device details displayed together in a clear, well-structured layout.

## What Changes

- Update CSS variables/design tokens in the global theme to ensure text has sufficient contrast and clarity against white backgrounds.
- Refactor the device detail page routing and layout to display a list or grid of all available devices, rather than a single device.
- Adjust the layout structure to reasonably accommodate multiple device details on the same page without overwhelming the user interface.

## Capabilities

### New Capabilities
- `device-list-view`: A comprehensive view displaying the details of all devices concurrently within a reasonable and readable layout.

### Modified Capabilities
- `frontend-design-token-system`: Adjust text color tokens (`--tw-color-text-primary`, `--tw-color-text-secondary`, etc.) for optimal contrast in the white-theme mode.

## Impact

- `frontend/src/assets/design-tokens.css`: Will be updated to adjust text color contrast.
- `frontend/src/pages/DeviceDetailPage.vue`: Will be significantly refactored to support showing multiple devices instead of just one.
- Vue Router configuration depending on how the device detail parameter was previously passed.
