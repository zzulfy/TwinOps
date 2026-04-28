## 1. Python RCA sidecar

- [x] 1.1 在 `causaltrace-rca/` 内新增在线推理入口，提供 `/health` 和 `/infer/device-rca`。
- [x] 1.2 把当前 AERCA 脚本重构出结构化推理适配层，支持“加载已存在模型权重 -> 返回 root causes / causal edges JSON”。
- [x] 1.3 明确 sidecar 运行配置、profile、模型版本和 README 启动方式。

## 2. 后端 RCA 接入

- [x] 2.1 新增设备级 `RcaFeatureAssembler`，从 `device_metrics` 组装最近时间窗并生成设备压力矩阵。
- [x] 2.2 新增 `RcaEngineClient` 及配置，支持 sidecar 调用、timeout、fallback 和结构化日志。
- [x] 2.3 改造 analysis Kafka consumer / aggregation service，使聚合分析在 LLM 前先调用 RCA engine。
- [x] 2.4 扩展 `analysis_reports` 持久化和 DTO，保存 `engine`、`rca_status`、`root_causes_json`、`causal_graph_json`、`model_version`、evidence window。

## 3. 前端 Analysis 展示

- [x] 3.1 扩展 `frontend/src/api/backend.ts` 的 Analysis report 类型，读取 RCA 结构化字段。
- [x] 3.2 更新 `AnalysisCenterPage.tsx`，在 detail 区展示 root-cause ranking、causal edges、engine metadata 和 LLM 文本。
- [x] 3.3 保持手动 trigger、列表刷新和旧报告回显兼容，不因 RCA 缺失而崩溃。

## 4. 验证与文档

- [ ] 4.1 增加后端测试：覆盖 RCA sidecar 正常、超时 fallback、持久化字段写入和 API 返回。
- [x] 4.2 增加前端契约/页面验证：覆盖 RCA 字段渲染和 fallback 展示。
- [x] 4.3 更新 `README.md`、`backend/README.md`、`frontend/README.md` 和 `causaltrace-rca/README.md`，记录 RCA sidecar 的运行方式与主链角色。
