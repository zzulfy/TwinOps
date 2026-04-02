# Copilot Instructions for TwinOps

## Build, test, and lint commands

### Frontend (`frontend`)

- Install deps: `npm ci` (preferred in CI) or `npm install`
- Dev server: `npm run dev`
- Type-check: `npm run type-check`
- Build: `npm run build`
- Preview build: `npm run preview`
- Lint JS/TS/Vue: `npm run lint`
- Format: `npm run format`
- Style lint: `npm run lint:style`
- Shell smoke test (requires running app): `npm run smoke:shell`
  - Override target URL: `SMOKE_URL=http://127.0.0.1:8090/ npm run smoke:shell`

### Backend (`backend`)

- Run tests: `mvn test -DskipITs`
- Run app: `mvn spring-boot:run`
- Package jar (skip tests): `mvn -DskipTests package`

Single test commands:

- Single test class: `mvn -Dtest=DeviceServiceTest test`
- Single test method: `mvn -Dtest=DeviceServiceTest#shouldThrowWhenDeviceNotFound test`
- Web layer example: `mvn -Dtest=DeviceControllerTest test`

## High-level architecture

- Repo is split into:
  - `frontend`: Vue 3 + Vite app with a 3D digital-twin scene and dashboard panels.
  - `backend`: Spring Boot + MyBatis-Plus API over MySQL.
- Backend follows a modular-monolith package layout by domain: `device`, `telemetry`, `alarm`, `dashboard`, plus `common`.
- API payloads are consistently wrapped as `ApiResponse<T> { success, message, data }`; frontend `src/api/backend.ts` expects this shape and throws if `success` is false.
- Backend data flow is `Controller -> Service -> Mapper(BaseMapper) -> MySQL`, with DTO projection done in services.
- Frontend uses hash routing with two main pages:
  - `/` dashboard page with Three.js scene and widget panels
  - `/devices` device detail page
- Three.js and chart stack are deliberately deferred:
  - Three addons (`OrbitControls`, `CSS2DRenderer`, loaders) are loaded via dynamic import in hooks.
  - ECharts runtime is isolated in `src/utils/echartsRuntime.ts` and loaded lazily by `useEcharts`.
- Vite build outputs to `frontend/docs` (`base: './'`) and uses manual vendor chunk grouping in `vite.config.ts`.

## Key conventions

- Run commands from the correct workspace (`frontend` vs `backend`); CI frontend workflow uses `working-directory: frontend`.
- Backend endpoints use `/api/*` and are CORS-enabled at controller level (`@CrossOrigin` on controllers).
- Keep frontend-backend contract aligned with backend DTO field names (e.g., `deviceCode`, `faultRate`, `resourceUsage`), not ad-hoc frontend-only shapes.
- Use root-based public asset paths for runtime assets (e.g., `/models/...`, `/textures/...`, `/fonts/...`, `/js/draco/...`).
- Prefer existing deferred-loading/fallback behavior for non-critical runtime modules:
  - chart or addon load failures should show local fallback UI/logging rather than break the whole page.
- Use design tokens from `src/assets/design-tokens.css` for shared visual primitives instead of introducing new hard-coded style constants.
- Backend query style convention is MyBatis-Plus `QueryWrapper` with explicit ordering/limits in service methods.
- Domain-specific statuses are string-based and constrained in code:
  - alarm status: `new | acknowledged | resolved`
  - device status normalized to `normal | warning | error`
