## Context

TwinOps 现有 README 体系包含根 README 与 frontend/backend 子 README。随着多轮功能迭代，根 README 聚合了过多实现细节，出现了与子 README 重复、局部冲突和维护边界不清的问题。该变更为 documentation-only，目标是通过信息架构重排提升一致性与可维护性。

## Goals / Non-Goals

**Goals:**
- 将根 README 收敛为项目级导航文档，保留高层架构与最小运行路径。
- 将实现细节（API、模块说明、配置与测试细节）稳定下沉至子 README。
- 修复已知不一致叙述（auth session 与实际实现对齐、配置工作流表述统一）。
- 保持中文叙述与 English technical terms 并存，满足既有文档风格规范。

**Non-Goals:**
- 不改动 frontend/backend 运行时代码。
- 不新增/删除接口、数据库结构、消息主题或调度策略。
- 不进行 OpenSpec 主 specs 的归档同步（本次仅创建并应用 change）。

## Decisions

1. Root README 采用 skeleton-first 结构，不再承载大段实现细节。  
   - Rationale: 根 README 的主要受众是首次进入仓库的读者，需要“先理解系统，再下钻细节”的阅读路径。  
   - Alternative: 保留当前大而全模式并局部修补。Rejected，因为重复源头仍在。

2. 以“单一信息归属”原则消除重复。  
   - Rationale: backend/fronted 细节由对应子 README 维护，根 README 只链接入口，避免多处更新导致漂移。  
   - Alternative: 在根 README 中保留摘要+详情双写。Rejected，维护成本高。

3. 文档冲突优先按代码真实行为修正文案。  
   - Rationale: 文档应反映现状而非愿景；例如 auth session 当前是 in-memory token session，不写 DB session validation。  
   - Alternative: 用模糊术语规避细节。Rejected，降低可执行性。

## Risks / Trade-offs

- [Risk] 根 README 过于精简导致信息查找跳转增加  
  -> Mitigation: 在 “Detailed Docs” 中提供清晰、稳定的子文档入口语义。

- [Risk] 旧链接/旧段落在外部引用失效  
  -> Mitigation: 保留核心章节名称可辨识性，并在变更说明中记录迁移位置。

- [Risk] 子 README 未来再次漂移  
  -> Mitigation: 保留并前置文档维护规则，要求代码变更同步更新相关 README。
