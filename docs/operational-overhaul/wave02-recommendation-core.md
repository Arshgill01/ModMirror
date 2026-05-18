# W02 Recommendation Core Report

Date: 2026-05-18
Branch: `overhaul/w02-recommendation-core`
Worktree: `/Users/arshdeepsingh/Developer/modmirror-w02-recommendation-core`

## What Changed

- Added a target-aware Apply Policy preview contract in `src/shared/schema.ts`.
- Added source validation in `src/shared/constants.ts` and server-side preview
  validation in `src/server/services/applyPolicy.ts`.
- Preview responses now include:
  - policy snapshot when a policy exists;
  - target snapshot with post/comment type and available target details;
  - evidence rows for policy, target, history, and safety;
  - confirmation metadata that explicitly says execution is `log_only`.
- Preserved confirmation as log-only. W02 does not call Reddit moderation APIs.
- Updated `/api/apply-policy/preview` normalization so target title/body,
  permalink, and target type can flow through when available.
- Updated the dashboard Apply Policy preview rendering and demo fallback to
  match the expanded preview contract.
- Added Apply Policy tests for target-aware preview and safety validation.

## Files Touched

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/applyPolicy.ts`
- `src/server/services/applyPolicy.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `docs/operational-overhaul/CAPABILITY_MATRIX.md`
- `docs/operational-overhaul/CURRENT_REPO_TRUTH.md`
- `docs/operational-overhaul/EXECUTION_LOG.md`
- `docs/operational-overhaul/WAVE_STATUS.md`
- `docs/operational-overhaul/wave02-recommendation-core.md`

## Commands Run

- `npm install`
- `npm run type-check`
- `npm run lint`
- `npm test -- src/server/services/applyPolicy.test.ts`
- `npm test`
- `npm run build`
- `git diff --check`

## Verification

- `npm run type-check` passed.
- `npm run lint` passed.
- `npm test -- src/server/services/applyPolicy.test.ts` passed, 7 tests.
- `npm test` passed, 16 files and 74 tests.
- `npm run build` passed.
- `git diff --check` passed.

## Unsafe Or Unverified

- No runtime playtest was run in W02.
- Apply Policy remains log-only. Real Reddit execution is still a W03/W04
  concern and must stay behind confirmation, receipt, and runtime proof gates.
- Target metadata beyond ID/author depends on future runtime handoff work unless
  passed by a caller.
- Offense count still uses ModMirror-tracked Apply Policy actions only, not full
  persisted Reddit mod-log history.

## Next Wave Notes

- W03 should build the moderation execution service around this preview shape.
- W03 must preserve log-only fallback and create receipts for skipped, failed,
  disabled, and eventually successful execution attempts.
- W03 should not enable destructive Reddit actions by default without runtime
  proof from a safe playtest.
