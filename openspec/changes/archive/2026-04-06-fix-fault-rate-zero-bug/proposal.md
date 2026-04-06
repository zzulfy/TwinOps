## Why

当前故障率图表数值计算与数据库业务定义不一致：故障率应为“发生 error 的设备数 / 所有硬件设备数”，但页面可能显示为 0，导致监控判断失真。该问题会直接影响值班决策，需要立即修复并确保前后端语义一致。

## What Changes

- 修正后端故障率计算口径，改为基于设备状态字段统计 `error` 设备占比，不再用与故障率无关的替代指标。
- 保持分钟级时间轴与曲线展示能力不变，仅修复纵轴数据来源与含义，确保故障率在存在 error 设备时不错误显示为 0。
- 更新图表和接口文档说明，明确“故障率 = error 设备数 / 全部设备数”。
- 补充回归测试覆盖：存在 error 设备时故障率应大于 0；无设备或无 error 的边界行为可预测且可验证。

## Capabilities

### New Capabilities

- `fault-rate-status-ratio-calculation`: 定义故障率基于设备状态占比的计算规则与边界行为。

### Modified Capabilities

- `dashboard-summary-sync-refresh`: 调整 fault-rate requirement，从替代性趋势值改为数据库状态占比计算结果，并要求与故障率业务定义一致。

## Impact

- **Backend**: `dashboard` 服务层故障率计算逻辑、可能涉及 device/alarm 查询聚合策略。
- **Frontend**: 故障率图表数据消费不变，但展示值将反映真实 error 占比。
- **API/Docs**: dashboard fault-rate 接口语义说明与 README 更新。
- **Tests**: backend service/controller 测试与必要前端回归验证更新。
