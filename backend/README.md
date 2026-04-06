# TwinOps Backend

TwinOps 后端基于 Spring Boot + MyBatis-Plus + MySQL，采用 modular monolith 结构（`auth`、`analysis`、`watchlist`、`device`、`telemetry`、`alarm`、`dashboard`）。

## 1. 环境要求

- JDK 17+
- Maven 3.9+
- MySQL 8+
- Kafka（用于 Analysis Automation）

## 2. 初始化数据库

```sql
CREATE DATABASE IF NOT EXISTS twinops DEFAULT CHARSET utf8mb4;
```

按顺序执行：

1. `sql/001_schema.sql`
2. `sql/002_seed_devices.sql`
3. `sql/003_seed_metrics.sql`
4. `sql/004_seed_alarms.sql`
5. `sql/005_verify_retention.sql`

## 3. 配置说明

配置文件：

- `src/main/resources/application.yml`：server、datasource、auth、framework、kafka 等
- `src/main/resources/llm.yml`：LLM 相关配置

关键配置项：

- `server.port`
- `spring.datasource.url/username/password`
- `twinops.auth.admin.username/password/display-name`
- `twinops.analysis.llm.provider/base-url/path/api-key/model/temperature/max-tokens/fallback-to-mock`

## 4. 启动后端

```bash
mvn spring-boot:run
```

## 5. Kafka 本地启动（Analysis 必需）

### 非 Docker（推荐）

```bash
wget https://archive.apache.org/dist/kafka/3.8.0/kafka_2.13-3.8.0.tgz
tar -xzf kafka_2.13-3.8.0.tgz
cd kafka_2.13-3.8.0

bin/kafka-storage.sh random-uuid > /tmp/kraft-cluster-id
bin/kafka-storage.sh format -t "$(cat /tmp/kraft-cluster-id)" -c config/kraft/server.properties
nohup bin/kafka-server-start.sh config/kraft/server.properties > logs/server.log 2>&1 &

bin/kafka-topics.sh --bootstrap-server 127.0.0.1:9092 --create --topic analysis.request --partitions 1 --replication-factor 1
```

### Docker（兜底）

```bash
docker run -d --name twinops-kafka -p 9092:9092 apache/kafka:3.8.0
```

Kafka 关键映射：

- `spring.kafka.bootstrap-servers: 127.0.0.1:9092`
- `twinops.analysis.automation.enabled: true`
- `twinops.analysis.automation.scheduler-enabled: false`
- `twinops.analysis.automation.topic: analysis.request`
- `twinops.analysis.automation.consumer-group: twinops-analysis-consumer`

## 6. API 概览

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

## 7. 鉴权与 Swagger

- 受保护接口需携带 `Authorization: Bearer <token>`
- 全局 auth interceptor 对 `/api/**` 生效（白名单除外）
- OpenAPI：`GET /v3/api-docs`
- Swagger UI：`GET /swagger-ui/index.html`

## 8. Analysis 一键触发与 Kafka 流程

- 前端触发 `POST /api/analysis/reports/trigger` 时不传 `deviceCode`
- 后端 Producer 仅发布 1 条 `analysis.request` batch job
- Consumer 聚合查询全部目标设备数据并执行 1 次 LLM analysis
- 最终持久化 1 条聚合报告（`deviceCode=AGGREGATED`）
- 幂等键使用 `batch:slot`（manual 场景为 `batch:manual-yyyyMMddHHmmss`）

## 9. Structured Logging 规范

关键路径统一输出结构化字段：

- `request_id`
- `module`
- `event`
- `result`
- `latency_ms`
- `error_code`

约束：

- 日志等级必须区分 `INFO / WARN / ERROR`
- logger source 必须使用完整包名（例如 `com.twinops.backend...`）
- 敏感信息（API key、token 原文）禁止写入日志

## 10. 前后端联调

前端环境变量：

```bash
VITE_BACKEND_BASE_URL=http://127.0.0.1:8080
```

## 11. 文档与质量策略

- 代码行为/配置/API/测试有变化时，必须同步更新 README
- 后续代码变更必须补齐：
  - Integration Tests
  - Regression Tests

