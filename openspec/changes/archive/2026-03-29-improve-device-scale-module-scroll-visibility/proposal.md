## Why

设备规模模块当前在固定高度面板中展示时，底部信息会被遮挡，用户无法完整查看全部条目。该问题直接影响监控信息可见性与可用性，需要优先修复。

## What Changes

- 为设备规模模块提供可滚动浏览能力，保证超出可视高度时仍可访问所有条目。
- 明确面板内滚动与内容布局规则，避免条目被父容器裁切。
- 明确在不同屏幕尺寸下的可见性与可达性要求，确保关键信息不丢失。

## Capabilities

### New Capabilities
- `device-scale-widget-scroll`: 定义设备规模模块在固定面板内的滚动行为、内容可达性与防遮挡展示要求。

### Modified Capabilities
- None.

## Impact

- 规格影响：`openspec/changes/improve-device-scale-module-scroll-visibility/specs/device-scale-widget-scroll/spec.md`
- 预期代码影响：`src/components/WidgetPanel04.vue`、`src/components/LayoutPanel.vue`（若需最小化调整容器裁切策略）
- 无后端 API 变更，无新增外部依赖
