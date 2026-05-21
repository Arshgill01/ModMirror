# Wave 03 - Runtime Proof: Access + Roles

## Objective

Close or sharply document the remaining account/permission runtime gaps.

## Source Docs

- `docs/operational-overhaul/ACCESS_RUNTIME_TEST_PLAN.md`
- `docs/operational-overhaul/RUNTIME_PROOF_BACKLOG.md`
- `docs/operational-overhaul/RUNTIME_VERIFICATION_MATRIX.md`
- `TODO.md`
- `RESEARCH.md`

## Deliverables

- True non-mod protected API blocking runtime proof, if account access exists.
- Lower-permission moderator role-string runtime proof, if account access exists.
- Updated access diagnostic labels if current UI does not make proof easy.
- Updated docs only for evidence actually gathered.

## Guardrails

- Do not expose protected data to non-mod accounts.
- Do not broaden per-mod visibility based on guesses.
- Keep full-access-only gates until lower role strings are proven.

## Acceptance Criteria

- Either runtime proof is recorded with exact playtest version and route results,
  or blockers are recorded with next concrete steps.
- Local tests still pass after any diagnostic change.
