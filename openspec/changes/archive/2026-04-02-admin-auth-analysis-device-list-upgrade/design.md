## Context

TwinOps currently exposes operational dashboard and device pages without identity boundaries, which is insufficient for enterprise administration requirements. The product also lacks built-in algorithm analysis capabilities and still relies on aggregate device-detail rendering that becomes hard to navigate at scale.

This change introduces a unified upgrade across frontend and backend: admin-only authentication, AI analysis module (LLM-assisted prediction), and a list-first device experience with watchlist navigation into focused detail pages. Because this affects routing, API contracts, backend modules, data persistence, and UX interaction flow, a cross-cutting design is required.

## Goals / Non-Goals

**Goals:**
- Add admin authentication with protected frontend routes and backend identity endpoints.
- Add backend analysis module for metric prediction and frontend analysis center UI.
- Replace bulky aggregate-only device detail experience with searchable list, watchlist-style quick access, and focused per-device detail navigation.
- Preserve compatibility of existing dashboard/device/alarm flows where unchanged.

**Non-Goals:**
- No multi-role RBAC matrix in this phase (admin-only first).
- No broad UI redesign outside modules touched by auth, analysis, and device navigation.
- No mandatory replacement of existing telemetry storage model.

## Decisions

1. Admin-first auth scope with session/JWT-compatible boundary.
- Rationale: smallest secure slice that satisfies access-control requirement with low rollout complexity.
- Alternative considered: full role/permission system initially. Rejected due to higher complexity and slower delivery.

2. Analysis module as backend domain (`analysis`) with persisted reports.
- Rationale: analysis outcomes should be auditable and reusable, not transient frontend-only computations.
- Alternative considered: frontend direct LLM calls. Rejected for security, key exposure, and reliability concerns.

3. LLM integration via provider adapter and async-safe execution path.
- Rationale: isolates vendor dependency and reduces blast radius on timeout/failure.
- Alternative considered: synchronous in-request LLM invocation for every dashboard load. Rejected due to stability risk.

4. Device UX split into list page + detail page by deviceCode route.
- Rationale: list-first navigation scales better and aligns with admin workflows.
- Alternative considered: continue rendering all detail cards in one page with only local filters. Rejected for poor scalability/readability.

5. Watchlist as lightweight admin-to-device relation.
- Rationale: fast path for high-priority devices without changing core device master model.
- Alternative considered: no persistence, localStorage-only favorites. Rejected due to cross-session inconsistency.

## Risks / Trade-offs

- [Risk] Auth rollout may break existing direct route access.  
  -> Mitigation: explicit allowlist for login route and stable redirect fallback.

- [Risk] LLM provider instability may impact analysis UX.  
  -> Mitigation: timeout/retry policies, graceful fallback status, and cached latest successful report.

- [Risk] New route model (`/devices/:deviceCode`) may introduce navigation drift.  
  -> Mitigation: preserve `/devices` as list entry point and enforce route guards with robust fallback.

- [Risk] Single change scope is broad and regression-prone.  
  -> Mitigation: strict task sequencing (auth -> analysis backend -> analysis frontend -> device UX), plus full repo checks before completion.

## Migration Plan

1. Introduce backend auth and analysis modules with DTOs, services, controllers, and persistence entities/mappers.
2. Add frontend login page, auth state handling, and protected-route guards.
3. Add analysis center frontend page and API wiring to analysis endpoints.
4. Refactor device page into searchable list + watchlist + detail route flow.
5. Update docs (`README.md`, `frontend/README.md`, `backend/README.md`) for new modules and runbook.
6. Validate via existing frontend build/type-check and backend tests.
7. Rollback path: feature-flag route guards and revert new module routes if critical regression appears.

## Open Questions

- LLM provider selection and deployment mode (cloud API vs self-hosted model endpoint) needs final environment decision.
- Admin credential bootstrap strategy (seeded admin user vs first-run initialization) needs ops confirmation.
