## Context

The current frontend is a single-page dashboard with modal-first device detail interaction. The visual system recently moved to a dark/noir presentation and uses shared design tokens. The new direction requires white-dominant board presentation and route-level separation for device details, while preserving the existing 3D scene interaction model and panel data flows.

## Goals / Non-Goals

**Goals:**
- Introduce a white-first dashboard shell that remains readable for dense operational data.
- Introduce route-based device detail access from both a dashboard button and device label interactions.
- Keep existing operational data widgets and 3D scene behavior functional during visual restructuring.
- Preserve semantic status signals and shared animation rhythm under the updated visual language.

**Non-Goals:**
- Rebuild domain data generation logic for devices and alarms.
- Change Three.js model loading architecture or deferred bundle strategy.
- Introduce backend APIs; device details remain frontend-driven in this change.

## Decisions

### Decision 1: Split view by route instead of modal layering
- Choice: Add explicit page-level navigation for device details and remove modal-first dependency on the dashboard page.
- Rationale: Detail-heavy interactions are easier to scan, bookmark, and revisit in a dedicated route than in transient overlays.
- Alternatives considered:
  - Keep modal and add tabs: rejected due to limited spatial hierarchy and repeated context switching.
  - Open external window: rejected due to poor state continuity and mobile responsiveness risk.

### Decision 2: Keep dashboard as operational overview and add explicit detail entry points
- Choice: Keep main page focused on overview metrics and 3D situational awareness, with a clear "view device details" action and label click navigation.
- Rationale: Separates monitoring from investigation while reducing clutter on the board.
- Alternatives considered:
  - Auto-redirect on every label click without dashboard button: rejected because explicit global entry improves discoverability.

### Decision 3: Extend token contract for white-first shell rather than hard-coded restyle
- Choice: Evolve token requirements to support white-dominant surfaces, neutral borders, and consistent semantic status colors.
- Rationale: Keeps current tokenized architecture maintainable and allows theme-level adjustment without repeated component edits.
- Alternatives considered:
  - Hard-code white styles per component: rejected due to high regression and duplication risk.

### Decision 4: Pass selected device context through route query/state-safe fallback
- Choice: Route navigation carries selected device identifier and display name, with fallback generation if detailed payload is absent.
- Rationale: Supports deep links and resilient navigation even from different entry points.
- Alternatives considered:
  - Global singleton state only: rejected because direct link/share and refresh behavior become fragile.

## Risks / Trade-offs

- [Risk] White-first dashboard may reduce contrast for dense telemetry widgets. → Mitigation: enforce contrast checks and keep semantic accent constraints in token requirements.
- [Risk] Route transition could break existing event-bus based detail interactions. → Mitigation: replace event handlers incrementally and verify both button and label flows.
- [Risk] Device detail data may be inconsistent when opened without prior dashboard context. → Mitigation: define required route params and default fallback data generation strategy.
- [Trade-off] Additional routing structure increases page architecture complexity. → Mitigation: keep route surface minimal (overview + detail) and reuse existing components where possible.

## Migration Plan

1. Introduce route skeleton for dashboard and device detail views.
2. Move detail rendering concerns from modal binding to dedicated page composition.
3. Add dashboard entry button and wire label click navigation with selected device context.
4. Apply white-first tokens/shell styles and validate responsive readability.
5. Remove obsolete modal-only integration points after route flow is stable.

Rollback strategy:
- Keep modal code path isolated during transition; if regression appears, route entry can temporarily redirect to dashboard with modal fallback enabled.

## Open Questions

- Should the white dashboard be the default-only mode or support a future runtime theme toggle?
- What minimum device fields must be guaranteed in route context for deep-link entry?
- Should the detail page include list + detail split layout now, or keep single-device focus for this iteration?
