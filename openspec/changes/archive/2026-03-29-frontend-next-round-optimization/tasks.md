## 1. Build and Chunk Optimization

- [x] 1.1 Analyze current production chunk output and identify heavy dependency groups.
- [x] 1.2 Update `frontend/vite.config.ts` with deterministic manual chunk strategy.
- [x] 1.3 Rebuild and verify chunk warning output is improved and explain remaining warnings.

## 2. Design Token Foundation

- [x] 2.1 Create shared token definitions (color, spacing, radius, border, shadow, state).
- [x] 2.2 Integrate token source into global style entry used by app shell.
- [x] 2.3 Replace duplicated shell-level visual constants with token references.

## 3. Target Component Migration

- [x] 3.1 Refactor `frontend/src/App.vue` to consume shared tokens for shell/background layers.
- [x] 3.2 Refactor `frontend/src/components/LayoutPanel.vue` to consume shared tokens.
- [x] 3.3 Refactor `frontend/src/components/LayoutHeader.vue` and `frontend/src/components/LayoutFooter.vue` to consume shared tokens.

## 4. Validation and Documentation

- [x] 4.1 Run production build and record optimization outcome.
- [x] 4.2 Perform runtime smoke checks for startup rendering and key panel visibility on desktop/mobile sizes.
- [x] 4.3 Update `frontend/README.md` with chunking and token maintenance guidance.

## Validation Notes

- Baseline build before optimization: single `vendor` chunk at ~1793 kB.
- Build after optimization:
	- `vendor-vue` ~61.58 kB
	- `vendor-utils` ~75.86 kB
	- `vendor-3d` ~603.87 kB
	- `vendor-charts` ~1042.24 kB
	- `vendor-misc` ~0.47 kB
- Remaining warnings are concentrated in `vendor-3d` and `vendor-charts`, which are expected due to heavy static dependencies (`three`, `echarts`).
- Runtime smoke checks passed:
	- resource accessibility via `node simple-check.js`
	- desktop/mobile shell selector checks via headless Puppeteer on `127.0.0.1:8090`
