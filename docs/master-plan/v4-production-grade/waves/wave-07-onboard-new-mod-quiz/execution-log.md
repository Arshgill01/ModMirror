# Wave 07 - Onboard A New Mod Quiz

Status: implemented locally

## Scope

- Replaced the Team Calibration scenario list with a one-scenario-at-a-time quiz.
- Added controlled action selection before answer submission.
- Preserved quiz navigation state across normal client re-rendering.
- Kept calibration practice aggregate-only with no per-mod leaderboard.

## Validation

- `npm test -- src/client/state/store.test.ts src/server/services/calibration.test.ts` passed.
- `npm run type-check` passed.
- `npm run lint` passed.
- `npm run build` passed.
