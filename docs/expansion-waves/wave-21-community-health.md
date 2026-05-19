# Expansion Wave 21 — Community Health

Date: 2026-05-18

Branch: `expansion/w21-community-health`

Base: `expansion/w20-replay-sandbox` at `9435dca`

## Summary

Wave 21 adds an aggregate community health lens tied to consistency. It uses
stored ModMirror evidence only and avoids per-moderator leaderboard or blame
fields.

Implemented:

- shared community health schema;
- aggregate health service using stored actions, overrides, receipts, scans,
  policies, and policy change events;
- repeat-author bucket counts without exposing usernames;
- drift stability, policy churn, unresolved override, and receipt-backed
  case-packet readiness signals;
- `/api/community-health`;
- Review-page Community Health panel;
- tests for empty communities, small samples, and aggregate rule signals.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/communityHealth.ts`
- `src/server/services/communityHealth.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `TODO.md`
- `RESEARCH.md`

## Runtime Status

No Devvit playtest was run in this wave. Community health is local/type/test
verified only. The service is deterministic over stored data, but the API route
still needs Redis runtime proof in Devvit playtest.

## Commands Run

- `npm install` — passed, with the existing 31 audit findings.
- `npm test -- src/server/services/communityHealth.test.ts` — passed.
- `npm run type-check` — passed.
- `npm run lint` — passed.
- `npm test` — passed, 30 files and 129 tests.
- `npm run build` — passed.
- `git diff --check` — passed.

## Safety And Privacy Notes

- No per-moderator leaderboard fields are emitted.
- Moderator usernames are not surfaced in the community health summary.
- Repeat-offense signals are aggregate counts by rule.
- Empty and small-sample states are labeled before health claims are made.
- No Reddit moderation action behavior changed in this wave.

## Known Gaps

- Runtime Redis/API verification is still needed.
- Case packet volume is currently represented as receipt-backed readiness
  because generated case packets are not persisted yet.
- The UI shows the top rule signal first. A later wave can add richer rule
  comparison if it remains aggregate-only.

## Next Wave

Wave 22 should focus on policy impact using stored receipts and scans while
preserving the same small-sample and runtime-proof honesty.
