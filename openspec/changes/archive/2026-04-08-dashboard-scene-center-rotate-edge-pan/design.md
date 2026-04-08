## Context

Dashboard simulation interaction recently introduced manual pan/rotate updates, but user feedback requires a more natural single-button behavior model.  
On desktop, operators expect left-button drag to do different actions by interaction zone: center for rotate and edge for pan.

## Goals / Non-Goals

**Goals:**
- Implement zone-based left-drag behavior on desktop simulation canvas.
- Keep wheel zoom and manual-only camera control policy unchanged.
- Keep changes scoped to scene interaction logic and documentation.

**Non-Goals:**
- No backend or API changes.
- No model/asset changes.
- No redesign of panel layout or non-scene interactions.

## Decisions

1. **Use canvas-relative zone detection per pointer-down.**  
   Determine whether the pointer starts in center or edge region, then assign current drag intent (rotate vs pan) for that drag lifecycle.

2. **Use OrbitControls dynamic mouse mapping for active gesture.**  
   Set left-button mapping to rotate for center starts and pan for edge starts before drag proceeds, then reset to default center behavior on pointer-up.

3. **Define edge band with percentage threshold.**  
   Use a configurable edge width ratio (e.g., 20%) on all four sides to distinguish edge zone consistently across resolutions.

## Risks / Trade-offs

- **[Risk]** Zone threshold too wide can reduce rotate area.  
  **Mitigation:** Use conservative default threshold and document behavior.

- **[Risk]** Rapid pointer transitions during drag could feel inconsistent.  
  **Mitigation:** Lock interaction mode at pointer-down until pointer-up.
