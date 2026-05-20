# Wave 15 - Access And Privacy Proof

## Objective

Close the access-control and privacy proof gaps that determine which surfaces
can safely show sensitive information.

## Build Outcome

Non-mod blocking, lower-permission moderator role strings, full-access gates,
and aggregate-only fallbacks should be runtime-proven where account access
allows.

## Source Areas

- `docs/operational-overhaul/ACCESS_RUNTIME_TEST_PLAN.md`
- `docs/operational-overhaul/RUNTIME_PROOF_BACKLOG.md`
- `src/server/services/moderatorAccess.ts`
- `src/routes/api.ts`
- `src/server/services/subredditIsolation.ts`
- `src/client/main.ts`
- `RESEARCH.md`
- `TODO.md`

## Implementation Slices

1. Review current access diagnostics and visibility gates.
2. Run true non-mod checks only if a true non-mod account is available.
3. Run lower-permission moderator checks only if an appropriate account exists.
4. Record exact permission strings and visibility level.
5. Keep per-mod/manage-level surfaces hidden without proof.
6. Strengthen diagnostic messaging if current results are confusing.
7. Add tests for access denial and aggregate fallback.
8. Update docs only with observed runtime facts.
9. Add clear blockers if account access is unavailable.
10. Do not weaken gates to make demos easier.

## Quality Bar

Privacy and access safety are part of the product advantage.

## Tests

- moderator access tests
- protected route tests
- subreddit isolation tests

## Acceptance Criteria

- Non-mod and lower-role status is proven or explicitly blocked.
- UI does not expose sensitive data without proof.
- Docs, tests, and labels agree.
- Full validation passes.
