# fullstack-startup-script Specification

## Purpose
TBD - created by archiving change add-frontend-backend-startup-script. Update Purpose after archive.
## Requirements
### Requirement: Single command starts frontend and backend local workflows
The repository SHALL provide a single startup entrypoint that starts both frontend and backend local development workflows in one invocation.

#### Scenario: Developer runs startup entrypoint
- **WHEN** a developer executes the startup script from the repository root
- **THEN** the script runs both frontend and backend startup workflows without requiring separate manual terminal setup

### Requirement: Frontend workflow command order is deterministic
The startup script SHALL execute the frontend workflow commands in this exact order: `npm install`, then `npm run build`, then `npm run dev`.

#### Scenario: Frontend workflow execution
- **WHEN** the startup script executes the frontend workflow
- **THEN** `npm install` completes before `npm run build` starts
- **AND** `npm run build` completes before `npm run dev` starts

### Requirement: Backend workflow is built and started with redirected logs
The startup script SHALL execute backend packaging with `mvn -DskipTests package` from `backend/`, then start `target/backend-0.0.1-SNAPSHOT.jar` with stdout/stderr redirected to `backend.log` in the backend directory.

#### Scenario: Backend workflow execution
- **WHEN** the startup script executes the backend workflow
- **THEN** the script runs Maven package in `backend/`
- **AND** the backend jar process writes runtime output to `backend/backend.log`

### Requirement: Startup process fails fast on command errors
The startup script SHALL stop execution and return a non-success exit when any required startup command fails.

#### Scenario: Command failure during startup
- **WHEN** any required frontend or backend startup command exits with failure
- **THEN** the script exits as failed
- **AND** the script does not silently continue remaining required steps

