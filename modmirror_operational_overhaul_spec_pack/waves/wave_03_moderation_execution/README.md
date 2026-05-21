# Wave 03 — Safe Moderation Execution Engine

## Objective

Build the gated engine that can actually execute Reddit moderation actions after explicit confirmation, while preserving log-only fallback.

## Branch / worktree

Recommended branch: `overhaul/w03-moderation-execution`

## Agents to use

- Runtime Research Agent
- Execution Engine Agent
- Safety Agent
- Test Agent

## Tasks

1. Create `moderationExecution` service with actions: approve, remove, ignore_reports, log_only, maybe comment/mod_note only behind capability flags.
2. Represent execution mode: `live`, `log_only`, `dry_run`, `unverified_disabled`.
3. Require explicit confirmation token or confirmation boolean from the UI/API.
4. Never execute destructive action from preview endpoint.
5. Validate target type and action compatibility.
6. Call Reddit SDK methods only when available and runtime capability is enabled.
7. Capture success/failure/skipped result in a typed execution result.
8. Add environment/config feature flags so risky delivery methods stay disabled until verified.
9. Implement conservative fallback: if execution fails, create failed receipt and show actionable error.

## Deliverables

- Execution service.
- Execution route integrated into Apply Policy confirm.
- Feature/capability gates.
- Typed execution result schema.
- Tests with mocked Reddit API success/failure/permission errors.

## Tests / verification

- type-check
- lint
- test
- build
- playtest if safe

## Constraints

No silent destructive actions. Public comment/modmail/modnote remain disabled unless verified in a spike.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
