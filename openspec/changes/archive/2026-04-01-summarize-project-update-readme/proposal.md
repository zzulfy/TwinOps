## Why

Current `README.md` is mainly command-oriented and lacks a complete project-level narrative plus a clear technical implementation plan section. The team needs a Chinese-first, engineering-grade document that improves onboarding efficiency while preserving technical terminology in English for precision and cross-team consistency.

## What Changes

- Add a full-project summary section in Chinese, covering architecture, domain boundaries, runtime flow, and key conventions.
- Restructure README information architecture into clearer sections for onboarding, development, deployment, and operations.
- Add a dedicated technical implementation plan section that explains architecture decisions, module responsibilities, and implementation strategy.
- Standardize wording style: explanatory content in Chinese; professional technical terms remain in English (for example: API, DTO, QueryWrapper, lazy loading, manual chunking).
- Update quick-start and verification guidance so readers can perform local setup and end-to-end validation with less ambiguity.

## Capabilities

### New Capabilities
- `readme-documentation-overhaul`: Define requirements for a Chinese README rewrite with full-project summary, technical implementation plan, and English-preserved technical terminology.

### Modified Capabilities
- None.

## Impact

- Affected code: `README.md` (primary), potentially references to `frontend/`, `backend/`, and `openspec/` paths.
- APIs/systems: No runtime API or backend behavior changes; documentation-only change.
- Dependencies: No new package/runtime dependency introduced.
- Process impact: Improves contributor onboarding, handoff quality, and release documentation consistency.
