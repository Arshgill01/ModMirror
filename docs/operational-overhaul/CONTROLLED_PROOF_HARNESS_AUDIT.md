# Controlled Proof Harness Audit

Date: 2026-05-21

## Purpose

This audit closes V4 Wave 25 as a preparation wave only. It verifies that the
controlled proof runbooks and implementation gates exist for two high-risk
areas:

- real operational-record retention deletion;
- live Reddit remove, approve, and ignore-reports execution.

This audit does not authorize or claim either destructive proof run.

## Retention Deletion Harness

Runbook:

- `docs/operational-overhaul/RETENTION_DESTRUCTIVE_TEST_PLAN.md`

Implementation gates:

- `deletePrivacyData` keeps all deletion requests dry-run by default when
  requested that way.
- `deletePrivacyData` throws before any real deletion unless
  `confirmDeletion === true`.
- The Settings UI requires an explicit confirmation checkbox before real
  delete or expired-delete submissions.
- The protected policy-history report is always returned in deletion results.
- The synthetic retention cleanup diagnostic uses deliberately created
  synthetic records and does not claim real operational-record proof.

Required runtime proof before upgrading status:

- user approval for the exact `r/modmirror_dev` destructive cleanup pass;
- unique marked records only;
- inventory export before setup;
- dry-run counts matching only the marked records;
- real deletion removing exactly those records;
- post-delete list/detail checks;
- proof that unrelated records and policy history remain present.

## Reddit Moderation Execution Harness

Runbook:

- `docs/operational-overhaul/REDDIT_MODERATION_EXECUTION_TEST_PLAN.md`

Implementation gates:

- `executeModerationAction` skips or fails before adapter calls unless a
  moderator confirmed the action.
- A `t3_` post or `t1_` comment target is required.
- Live adapter calls require `executionMode: "live"`.
- Live adapter calls also require both
  `MODMIRROR_ENABLE_LIVE_REDDIT_ACTIONS=true` and
  `MODMIRROR_REDDIT_ACTIONS_RUNTIME_VERIFIED=true`.
- Receipt creation must remain available.
- The default product path remains log-only or unverified-disabled unless all
  gates are met.

Required runtime proof before upgrading status:

- user approval for each exact operation;
- throwaway target IDs, authors, permalinks, and starting states recorded;
- one operation per target per run;
- receipt ID and Reddit-visible result recorded;
- exact adapter error recorded if the operation fails;
- cleanup or rollback notes recorded;
- live flags disabled again after the proof.

## No-Go Boundary

Do not perform any of these from this audit:

- delete real operational records;
- remove, approve, or ignore reports on Reddit content;
- create public content or reports to set up a proof target;
- leave live execution flags enabled;
- promote runtime capability status from plan-only to verified.

## Status

Harness preparation is complete.

Runtime proof remains open and requires explicit approval of the exact
destructive run before execution.
