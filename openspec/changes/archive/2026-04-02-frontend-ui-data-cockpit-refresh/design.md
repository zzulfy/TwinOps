## Context

TwinOps frontend has completed its white-first shell transition, but current visual language still reads as a generic light dashboard rather than an operations-grade Data Cockpit. The requested change focuses on UI appearance only: stronger contrast, clearer hierarchy, and cockpit-style consistency across shell and device-detail experiences, while preserving current interactions, routes, data contracts, and performance strategy.

This is a cross-cutting frontend design change because it touches shared design tokens plus multiple shell/page components (`LayoutHeader`, `LayoutPanel`, `DashboardPage`, `DeviceDetailPage`). A formal design artifact is needed to keep visual decisions coherent and prevent one-off styling drift.

## Goals / Non-Goals

**Goals:**
- Establish a Data Cockpit visual system with high-contrast surfaces, clearer depth, and focused status accents.
- Keep style primitives centralized in `design-tokens.css` so component updates remain consistent and maintainable.
- Improve readability and scanability in header zones, panel containers, CTA controls, and status messages.
- Maintain functional behavior unchanged (same navigation flow, same data rendering flow, same API consumption).

**Non-Goals:**
- No performance optimization (no lazy-loading strategy change, no bundle optimization changes).
- No frontend business logic or API contract changes.
- No backend or database modifications.

## Decisions

1. Use token-first cockpit theming.
- Rationale: updating token variables first allows safe visual rollout across components without introducing divergent hard-coded colors.
- Alternative considered: directly restyle each component in isolation. Rejected because it increases inconsistency and future maintenance cost.

2. Apply shell-level redesign in the order: tokens -> shared shell components -> page-level containers.
- Rationale: this order minimizes rework and keeps dependent visuals aligned.
- Alternative considered: page-first restyling and token patching later. Rejected due to likely regressions and duplicate overrides.

3. Preserve interaction and information architecture while changing only visual expression.
- Rationale: user request explicitly prioritizes UI appearance and excludes performance/behavior optimization.
- Alternative considered: combine with interaction and layout logic changes. Rejected as out-of-scope and higher-risk.

4. Reuse existing semantic conventions for status colors and typography hierarchy.
- Rationale: maintain continuity in operational meaning (`normal/warning/error`) while improving visual prominence.
- Alternative considered: introducing new semantic states and remapping logic. Rejected because it affects behavior/contract expectations.

## Risks / Trade-offs

- [Risk] Contrast increase may make some blocks visually heavy.  
  -> Mitigation: use layered surfaces and restrained glow accents instead of full-surface saturation.

- [Risk] Legacy component-local styles may conflict with new tokens.  
  -> Mitigation: prioritize token references and remove/override isolated hard-coded values where necessary.

- [Risk] Responsive layouts may show clipping after denser visual framing.  
  -> Mitigation: run desktop and narrow-width verification for header, panel spacing, and card wrapping.

- [Risk] Visual changes can be perceived as instability if too abrupt.  
  -> Mitigation: keep structural layout stable and retain familiar component placement.

## Migration Plan

1. Update `design-tokens.css` with Data Cockpit palette/shadow/border values while retaining variable naming compatibility.
2. Restyle `LayoutHeader.vue` and `LayoutPanel.vue` to establish cockpit shell baseline.
3. Restyle `DashboardPage.vue` and `DeviceDetailPage.vue` containers, CTA buttons, and status-message blocks to align with shell baseline.
4. Validate with existing frontend checks (`npm run type-check`, `npm run build`) and manual UI pass.
5. Rollback strategy: revert changed frontend style files if visual regression blocks release.

## Open Questions

- None at this stage. Scope and style direction are confirmed as "Data Cockpit UI refresh, appearance-only."
