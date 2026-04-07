## Context

TwinOps 当前告警链路覆盖前端筛选/操作、后端状态校验、SQL schema/seed、测试与文档，均默认三态（`new`、`acknowledged`、`resolved`）。业务决策已明确为两态模型，并要求将历史 `acknowledged` 数据迁移为 `resolved`，同时删除 `acknowledged_at` 字段，避免保留僵尸字段。

该变更是跨模块收敛：如果只改前端会导致后端接口仍接受三态；如果只改后端会导致前端调用失败；如果不做迁移会导致历史数据无法被新规则正确解释。

## Goals / Non-Goals

**Goals:**
- 将告警状态统一为 `new | resolved`，前后端契约一致。
- 将操作流从 `new -> acknowledged -> resolved` 收敛为 `new -> resolved`。
- 完成数据迁移：历史 `acknowledged` 批量改写为 `resolved`。
- 删除 `acknowledged_at` 字段并同步更新 schema/seed/tests/specs/README。

**Non-Goals:**
- 不引入新的告警状态或新的生命周期阶段。
- 不重构告警模块之外的业务域（device/analysis 等）接口设计。
- 不在本次变更中引入额外告警统计维度或新的 UI 模块。

## Decisions

### 1) 状态模型强制两态
- **Decision**: 全链路仅允许 `new` 与 `resolved`。
- **Rationale**: 业务口径明确，避免三态导致的跨模块分歧。
- **Alternative considered**: 保留 `acknowledged` 但 UI 隐藏。该方案会留下“不可见但仍有效”的状态，长期维护成本更高，放弃。

### 2) 历史数据迁移为 resolved
- **Decision**: 将数据库中 `status='acknowledged'` 全量迁移为 `resolved`。
- **Rationale**: acknowledged 代表“已处理但未完结”，在两态下更接近闭环语义，且不会重新进入新告警待处理视图。
- **Alternative considered**: 迁移为 `new`。会把已处理记录重新暴露为待处理，造成操作噪音，放弃。

### 3) 删除 acknowledged_at 字段
- **Decision**: 本次直接执行 schema migration 删除 `acknowledged_at`。
- **Rationale**: 用户已明确要求去除该状态并清理字段；保留字段会持续误导模型语义。
- **Alternative considered**: 先保留兼容后续再删。可降低一次变更风险，但会延迟语义收敛，放弃。

### 4) 规格与回归同步升级
- **Decision**: 同步修改 `alarm-workflow-ui`、`device-list-view` delta specs，并更新前后端相关测试。
- **Rationale**: 避免“代码已改、spec 仍是三态”导致后续变更再回归错误语义。

## Risks / Trade-offs

- **[Risk] 生产环境历史数据迁移引发状态统计波动** → **Mitigation**: 迁移前后对比状态计数；迁移语句幂等化，仅改 `acknowledged`。
- **[Risk] 前端旧分支残留导致 resolved/new 筛选错乱** → **Mitigation**: 删除 acknowledged 分支而非仅隐藏；补充设备页与告警面板回归测试。
- **[Risk] 删除字段影响旧 SQL 或 mapper** → **Mitigation**: 全局检索 `acknowledged_at` 并同步修订 entity/mapper/test fixture。
- **[Trade-off] 一次性跨模块改造工作量较大** → **Mitigation**: 通过 OpenSpec tasks 分阶段执行并以 API 契约为收敛主线。

