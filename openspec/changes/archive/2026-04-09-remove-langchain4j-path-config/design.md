## Context

The current `OpenAiLlmProviderAdapter` still accepts `twinops.analysis.llm.path` and performs endpoint composition (`base-url` + `path`) before passing values into LangChain4j model initialization. After migrating to LangChain4j, this extra parameter is no longer required for the intended OpenAI-compatible usage and can create configuration ambiguity (for example, duplicated or mismatched path segments).

## Goals / Non-Goals

**Goals:**
- Remove active dependency on `twinops.analysis.llm.path` in the LangChain4j provider adapter path.
- Keep provider initialization based on `twinops.analysis.llm.base-url` and existing auth/model/runtime knobs.
- Preserve report output semantics, fallback behavior, and observability events.
- Provide tests that validate base-url-only behavior.

**Non-Goals:**
- Changing report schema, API contracts, or Kafka analysis workflow.
- Reworking fallback strategy or risk/confidence normalization logic.
- Introducing a new provider abstraction or changing non-OpenAI adapters.

## Decisions

### Decision 1: Remove `path` from adapter configuration inputs
`OpenAiLlmProviderAdapter` constructor will no longer bind `twinops.analysis.llm.path`. Adapter endpoint state will derive from `base-url` only.

Alternative considered:
- Keep `path` but mark as deprecated.
Why not chosen:
- This continues dual-source endpoint behavior and delays cleanup of a now-redundant parameter.

### Decision 2: Keep LangChain4j base URL mapping logic but make it base-url-first
Any endpoint normalization helpers will be simplified to operate from `base-url` as the single source. If compatibility cleanup is still required (e.g., trimming `/chat/completions`), it will be applied to the `base-url` value itself rather than via a second config field.

Alternative considered:
- Remove all mapping helpers and pass `base-url` through unmodified.
Why not chosen:
- Existing deployments may still provide completion-suffixed URLs; a lightweight normalization step reduces migration friction.

### Decision 3: Treat `path` removal as configuration-surface breaking change
Specs and task evidence will explicitly mark this as a breaking configuration update so deployment owners can clean up obsolete properties.

Alternative considered:
- Silently ignore `path` with no spec-level note.
Why not chosen:
- Hidden drift in configuration contracts can cause operational confusion during rollout.

## Risks / Trade-offs

- [Risk] Existing environment files still set `twinops.analysis.llm.path` and expect composition behavior.
  → Mitigation: document breaking change in proposal/spec/tasks and keep tests focused on base-url-only initialization.

- [Risk] Over-normalizing `base-url` may alter some custom gateway routing.
  → Mitigation: limit normalization to safe suffix handling and validate adapter tests for expected endpoint mapping.

- [Risk] Regression in provider wiring during Spring bootstrapping.
  → Mitigation: run compile + adapter tests + integration regression suites already used for analysis flow.

## Migration Plan

1. Remove `path` binding and composition logic in adapter code.
2. Update adapter unit tests to assert base-url-only behavior.
3. Run backend compile and unit/integration/regression tests.
4. Deploy with cleaned LLM config (`base-url`, `api-key`, `model`, `temperature`, `max-tokens`), without `path`.
5. Rollback strategy: revert adapter change and restore previous config behavior if runtime provider initialization fails.

## Open Questions

- Should startup emit an explicit warning when legacy `twinops.analysis.llm.path` is still present in environment variables (even though it is unused)?
