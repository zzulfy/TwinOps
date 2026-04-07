## Why

当前前端整体是 cockpit 深色视觉与重渐变风格，和用户期望的 GitHub Light 体验差异较大。  
需要一次全站一致的视觉与布局重构，以降低认知负担并提升日常操作可读性。

## What Changes

- 将全站主题收敛为 GitHub Light 风格（文本灰阶、浅色背景层级、细边框、轻阴影、按钮状态体系）。
- 重构页面布局与组件外观（Dashboard / Devices / Analysis / Login），统一为 GitHub 风格信息架构与间距体系。
- Dashboard 保留 3D 仿真能力，仅将其外层容器与周边控件改为 GitHub Light 卡片化样式。
- 清理高饱和发光、重渐变和过度装饰效果，确保数据密集区可读性优先。
- 同步更新前端与根 README 的主题/布局说明。

## Capabilities

### New Capabilities
- `frontend-github-light-theme-system`: 定义全站 GitHub Light 主题 token、组件状态与视觉一致性规则。

### Modified Capabilities
- `frontend-white-dashboard-shell`: 调整 Dashboard 壳层视觉与布局要求，迁移至 GitHub Light 风格并保留 3D 仿真功能。
- `frontend-two-pane-navigation-layout`: 调整两栏导航与内容区的样式约束，使其更贴近 GitHub 导航与内容布局语义。

## Impact

- 主要影响前端样式与主题层：`frontend/src/assets/design-tokens.css`、`frontend/src/styles/app.scss` 及相关页面组件样式。
- 影响范围覆盖 Dashboard、Devices、Analysis、Login 四个主页面。
- 无后端 API、数据库与依赖变更。
