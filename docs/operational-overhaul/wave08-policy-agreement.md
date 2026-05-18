# W08 Policy Agreement Report

Date: 2026-05-18

Branch: `overhaul/w08-policy-agreement`

Worktree: `/Users/arshdeepsingh/Developer/modmirror-w08-policy-agreement`

## What Changed

- Added real policy lifecycle states: `draft`, `proposed`, `under_review`,
  `adopted`, `superseded`, and `archived`.
- Added proposal metadata, source drift metadata, review records, review
  decisions, adoption metadata, and supersession metadata to policy contracts.
- Changed policy creation/editing so saved changes become drafts first.
- Added explicit lifecycle operations:
  - propose draft;
  - review proposal;
  - adopt proposed/reviewed version;
  - supersede prior adopted version.
- Added policy lifecycle API routes under `/api/policies/:id/*`.
- Updated the Policies page with lifecycle badges, review counts, and
  propose/review/quick-adopt controls.
- Kept Apply Policy honest: it only uses adopted active policy versions. Drafts
  and proposals do not become enforcement guidance until adopted.

## Files Touched

- `src/shared/schema.ts`
- `src/shared/demoData.ts`
- `src/server/services/policies.ts`
- `src/server/services/policies.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `TODO.md`
- `RESEARCH.md`
- `docs/operational-overhaul/CAPABILITY_MATRIX.md`
- `docs/operational-overhaul/CURRENT_REPO_TRUTH.md`
- `docs/operational-overhaul/EXECUTION_LOG.md`
- `docs/operational-overhaul/WAVE_STATUS.md`
- `docs/operational-overhaul/wave08-policy-agreement.md`

## Commands Run

- `npm install`
- `npm test -- src/server/services/policies.test.ts`
- `npm test -- src/server/services/policies.test.ts src/server/services/applyPolicy.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

## Verification

- `npm run type-check` passed.
- `npm run lint` passed.
- `npm test -- src/server/services/policies.test.ts src/server/services/applyPolicy.test.ts` passed with 14 tests.
- `npm test` passed with 21 files and 93 tests.
- `npm run build` passed.
- `git diff --check` passed.

## Runtime Status

No Devvit playtest was run for W08.

Lifecycle persistence, route behavior, and UI controls are locally verified only.
Runtime verification still needs to prove Redis writes/reads and the policy
lifecycle buttons inside the Devvit WebView.

## Known Issues / Risks

- Approval thresholds are not permission-gated yet because exact moderator
  permission behavior remains runtime-unverified.
- The single-mod quick adoption path is intentionally available and labeled.
- Draft revisions on an already adopted policy do not replace Apply Policy
  guidance until adoption.

## Next Recommended Wave

W09 Case Packets v2: make case packets more receipt-backed and better at
detecting policy-version changes since the action.
