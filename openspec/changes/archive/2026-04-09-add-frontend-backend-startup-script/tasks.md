## 1. Startup Script Implementation

- [x] 1.1 Add a repository-level PowerShell startup script entrypoint for one-command frontend/backend startup.
- [x] 1.2 Implement frontend command sequence in script: `npm install` -> `npm run build` -> `npm run dev`.
- [x] 1.3 Implement backend command sequence in script from `backend/`: `mvn -DskipTests package` then `java -jar target/backend-0.0.1-SNAPSHOT.jar > backend.log 2>&1`.
- [x] 1.4 Run backend jar as detached process so frontend dev server can stay in foreground.
- [x] 1.5 Add fail-fast error handling and clear console output for startup progress, backend PID, and backend log path.

## 2. Documentation and Developer Guidance

- [x] 2.1 Update README with one-command startup usage and prerequisites (Node/npm, JDK, Maven).
- [x] 2.2 Document backend runtime log location (`backend/backend.log`) and how to stop the backend process.

## 3. Validation

- [x] 3.1 Verify script starts backend successfully and backend log file is generated/updated.
- [x] 3.2 Verify script reaches frontend dev server start after frontend install/build steps complete.
- [x] 3.3 Execute unit, integration, and regression test commands required by project policy after implementation changes.

## Validation Notes

- `start-dev.ps1` validation run completed backend build/start and frontend install/build/dev sequence; backend log updated at `backend/backend.log`.
- `mvn -Dtest='*Test,!*IntegrationTest' test` passed (71 tests, 0 failures, 0 errors).
- `mvn -Dtest='*IntegrationTest' test` passed (6 tests, 0 failures, 0 errors).
- `npm run smoke:analysis-trigger && npm run smoke:analysis-auto-refresh && npm run smoke:auth-expiry` passed.
