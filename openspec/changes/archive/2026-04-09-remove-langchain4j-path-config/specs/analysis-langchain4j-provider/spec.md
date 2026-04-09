## MODIFIED Requirements

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
