## Why

当前仓库将前端代码、测试脚本和构建配置散落在根目录，导致目录职责不清、协作成本高，并且不利于未来扩展多子系统（如后端、基础设施、运维脚本）。需要尽快将前端资产整体收敛到 `frontend/` 子目录，在不改变业务能力的前提下提升可维护性和可扩展性。

## What Changes

- 新增 `frontend/` 顶层目录，承载现有前端运行所需代码与资源（如 `src/`、`public/`、`index.html`、Vite/TS 配置、前端测试脚本）。
- 调整包管理与构建入口，使开发、构建、预览、类型检查在迁移后仍可稳定执行。
- 修正静态资源与模型加载路径，确保 Three.js、ECharts、字体与纹理资源在迁移后行为一致。
- 更新文档与常用命令，降低团队迁移成本。
- **BREAKING**：仓库根目录结构与前端启动路径发生变化，依赖旧目录约定的本地脚本或 CI 任务需要同步更新。

## Capabilities

### New Capabilities
- `frontend-repo-layout`: 定义前端代码集中到 `frontend/` 子目录后的标准目录结构与边界。
- `frontend-build-runtime-compatibility`: 定义迁移后开发、构建、预览与静态资源访问保持可用的约束与验收标准。

### Modified Capabilities
- None.

## Impact

- Affected code:
  - 前端目录与配置文件路径（`src/`、`public/`、`index.html`、`vite.config.ts`、`tsconfig*.json`、`package.json`）。
  - 前端测试与检查脚本路径（根目录 `test-*.mjs`、`check-*.mjs/js` 等）。
- Affected systems:
  - 本地开发命令执行位置。
  - CI/CD 构建工作目录与缓存键。
  - 文档示例命令与部署脚本。