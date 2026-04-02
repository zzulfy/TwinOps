## Context

TwinOps frontend currently provides dashboard visualization and aggregate device browsing, but operational workflows are still missing several stability-friendly capabilities: alarm status lifecycle handling in UI, coordinated dashboard summary refresh behavior, and device-page search/filter controls. Backend API support for alarm status update already exists, which enables a low-risk frontend-first enhancement path.

This change spans multiple frontend surfaces (`WidgetPanel06`, dashboard summary consumers, device detail page, API utility layer, and header controls) and requires coordinated documentation updates. A design artifact is required to keep behavior consistent and avoid regressions.

## Goals / Non-Goals

**Goals:**
- Add alarm workflow interactions (status filter + acknowledged/resolved actions) using existing backend endpoints.
- Ensure dashboard summary data is fetched from a shared source with manual refresh and visible last-update timestamp.
- Add search and status filtering for aggregate device cards on `/devices`.
- Keep implementation incremental and stability-first with no API contract breakage.

**Non-Goals:**
- No backend schema or new backend endpoint introduction.
- No performance re-architecture (no bundle strategy or lazy-loading redesign in this change).
- No route model changes (`/` and `/devices` remain as is).

## Decisions

1. Reuse existing alarm APIs and enforce frontend-side status typing.
- Rationale: avoids backend churn and keeps risk low.
- Alternative: redesign alarm domain API. Rejected as unnecessary for requested capability set.

2. Introduce shared dashboard summary fetch semantics in API layer.
- Rationale: prevents inconsistent panel snapshots from duplicate concurrent calls.
- Alternative: each widget keeps isolated fetch calls. Rejected due to data skew risk.

3. Implement device search/filter as client-side view-state over fetched aggregate data.
- Rationale: no API expansion needed; predictable and low risk.
- Alternative: server-side query/filter API expansion. Rejected for this stability-first batch.

4. Update docs in same change.
- Rationale: avoids feature/documentation drift and supports operations handoff.
- Alternative: deferred docs update. Rejected due to user requirement for timely documentation.

## Risks / Trade-offs

- [Risk] Alarm state actions may create transient UI mismatch after update.  
  -> Mitigation: optimistic-safe update pattern with explicit error rollback messaging.

- [Risk] Shared summary cache can present stale data if refresh path is unclear.  
  -> Mitigation: provide explicit manual refresh action and visible last-update timestamp.

- [Risk] Device filtering could hide expected cards if default state is wrong.  
  -> Mitigation: keep default as unfiltered all-device list and make filters explicit/resettable.

## Migration Plan

1. Add/extend API utility functions and typed status constants.
2. Implement alarm filter + status actions in alarm panel.
3. Implement shared dashboard summary refresh and timestamp display.
4. Implement device page search/status filtering while preserving existing route behavior.
5. Update README/frontend/backend docs with usage and verification notes.
6. Validate with existing frontend/backend test/build commands.

## Open Questions

- None blocking. Scope aligns with existing API capabilities and established frontend patterns.
