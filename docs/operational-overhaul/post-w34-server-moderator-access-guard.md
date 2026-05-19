# Post-W34 Server Moderator Access Guard

Date: 2026-05-19

## What changed

- Added `src/server/services/moderatorAccess.ts`.
- Added `src/server/services/moderatorAccess.test.ts`.
- Added protected `/api/*` middleware in `src/routes/api.ts`.
- Added an `access_control` runtime capability domain and refreshed runtime
  verification/capability evidence.
- Added client-side access-denied classification for
  `moderator_access_required` and related permission failures.
- Added route-level Hono middleware tests in `src/routes/apiAccess.test.ts`.

The guard requires a signed-in current Reddit user and a non-empty
`getModPermissionsForSubreddit(currentSubreddit)` result before protected API
routes continue when Devvit supplies a live subreddit context.

Health/status/capability metadata routes stay public so the client can render a
clear blocked or limited state. Local no-subreddit-context development is
allowed so static/demo fallback work is not blocked by missing Devvit context.

## What was verified

- Missing current user is denied.
- Missing permission-check API is denied.
- Empty moderator permission lists are denied.
- Permission-check failures are denied.
- Any non-empty subreddit moderator permission list is accepted for aggregate
  ModMirror access.
- Local no-subreddit-context execution skips the guard.
- `/api/health` stays reachable without a current user, while protected routes
  deny missing-current-user requests and allow users with moderator permissions.
- The client labels moderator-access API failures as `access_denied` and tells
  the user to open ModMirror with a moderator account instead of treating the
  error as a generic validation problem.

## Commands run

- `npm run type-check`
- `npm test -- src/routes/apiAccess.test.ts`
- `npm test -- src/server/services/moderatorAccess.test.ts src/server/services/runtimeVerification.test.ts src/server/services/runtimeCapabilities.test.ts`
- `npm test -- src/shared/clientResilience.test.ts`
- `npx devvit whoami`
- `npm run dev`

`npm run dev` reached Devvit playtest ready for `r/modmirror_dev` on
`v0.0.1.126`.

## Still unverified

- True non-moderator account runtime behavior in Reddit/Devvit WebView.
- Exact permission strings needed for stronger per-mod or admin-level gates.
- Native mobile access behavior.

No public Reddit writes, moderation actions, Mod Notes, Mod Discussion sends,
scheduler operations, retention deletion, or external AI calls were performed.
