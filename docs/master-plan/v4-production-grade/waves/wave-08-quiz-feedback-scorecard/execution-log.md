# Wave 08 - Quiz Feedback And Team Norm Scorecard

Status: implemented locally

## Scope

- Submitted selected quiz answers to the existing calibration answer API.
- Rendered deterministic feedback for aligned, acceptable alternative, and review-recommended outcomes.
- Added an aggregate non-punitive summary covering completed, aligned, acceptable alternative, and review-recommended counts.
- Explicitly preserved the no-leaderboard product guardrail in the UI copy.

## Validation

- `npm test -- src/client/state/store.test.ts src/server/services/calibration.test.ts` passed.
- `npm run type-check` passed.
- `npm run lint` passed.
- `npm run build` passed.
