# Wave 27: Incident Mode

## Summary

Wave 27 adds explicit, temporary Incident Mode for high-pressure moderation
windows such as raids, spam floods, brigading, and crisis handling. Incident
Mode changes ModMirror context and receipt tagging only. It does not execute
automatic moderation actions.

## What Changed

- Added Incident Mode shared schema for reasons, status, preset suggestions,
  triage groups, start/end requests, state response, and post-incident report.
- Added Redis keys for incident lists, incident detail records, and the active
  incident pointer.
- Added `src/server/services/incidentMode.ts`.
- Added `/api/incidents`, `/api/incidents/start`, and
  `/api/incidents/:id/end` routes.
- `confirmApplyPolicy` now tags receipts with the active incident ID when one
  exists.
- Added a Settings workflow to start/end incidents, inspect preset suggestions,
  inspect triage groups, and view the last post-incident report.
- Added a global active Incident Mode banner.
- Added receipt-ledger incident tags for post-incident review.
- Added tests for incident start/end/expiry behavior and Apply Policy receipt
  tagging.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/redis.ts`
- `src/server/services/incidentMode.ts`
- `src/server/services/incidentMode.test.ts`
- `src/server/services/applyPolicy.ts`
- `src/server/services/applyPolicy.test.ts`
- `src/server/services/receipts.ts`
- `src/server/services/receipts.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `TODO.md`
- `RESEARCH.md`
- `docs/expansion-waves/wave-27-incident-mode.md`

## Runtime Proof Status

Local/type/build verified only.

No Devvit playtest was run for this wave. Incident Mode Redis persistence, API
route behavior, active receipt tagging, and Settings interactions still need
Devvit Web/Redis runtime proof.

## Commands Run

- `npm install`
- `npm test -- src/server/services/incidentMode.test.ts src/server/services/applyPolicy.test.ts src/server/services/receipts.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

## Known Gaps

- Ending an incident stores the post-incident report response but does not yet
  persist the report as a separate first-class artifact.
- Incident triage groups are contextual guidance; they do not filter or mutate
  Reddit queues by themselves.
- Runtime persistence in Devvit Redis is unverified.

## Safety Notes

- Incident Mode must be started explicitly and has a capped duration.
- Apply Policy still requires normal moderator confirmation.
- No auto-remove, auto-ban, public comment, Modmail, or native Mod Note send is
  enabled by Incident Mode.
- Receipts created during an incident remain normal immutable receipts with an
  additional incident ID tag.
