## Why

前端预警情况面板在自动滚动时出现明显卡顿与掉帧，影响运维用户对告警列表的连续阅读体验。需要针对滚动实现与渲染路径做专项优化，建立可回归的性能基线。

## What Changes

- 将预警列表滚动从当前高开销实现优化为更平滑的动画与更新策略，降低重排与重绘成本。
- 限制滚动动画并发与更新节奏，避免滚动中重复触发导致的抖动和卡顿。
- 调整预警列表容器与样式过渡策略（例如避免 `transition: all`）以减少不必要的渲染开销。
- 增加预警滚动性能回归验证（流畅度、轮转正确性、可见性场景）。

## Capabilities

### New Capabilities

- `alarm-panel-smooth-scroll`: 定义预警列表滚动动画、轮转机制与性能保护约束，确保滚动平滑且数据展示稳定。

### Modified Capabilities

- `alarm-workflow-ui`: 在告警面板 requirement 中增加滚动流畅度与无抖动展示要求。
- `frontend-optimization-validation`: 增加预警滚动性能验证清单与回归场景。

## Impact

- **Affected code**: `frontend/src/components/WidgetPanel06.vue` 及可能的前端通用刷新/动画 hooks。
- **UX**: 预警面板滚动流畅度提升，减少视觉卡顿。
- **Testing**: 需要新增/更新 smoke 或回归脚本覆盖滚动性能相关场景。
