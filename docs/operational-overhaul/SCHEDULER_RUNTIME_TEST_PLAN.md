# Scheduler Runtime Test Plan

Created: 2026-05-20

## Current Status

ModMirror does not register a scheduler task in `devvit.json`. Digest scheduler
status remains unverified, team-delivery scheduler status is unavailable, and
team-delivery scheduler confirmations are locally guarded as skipped so they do
not route through the Mod Discussion adapter.

Installed Devvit typings and docs expose scheduler support, including
`scheduler.runJob`, `scheduler.cancelJob`, `scheduler.listJobs`, and registered
server scheduler task handlers. Runtime registration, job invocation, payload
shape, retries, cancellation/listing behavior, and WebView observability have
not been verified in this app shape.

This plan is the required gate before claiming scheduled behavior or enabling
scheduled digest, delivery, retention cleanup, or any recurring ModMirror job.

## Scope

Allowed in this test, after explicit user approval:

- Use `r/modmirror_dev`.
- Register one proof-only scheduler task with a clearly marked name such as
  `modmirrorSchedulerSmoke`.
- The task may write only a scheduler smoke receipt/status record under a
  clearly marked smoke key.
- Trigger the task manually with `scheduler.runJob(...)` or the safest Devvit
  playtest-supported equivalent.
- List and cancel the test job if the installed scheduler client supports it in
  runtime.
- Record the exact job payload, returned job ID/result, timestamps, and any
  retry/error behavior.

Not allowed in this test:

- Sending Mod Discussion, modmail, private messages, public comments, or native
  Mod Notes from a scheduler task.
- Running retention deletion, moderation actions, external AI calls, report
  creation, bans, removals, approvals, or ignore-reports from a scheduler task.
- Enabling scheduled digest/team delivery as product behavior.
- Registering recurring production jobs or leaving proof-only jobs enabled
  after the run.
- Treating a scheduler-triggered skipped delivery receipt as proof of Mod
  Discussion delivery.

## Preflight

- `git status --short --branch` is captured.
- `npx devvit whoami` reports the moderator account under test.
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass
  after any proof-only scheduler configuration is added.
- `npm run dev` reaches Playtest ready for `r/modmirror_dev`.
- The proof-only scheduler task name, endpoint/handler, payload, Redis smoke
  key, and cleanup plan are documented before the run.
- The user explicitly approves registering and running one scheduler smoke job.

## Runtime Steps

1. Add a proof-only scheduler task registration and handler in the smallest
   possible patch.
2. Confirm the task performs only a smoke write/read or status-record update.
3. Run the full local validation gate after the proof-only patch.
4. Start Devvit playtest for `r/modmirror_dev`.
5. Trigger one scheduler smoke job manually.
6. Record the returned job ID/result or exact error.
7. Verify the scheduler smoke record appears in the expected subreddit
   namespace.
8. If supported and approved, list and cancel/clear the scheduler job.
9. Confirm no team-delivery adapter was invoked and no Reddit-side message or
   moderation action occurred.
10. Remove or disable the proof-only scheduler task unless a separate product
    decision keeps it behind a reviewed feature gate.

## Evidence To Record

- Account used, without credentials.
- Devvit app version and subreddit.
- Exact command strings and UI/API route used.
- Scheduler task name, endpoint/handler, payload, and trigger method.
- Returned job ID/result or exact error JSON/message.
- Smoke record key, value, and cleanup result.
- `listJobs` / `cancelJob` observations if tested.
- Confirmation that no delivery, retention deletion, moderation action, native
  Mod Note, external AI call, or public/private Reddit message was performed.

## Completion Criteria

Scheduler behavior may be marked runtime-verified only for the exact observed
smoke scenario when:

- A scheduler task was registered in the Devvit app shape under explicit
  approval.
- One scheduler smoke job ran or failed with exact runtime evidence.
- The task wrote only the approved smoke/status record.
- Listing/cancellation behavior was recorded if tested, or explicitly left
  unclaimed.
- Scheduler behavior was not conflated with Mod Discussion delivery, retention
  deletion, or digest delivery.
- `RESEARCH.md`, `TODO.md`, `CAPABILITY_MATRIX.md`,
  `RUNTIME_VERIFICATION_MATRIX.md`, and the runtime proof backlog are updated.
- Product scheduler features remain disabled unless a separate reviewed product
  decision enables a scoped scheduled workflow after proof.
