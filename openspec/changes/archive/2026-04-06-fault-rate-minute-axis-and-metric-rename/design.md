## Context

Dashboard fault-rate visualization currently mixes two semantic issues: the metric wording is shown as "fault-rate change" while business intent is "fault rate", and the x-axis label may include date-level context that reduces minute-level scanability in operational usage. The module already supports minute monitoring and history scrolling, so this change should focus on semantic normalization and time-label formatting without introducing a new data pipeline.

## Goals / Non-Goals

**Goals:**
- Standardize chart metric semantics to "fault rate" across panel title, axis labels, legend, and tooltip text.
- Constrain x-axis labels to minute granularity display (`HH:mm`) with 1-minute ticks.
- Keep backend minute-series behavior and frontend history sliding interaction aligned with existing two-pane dashboard UX.

**Non-Goals:**
- Redesign forecasting algorithm or prediction horizon logic.
- Introduce new dashboard modules or change global layout structure.
- Change authentication, routing, or unrelated dashboard widgets.

## Decisions

1. **Keep the existing minute-series API shape, adjust semantics and formatting**
   - Reuse current trend endpoint and point structure to avoid breaking consumers.
   - Update textual semantics from "fault-rate change" to "fault rate" in API docs and frontend copy.
   - Alternative considered: create a brand-new endpoint for renamed metric. Rejected due to unnecessary contract duplication.

2. **Enforce `HH:mm` as chart display label**
   - Backend time formatting for trend labels remains minute-based but excludes month/day.
   - Frontend x-axis uses returned labels directly and keeps one-minute spacing semantics.
   - Alternative considered: let frontend slice timestamps dynamically. Rejected because central formatting in backend avoids inconsistent rendering across clients.

3. **Preserve history scrolling and monitoring cadence**
   - Keep current dataZoom interaction and refresh cadence; only adjust label semantics and axis meanings.
   - Alternative considered: replacing with paged history navigation. Rejected because slider behavior is already adopted by users.

## Risks / Trade-offs

- **[Risk] Existing snapshots/tests may still assert old wording ("变化率")** → **Mitigation**: update related tests and baseline expectations in the same change.
- **[Risk] Mixed old/new labels during deployment** → **Mitigation**: deploy backend and frontend changes together and document contract wording in README.
- **[Trade-off] Backend-formatted `HH:mm` can lose day boundary context** → **Mitigation**: accepted by requirement; operational panel prioritizes short-window minute monitoring over date context.

