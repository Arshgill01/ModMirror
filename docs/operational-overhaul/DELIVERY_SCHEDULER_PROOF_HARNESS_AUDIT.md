# Delivery, Mod Notes, And Scheduler Proof Harness Audit

Date: 2026-05-21

## Purpose

This audit closes V4 Wave 26 as a preparation wave only. It verifies that proof
runbooks and guardrails exist for public comments, private delivery, internal
Mod Discussion, native Mod Notes, and scheduler jobs.

This audit does not authorize or claim any live send/write/scheduled runtime
proof.

## Proof Runbooks

- `docs/operational-overhaul/PUBLIC_COMMENT_DELIVERY_TEST_PLAN.md`
- `docs/operational-overhaul/PRIVATE_DELIVERY_TEST_PLAN.md`
- `docs/operational-overhaul/MOD_DISCUSSION_DELIVERY_TEST_PLAN.md`
- `docs/operational-overhaul/NATIVE_MOD_NOTES_TEST_PLAN.md`
- `docs/operational-overhaul/SCHEDULER_RUNTIME_TEST_PLAN.md`

## Current Implementation Guards

Public comments:

- Policy create/update/version/adoption/read paths normalize delivery defaults
  to `log_only`.
- Response templates render drafts and receipt previews only.
- No Apply Policy product path posts public comments.

Private delivery and Mod Discussion:

- Response templates may include private-message and modmail drafts, but they
  remain preview-only.
- Team delivery persists manual-ready or skipped receipts.
- Product routes do not inject a live Mod Discussion adapter.

Native Mod Notes:

- Native mode is gated by `MODMIRROR_ENABLE_NATIVE_MOD_NOTES=true`,
  `MODMIRROR_NATIVE_MOD_NOTES_RUNTIME_VERIFIED=true`, and receipt availability.
- Without those gates, native Mod Note attempts are recorded as skipped instead
  of calling Reddit.

Scheduler:

- No ModMirror scheduler task is registered in `devvit.json`.
- Scheduler delivery confirmations are locally guarded as skipped.
- A scheduler proof run must add a proof-only task that can write only a smoke
  record and cannot send delivery, moderation, retention, native Mod Note, or
  external AI side effects.

## Required Runtime Proof Before Upgrading Status

Public comments:

- explicit approval for each comment identity/state scenario;
- approved throwaway target content only;
- returned comment ID or exact error;
- author identity, distinguish/sticky behavior, and before/after-removal
  behavior recorded separately.

Private delivery:

- explicit approval for one method and consenting recipient;
- no deprecated subreddit private-message API;
- response/conversation ID or exact error;
- recipient visibility and sender identity recorded.

Internal Mod Discussion:

- explicit approval for one internal moderator discussion;
- approved non-sensitive subject/body marker;
- conversation ID or exact error;
- moderator-only destination and sender identity recorded;
- scheduler behavior kept separate.

Native Mod Notes:

- explicit approval for one throwaway target/user;
- `addModNote` request/result recorded;
- receipt attempt status recorded;
- readback/delete behavior claimed only if separately approved and observed.

Scheduler:

- explicit approval to register and run one proof-only scheduler smoke task;
- task writes only the approved smoke/status record;
- returned job result or exact error recorded;
- listing/cancellation behavior recorded only if tested;
- proof-only task removed or disabled afterward unless a separate product
  decision keeps it.

## No-Go Boundary

Do not perform any of these from this audit:

- public comments;
- private messages, modmail, or internal Mod Discussion sends;
- native Mod Note writes/readbacks/deletes;
- scheduler registration or job runs;
- moderation actions, retention deletion, external AI calls, or public content
  setup;
- capability promotion from plan-only/type-only to runtime verified.

## Status

Harness preparation is complete.

Runtime proof remains open and requires explicit approval of the exact send,
write, or scheduler proof run before execution.
