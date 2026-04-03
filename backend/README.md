# TwinOps Backend

Java backend for TwinOps using a modular monolith structure (`auth`, `analysis`, `watchlist`, `device`, `telemetry`, `alarm`, `dashboard`) with MyBatis Plus and MySQL.

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

Configuration files are split as:

- `src/main/resources/application.yml`:
  - server
  - datasource
  - auth
  - framework settings
- `src/main/resources/llm.yml`:
  - all LLM-related runtime settings

`application.yml` imports `llm.yml`. You can keep defaults in files, or override via environment variables:
All values are edited directly in yml files (no environment-variable override workflow):

- `application.yml`:
  - `server.port`
  - `spring.datasource.url/username/password`
  - `twinops.auth.admin.username/password/display-name`
- `llm.yml`:
  - `twinops.analysis.llm.provider/base-url/path/api-key/model/temperature/max-tokens/fallback-to-mock`

## 5. Run Backend

```bash
mvn spring-boot:run
```

## 6. API Overview

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/devices`
- `GET /api/devices/{deviceCode}`
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/{deviceCode}`
- `GET /api/telemetry?deviceCode=DEV001&limit=120`
- `GET /api/telemetry/retention/cleanup`
- `GET /api/alarms?status=new&limit=20`
- `PATCH /api/alarms/{id}/status`
- `GET /api/dashboard/summary`
- `POST /api/analysis/reports`
- `GET /api/analysis/reports?limit=20`
- `GET /api/analysis/reports/{id}`

### Admin Authentication

- Login:
  - `POST /api/auth/login`

```json
{
  "username": "admin",
  "password": "admin123456"
}
```

- Success response includes `token`, `expiresAt`, and `admin` identity.
- Invalid credentials return `401` with:

```json
{
  "success": false,
  "message": "invalid admin credentials",
  "data": null
}
```

- Protected APIs accept `Authorization: Bearer <token>`.

### Alarm Status Workflow

- Supported status values: `new`, `acknowledged`, `resolved`
- Query alarms by status:
  - `GET /api/alarms?status=acknowledged&limit=20`
- Update alarm status:
  - `PATCH /api/alarms/{id}/status`
  - Body:

```json
{
  "status": "acknowledged"
}
```

- Validation rule: `status` must be one of `new|acknowledged|resolved`.

### Analysis Report Workflow

- Create report:
  - `POST /api/analysis/reports`

```json
{
  "deviceCode": "DEV001",
  "metricSummary": "cpu overload risk in next 2h"
}
```

- Success/failed reports are persisted with status (`success` / `failed`) and failure reason if provider timeout/retry exhaustion occurs.
- Real-model mode (OpenAI-compatible Chat Completions):
  - in `llm.yml`, set:
    - `provider: openai`
    - `base-url: https://ark.cn-beijing.volces.com/api/coding/v3`
    - `model: ark-code-latest`
    - `api-key: <your-key>`
- Fallback mode:
  - keep `fallback-to-mock: true` in `llm.yml` to degrade gracefully when provider request fails.
- Query report list:
  - `GET /api/analysis/reports?limit=20`
- Query report detail:
  - `GET /api/analysis/reports/{id}`

Failure example:

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "id": 18,
    "deviceCode": "DEV004",
    "status": "failed",
    "errorMessage": "llm timeout after 5s"
  }
}
```

## 7. Frontend Integration

Frontend should set:

- `VITE_BACKEND_BASE_URL=http://127.0.0.1:8080`

Then run frontend app to consume backend APIs.

## 8. Structured Logging and Observability

Backend critical paths now emit structured logs using stable keys:

- `request_id`
- `module`
- `event`
- `result`
- `latency_ms`
- `error_code`

### Request Correlation

- Backend reads `X-Request-Id` from incoming requests.
- If missing, backend generates one.
- Backend returns `X-Request-Id` in response header.
- Correlation id is propagated through MDC across controller/service/exception logs.

### Analysis / LLM Logging

- `INFO`: LLM request start and successful completion.
- `WARN`: provider failure with fallback enabled (`fallback-to-mock: true`) and fallback decision.
- `INFO`: fallback success summary (risk/confidence without secret data).
- `ERROR`: terminal provider failure when fallback is disabled.
- Secrets are redacted: API key and authorization token raw values are never logged.

### Auth Logging

- Login success/failure and logout actions are logged with structured fields.
- Credentials are never logged; token output is masked (suffix-only).

### Database Failure Logging

- Startup emits sanitized datasource summary (host/schema only).
- `DataAccessException` and JDBC connection errors are logged at `ERROR` with request path and exception class.
