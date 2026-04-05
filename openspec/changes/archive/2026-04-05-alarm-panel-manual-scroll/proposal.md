## Why

预警情况面板自动滚动在部分环境下仍影响可读性与操控稳定性，用户明确要求改为手动滑动。需要把告警列表交互从“自动轮播”切换为“用户主动滚动”，避免被动动画干扰告警查看。

## What Changes

- 移除预警情况面板自动轮转逻辑（定时器驱动滚动与自动队列轮换）。
- 改为手动滑动浏览（鼠标滚轮/触控板/触摸拖动）并保持列表数据实时刷新。
- 保持告警状态筛选、数据来源、对比度样式等既有行为不变。
- 更新回归验证，确保“无自动滚动、可手动浏览、数据刷新不抖动”。

## Capabilities

### New Capabilities

- `alarm-panel-manual-scroll-control`: 定义预警面板手动滑动浏览行为与禁止自动滚动的约束。

### Modified Capabilities

- `alarm-workflow-ui`: 将监控面板告警列表展示方式从自动滚动改为手动滑动优先。
- `frontend-optimization-validation`: 增加手动滑动场景下无自动轮播与滚动稳定性验证条目。

## Impact

- **Affected code**: `frontend/src/components/WidgetPanel06.vue` 及相关 smoke 脚本。
- **UX**: 预警列表由自动动画切换为用户主动滑动，更可控。
- **Tests**: 需要更新滚动相关回归脚本断言与文档说明。
