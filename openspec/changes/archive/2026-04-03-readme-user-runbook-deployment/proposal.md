## Why

当前 README 已有改进，但仍需要进一步收敛为“面向最终用户可直接上手”的 Runbook：用户应一眼看懂架构与业务链路，并可直接按命令完成部署。该变更用于把文档从“说明性”提升为“可执行交付”。

## What Changes

- 重构根 README 图示为分层且细节完整的架构图与业务时序图，覆盖 frontend/backend/data/messaging 关键模块与方向。
- 将部署章节明确为 non-Docker first，并给出可直接执行的 MySQL/RocketMQ 原生部署命令。
- 保留 Docker 作为 fallback 路径，避免阻塞本地联调。
- 强化“启动后验证”步骤，提供 API 与页面访问路径，确保部署完成后可快速验收。
- 移除“文档如何设计”的面向维护者语气，统一为面向使用者的产品与业务表达。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `readme-documentation-overhaul`: README 需要满足用户导向表达、细节化架构/业务图、non-Docker 主部署路径与可执行验证步骤。

## Impact

- Affected files: `README.md`（主改动），`backend/README.md`（RocketMQ non-Docker 优先说明）。
- APIs/Runtime: 无代码行为变更，仅文档变更。
- Dependencies/Systems: 无新增依赖。
