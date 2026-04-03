## Context

TwinOps README 当前已包含部署命令，但用户反馈核心问题是“图不够细，文案不够用户导向，部署路径需要 non-Docker 主方案”。本次变更目标是把 README 变成可直接交付给运维/实施用户的运行手册，而不是文档设计规范说明。

## Goals / Non-Goals

**Goals:**
- 提供细节更完整但层次清晰的架构图和业务链路图。
- 明确 non-Docker 为主要部署方式，并给出可直接复制执行的命令。
- 保留 Docker fallback，降低环境不一致时的阻塞风险。
- 保证部署完成后有明确可验证的 API 与页面验收路径。

**Non-Goals:**
- 不修改 backend/frontend 运行逻辑。
- 不新增 API、数据库字段、消息主题。
- 不调整 OpenSpec workflow 以外的流程策略。

## Decisions

1. 图示采用分层分组（Frontend/Backend/Data&Messaging）并标注关键组件名。  
   - Rationale: 细节可读性和“第一眼理解”并不冲突，关键在于分层和命名清晰。  
   - Alternative: 保持极简图。Rejected，因为无法承载用户要求的业务细节。

2. 部署流程以 non-Docker 为默认主路径。  
   - Rationale: 用户明确要求主要部署方式不是 Docker。  
   - Alternative: Docker-first。Rejected，不符合需求优先级。

3. README 文风统一为“用户执行视角”。  
   - Rationale: 最终读者是部署与使用者，而非文档维护者。  
   - Alternative: 同时保留文档治理说明。Rejected，干扰主路径阅读。

## Risks / Trade-offs

- [Risk] 图示过于复杂影响阅读速度  
  -> Mitigation: 保持分层、命名一致、主链路突出。

- [Risk] non-Docker 命令在不同 OS 存在差异  
  -> Mitigation: 以 Linux 通用命令为主，Docker 作为 fallback。

- [Risk] 文档命令后续失效  
  -> Mitigation: 保留“启动后验证”章节，便于快速发现偏差。
