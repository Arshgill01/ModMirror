# Retention Destructive Cleanup Test Plan

Created: 2026-05-20

## Current Status

ModMirror has runtime proof for privacy retention settings, inventory export,
dry-run deletion controls, and the synthetic retention cleanup smoke route.

The synthetic smoke route proves that old synthetic scan, action receipt,
Evidence Board, and team-delivery receipt records can be deleted from Redis
detail keys and indexes in Devvit playtest. It does not prove deletion against
real operational records created by normal ModMirror workflows.

This plan is the required gate before any real operational-record retention
cleanup runtime proof is attempted.

## Scope

Allowed in this test:

- Create fresh throwaway operational records in `r/modmirror_dev`.
- Use records created specifically for this test only.
- Verify scan history, action receipt, Evidence Board, and team-delivery
  receipt deletion behavior.
- Use Devvit WebView Settings and existing API routes.

Not allowed in this test:

- Deleting pre-existing moderator evidence, historical receipts, policy
  versions, policy history, or unrelated scan records.
- Changing retention windows for production communities.
- Running scheduled cleanup.
- Running Reddit moderation actions, Mod Notes, Mod Discussion sends, public
  comments, private messages, bans, approvals, removals, or ignore-reports.

## Preconditions

- User explicitly approves a destructive cleanup playtest for
  `r/modmirror_dev`.
- `git status --short --branch` is captured.
- `npx devvit whoami` reports the expected moderator account.
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass.
- `npm run dev` reaches Playtest ready for `r/modmirror_dev`.
- Existing retention settings are recorded before modification.
- Existing privacy inventory counts are exported before creating test records.
- A unique test marker is chosen, for example
  `retention-real-cleanup-YYYYMMDD-HHMM`.

## Test Record Setup

Create only records that can be clearly identified by the unique marker:

- One live or demo-labeled scan record whose metadata contains the marker.
- One log-only Apply Policy receipt whose target ID or override note contains
  the marker.
- One Evidence Board opened from that receipt or a marked Case Packet.
- One manual/skipped team delivery receipt whose title contains the marker.

Do not reuse older receipts or boards. If any record cannot be marked
unambiguously, stop the test.

## Dry Run Gate

Before deleting anything:

- Export privacy inventory.
- Run selected-category dry run for the intended categories.
- Confirm the dry run reports only the marked test records as selected, or stop.
- Confirm `Policy history Protected` appears in the dry-run output.
- Capture the exact UI/API output in `RESEARCH.md` or
  `docs/operational-overhaul/EXECUTION_LOG.md`.

## Destructive Step

Only after the dry-run gate passes:

- Run deletion for the selected marked categories.
- Do not select policy history.
- Do not run broad `Delete selected` or `Delete expired` if the UI/API cannot
  distinguish the marked records from unrelated records.
- If the result reports more records deleted than expected, stop and document
  the mismatch immediately.

## Verification

After deletion:

- Export privacy inventory again.
- Reload receipt ledger and Evidence Board list.
- Confirm the marked records are absent from list/detail routes.
- Confirm unrelated records from the pre-test inventory remain present.
- Confirm policies and policy history still load.
- Confirm runtime capability status does not promote scheduled cleanup or
  real-record deletion beyond the exact tested categories.

## Rollback And Cleanup

- Restore original retention settings if they were changed.
- Leave a clear execution-log entry with record IDs, counts, and exact commands.
- If any unexpected deletion occurs, document affected IDs and stop further
  destructive testing.

## Completion Criteria

This gap may be described as runtime-verified only when all are true:

- The test used explicitly marked throwaway records.
- Dry-run output selected only those marked records.
- Destructive deletion removed exactly those marked records.
- Post-delete inventory/list/detail checks proved removal.
- Unrelated operational records and policy history remained intact.
- Exact commands, Devvit version, subreddit, account, record IDs, and UI/API
  result text were recorded.
