## Why

当前仓库在根目录与 `frontend/` 目录都存在大量分散文件（临时脚本、验证日志、一次性检查文件、中间产物），目录职责边界不清，导致维护成本与变更风险持续上升。需要建立统一的 file organization 规范并执行一次结构整理，以提升可维护性与协作效率。

## What Changes

- 新增仓库级文件归档规范，定义 root、`frontend/`、`backend/` 的职责边界与允许文件类型。
- 对 `frontend/` 中散落在目录根部的 `js/mjs/log/json/html` 等文件进行分类归档，迁移到明确子目录（如 `scripts/`、`reports/`、`tmp/`）。
- 对仓库根目录的散落文件进行分类归档，收敛 root 到“入口与说明”最小集合，减少非核心文件长期滞留。
- 更新受影响的 npm scripts、文档说明与引用路径，保证现有业务逻辑和运行行为不变。
- **BREAKING**：依赖旧文件路径的本地脚本、手工命令与自动化任务需要切换到新路径。

## Capabilities

### New Capabilities
- `repository-file-organization`: 定义仓库与 frontend 工作区的文件归档规则、迁移约束与可验证的结构验收标准。

### Modified Capabilities
- None.

## Impact

- Affected code:
  - `frontend/` 下脚本、日志、检查与临时文件的存放路径及引用。
  - 仓库根目录下分散文件的路径与分类。
  - 相关文档与命令说明（如 README、运行与排错指引）。
- Affected systems:
  - 本地开发与问题排查命令路径。
  - 依赖固定路径的 CI/automation 脚本（如存在）。
