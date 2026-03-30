## 1. Baseline and Target Definition

- [x] 1.1 Capture current build chunk output and identify startup-critical vs deferrable heavy modules.
- [x] 1.2 Define target defer-loading boundaries for chart-heavy and non-critical 3D feature modules.

## 2. Runtime Defer-Loading Implementation

- [x] 2.1 Refactor chart-heavy surfaces to use dynamic import boundaries outside startup-critical path.
- [x] 2.2 Refactor non-critical 3D feature modules to load lazily while keeping scene bootstrap eager.
- [x] 2.3 Add graceful fallback behavior for deferred import failure states.

## 3. Build Strategy Alignment

- [x] 3.1 Update `frontend/vite.config.ts` chunk grouping to align with defer-loading boundaries.
- [x] 3.2 Rebuild and compare chunk warnings against previous baseline.

## 4. Validation and Documentation

- [x] 4.1 Add or standardize a non-interactive smoke command for desktop/mobile shell readiness.
- [x] 4.2 Run build + smoke checks and record residual warning debt.
- [x] 4.3 Update `frontend/README.md` with deferred-loading and validation conventions.

## Validation Notes

- Baseline build (before apply):
	- `vendor-3d`: 603.87 kB
	- `vendor-charts`: 1,042.24 kB
	- Warnings: 2 chunks > 500 kB
- Final build (after apply):
	- `vendor-3d-core`: 519.12 kB
	- `vendor-3d-addons`: 86.37 kB
	- `vendor-charts-deferred`: 500.21 kB
	- Warnings: 2 chunks > 500 kB (debt reduced in size, still present)
- Runtime smoke:
	- `npm run smoke:shell` passed for desktop and mobile shell readiness.
