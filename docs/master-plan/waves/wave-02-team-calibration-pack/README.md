# Wave 02 - Team Calibration Pack

## Objective

Build a safe Team Calibration workflow that helps moderators compare scenario
choices against team policy without rankings, leaderboards, or surveillance.

## Product Shape

Use product language like:

- `Team Calibration`
- `Onboard a New Mod`
- `Practice Policy Decisions`

Avoid punitive language like scores, grading, failed quizzes, or mod ranking.

## Source Areas

- `src/shared/schema.ts`
- `src/shared/demoData.ts`
- `src/server/services/policies.ts`
- `src/server/services/applyPolicy.ts`
- new or existing calibration service/tests
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/client/styles.css`

## Deliverables

- Calibration scenario model derived from policies and demo/live-safe examples.
- 5-7 deterministic demo scenarios.
- API routes to list scenarios, submit choices, and return aggregate alignment.
- UI flow:
  - choose calibration pack
  - answer scenarios
  - compare against team policy
  - show aggregate alignment only
- Receipts/audit events only if useful and privacy-safe.
- Tests for scenario generation, result aggregation, and privacy behavior.

## Guardrails

- No per-mod leaderboard.
- No punitive scoring language.
- No AI judging.
- No automatic enforcement.
- No submission artifacts.

## Acceptance Criteria

- Demo calibration can be completed in under two minutes.
- Results explain policy alignment without shaming an individual.
- Live sparse mode can generate starter scenarios from active policies or show a
  useful no-policy path.
- Full validation commands pass.
