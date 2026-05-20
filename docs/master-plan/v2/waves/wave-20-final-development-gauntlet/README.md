# Wave 20 - Final Development Gauntlet

## Objective

Run the final development-only audit after all build waves, mapping every
planned addition to evidence, tests, runtime proof, and remaining risks.

## Build Outcome

A fresh agent or maintainer can see exactly what was built, what passed, what is
runtime-proven, what remains disabled, and what risks remain.

## Source Areas

- all V2 wave logs
- `TODO.md`
- `RESEARCH.md`
- `docs/DECISIONS.md`
- runtime proof matrices
- `src/`
- `package.json`

## Implementation Slices

1. Build a checklist from V2 peak additions.
2. Build a checklist from all 20 wave acceptance criteria.
3. Map every item to source evidence, tests, runtime proof, or explicit risk.
4. Run full validation.
5. Run targeted golden tests.
6. Run non-destructive runtime rehearsal if available.
7. Update `TODO.md` with remaining development gaps.
8. Update `RESEARCH.md` only with new observed facts.
9. Update runtime matrices only with actual proof.
10. Produce final development audit in `docs/master-plan/v2/final-audit.md`.

## Quality Bar

Do not pass the plan by vibes. Pass it by evidence.

## Tests

- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- runtime commands only where available and safe

## Acceptance Criteria

- Every peak addition has evidence or an explicit incomplete status.
- All validation command results are recorded.
- Runtime claims match proof.
- No submission artifacts were created.

