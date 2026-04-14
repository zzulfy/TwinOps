## Context

现有实现中，`useDashboardScene` 输出设备锚点坐标，`DashboardPage` 使用该坐标将 `SimulationDeviceDialog` 渲染在设备上方。  
该模式在密集场景和视角变化时会产生以下问题：

- 信息框遮挡设备与标签，影响整体观感。
- 锚点坐标持续变化导致“跟随抖动”，可读性下降。
- 小屏场景下对话框可能越界。

本变更仅调整前端展示位置与交互层，不修改后端接口与数据库结构。

## Goals / Non-Goals

**Goals**

- 点击设备后在仿真画面正中央显示设备信息对话框。
- 保持原有设备选择逻辑与数据绑定逻辑。
- 保持“点击空白关闭”能力，并增加更明确的关闭入口（关闭按钮/ESC）。

**Non-Goals**

- 不改造模型加载、射线命中、设备标签识别算法。
- 不新增后端字段或 API。
- 不变更设备一致性治理流程。

## Decisions

### Decision 1: 对话框改为中心弹层，脱离三维锚点定位

- `SimulationDeviceDialog` 由锚点定位改为容器居中定位（`position: absolute/fixed + center transform`）。
- `useDashboardScene` 不再作为详情框位置依赖源，仅负责标签与选中设备事件。

原因：
- 保证视觉稳定性；
- 降低对相机变动的耦合；
- 提高不同分辨率下的一致性。

### Decision 2: 交互状态仅依赖 `selectedDeviceCode`

- 页面层根据 `selectedDeviceCode` 查找当前设备并展示中央对话框。
- 点击空白、关闭按钮或 `Esc` 清空 `selectedDeviceCode` 并关闭对话框。

原因：
- 状态模型更简单；
- 减少“有锚点无设备”或“有设备无锚点”的边界错误。

### Decision 3: 弹层样式采用“高可读卡片”而非 NPC 气泡尾巴

- 保留设备信息字段分组（状态/类型/位置/核心遥测/最近告警）。
- 去除与锚点强绑定的“对话尾巴”视觉元素。
- 增加遮罩或半透明背景，确保焦点清晰。

原因：
- 响应用户“当前悬浮样式很丑”的反馈；
- 中央弹层与业务信息密度更匹配。

## Risks / Trade-offs

- [Risk] 中央弹层可能遮挡部分场景内容  
  -> Mitigation: 使用适度透明遮罩，并支持快速关闭。

- [Risk] 从锚点模式切换可能影响已习惯原交互的用户  
  -> Mitigation: 保持点击入口不变，仅改变展示位置。

- [Risk] CSS 变更影响其它页面样式  
  -> Mitigation: 样式命名限定在仿真弹层作用域，避免全局污染。

## Migration Plan

1. 调整 `useDashboardScene` 输出结构，移除对 `selectedAnchor` 的依赖链路。  
2. 改造 `DashboardPage` 的设备详情渲染逻辑为中心弹层模式。  
3. 改造 `SimulationDeviceDialog` 与样式文件，完成视觉与交互更新。  
4. 执行单元测试、集成测试、回归测试并记录结果。  
5. 更新 README，补充新的仿真设备详情交互说明。

## Open Questions

- 中央弹层是否需要提供“固定展开更多指标”的二级信息区？
