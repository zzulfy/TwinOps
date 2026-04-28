# TwinOps Backend

TwinOps 后端基于 Spring Boot + MyBatis-Plus + MySQL，采用 modular monolith 结构（`auth`、`analysis`、`watchlist`、`device`、`telemetry`、`alarm`、`dashboard`）。

## 1. 环境要求

- JDK 17+
- Maven 3.9+
- MySQL 8+
- Kafka（用于 Analysis Automation）
- Python 3.11+（启用 RCA sidecar 时）

## 2. 初始化数据库

```sql
CREATE DATABASE IF NOT EXISTS twinops DEFAULT CHARSET utf8mb4;
```

先生成 dataset-driven seed SQL（建议每次更新 `data/` 或 `../frontend/src/config/simulationDeviceCatalog.json` 后执行）：

```bash
python scripts/generate_dataset_seeds.py
```

按顺序执行：

1. `sql/001_schema.sql`
2. `sql/002_seed_devices.sql`
3. `sql/003_seed_metrics.sql`
4. `sql/004_seed_alarms.sql`
5. `sql/005_verify_retention.sql`

其中：

- `002_seed_devices.sql` / `003_seed_metrics.sql` / `004_seed_alarms.sql` 由 `scripts/generate_dataset_seeds.py` 生成
- `007_simulation_object_map.csv` 同样由 `scripts/generate_dataset_seeds.py` 生成，作为 GLB 对象到交互设备的一致性基线
- 生成输入来自：
  - `../data/SMD/test.csv` + `../data/SMD/labels.csv`
  - `../data/MSDS/test.csv` + `../data/MSDS/labels.csv`
  - `../frontend/public/models/devices.glb`
  - `../frontend/src/config/simulationDeviceCatalog.json`
- 设备编码固定为 `DEV001`~`DEV032`，并与当前裁剪后的仿真设备清单一一对应
- 仿真设备目录只使用户内设备名称和类型，但 `label_key` 继续保留 GLB 节点名称以保证映射稳定

## 3. 配置说明

配置文件：

- `src/main/resources/application.yml`：server、datasource、auth、framework、kafka 等
- `src/main/resources/llm.yml`：LLM 相关配置
- `../causaltrace-rca/`：设备级 RCA sidecar（独立进程）

关键配置项：

- `server.port`
- `spring.datasource.url/username/password`
- `twinops.auth.admin.username/password/display-name`
- `twinops.analysis.llm.provider/base-url/api-key/model/temperature/max-tokens/fallback-to-mock`（LangChain4j 版本不再使用 `path`）
- `twinops.analysis.rca.enabled/base-url/profile/timeout-ms`
- `twinops.simulation.devices-model-path`（仿真设备模型路径，默认 `../frontend/public/models/devices.glb`）
- `twinops.simulation.seed-devices-sql-path`（设备种子 SQL 路径，默认 `./sql/002_seed_devices.sql`）

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

## 5.1 RCA sidecar（可选增强）

启用设备级 RCA 时，先启动 sidecar：

```bash
cd ../causaltrace-rca
pip install -r requirements.txt
uvicorn service.app:app --host 127.0.0.1 --port 8091
```

然后在 `application.yml` 中开启：

```yaml
twinops:
  analysis:
    rca:
      enabled: true
      base-url: http://127.0.0.1:8091
      profile: msds_device_stress_v1
      timeout-ms: 3000
```

## 6. API 概览

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/devices`
- `GET /api/devices/{deviceCode}`
- `GET /api/devices/simulation-consistency?autoRepair=true|false`
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/{deviceCode}`
- `GET /api/telemetry?deviceCode=DEV001&limit=120`
- `GET /api/telemetry/retention/cleanup`
- `GET /api/alarms?status=new&limit=20`
- `GET /api/alarms?deviceCode=DEV001&status=new&limit=20`
- `PATCH /api/alarms/{id}/status`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/fault-rate/trend?predictMinutes=5`
- `GET /api/analysis/reports?limit=20`
- `GET /api/analysis/reports/{id}`
- `GET /api/analysis/health`
- `POST /api/analysis/reports/trigger`

## 7. 鉴权与 Swagger

- 受保护接口需携带 `Authorization: Bearer <token>`
- 全局 auth interceptor 对 `/api/**` 生效（白名单除外）
- OpenAPI：`GET /v3/api-docs`
- Swagger UI：`GET /swagger-ui/index.html`

## 7.1 仿真设备一致性接口说明

- `GET /api/devices/simulation-consistency` 返回仿真设备集合与数据库设备集合的一致性报告。
- `autoRepair=true` 时按“先删后补”修复：
  - 删除数据库多余设备及关联数据（watchlist、alarms、metrics、devices）
  - 补齐缺失设备并写入基础 telemetry
- 响应字段包含：`consistent`、`repaired`、`deletedCount`、`addedCount`、`extraInDatabase`、`missingInDatabase`、`errors`。

## Dashboard 故障率趋势约定

- `GET /api/dashboard/fault-rate/trend` 返回分钟级故障率趋势（非“故障变化率”）。
- x 轴时间标签按 1 分钟粒度输出，格式固定为 `HH:mm`（不包含月/日）。
- 故障率计算口径为：`status=error` 的设备数 / 全部设备数 × 100（无设备时为 0）。

## 8. Analysis 一键触发与 Kafka 流程

- 前端触发 `POST /api/analysis/reports/trigger` 时不传 `deviceCode`
- 后端 Producer 仅发布 1 条 `analysis.request` batch job
- Consumer 聚合查询全部目标设备数据；若启用 RCA，会先组装最近时间窗 stress 矩阵并调用 `causaltrace-rca` sidecar，再执行 1 次 LLM analysis
- 最终持久化 1 条聚合报告（`deviceCode=AGGREGATED`），其中可包含 `engine`、`rca_status`、`root_causes_json`、`causal_graph_json`、`model_version` 和 evidence window
- 幂等键使用 `batch:slot`（manual 场景为 `batch:manual-yyyyMMddHHmmss`）
- 若服务中断导致报告长期停留 `processing`，后端在查询报告列表/详情时会将超出 10 分钟的挂起任务自动回收为 `failed` 并写入超时错误信息

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

## 12. 集成测试（localhost 模式）

- `AuthFlowIntegrationTest` 与 `AnalysisKafkaIntegrationTest` 使用 localhost HTTP 集成方式：
  - 默认目标：`http://127.0.0.1:8080`
  - 可覆盖：`-Dit.base-url=http://<host>:<port>`
- 运行命令：

```bash
cmd /c mvn "-Dtest=AnalysisKafkaIntegrationTest,AuthFlowIntegrationTest" test
```

- 说明：
  - 测试前置检查 localhost 可达性；
  - 若服务不可达，测试将跳过而非误报业务失败。

