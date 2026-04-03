## MODIFIED Requirements

### Requirement: README SHALL provide complete project-level summary in Chinese
The repository SHALL maintain a `README.md` that presents a complete project summary in Chinese, including system定位, repository layout, frontend/backend architecture, and high-level runtime flow.

#### Scenario: Reader understands project boundaries from README
- **WHEN** a contributor reads `README.md` from top to bottom
- **THEN** they can identify the system purpose, major modules, and how frontend/backend collaborate without opening source files first

#### Scenario: Root README remains project-level navigation
- **WHEN** a contributor reads root `README.md`
- **THEN** the document SHALL present high-level architecture, minimum runnable path, runtime contracts, and explicit links to module READMEs instead of duplicating detailed backend/frontend implementation sections

### Requirement: README SHALL include technical implementation plan section
`README.md` SHALL include a dedicated technical implementation plan section that describes architecture strategy, module responsibilities, data flow, and key engineering practices used in TwinOps.

#### Scenario: Implementation strategy is explicitly documented
- **WHEN** a maintainer searches `README.md` for implementation guidance
- **THEN** they can find a structured section that explains the project's technical approach rather than only operational commands

#### Scenario: Cross-document detail ownership is explicit
- **WHEN** implementation details such as API lists, backend configuration specifics, or frontend UX conventions are documented
- **THEN** root `README.md` SHALL reference module README files as the source of truth, and duplicated detail blocks SHALL be avoided

### Requirement: Explanatory text SHALL be Chinese while technical terms remain in English
Documentation narrative in `README.md` SHALL be written in Chinese, and professional technical terminology SHALL remain in English where terms map to canonical tool names, interfaces, patterns, or code identifiers.

#### Scenario: Technical precision is preserved with bilingual style rule
- **WHEN** `README.md` describes engineering concepts such as API contract, DTO mapping, QueryWrapper querying, lazy loading, or manual chunking
- **THEN** explanatory sentences are Chinese and those professional technical terms remain in English

### Requirement: README SHALL preserve executable onboarding and deployment guidance
`README.md` SHALL provide accurate, executable commands for local development, build, test, and deployment flows in workspace-correct paths (`frontend` and `backend`).

#### Scenario: New contributor can run project using README commands
- **WHEN** a contributor follows the documented command sequence
- **THEN** they can initialize dependencies, start services, and perform baseline validation without path-related failures

#### Scenario: Documented runtime flows match implemented behavior
- **WHEN** README sequence/flow diagrams describe auth, analysis automation, and messaging interactions
- **THEN** the textual and diagrammed behavior SHALL match current implementation semantics (for example, admin token session handling and RocketMQ-driven analysis automation)
