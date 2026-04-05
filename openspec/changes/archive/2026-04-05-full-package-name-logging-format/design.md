## Context

当前后端日志 pattern 中 logger 来源使用 `%logger{40}`，会出现包名缩写（如 `c.t.b.a...`）。虽然可定位，但对开发排障不够直观，尤其在跨模块问题定位时会增加认知成本。

## Goals / Non-Goals

**Goals:**
- 日志来源展示完整包名（例如 `com.twinops.backend.analysis.controller.AnalysisController.detail:9`）。
- 保持现有 `request_id` 关联能力与结构化日志字段。
- 变更最小化，只改日志 pattern 与文档说明。

**Non-Goals:**
- 不改业务 API 或数据库结构。
- 不重构现有日志打点点位。

## Decisions

- 将 console pattern 中 logger 来源从 `%logger{40}` 调整为 `%logger`，保留 `%M:%line`。
- 保持 `[%X{request_id:-n/a}]` 等现有上下文字段不变，避免影响现有日志查询规则。
- README 与 backend README 同步更新“完整包名”规则，避免后续回退到缩写格式。

## Risks / Trade-offs

- **[Risk]** 日志行变长，控制台可读性略下降  
  **→ Mitigation**: 优先保证排障定位效率，必要时在日志平台侧折叠展示。
- **[Risk]** 现有基于缩写 logger 的检索脚本受影响  
  **→ Mitigation**: 以完整类名检索替换缩写检索模式。

