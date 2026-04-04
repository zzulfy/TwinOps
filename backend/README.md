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

`application.yml` imports `llm.yml`.
TwinOps current convention is **file-based configuration**: edit values directly in these yml files for local/dev deployment.

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

### Kafka Local Setup (Required for Analysis Automation, non-Docker first)

Analysis automation uses manual trigger + Kafka producer/consumer. Local verification requires Kafka broker.

#### Non-Docker startup (recommended)

```bash
# Install JDK17 first, then download Kafka binary package
wget https://archive.apache.org/dist/kafka/3.8.0/kafka_2.13-3.8.0.tgz
tar -xzf kafka_2.13-3.8.0.tgz
cd kafka_2.13-3.8.0

# Kafka broker (KRaft single-node)
bin/kafka-storage.sh random-uuid > /tmp/kraft-cluster-id
bin/kafka-storage.sh format -t "$(cat /tmp/kraft-cluster-id)" -c config/kraft/server.properties
nohup bin/kafka-server-start.sh config/kraft/server.properties > logs/server.log 2>&1 &

# Create analysis topic
bin/kafka-topics.sh --bootstrap-server 127.0.0.1:9092 --create --topic analysis.request --partitions 1 --replication-factor 1
```

#### Docker startup (fallback only)

```bash
# Kafka
docker run -d --name twinops-kafka -p 9092:9092 apache/kafka:3.8.0
```

If Kafka is not available, analysis trigger pipeline will not run correctly.

### Kafka Config Mapping

In `application.yml`, ensure:

- `spring.kafka.bootstrap-servers: 127.0.0.1:9092`
- `twinops.analysis.automation.enabled: true`
- `twinops.analysis.automation.scheduler-enabled: false`
- `twinops.analysis.automation.topic: analysis.request`
- `twinops.analysis.automation.consumer-group: twinops-analysis-consumer`

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
- `GET /api/alarms?deviceCode=DEV001&status=new&limit=20`
- `PATCH /api/alarms/{id}/status`
- `GET /api/dashboard/summary`
- `GET /api/analysis/reports?limit=20`
- `GET /api/analysis/reports/{id}`
- `POST /api/analysis/reports/trigger`

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
- Backend now enforces login-first access through global auth interceptor on `/api/**` (except configured whitelist paths).
- Cross-origin browser calls are supported with CORS preflight (`OPTIONS`) pass-through in auth interceptor, so login followed by protected API fetch can complete normally.

### Swagger / OpenAPI

- OpenAPI JSON: `GET /v3/api-docs`
- Swagger UI: `GET /swagger-ui/index.html`
- Swagger UI supports Bearer token authorization for protected API debugging.
- Runtime switch in `application.yml`:
  - `twinops.swagger.enabled: true`
  - `twinops.auth.interceptor.enabled: true`

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

### Analysis Report Workflow（Analysis Center 一键触发 + Kafka）

- Analysis Center 使用一键触发模式：前端调用 `POST /api/analysis/reports/trigger` 时不传设备参数。
- `AnalysisAutomationTriggerService#triggerManualBatch()` 会在后端自动完成聚合：
  - 只发布 1 条 Kafka 批处理消息到 `analysis.request`（ONE job）；
  - 该 job 对应 1 条聚合 `processing` 报告（`deviceCode=AGGREGATED`）。
- `AnalysisAutomationConsumer` 收到该 batch job 后，统一查询所有目标设备及最新 telemetry，拼接聚合 LLM 输入，并仅执行一次分析，最终写回同一条聚合报告（ONE final aggregated report）。
- 聚合作业幂等键使用 `batch:slot`（manual 场景为 `batch:manual-yyyyMMddHHmmss`）确保批次去重，不进行按设备拆分报告生成。
- 定时任务路径由 `twinops.analysis.automation.scheduler-enabled` 控制，默认关闭，仅作为兼容能力。
- Trigger API:
  - `POST /api/analysis/reports/trigger`
  - Request Body: 无

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

### Kafka Automation Config

The above mapping is the runtime contract for trigger API/producer/consumer wiring.

### Documentation Maintenance Rule

- Any code-level behavior/config/API/test change MUST be reflected in README updates (root README and backend README when backend behavior is affected).

### Engineering Quality Policy

- Any future code change MUST include both:
  - Integration Tests
  - Regression Tests

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

Default console pattern includes source location for fast bug tracing:

- `%logger.%M:%line`
- Logger source MUST use full package name (for example `com.twinops.backend.analysis.controller.AnalysisController.detail:9`), not abbreviated form like `c.t.b.a...`.

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

### Logging Baseline Policy (Mandatory)

- From this change onward, every backend code modification must add logs in appropriate critical paths.
- Log levels must be semantically split into `INFO`, `WARN`, `ERROR`.
- Logs must be source-traceable for developers during debugging (class/method/line visible in output).
- Migration note: when searching logs, use full package path keywords instead of abbreviated logger prefixes.
