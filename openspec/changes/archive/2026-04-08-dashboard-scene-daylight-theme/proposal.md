## Why

当前设备仿真画面仍是夜景色调（深色背景+冷色灯光），与现有 GitHub Light 页面视觉不一致，也降低白天工况下的直观感受。需要将仿真场景切换为日间风格，同时保持现有交互与模型加载行为不变。

## What Changes

- 将 Dashboard 右侧 Three.js 仿真场景从夜景调色改为白天视觉（天空背景、主光照、地面与材质颜色）。
- 保留现有交互能力（中央旋转/边缘平移/滚轮缩放）与手动控制约束，不改变相机行为。
- 保留现有模型加载与 fallback 机制，仅调整视觉参数，不改动资源路径与数据链路。
- 同步更新前端文档中设备仿真视觉说明，明确日间场景语义。

## Capabilities

### New Capabilities

- `dashboard-scene-daylight-visuals`: 设备仿真场景支持白天视觉风格并保持当前交互与加载能力不变。

### Modified Capabilities

- None.

## Impact

- Frontend: `frontend/src/hooks/useDashboardScene.ts`（背景、光照、材质调色）。
- Docs: `frontend/README.md` 与根 `README.md` 的仿真画面视觉说明。
- Validation: 前端 `type-check/build` 与既有 smoke 回归链路。
