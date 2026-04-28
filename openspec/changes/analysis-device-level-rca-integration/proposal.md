## Why

当前 TwinOps 的 Analysis 主链已经具备手动触发、Kafka 异步消费、聚合分析报告持久化和 LLM 文本生成能力，但它仍然只有“文字结论”，没有结构化根因证据：

- 聚合分析依赖当前异常设备的最新指标快照，无法说明“哪台设备更像异常传播源头”。
- `analysis_reports` 只存文本化 prediction / risk / action，前端无法展示明确的 root-cause ranking 或 causal relationship。
- 仓库已新增 `causaltrace-rca/`（AERCA / Granger causal discovery），但它目前是独立研究代码，没有接入 Spring Boot + Kafka + Analysis 页面主链。
- 直接在 Java 请求链路里调用 `python main.py` 不可维护：脚本当前面向训练/评估，不提供稳定的在线推理接口，也不输出结构化 RCA 结果。

现在需要把 `causaltrace-rca/` 接成 TwinOps Analysis 主链中的“结构化 RCA 证据引擎”，先落地设备级 RCA：判断“哪台设备最可能是根因源头”，再由现有 LLM 分析能力把 RCA 结果翻译成可读报告。

## What Changes

- 新增一个 Python RCA sidecar，把 `causaltrace-rca/` 封装成可健康检查、可结构化推理的服务，而不是直接跑训练脚本。
- 在后端 analysis 聚合链路中增加 `device-level RCA` 阶段：从最近时间窗 telemetry 组装设备压力序列，调用 RCA sidecar，得到 root cause ranking / causal edges / model metadata。
- 保留现有 Kafka 异步触发和 LLM 文本生成主链，但把 RCA 结构化结果作为上游证据输入；当 sidecar 不可用时，自动 fallback 到现有 `llm-only` 聚合报告模式。
- 扩展 `analysis_reports` 存储和 Analysis API，使前端能够读取结构化 RCA 结果而不只是一段 prediction 文本。
- 更新 Analysis 页面，展示 Top root-cause devices、causal chain / edges、RCA engine 状态与模型版本，并保留现有文本分析区。

## Capabilities

### New Capabilities

- `analysis-device-level-rca`: 定义设备级 RCA sidecar、设备压力时序输入、结构化根因输出和 fallback 契约。

### Modified Capabilities

- `analysis-automation-pipeline`
- `ai-analysis-center`

## Impact

- Python sidecar：
  - `causaltrace-rca/` 新增在线推理入口与服务封装
  - `causaltrace-rca/README.md`
- Backend：
  - `backend/src/main/java/com/twinops/backend/analysis/**`
  - 可能新增 RCA client / feature assembler / DTO / config
  - `backend/sql/001_schema.sql` 及相关迁移/seed 说明
- Frontend：
  - `frontend/src/api/backend.ts`
  - `frontend/src/pages/AnalysisCenterPage.tsx`
  - Analysis 页面样式与结构化 RCA 展示组件
- 文档：
  - `README.md`
  - `backend/README.md`
  - `frontend/README.md`

## Compatibility

- 保留现有手动触发与 Kafka 异步消费路径，不改成同步阻塞式分析。
- 保留现有 LLM 报告能力；RCA sidecar 失败时，系统必须还能生成 `llm-only` 报告。
- 第一版只做设备级 RCA，不做“设备-指标对级 RCA”，避免维度和复杂度失控。
- 不要求 Dashboard 仿真区、设备 1:1 映射或告警处理流程做兼容性修改。
