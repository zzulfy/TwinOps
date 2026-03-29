## ADDED Requirements

### Requirement: Build and preview continuity
The migrated frontend SHALL preserve successful build and preview flows equivalent to pre-migration behavior.

#### Scenario: Production build succeeds after migration
- **WHEN** the frontend production build command is run in the migrated structure
- **THEN** build completes successfully and emits deployable assets

### Requirement: Static asset path compatibility
The frontend SHALL load required static resources after migration, including models, textures, fonts, and decoder assets.

#### Scenario: Required runtime assets remain reachable
- **WHEN** the application scene initializes in the migrated frontend workspace
- **THEN** model and supporting static resources are loaded without path resolution errors

### Requirement: Runtime behavior stability
The migrated frontend SHALL keep core runtime behavior available, including 3D scene bootstrap and primary panel rendering.

#### Scenario: Core UI and scene render correctly
- **WHEN** the migrated application is opened in a browser
- **THEN** 3D scene initialization and key monitoring panels render without critical runtime exceptions

### Requirement: Migration rollback readiness
The migration process SHALL define a rollback path to restore the prior layout if a blocking regression is discovered.

#### Scenario: Rollback procedure is available
- **WHEN** a blocking issue is identified during migration validation
- **THEN** maintainers can execute a documented rollback procedure to return to the prior working state
