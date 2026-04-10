## Why

Starting TwinOps locally currently requires running multiple commands in a strict order across frontend and backend, which is error-prone and slows onboarding/debugging. A single startup script is needed now to provide a repeatable local start flow.

## What Changes

- Add a repository-level startup script to orchestrate frontend and backend startup in one command.
- Frontend startup flow in script: `npm install` -> `npm run build` -> `npm run dev`.
- Backend startup flow in script: build backend with Maven, then run jar with output redirected to `backend.log`.
- Ensure script behavior is documented for local developers.

## Capabilities

### New Capabilities
- `fullstack-startup-script`: provide one-command local startup orchestration for frontend and backend with defined command order and logging behavior.

### Modified Capabilities
- None.

## Impact

- Affected code: repository root startup script(s), optional helper script(s), and documentation updates.
- Affected systems: local developer workflow for frontend/backend startup.
- Dependencies: existing Node/npm and Maven/JDK toolchain only (no new runtime dependency expected).
