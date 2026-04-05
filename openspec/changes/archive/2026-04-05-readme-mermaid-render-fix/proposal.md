## Why

`README.md` 中 Mermaid 图在 GitHub rich display 渲染失败，导致架构文档核心内容不可读，影响新成员理解与部署验证。需要修复 Mermaid 语法兼容性并建立可持续的渲染约束。

## What Changes

- 修复 root `README.md` 中触发 GitHub Mermaid 解析错误的 flowchart/sequenceDiagram 片段，保证渲染通过。
- 将 Mermaid 图中的高风险写法（容易触发 GitHub 解析歧义的节点文本/分隔符）替换为兼容写法。
- 增加 README 图表维护规则：提交前必须确保 GitHub Mermaid 语法可渲染。

## Capabilities

### New Capabilities

- `github-mermaid-compatibility`: 定义 README Mermaid 图需要满足 GitHub 渲染兼容性的要求与验收场景。

### Modified Capabilities

- `readme-documentation-overhaul`: 增加“文档图表必须可渲染且与实现一致”的 requirement 约束。

## Impact

- **Affected files**: `README.md`、`openspec/specs/readme-documentation-overhaul/spec.md`。
- **Behavior impact**: 仅文档渲染与可读性提升，不影响运行时业务行为。
- **Developer workflow**: README 图表更新时需遵循 GitHub Mermaid 兼容语法。
