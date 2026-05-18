# Wave 11 - Team Delivery Spike

Date: 2026-05-18

Branch: `overhaul/w11-team-delivery-spike`

Worktree: `/Users/arshdeepsingh/Developer/modmirror-w11-team-delivery-spike`

## Summary

W11 researched Devvit internal Mod Discussion and scheduler support, then added
a preview-first team delivery layer. The layer can preview digest or policy
proposal delivery, store manual/skipped delivery receipts, and report capability
state honestly.

No Reddit Modmail/Mod Discussion message was sent. No scheduler task was
registered or run.

## What Changed

- Added team delivery shared contracts for:
  - delivery channel;
  - subject type;
  - capability state;
  - preview requests;
  - confirmation requests;
  - delivery receipts.
- Added Redis keys for delivery receipt lists and receipt details.
- Added `src/server/services/teamDelivery.ts` with:
  - capability reporting;
  - preview generation;
  - explicit confirmation requirement;
  - manual Markdown copy receipts;
  - skipped receipts for unverified runtime channels;
  - injected-adapter send path for tests only.
- Added `/api/delivery/capabilities`, `/api/delivery/preview`, and
  `/api/delivery/confirm`.
- Added Settings-page labels for team delivery and scheduler capability state.
- Added mocked Redis/adapter tests for manual fallback, skipped delivery, and
  guarded sends.

## Research Findings

- Devvit Modmail typings and official docs expose internal Mod Discussion
  creation through `createModDiscussionConversation`.
- Devvit Scheduler docs and typings expose scheduler tasks, `runJob`,
  `cancelJob`, and `listJobs`.
- Scheduler tasks must be declared in `devvit.json`; ModMirror does not yet
  register a scheduler task.

## Verification

- `npm install` - passed with the existing 31 audit findings.
- `npm run type-check` - passed.
- `npm test -- src/server/services/teamDelivery.test.ts` - passed, 5 tests.
- `npm run lint` - passed.
- `npm test` - passed, 23 files and 104 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

## Runtime Status

- No Devvit playtest was run for W11.
- No Mod Discussion or modmail message was created.
- No scheduler job was registered, scheduled, listed, cancelled, or run.
- Delivery receipts are locally verified with mocked Redis only.

## Safety Notes

- Product routes do not inject a live delivery adapter.
- Confirming mod discussion delivery without runtime proof stores a skipped
  receipt and does not send a Reddit message.
- Manual Markdown copy remains the only enabled delivery path.
- Scheduler capability is `unavailable`, not merely hidden, because there is no
  registered scheduler task.

## Integration Notes

- W12 can surface delivery capability state without enabling delivery.
- W13 must runtime-verify internal-only Mod Discussion behavior and scheduler
  task execution before either capability can move beyond unverified/unavailable.
- Delivery receipts use the `modmirror:{subreddit}:delivery:*` namespace and
  should be included in later evidence/review surfaces only after playtest
  verifies Redis persistence.
