## Why

当前 Dashboard 右侧设备仿真页面已经完成了数据 1:1 对齐、点击弹窗和基础相机交互，但画面仍然存在明显的空间与审美问题：

- 房间比设备更抢眼，用户首先看到大块地板、空墙和长走廊，而不是设备本体。
- 柜列虽然存在，但经常贴着边缘或退到深处，导致“代码里有设备、视觉上像没有设备”。
- 当前场景更像“空房间里摆机柜”，而不是现代化配电与控制室。
- 场景标题板和容器样式仍然偏后台卡片感，与 3D 空间语言不统一。

现在需要把右侧仿真区升级为“设备主导的现代控制室展示廊”，让设备成为视觉主角，同时保持现有数据契约、交互方式和 1:1 一致性不被破坏。

## What Changes

- 将右侧仿真区的视觉目标从“明亮日光/空房间展示”升级为“现代室内控制室 + 设备主导构图”。
- 重构场景空间比例：缩窄中轴通道，建立两侧设备平台和端墙收口，不再让大块地板成为主视觉。
- 重构柜列构图：形成前排主柜、中段连续柜列、后段控制柜列和尾端收口柜列的多层次布局。
- 重构默认镜头：默认直接看到近景设备和纵深柜列，不再首先看到房间外壳、空地面或纯空墙。
- 提升设备家族辨识度：不同 `visualFamily` 在轮廓、面板密度和特征部件上应有明显差异。
- 调整右侧容器与标题板样式，使其与 modern control room 视觉语言一致，而不是独立的后台卡片。

## Capabilities

### New Capabilities

- `dashboard-scene-modern-control-room-visuals`: 规范右侧仿真区的现代化控制室空间构图、设备主导视觉层次和 UI 叠层风格。

### Modified Capabilities

- `dashboard-scene-daylight-visuals`
- `frontend-white-dashboard-shell`

## Impact

- 前端：
  - `frontend/src/hooks/useDashboardScene.ts`
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/styles/app.scss`
  - 右侧仿真区相关契约/回归脚本
- OpenSpec：
  - 新增本 change 的 `proposal.md`、`design.md`、`tasks.md`
  - 新增 `dashboard-scene-modern-control-room-visuals` delta spec
  - 修改 `dashboard-scene-daylight-visuals` 和 `frontend-white-dashboard-shell` delta spec
- 文档：
  - `README.md`
  - `frontend/README.md`

## Compatibility

- 不改变后端设备数据接口与 1:1 映射规则。
- 不改变“点击设备本体 -> 页面中央设备信息对话框”的主交互。
- 不改变左侧仪表区和其它页面路由，仅重构右侧仿真区的空间、视觉和场景内 UI 表达。
