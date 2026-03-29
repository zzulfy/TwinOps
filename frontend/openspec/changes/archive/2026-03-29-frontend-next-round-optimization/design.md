## Context

The frontend has already been migrated into a dedicated workspace and recently received a visual refresh. Remaining optimization targets are currently fragmented: bundle size warnings are still present, and visual consistency depends on repeated local style values instead of a shared token contract.

## Goals / Non-Goals

**Goals:**
- Reduce first-load bundle pressure by introducing deterministic chunking rules.
- Introduce a small but enforceable design token layer for shared visual language.
- Migrate high-impact layout components to consume tokenized styles.
- Establish an explicit validation checklist for build, runtime smoke, and docs sync.

**Non-Goals:**
- Full design-system rebuild across all feature components.
- Runtime theming engine or dark/light mode framework.
- Comprehensive performance budget tooling in CI for this iteration.

## Decisions

### Decision 1: Use manual chunk segmentation in Vite as the first optimization layer
- Rationale: Lowest-risk path with immediate impact on monolithic vendor output.
- Alternative considered: aggressive lazy-loading refactor across route and feature boundaries.
- Why not now: larger behavioral risk and broader test scope than current iteration allows.

### Decision 2: Introduce CSS variable based token contract in frontend source
- Rationale: Keeps token usage framework-native, transparent, and easy to audit.
- Alternative considered: introducing a dedicated token build pipeline.
- Why not now: adds toolchain complexity before token model is stable.

### Decision 3: Prioritize token migration for shell components first
- Rationale: App shell and panel components define most of the recurring visual language.
- Alternative considered: component-by-component migration in functional widgets first.
- Why not now: would produce fragmented style consistency with less visible impact.

### Decision 4: Gate completion on build + smoke + docs checklist
- Rationale: Prevents cosmetic-only completion while performance or docs regress.
- Alternative considered: build-only gate.
- Why not now: build pass alone does not cover visual consistency or usage guidance.

## Risks / Trade-offs

- [Risk] Over-segmentation may increase request overhead on weak networks.
  - Mitigation: keep chunk groups coarse and monitor resulting chunk graph.
- [Risk] Token migration may introduce subtle contrast or spacing regressions.
  - Mitigation: validate key screens at desktop and mobile breakpoints before completion.
- [Risk] Partial token adoption can create hybrid style debt.
  - Mitigation: explicitly scope migrated components and document remaining debt.

## Migration Plan

1. Define initial chunk grouping in `frontend/vite.config.ts` and validate build output.
2. Add token definitions under shared frontend styles and wire into app shell styles.
3. Refactor target components (`App`, `LayoutPanel`, `LayoutHeader`, `LayoutFooter`) to consume tokens.
4. Execute validation checklist: build, runtime smoke, visual inspection, docs alignment.
5. Update `frontend/README.md` with optimization and token maintenance notes.

Rollback strategy:
- Revert chunk rules and token adoption in one commit if runtime regressions are detected.
- Preserve pre-optimization style constants in git history for quick restoration.

## Open Questions

- Should chunk sizing warnings become CI-failing thresholds in the next iteration?
- Which second-wave components should be prioritized for token migration after shell completion?
- Do we need a dedicated token naming convention guide beyond inline README notes?
