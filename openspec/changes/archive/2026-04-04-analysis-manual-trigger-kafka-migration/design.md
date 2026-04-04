## Context

当前分析链路由半日 scheduler 触发，随后通过 RocketMQ 解耦执行并落库。该模型更适合离线批处理，不适合“立即发起并尽快看到结果”的运营场景；同时基础设施侧已需要向 Kafka 收敛。变更涉及 frontend 分析中心交互、backend 分析 API 与消息链路、部署与配置说明，属于跨模块改造，需要先统一技术方案以降低实施与回滚风险。

## Goals / Non-Goals

**Goals:**
- 提供分析中心手动触发能力：管理员点击按钮可发起分析并最终看到已保存结果。
- 将分析消息通道从 RocketMQ 迁移到 Kafka（Producer + Consumer + topic/group 配置）。
- 保持分析报告持久化语义不变（成功/失败状态、错误信息、时间字段等）。
- 保持现有鉴权与 `ApiResponse<T>` 契约不变，前端可复用统一请求处理。

**Non-Goals:**
- 不引入新的认证体系或权限模型。
- 不改造 LLM provider 协议与核心推理逻辑。
- 不在本次变更中做多租户、优先级队列、重试编排平台化。
- 不要求保留 RocketMQ 与 Kafka 双写长期并行（仅迁移窗口内可临时开关）。

## Decisions

1. 手动触发采用“受理即返回”的异步接口  
   - Decision: 新增 `POST /api/analysis/reports/trigger`（命名可按现有 controller 风格最终落地），接口创建/发布分析任务后立即返回受理结果（含请求标识或任务关联字段），由既有列表查询接口刷新结果。  
   - Rationale: 与消息驱动执行模型一致，避免同步阻塞请求；前端交互可通过轮询/刷新获取最终报告状态。  
   - Alternative: 同步等待分析完成再返回。Rejected，易超时且占用线程，用户体验不稳定。

2. 分析中心页面从“只读”改为“可触发 + 可观察状态”  
   - Decision: 新增手动触发按钮与提交表单区域（设备选择/上下文输入按现有 DTO 约束），提交后触发列表刷新并展示 processing/success/failed。  
   - Rationale: 最小改动满足业务目标，复用已有结果展示区域。  
   - Alternative: 新建独立页面。Rejected，会增加导航与维护成本。

3. 消息中间件迁移采用 Kafka 原生 Spring Boot 集成  
   - Decision: 引入 `spring-kafka`，新增 analysis producer/consumer 基于 Kafka topic 与 consumer group；移除或禁用 RocketMQ analysis 链路。  
   - Rationale: 与目标基础设施对齐，生态维护更稳定。  
   - Alternative: 保留 RocketMQ 并新增 Kafka 双通道。Rejected，复杂度高且不符合“迁移”目标。

4. 定时任务默认关闭，改为配置化保留  
   - Decision: `analysis.automation.enabled` 默认关闭或仅手动触发路径使用；scheduler 逻辑可保留代码与开关，避免一次性删除造成回滚困难。  
   - Rationale: 满足“手动触发为主”且保留应急回退能力。  
   - Alternative: 直接删除 scheduler。Rejected，回滚成本高。

5. 测试策略升级为“接口 + 集成 + 回归”三层  
   - Decision: 
     - API tests：新增手动触发接口鉴权/参数/受理返回测试；
     - Integration tests：Kafka producer->consumer->report persistence 端到端（可采用 testcontainer/embedded kafka，按仓库可用设施落地）；
     - Regression tests：分析列表与详情接口、失败状态、前端触发后刷新行为。  
   - Rationale: 防止仅 controller 切片通过但链路失败的回归。

## Risks / Trade-offs

- [Risk] Kafka 环境未就绪导致触发后无消费  
  -> Mitigation: 启动健康检查与启动日志中明确 topic/group/bootstrap server；提供本地快速校验脚本。

- [Risk] 迁移期间配置混乱（RocketMQ/Kafka 并存）  
  -> Mitigation: 使用清晰命名空间（`twinops.analysis.kafka.*`），并在 README 明确“单一生效链路”。

- [Risk] 手动高频触发造成分析堆积  
  -> Mitigation: 增加基础限流/幂等键策略（deviceCode + 时间窗），并在 UI 提示处理中状态。

- [Risk] 前端触发后用户误判“无结果”  
  -> Mitigation: 显示 processing 状态并自动刷新，失败时展示可读错误信息。

## Migration Plan

1. 引入 Kafka 依赖与配置，新增 producer/consumer 组件，保留 RocketMQ 代码但默认停用。  
2. 新增手动触发 API，并将分析中心接入按钮与触发请求。  
3. 打通 Kafka 消费后分析落库链路，保持结果查询接口兼容。  
4. 补齐接口、集成、回归测试；更新 README（部署、配置、验收步骤）。  
5. 灰度验证后移除 RocketMQ analysis 专用配置与文档。  

Rollback Strategy:
- 若 Kafka 链路异常，可通过配置开关切回原有 RocketMQ/scheduler 路径（在迁移窗口内保留），并回滚前端手动触发入口展示。

## Open Questions

- 手动触发接口是否需要显式返回“任务 ID”，还是复用报告记录 ID 即可满足前端追踪？  
- Kafka topic 分区与 consumer 并发默认值采用多少，是否需按环境（dev/prod）区分？  
- 手动触发是否需要用户级限流（例如每管理员每分钟上限）？
