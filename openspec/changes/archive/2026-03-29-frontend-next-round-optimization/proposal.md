## Why

The previous refactor stabilized the frontend workspace, but two high-impact gaps remain: bundle size and UI consistency. Build output still reports a large vendor chunk, and visual styles are improved but not yet systematized into reusable tokens.

## What Changes

- Introduce targeted bundling strategy to reduce initial payload and improve loading performance.
- Establish a lightweight design token layer for colors, spacing, radius, shadow, and panel depth.
- Standardize core layout components to consume tokens instead of ad-hoc values.
- Add a repeatable visual and build verification checklist for optimization changes.
- Update frontend documentation so optimization conventions are explicit and enforceable.

## Capabilities

### New Capabilities
- `frontend-bundle-optimization`: Defines chunking and dependency split rules for faster first load.
- `frontend-design-token-system`: Defines shared visual tokens and how components consume them.
- `frontend-optimization-validation`: Defines mandatory checks for build warnings, visual regressions, and documentation sync.

### Modified Capabilities
- None.

## Impact

- Affected code:
  - `frontend/vite.config.ts`
  - `frontend/src/App.vue`
  - `frontend/src/components/LayoutPanel.vue`
  - `frontend/src/components/LayoutHeader.vue`
  - `frontend/src/components/LayoutFooter.vue`
  - `frontend/src/assets/**` (if token files are introduced)
- Affected docs:
  - `frontend/README.md`
  - Root `README.md` (if workflow notes are updated)
- Potential risk:
  - Chunk split strategy may impact cache behavior and lazy-load boundaries.
  - Token migration may cause subtle visual regressions if not validated component-by-component.
