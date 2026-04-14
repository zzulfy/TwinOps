## Why

当前 Dashboard 三维仿真仅负责渲染模型，没有“设备标签 + 点击交互详情”，用户无法在场景内快速确认某个对象对应数据库中的哪台真实设备。  
与此同时，业务要求仿真设备与数据库设备必须严格 1:1 对应，不能出现“仿真有设备但数据库无数据”或“数据库有设备但仿真无设备”的不一致状态。

## What Changes

- 在前端仿真场景中为每台设备增加常驻标签，标签内容至少包含 `deviceCode + 设备名`，实现“看见即识别”。
- 增加设备点击交互：用户点击设备后，在设备上方显示悬浮式对话框（NPC 对话风格），展示该设备的实时与基础信息。
- 将三维模型设备对象名与数据库 `label_key` 建立统一映射，作为仿真与后端数据绑定主键。
- 增加一致性检查与修复策略：当仿真设备集合与数据库设备集合不一致时，按“优先删除数据库多余设备，再补齐缺失设备”的策略执行修复。
- 补齐变更所需验证：单元测试、集成测试、回归测试，确保交互能力和一致性能力可持续验证。

## Capabilities

### New Capabilities

- `simulation-device-interaction-overlay`：支持仿真设备标签展示与设备点击悬浮详情交互。
- `simulation-db-device-consistency-repair`：支持仿真设备与数据库设备集合的一致性检查与修复（删除多余、补齐缺失）。

### Modified Capabilities

- `backend-device-data-services`：扩展设备对外数据契约与一致性检查/修复流程，支持仿真绑定所需字段和校验结果。
- `dashboard-threejs-scene-runtime`：从纯渲染升级为“可识别、可点击、可查看详情”的交互式设备场景。

## Impact

- Affected frontend code:
  - `frontend/src/hooks/useDashboardScene.ts`
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/components/`（新增或复用设备悬浮详情组件）
  - `frontend/src/styles/app.scss`
- Affected backend code:
  - `backend/src/main/java/com/twinops/backend/common/dto/DeviceDetailDto.java`
  - `backend/src/main/java/com/twinops/backend/device/service/DeviceService.java`
  - `backend/src/main/java/com/twinops/backend/device/controller/DeviceController.java`
  - 设备一致性检查/修复相关 service 与测试
- Affected data artifacts:
  - `backend/sql/002_seed_devices.sql`
  - `backend/sql/005_verify_retention.sql`
  - 数据集驱动设备映射生成脚本（若缺失需补齐）

