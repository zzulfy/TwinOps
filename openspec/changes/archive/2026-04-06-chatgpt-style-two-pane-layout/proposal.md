## Why

当前前端各模块页面在导航入口与信息展示布局上不一致，用户在模块切换与信息定位时认知成本高。需要统一为“左侧窄导航 + 右侧宽内容”的 two-pane 布局，以获得类似 ChatGPT 的连续浏览体验并提升信息可读性。

## What Changes

- 新增统一的 `AppShell` two-pane 布局能力：左侧导航栏承载模块标签，右侧主区域承载模块详情内容。
- 将各模块入口（如 Dashboard、Devices、Analysis）统一收敛到左侧导航，不在页面主体重复放置入口按钮。
- 规范左/右区域占比：左侧窄列（较小宽度占比），右侧宽列（主要内容占比），并定义响应式退化策略。
- 统一导航选中态、悬停态、键盘可访问性与滚动行为，确保跨模块一致交互。
- 保持现有业务逻辑、API 调用与数据流不变；仅调整信息架构与 UI 布局组织方式。

## Capabilities

### New Capabilities
- `frontend-two-pane-navigation-layout`: 定义全局左导航右内容的布局规范、交互规范与响应式行为，覆盖模块切换与详情展示框架。

### Modified Capabilities
- `ai-analysis-center`: 将页面入口与信息呈现接入 two-pane 统一壳层，要求左侧为模块入口、右侧为分析详情主区。
- `device-list-view`: 将设备列表/关注/详情信息按 two-pane 约束重组到右侧主区，左侧统一由模块导航承载入口。

## Impact

- 影响代码：`frontend/src/App.tsx`、`frontend/src/router/*`、`frontend/src/pages/*`、`frontend/src/styles/app.scss`，并可能新增 `frontend/src/components/layout/AppShell*`。
- 影响设计系统：需要补充 two-pane 布局相关 design token（间距、边界、宽度比例、导航态色值）。
- 对外 API：无变更。
- 依赖：无新增运行时依赖。
