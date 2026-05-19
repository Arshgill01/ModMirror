# Reddit Moderation Execution Test Plan

Created: 2026-05-20

## Current Status

ModMirror has a typed moderation execution service for `remove`, `approve`, and
`ignore_reports`, but live Reddit execution remains disabled by default.

The live execution path requires all of these gates:

- explicit moderator confirmation,
- `executionMode: "live"`,
- a post/comment target ID,
- `MODMIRROR_ENABLE_LIVE_REDDIT_ACTIONS=true`,
- `MODMIRROR_REDDIT_ACTIONS_RUNTIME_VERIFIED=true`,
- action receipts available.

Current code calls `reddit.remove(targetId, false)` for remove, `reddit.approve`
for approve, and target-model `ignoreReports()` for ignore reports. Local tests
mock success and failure paths, but no live remove, approve, or ignore-reports
operation has been executed in Devvit playtest.

This plan is the required gate before claiming live Reddit moderation execution
or leaving any live execution flag enabled.

## Scope

Allowed in this test, after explicit user approval:

- Use `r/modmirror_dev`.
- Use only throwaway post/comment targets created or approved for this proof.
- Execute at most one approved operation per target per run.
- Test `remove`, `approve`, and `ignore_reports` separately; do not infer one
  operation's behavior from another.
- Record the ModMirror receipt ID, execution result, Reddit visible state, and
  rollback/cleanup notes.
- Re-approve a removed throwaway target only if explicitly approved as cleanup
  or as the separate `approve` proof.

Not allowed in this test:

- Acting on real user incidents or non-consenting targets.
- Banning, muting, locking, distinguishing comments, adding native Mod Notes,
  sending messages, creating Mod Discussion/modmail conversations, running
  scheduler jobs, retention deletion, public comments, or external AI calls.
- Reporting content to create ignore-reports setup unless the user separately
  approves that setup on throwaway content.
- Testing spam removal; current service uses non-spam remove.
- Leaving live execution environment flags enabled after the diagnostic run.
- Treating a UI receipt as proof unless Reddit-visible target state or exact
  adapter error is also recorded.

## Preflight

- `git status --short --branch` is captured.
- `npx devvit whoami` reports the moderator account under test.
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass.
- `npm run dev` reaches Playtest ready for `r/modmirror_dev`.
- Each target thing ID, author, permalink, starting moderation state, and test
  marker are recorded before execution.
- The user explicitly approves the exact operation list for this run.
- A rollback/cleanup expectation is documented for each operation.
- Any temporary diagnostic route, environment flag, or proof-only UI is
  identified before the run and removed or disabled afterward.

## Runtime Steps

For each approved operation:

1. Confirm the target is a throwaway `t3_` post or `t1_` comment in
   `r/modmirror_dev`.
2. Confirm the target's starting state in Reddit UI or through a read-only API.
3. Run Apply Policy or a controlled diagnostic with explicit confirmation and
   `executionMode: "live"` for only the selected operation.
4. Record the returned execution result, receipt ID, error code/message, and
   Reddit operation field.
5. Verify Reddit-visible state after the operation:
   - `remove`: target is removed and receipt shows `redditOperation: remove`;
   - `approve`: target is approved/visible and receipt shows
     `redditOperation: approve`;
   - `ignore_reports`: reported throwaway target no longer shows actionable
     reports, or the exact API/runtime failure is recorded.
6. Run only the pre-approved cleanup action, if any.
7. Confirm live execution flags or proof-only routes are not left enabled.

## Evidence To Record

- Account used, without credentials.
- Devvit app version and subreddit.
- Exact command strings and UI/API route used.
- Target thing ID, type, author, permalink, and starting state.
- Operation requested and selected ModMirror action.
- Receipt ID and execution result payload.
- Reddit-visible state after execution.
- Cleanup/rollback action and result.
- Any permission, unsupported target, or adapter error shape.
- Confirmation that no unrelated Reddit write or delivery path was used.

## Completion Criteria

Live Reddit moderation execution may be marked runtime-verified only for the
exact operation and target type observed when:

- The proof used approved throwaway content in `r/modmirror_dev`.
- Each destructive operation was explicitly approved before execution.
- The exact ModMirror receipt and Reddit-visible result were recorded.
- Errors and permission failures were captured without retrying broadly.
- Cleanup/rollback notes were recorded.
- `RESEARCH.md`, `TODO.md`, `CAPABILITY_MATRIX.md`,
  `RUNTIME_VERIFICATION_MATRIX.md`, and the runtime proof backlog are updated.
- Live execution remains disabled as default product behavior unless a separate
  product decision enables a reviewed live mode after proof.
