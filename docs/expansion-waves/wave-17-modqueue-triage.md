# Expansion Wave 17 — Modqueue Triage

Status: implemented locally on `expansion/w17-modqueue-triage`.

## What Changed

- Added modqueue triage shared contracts for capability state, read-only queue
  items, policy hints, author history summaries, risk state, and API response.
- Added `src/server/services/modqueueTriage.ts`, a read-only normalization
  service that turns Devvit modqueue post/comment objects into Apply Policy
  targets with bounded content snapshots.
- Added `GET /api/modqueue/triage`.
- Added an Act-page Operational Queue panel that:
  - shows the current capability truth;
  - never substitutes demo/fake queue rows for live queue data;
  - lists Reddit modqueue items when the route returns them;
  - links a queue item into the Apply Policy target form.
- Updated `RESEARCH.md` and `TODO.md` with W17 platform status.

## Runtime Capability Status

Capability: type-only.

Evidence:

- Official Devvit Subreddit API docs list `getModQueue(options?)` returning a
  `Listing<Post | Comment>` and `getReports(options?)` for reported content:
  `https://developers.reddit.com/docs/api/redditapi/models/classes/Subreddit`.
- Installed typings expose:
  - `node_modules/@devvit/public-api/apis/reddit/models/Subreddit.d.ts`
    `getModQueue()` and `getReports()` overloads;
  - `node_modules/@devvit/public-api/apis/reddit/RedditAPIClient.d.ts`
    `getModQueue()` and `getReports()` overloads;
  - `node_modules/@devvit/protos/schema/devvit/plugin/redditapi/moderation/moderation_svc.proto`
    `/r/{subreddit}/about/modqueue` and `/about/reports` routes.

No W17 Devvit playtest was run, so the feature is not marked
runtime-verified. If the route fails in runtime, it returns `failed_runtime`
with no synthesized queue items.

## Files Touched

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/modqueueTriage.ts`
- `src/server/services/modqueueTriage.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `RESEARCH.md`
- `TODO.md`

## Commands Run

- `npm run type-check` — failed first on exact optional property typing, then
  passed after fixes.
- `npm test -- src/server/services/modqueueTriage.test.ts` — failed first on a
  too-strong policy-match expectation, then passed after matching the
  confidence model to the implementation.
- `npm run lint` — passed.
- `npm test` — passed, 26 files and 115 tests.
- `npm run build` — passed.
- `git diff --check` — passed.

## Known Issues

- `/api/modqueue/triage` has not been playtest-verified against real Reddit
  modqueue content.
- Queue item report-field shapes are based on official docs and installed
  typings; runtime may expose additional report metadata that W18/W33 should
  capture after proof.
- The policy hint is deterministic and conservative. It is not a moderation
  judgment, and moderators still choose the rule/action before confirmation.

## Next Recommended Wave

Proceed to Wave 18 attribution calibration after W17 passes the full local
validation gate and is committed.
