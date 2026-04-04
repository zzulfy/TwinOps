## Why

当前分析中心依赖半日定时任务触发，运营无法按需立即发起分析，导致故障排查与处置时效受限。同时消息中间件继续使用 RocketMQ 与目标技术栈不一致，需要迁移到 Kafka 以统一基础设施并降低运维成本。

## What Changes

- 将分析报告触发方式从“定时自动触发为主”调整为“页面手动触发为主”：在分析中心新增手动触发按钮，点击后发起分析并保存结果。
- 后端新增手动触发 API：接收设备与分析上下文，投递分析请求，返回受理结果与可查询标识。
- 分析执行链路由 RocketMQ Producer/Consumer 迁移为 Kafka Producer/Consumer。
- 下线或禁用现有半日定时自动批处理触发逻辑（保留可配置开关能力）。
- 更新运行配置、部署文档与联调说明（Kafka topic、consumer group、本地/非 Docker 启动步骤）。

## Capabilities

### New Capabilities

- `analysis-manual-trigger`: 提供分析中心手动触发分析并持久化结果的端到端能力（前端按钮、后端接口、状态回写）。

### Modified Capabilities

- `ai-analysis-center`: 分析中心从只读浏览改为支持手动触发分析，页面交互与结果刷新行为发生变化。
- `analysis-automation-pipeline`: 消息总线从 RocketMQ 切换到 Kafka，触发方式从定时驱动改为手动驱动为主。

## Impact

- **Backend**: `analysis` 模块 controller/service/messaging/scheduler 代码，消息客户端依赖与配置项。
- **Frontend**: `AnalysisCenterPage` 与相关 API 客户端，新增手动触发按钮与提交后状态刷新。
- **Infrastructure/Config**: `application.yml`、部署脚本与 README 中间件章节（RocketMQ -> Kafka）。
- **Testing**: 需要新增/调整接口测试、集成测试、回归测试覆盖手动触发与 Kafka 消费落库流程。
