# Wave 04 — Component Extraction Without Rewrite

Status: complete

## Objective

Start reducing `main.ts` render density by extracting one vertical slice without
introducing a second client state model or rewriting the entrypoint.

## Scope

- Extract common render primitives into `src/client/render/primitives.ts`.
- Move empty/loading states, settings cards, metric cards, confidence items,
  and HTML escaping into that module.
- Keep all page state, event binding, and orchestration in `main.ts`.
- Add focused primitive render tests.

## Acceptance Evidence

- `main.ts` imports extracted render primitives.
- No duplicate state model was introduced.
- `src/client/render/primitives.test.ts` covers escaping and rendered markup
  contracts for extracted primitives.
- Build output remains unchanged in behavior; the extracted functions return
  the same class names and data-action attributes used by existing bindings.
