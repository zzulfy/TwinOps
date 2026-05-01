# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (Java 17, Spring Boot 3.3, Maven)

```bash
# Build
cd backend && mvn package -DskipTests

# Run (requires MySQL + Kafka)
mvn spring-boot:run

# Single test class
mvn "-Dtest=AnalysisKafkaIntegrationTest" test

# Integration tests (require running backend on localhost:8080)
mvn "-Dtest=AnalysisKafkaIntegrationTest,AuthFlowIntegrationTest" test

# Regenerate seed SQL from datasets and simulation catalog
cd backend && python scripts/generate_dataset_seeds.py
```

### Frontend (React 19, TypeScript, Vite)

```bash
cd frontend
npm install
npm run dev                    # dev server on :8090
npm run build                  # production build to docs/
npm run type-check             # TypeScript check (tsconfig.react.json)
npm run lint                   # ESLint
npm run format                 # Prettier
npm run smoke:shell            # smoke test — backend reachability
npm run smoke:analysis-trigger # smoke test — analysis pipeline
```

### Docker Compose (full-stack deployment)

```bash
docker compose up -d --build   # start all services
docker compose down            # stop, keep data volumes
docker compose down -v         # full reset (wipes DB + Kafka data)
docker compose logs --tail=120 <service>
docker compose --profile rca up -d --build  # include RCA sidecar
```

### RCA Sidecar (Python 3.11, FastAPI)

```bash
cd causaltrace-rca
pip install -r requirements.txt
python -m uvicorn service.app:app --host 127.0.0.1 --port 8091
```

## Architecture

TwinOps is a digital twin operations platform for data center device monitoring. Three main modules:

- **`backend/`** — Spring Boot modular monolith (not microservices). Packages: `auth`, `dashboard`, `device`, `telemetry`, `alarm`, `watchlist`, `analysis`, `common`. MyBatis-Plus for data access. Kafka for analysis job queuing. LangChain4j for LLM integration.
- **`frontend/`** — React 19 + TypeScript + Vite. Pages: Dashboard (Three.js simulation scene + ECharts charts), Device Detail, Analysis Center, Login. Hash router with auth guards. `@/` alias resolves to `src/`.
- **`causaltrace-rca/`** — Independent Python FastAPI sidecar running AERCA (ICLR 2025 Oral) Granger-causal root cause analysis. Optional — backend degrades gracefully to LLM-only or mock when unreachable.

### Analysis pipeline (the core data flow)

```
POST /api/analysis/reports/trigger → Kafka topic "analysis.request"
  → Consumer picks up batch job
    → Queries target device telemetry from MySQL
    → Calls RCA sidecar POST /infer/device-rca (if enabled)
    → Calls LLM for prediction text (via LangChain4j, OpenAI-compatible API)
    → Writes aggregated report to analysis_reports table
```

Reports use `deviceCode=AGGREGATED` with idempotency key `batch:manual-yyyyMMddHHmmss`. Reports stuck in `processing` >10 minutes are auto-recycled to `failed`.

### Dashboard 3D scene

The Three.js scene in `useDashboardScene.ts` is **fully programmatic** — it does not load `public/models/devices.glb` at runtime. The GLB file is only used for seed generation and object mapping (`007_simulation_object_map.csv`). The scene builds 32 interactive devices (`DEV001`–`DEV032`) from `src/config/simulationDeviceCatalog.json`. User clicks on devices trigger a raycast → centered info dialog.

### Auth model

Simple admin-only auth. Login returns a token stored in backend process memory (not JWT — restart invalidates all tokens). `AdminAuthInterceptor` guards `/api/**` with a whitelist (login, Swagger, health). Frontend uses `Authorization: Bearer <token>` header via `api/backend.ts`.

### Data consistency

Backend `GET /api/devices/simulation-consistency?autoRepair=true` compares simulation devices (from GLB model) against database device records. Mismatches are auto-repaired: extra DB devices deleted, missing ones inserted. Dashboard calls this on init.

## Key conventions

- All API responses wrapped in `ApiResponse<T>` (backend `common.dto.ApiResponse`). Frontend `api/backend.ts` unwraps it.
- Backend structured logging: `request_id`, `module`, `event`, `result`, `latency_ms`, `error_code`. Logger source must use full package name. Never log API keys or raw tokens.
- Frontend uses deferred loading for heavy libs (ECharts loaded via `utils/echartsRuntime.ts`, Three.js addons lazy-loaded). Vite `manualChunks` splits vendors: `vendor-3d-core`, `vendor-3d-addons`, `vendor-echarts`, `vendor-react`, `vendor-motion`, `vendor-utils`.
- Device encoding is fixed: `DEV001`–`DEV032`. This numbering is shared between seed data, the simulation catalog, and the 3D scene.
- Alarm statuses: `new` | `resolved`.
- Fault rate = `error` devices / total devices × 100, at 1-minute granularity, formatted as `HH:mm`.
- OpenSpec (`openspec/`) manages change proposals with schema: proposal → design → specs → tasks. Archived changes in `openspec/changes/archive/`.
- `docker-compose.yml` uses profiles — RCA is excluded from default `up`, included with `--profile rca`.
- Backend config: `application.yml` imports `llm.yml` via `spring.config.import`. `llm.yml` is gitignored; `llm.example.yml` is the template.
