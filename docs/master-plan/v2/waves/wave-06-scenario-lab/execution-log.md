# Wave 06 Execution Log

## Status

Implemented.

## What Changed

- Added scenario draft create/update/archive service paths and API routes.
- Added Scenario Lab form in the Review page for deterministic teaching scenarios.
- Added archive controls so inactive scenarios leave active calibration packs.
- Kept privacy metadata explicit and moderator names out of scenario records.

## Files Touched

- `src/server/services/calibration.ts`
- `src/server/services/calibration.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/shared/schema.ts`

## Validation

- `npm test -- src/server/services/calibration.test.ts`
- `npm run type-check`

## Known Issues

- The UI supports create/archive and active draft selection; deep inline editing uses the API route rather than a dedicated edit modal.
