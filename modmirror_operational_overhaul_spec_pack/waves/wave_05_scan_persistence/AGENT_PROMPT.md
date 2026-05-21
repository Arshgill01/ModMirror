# Agent Prompt — Wave 05: Full Scan Persistence

You are assigned Wave 05 of the ModMirror operational overhaul.

Read:
- root `README.md`
- `00_MASTER_SLASH_CALL_PROMPT.md`
- `01_REPO_TRUTH.md`
- `02_EXECUTION_PROTOCOL.md`
- `04_GLOBAL_ACCEPTANCE_CRITERIA.md`
- this wave's `README.md`

## Your mission

Persist full attributed scan output so ModMirror can reason over history instead of only last-scan counts.

## Branch

Use branch/worktree: `overhaul/w05-scan-persistence` unless integration constraints require a dependency branch.

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

- Full scan storage service.
- Scan detail/list APIs.
- Updated scanner integration.
- Tests for persistence, retention, demo/live separation.

## Final report must include

- Summary
- Files changed
- Commands run
- Tests passed/failed
- Runtime verification performed/not performed
- Risks
- Integration notes for later waves
