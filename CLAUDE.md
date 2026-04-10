# Claude Instructions — Beaurocracy B'Gone

## Backlog
- The project backlog lives in `BACKLOG.md` at the repo root.
- When the user mentions an idea, a "to-do", or something to remember: add it to `BACKLOG.md`.
- When starting a non-trivial piece of work, check `BACKLOG.md` for related items that might be relevant or can be knocked off at the same time.

## Architecture Decision Records (ADRs)
- ADRs live in `docs/adr/`. Each file is named `NNNN-short-title.md`.
- When a significant technical decision is made (choice of library, architectural pattern, API design, etc.), propose creating an ADR.
- When starting work that touches an existing decision, check `docs/adr/` for relevant records first.

## Commits
- Commit after each prompt that produces a meaningful change — one prompt, one commit.
- Format: a short conventional title on the first line, then a blank line, then `Prompt: "<the user's prompt verbatim>"` in the body.
- This gives the user a readable `git log` while preserving the full prompt history in each commit.

## Mobile coding standards (React Native / Expo)

**TypeScript**
- Always `catch (e: unknown)` with an `instanceof Error` guard — never `catch (e: any)`
- No `any` types anywhere in mobile code

**React hooks**
- Every `useEffect` dependency array must be complete — include every value from the outer scope the effect reads or calls
- Wrap callbacks passed as props in `useCallback`

**Async / error handling**
- Never fire-and-forget: every Promise must have a `.catch()` or be inside `try/catch`
- Errors must be surfaced to state or logged — never silently swallowed

**React Native UX**
- Wrap any screen with a text input in `KeyboardAvoidingView` (`behavior="padding"` on iOS, `"height"` on Android)
- Add `keyboardShouldPersistTaps="handled"` to any `ScrollView` that contains tappable elements
- Use `FlatList` instead of `ScrollView` for lists of unknown or potentially large length

## Project context
- This is an AI-powered tool for making legal documents and video content more accessible to ordinary people.
- The backend is FastAPI + Anthropic Claude. Keep that stack unless there's a strong reason to diverge.
- Before making significant architectural decisions, consult the `architecture-patterns` skill for design guidance.
- When a decision is made, use the `architecture-decision-records` skill to document it.
