## Why

当前后端日志 pattern 使用 `%logger{40}` 会把包名压缩成缩写（如 `c.t.b.a.controller.AnalysisController.detail:9`），排查问题时可读性差。需要改为完整包名输出，确保日志来源一眼可定位。

## What Changes

- 调整 backend 日志输出格式，日志来源从缩写包名改为完整包名（full package name）。
- 保持现有 `request_id` 与结构化字段不变，仅修正 logger 来源展示策略。
- 更新日志相关文档与规范，明确禁止包名缩写格式。

## Capabilities

### New Capabilities

- `full-package-name-log-source`: 定义日志来源字段必须展示完整包名的要求。

### Modified Capabilities

- `backend-logging-baseline`: 将“可定位来源”要求细化为完整包名，不允许缩写包名。
- `backend-structured-observability`: 补充日志 pattern 可读性要求，明确 logger 来源应可直接映射到完整类路径。

## Impact

- **Affected code**: `backend/src/main/resources/application.yml`（logging pattern）与相关 README。
- **Runtime impact**: 业务行为不变，仅日志输出格式变化。
- **Developer impact**: 排障时可直接根据完整类路径定位日志来源。
