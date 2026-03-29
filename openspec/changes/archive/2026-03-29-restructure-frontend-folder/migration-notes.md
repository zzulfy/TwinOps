# Frontend Migration Notes

## 1) Frontend Asset Inventory

Migrated to `frontend/`:

- Source and runtime: `src/`, `public/`, `index.html`
- Build and TypeScript config: `vite.config.ts`, `tsconfig*.json`, `.eslintrc.cjs`, `.env`
- Package management: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`
- Frontend verification scripts: `test-*.mjs/js`, `check-*.mjs/js/html`, `puppeteer-test.mjs`, `simple-check.js`, `capture-screenshot.mjs`, `fix-errors.js`
- Frontend docs/assets: `docs/`, `screenshots/`, frontend README

Not migrated:

- `openspec/` and repository metadata/config remain at repo root
- Existing generated image artifacts in repo root were kept as historical outputs

## 2) Path Mapping

- `src/*` -> `frontend/src/*`
- `public/*` -> `frontend/public/*`
- `index.html` -> `frontend/index.html`
- `package.json` -> `frontend/package.json`
- `vite.config.ts` -> `frontend/vite.config.ts`
- `tsconfig*.json` -> `frontend/tsconfig*.json`
- `test-*.mjs/js` -> `frontend/test-*.mjs/js`
- `check-*.mjs/js/html` -> `frontend/check-*.mjs/js/html`

## 3) Command and Pipeline Impact

Local command impact:

- Old: run frontend commands from repository root
- New: run frontend commands from `frontend/`

CI/CD impact:

- Set job `working-directory` to `frontend` for install/build/test steps
- Cache keys should include `frontend/package-lock.json` (or chosen lockfile)
- Update artifact paths if previously expected root-level `docs/`

## 4) Rollback Procedure

1. Create rollback branch from current migration commit.
2. Move frontend workspace contents back to repo root (inverse mapping above).
3. Remove `frontend/` after confirming all moved paths are restored.
4. Run validation:
   - `npm install`
   - `npm run build`
   - `npm run preview`
5. If validation passes, keep rollback branch and open emergency revert PR.

## 5) Rollback Verification Checklist

- Frontend commands execute from repo root again
- Static assets (models, textures, fonts, draco) load correctly
- Main scene and monitoring panels render
- Existing frontend scripts resolve paths without edits
