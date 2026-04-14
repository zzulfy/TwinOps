## Why

当前 Dashboard 三维仿真中的设备详情对话框使用“贴设备锚点悬浮”的方式展示，视觉上会遮挡模型，且在镜头移动时位置抖动明显。  
用户希望点击设备后在画面正中央展示设备信息，以获得更稳定、更易读的交互体验。

## What Changes

- 将仿真设备点击后的详情展示从“设备锚点悬浮框”改为“场景中央对话框”。
- 保留当前点击设备打开详情、点击空白关闭详情的主交互路径。
- 保留设备标签与设备数据 1:1 绑定逻辑，不改变后端数据来源与绑定键规则。
- 优化中央对话框样式与层级，避免遮挡关键操作控件并提升可读性。

## Capabilities

### New Capabilities

- `simulation-centered-device-dialog`: 支持在仿真画面中点击设备后，以中央对话框展示设备信息。

### Modified Capabilities

- `simulation-device-interaction-overlay`: 设备详情展示位置从设备锚点改为居中弹层，交互入口保持不变。

## Impact

- Affected frontend code:
  - `frontend/src/hooks/useDashboardScene.ts`
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/components/SimulationDeviceDialog.tsx`
  - `frontend/src/styles/app.scss`
- Affected backend code:
  - 无接口与表结构变更（仅复用现有 `/api/devices` 返回数据）
- Compatibility:
  - Devices 页面与 Analysis 页面无契约变更
