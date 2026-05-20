# Wave 08 Execution Log

## Status

Implemented.

## What Changed

- Added Case Evidence Graph service linking receipts, policies, overrides, evidence boards, case packets, and content snapshots.
- Added `/api/evidence-graph`.
- Wired evidence graph rendering into the Prove page.

## Files Touched

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/evidenceGraph.ts`
- `src/server/services/evidenceGraph.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`

## Validation

- `npm test -- src/server/services/evidenceGraph.test.ts`
- `npm run type-check`

## Known Issues

- Graph nodes summarize content and omit copied target author/moderator display.
