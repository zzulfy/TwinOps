# TwinOps

TwinOps is a digital twin operations platform for data center monitoring and visualization.

## Repository Layout

- frontend: Vue 3 + Vite application, assets, scripts, and frontend docs
- backend: Spring Boot API service, SQL scripts, and backend tests
- openspec: change artifacts, specs, and archive history
- .github/workflows/frontend-ci.yml: frontend build and type-check workflow

## Frontend Quick Start

1. Enter frontend workspace

   cd frontend

2. Install dependencies

   npm install

3. Start development server

   npm run dev

## Frontend Build and Preview

From frontend workspace:

- npm run type-check
- npm run build
- npm run preview

## Frontend Script Scope

All frontend scripts and smoke checks are maintained under frontend.
CI should run frontend jobs with working-directory set to frontend.

## Deployment and Run

This project is deployed in the order: MySQL -> Backend -> Frontend.

### 1. Initialize Database

Create database:

```sql
CREATE DATABASE IF NOT EXISTS twinops DEFAULT CHARSET utf8mb4;
```

Run SQL files in order:

1. `backend/sql/001_schema.sql`
2. `backend/sql/002_seed_devices.sql`
3. `backend/sql/003_seed_metrics.sql`
4. `backend/sql/004_seed_alarms.sql`

Optional retention check:

5. `backend/sql/005_verify_retention.sql`

### 2. Start Backend Service

From backend workspace:

```bash
cd backend
mvn spring-boot:run
```

Optional environment variables:

- `DB_URL` (default: `jdbc:mysql://127.0.0.1:3306/twinops?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC`)
- `DB_USERNAME` (default: `root`)
- `DB_PASSWORD` (default: `root`)
- `SERVER_PORT` (default: `8080`)

Backend default URL:

- http://127.0.0.1:8080

### 3. Start Frontend Service

From frontend workspace:

```bash
cd frontend
npm install
npm run dev
```

If needed, specify backend base URL before starting frontend:

- `VITE_BACKEND_BASE_URL=http://127.0.0.1:8080`

### 4. Verify End-to-End

- Frontend page opens normally.
- Backend APIs return data from seeded records.
- Device detail, alarm panel, and dashboard charts are backend-driven.

## Production Deployment (Simple)

### Backend

```bash
cd backend
mvn -DskipTests package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Frontend

```bash
cd frontend
npm ci
npm run build
```

Deploy `frontend/dist` as static assets (Nginx or CDN), and reverse proxy `/api/*` to backend service.

## Backend Quick Start

Prerequisites:

- Java 17+
- Maven 3.9+
- MySQL 8+

From backend workspace:

1. Run tests

   mvn test -DskipITs

2. Start backend

   mvn spring-boot:run

Backend default URL:

- http://127.0.0.1:8080

## OpenSpec Workflow

Common commands:

- /opsx:new
- /opsx:ff
- /opsx:apply
- /opsx:verify
- /opsx:archive

## Migration and Rollback

- Migration notes: openspec/changes/archive/2026-03-29-restructure-frontend-folder/migration-notes.md
- Rollback script: rollback-frontend.ps1

## Notes

Generated screenshot files from local visual tests are ignored by .gitignore at repository root and frontend root.
OpenSpec/opsx scratch files and backend build outputs are also ignored at repository root.
