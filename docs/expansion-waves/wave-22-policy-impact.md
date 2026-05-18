# Expansion Wave 22 — Policy Impact

Date: 2026-05-18

Branch: `expansion/w22-policy-impact`

Base: `expansion/w21-community-health` at `df684e0`

## Summary

Wave 22 adds policy-detail impact measurement. It compares receipt-backed
consistency before and after an adopted policy version, includes scan-history
caveats, and refuses to claim impact when before/after data windows are too
small.

Implemented:

- shared policy impact measurement schema;
- `policyImpact` service using policy versions, receipts, overrides, and scans;
- `/api/policies/:id/impact`;
- policy-version detail UI with before/after consistency;
- demo-labeled impact fallback;
- tests for thresholded improvement, insufficient data, and demo labeling.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/policyImpact.ts`
- `src/server/services/policyImpact.test.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `TODO.md`
- `RESEARCH.md`

## Runtime Status

No Devvit playtest was run in this wave. Policy impact is local/type/test
verified only. Redis-backed route behavior still needs Devvit Web runtime proof.

## Commands Run

- `npm install` — passed, with the existing 31 audit findings.
- `npm test -- src/server/services/policyImpact.test.ts` — passed.
- `npm run type-check` — passed.
- `npm run lint` — passed.
- `npm test` — passed, 31 files and 132 tests.
- `npm run build` — passed.
- `git diff --check` — passed.

## Safety And Privacy Notes

- Impact claims require minimum before and after receipt windows.
- Demo impact is labeled as demo and is not described as live proof.
- The model uses aggregate receipt and scan evidence, not per-mod analytics.
- No moderation execution behavior changed in this wave.

## Known Gaps

- Runtime Redis/API verification is still needed.
- Impact covers ModMirror receipts and scan history, not every Reddit mod
  action unless those actions are scanned and attributed.
- Scan caveats are included, but the UI currently renders a compact summary
  rather than the full impact timeline.

## Next Wave

Wave 23 should build reusable response/macro library workflows without enabling
unverified public delivery defaults.
