# Wave 26: Collaborative Evidence Board

## Summary

Wave 26 adds a collaborative Evidence Board for disputed actions and policy
reviews. Boards collect bounded evidence summaries from existing ModMirror
sources and track review status over time.

## What Changed

- Added Evidence Board shared schema for:
  - statuses;
  - source references;
  - privacy metadata;
  - evidence summaries;
  - status history.
- Added Redis keys for board lists and board details.
- Added `src/server/services/evidenceBoard.ts`.
- Added `/api/evidence-boards` list/create and
  `/api/evidence-boards/:id/status` update routes.
- Evidence collection can attach:
  - action receipts;
  - content snapshots from receipts;
  - overrides;
  - Case Packets;
  - comparable cases from Case Packets;
  - policy change events.
- Added Prove-page Evidence Board UI with review-thread rows and status update
  forms.
- Added entrypoints from the receipt ledger and current Case Packet to open an
  Evidence Board.
- Added service tests for multi-source evidence, lifecycle updates, and privacy
  flags.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/redis.ts`
- `src/server/services/evidenceBoard.ts`
- `src/server/services/evidenceBoard.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `TODO.md`
- `RESEARCH.md`
- `docs/expansion-waves/wave-26-evidence-board.md`

## Runtime Proof Status

Local/type/build verified only.

No Devvit playtest was run for this wave. Evidence Board Redis persistence,
route behavior, and Prove-page interactions still need Devvit Web/Redis
runtime proof.

## Commands Run

- `npm install`
- `npm test -- src/server/services/evidenceBoard.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

## Known Gaps

- Generated Case Packets are still not persisted as first-class records; the UI
  can open a board from the current packet in memory.
- Evidence Boards store summaries and source IDs, not full source artifacts.
- Runtime route persistence in Devvit Redis is unverified.

## Safety And Privacy Notes

- Evidence Board summaries do not copy moderator usernames or target authors.
- Content snapshot summaries copy only bounded excerpts already captured by the
  receipt/snapshot layer.
- Evidence Boards do not send Modmail, create Mod Notes, execute moderation
  actions, or alter policy adoption state.
