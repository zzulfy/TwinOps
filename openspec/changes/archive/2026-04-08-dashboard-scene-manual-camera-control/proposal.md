## Why

当前设备仿真画面仍存在自动移动行为，用户难以稳定查看目标设备；同时视角拖动范围受限，无法查看全景。需要将场景控制权交给用户，保证“手动移动视角 + 可拖动查看全景”。

## What Changes

- 移除设备仿真自动移动/自动巡航行为，场景不再自行旋转或漂移。
- 保留并强化鼠标交互，支持用户手动旋转与缩放视角，满足全景查看。
- 调整相机控制边界参数，避免“无法拖动到全景”或视角卡死。
- 更新文档与回归测试，确保后续不回退到自动移动行为。

## Capabilities

### New Capabilities

- `dashboard-scene-manual-camera-control`: 定义设备仿真场景必须由用户手动控制视角，禁用自动运动。

### Modified Capabilities

- `frontend-white-dashboard-shell`: 补充 Dashboard 主画布交互行为要求，明确可手动拖动全景且不自动巡航。

## Impact

- **Frontend**: `useDashboardScene` 轨道控制参数、动画循环中的自动位移逻辑。
- **UX**: 设备仿真交互从“自动移动”改为“用户主导视角”。
- **Docs/Tests**: README 与 smoke/回归验证说明更新。
