# Mod Discussion Delivery Test Plan

Created: 2026-05-20

## Current Status

ModMirror supports manual and skipped team-delivery receipts, including skipped
Mod Discussion draft receipts. It does not inject a live Mod Discussion adapter
in product routes, and scheduler confirmations are locally guarded so they do
not route through the Mod Discussion adapter.

Installed Devvit typings and docs expose
`reddit.modMail.createModDiscussionConversation({ subject, bodyMarkdown,
subredditId })` as an internal moderator discussion API for installed
subreddits. ModMirror has not sent a live Mod Discussion conversation in
playtest, and permission/error behavior is unverified.

This plan is the required gate before claiming internal Mod Discussion delivery
or enabling a live team-delivery send path.

## Scope

Allowed in this test, after explicit user approval:

- Use `r/modmirror_dev`.
- Send one clearly marked internal moderator discussion with subject/body
  containing `MODMIRROR_MOD_DISCUSSION_TEST`.
- Use only approved non-sensitive test content.
- Record conversation ID, visible destination, sender identity, body rendering,
  and exact success/error shape.
- Verify whether moderators can see the conversation and whether non-moderators
  cannot access it, only if the needed accounts are available and approved.

Not allowed in this test:

- Sending any message to public users or non-consenting accounts.
- Creating public comments, private messages, user-facing modmail, native Mod
  Notes, scheduler jobs, external AI calls, retention deletion, or Reddit
  moderation actions.
- Wiring a live Mod Discussion adapter into product routes permanently.
- Treating a scheduler-triggered confirmation as proof of Mod Discussion
  delivery.
- Enabling scheduler delivery.

## Preflight

- `git status --short --branch` is captured.
- `npx devvit whoami` reports the moderator account under test.
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass
  if code changed since the last broad validation.
- `npm run dev` reaches Playtest ready for `r/modmirror_dev`.
- The approved test subject/body are captured before sending.
- The user explicitly approves one internal Mod Discussion send for this run.

## Runtime Steps

1. Confirm the current subreddit is `r/modmirror_dev`.
2. Confirm the target content is a test-only digest, policy proposal, or case
   packet draft with no sensitive real-user data.
3. Call `reddit.modMail.createModDiscussionConversation(...)` through a
   temporary proof-only path or controlled diagnostic surface.
4. Record the returned conversation ID or exact error.
5. Open Reddit Mod Discussions if possible and record destination, visibility,
   sender identity, subject, and rendered body.
6. Confirm no scheduler task was registered or run.
7. Confirm no product route remains configured to send live Mod Discussion
   messages after the proof.

## Evidence To Record

- Account used, without credentials.
- Devvit app version and subreddit.
- Exact command strings and UI/API route used.
- Subject/body marker and source draft type.
- Returned conversation ID or exact error message.
- Moderator-visible destination and sender identity.
- Whether non-moderator visibility was checked, if applicable.
- Confirmation that scheduler delivery remained unavailable.

## Completion Criteria

Internal Mod Discussion delivery may be marked runtime-verified only when:

- The proof used approved test content in `r/modmirror_dev`.
- One internal Mod Discussion send was explicitly approved.
- The exact success or failure shape was recorded.
- Moderator-only destination and sender identity were verified, or the
  permission failure was recorded.
- Scheduler behavior was not conflated with delivery behavior.
- `RESEARCH.md`, `TODO.md`, `CAPABILITY_MATRIX.md`,
  `RUNTIME_VERIFICATION_MATRIX.md`, and the runtime proof backlog are updated.
- Product routes remain disabled unless a separate product decision enables a
  reviewed live delivery adapter.
