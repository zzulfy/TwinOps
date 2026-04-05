## Purpose

Define README documentation requirements to ensure TwinOps provides a complete Chinese project summary, clear technical implementation plan, bilingual terminology consistency, and executable onboarding/deployment guidance.

## Requirements

### Requirement: README SHALL provide complete project-level summary in Chinese
The repository SHALL maintain a `README.md` that presents a complete project summary in Chinese, including system定位, repository layout, frontend/backend architecture, and high-level runtime flow.

#### Scenario: Reader understands project boundaries from README
- **WHEN** a contributor reads `README.md` from top to bottom
- **THEN** they can identify the system purpose, major modules, and how frontend/backend collaborate without opening source files first

#### Scenario: Root README remains project-level navigation
- **WHEN** a contributor reads root `README.md`
- **THEN** the document SHALL present high-level architecture, minimum runnable path, runtime contracts, and explicit links to module READMEs instead of duplicating detailed backend/frontend implementation sections

#### Scenario: README is user-facing instead of documentation-governance-facing
- **WHEN** a deployment user reads root `README.md`
- **THEN** the narrative SHALL focus on architecture/business understanding and executable run instructions, and SHALL NOT center on documentation design rules

### Requirement: README SHALL include technical implementation plan section
`README.md` SHALL include a dedicated technical implementation plan section that describes architecture strategy, module responsibilities, data flow, and key engineering practices used in TwinOps.

#### Scenario: Implementation strategy is explicitly documented
- **WHEN** a maintainer searches `README.md` for implementation guidance
- **THEN** they can find a structured section that explains the project's technical approach rather than only operational commands

#### Scenario: Cross-document detail ownership is explicit
- **WHEN** implementation details such as API lists, backend configuration specifics, or frontend UX conventions are documented
- **THEN** root `README.md` SHALL reference module README files as the source of truth, and duplicated detail blocks SHALL be avoided

#### Scenario: Architecture and business diagrams are detailed and quickly understandable
- **WHEN** a user views the architecture diagram and business sequence diagram
- **THEN** they SHALL be able to map frontend pages, backend modules, data stores, and messaging flow in one read without inferring hidden steps

#### Scenario: Mermaid diagrams are GitHub-renderable
- **WHEN** a contributor updates Mermaid diagrams in root `README.md`
- **THEN** the diagrams SHALL render successfully in GitHub rich display
- **AND** documentation changes SHALL avoid syntax patterns known to trigger Mermaid parse errors on GitHub

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
- **THEN** the textual and diagrammed behavior SHALL match current implementation semantics (for example, admin token session handling and Kafka-driven analysis automation)

#### Scenario: Non-Docker deployment path is primary and executable
- **WHEN** a user follows deployment steps in root `README.md`
- **THEN** the primary path SHALL be non-Docker deployment commands for MySQL and Kafka, with Docker presented as fallback instead of the default path

### Requirement: README architecture views SHALL match implemented runtime modules
Root and backend README architecture diagrams and module descriptions SHALL reflect current implemented components and message middleware (Kafka) without stale RocketMQ references.

#### Scenario: Reader checks architecture graph after Kafka migration
- **WHEN** a user reads README architecture/business diagrams
- **THEN** messaging blocks and sequence flows show Kafka-based pipeline
- **AND** no outdated RocketMQ module names or paths remain

### Requirement: README SHALL define mandatory integration and regression testing baseline
Project documentation SHALL state that every future code-change requirement MUST include integration tests and regression tests in addition to relevant API/unit coverage.

#### Scenario: Contributor reads implementation policy section
- **WHEN** contributor prepares a new code-change requirement
- **THEN** README explicitly requires integration + regression tests as mandatory acceptance items
- **AND** requirement is framed as default engineering policy, not optional guidance

### Requirement: README SHALL define mandatory backend logging baseline
Project documentation SHALL state that backend code changes MUST add appropriate logs at business-critical points and follow three-level logging (`info`, `warn`, `error`) with source-traceable output.

#### Scenario: Contributor modifies backend controller or service logic
- **WHEN** a developer implements backend code changes in controller/service/automation flow
- **THEN** change includes appropriate logging statements aligned to normal/recoverable/failure paths
- **AND** logs follow `info`, `warn`, `error` semantics
- **AND** logged output can be mapped back to code location during bug investigation
