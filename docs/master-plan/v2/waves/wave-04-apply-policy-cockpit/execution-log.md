# Wave 04 Execution Log

## Status

Implemented through existing Apply Policy cockpit plus V2 surfaces.

## What Changed

- Confirmed Apply Policy remains moderator-confirmed and log-only unless runtime gates allow otherwise.
- Added V2 evidence graph and receipt/demo wiring around Apply Policy receipts.
- Preserved override reason requirements for policy deviations.

## Files Touched

- `src/client/main.ts`
- `src/server/services/demoOrchestration.ts`
- `src/server/services/evidenceGraph.ts`
- `src/server/services/reviewRoom.ts`
- `src/shared/schema.ts`

## Validation

- `npm run type-check`
- `npm test -- src/server/services/demoOrchestration.test.ts src/server/services/evidenceGraph.test.ts`

## Known Issues

- No destructive Reddit action was enabled or runtime-claimed by this wave.
