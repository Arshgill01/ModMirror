# Wave 14 - Live Read Proof

## Objective

Runtime-prove safe read-only Reddit paths or document exact constraints.

## Build Outcome

The product should know which read paths are truly runtime-proven and which are
fallback-only: modqueue, moderation log depth, rules, removal reasons, target
context, and scan persistence.

## Source Areas

- `docs/operational-overhaul/RUNTIME_PROOF_BACKLOG.md`
- `docs/operational-overhaul/MODQUEUE_RUNTIME_TEST_PLAN.md`
- `docs/operational-overhaul/RUNTIME_VERIFICATION_MATRIX.md`
- `RESEARCH.md`
- `src/server/services/redditSources.ts`
- `src/server/services/modqueueTriage.ts`
- `src/server/services/mirrorScan.ts`
- `src/client/main.ts`

## Implementation Slices

1. Read all relevant runtime test plans.
2. Run only non-destructive read tests.
3. Capture exact Devvit playtest version.
4. Record route, account, subreddit, observed result, and fallback status.
5. Improve adapter diagnostics if failures are ambiguous.
6. Update UI labels if live read paths remain fallback-only.
7. Add tests for changed diagnostics.
8. Update `RESEARCH.md` only with observed facts.
9. Update runtime matrices only for actual proof.
10. Leave destructive actions untouched.

## Quality Bar

Runtime proof must be evidence, not optimism.

## Tests

- targeted adapter tests if code changes
- full validation after code changes
- exact runtime proof steps in execution log

## Acceptance Criteria

- Read-only proof state is clearer than before.
- Modqueue/deep scan claims match evidence.
- Runtime docs and UI labels agree.
- Full validation passes if code changes occur.
