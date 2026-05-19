# Native Mod Notes Test Plan

Created: 2026-05-20

## Current Status

ModMirror stores response-template Mod Note drafts on Apply Policy receipts, but
does not create native Reddit Mod Notes in product behavior by default.

The native Mod Notes service is gated by both
`MODMIRROR_ENABLE_NATIVE_MOD_NOTES=true` and
`MODMIRROR_NATIVE_MOD_NOTES_RUNTIME_VERIFIED=true`, and it requires action
receipts to remain available. Without those gates, Apply Policy records a
skipped native Mod Note attempt instead of calling Reddit.

Installed Devvit typings expose `reddit.addModNote(options)`,
`reddit.getModNotes(options)`, and `reddit.deleteModNote(options)`. Runtime
permission behavior, note labels, target visibility, readback, and deletion
behavior have not been verified in playtest.

This plan is the required gate before claiming native Mod Notes runtime support
or enabling native mode for any product path.

## Scope

Allowed in this test, after explicit user approval:

- Use `r/modmirror_dev`.
- Use only approved throwaway post/comment targets and an approved test author.
- Add one clearly marked native Mod Note containing
  `MODMIRROR_NATIVE_MOD_NOTE_TEST`.
- Prefer a neutral test note body that does not accuse the target author of
  real misconduct.
- Record the exact `reddit.addModNote(...)` request shape, returned note ID, or
  exact error.
- Read back native Mod Notes with `reddit.getModNotes(...)` if explicitly
  approved for the same test target/user.
- Delete the created native Mod Note with `reddit.deleteModNote(...)` only if
  explicitly approved as part of cleanup.
- Record whether receipt persistence captured the native Mod Note attempt.

Not allowed in this test:

- Adding notes to real user incidents or non-consenting targets.
- Creating public comments, private messages, modmail, Mod Discussion
  conversations, scheduler jobs, external AI calls, retention deletion, or live
  moderation actions.
- Enabling native Mod Notes as a default Apply Policy behavior.
- Setting permanent runtime-proof environment flags after a temporary
  diagnostic run.
- Treating `addModNote` success as proof of readback or deletion unless those
  steps are separately approved and observed.

## Preflight

- `git status --short --branch` is captured.
- `npx devvit whoami` reports the moderator account under test.
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass if
  code changed since the last broad validation.
- `npm run dev` reaches Playtest ready for `r/modmirror_dev`.
- The approved target thing ID, target author, and note body are captured
  before any write.
- The user explicitly approves one native Mod Note write for this run.
- Any temporary diagnostic route, environment flag, or local-only harness is
  identified before the run and removed or disabled afterward.

## Runtime Steps

1. Confirm the current subreddit is `r/modmirror_dev`.
2. Confirm the target is throwaway safe content and the target author is
   approved for the test.
3. Attempt one native Mod Note write through a temporary proof-only path or a
   controlled diagnostic using `reddit.addModNote(...)`.
4. Record the response note ID or exact error, including permission failures.
5. Confirm the ModMirror receipt records `sent`, `failed`, or `skipped` with
   the expected capability state.
6. If approved, call `reddit.getModNotes(...)` for the same user/target and
   record whether the created note appears with the expected body/label.
7. If approved, call `reddit.deleteModNote(...)` for only the created test note
   and record the exact success or failure shape.
8. Confirm native mode is not left enabled by default and no product path can
   create native Mod Notes without a new reviewed decision.

## Evidence To Record

- Account used, without credentials.
- Devvit app version and subreddit.
- Exact command strings and UI/API route used.
- Target thing ID, target type, target author, and permalink if available.
- Note body marker, note label if any, and whether a target reddit ID was
  included.
- Returned note ID or exact error JSON/message.
- Receipt ID and native Mod Note attempt status.
- Readback result if `getModNotes` was approved.
- Cleanup/delete result if `deleteModNote` was approved.
- Confirmation that no public comments, messages, Mod Discussions, scheduler
  jobs, retention deletion, or moderation actions were performed.

## Completion Criteria

Native Mod Notes may be marked runtime-verified only for the exact observed
scenario when:

- The proof used approved throwaway content in `r/modmirror_dev`.
- One native Mod Note write was explicitly approved.
- The exact success or failure shape was recorded.
- Receipt status, note ID/error, and permission behavior were captured.
- Readback and deletion claims are recorded separately from write success.
- `RESEARCH.md`, `TODO.md`, `CAPABILITY_MATRIX.md`,
  `RUNTIME_VERIFICATION_MATRIX.md`, and the runtime proof backlog are updated.
- Native Mod Notes remain disabled as default product behavior unless a
  separate product decision enables a reviewed live mode after proof.
