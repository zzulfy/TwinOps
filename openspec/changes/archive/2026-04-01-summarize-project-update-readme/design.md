## Context

TwinOps currently has a functional but command-centric `README.md` that does not fully describe system architecture, domain modules, and technical implementation strategy from an engineering perspective. The requested outcome is a Chinese presentation for explanatory content while preserving professional terminology in English to keep technical precision and alignment with code and ecosystem conventions.

The project is a split frontend/backend repository (`frontend`: Vue 3 + Vite + Three.js/ECharts; `backend`: Spring Boot + MyBatis-Plus + MySQL), and current onboarding quality depends heavily on scattered knowledge in code and OpenSpec artifacts. This change aims to centralize that knowledge in `README.md` without altering runtime behavior.

## Goals / Non-Goals

**Goals:**
- Provide a complete Chinese project summary in `README.md`, including architecture, modules, data flow, and deployment topology.
- Add a dedicated technical implementation plan section describing key implementation strategies and design decisions.
- Preserve professional technical terms in English when they represent canonical concepts, tool names, interfaces, or patterns.
- Keep existing runnable commands accurate and maintain path correctness for `frontend` and `backend` workspaces.

**Non-Goals:**
- No functional code changes in frontend/backend runtime.
- No API contract or database schema changes.
- No rework of OpenSpec historical artifacts.

## Decisions

1. Chinese-first documentation with English technical terms retained.
- Rationale: Chinese narrative improves readability for primary contributors, while keeping English terms (for example `ApiResponse<T>`, `QueryWrapper`, `lazy loading`) avoids translation ambiguity and preserves searchability.
- Alternative considered: Full Chinese translation of all terms. Rejected due to potential semantic drift and mismatch with source code naming.

2. README sectioned by user journey instead of only workspace commands.
- Rationale: A top-down structure (`项目概览 -> 架构与实现 -> 开发与运行 -> 部署与验证 -> 规范与流程`) reduces cognitive load and helps new contributors locate information by task intent.
- Alternative considered: Keep existing flat structure and append extra paragraphs. Rejected because discoverability remains weak.

3. Technical implementation plan is documentation-level and references concrete modules.
- Rationale: This provides actionable architecture guidance without introducing speculative design artifacts outside repository reality.
- Alternative considered: Embedding low-level pseudo-code. Rejected because README should stay stable, high-value, and maintainable.

## Risks / Trade-offs

- [Risk] README becomes too long and harder to scan.
  -> Mitigation: Use concise sectioning, short paragraphs, and command blocks with clear headings.

- [Risk] Terminology consistency drifts across future edits.
  -> Mitigation: Explicitly define Chinese narrative + English technical term rule in the document and reuse existing code identifiers.

- [Risk] Command examples become stale over time.
  -> Mitigation: Keep commands aligned with existing script conventions and recommend workspace-scoped execution paths.

## Migration Plan

1. Draft new README structure and content aligned to current project reality.
2. Validate all referenced commands and paths against existing repository layout.
3. Replace/refresh `README.md` in one coherent update.
4. Run lightweight verification (format, key command references, path correctness).
5. If quality regression is found, rollback by restoring previous README from git history.

## Open Questions

- None. The requested scope is clear: project summary + README rewrite with technical implementation plan, Chinese narrative, English professional terminology.
