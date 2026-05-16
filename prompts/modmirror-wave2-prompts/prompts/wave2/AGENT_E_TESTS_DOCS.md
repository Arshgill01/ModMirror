# Agent E — Wave 2 Tests, Docs, and Integration Hygiene

## Role

Add tests/verification, documentation updates, and integration hygiene for Wave 2.

This agent should not own major product implementation unless needed to make tests pass.

## Read First

- `AGENTS.md`
- `PLAN.md`
- `TODO.md`
- `RESEARCH.md`
- `docs/PRODUCT.md`
- `docs/DATA_MODEL.md`
- `prompts/wave2/WAVE2_ORCHESTRATOR.md`
- `.codex/skills/wave-execution/SKILL.md`

## Goal

Ensure Wave 2 is verifiable, documented, and ready for Wave 3.

## Tasks

1. Identify the repo's test/build/typecheck commands.
2. Add or wire tests for pure functions if a test runner exists.
3. If no test runner exists, add a minimal low-risk test setup only if appropriate.
4. Add verification for attribution logic.
5. Add verification for demo scan shape.
6. Update `TODO.md` with Wave 2 status and Wave 3 next steps.
7. Update `RESEARCH.md` if new Devvit facts were discovered during Wave 2.
8. Update `docs/DATA_MODEL.md` if implemented shapes differ from draft.
9. Create `docs/WAVE2_COMPLETION_REPORT.md`.

## Required Test Coverage

At minimum verify:

- exact rule number match,
- title match,
- low-effort text normalization,
- unmatched case,
- demo scan produces at least one drift candidate,
- confidence breakdown totals align with scan actions.

## Completion Report Template

Create:

```txt
docs/WAVE2_COMPLETION_REPORT.md
```

With:

```md
# Wave 2 Completion Report

## Summary

## Files Changed

## Commands Run

## Tests / Checks

## Verified Behavior

## Known Issues

## Devvit Findings Added

## Ready for Wave 3?

## Recommended Wave 3 Scope
```

## Acceptance Criteria

- Build/typecheck/test command status is documented.
- Tests or verification scripts cover attribution/demo scan.
- TODO.md is current.
- Wave 3 is clearly defined.
- No docs claim unsupported functionality.

## Commit Guidance

```bash
git add TODO.md RESEARCH.md docs src/**/*.test.ts
git commit -m "test: add Wave 2 verification and docs"
```
