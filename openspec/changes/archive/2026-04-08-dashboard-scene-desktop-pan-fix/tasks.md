## 1. Desktop pan interaction correction

- [x] 1.1 Update `frontend/src/hooks/useDashboardScene.ts` OrbitControls desktop mouse mapping so pan is available and deterministic.
- [x] 1.2 Verify rotate/zoom behaviors remain available and no automatic camera motion is reintroduced.

## 2. Documentation alignment

- [x] 2.1 Update `frontend/README.md` simulation interaction notes with explicit desktop pan gesture support.
- [x] 2.2 Update root `README.md` dashboard simulation interaction statement to include desktop pan capability.

## 3. Regression verification

- [x] 3.1 Run frontend checks (`npm run type-check`, `npm run build`) after scene interaction updates.
- [x] 3.2 Run backend regression (`mvn test -DskipITs`) to ensure no cross-module regressions.
