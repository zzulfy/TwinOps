## Why

Current build output still contains two oversized chunks (`vendor-3d` and `vendor-charts`), which increases first-load transfer and parse cost. A focused second-wave optimization is needed to defer heavy modules from the critical path while keeping scene startup stable.

## What Changes

- Introduce route/surface-level lazy loading for chart-heavy and non-critical 3D feature modules.
- Refine vendor chunk strategy so heavy dependencies are split into more cache-efficient, intention-aligned groups.
- Add explicit acceptance criteria for chunk-size trend and startup health after defer loading.
- Add CI-friendly smoke checks and recorded outputs for desktop/mobile shell readiness.

## Capabilities

### New Capabilities
- `frontend-heavy-module-defer-loading`: Defines deferred-loading behavior for heavy chart/3D modules outside the startup-critical path.

### Modified Capabilities
- `frontend-bundle-optimization`: Extend requirement behavior from deterministic split to critical-path-aware split and defer strategy.
- `frontend-optimization-validation`: Extend validation requirements with CI-friendly smoke evidence and chunk trend checks.

## Impact

- Affected code:
  - `frontend/src/App.vue`
  - `frontend/src/hooks/useDataCenter.ts`
  - `frontend/src/components/WidgetPanel*.vue` (where chart modules are initialized)
  - `frontend/vite.config.ts`
  - `frontend/package.json` scripts (if smoke tasks are standardized)
- Affected docs:
  - `frontend/README.md`
- Expected outcomes:
  - Reduced startup-critical JS cost.
  - Better chunk observability and regression detection.
  - No regression in startup scene shell availability.
