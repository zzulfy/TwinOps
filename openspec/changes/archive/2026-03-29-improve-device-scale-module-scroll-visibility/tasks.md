## 1. Module Scroll Path

- [x] 1.1 Add a dedicated scroll container in the device scale widget content area so overflow items can be reached vertically.
- [x] 1.2 Replace rigid fixed-row height behavior with a content-first layout that allows natural item height growth inside the scroll container.
- [x] 1.3 Ensure the last device scale item is reachable and not visually clipped at the bottom boundary.

## 2. Container Boundary And Responsive Behavior

- [x] 2.1 Review and adjust parent panel overflow constraints so they do not silently hide widget content without an available scroll path.
- [x] 2.2 Keep a single primary scroll path between parent and child containers to avoid nested-scroll interaction conflicts.
- [x] 2.3 Validate desktop and mobile breakpoints to keep item text legible and all rows reachable through scrolling.

## 3. Validation And Regression Checks

- [x] 3.1 Verify widget behavior with long lists (overflow) and short lists (no unnecessary scrollbar) in the dashboard.
- [x] 3.2 Confirm existing panel visuals remain consistent (white theme, spacing, border/radius behavior) after scroll changes.
- [x] 3.3 Run project checks (typecheck/build and relevant UI verification script) and record pass results for this change.

## Validation Notes

- `npm run type-check`: pass
- `npm run build`: pass
- `node tmp-verify-device-scale-scroll.mjs` on preview `http://127.0.0.1:4173/`: pass (`LONG_LIST.ok=true`, `SHORT_LIST.ok=true`, `VISUAL.ok=true`)
