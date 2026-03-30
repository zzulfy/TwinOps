# TwinOps Backend

Java backend for TwinOps using a modular monolith structure (`device`, `telemetry`, `alarm`, `dashboard`) with MyBatis Plus and MySQL.

## 1. Prerequisites

- JDK 17+
- Maven 3.9+
- MySQL 8+

## 2. Create Database

```sql
CREATE DATABASE IF NOT EXISTS twinops DEFAULT CHARSET utf8mb4;
```

## 3. Initialize Schema and Seed Data

Execute SQL files in this order:

1. `sql/001_schema.sql`
2. `sql/002_seed_devices.sql`
3. `sql/003_seed_metrics.sql`
4. `sql/004_seed_alarms.sql`

Retention verification script:

5. `sql/005_verify_retention.sql`

## 4. Configure Connection

Environment variables (optional):

- `DB_URL` (default: `jdbc:mysql://127.0.0.1:3306/twinops?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC`)
- `DB_USERNAME` (default: `root`)
- `DB_PASSWORD` (default: `root`)
- `SERVER_PORT` (default: `8080`)

## 5. Run Backend

```bash
mvn spring-boot:run
```

## 6. API Overview

- `GET /api/devices`
- `GET /api/devices/{deviceCode}`
- `GET /api/telemetry?deviceCode=DEV001&limit=120`
- `GET /api/telemetry/retention/cleanup`
- `GET /api/alarms?status=new&limit=20`
- `PATCH /api/alarms/{id}/status`
- `GET /api/dashboard/summary`

## 7. Frontend Integration

Frontend should set:

- `VITE_BACKEND_BASE_URL=http://127.0.0.1:8080`

Then run frontend app to consume backend APIs.
