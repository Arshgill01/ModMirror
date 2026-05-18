# W05 Full Scan Persistence Report

Date: 2026-05-18
Branch: `overhaul/w05-scan-persistence`
Worktree: `/Users/arshdeepsingh/Developer/modmirror-w05-scan-persistence`

## What Changed

- Added full scan record schema and scan comparison schema.
- Added capped scan history retention via `SCAN_HISTORY_LIMIT`.
- Updated Mirror Scan to persist full attributed scan output, not just last-scan
  metadata.
- Added Redis storage for full scan detail, scan metadata lists, source lists,
  rule indexes, and anonymized target-author indexes.
- Added scan list, detail, and compare API routes.
- Added local tests for scan persistence, demo/live source separation, and
  comparison deltas.

## Files Touched

- `RESEARCH.md`
- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/redis.ts`
- `src/server/services/scans.ts`
- `src/server/services/scans.test.ts`
- `src/server/services/mirrorScan.ts`
- `src/routes/api.ts`
- `docs/operational-overhaul/CAPABILITY_MATRIX.md`
- `docs/operational-overhaul/CURRENT_REPO_TRUTH.md`
- `docs/operational-overhaul/EXECUTION_LOG.md`
- `docs/operational-overhaul/WAVE_STATUS.md`
- `docs/operational-overhaul/wave05-scan-persistence.md`

## Commands Run

- `npm install`
- `npm run type-check`
- `npm run lint`
- `npm test -- src/server/services/scans.test.ts src/server/services/mirrorScan.test.ts`
- `npm test`
- `npm run build`
- `git diff --check`

## Verification

- `npm run type-check` passed.
- `npm run lint` passed.
- Targeted scan tests passed, 5 tests.
- Full `npm test` passed, 19 files and 86 tests.
- `npm run build` passed.
- `git diff --check` passed.

## Unsafe Or Unverified

- No Devvit playtest was run for W05.
- Redis persistence is locally tested with mocks only.
- Retention trims scan metadata indexes but does not delete older detail keys
  yet.
- Rule and author-hash indexes are written for later analytics; no read API uses
  them yet.

## Next Wave Notes

- W06 should use persisted scan records when implementing deeper scans and
  warning/cap behavior.
- W07 should build drift-over-time analytics from `MirrorScanRecord` plus W04
  receipts.
- W13 should runtime-verify scan detail/list/compare routes against Redis.
