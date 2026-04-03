## 1. Admin Authentication Foundation

- [x] 1.1 Add backend `auth` module (controller/service/dto) with admin login, logout, and current-session identity endpoints.
- [x] 1.2 Introduce secure admin credential validation and session/token issuance strategy, including invalid-credential handling.
- [x] 1.3 Add frontend `/login` page, auth state management, and route guards for protected routes.

## 2. Analysis Module (Backend + Frontend)

- [x] 2.1 Add backend `analysis` domain (entity/mapper/service/controller) for prediction report creation and retrieval.
- [x] 2.2 Integrate LLM provider adapter with timeout/retry/error-state handling and persisted report status.
- [x] 2.3 Add frontend analysis center route/page to render report list, detail, confidence/risk indicators, and failure states.

## 3. Device Experience Refactor

- [x] 3.1 Refactor `/devices` into searchable list-first page with keyword filter by `deviceCode` and device name.
- [x] 3.2 Add watchlist-style pin/unpin interactions and backend persistence endpoints for admin watchlist records.
- [x] 3.3 Add focused device detail route `/devices/:deviceCode` and list/watchlist navigation into selected detail page.

## 4. Documentation and Validation

- [x] 4.1 Update `README.md`, `frontend/README.md`, and `backend/README.md` with auth, analysis, and device list/watchlist workflows.
- [x] 4.2 Add API usage examples for auth and analysis endpoints, including expected failure responses.
- [x] 4.3 Run existing repository checks (`frontend: npm run type-check && npm run build`, `backend: mvn test -DskipITs`) before completion.
