## Why

当前 README 信息架构存在重复段落、跨文档职责混杂、局部叙述与实现不一致（例如 auth session 流程表述）的问题。需要在不改动业务代码的前提下完成文档重构，降低维护成本并提升 onboarding 可读性。

## What Changes

- 重构根 `README.md` 为高层导航骨架：What / Architecture / Layout / Quick Start / Runtime Contracts / Detailed Docs / Maintenance Rule。
- 将 backend/frontend 细节下沉到 `backend/README.md` 与 `frontend/README.md`，根 README 仅保留索引链接，避免重复维护。
- 修正根 README 链路中与实际实现不一致的描述（admin token session 改为 in-memory session 语义）。
- 清理 `backend/README.md` 配置章节的冲突描述，统一为 file-based configuration workflow。
- 保持“中文叙述 + English technical terms”写作规范。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `readme-documentation-overhaul`: 补充文档信息架构治理要求、根 README 职责边界、跨 README 一致性规则。

## Impact

- Affected files: `README.md`, `backend/README.md`（`frontend/README.md`按需最小化调整）。
- Runtime/API/Data: 无功能行为变化，无接口与数据库变更。
- Process: 文档治理规范更明确，后续代码变更的 README 同步要求可执行性更高。
