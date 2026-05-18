# Wave 16 - Live Context Intake And Content Snapshotting

Date: 2026-05-18

Branch: `expansion/w16-context-intake`

Worktree: `/Users/arshdeepsingh/Developer/modmirror-w16-context-intake`

## Summary

Wave 16 adds a stable content snapshot layer for post/comment moderation
targets. Snapshots record bounded Reddit target context, fetch status, source,
timestamp, warnings, and privacy metadata so receipts and Case Packets can
carry evidence without pretending full live content is always available.

## What Changed

- Added shared `ContentSnapshot` schema with fetch status, source, target
  excerpts, and privacy metadata.
- Added `src/server/services/contentSnapshots.ts` for target snapshot capture
  from either resolved Reddit target context or provided dashboard/menu data.
- Added snapshot capture to Apply Policy previews.
- Persisted snapshots on action receipts when available.
- Added receipt-backed Case Packet evidence and Markdown lines for content
  snapshots.
- Carried menu-resolved title/body/permalink through dashboard handoff hash
  params and Apply Policy payloads.
- Updated demo/static fallback Apply Policy receipts to include demo content
  snapshots.

## Runtime Status

This wave is local/type/test verified only.

No Devvit playtest was run for W16, so runtime menu delivery of title/body
hash params, live Reddit target fetching, and Devvit Redis persistence remain
unverified. The implementation keeps degraded snapshots explicit when content
fetching is unavailable or fails.

## Safety And Privacy Notes

- Snapshots store excerpts, not full target content.
- Title excerpts are capped at 160 characters.
- Body excerpts are capped at 500 characters.
- Each snapshot records privacy metadata showing whether author, title, body,
  and permalink fields were stored.
- Failed fetches create degraded snapshots with warnings rather than silently
  fabricating evidence.
- No Reddit moderation action gates were changed.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/contentSnapshots.ts`
- `src/server/services/contentSnapshots.test.ts`
- `src/server/services/applyPolicy.ts`
- `src/server/services/applyPolicy.test.ts`
- `src/server/services/receipts.ts`
- `src/server/services/receipts.test.ts`
- `src/server/services/casePacket.ts`
- `src/server/services/casePacket.test.ts`
- `src/routes/forms.ts`
- `src/client/main.ts`
- `TODO.md`
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- `docs/expansion-waves/wave-16-context-intake.md`

## Commands Run

- `npm install` - passed, with existing 31 audit findings.
- `npm run type-check` - passed.
- `npm test -- src/server/services/contentSnapshots.test.ts src/server/services/applyPolicy.test.ts src/server/services/receipts.test.ts src/server/services/casePacket.test.ts`
  - passed, 4 files and 21 tests.
- `npm run lint` - passed.
- `npm test` - passed, 25 files and 111 tests.
- `npm run build` - passed.
- `git diff --check` - passed.
- `git diff -- package-lock.json` - passed with no output after restoring
  install churn.

## Known Gaps

- Post/comment Apply Policy menu entrypoints are still not runtime-verified in
  Reddit post/comment detail contexts.
- Runtime Redis receipt persistence remains unverified.
- Content snapshots loaded from dashboard-provided values are useful evidence
  but weaker than a runtime-fetched target snapshot.
- Native mobile behavior remains unverified.

## Next Wave Notes

Wave 17 should not fake a moderation queue. It should first research current
Devvit support for modqueue/report APIs, then build either a real supported
adapter or a truthful unavailable capability state that links back into Apply
Policy when a real target is present.
