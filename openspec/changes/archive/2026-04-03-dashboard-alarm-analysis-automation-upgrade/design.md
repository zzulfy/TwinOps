## Context

TwinOps 当前已具备告警状态更新接口（`PATCH /api/alarms/{id}/status`）与分析报告查询能力，但存在三类关键问题：  
1) 前端告警与文本视觉对比不稳定，部分模块可读性不足；  
2) 告警“监控展示”与“状态操作”职责混杂在同一面板；  
3) 分析链路依赖人工触发，缺少定时自动化与消息解耦。  

本次设计覆盖前后端协同改造，要求保持现有核心 API 兼容，并将新增能力落在可演进的模块边界内。

## Goals / Non-Goals

**Goals:**
- 建立统一对比规则：深背景浅文字、浅背景深文字，并对动态背景启用 contrast-aware text。
- 将 Dashboard 预警面板收敛为 read-only 监控组件；告警状态流转迁移到设备列表侧执行。
- 修复中文告警原因显示乱码风险，采用稳定的 CJK fallback font stack。
- 将故障变化率改为后端小时聚合输出，保证横轴时间唯一且可读。
- 建立 `@Scheduled + RocketMQ` 自动分析链路，并对消费侧建立幂等控制。
- 将分析中心页面切换为只读报告看板。

**Non-Goals:**
- 不重构现有设备三维场景和建模逻辑。
- 不替换现有告警状态枚举（`new|acknowledged|resolved`）。
- 不引入新的前端路由体系或权限模型变更。
- 不在本次变更中引入复杂报表编排或多租户分析策略。

## Decisions

### 1) 视觉与可读性规则统一到 design tokens
- **Decision**: 统一由 `frontend-design-token-system` 提供对比语义 token，并禁止组件局部写死“浅底浅字”组合。
- **Rationale**: 减少样式漂移与局部失配，保证跨模块一致可读性。
- **Alternatives considered**:
  - 仅修复单组件颜色：见效快但不可持续。
  - 引入第三方可访问性主题框架：改造面过大，不符合当前节奏。

### 2) 告警职责解耦：Dashboard 只监控，Device List 负责操作
- **Decision**: `WidgetPanel06` 仅展示告警基础信息 + 滚动效果；确认/解决入口迁移到 `DeviceDetailPage` 相关列表区域。
- **Rationale**: 监控面板应低交互高可视；状态操作应在运维上下文更完整的页面执行。
- **Alternatives considered**:
  - 保留双入口：易造成状态冲突与学习成本上升。
  - 完全迁移到设备详情弹层：列表批量操作效率较低。

### 3) 状态同步策略保持“数据库为单一事实源”
- **Decision**: 继续使用现有 `PATCH /api/alarms/{id}/status` 更新 `status/acknowledged_at/resolved_at`，各模块通过重新拉取列表同步状态。
- **Rationale**: 复用稳定后端能力，避免新增状态中间层复杂度。
- **Alternatives considered**:
  - 前端本地事件总线强同步：跨页面一致性脆弱。
  - 立刻引入实时订阅推送：收益不足以覆盖当前改造成本。

### 4) 故障变化率采用后端 time-bucket aggregation
- **Decision**: 后端按小时桶聚合故障变化率，仅返回唯一时间轴标签。
- **Rationale**: 直接读取多设备原始点会导致 `HH:mm` 重复，影响可读性与可信度。
- **Alternatives considered**:
  - 前端去重标签：会丢失统计语义且难解释。
  - 按设备拆多序列：与当前面板目标（总体变化）不一致。

### 5) 分析中心自动化采用 Scheduled Producer + RocketMQ Consumer
- **Decision**: 每半天（00:00/12:00）调度采集故障设备摘要，发布 `analysis.request`；消费端生成/更新 `analysis_reports`。
- **Rationale**: 通过消息解耦定时与业务处理，降低耦合并增强扩展性。
- **Alternatives considered**:
  - 单体内同步定时直接调用分析服务：耦合高，扩展性弱。
  - 保留人工触发为主：不满足自动化目标。

### 6) 幂等键策略
- **Decision**: 使用 `deviceCode + half-day slot` 作为幂等键，保证重复投递或重复消费不产生重复有效报告。
- **Rationale**: MQ 场景下至少一次投递是常态，幂等是基础保障。
- **Alternatives considered**:
  - 仅靠消费重试次数控制：无法防止逻辑重复写入。
  - 仅靠数据库时间窗口近似去重：边界不可靠。

## Risks / Trade-offs

- **[Risk] RocketMQ 接入配置不完整导致自动任务不可用** → **Mitigation**: 提供清晰配置项与启动失败日志，保留人工分析接口作为临时兜底。  
- **[Risk] 告警操作入口迁移导致用户短期不适应** → **Mitigation**: 在预警面板和设备列表提供明确文案提示。  
- **[Risk] 聚合口径调整后历史图形波动变化** → **Mitigation**: 在需求说明中明确“小时聚合口径”，并保持字段命名稳定。  
- **[Risk] 字体 fallback 不一致导致跨平台表现差异** → **Mitigation**: 使用多级 CJK fallback 栈并避免正文强制装饰字体。  

## Migration Plan

1. 先落地后端兼容改造（聚合查询、自动分析链路、幂等与日志）。  
2. 再落地前端展示与交互迁移（预警面板只读、设备列表操作、分析中心只读）。  
3. 灰度验证后切换默认行为；若 RocketMQ 不可用，临时回退到人工触发分析。  
4. 回滚策略：保持旧接口可用，前端可快速恢复“手工提交分析”入口与旧预警交互。  

## Open Questions

- RocketMQ topic/tag 命名规范是否需要与现有运维平台统一前缀？  
- 自动分析是否需要按告警等级做分层频率（例如严重告警优先）？  
- 分析中心是否需要显示批次维度（batch id）以增强审计可追踪性？  
