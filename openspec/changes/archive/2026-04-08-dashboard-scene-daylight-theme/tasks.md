## 1. Scene daylight visual implementation

- [x] 1.1 Update `frontend/src/hooks/useDashboardScene.ts` scene background and lighting parameters to a daylight palette.
- [x] 1.2 Align both model-render and fallback-render material colors so devices remain readable in a bright environment.

## 2. Behavior safety and documentation

- [x] 2.1 Verify existing scene interaction semantics and model/fallback loading paths remain unchanged after the visual update.
- [x] 2.2 Update `frontend/README.md` and root `README.md` to describe the dashboard scene daylight visual baseline.

## 3. Regression validation

- [x] 3.1 Run frontend `npm run type-check` and `npm run build`.
- [x] 3.2 Run existing smoke coverage related to dashboard/analysis/alarm to ensure the visual change does not break runtime flows.
