## 1. Frontend 两态模型收敛

- [x] 1.1 将前端告警状态类型收敛为 `new | resolved`，移除 `acknowledged` 类型分支与状态映射。
- [x] 1.2 更新设备页告警操作：移除“确认”动作，保留 `new -> resolved` 操作链与按钮可见性规则。
- [x] 1.3 更新 Dashboard 告警面板筛选 tab、状态文案与样式，去除 `acknowledged` 相关 UI。

## 2. Backend 与数据迁移

- [x] 2.1 更新告警状态入参校验与服务状态流转规则，仅允许 `new` 与 `resolved`。
- [x] 2.2 编写并执行迁移：将历史 `status='acknowledged'` 批量改写为 `resolved`。
- [x] 2.3 删除 schema 中 `acknowledged_at` 字段，并同步修正实体/mapper/seed 中的字段引用。

## 3. 测试与文档同步

- [x] 3.1 更新后端告警相关测试（controller/service/dashboard）以覆盖两态模型与迁移后行为。
- [x] 3.2 更新前端回归测试，覆盖设备页与告警面板在两态模型下的筛选和操作行为。
- [x] 3.3 更新 OpenSpec 主 specs（alarm-workflow-ui、device-list-view）与 README 告警状态说明。

