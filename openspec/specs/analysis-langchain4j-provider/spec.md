# analysis-langchain4j-provider Specification

## Purpose
TBD - created by archiving change replace-native-http-with-langchain4j. Update Purpose after archive.
## Requirements
### Requirement: Analysis provider SHALL invoke LLM through LangChain4j
The backend analysis LLM provider adapter SHALL use LangChain4j OpenAI-compatible chat model as the primary client path instead of manual raw HTTP request construction. The adapter SHALL use `twinops.analysis.llm.base-url` as the single endpoint source and SHALL NOT require `twinops.analysis.llm.path` for endpoint composition.

#### Scenario: Provider invocation uses LangChain4j client
- **WHEN** analysis adapter is configured with `twinops.analysis.llm.provider=openai`
- **THEN** adapter uses LangChain4j chat model to submit prompt messages
- **AND** adapter does not depend on handwritten `HttpClient` request/response wiring for normal provider calls

#### Scenario: Provider initialization works with base-url only
- **WHEN** deployment sets valid `twinops.analysis.llm.base-url` and does not provide `twinops.analysis.llm.path`
- **THEN** adapter initializes provider client successfully
- **AND** analysis request routing is derived from `base-url` without extra path concatenation

### Requirement: Analysis provider SHALL preserve output contract and normalization
The migrated provider adapter SHALL keep the existing analysis output contract and normalization rules for persisted reports.

#### Scenario: Model returns valid JSON payload
- **WHEN** provider returns a response containing required analysis fields
- **THEN** adapter returns `prediction`, `confidence`, `riskLevel`, and `recommendedAction` with unchanged semantics
- **AND** confidence is clamped to valid bounds and risk level is normalized to allowed values

#### Scenario: Model returns wrapped or partially formatted JSON
- **WHEN** provider content includes fenced text or extra wrapper content around JSON
- **THEN** adapter performs defensive parsing/cleanup before validation
- **AND** missing required fields are treated as provider failure conditions

### Requirement: Analysis provider SHALL keep fallback and terminal failure compatibility
The migrated provider adapter SHALL preserve fallback-to-mock and terminal failure behavior already used by analysis pipeline and report persistence flows.

#### Scenario: Provider call fails and fallback is enabled
- **WHEN** provider invocation fails and `twinops.analysis.llm.fallback-to-mock=true`
- **THEN** adapter emits fallback observability events
- **AND** adapter returns fallback prediction result without breaking report generation flow

#### Scenario: Provider call fails and fallback is disabled
- **WHEN** provider invocation fails and `twinops.analysis.llm.fallback-to-mock=false`
- **THEN** adapter throws terminal failure to upper analysis service
- **AND** analysis pipeline persists failed report status with non-sensitive error context

