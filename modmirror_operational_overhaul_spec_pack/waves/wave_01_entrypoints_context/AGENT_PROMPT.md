# Agent Prompt — Wave 01: Replace Prototype Menus with Real Post/Comment Entrypoints

You are assigned Wave 01 of the ModMirror operational overhaul.

Read:
- root `README.md`
- `00_MASTER_SLASH_CALL_PROMPT.md`
- `01_REPO_TRUTH.md`
- `02_EXECUTION_PROTOCOL.md`
- `04_GLOBAL_ACCEPTANCE_CRITERIA.md`
- this wave's `README.md`

## Your mission

Remove Wave 0 smoke-test surfaces and build real moderator menu entrypoints for applying ModMirror policy from posts/comments.

## Branch

Use branch/worktree: `overhaul/w01-entrypoints-context` unless integration constraints require a dependency branch.

## Execution requirements

- Inspect existing code before editing.
- Make small commits.
- Add/update tests.
- Run relevant checks before reporting complete.
- Write a wave report under `docs/operational-overhaul/`.
- Do not do submission work.
- Do not claim runtime behavior without proof.
- If runtime behavior is unknown, implement safe disabled/fallback state and record research target.
- Use sub-agents/tools where available.
- Use web search/official docs/installed typings for uncertain platform behavior.

## Deliverables

- Clean `devvit.json` menu config.
- Target context service.
- Post/comment menu endpoints.
- Form/dashboard launch path carrying target context.
- Unit tests for target ID parsing and context resolution mocks.

## Final report must include

- Summary
- Files changed
- Commands run
- Tests passed/failed
- Runtime verification performed/not performed
- Risks
- Integration notes for later waves
