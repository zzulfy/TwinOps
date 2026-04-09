## Context

`OpenAiLlmProviderAdapter` currently builds HTTP payloads manually, sends requests with `java.net.http.HttpClient`, and parses provider responses using custom JSON tree traversal. This duplicates transport concerns in business code and makes provider migration harder. The backend already added `langchain4j-open-ai`, so this change introduces a standard LLM client layer without changing analysis report domain behavior or frontend/API contracts.

Current operational constraints:
- Manual trigger and Kafka consumer flow must remain unchanged.
- `analysis_reports` persistence fields and semantics must remain unchanged.
- Existing fallback policy (`fallback-to-mock`) and structured observability events must remain available.
- Non-OpenAI-compatible vendor endpoint routing (configured base URL/path) must stay configurable.

## Goals / Non-Goals

**Goals:**
- Replace manual HTTP invocation in analysis provider adapter with LangChain4j OpenAI chat model integration.
- Preserve current output schema and normalization behavior (`prediction`, `confidence`, `riskLevel`, `recommendedAction`).
- Preserve and clarify provider failure handling (fallback vs terminal failure) with consistent logs.
- Keep integration compatible with current Spring configuration and existing analysis pipeline tests.

**Non-Goals:**
- Redesigning analysis prompt strategy or report fields.
- Reworking Kafka trigger/consumer workflow.
- Introducing multi-provider orchestration or prompt memory features.
- Frontend behavior changes.

## Decisions

### Decision 1: Keep `LlmProviderAdapter` boundary unchanged
- Rationale: keeps `AnalysisService` and Kafka pipeline stable while swapping only provider internals.
- Alternative: introduce a broader analysis orchestration abstraction.
- Why not now: unnecessary scope increase for a transport-layer migration.

### Decision 2: Use LangChain4j OpenAI chat model as transport/runtime client
- Rationale: removes manual HTTP wiring, centralizes timeout/retry/client behavior in a maintained library, and simplifies provider evolution.
- Alternative: keep native `HttpClient` and refactor utility helpers.
- Why not now: still leaves custom transport maintenance burden and inconsistent provider semantics.

### Decision 3: Keep adapter-level response normalization and validation
- Rationale: downstream behavior depends on stable risk-level normalization and confidence bounds; keeping this logic in adapter avoids hidden behavioral drift.
- Alternative: rely entirely on model output without post-normalization.
- Why not now: higher risk of malformed/unstable report persistence.

### Decision 4: Map LangChain4j/provider failures into existing fallback contract
- Rationale: existing product behavior and tests already rely on fallback-to-mock switch and explicit failed status paths.
- Alternative: new exception hierarchy exposed to upper layers.
- Why not now: would require broader contract changes beyond this migration.

## Risks / Trade-offs

- [Risk] LangChain4j API shape may not expose every vendor-specific field currently sent in raw payload.
  - Mitigation: keep prompt content and deterministic constraints explicit; validate parity with integration tests.
- [Risk] Provider output can still include markdown wrapper or partial JSON.
  - Mitigation: retain defensive parsing/cleanup and strict required-field validation before persistence.
- [Risk] Behavior drift in timeout and retry handling.
  - Mitigation: keep existing service-level timeout handling and add adapter tests covering timeout/fallback/terminal failure branches.
- [Risk] Configuration mismatch during rollout (`base-url`, `api-key`, model params).
  - Mitigation: document property mapping and add startup-time validation logs for key config presence.

## Migration Plan

1. Refactor `OpenAiLlmProviderAdapter` to initialize and use LangChain4j OpenAI chat model via existing Spring config values.
2. Keep prompt text and output schema contract unchanged; preserve adapter-side normalization logic.
3. Update provider adapter tests for success, malformed response, timeout/provider failure, and fallback behavior.
4. Run backend analysis suites (unit + Kafka integration tests) to confirm no trigger/consumer regression.
5. Roll out with existing `fallback-to-mock=true` in non-prod first; monitor structured logs for failure/fallback rates.

Rollback strategy:
- Immediate operational rollback: set `twinops.analysis.llm.provider=mock` or enable fallback path, then redeploy.
- Code rollback: revert adapter implementation commit without touching analysis pipeline contracts.

## Open Questions

- Should structured output mode (JSON schema enforcement) be enabled in LangChain4j once provider support is verified?
- Do we need explicit adapter-level retry policy, or should retries remain only at analysis service level?
- Should response parsing be extracted into a dedicated reusable parser for future provider adapters?
