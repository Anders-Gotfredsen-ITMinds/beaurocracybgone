# ADR-0001: Apply SOLID Principles to Service Layer

## Status

Accepted

## Context

The initial implementation had a single `LLMService` class handling both legal
document analysis and video fact-checking. Prompts were hardcoded inside the
service, and routes constructed service instances directly using `settings`.

As the number of features grows (more analysis modes, more content types), this
structure would require modifying the same class repeatedly and made the code
difficult to test without hitting the real Anthropic API.

## Decision

Refactor the service layer to satisfy the applicable SOLID principles:

- **Single Responsibility**: Split `LLMService` into `AnalysisService` and
  `FactCheckService`, each with one concern.
- **Open/Closed**: Extract all prompts into `app/services/prompts.py`. Services
  receive prompts at construction time and never need to change when modes are
  added or prompts are refined.
- **Dependency Inversion**: Define `Protocol` interfaces (`IAnalysisService`,
  `IFactCheckService`, `ITranscriptFetcher`) in `app/interfaces/`. Wire concrete
  implementations into routes via FastAPI `Depends()` through `app/dependencies.py`.

Liskov Substitution was not applicable (no inheritance in use). Interface
Segregation was satisfied as a natural consequence of the split — each interface
has exactly one method.

## Consequences

### Positive

- Adding a new analysis mode only requires changes to `AnalysisMode` enum and
  `ANALYSIS_PROMPTS` — no service code changes.
- Routes depend on interfaces, not concrete classes — implementations can be
  swapped for mocks in tests without patching internals.
- Each service has a single, clear reason to change.

### Negative

- More files and indirection than the original single-class approach.
- Developers need to understand the `interfaces/` → `services/` → `dependencies/`
  → `routes/` flow.

### Risks

- Services still construct `anthropic.Anthropic` internally — the Anthropic client
  is not yet abstracted. If a second LLM provider is needed, this will require
  further refactoring (likely a new ADR).
