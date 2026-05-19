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

Runtime verified for Devvit Web request context and API isolation.

On 2026-05-19, Devvit playtest `v0.0.1.122` for `r/modmirror_dev` exposed the
WebView API with an authenticated Devvit JWT. The token itself was not stored.
Redacted API probes verified:

- `GET /api/health` returned version `0.0.1.122`, subreddit
  `modmirror_dev`, and user `BrightyBrainiac`.
- `GET /api/policies` with no query returned two policies, all scoped to
  `modmirror_dev`.
- `GET /api/policies?subreddit=modmirror_dev` returned the same current
  subreddit scope.
- `GET /api/policies?subreddit=ExampleLearning` returned the labeled demo
  namespace without crossing into another live subreddit.
- `GET /api/policies?subreddit=OtherCommunity` and
  `GET /api/runtime-capabilities?subreddit=OtherCommunity` returned
  `403 subreddit_isolation_failed`.
- `GET /api/modqueue/triage?subreddit=OtherCommunity&limit=1` returned
  `403 subreddit_isolation_failed` with the live-context mismatch message.
- `POST /api/policies` with body `subreddit: OtherCommunity` returned
  `400 policy_validation_failed` with the cross-subreddit isolation message
  before any policy write.

No public Reddit writes, live scan/demo load actions, moderation actions, or
Mod Discussion/native Mod Note operations were performed.

## Commands Run

- `npm install`
- `npm test -- src/server/services/subredditIsolation.test.ts src/server/services/configPortability.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`
- `npx devvit whoami`
- `npm run dev`
- `curl -sS -i https://modmirror-hw8un4-0-0-1-121-webview.devvit.net/api/health`
- `curl` / `node` probes against
  `https://modmirror-hw8un4-0-0-1-122-webview.devvit.net` with
  `Authorization: Bearer <redacted Devvit JWT>`

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
