## Why

TwinOps当前在告警展示可读性、告警操作职责边界、时序图数据表达，以及AI分析自动化链路上存在一致性与可运维性短板。随着管理端流程逐步完善，需要在不破坏既有接口契约的前提下完成一轮前后端协同升级，提升可读性、可操作性与自动化程度。

## What Changes

- 统一前端深浅背景与文本对比规则，基于design tokens落实“深底浅字、浅底深字”，并为动态预警底色增加对比感知文字策略。
- 重构“预警情况”模块职责：Dashboard预警面板仅保留基础告警信息滚动展示，不再承载“确认/解决”操作。
- 将告警状态操作迁移到设备列表页，并复用现有`PATCH /api/alarms/{id}/status`更新数据库字段，实现跨模块状态同步。
- 修复预警原因文本乱码风险，中文正文统一采用稳定的CJK fallback字体栈，装饰字体仅用于标题层。
- 修复“设备故障变化率”横坐标重复时间问题，后端改为按小时聚合（time-bucket aggregation）输出唯一时间轴序列。
- 将分析中心从“手工提交分析”升级为“定时自动分析”模式：采用`@Scheduled + RocketMQ`解耦生产与消费，分析页改为只读报告看板。
- 在分析任务消费侧引入幂等键（`deviceCode + half-day slot`）避免重复分析写入。

## Capabilities

### New Capabilities
- `analysis-automation-pipeline`: 基于定时任务与RocketMQ的自动分析请求投递、消费、幂等与报告落库能力。

### Modified Capabilities
- `frontend-design-token-system`: 增加深浅背景文本对比约束与动态底色对比感知文本规则。
- `alarm-workflow-ui`: 调整告警模块职责边界，Dashboard仅监控展示，设备列表承载状态操作。
- `device-list-view`: 扩展设备列表页的告警状态操作能力并驱动跨模块状态同步。
- `dashboard-summary-sync-refresh`: 调整故障变化率数据契约为按小时聚合后的唯一时间轴序列。
- `ai-analysis-center`: 分析中心由手工提交模式改为自动调度后的只读报告展示模式。

## Impact

- Affected frontend:
  - `WidgetPanel06`（告警展示收敛与滚动呈现）
  - `DeviceDetailPage`/相关组件（告警确认与解决操作入口）
  - `AnalysisCenterPage`（移除手工提交流程，转只读报告看板）
  - 主题与字体样式层（design tokens与fallback font stack）
- Affected backend:
  - 告警状态更新链路（沿用并强化现有状态流转同步）
  - Dashboard汇总服务（故障变化率按小时聚合）
  - 分析模块（新增定时触发、RocketMQ producer/consumer、幂等控制）
- APIs/contracts:
  - 复用现有告警状态更新API；
  - 分析中心读取接口保持稳定，创建接口可降级为内部调度调用或受限管理接口。
- Dependencies/systems:
  - 新增或启用RocketMQ运行依赖与对应配置项；
  - 不引入前端破坏性路由变更，优先保持既有导航稳定。
