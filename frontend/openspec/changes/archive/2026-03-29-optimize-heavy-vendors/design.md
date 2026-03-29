## Context

The previous optimization split a monolithic vendor chunk into deterministic groups, but heavy `vendor-3d` and `vendor-charts` chunks still exceed warning thresholds. The next step is to reduce startup-critical execution cost by introducing defer-loading boundaries while preserving shell and scene bootstrap reliability.

## Goals / Non-Goals

**Goals:**
- Reduce startup-critical module load by deferring chart-heavy and non-critical 3D modules.
- Keep deterministic chunk strategy aligned with runtime defer boundaries.
- Improve validation quality with reproducible smoke evidence and explicit warning debt recording.

**Non-Goals:**
- Full route architecture rewrite.
- Replacing chart or 3D libraries.
- Eliminating all chunk warnings in one iteration regardless of startup impact.

## Decisions

### Decision 1: Prefer defer-loading boundaries over deeper static chunk over-segmentation
- Rationale: Defer-loading directly reduces startup execution path, while pure static splitting can still eagerly load heavy code.
- Alternative: further static `manualChunks` refinement only.
- Why not now: does not guarantee startup path reduction without runtime boundary changes.

### Decision 2: Keep scene bootstrap eager, defer optional 3D feature surfaces
- Rationale: protects core scene startup correctness while reducing non-critical cost.
- Alternative: defer all 3D imports.
- Why not now: high regression risk for default scene initialization.

### Decision 3: Standardize smoke checks in non-interactive mode
- Rationale: makes validation reproducible in CI and local automation.
- Alternative: manual browser checks only.
- Why not now: weak traceability and higher false confidence in change quality.

## Risks / Trade-offs

- [Risk] Deferred imports may produce delayed first interaction on secondary panels.
  - Mitigation: preload on idle or on panel hover/open events for high-frequency surfaces.
- [Risk] Incorrect defer boundary can break startup dependency order.
  - Mitigation: retain explicit eager imports for bootstrap-critical scene flow and verify with smoke checks.
- [Risk] Chunk warning metrics may remain high for true heavy libs.
  - Mitigation: track trend delta and startup impact rather than absolute warning removal.

## Migration Plan

1. Identify heavy initialization points in chart and non-critical 3D feature code.
2. Introduce dynamic import boundaries for selected modules.
3. Align `vite.config.ts` chunk groups with defer boundaries.
4. Add reproducible smoke command(s) for desktop/mobile shell readiness.
5. Run build + smoke, record warning trend and residual debt.

Rollback strategy:
- Revert deferred import boundaries and related chunk config in one commit.
- Keep previous deterministic split as safe baseline.

## Open Questions

- Which panel-level modules provide best startup gain per regression risk?
- Should idle-preload be enabled by default for deferred chart modules?
- What threshold should trigger next iteration after this defer-loading pass?
