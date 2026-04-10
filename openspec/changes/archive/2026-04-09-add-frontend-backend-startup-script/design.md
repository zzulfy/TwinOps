## Context

Local startup currently requires developers to manually run multiple commands across repository root and `backend/`, and keep process ordering correct. The workflow is repetitive and failure-prone, especially when quickly switching between coding and debugging.

This change introduces a single startup entrypoint that executes the exact frontend/backend command sequence requested for local development.

## Goals / Non-Goals

**Goals:**
- Provide one command to start both frontend and backend from the project root.
- Preserve requested command order and behavior:
  - Frontend: `npm install` -> `npm run build` -> `npm run dev`
  - Backend: `cd backend` -> `mvn -DskipTests package` -> `java -jar target/backend-0.0.1-SNAPSHOT.jar > backend.log 2>&1`
- Keep backend running in background while frontend dev server runs in foreground.
- Make backend log location explicit and stable (`backend/backend.log`).

**Non-Goals:**
- Process supervision for production deployment.
- Replacing Docker/systemd/CI startup flows.
- Full cross-platform parity for non-PowerShell environments in this change.

## Decisions

1. **Use a PowerShell startup script as the primary entrypoint**
   - Decision: implement one repository-level PowerShell script to orchestrate startup.
   - Rationale: repository work is executed in PowerShell; native process control and redirection are reliable in this environment.
   - Alternative considered: bash script; rejected for lower reliability in the current Windows-first developer environment.

2. **Run backend in a detached process and keep frontend in foreground**
   - Decision: backend build and jar launch run first, jar process is detached with stdout/stderr redirected to `backend/backend.log`; frontend install/build/dev then runs in current terminal.
   - Rationale: user can monitor frontend dev logs interactively while backend remains available.
   - Alternative considered: run both in background; rejected due to poor visibility/debuggability for frontend errors.

3. **Fail-fast behavior for command errors**
   - Decision: script stops on build/start failures before moving to dependent steps.
   - Rationale: avoids partial startup states where frontend is running but backend failed (or vice versa).
   - Alternative considered: continue-on-error; rejected because it hides root causes and wastes debugging time.

4. **Document lifecycle expectations**
   - Decision: script output must show where backend log is written and the backend process identifier.
   - Rationale: detached backend requires explicit visibility for stop/troubleshooting actions.
   - Alternative considered: no lifecycle hints; rejected because it increases cleanup friction.

## Risks / Trade-offs

- **[Risk] `npm install` and Maven package on every run can be slow** -> Mitigation: keep behavior as requested now; add optional fast-path flags in a later change if needed.
- **[Risk] Detached backend process can remain alive after terminal closes** -> Mitigation: print PID and log path so developers can stop it explicitly.
- **[Risk] Fixed jar name assumption (`backend-0.0.1-SNAPSHOT.jar`)** -> Mitigation: fail with clear message when jar is missing.

## Migration Plan

1. Add startup script under repository root (or documented scripts directory) and wire command sequence.
2. Update README with usage, backend log location, and process-stop guidance.
3. Validate on a clean local run that frontend and backend are both reachable.
4. Rollback strategy: remove the startup script and README section if issues are found.

## Open Questions

- Should a companion stop script be included in this change or deferred to a follow-up change?
- Should this script be wrapped by an npm command (for example `npm run dev:all`) in addition to direct PowerShell execution?
