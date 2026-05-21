# Agent Prompt — Wave 10: AI Advisory Spike and Optional Insight Layer

You are assigned Wave 10 of the ModMirror operational overhaul.

Read:
- root `README.md`
- `00_MASTER_SLASH_CALL_PROMPT.md`
- `01_REPO_TRUTH.md`
- `02_EXECUTION_PROTOCOL.md`
- `04_GLOBAL_ACCEPTANCE_CRITERIA.md`
- this wave's `README.md`

## Your mission

Verify whether external AI calls are safe/viable, then add advisory-only insight features if and only if the spike passes.

## Branch

Use branch/worktree: `overhaul/w10-ai-advisory-spike` unless integration constraints require a dependency branch.

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

- AI spike report.
- Provider abstraction if viable.
- Advisory endpoints if viable.
- Tests with mocked provider.

## Final report must include

- Summary
- Files changed
- Commands run
- Tests passed/failed
- Runtime verification performed/not performed
- Risks
- Integration notes for later waves
