# TwinOps

TwinOps is a digital twin operations platform for data center monitoring and visualization.

## Repository Layout

- frontend: Vue 3 + Vite application, assets, scripts, and frontend docs
- openspec: change artifacts, specs, and process history
- .github/workflows/frontend-ci.yml: frontend build and type-check workflow

## Quick Start

1. Enter frontend workspace

   cd frontend

2. Install dependencies

   npm install

3. Start development server

   npm run dev

## Build and Preview

From frontend workspace:

- npm run type-check
- npm run build
- npm run preview

## Frontend Script Scope

All frontend scripts and smoke checks are maintained under frontend.
CI should run frontend jobs with working-directory set to frontend.

## OpenSpec Workflow

Common commands:

- /opsx:new
- /opsx:ff
- /opsx:apply
- /opsx:verify
- /opsx:archive

## Migration and Rollback

- Migration notes: openspec/changes/archive/2026-03-29-restructure-frontend-folder/migration-notes.md
- Rollback script: rollback-frontend.ps1

## Notes

Generated screenshot files from local visual tests are ignored by .gitignore at repository root and frontend root.
