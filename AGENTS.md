# AGENTS.md

Repository-level instructions for AI coding agents.

This file contains stable engineering rules for working in this repository. Keep product-specific requirements, feature specs, and roadmap details in `README.md`, `docs/`, issues, or task prompts.

## Principles

Agents should follow:

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Code Organization and Component Size

Keep files small, focused, and easy to review.

### Component boundaries

Each React component should have one clear responsibility. Avoid putting unrelated features into the same component.

Do not let `app/page.tsx` become the main container for all product logic. Page files should primarily orchestrate feature components, not contain large amounts of form logic, list rendering, API calls, validation, and preview rendering at the same time.

When a file grows too large, split it by feature or responsibility.

Recommended structure:

- Page-level components: routing and high-level layout only
- Feature components: application tracker, resume builder, resume preview, etc.
- UI components: buttons, inputs, cards, empty states, badges
- API functions: isolated in `lib/` or feature-specific API files
- Types: isolated in `types.ts` or feature-specific type files
- Validation and data transformation: isolated from JSX when practical

### Size guidelines

Use the following thresholds as refactoring signals:

- A component should usually stay under 300 lines.
- A component over 300–400 lines should be split unless there is a clear reason not to.
- A single component should usually not contain more than 8 `useState` calls.
- More than 8–10 `useState` calls is a signal to extract state into smaller components, a custom hook, or a reducer.
- A single file should not combine form UI, list UI, preview UI, API requests, validation, and data transformation.
- Repeated JSX should be extracted into reusable components.
- If changing a small button, field, or UI section requires scrolling through a large file, the file should be split.

## Refactor Rules:

- Preserve existing behavior.
- Do not redesign the UI unless explicitly asked.
- Do not introduce new features during refactoring.
- Do not introduce new libraries unless explicitly requested.
- Extract one responsibility at a time.
- Keep data flow understandable.
- Remove only imports, variables, and functions made unused by the refactor.
- Do not delete pre-existing dead code unless it becomes clearly obsolete because of this refactor.
- Do not change API endpoint names.
- Do not change database schema.
- Do not change request/response payload shapes.
- Do not change validation rules unless the current implementation contradicts Phase 2 requirements.
- Do not change visual styling except moving JSX/classes into components.

## Tech Stack

Use the existing stack unless explicitly instructed otherwise.

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend:

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic

Do not introduce a new framework, database, ORM, UI library, state management library, AI framework, or authentication provider unless the task explicitly asks for it or the change is clearly necessary.
