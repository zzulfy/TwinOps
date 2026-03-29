## Why

当前页面仍存在严重可用性问题：设备规模模块文字对比度过低导致关键信息难以识别，设备详情页面视觉风格粗糙且仍有黑色窗口风格残留，影响一致性与可读性。与此同时，详情页滚动受限并存在设备信息遗漏，导致用户无法完整查看全部设备状态，需尽快修复。

## What Changes

- 提升设备规模模块与相关信息区的文本对比度，确保在白色主题下清晰可读。
- 改造设备详情页面视觉样式，移除黑色窗口感，统一为更美观、白色主题一致的详情体验。
- 修复设备详情页滚动/布局限制，支持纵向滚动与多设备内容完整展示。
- 补齐设备详情信息呈现规则，确保全量设备都可见且信息不遗漏。

## Capabilities

### New Capabilities
- `device-detail-panel-ux`: 定义设备详情卡片/面板的白色主题视觉规范、信息层级、滚动容器与完整信息展示要求。

### Modified Capabilities
- `frontend-design-token-system`: 强化白底场景文本对比度要求，特别是设备规模模块与高密度信息区域。
- `device-list-view`: 强化全量设备展示与可滚动浏览要求，防止设备信息遗漏或被布局裁切。

## Impact

- 规格影响：`openspec/changes/improve-device-scale-readability-and-detail-page-ux/specs/frontend-design-token-system/spec.md`、`openspec/changes/improve-device-scale-readability-and-detail-page-ux/specs/device-list-view/spec.md`、`openspec/changes/improve-device-scale-readability-and-detail-page-ux/specs/device-detail-panel-ux/spec.md`
- 预期代码影响：`src/assets/design-tokens.css`、`src/pages/DeviceDetailPage.vue`、`src/components/DeviceDetailPanel.vue`、`src/components/WidgetPanel01.vue`（或对应设备规模展示组件）
- 无新增后端依赖与外部 API 变更
