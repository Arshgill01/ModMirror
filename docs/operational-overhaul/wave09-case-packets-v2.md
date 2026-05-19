# W09 Case Packets v2 Report

Date: 2026-05-18

Branch: `overhaul/w09-case-packets-v2`

Worktree: `/Users/arshdeepsingh/Developer/modmirror-w09-case-packets-v2`

## What Changed

- Added Case Packet types: `appeal_context`, `internal_review`, and
  `policy_dispute`.
- Added evidence source labels so packets distinguish verified receipts,
  verified ModMirror action history, inferred historical matches, demo seed
  data, and missing evidence.
- Updated Case Packets to prefer W04 action receipts when available.
- Included receipt IDs, target snapshots, and execution results in packet
  action context.
- Preserved action-event fallback with explicit caveats when receipts are not
  available.
- Updated Markdown export and client rendering to show packet type, receipt ID,
  execution result, and evidence labels.
- Added receipt-backed packet tests.

## Files Touched

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/casePacket.ts`
- `src/server/services/casePacket.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `TODO.md`
- `RESEARCH.md`
- `docs/operational-overhaul/CAPABILITY_MATRIX.md`
- `docs/operational-overhaul/CURRENT_REPO_TRUTH.md`
- `docs/operational-overhaul/EXECUTION_LOG.md`
- `docs/operational-overhaul/WAVE_STATUS.md`
- `docs/operational-overhaul/wave09-case-packets-v2.md`

## Commands Run

- `npm install`
- `npm run type-check`
- `npm test -- src/server/services/casePacket.test.ts`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

## Verification

- `npm test -- src/server/services/casePacket.test.ts` passed with 7 tests.
- `npm run type-check` passed.
- `npm run lint` passed.
- `npm test` passed with 21 files and 94 tests.
- `npm run build` passed.
- `git diff --check` passed.

## Runtime Status

No Devvit playtest was run for W09.

Receipt-backed packet generation is local/type/test verified only. Runtime
verification still needs to prove the API can read receipts from Devvit Redis
and render receipt-backed packets inside the Reddit WebView.

## Known Issues / Risks

- Case Packets remain context packets for moderator review, not automated
  appeal judgments.
- Comparable cases are deterministic matches; historical action-only comparables
  remain less reliable than receipt-backed comparables.
- Live target refetch is not enabled in W09 because runtime behavior and
  permissions still need proof.

## Next Recommended Wave

W10 AI Advisory Spike: research-only/advisory-only AI assistance if runtime and
secret handling are safe; no AI judging or authoritative enforcement.
