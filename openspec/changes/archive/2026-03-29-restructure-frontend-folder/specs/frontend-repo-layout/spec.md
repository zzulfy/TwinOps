## ADDED Requirements

### Requirement: Frontend workspace boundary
The repository SHALL contain a dedicated frontend workspace directory that owns all frontend runtime and build assets.

#### Scenario: Frontend assets are colocated
- **WHEN** the repository structure is inspected after migration
- **THEN** frontend source code, static assets, HTML entry, and frontend build configuration are located under the frontend workspace

### Requirement: Frontend script locality
The system SHALL provide frontend development and build commands that execute from the frontend workspace without requiring path patching in daily use.

#### Scenario: Local development command works in frontend workspace
- **WHEN** a developer runs the frontend development command from the frontend workspace
- **THEN** the dev server starts successfully and serves the application

### Requirement: Frontend test and check script locality
The repository SHALL place frontend-oriented validation scripts in the frontend workspace so they run against migrated paths.

#### Scenario: Frontend checks resolve migrated paths
- **WHEN** frontend check or smoke scripts are executed after migration
- **THEN** script path resolution succeeds without referencing removed root-level frontend paths
