# Wave 33 Observability

## What Changed

- Added a runtime capability matrix service in `src/server/services/runtimeCapabilities.ts`.
- Added health-event persistence for capability proof attempts under `modmirror:{subreddit}:runtime:health-events`.
- Added `GET /api/runtime-capabilities` for Settings and `POST /api/runtime-capabilities/events` for manual/playtest proof recording.
- Updated `/api/smoke/redis` and `/api/smoke/reddit` to record passed/failed health events while preserving their response shape.
- Added Settings UI for Reddit API, Redis, menus, execution, comments, Mod Notes, modmail, AI, scheduler, retention cleanup, and demo fallback truth.
- Added tests for state classification, runtime promotion after passing checks, and failure recording without enabling destructive operations.

## Runtime Proof Status

No new Devvit playtest was run in this wave. W33 is type/build/static verified only.

The matrix intentionally starts most runtime-dependent capabilities as `type_only`, `disabled`, or `deferred`. A passing smoke event can promote safe testable capabilities such as Redis and Reddit read smoke to `verified_runtime`; destructive live execution cannot be promoted by a health event.

## Safety And Privacy Notes

- Live remove/approve/ignore-reports remains disabled and marked unsafe for normal playtest runs.
- Public comment delivery, native Mod Notes, AI, and scheduler behavior remain disabled or deferred.
- Demo fallback data is explicitly shown as `demo_only`.
- Health events store operational proof metadata and error summaries, not moderation payloads.

## Commands Run

- `npm install`
- `npm run type-check`
- `npm test -- src/server/services/runtimeCapabilities.test.ts src/server/services/runtimeVerification.test.ts`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`
- `npx --yes http-server dist/client -p 4174 -a 127.0.0.1`
- `npx --yes playwright screenshot --viewport-size=390,844 'http://127.0.0.1:4174/#settings' output/playwright/w33/settings-390.png`
- `npx --yes -p playwright node -e "...static settings matrix overflow check..."`

Static Playwright proof rendered the Settings page at 390px with an intercepted
runtime capability response: `scrollWidth = 390`, `innerWidth = 390`,
`rows = 3`. Screenshot path is `output/playwright/w33/settings-matrix-390.png`
and is intentionally not committed.

## Known Gaps

- Devvit runtime proof is still needed for Redis smoke, Reddit smoke, post/comment menus, and receipt persistence.
- Native Reddit mobile and non-moderator access proof remain open.
- Settings shows the latest stored capability events, but no operator-facing event submission form was added; events are recorded by smoke routes or API calls.
