# W07 Drift Analytics Report

Date: 2026-05-18

Branch: `overhaul/w07-drift-analytics`

Worktree: `/Users/arshdeepsingh/Developer/modmirror-w07-drift-analytics`

## What Changed

- Added consistency analytics shared contracts for rule drift trends, policy
  impact windows, data quality, and summary API responses.
- Added a server analytics service that reads persisted scan history and W04
  action receipts to compute:
  - drift trend direction across repeated scan candidates;
  - before/after active-policy-version receipt adherence;
  - unresolved override counts;
  - explicit insufficient-data and demo/shallow-scan caveats.
- Added `/api/analytics/consistency`.
- Added a Review page “Consistency Over Time” panel with scan/receipt counts,
  top trend, policy impact status, and caveats.
- Added a clearly labeled demo analytics fallback for static preview only.
- Added focused unit tests for improving analytics and insufficient-data
  behavior.

## Files Touched

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/analytics.ts`
- `src/server/services/analytics.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `TODO.md`
- `RESEARCH.md`
- `docs/operational-overhaul/CAPABILITY_MATRIX.md`
- `docs/operational-overhaul/CURRENT_REPO_TRUTH.md`
- `docs/operational-overhaul/EXECUTION_LOG.md`
- `docs/operational-overhaul/WAVE_STATUS.md`
- `docs/operational-overhaul/wave07-drift-analytics.md`

## Commands Run

- `npm install`
- `npm test -- src/server/services/analytics.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

## Verification

- `npm test -- src/server/services/analytics.test.ts` passed with 2 tests.
- `npm run type-check` passed.
- `npm run lint` passed.
- `npm test` passed with 21 files and 92 tests.
- `npm run build` passed.
- `git diff --check` passed.

## Runtime Status

No Devvit playtest was run for W07.

The analytics service is local/type/test verified only. Runtime verification
still needs to prove that the Devvit Redis-backed scan and receipt ledgers read
correctly through `/api/analytics/consistency` and that the Review page panel
renders with live installation data.

## Known Issues / Risks

- Rule drift trend direction is intentionally conservative: it compares the
  number of distinct actions in repeated drift candidates, not a full
  statistical drift model.
- Receipt-backed policy impact only covers ModMirror Apply Policy usage. It
  does not represent every moderator action in the subreddit.
- Shallow quick/standard scans may miss older history; analytics caveats call
  this out when non-deep scans are included.
- Per-mod analytics remain omitted.

## Next Recommended Wave

W08 Policy Agreement: add a true proposal, review, and adoption lifecycle on
top of the existing policy versioning model.
