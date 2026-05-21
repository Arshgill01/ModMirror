# Deep Scan Runtime Test Plan

Created: 2026-05-21

## Current Status

ModMirror exposes live scan depths through the Scan page and `POST /api/scan`.
The deep depth is type-checked and locally tested, and the live Reddit source
adapter records requested limit, page size, fetched count, and cap warnings.

Deep moderation-log pagination now has authenticated WebView page-count proof
from Devvit playtest `v0.0.2.8`: `Deep Live Scan` reported `2` observed
moderation-log page fetches, `121` actions scanned, requested limit `250`, and
page size `100`. An exact API JSON excerpt remains optional follow-up evidence;
do not claim runtime pagination from local tests, static preview, upload
readiness, or sparse empty-history scans.

## Scope

Allowed in this test:

- Use `r/modmirror_dev`.
- Use the existing Scan page `Deep Live Scan` control.
- From the same authenticated runtime session when possible, probe
  `POST /api/scan` with `{"mode":"live","depth":"deep"}`.
- Record app version, account, subreddit context, route/control, HTTP status,
  response body excerpt, visible UI result, scan depth metadata, and warnings.
- Confirm the scan remains read-only.

Not allowed in this test without explicit user approval:

- Creating public Reddit posts or comments.
- Creating moderation-log history solely to force pagination.
- Removing, approving, ignoring reports, banning, muting, messaging, adding Mod
  Notes, sending Mod Discussion messages, running scheduler jobs, retention
  deletion, or external AI calls.
- Marking deep pagination as runtime-verified from an empty or sparse scan that
  does not prove cursor/page traversal.

## Preflight

- `git status --short --branch` is captured.
- `npx devvit whoami` reports the moderator account under test.
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass if
  code changed since the last broad validation.
- `npm run dev` reaches Playtest ready for `r/modmirror_dev`.
- The Reddit-hosted dashboard context shows subreddit `modmirror_dev`.
- The Scan page renders `Deep Live Scan`.

## Runtime Steps

1. Open the Reddit-hosted ModMirror dashboard for `r/modmirror_dev`.
2. Navigate to Scan.
3. Click `Deep Live Scan`.
4. Record the loading state text.
5. Record the final UI state, including depth, source, scanned count, and any
   warning text.
6. From the same authenticated runtime session when possible, probe:
   `POST /api/scan` with body `{"mode":"live","depth":"deep"}`.
7. Save a redacted response excerpt showing:
   - `ok`
   - `data.scanDepth.depth`
   - `data.scanDepth.requestedLimit`
   - `data.scanDepth.pageSize`
   - `data.scanDepth.fetchedActions`
   - `data.scanDepth.hitLimit`
   - `data.scanDepth.paginationStrategy`
   - `data.scanDepth.observedPageFetches`
   - `data.scanDepth.observedMultiplePages`
   - `data.scanDepth.runtimeStatus`
   - `data.warnings`
   - persisted scan record ID when present

## Expected Results

Runtime-verified deep pagination:

- The proof used the Reddit-hosted Devvit WebView or authenticated runtime API.
- The subreddit was `r/modmirror_dev`.
- The result shows `depth: "deep"` and the configured deep cap/page size.
- The fetched moderation-log history is large enough to demonstrate page/cursor
  traversal rather than a single sparse page.
- The response reports `paginationStrategy: "listing_get_pages"`,
  `observedMultiplePages: true`, and
  `runtimeStatus: "multiple_pages_observed"`.
- The response and UI preserve warnings when the configured cap is hit or when
  runtime pagination remains only partially proven.

Runtime-verified adapter failure:

- The API/UI captures an exact Devvit Reddit adapter permission/runtime failure.
- The failure is recorded with HTTP status, API error code, and visible UI text.

Still unverified:

- The scan returns zero or only sparse actions.
- The UI only shows the local warning that pagination is type-verified but not
  playtest-verified.
- The proof comes from local static preview, unauthenticated localhost probing,
  or upload readiness alone.

## Completion Criteria

Deep moderation-log pagination may be marked runtime-verified only when:

- The proof used the Reddit-hosted Devvit WebView or authenticated runtime API.
- Exact app version, account, subreddit, route/control, and result are recorded.
- Scan depth metadata proves the deep cap/page size and actual runtime result.
- Page/cursor traversal is demonstrated, or a concrete Reddit adapter
  permission/runtime failure is captured.
- The proof is recorded in `RESEARCH.md`, `TODO.md`,
  `RUNTIME_VERIFICATION_MATRIX.md`, and `CAPABILITY_MATRIX.md`.
- No destructive or public-facing moderation action was performed.
