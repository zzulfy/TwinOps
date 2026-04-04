## Why

后端模块日志覆盖目前不均衡，多个 Controller/Service 缺少统一日志入口，且日志输出未强制包含代码来源位置信息，导致开发人员排查 bug 时难以快速定位打印点。  
从本次 change 开始，需要把日志能力升级为默认工程基线：关键路径必须有日志、必须支持来源定位、必须统一 `info/warn/error` 三级分层。

## What Changes

- 在 backend 引入统一日志输出 pattern，日志行中包含 `request_id + class.method:line`，满足“从日志回到代码位置”诉求。
- 对后端核心模块（controller/service/auth/analysis/kafka/retention）全量补齐结构化日志，按语义使用 `info/warn/error`。
- 规范日志事件字段（`module/event/result/error_code`）的使用方式，降低排障时字段漂移和语义不一致。
- 在 README / backend README 增加日志基线规则，明确后续每次代码变更都要在合适位置补日志并遵循三级日志标准。
- 补充/更新测试，确保改造不破坏现有接口行为和主流程。

## Capabilities

### New Capabilities

- `backend-logging-baseline`: 定义后端日志基线（可定位来源 + 三级日志等级 + 覆盖关键路径）的强制要求。

### Modified Capabilities

- `backend-structured-observability`: 将结构化日志要求扩展为模块级覆盖要求，并明确日志必须可定位代码来源（class/method/line）。
- `readme-documentation-overhaul`: 增加日志工程规则文档化要求，确保后续需求实现遵循统一日志规范。

## Impact

- **Affected code**: `backend/src/main/java/**`（Controller、Service、Auth、Analysis/Kafka 链路）、`backend/src/main/resources/application.yml`、相关测试文件。
- **Runtime behavior**: API 语义不变，日志可观测性增强，日志量上升但可查询性显著提升。
- **Developer workflow**: 后续代码修改需同步考虑日志落点与等级选择，并在 README 中保持规则一致。
