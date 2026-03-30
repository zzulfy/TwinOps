## Why

白色主题下部分文本在关键面板中的可读性仍然不足，用户在监控场景中难以快速辨识信息层级。同时，设备详情入口在部分路径下仍然退化为单设备展示，不能满足查看全部设备状态的业务预期。

## What Changes

- 收紧白底主题下文本可读性要求，明确主文本与次级文本在关键监控页面必须保持清晰对比。
- 收紧设备详情默认行为，要求设备详情页以“全设备聚合展示”作为默认呈现形态。
- 明确在缺少单设备上下文参数时，设备详情页仍需稳定渲染全量设备列表/网格视图。
- 增补对应规格验收场景，确保后续实现、测试与验收一致。

## Capabilities

### New Capabilities
- 无

### Modified Capabilities
- `frontend-design-token-system`: 收紧白底主题下文本对比度与层级可读性要求。
- `device-list-view`: 收紧设备详情默认展示行为，确保默认展示全部设备详情而非单设备详情。

## Impact

- 规格变更：`openspec/changes/fix-font-contrast-and-all-device-details/specs/frontend-design-token-system/spec.md`、`openspec/changes/fix-font-contrast-and-all-device-details/specs/device-list-view/spec.md`
- 预期代码影响：`src/assets/design-tokens.css`、`src/pages/DeviceDetailPage.vue`、`src/router/index.ts`
- 无新增外部依赖或 API 协议变更
