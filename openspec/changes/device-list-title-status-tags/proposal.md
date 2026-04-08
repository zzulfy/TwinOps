## Why

当前设备列表卡片的主次信息顺序与运维识别习惯不一致：标题是设备名称，`deviceCode` 与状态混在次行文本中，导致设备定位效率偏低。需要将列表卡片收敛为“主标题直接可识别设备 + 次级状态标签化”，提升浏览与筛选效率。

## What Changes

- 调整设备列表卡片标题：由仅设备名称改为 `deviceCode + 设备名称`（如 `DEV001 服务器机柜`）。
- 调整设备列表次行信息：移除 `deviceCode · status` 文本拼接，改为仅显示设备状态标签（`normal / warning / error`）。
- 保持现有筛选、关注、跳转与告警操作行为不变，仅做信息呈现层改造。
- 同步更新设备列表相关规格与前端文档说明，明确新的卡片信息层级。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `device-list-view`: 设备列表项的信息展示层级调整为“标题=设备编码+名称，次级=状态标签”，替换原 `deviceCode · status` 文本串。

## Impact

- Frontend: `src/pages/DeviceDetailPage.tsx`（列表项渲染）与 `src/styles/app.scss`（状态标签样式）。
- Specs: `openspec/specs/device-list-view/spec.md`（设备列表展示要求）。
- Docs: `frontend/README.md`（设备列表展示规则说明）。
