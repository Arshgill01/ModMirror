# Expansion Wave 20 — Replay Sandbox

Date: 2026-05-18

Branch: `expansion/w20-replay-sandbox`

Base: `expansion/w19-policy-ratification` at `3892b50`

## Summary

Wave 20 adds a read-only replay sandbox so moderators can test a policy ladder
against stored scan history or supplied synthetic actions before adoption. The
replay uses the existing deterministic policy recommendation logic and does not
write receipts, action events, overrides, or Reddit moderation state.

Implemented:

- shared replay request/result contracts;
- pure replay service for scan-derived or synthetic attributed actions;
- replay fixtures and edge-case tests;
- `/api/policies/:id/replay`;
- Agree-page Replay buttons and a replay result panel;
- explicit warnings when replay uses synthetic data or skips non-matching
  actions.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/replaySandbox.ts`
- `src/server/services/replaySandbox.test.ts`
- `src/server/services/fixtures/replaySandbox.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `TODO.md`
- `RESEARCH.md`

## Runtime Status

No Devvit playtest was run in this wave. Replay behavior is local/type/test
verified only. The replay service itself is pure and does not need live Reddit,
but the API path that loads stored scan records still requires Redis runtime
proof in Devvit playtest.

## Commands Run

- `npm install` — passed, with the existing 31 audit findings.
- `npm test -- src/server/services/replaySandbox.test.ts` — passed.
- `npm run type-check` — passed after exact-optional typing fixes.
- `npm run lint` — passed.
- `npm test` — passed, 29 files and 126 tests.
- `npm run build` — passed.
- `git diff --check` — passed.

## Safety And Privacy Notes

- Replay is read-only and does not mutate receipts.
- Replay does not call Reddit moderation APIs.
- Synthetic fallback is labeled as synthetic/demo and is not presented as live
  subreddit history.
- The UI only shows aggregate replay outcomes and action IDs; it does not add
  per-moderator blame analytics.

## Known Gaps

- Runtime Redis/API verification is still needed for replaying a stored scan
  through Devvit Web.
- The current UI replays the latest stored scan loaded in the client. A later
  wave can add explicit scan selection if moderators need side-by-side replay.
- Replay compares historical normalized action to the policy recommendation; it
  does not yet model message delivery side effects or future user behavior.

## Next Wave

Wave 21 should build community health signals from existing aggregate evidence
without adding per-mod blame views or unverified runtime claims.
