# Wave 13 Execution Log

## Status

Implemented.

## What Changed

- Added Demo Orchestration Engine manifest and reset endpoint.
- Reset seeds demo scan, policy, calibration scenarios, log-only Apply Policy receipt, override, evidence board, and review tasks.
- Manifest story checks now include scan, policy, calibration, review, apply, and evidence.

## Files Touched

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/demoOrchestration.ts`
- `src/server/services/demoOrchestration.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`

## Validation

- `npm test -- src/server/services/demoOrchestration.test.ts`
- `npm run type-check`

## Known Issues

- Demo records are deterministic and labeled; they are not live subreddit proof.
