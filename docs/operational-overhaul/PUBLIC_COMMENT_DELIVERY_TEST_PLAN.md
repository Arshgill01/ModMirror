# Public Comment Delivery Test Plan

Created: 2026-05-20

## Current Status

ModMirror does not send public moderation comments in the current build. Policy
creation, updates, version adoption, imports, and read paths normalize
`defaultMessageMode` to `log_only` until runtime delivery behavior is proven.
Response templates are preview-only and receipt-backed; they do not post to
Reddit.

Installed Devvit typings expose `reddit.submitComment({ id, text | richtext,
runAs })`, and comment models expose `distinguish(makeSticky?)`. Runtime
behavior for commenting before removal, after removal, app/user identity, and
distinguish/sticky behavior is unverified.

This plan is the required gate before enabling public comment delivery as any
default or automated Apply Policy behavior.

## Scope

Allowed in this test, after explicit user approval:

- Use `r/modmirror_dev`.
- Use clearly marked throwaway post/comment targets containing
  `MODMIRROR_COMMENT_DELIVERY_TEST`.
- Submit a short, non-enforcement test comment with no user accusation and no
  real moderation consequence.
- Test both `runAs: "APP"` and `runAs: "USER"` only if each identity mode is
  explicitly approved.
- Test `distinguish(false)` and `distinguish(true)` only after the comment
  exists and only if explicitly approved.
- Record the exact target state, comment ID, author/identity display,
  distinguish/sticky result, and any error shape.

Not allowed in this test:

- Commenting on real user content.
- Removing, approving, ignoring reports, banning, muting, sending private
  messages, creating Mod Discussion/modmail conversations, adding native Mod
  Notes, running scheduler jobs, retention deletion, or external AI calls.
- Enabling policy `defaultMessageMode` values other than `log_only`.
- Wiring public comments into Apply Policy confirmation.
- Treating a single successful comment as proof for comment-after-removal,
  distinguish/sticky, or identity behavior that was not separately observed.

## Preflight

- `git status --short --branch` is captured.
- `npx devvit whoami` reports the moderator account under test.
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass
  if code changed since the last broad validation.
- `npm run dev` reaches Playtest ready for `r/modmirror_dev`.
- The target post/comment is confirmed as throwaway safe test content.
- The user has explicitly approved any public comment operation for this run.

## Runtime Steps

1. Create or identify approved throwaway target content in `r/modmirror_dev`.
2. Record the target thing ID, author, permalink, and current moderation state.
3. Submit a short test comment before any removal action, if approved.
4. Record the response ID, permalink, visible author identity, and visible text.
5. Attempt distinguish and sticky only if separately approved.
6. If comment-after-removal proof is approved, run it on a separate throwaway
   target or after explicitly approved target-state setup.
7. Record whether the API allowed the comment, rejected it, or returned a
   permission/runtime error.
8. Confirm no ModMirror policy default or Apply Policy flow was changed from
   `log_only`.

## Evidence To Record

- Account used, without credentials.
- Devvit app version and subreddit.
- Exact command strings and UI controls used.
- Target thing ID, target type, and permalink.
- Comment request mode: plain text or richtext, `runAs` value, and whether
  distinguish/sticky was attempted.
- Returned comment ID/permalink or exact error JSON/message.
- Visible author identity and whether the comment is distinguished/stickied.
- Whether the target was normal, removed, or otherwise state-modified before
  the comment attempt.

## Completion Criteria

Public comment delivery may be marked runtime-verified only for the exact
observed scenario when:

- The proof used approved throwaway content in `r/modmirror_dev`.
- A public comment was attempted only after explicit approval.
- The exact success or failure shape was recorded.
- Identity, distinguish, sticky, and before/after-removal claims are recorded
  separately.
- `RESEARCH.md`, `TODO.md`, `CAPABILITY_MATRIX.md`,
  `RUNTIME_VERIFICATION_MATRIX.md`, and the runtime proof backlog are updated.
- Policy defaults and Apply Policy confirmation remain `log_only` until the
  product explicitly adopts a delivery design after reviewing the proof.
