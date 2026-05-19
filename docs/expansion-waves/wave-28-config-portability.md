# Wave 28: Configuration Portability

## Summary

Wave 28 adds safe export/import for ModMirror configuration. Portable packages
include policy ladders, response templates, digest settings, and clearly labeled
starter templates. Private moderation history is excluded by design.

## What Changed

- Added portable config schema for:
  - schema versions;
  - source labels;
  - portable policy config;
  - portable digest settings;
  - import requests/results;
  - starter template list responses.
- Added `src/server/services/configPortability.ts`.
- Added `/api/config/export`, `/api/config/import`, and
  `/api/config/templates`.
- Export packages include `includePrivateHistory: false` and warnings about
  excluded private data.
- Imports validate the whole package before writes.
- Imports support legacy v0 package migration through v1 validation.
- Imported policies are created as drafts or proposed updates; they are not
  automatically adopted.
- Added Settings controls for export JSON, import dry run/import, and starter
  templates.
- Added tests for privacy exclusion, dry run behavior, unsafe import failure,
  v0 migration, and starter template labeling.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/configPortability.ts`
- `src/server/services/configPortability.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `TODO.md`
- `RESEARCH.md`
- `docs/expansion-waves/wave-28-config-portability.md`

## Runtime Proof Status

Local/type/build verified only.

No Devvit playtest was run for this wave. Config export/import route behavior,
Redis-backed policy writes, and Settings interactions still need Devvit Web/
Redis runtime proof.

## Commands Run

- `npm install`
- `npm test -- src/server/services/configPortability.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

## Known Gaps

- Portable imports do not yet include retention/privacy settings because those
  settings are not first-class stored config yet.
- Digest import applies delivery mode and schedule enabled state; scheduler job
  IDs and generated digest history are intentionally excluded.
- There is no binary file upload control. Moderators paste reviewed JSON into
  the Settings form.

## Safety And Privacy Notes

- Exports exclude receipts, overrides, scans, content snapshots, Case Packets,
  Evidence Boards, delivery receipts, incident reports, and moderator activity
  logs.
- Bad imports fail before writes.
- Imported policies remain drafts or proposed updates and still require normal
  team review/adoption before they affect Apply Policy.
- Starter templates are labeled as starter templates and include no live data.
