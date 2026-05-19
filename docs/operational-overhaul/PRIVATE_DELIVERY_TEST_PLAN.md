# Private Delivery Test Plan

Created: 2026-05-20

## Current Status

ModMirror does not send private messages, subreddit private messages, modmail,
or Mod Discussion messages as product behavior. Response templates may include
private-message and modmail drafts, but delivery remains preview-only and
receipt-backed as manual/skipped delivery.

Installed Devvit typings expose `reddit.sendPrivateMessage(options)` and
`reddit.modMail.createConversation(...)`. `sendPrivateMessageAsSubreddit`
exists in typings but is deprecated and must not be used. Existing ModMirror
team-delivery routes do not inject a live Mod Discussion adapter, and
scheduler confirmations are locally guarded as skipped.

This plan is the required gate before claiming runtime support for private
message or modmail delivery. It does not cover internal Mod Discussion
delivery; that requires a separate proof plan because it targets moderators,
not a recipient user.

## Scope

Allowed in this test, after explicit user approval:

- Use `r/modmirror_dev`.
- Use only a consenting test recipient account controlled by the user.
- Send a short, clearly marked `MODMIRROR_PRIVATE_DELIVERY_TEST` message.
- Test `reddit.sendPrivateMessage(options)` only if direct private-message
  behavior is explicitly approved.
- Test `reddit.modMail.createConversation(...)` only if modmail behavior is
  explicitly approved.
- Record exact success or failure shape, destination visibility, sender
  identity, and any notification behavior.

Not allowed in this test:

- Sending messages to real users or non-consenting accounts.
- Using deprecated `sendPrivateMessageAsSubreddit`.
- Creating internal Mod Discussion conversations.
- Removing, approving, ignoring reports, banning, muting, adding native Mod
  Notes, running scheduler jobs, retention deletion, public comments, or
  external AI calls.
- Enabling private delivery as a policy default or Apply Policy side effect.

## Preflight

- `git status --short --branch` is captured.
- `npx devvit whoami` reports the moderator account under test.
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass
  if code changed since the last broad validation.
- `npm run dev` reaches Playtest ready for `r/modmirror_dev`.
- The test recipient account and message text are explicitly approved by the
  user.
- The exact delivery method under test is selected: direct private message or
  modmail conversation. Do not test both unless both are approved.

## Runtime Steps

Direct private message, if approved:

1. Send `MODMIRROR_PRIVATE_DELIVERY_TEST` to the consenting recipient through
   `reddit.sendPrivateMessage(options)`.
2. Record whether the API resolves or returns an error.
3. Confirm whether the recipient account can see the message.
4. Record the visible sender identity and notification behavior.

Modmail conversation, if approved:

1. Create an approved safe modmail conversation through
   `reddit.modMail.createConversation(...)`.
2. Prefer author-hidden/modmail semantics over subreddit private messages where
   the installed typings support it.
3. Record conversation ID, subject, visibility, sender identity, and any error.
4. Do not archive, mute, approve, ban, or otherwise mutate the conversation
   unless a separate approved cleanup step is added.

## Evidence To Record

- Account used, without credentials.
- Recipient/test account, described without secrets.
- Devvit app version and subreddit.
- Exact command strings and UI/API route used.
- Delivery method, subject, body marker, and approved recipient.
- Response ID/conversation ID or exact error message.
- Recipient-visible sender identity and notification behavior.
- Confirmation that no deprecated subreddit PM API was used.

## Completion Criteria

Private delivery may be marked runtime-verified only for the exact observed
method when:

- The proof used approved consenting test accounts.
- The exact API call and response shape were recorded.
- Recipient visibility and sender identity were verified.
- Deprecated `sendPrivateMessageAsSubreddit` was not used.
- `RESEARCH.md`, `TODO.md`, `CAPABILITY_MATRIX.md`,
  `RUNTIME_VERIFICATION_MATRIX.md`, and the runtime proof backlog are updated.
- Product defaults and Apply Policy confirmation remain delivery-disabled until
  the product explicitly adopts a delivery design after reviewing the proof.
