## Why

当前仿真设备页面把“设备 UI 结构/布局信息”和“设备运行数据”混在后端返回，导致前后端职责边界不清，前端改版会被后端数据结构绑定。现在需要把 UI 渲染权彻底收敛到前端，仅让后端提供设备实时数据，降低耦合并提升前端迭代效率。

## What Changes

- 将仿真设备 UI 的对象布局、可点击区域、固定标签与渲染配置迁移到前端固定配置，不再由后端驱动 UI 结构。
- 后端设备接口收敛为“数据型字段”为主（如状态、CPU、温度、湿度、功率、告警等），不再承载前端 UI 布局语义。
- 前端建立“UI 配置对象 -> deviceCode”映射层，按后端实时数据更新设备状态表现和详情弹窗内容。
- 增加 1:1 对齐校验流程：前端配置设备集合与后端设备数据集合必须一致，不一致时给出明确错误和修复提示。
- 现有“点击设备本体 -> 页面中央设备信息对话框”交互保持不变，仅重构数据边界与渲染来源。

## Capabilities

### New Capabilities

- `frontend-owned-simulation-device-ui`: 规范仿真设备页面中 UI 归属、数据边界、1:1 映射校验和点击详情展示约束。

### Modified Capabilities

- None.

## Impact

- 前端：
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/hooks/useDashboardScene.ts`
  - 新增/调整仿真设备 UI 配置文件（对象布局、标签、映射规则）
  - 前端契约测试与 smoke 回归脚本
- 后端：
  - 设备 DTO 与设备查询接口字段整理
  - 相关 service/controller 单元测试、集成测试断言更新
- 文档：
  - OpenSpec 工件（design/specs/tasks）
  - `README.md` 的职责边界与测试记录更新
