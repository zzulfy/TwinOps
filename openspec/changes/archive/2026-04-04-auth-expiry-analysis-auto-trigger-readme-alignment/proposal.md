## Why

当前系统在鉴权过期时仍可能停留在受保护页面，造成“页面可见但数据不可用”的错误体验；分析中心手动触发仍依赖人工输入设备信息，也与“系统自动全量分析”目标不一致。同时 README 架构图和模块说明未完全对齐 Kafka 现状，影响部署与理解。

## What Changes

- 前端新增“鉴权失效即时退出”行为：在非登录页面一旦鉴权失效，立即退出当前受保护页面并跳转登录页，提示用户重新登录。
- 分析中心交互改为“一键触发”：移除设备/参数输入框，仅保留触发按钮。
- 后端触发接口改为自动拉取全量设备及关键参数（如 CPU、温度等）并异步投递 Kafka 执行分析与落库。
- README 全量校正：架构图、时序图、部署章节、模块说明与当前 Kafka 实现一致。
- 新增工程约束：从本 change 开始，后续所有代码需求必须包含集成测试与回归测试。

## Capabilities

### New Capabilities

- `auth-expiry-forced-logout`: 定义鉴权失效时受保护页面强制退出与登录提示的行为约束。

### Modified Capabilities

- `admin-authentication`: 增加“鉴权过期后客户端必须立即退出受保护页面并引导登录”的要求。
- `ai-analysis-center`: 分析中心从手动输入触发改为无输入的一键触发与异步状态反馈。
- `analysis-automation-pipeline`: 分析请求来源改为后端自动聚合全量设备参数后异步 Kafka 执行。
- `readme-documentation-overhaul`: README 图示与部署说明必须与 Kafka 链路及当前模块职责一致，并声明测试基线规则。

## Impact

- **Frontend**: 路由守卫、全局 API 鉴权处理、AnalysisCenterPage 交互结构与状态提示。
- **Backend**: analysis controller/service、设备数据聚合查询、Kafka producer/consumer 消息体与执行链路。
- **Testing**: 新增并强制维护 API 测试 + 集成测试 + 回归测试三层覆盖。
- **Documentation**: root/backend README 的架构图、业务时序、部署与验收步骤、工程规范说明。
