## Overview

本设计将日志能力从“局部实现”升级为“后端工程基线”。实现目标：

1. 让开发者在看到日志时可直接定位到代码位置；
2. 在关键链路强制具备 `info / warn / error` 三级日志；
3. 不改变 API 契约，仅增强可观测性与排障效率。

## Design Goals

- **Source Traceability**: 每条日志具备 `class.method:line` 来源信息。
- **Level Discipline**:
  - `info`: 正常请求入口、关键步骤开始/成功；
  - `warn`: 可恢复异常、边界输入、空结果、降级路径；
  - `error`: 失败路径、不可恢复异常、数据缺失导致主流程失败。
- **Coverage Completeness**: 对 backend controller/service 关键模块补齐日志，而非只改分析模块。
- **Consistency**: 延续 `request_id/module/event/result/error_code` 结构化字段。

## Architecture Decisions

### 1) Logging Output Pattern

在 Spring Boot logging pattern 中增加来源定位字段：

- `%logger{40}.%M:%line`

并保留 request correlation：

- `%X{request_id:-n/a}`

示例 pattern：

`%d ... [%X{request_id}] %logger{40}.%M:%line - %msg`

### 2) Logging Placement Strategy

#### Controller layer

- 每个入口 API 增加 `info`（request received）。
- 参数明显异常处增加 `warn`（invalid/bounded/noop）。
- 失败异常由全局异常处理统一 `error`。

#### Service layer

- 主路径开始与成功增加 `info`。
- 空结果、范围裁剪、回退分支增加 `warn`。
- NotFound/主流程失败前增加 `error`（并继续抛出异常）。

#### Kafka/Analysis chain

- publish/consume/aggregate start-success 用 `info`。
- legacy path 或兼容分支用 `warn`。
- trigger publish 失败、聚合失败用 `error`。

### 3) Backward Compatibility

- 不改变 controller 请求/响应 DTO。
- 不改变数据库 schema。
- 不改变鉴权与业务语义，仅增加日志输出。

## Validation Plan

- 后端：`mvn test -DskipITs`
- 前端（回归保障）：`npm run type-check && npm run build`
- 文档对齐：README 与 backend README 增加日志基线规则。

## Risks and Mitigations

- **Risk: Log volume increase**
  - Mitigation: 仅在关键节点打点；调试级别信息不进入生产默认日志。
- **Risk: Sensitive data leakage**
  - Mitigation: 延续现有脱敏策略（不打 password/raw token/api key）。
- **Risk: Inconsistent event naming**
  - Mitigation: 复用 `module/event/result/error_code` 字段并统一命名习惯。
