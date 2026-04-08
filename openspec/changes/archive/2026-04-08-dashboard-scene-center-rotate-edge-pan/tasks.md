## 1. Zone-based interaction implementation

- [x] 1.1 Add center-vs-edge zone detection in `frontend/src/hooks/useDashboardScene.ts` based on pointer-down canvas coordinates.
- [x] 1.2 Apply dynamic left-drag mode switching per gesture (center=rotate, edge=pan) while preserving wheel zoom behavior.

## 2. Interaction stability and safeguards

- [x] 2.1 Ensure drag mode is locked for each gesture and reset on pointer-up/blur to avoid cross-gesture leakage.
- [x] 2.2 Confirm no automatic camera motion is reintroduced and existing manual scene controls remain stable.

## 3. Documentation and regression validation

- [x] 3.1 Update `frontend/README.md` and root `README.md` with zone-based left-drag interaction description.
- [x] 3.2 Run regressions (`npm run type-check`, `npm run build`, `mvn test -DskipITs`) after interaction updates.
