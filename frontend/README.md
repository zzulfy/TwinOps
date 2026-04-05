# TwinOps Frontend

Frontend workspace for the TwinOps data center digital twin application.

## Stack

- Vue 3 + TypeScript
- Vite
- Three.js
- ECharts
- GSAP and Tween.js

## Directory Overview

- src: application source code
- public: runtime static assets (models, textures, fonts, draco, favicon)
- docs: production build output
- screenshots: curated project screenshots
- test and check scripts: smoke and visual validation scripts

## Environment

- Node.js 20+
- npm 9+

## Install

npm install

## Local Development

npm run dev

Default dev port is configured by Vite. You can override host and port:

npm run dev -- --host 127.0.0.1 --port 8090 --strictPort

## Build and Preview

- npm run type-check
- npm run build
- npm run preview

### Chunking Notes

- Vendor dependencies are split by deterministic groups in `vite.config.ts`:
	- `vendor-vue`
	- `vendor-3d-core` (Three.js core, gsap, tween)
	- `vendor-3d-addons` (three/examples addon modules)
	- `vendor-charts-deferred` (ECharts)
	- `vendor-utils` (lodash, axios, mitt, autofit)
	- `vendor-misc`
- If bundle warnings appear, adjust grouping before raising `chunkSizeWarningLimit`.
- Optional bundle report can be enabled with:
	- Windows PowerShell: `$env:ANALYZE='true'; npm run build`
	- Bash: `ANALYZE=true npm run build`

### Deferred Loading Conventions

- Keep startup-critical path focused on shell render and base Three.js scene bootstrap.
- Defer chart runtime by loading ECharts inside `useEcharts` via dynamic import.
- Defer non-critical Three addons and model loaders (`three/examples`) until needed.
- For deferred module failures, keep shell interactive and show local fallback message instead of hard-failing the page.

## Dashboard Data Consistency Conventions

- `fetchDashboardSummary` uses shared in-flight fetch behavior to keep multiple summary consumers aligned on one snapshot.
- Dashboard shell supports automatic refresh + manual refresh with forced summary fetch, and displays the latest successful update timestamp.
- Summary consumers should react to shared refresh state, avoiding ad-hoc competing refresh flows.
- Auto refresh uses visibility-aware polling and skips duplicate in-flight requests.

## Admin Authentication and Protected Routes

- New route: `/login` for admin sign-in.
- Protected routes include `/`, `/devices`, `/devices/:deviceCode`, and `/analysis`.
- Unauthenticated navigation to protected pages redirects to `/login?redirect=<target>`.
- Login state uses backend-issued token and frontend local session storage.

## Analysis Center Module

- New route: `/analysis`.
- Features:
  - Read-only analysis report board (no manual submit form).
  - Render report list and report detail.
  - Report card headline emphasizes report `#id` and `createdAt` (large typography), without fixed `AGGREGATED` title.
  - Show `status`, `confidence`, `riskLevel`, `prediction`, and `recommendedAction`.
  - Surface explicit failed-state message when backend marks report as `failed`.
  - Report list is auto-refreshed in page-visible state and can still be manually refreshed by trigger flow.

## Alarm Workflow UX

- Alarm panel supports status tabs: `new`, `acknowledged`, `resolved`.
- Dashboard alarm panel is monitoring-only (basic alarm info + auto-scroll), no action buttons.
- Alarm panel always reads backend data and does not fallback to local mock items.
- Alarm row and status badge colors use high-contrast token combinations for dark cockpit readability.
- Status actions move to device list/detail operations:
  - `new` -> `acknowledged`
  - `acknowledged` -> `resolved`
- State transitions call `PATCH /api/alarms/{id}/status`, then trigger refreshed list snapshots.

## Device List + Watchlist UX

- `/devices` is list-first: keyword filter (`name` / `deviceCode`) + status filter (`normal` / `warning` / `error`).
- New focused route: `/devices/:deviceCode` for single-device detail rendering.
- Watchlist supports pin/unpin and persists through backend watchlist APIs.
- Both list and watchlist can navigate directly to focused detail page.

## Quality Commands

- npm run lint
- npm run format
- npm run lint:style
- npm run smoke:shell (requires a running app URL, defaults to `http://127.0.0.1:8090/`)
- npm run smoke:analysis-auto-refresh
- npm run smoke:alarm-real-data

## Smoke Check Examples

- node test-scene-status.mjs
- node test-popup.mjs
- node test-device-popup.mjs

## Asset Path Rules

Keep runtime assets in public and reference them with root-based paths:

- /models/...
- /textures/...
- /fonts/...
- /js/draco/...
- /favicon.png

## Design Token Conventions

- Shared tokens live in `src/assets/design-tokens.css`.
- Shell and layout components should consume tokens instead of hard-coded visual constants.
- Token categories:
	- Color and state (`--tw-color-*`, `--tw-state-*`)
	- Surface/background (`--tw-bg-*`)
	- Border/radius (`--tw-border-*`, `--tw-radius-*`)
	- Spacing/shadow (`--tw-space-*`, `--tw-shadow-*`)
- When introducing new visual primitives, add tokens first, then migrate component usage.
- Contrast policy:
  - deep background -> light text (`--tw-color-text-on-dark`)
  - light background -> deep text (`--tw-color-text-on-light`)

## Notes

Generated PNG screenshots from local test runs are ignored by repository .gitignore. Keep only curated screenshots under screenshots when needed for documentation.
