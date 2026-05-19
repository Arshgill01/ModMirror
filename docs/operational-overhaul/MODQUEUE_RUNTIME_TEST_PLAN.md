# Modqueue Runtime Test Plan

Created: 2026-05-20

## Current Status

ModMirror has a read-only `/api/modqueue/triage` route and an Act-page
Operational Queue panel. Local tests verify normalization, policy hints,
history summaries, missing subreddit handling, and adapter failure behavior.

Post-W34 Devvit playtests reached the Operational Queue refresh path on
`v0.0.1.94` and `v0.0.1.123`, but both returned the labeled
type-supported/no-items fallback. Live Reddit modqueue item reads are therefore
not runtime-verified.

This plan is the required gate before claiming `/api/modqueue/triage` can read
live Reddit queue items in Devvit runtime.

## Scope

Allowed in this test:

- Use `r/modmirror_dev`.
- Use the existing Act-page Operational Queue `Refresh` control.
- Probe read-only `/api/modqueue/triage?limit=10&type=all`.
- Record HTTP status, JSON response body, visible UI state, and any adapter
  warning.
- Confirm the route returns either `source: "reddit_modqueue"` with real items
  or an exact permission/runtime failure from the Devvit Reddit adapter.

Not allowed in this test without explicit user approval:

- Creating public Reddit posts or comments.
- Reporting content to force it into the queue.
- Removing, approving, ignoring reports, banning, muting, messaging, adding Mod
  Notes, sending Mod Discussion messages, running scheduler jobs, retention
  deletion, or external AI calls.
- Marking modqueue triage as runtime-verified from an empty queue fallback.

## Content Needed

Preferred evidence source:

- Existing safe content already visible in the `r/modmirror_dev` modqueue.

If no existing safe queued content is available:

- Stop and ask for explicit approval before creating or reporting throwaway
  content.
- Use a clearly marked title/body containing `MODMIRROR_MODQUEUE_RUNTIME_TEST`
  if approved.
- Do not take enforcement actions on the content during this proof pass.

## Preflight

- `git status --short --branch` is captured.
- `npx devvit whoami` reports the moderator account under test.
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass if
  code changed since the last broad validation.
- `npm run dev` reaches Playtest ready for `r/modmirror_dev`.
- The dashboard context shows subreddit `modmirror_dev`.
- The Act-page Operational Queue panel renders before refresh.

## Runtime Steps

1. Open the Reddit-hosted ModMirror dashboard for `r/modmirror_dev`.
2. Navigate to Act.
3. Click `Refresh` in Operational Queue.
4. Record the loading state text.
5. Record the final UI state.
6. From the same authenticated runtime session when possible, probe:
   `/api/modqueue/triage?limit=10&type=all`.
7. Save the response body or an exact redacted excerpt showing:
   - `ok`
   - `data.source`
   - `data.capability.state`
   - `data.items.length`
   - first item `id`, `targetThingId`, `targetType`, `source`, and report
     metadata when present
   - `data.warnings`

## Expected Results

Runtime-verified live modqueue read:

- Response is successful.
- `data.source` is `reddit_modqueue`.
- At least one item is returned.
- Returned item data maps to safe `r/modmirror_dev` content.
- No enforcement or delivery action is executed.

Runtime-verified adapter failure:

- Response is successful at the API envelope level or fails with an exact
  access/runtime error.
- `data.capability.state` is `failed_runtime`, or the HTTP/JSON failure shape
  is captured.
- The error message is recorded in `RESEARCH.md`.

Still unverified:

- Response returns the current type-supported/no-items fallback.
- UI only says no queue items were returned.
- No exact Reddit adapter failure is captured.

## Completion Criteria

Modqueue triage may be marked runtime-verified only when:

- The proof used the Reddit-hosted Devvit WebView or authenticated runtime API.
- The subreddit was `r/modmirror_dev`.
- The result returned `source: "reddit_modqueue"` with at least one safe item,
  or captured a concrete Devvit permission/runtime failure from the adapter.
- The proof was recorded in `RESEARCH.md`, `TODO.md`,
  `RUNTIME_VERIFICATION_MATRIX.md`, and `CAPABILITY_MATRIX.md`.
- No destructive or public-facing moderation action was performed.
