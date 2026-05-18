# Wave 29: Multi-Community Isolation

## Summary

Wave 29 tightens subreddit isolation for multi-community use. API routes now
resolve subreddit scope through a shared guard, cross-subreddit requests fail
before service calls, and Redis key creation rejects unsafe subreddit namespace
segments.

## What Changed

- Added `src/server/services/subredditIsolation.ts`.
- Added guarded scope resolution for:
  - current Devvit subreddit context;
  - explicitly labeled ExampleLearning demo data;
  - live-only subreddit requests.
- Added API error handling for subreddit isolation failures.
- Routed direct body-based subreddit writes through the shared guard for:
  - policy creation;
  - policy-from-drift creation;
  - attribution correction;
  - Apply Policy preview/confirm normalization.
- Added Redis namespace validation in `mmKey`.
- Added tests for current context resolution, demo exception, cross-subreddit
  rejection, live-context rejection, and unsafe Redis key names.
- Kept W28 portable starter-template reuse non-sensitive; it copies
  configuration only and imports as drafts/proposed updates.

## Files Changed

- `src/routes/api.ts`
- `src/server/services/redis.ts`
- `src/server/services/subredditIsolation.ts`
- `src/server/services/subredditIsolation.test.ts`
- `TODO.md`
- `RESEARCH.md`
- `docs/expansion-waves/wave-29-multi-community.md`

## Runtime Proof Status

Local/type/build verified only.

No Devvit playtest was run for this wave. The exact `context.subredditName`
values attached to Devvit Web requests and menu-origin requests still need
runtime proof before claiming live multi-community behavior is verified.

## Commands Run

- `npm install`
- `npm test -- src/server/services/subredditIsolation.test.ts src/server/services/configPortability.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

## Known Gaps

- This wave does not add cross-community dashboards or aggregate views.
- Runtime permission strings and moderator identity checks remain separate
  playtest work.
- Existing stored keys are not migrated; this wave guards new key generation
  and request resolution.

## Safety And Privacy Notes

- Live routes must match the current Devvit subreddit context.
- The only non-current namespace allowed by the resolver is the labeled
  ExampleLearning demo namespace.
- Portable template reuse remains configuration-only and excludes private logs.
- Unsafe subreddit names are rejected before Redis keys are built.
