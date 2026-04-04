## ADDED Requirements

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
