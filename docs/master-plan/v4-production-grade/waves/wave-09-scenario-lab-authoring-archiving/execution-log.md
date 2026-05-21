# Wave 09 Execution Log

Date: 2026-05-21

Branch: `codex/wave-09-scenario-lab`

## What Changed

- Added acceptable-alternative controls to Scenario Lab.
- Added Scenario Lab saving/archive UI state, success messages, disabled
  in-flight buttons, and explicit client-side required-field validation.
- Added a labeled static-preview calibration fallback so Scenario Lab can be
  inspected without a live API.
- Tightened scenario route validation so missing expected actions are rejected.
- Fixed calibration scenario listing so archived records override older active
  Redis sorted-set members with the same scenario ID.
- Added calibration service tests for required fields, acceptable alternatives,
  and archive removal from the active pack.

## Validation

- `npm install` passed; npm reported 32 existing vulnerabilities.
- `git restore package-lock.json || true` ran after install to discard lockfile
  churn.
- `npm test -- src/server/services/calibration.test.ts` passed: 1 file, 4 tests.
- `npm run type-check` passed before the static fallback.
- `npm run type-check` later failed on widened static-fallback privacy flags;
  fixed by preserving literal `false` privacy values.
- `npm run type-check` passed after the fix.
- `git diff --check` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `npm test` passed: 62 files, 261 tests.
- Root post-merge `npm test -- src/server/services/calibration.test.ts`
  initially failed because create/archive in the same millisecond could tie
  Redis sorted-set scores and leave the older active member visible. Fixed by
  making scenario update timestamps monotonic.
- Root post-fix `npm test -- src/server/services/calibration.test.ts` passed:
  1 file, 4 tests.
- Root post-fix `npm run type-check` passed.

## Visual Proof

- Static browser smoke was run after `npm run build`.
- `python3 -m http.server 5180 --bind 127.0.0.1 --directory dist/client`
  served the built static client.
- The built client opened on `http://127.0.0.1:5180/#review`.
- The Review page showed Scenario Lab with title, prompt, rule, expected action,
  acceptable alternatives, explanation, teaching reason, active toggle, save
  control, and archive controls on active scenarios.
- The static server was stopped after the smoke.

## Known Issues

- Static smoke does not prove Redis persistence through Devvit runtime.
- The workflow remains calibration-practice only and does not create Reddit
  moderation actions.
