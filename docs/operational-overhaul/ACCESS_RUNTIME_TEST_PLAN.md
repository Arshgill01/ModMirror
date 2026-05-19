# Access Runtime Test Plan

Created: 2026-05-20

## Current Status

ModMirror locally verifies protected API access checks and has runtime proof for
the current moderator account on `r/modmirror_dev`. The current moderator
diagnostic returned the permission string `all`, and ModMirror maps only `all`
to `full_moderator` visibility.

This plan is the required gate before claiming either true non-moderator
runtime blocking or lower-permission moderator role-string behavior.

## Scope

Allowed in this test:

- Use `r/modmirror_dev`.
- Use the existing Settings `Check access` diagnostic.
- Probe read-only protected routes such as `/api/policies`,
  `/api/runtime-capabilities`, and `/api/access/diagnostics`.
- Record HTTP status, API error code, and visible UI message.

Not allowed in this test:

- Adding or removing moderators without explicit user approval.
- Changing production subreddit permissions.
- Running destructive moderation actions.
- Sending public comments, private messages, Mod Notes, Mod Discussion
  messages, scheduler jobs, or AI provider requests.
- Expanding per-mod visibility gates based on guessed permission strings.

## Accounts Needed

- A full moderator account already verified on `r/modmirror_dev`.
- A true non-moderator account with no moderator permissions in
  `r/modmirror_dev`.
- Optional: a lower-permission moderator account with a deliberately limited
  permission set, such as `posts`, `access`, `wiki`, `flair`, or another role
  available in Reddit's moderator UI.

Do not infer lower-permission strings from documentation alone. Record the
exact strings returned by `getModPermissionsForSubreddit`.

## Preflight

- `git status --short --branch` is captured.
- `npx devvit whoami` reports the account under test.
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass.
- `npm run dev` reaches Playtest ready for `r/modmirror_dev`.
- Current full moderator diagnostic still returns `all`.

## Non-Moderator Runtime Blocking

Using a true non-moderator account:

- Open the playtest URL for `r/modmirror_dev`.
- Confirm moderator-only menu entries do not appear, if Reddit exposes that
  state to the account.
- Attempt to open an existing ModMirror dashboard post if visible.
- Trigger protected WebView actions only if reachable.
- Directly probe protected routes from the authenticated WebView/session when
  possible:
  - `/api/policies`
  - `/api/runtime-capabilities`
  - `/api/access/diagnostics`
- Record exact HTTP status, JSON error code, and UI message.

Expected result:

- Public health/status routes may remain reachable.
- Protected routes must fail with a moderator-access error, not generic input
  validation.
- No protected data should be returned.

## Lower-Permission Moderator Role Strings

Using a lower-permission moderator account:

- Run Settings `Check access`.
- Record the exact returned permission strings and visibility level.
- Confirm `moderatorVisibilityLevel` remains `aggregate_only` unless the
  returned permissions include `all`.
- Probe aggregate-safe routes only.
- Do not expose or add per-mod surfaces based on lower-permission strings until
  product requirements and permission semantics are reviewed.

Expected result:

- Protected aggregate routes may be reachable for moderators with any non-empty
  permission list.
- Per-mod/manage-level visibility remains `aggregate_only` without `all`.

## Evidence To Record

- Account type under test, without exposing credentials.
- Devvit app version.
- Subreddit.
- Exact command strings.
- Exact route URLs or UI controls used.
- HTTP status and JSON response body for protected-route probes.
- Screenshot or accessibility-tree text for visible UI errors.
- Any unexpected Reddit host behavior.

## Completion Criteria

True non-moderator blocking may be marked runtime-verified only when:

- A non-moderator account was used.
- Protected routes returned moderator-access errors.
- Public health/status routes still behaved as expected.
- No protected data was returned.

Lower-permission role strings may be marked runtime-verified only when:

- A lower-permission moderator account was used.
- Exact permission strings were captured.
- Visibility stayed `aggregate_only` without `all`.
- The result was recorded in `RESEARCH.md`, `TODO.md`, and the runtime
  verification/capability matrices.
