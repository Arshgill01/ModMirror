# Expansion Wave 18 — Attribution Calibration

Status: implemented locally on `expansion/w18-attribution-calibration`.

## What Changed

- Added attribution correction schema and corrected-action snapshots.
- Added Redis-backed correction persistence in
  `src/server/services/attributionCalibration.ts`.
- Updated the deterministic attribution engine so it infers first, then applies
  moderator corrections while preserving original evidence.
- Updated Mirror Scan to load correction records before attribution.
- Added `/api/attribution/corrections` GET/POST endpoints.
- Added a scan-page Attribution Calibration panel for stored scan actions.
- Added focused tests for correction persistence and future attribution
  improvement.

## Runtime Proof Status

Runtime status: local/type/test only.

No Devvit playtest was run for W18. Correction persistence writes to Redis
through the existing Devvit Redis client, but Redis runtime proof remains
unverified until a playtest saves a correction and a later scan applies it.

## Safety And Privacy

- Corrections do not execute moderation actions.
- Corrections are stored as rule/action calibration evidence, not per-mod
  performance analytics.
- Existing scan records remain immutable; correction records are stored
  separately and future scans include explicit `corrected` attribution evidence.
- The UI keeps inferred/corrected attribution separate from authoritative
  Reddit state.

## Files Touched

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/redis.ts`
- `src/server/services/attribution.ts`
- `src/server/services/attributionCalibration.ts`
- `src/server/services/attributionCalibration.test.ts`
- `src/server/services/attribution.test.ts`
- `src/server/services/mirrorScan.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `RESEARCH.md`
- `TODO.md`

## Commands Run

- `npm install` — passed; existing audit output still reports 31 issues.
- `npm test -- src/server/services/attribution.test.ts src/server/services/attributionCalibration.test.ts src/server/services/mirrorScan.test.ts` — passed after dependency install.
- `npm run type-check` — failed first on exact optional property typing, then
  passed after fixes.
- `npm run lint` — passed.
- `npm test` — passed, 27 files and 118 tests.
- `npm run build` — passed.
- `git diff --check` — passed.

## Known Gaps

- Correction persistence has not been verified in Devvit playtest.
- Existing saved scan records are not rewritten when a correction is saved;
  future scans apply the correction and record corrected evidence.
- The correction UI uses explicit rule key/name fields; a later wave can add
  safer rule pickers after policy/rule-source consolidation.

## Next Recommended Wave

Proceed to Wave 19 policy ratification after W18 passes full lint/test/build
validation and is committed.
