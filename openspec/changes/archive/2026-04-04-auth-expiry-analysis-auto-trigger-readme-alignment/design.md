## Context

该变更同时覆盖前端鉴权体验、分析中心业务流程、后端异步分析链路和 README 架构一致性，属于跨 frontend/backend/docs 的组合变更。当前分析触发仍存在“前端手工输入设备信息”与“README 仍含 RocketMQ 描述残留”的偏差；同时鉴权失效未强制退出受保护页面，导致用户停留在无效上下文。

## Goals / Non-Goals

**Goals:**
- 鉴权失效时在非登录页面立即退出并跳转登录，且给出可读提示。
- 分析中心改成“单按钮触发”，由后端自动查询全量设备与关键参数进行分析。
- 保持 Kafka 异步执行模型：触发请求受理即返回，后台执行长耗时聚合与分析落库。
- README 架构图/时序图/部署流程与当前 Kafka 模块和运行行为一致。
- 固化“后续所有代码需求必须包含集成测试与回归测试”的工程规则。

**Non-Goals:**
- 不引入新的认证机制（JWT/OAuth 等）。
- 不改变 LLM provider 协议和提示词体系。
- 不实现复杂任务编排（优先级、多队列路由、跨集群调度）。

## Decisions

1. 前端 401 全局处理升级为“强制离开受保护页面”
   - Decision: 在统一 API 层捕获 401 后清理 session，并通过 router 跳转 `/login`；非登录页出现 401 时立即生效。
   - Rationale: 防止用户继续停留在不可用页面并触发重复失败请求。
   - Alternative: 仅 toast 提示不跳转。Rejected，用户仍停留错误上下文。

2. 分析触发改为“无输入一键触发 + 后端自动聚合”
   - Decision: 前端仅保留 trigger button；后端触发接口不再要求 deviceCode/metric 输入，由 service 查询设备与当前参数（cpu、温度等）生成分析消息。
   - Rationale: 与业务诉求一致，避免人工输入误差并减少操作成本。
   - Alternative: 前端保留可选输入框。Rejected，与需求“无需输入设备信息”冲突。

3. 长耗时流程继续异步化并固定 Kafka
   - Decision: 触发接口受理后立即返回任务受理信息；后台执行“查询设备 -> 构造上下文 -> Kafka publish -> consumer 落库”。
   - Rationale: 全量设备检索与分析耗时较长，异步模型可避免请求超时与线程阻塞。
   - Alternative: 同步串行执行。Rejected，性能与可用性风险高。

4. README 一致性治理纳入同一变更验收
   - Decision: 同步修正 root/backend README 中架构图、时序图、部署步骤、模块描述，确保与 Kafka 与自动聚合逻辑一致。
   - Rationale: 部署与理解偏差属于功能交付风险，应与代码变更同批收敛。

5. 测试策略基线化
   - Decision: 本变更至少包含 API 测试、Kafka 集成测试、前端回归测试；并在 README 写入长期约束，作为后续 change 默认验收门槛。
   - Rationale: 防止仅单层测试通过导致链路级回归未被发现。

## Risks / Trade-offs

- [Risk] 全量设备聚合导致分析触发峰值压力升高  
  -> Mitigation: 触发接口仅受理，后台分批处理并记录处理状态。

- [Risk] 鉴权失效强制跳转影响少量边界交互  
  -> Mitigation: 仅对非登录页面生效，并保留清晰提示文案。

- [Risk] README 大幅调整引入新旧信息冲突  
  -> Mitigation: 以运行中配置与代码链路为唯一事实源，逐段校对图示与命令。

- [Risk] Kafka 集成测试在环境差异下不稳定  
  -> Mitigation: 使用仓库既有测试设施（embedded kafka/testcontainer），并隔离 topic/group。

## Migration Plan

1. 更新 OpenSpec specs/tasks，明确行为变更与测试要求。  
2. 实现前端鉴权失效强制跳转登录。  
3. 实现分析中心一键触发 UI（移除输入框）。  
4. 后端改造触发接口为自动聚合全量设备参数并异步 Kafka 投递。  
5. 补齐 API/集成/回归测试。  
6. 更新 README 架构图与部署说明，写入测试规则。  
7. 回归验证与发布。

Rollback:
- 可通过 feature 开关临时回退到旧触发入口与旧 UI，保留 Kafka 消费链路不回退。

## Open Questions

- “全量设备”是否包含 normal 状态设备，还是仅 warning/error 设备？  
- 一键触发是否需要并发限制（例如同一管理员短时间内只允许一个任务）？  
- 分析结果展示是否需要任务进度百分比，还是 processing/success/failed 三态足够？
