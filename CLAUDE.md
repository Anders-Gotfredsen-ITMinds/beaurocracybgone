# Claude Instructions — Beaurocracy B'Gone

## Backlog
- The project backlog lives in `BACKLOG.md` at the repo root.
- When the user mentions an idea, a "to-do", or something to remember: add it to `BACKLOG.md`.
- When starting a non-trivial piece of work, check `BACKLOG.md` for related items that might be relevant or can be knocked off at the same time.

## Architecture Decision Records (ADRs)
- ADRs live in `docs/adr/`. Each file is named `NNNN-short-title.md`.
- When a significant technical decision is made (choice of library, architectural pattern, API design, etc.), propose creating an ADR.
- When starting work that touches an existing decision, check `docs/adr/` for relevant records first.

## Project context
- This is an AI-powered tool for making legal documents and video content more accessible to ordinary people.
- The backend is FastAPI + Anthropic Claude. Keep that stack unless there's a strong reason to diverge.
- Before making significant architectural decisions, consult the `architecture-patterns` skill for design guidance.
- When a decision is made, use the `architecture-decision-records` skill to document it.
