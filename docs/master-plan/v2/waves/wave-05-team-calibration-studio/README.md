# Wave 05 - Team Calibration Studio

## Objective

Build the flagship Team Calibration workflow: moderators practice decisions and
compare choices against team policy without ranking or surveillance.

## Build Outcome

Mods can complete a short calibration pack, see alignment with team policy, and
learn why the team norm recommends a given action.

## Source Areas

- `src/shared/schema.ts`
- `src/shared/demoData.ts`
- `src/server/services/policies.ts`
- `src/server/services/applyPolicy.ts`
- new `src/server/services/calibration.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/client/styles.css`

## Implementation Slices

1. Define calibration scenario, answer, result, and aggregate summary types.
2. Seed 5-7 demo scenarios tied to existing demo rules and policies.
3. Generate live scenarios from active policies where possible.
4. Add route to list packs and scenarios.
5. Add route to submit answers and return aggregate alignment.
6. Show team policy answer only after choice.
7. Explain acceptable alternatives without implying punishment.
8. Avoid storing named per-mod results unless explicitly privacy-reviewed.
9. Add UI under Review or a dedicated Calibration section.
10. Add tests for generation, scoring language, and privacy.

## Quality Bar

This is not a quiz that grades people. It is a practice tool for alignment.

## Tests

- scenario generation tests
- answer result tests
- privacy/no-leaderboard tests
- demo fixture tests

## Acceptance Criteria

- Demo pack is completable end to end.
- Results are aggregate and non-punitive.
- Team policy reasoning is visible.
- No per-mod leaderboard exists.
- Full validation passes.

