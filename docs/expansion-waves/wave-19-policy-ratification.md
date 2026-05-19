# Expansion Wave 19 — Policy Ratification

Date: 2026-05-18

Branch: `expansion/w19-policy-ratification`

Base: `expansion/w18-attribution-calibration` at `12c4df7`

## Summary

Wave 19 turns the existing policy lifecycle into a stronger team workflow. The
repo already had draft/propose/review/adopt states from the operational
overhaul, so this wave tightened the missing ratification behavior instead of
duplicating the lifecycle.

Implemented:

- explicit `PolicyRatificationSettings` and `PolicyRatificationSummary`
  contracts;
- a pure `policyRatification` service for threshold normalization, latest-vote
  counting, and reviewer vote replacement;
- proposal notes persisted on proposed policies and policy versions;
- reviewed adoption threshold enforcement;
- explicit quick adoption that can be disabled per policy;
- Agree UI controls for approval threshold and quick-adoption allowance;
- policy cards that show approval progress and proposal notes;
- tests for threshold adoption, blocked quick adoption, and helper behavior.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/shared/demoData.ts`
- `src/server/services/policyRatification.ts`
- `src/server/services/policyRatification.test.ts`
- `src/server/services/policies.ts`
- `src/server/services/policies.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `TODO.md`
- `RESEARCH.md`

## Runtime Status

No Devvit playtest was run in this wave. Policy ratification is local/type/test
verified only. Redis persistence and live API writes still need playtest proof
before being described as runtime-verified.

## Commands Run

- `npm test -- src/server/services/policies.test.ts src/server/services/policyRatification.test.ts` — failed before `npm install` because `vitest` was not installed in this worktree.
- `npm run type-check` — failed before `npm install` because package types were missing; it also exposed exact-optional typing issues that were fixed.
- `npm install` — passed, with the existing 31 audit findings.
- `npm test -- src/server/services/policies.test.ts src/server/services/policyRatification.test.ts` — passed.
- `npm run type-check` — passed.
- `npm run lint` — passed.
- `npm test` — passed, 28 files and 123 tests.
- `npm run build` — passed.
- `git diff --check` — passed.

## Safety And Privacy Notes

- Unadopted draft/proposed/review policies remain inactive for Apply Policy.
- Reviewed adoption now requires approval votes unless quick adoption is
  explicitly requested and allowed.
- Quick adoption remains visible in the UI and is recorded as an explicit
  adoption mode, not a silent default.
- No per-moderator analytics or blame surfaces were added.
- No Reddit moderation action behavior changed in this wave.

## Known Gaps

- Runtime Redis/API proof is still required.
- The UI records fixed proposal/review notes from buttons; richer note entry can
  be added later if it proves useful to moderators.
- Permission-gated reviewer roles are still not runtime-proven, so the wave
  avoids claiming stronger voting authority than the current Devvit context can
  verify.

## Next Wave

Wave 20 should build replay/sandbox behavior on top of the ratified policy
contracts without changing live moderation execution defaults.
