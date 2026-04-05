## Purpose

Define GitHub-compatible Mermaid authoring requirements for root `README.md` diagrams so repository documentation renders reliably without parser errors.

## Requirements

### Requirement: README Mermaid diagrams MUST be GitHub-renderable
Project `README.md` 中的 Mermaid 图表 MUST 使用 GitHub 支持的语法子集，并在仓库页面可成功渲染，不得出现 parse error。

#### Scenario: Architecture flowchart renders on GitHub
- **WHEN** 用户在 GitHub 打开 root `README.md`
- **THEN** 架构 flowchart 可正常渲染
- **AND** 页面不出现 Mermaid parse error 提示

#### Scenario: Sequence diagram renders on GitHub
- **WHEN** 用户在 GitHub 打开 root `README.md` 的业务流程图
- **THEN** sequenceDiagram 可正常渲染
- **AND** 图中参与者与交互步骤完整可见

### Requirement: Mermaid labels MUST avoid parser-ambiguous patterns
README Mermaid 节点与连线文本 MUST 避免使用容易触发 GitHub Mermaid 解析歧义的写法，必要时应拆分文本或使用兼容替代表达。

#### Scenario: Scheduler node label remains readable and parse-safe
- **WHEN** README 描述定时任务节点（如 `@Scheduled` 执行时段）
- **THEN** 节点文本使用兼容写法且不会触发语法错误
- **AND** 读者仍可理解其触发语义
