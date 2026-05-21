# Wave 01 — Replace Prototype Menus with Real Post/Comment Entrypoints

## Objective

Remove Wave 0 smoke-test surfaces and build real moderator menu entrypoints for applying ModMirror policy from posts/comments.

## Branch / worktree

Recommended branch: `overhaul/w01-entrypoints-context`

## Agents to use

- Devvit Menu Agent
- Target Context Agent
- Server Routes Agent
- Form UX Agent
- Test Agent

## Tasks

1. Remove/retire production-facing `ModMirror smoke test` menu labels.
2. Replace with post/comment menu entries: `Apply ModMirror Policy` and optionally `Generate ModMirror Case Packet`.
3. Keep a dev-only/internal diagnostics route if useful, but do not expose smoke-test language to moderators.
4. Implement target-context service that accepts a `t3_` or `t1_` target ID and resolves target type, author, title/body/permalink if available, subreddit, and current moderator.
5. Add safe errors when target fetch fails or user lacks permission.
6. Wire menu endpoints to open a confirmation/context form or dashboard route with target context.
7. Persist no destructive action in this wave.

## Deliverables

- Clean `devvit.json` menu config.
- Target context service.
- Post/comment menu endpoints.
- Form/dashboard launch path carrying target context.
- Unit tests for target ID parsing and context resolution mocks.

## Tests / verification

- type-check
- lint
- test
- build
- manual/playtest notes if possible

## Constraints

No real moderation actions yet. This wave only creates real entrypoints and context capture.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
