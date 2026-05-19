# Wave 30: Privacy Retention Controls

## Summary

Wave 30 adds a real data lifecycle surface for ModMirror operational records.
Moderators can inspect retention settings, export a count-only privacy inventory,
dry-run deletions, delete selected data categories, and delete expired records
according to retention windows. Policy history remains protected by default.

## What Changed

- Added shared privacy retention settings, deletion, inventory, and category
  contracts.
- Added API routes:
  - `GET /api/privacy/retention`
  - `PUT /api/privacy/retention`
  - `GET /api/privacy/export`
  - `POST /api/privacy/delete`
- Added Redis key support for retention settings and guarded key deletion.
- Added `privacyRetention` service logic for:
  - default retention windows;
  - settings updates with 1-3650 day normalization;
  - inventory reports without private payload export;
  - dry-run and live deletion paths;
  - expired-only cleanup by category;
  - protected policy history reporting.
- Added Settings UI controls for retention windows, inventory export, dry-run,
  selected category deletion, and expired deletion.
- Added focused service tests covering settings, export, dry-run, and expired
  cleanup behavior.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/redis.ts`
- `src/server/services/privacyRetention.ts`
- `src/server/services/privacyRetention.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `TODO.md`
- `RESEARCH.md`
- `docs/expansion-waves/wave-30-privacy-retention.md`

## Runtime Proof Status

Local/type/build verified only.

No Devvit playtest was run for this wave. Redis cleanup behavior is covered by
mocked service tests, but live Devvit Redis deletion and route behavior still
need safe playtest proof before cleanup can be called runtime-verified.

## Commands Run

- `npm test -- src/server/services/privacyRetention.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

## Known Gaps

- Case Packets and AI advisory logs are represented in settings/reports but do
  not have first-class persisted record stores in this build.
- W30 does not add a scheduler task for automatic cleanup because scheduler
  runtime behavior is still unverified.
- Inventory export reports counts and warnings only; it intentionally does not
  export private operational payloads.

## Safety And Privacy Notes

- Policy versions and policy change history are protected and not available in
  deletion controls.
- Deletion controls include a dry-run path and report the exact category counts
  selected before a destructive action.
- Redis keys remain subreddit-namespaced through the existing W29 isolation
  guard.
