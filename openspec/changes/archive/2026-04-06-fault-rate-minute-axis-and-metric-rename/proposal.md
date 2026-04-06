## Why

当前设备故障率图表的横坐标时间语义与业务表达不一致：坐标显示包含日期信息且指标命名为“故障变化率”，不利于值班人员按分钟快速判读实时故障率趋势。需要将图表统一为分钟粒度时间轴（仅 `HH:mm`）并明确纵轴语义为“故障率”。

## What Changes

- 将设备故障率图表横坐标规范为每 1 分钟一个坐标点，标签仅显示小时和分钟（`HH:mm`）。
- 将图表指标语义从“故障变化率”调整为“故障率”，并同步图例、标题、tooltip、接口字段语义说明。
- 保持历史滑动查看能力与分钟级监控能力，确保时间序列连续可读。
- 对应更新后端趋势接口与前端渲染约束，避免日期级文本或旧指标文案回流。

## Capabilities

### New Capabilities

- `fault-rate-minute-axis-and-metric-semantics`: 规范故障率图表的分钟时间轴展示与指标语义一致性。

### Modified Capabilities

- `dashboard-summary-sync-refresh`: 将 fault-rate 图表 requirement 从“hourly bucket + 变化率表达”调整为“minute bucket + 故障率表达”，并约束时间标签格式为 `HH:mm`。

## Impact

- **Backend**: `dashboard` 模块趋势聚合与返回字段语义、时间标签格式化策略。
- **Frontend**: `WidgetPanel04` 图表标题/图例/tooltip/坐标轴文案与数据映射逻辑。
- **API**: dashboard fault-rate 趋势接口文档与前后端契约字段说明。
- **Tests/Docs**: 更新 dashboard 相关单元/接口测试与 README 的图表语义描述。
