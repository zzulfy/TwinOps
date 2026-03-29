## Context

The initial white-dashboard theme was successfully implemented. However, some text tokens (specifically primary and secondary text colors) did not have enough contrast, rendering them difficult to read on the new white backgrounds. Additionally, the new `DeviceDetailPage.vue` currently requires a specific device id/name and only displays a single device modal/panel. The user wants the ability to view *all* devices concurrently without having to click into an individual detailed modal, which requires changing the page structure from a single-item detail view to an aggregate list/grid view of devices.

## Goals / Non-Goals

**Goals:**
- Update CSS tokens to ensure all primary and secondary text strings pass contrast ratios on white backgrounds.
- Refactor `DeviceDetailPage.vue` (and corresponding Vue router definitions) to drop the single device constraint and instead render a loop/list or grid of all devices.
- Improve the layout such that multiple devices are displayed neatly (e.g., using Bootstrap grid components, CSS grid, or Flexbox).

**Non-Goals:**
- Completely overhauling the data-fetching hook (`useDataCenter.ts`), we will just leverage existing data or mock data to populate multiple devices.
- Re-architecting the 3D scene (this change focuses on page/UI layout and text themes, not the three.js/webgl canvas).

## Decisions

- **Text Contrast Token Updates**: We will change `--tw-color-text-primary` from a light/mid-gray to a dark `#333333` or `#1A1A1A`. `--tw-color-text-secondary` will be adjusted to `#555555` or `#666666` for readability against `#FFFFFF` or `#F5F7FA` backgrounds.
- **Device List Layout**: Instead of hard-coding a single device, we will iterate over an array of available devices. If the user was viewing "pump-1", we will now use a `v-for` loop on an array of standard devices (e.g. Pump, Fan, Generator) in `DeviceDetailPage.vue`. A Flexbox/CSS Grid layout will be applied to give each device its own card.
- **URL Parameter Removal**: The Vue Router configuration for `/devices` will no longer definitively require an `:id` or `name` query parameter to function. The page itself will serve as a master list.

## Risks / Trade-offs

- **Risk**: Device detail cards take up too much vertical space when multiple are listed, causing excessive scrolling.
  - **Mitigation**: Implement a concise "card" style for each device, summarizing the key metrics and hiding overly detailed telemetry behind a toggle if necessary.
- **Risk**: Changing the global text token might disrupt other smaller widgets.
  - **Mitigation**: Visually test the dashboard (main page) to ensure the newly darkened text looks acceptable across the standard widget panels.