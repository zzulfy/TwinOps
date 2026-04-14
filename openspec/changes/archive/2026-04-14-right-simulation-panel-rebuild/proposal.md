## Why

当前需求已明确为“只重构 Dashboard 右侧仿真画面”，不改左侧统计区与全站业务流程。  
现状中右侧仿真区仍存在三类问题：

- 设备交互不稳定：部分渲染对象点击无响应，无法稳定打开设备信息。
- 信息展示样式不符合预期：未点击时出现无意义提示元素，影响画面整洁。
- 数据与渲染不一致：仿真对象与 MySQL 设备数据存在潜在 1:1 偏差，影响告警与状态可信度。

## What Changes

- 重构 Dashboard 右侧仿真画面（基于 `frontend/example/img1`、`frontend/example/img2` 的视觉方向），页面其它区域保持不变。
- 将设备详情交互统一为：仅在点击设备本体后，弹出页面中央设备信息对话框。
- 移除未点击状态下的无意义悬浮对话/一致性提示文案。
- 对可点击设备区域按状态渲染透明色：`error`=透明红、`warning/warn`=透明黄、`normal`=透明绿。
- 建立并强制执行“仿真可交互设备对象 <-> MySQL 设备数据”1:1 对齐规则。
- 当发现不一致时，优先修正数据库侧（补齐或删除设备数据），保证最终与仿真对象集合一致。

## Capabilities

### New Capabilities

- `right-panel-simulation-rebuild`: 仅重构右侧仿真画面的布局、交互与视觉。
- `simulation-device-centered-dialog-only`: 仅通过点击设备本体触发中央对话框展示设备详情。
- `simulation-db-1to1-consistency-enforcement`: 仿真设备对象与数据库设备数据强制 1:1 一致。

### Modified Capabilities

- `dashboard-scene-device-hit-testing`: 提升右侧仿真对象点击命中稳定性，覆盖所有业务设备对象。
- `simulation-status-visual-overlay`: 状态可视化改为透明红黄绿叠加层并保持可读性。

## Impact

- Affected frontend code (planned):
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/hooks/useDashboardScene.ts`
  - `frontend/src/components/SimulationDeviceDialog.tsx`
  - `frontend/src/styles/app.scss`
  - `frontend/src/**`（右侧仿真区相关组件）
- Affected backend code (planned):
  - `backend/src/main/java/com/twinops/backend/device/**`
  - `backend/scripts/generate_dataset_seeds.py`
  - `backend/sql/002_seed_devices.sql`（或新的 seed 产物）
- Compatibility:
  - 不改变现有页面路由与核心业务流程。
  - API 以增量兼容为原则（新增字段/接口，不破坏已有前端契约）。
