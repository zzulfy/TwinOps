## ADDED Requirements

### Requirement: Alarm panel scroll animation SHALL be smooth and non-jittering
The alarm panel auto-scroll behavior MUST use a low-layout-cost animation strategy and MUST avoid visible jitter during continuous rotation.

#### Scenario: Alarm list performs one smooth scroll cycle
- **WHEN** the alarm panel has one or more records and enters an auto-scroll tick
- **THEN** list movement is rendered with transform-based animation instead of layout-offset animation
- **AND** the animation completes without abrupt jump or flicker

#### Scenario: Scroll cycle avoids re-entrant animation
- **WHEN** a new scroll tick arrives before the current animation cycle finishes
- **THEN** frontend ignores or coalesces the overlapping tick
- **AND** only one active scroll animation runs at a time

### Requirement: Alarm panel list rotation SHALL preserve data-display consistency
Alarm row rotation MUST keep row order changes synchronized with animation completion so users do not observe mid-animation content swap.

#### Scenario: Rotation happens after visual motion completion
- **WHEN** one auto-scroll cycle completes
- **THEN** frontend applies queue rotation after the animation phase ends
- **AND** the next frame starts from a stable visual baseline
