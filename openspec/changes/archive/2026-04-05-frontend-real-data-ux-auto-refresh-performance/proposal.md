## Why

当前前端仍存在测试数据混入、告警卡片对比度不足、分析中心标题语义冗余、依赖浏览器手动刷新、以及页面性能可优化空间，直接影响运维可读性与实时性。需要一次性建立“真实数据优先 + 自动刷新 + 高可读 UI + 性能优化”的统一前端基线。

## What Changes

- 移除前端展示中的测试/占位数据依赖，尤其是预警状态相关展示（如已确认、已解决）必须来自后端接口。
- 修复预警情况卡片的深色文字+深色背景组合，统一为高对比度可读样式。
- 调整分析中心报告卡片：去掉固定 `AGGREGATED` 文案，主视觉仅保留“编号 + 生成时间”并采用大字号层级。
- 增加前端自动刷新机制，覆盖核心页面数据获取，避免依赖浏览器手动刷新。
- 优化前端性能（渲染、轮询、数据更新与资源加载路径），并给出可验证的优化验收项。

## Capabilities

### New Capabilities

- `frontend-runtime-auto-refresh`: 定义核心页面基于定时拉取/可见性控制的自动刷新机制与一致性约束。

### Modified Capabilities

- `alarm-workflow-ui`: 增加“禁止 mock 告警展示”与“告警卡片对比度可读性”要求。
- `ai-analysis-center`: 修改卡片主标题语义与信息层级，去除固定 `AGGREGATED` 展示。
- `dashboard-summary-sync-refresh`: 将刷新机制从“仅手动刷新”扩展为“自动刷新 + 手动刷新”。
- `frontend-optimization-validation`: 增加与自动刷新场景相关的性能优化与验证要求。

## Impact

- **Affected code**: `frontend/src/pages/*`（Dashboard/Analysis/Device surfaces）、`frontend/src/components/*`（告警与卡片组件）、`frontend/src/api/*`、可能涉及 `frontend/src/composables/*` 刷新与性能相关逻辑。
- **APIs**: 不新增后端接口，重点强化现有接口调用时机与前端渲染策略。
- **UX/Visual**: 告警卡片可读性和分析卡片信息结构将有明确视觉变化。
- **Performance**: 需要控制自动刷新引入的请求/渲染开销，避免页面抖动和不必要重绘。
