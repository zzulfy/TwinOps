## Why

当前告警生命周期在前后端与文档中同时存在 `new / acknowledged / resolved` 三态，但业务已收敛为仅保留“新告警”和“已解决”。如果不统一收敛，将持续导致 UI 操作分叉、状态口径不一致与历史数据语义混乱。

## What Changes

- 将告警状态模型从三态收敛为两态：`new` 与 `resolved`。
- 移除前端“已确认（acknowledged）”筛选、文案、样式与对应动作链路，告警操作改为直接从 `new` 置为 `resolved`。
- 更新后端告警状态入参校验与状态流转规则，禁止 `acknowledged` 作为有效状态。
- **BREAKING**：执行数据库迁移，将历史 `acknowledged` 记录批量迁移为 `resolved`，并删除 `acknowledged_at` 字段。
- 同步更新测试、种子数据与规格文档，确保全模块一致。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `alarm-workflow-ui`: 告警筛选与生命周期从 `new -> acknowledged -> resolved` 改为 `new -> resolved`，并移除 acknowledged 相关展示要求。
- `device-list-view`: 设备页告警操作从“确认/解决”双动作收敛为“解决”单动作，状态可见性与交互语义同步两态模型。

## Impact

- Frontend: `src/api/backend.ts`、`src/pages/DeviceDetailPage.tsx`、`src/components/WidgetPanel06.tsx` 及相关样式与文案。
- Backend: 告警 controller/service 状态校验与状态迁移逻辑、相关 DTO/实体映射与测试。
- Data: `backend/sql` schema/seed 与一次性迁移脚本（`acknowledged -> resolved` + 删除 `acknowledged_at`）。
- Docs & Specs: `openspec/specs/alarm-workflow-ui`、`openspec/specs/device-list-view` 及 README 告警状态说明。
