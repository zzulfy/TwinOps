## 1. Scene motion behavior correction

- [x] 1.1 Remove automatic scene/model rotation and floating motion from dashboard simulation render loop.
- [x] 1.2 Keep scene rendering active while ensuring view changes are driven only by user input.

## 2. Manual camera control enhancement

- [x] 2.1 Tune OrbitControls interaction settings to support practical panoramic drag/rotate/zoom inspection.
- [x] 2.2 Verify desktop and responsive breakpoints maintain manual control usability without auto-reset drift.

## 3. Documentation and regression validation

- [x] 3.1 Update frontend/root README simulation interaction notes to clarify manual camera control behavior.
- [x] 3.2 Run required regressions (`mvn test -DskipITs`, `npm run type-check`, `npm run build`) after scene control adjustments.

