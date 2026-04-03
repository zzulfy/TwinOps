## Why

当前前端在后端未启动时仍能显示“设备告警”列表，说明该入口仍在使用本地 mock 数据，造成与真实系统状态不一致。需要立即改为仅基于后端接口返回结果展示，避免误导值班人员。

## What Changes

- 移除 `LayoutFooter` 中硬编码告警列表与派生展示逻辑，不再注入本地 mock 告警。
- 将“设备告警”弹窗改为统一通过现有告警接口拉取数据（按状态筛选、限制条数）。
- 明确后端不可达或返回失败时的前端行为：展示错误/空态，不得静默回退到 mock 数据。
- 统一告警列表展示字段映射，确保与 `AlarmListItem` 后端契约一致。

## Capabilities

### New Capabilities
- （无）

### Modified Capabilities
- `alarm-workflow-ui`: 告警展示面板（含页脚告警弹窗）必须仅使用后端告警数据源，不得使用本地 mock 回退。

## Impact

- 前端组件：`frontend/src/components/LayoutFooter.vue`、`frontend/src/components/AlarmDeviceList.vue`
- 前端 API：复用 `frontend/src/api/backend.ts` 中 `fetchAlarmList`
- 用户体验：后端离线时由“显示伪数据”变为“显示加载失败/空态”
- 无新增第三方依赖，无后端接口变更
