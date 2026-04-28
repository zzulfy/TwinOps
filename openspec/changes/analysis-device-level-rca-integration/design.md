# Design: Device-Level RCA Integration

## Summary

把 `causaltrace-rca/` 接入 TwinOps 的方式，不是“在 Java 里启动一个 Python 训练脚本”，而是：

1. 把它收敛成一个独立的 Python 在线推理 sidecar
2. 由 Spring Boot analysis consumer 组装最近时间窗特征
3. 先得到设备级 RCA 结构化证据
4. 再让现有 LLM 生成运维可读文本
5. 最终把“结构化 RCA + 文本报告”一起存进 `analysis_reports`

第一版只做**设备级 RCA**：

- 输入单位：设备
- 输出单位：设备
- 目标问题：在当前异常设备集合中，谁最像根因源头，谁更像被影响者

不做第一版范围内的事情：

- 不做指标级 RCA（例如 `DEV003.temperature` vs `DEV011.cpuLoad`）
- 不把 AERCA 重写到 Java
- 不在请求线程里直接 `python main.py`
- 不在人工 trigger 时现场训练模型

## Architecture

```text
Frontend Analysis Center
        |
        | POST /api/analysis/reports/trigger
        v
Spring Boot Trigger
        |
        | Kafka message
        v
AnalysisAutomationConsumer
        |
        +--> RcaFeatureAssembler
        |        |
        |        v
        |   device time-window matrix
        |
        +--> RcaEngineClient  ----HTTP---->  causaltrace-rca sidecar
        |                                /infer/device-rca
        |                                      |
        |                                root causes / edges / meta
        v
AnalysisService + LLM adapter
        |
        v
analysis_reports
        |
        v
Frontend list/detail with RCA evidence
```

## Scope Boundaries

### Why device-level first

当前 TwinOps 的 UI、业务对象和数据主键都围绕 `deviceCode` 展开：

- 分析列表/详情按报告和设备理解
- Dashboard 仿真交互对象是设备
- 后端聚合对象和 telemetry 采样主键也是设备

因此第一版最稳的切入点是：

- 每台设备压缩为一条“设备压力序列”
- 让 AERCA 处理“设备之间的时序影响”
- 输出按 `deviceCode` 排序的 root-cause ranking

### Why not raw metric-per-device graph

如果直接把 `32 devices * 9 metrics` 作为变量：

- 变量维度爆炸
- 数据稀疏和缺失处理复杂
- 模型 profile 很难稳定
- 前端也很难把结果解释给运维用户

所以第一版定义为：

```text
每台设备 -> 1 条 stress series
N 台异常设备 -> N 维多变量时间序列
AERCA 输出 -> N 台设备之间的 causal ranking / edges
```

## RCA Input Model

### Feature assembly

后端新增 `RcaFeatureAssembler`，从 `device_metrics` 抽取固定时间窗，并把多指标压缩成单设备压力值。

建议第一版时间窗：

- `windowPoints = 30`
- `stepMinutes = 1`
- 总窗长约 30 分钟

建议第一版输入设备集合：

- 当前 `status in (warning, error)` 的设备
- 若数量超过上限，按严重度和最新告警优先级选前 `10` 台

建议第一版设备压力公式：

```text
stress(t) =
  weighted_zscore(
    temperature,
    power,
    cpuLoad,
    memoryUsage,
    diskUsage,
    networkTraffic
  )
```

要求：

- 对每个指标先做缺失填补和归一化
- 以近期正常/基线窗口计算 z-score
- 最终输出 `[time][device]` 的二维矩阵

输出给 sidecar 的结构化 payload 应该保留：

- `requestId`
- `profile`
- `windowStart`
- `windowEnd`
- `stepMinutes`
- `devices[]`
- `series[]`

## RCA Sidecar Design

### Runtime form

在 `causaltrace-rca/` 内新增服务层，不再把 `main.py` 当线上入口。

建议新增：

- `service/app.py`：FastAPI 入口
- `service/inference.py`：模型加载与推理适配
- `service/contracts.py`：请求/响应 schema

### Required endpoints

#### `GET /health`

返回：

- `status`
- `modelLoaded`
- `modelVersion`
- `profile`

#### `POST /infer/device-rca`

请求草图：

```json
{
  "requestId": "req-123",
  "profile": "msds_device_stress_v1",
  "windowStart": "2026-04-25T10:00:00Z",
  "windowEnd": "2026-04-25T10:29:00Z",
  "stepMinutes": 1,
  "devices": [
    {"deviceCode": "DEV003", "status": "warning"},
    {"deviceCode": "DEV011", "status": "error"}
  ],
  "series": [
    [0.15, 0.22],
    [0.18, 0.41]
  ]
}
```

响应草图：

```json
{
  "engine": "aerca",
  "profile": "msds_device_stress_v1",
  "modelVersion": "aerca-msds-device-v1",
  "windowStart": "2026-04-25T10:00:00Z",
  "windowEnd": "2026-04-25T10:29:00Z",
  "rootCauses": [
    {"deviceCode": "DEV011", "score": 0.91, "rank": 1},
    {"deviceCode": "DEV003", "score": 0.44, "rank": 2}
  ],
  "causalEdges": [
    {"fromDeviceCode": "DEV011", "toDeviceCode": "DEV003", "weight": 0.72}
  ],
  "debug": {
    "deviceCount": 2,
    "windowPoints": 30
  }
}
```

### Sidecar constraints

- 服务启动时加载模型，不在请求时训练
- 若模型未加载成功，`/health` 必须可观测
- sidecar 必须返回结构化 JSON，而不是 `print` 输出

## Backend Integration

### Consumer flow update

`AnalysisAutomationConsumer` 仍然保持 Kafka 异步消费，但聚合链路改成：

```text
load target devices
  -> assemble telemetry window
  -> call RCA sidecar
  -> merge RCA evidence into metricSummary/context
  -> call LLM provider
  -> persist structured report
```

### New backend components

建议新增：

- `RcaFeatureAssembler`
- `RcaInferenceRequestDto`
- `RcaInferenceResponseDto`
- `RcaRootCauseDto`
- `RcaEdgeDto`
- `RcaEngineClient`
- `RcaEngineProperties`

### Fallback strategy

RCA sidecar 不是硬依赖，必须可降级。

降级规则：

- sidecar 健康：走 `aerca_llm`
- sidecar 超时 / 4xx / 5xx / schema invalid：记录日志并切 `llm_only`

不能发生的事：

- 因为 RCA sidecar 失败，整条 analysis job 卡死在 `processing`
- 因为 RCA 失败，前端看不到任何分析报告

## Persistence Changes

当前 `analysis_reports` 只有文本字段，不足以表达 RCA 结构化证据。

建议新增列：

- `engine VARCHAR(32)`：`llm_only` / `aerca_llm`
- `rca_status VARCHAR(32)`：`success` / `fallback` / `failed`
- `root_causes_json JSON`
- `causal_graph_json JSON`
- `model_version VARCHAR(128)`
- `evidence_window_start DATETIME`
- `evidence_window_end DATETIME`

### Why keep one table

第一版不拆独立 RCA 表：

- RCA 结果与单条分析报告强绑定
- 查询路径简单，前端 list/detail 不用跨表拼装
- 迁移成本更低

如果后续 RCA 结果体积增长或要支持多引擎对比，再拆子表。

## LLM Prompting Update

LLM 不再只吃 `metricSummary` 文本，还要吃 RCA 结构化摘要。

建议新增 prompt context：

- Top 3 root causes
- strongest causal edges
- model version
- evidence window

LLM 的职责变成：

- 解释 RCA 结果
- 结合最新指标生成运维建议
- 明确“这是一份结构化 RCA 支撑下的结论”

而不是凭最新指标自由发挥。

## Frontend Integration

### API changes

扩展 `AnalysisReportDto` / `AnalysisReport`：

- `engine`
- `rcaStatus`
- `rootCauses`
- `causalEdges`
- `modelVersion`
- `evidenceWindowStart`
- `evidenceWindowEnd`

### Analysis page changes

Analysis 页面 detail 区新增 3 块：

1. `Top Root Causes`
- 设备排名
- score

2. `Causal Chain`
- 简化边列表或小型关系图

3. `Engine Metadata`
- engine
- rca status
- model version
- evidence window

LLM 文本区继续保留。

## Operational Notes

### Model / profile management

第一版 profile 固定：

- `msds_device_stress_v1`

后续如果要真正针对 TwinOps 数据训练，再引入：

- `twinops_device_stress_v1`

### Deployment

建议 sidecar 作为独立进程/容器部署，不与 Spring Boot 混编。

配置项示例：

- `twinops.analysis.rca.enabled=true`
- `twinops.analysis.rca.base-url=http://127.0.0.1:8091`
- `twinops.analysis.rca.profile=msds_device_stress_v1`
- `twinops.analysis.rca.timeout-ms=3000`

## Risks

### 1. Domain mismatch

`causaltrace-rca` 当前附带的是研究数据和预训练产物，未必完全适配 TwinOps 设备指标分布。

应对：

- 第一版明确允许 `fallback`
- 在 UI 和日志里保留 `modelVersion` / `profile`
- 后续再引入 TwinOps 自训练 profile

### 2. Sparse telemetry window

某些设备最近 30 分钟数据不完整，会导致时间窗质量不足。

应对：

- 允许缺失填补
- 低质量窗口时直接 fallback

### 3. Sidecar instability

Python sidecar 可能比 Java 主链更容易出现依赖和模型加载问题。

应对：

- 强制 `/health`
- 强制 timeout
- 强制 fallback

## Rollout Plan

1. 先把 `causaltrace-rca` 封装成 sidecar，打通本地健康检查和单次推理
2. 再接 backend analysis pipeline 和 fallback
3. 再扩展 `analysis_reports` 与 API
4. 最后更新前端 Analysis 页面展示
