## MODIFIED Requirements

### Requirement: Backend SHALL expose code-source traceable logs
Backend runtime logs SHALL include enough source location information for developers to map log lines back to concrete code print points, and the logger source SHALL use full package names instead of abbreviated package prefixes.

#### Scenario: Developer traces a production error to source code
- **WHEN** backend emits any `info` / `warn` / `error` log for critical business paths
- **THEN** log output includes logger source information with full package name + class/method/line context
- **AND** developer can locate the corresponding logging statement in code without ambiguous grep-only search
