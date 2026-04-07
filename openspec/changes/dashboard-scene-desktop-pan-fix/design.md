## Context

Dashboard simulation currently uses OrbitControls for manual camera interaction, but desktop panning is reported as unavailable in real usage.  
The scene already supports rotate/zoom and manual-only movement policy, so this change focuses on desktop pan interaction reliability without altering other dashboard modules.

## Goals / Non-Goals

**Goals:**
- Ensure desktop users can pan (translate) the simulation camera with mouse input.
- Preserve existing rotate/zoom behavior and keep automatic camera motion disabled.
- Keep implementation localized to scene control configuration and related interaction docs.

**Non-Goals:**
- No backend or API changes.
- No redesign of model assets, scene layout, or dashboard panel composition.
- No mobile gesture redesign beyond preserving existing behavior.

## Decisions

1. **Explicitly define OrbitControls desktop mouse bindings for pan/rotate.**  
   Instead of relying on defaults, set deterministic mouse button mapping so desktop pan input is not lost under environment differences.

2. **Keep pan enabled with existing damping/manual policy.**  
   Maintain current manual scene paradigm: no auto movement, continuous render loop, user-driven camera updates only.

3. **Scope fix to `useDashboardScene` and docs.**  
   Avoid cross-module coupling; only scene hook control config and README interaction notes are adjusted.

## Risks / Trade-offs

- **[Risk]** Desktop pan mapping may conflict with users’ rotate muscle memory.  
  **Mitigation:** Keep a common interaction scheme (left rotate, right pan, wheel zoom) and document it clearly.

- **[Risk]** Different input devices (trackpad/mouse) can behave inconsistently.  
  **Mitigation:** Validate behavior under typical desktop browser input paths and keep controls fallback-safe.
