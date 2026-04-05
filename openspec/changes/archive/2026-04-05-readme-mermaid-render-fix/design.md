## Context

当前 root `README.md` 包含 Mermaid flowchart 与 sequenceDiagram，用于展示 TwinOps 架构和业务链路。GitHub rich display 对 Mermaid 解析器版本和语法容错更严格，现有图中存在高风险写法（节点文本混合复杂分隔符、可能触发歧义的 label 形式），导致线上渲染失败并影响文档可用性。

## Goals / Non-Goals

**Goals:**
- 修复 README Mermaid 语法，确保 GitHub 页面可稳定渲染。
- 在不改变系统真实语义的前提下，保留“模块关系 + 分析链路”表达完整性。
- 沉淀 Mermaid 编写约束，避免后续再次出现 parse error。

**Non-Goals:**
- 不调整后端或前端运行时代码逻辑。
- 不新增新的架构能力，仅做文档表达与规范补强。
- 不替换 Mermaid 为其他图表技术栈。

## Decisions

- **Decision 1: 优先最小语法变更而非重画整图**  
  保持现有图结构与节点语义，聚焦修复触发 GitHub parser 错误的节点 label 与连线写法，降低文档回归风险。
- **Decision 2: 约束 Mermaid 文本为 GitHub 兼容子集**  
  对易歧义格式（复杂内联分隔、可被识别为链接/操作符的组合）采用更保守表达，必要时拆分为多个节点或更简单文本。
- **Decision 3: 将兼容性要求写入 OpenSpec requirement**  
  通过新增 capability + 修改现有 README capability，把“可渲染”提升为可验收要求，而非一次性修复。

## Risks / Trade-offs

- **[Risk]** 图中语法简化可能降低信息密度 → **Mitigation**: 保留关键链路节点，文本简化但不删减核心关系。
- **[Risk]** 本地 Mermaid 预览与 GitHub 渲染差异 → **Mitigation**: 明确以 GitHub 兼容语法为基准，避免依赖本地特性。
- **[Trade-off]** 可读性与兼容性冲突 → **Mitigation**: 统一优先级为“先可渲染，再优化可读性”。
