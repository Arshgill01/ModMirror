# Wave 9/10 Final Report

## Summary

In progress on `integration/wave9-10-launch-readiness`.

Implemented so far:

- Wave 9/10 prompt pack installed in the expected root repo layout.
- Digest contracts, constants, Redis keys, server digest engine, API routes,
  digest history, client Digest page, Settings capability status, and targeted
  tests.
- Mod discussion delivery and scheduler are surfaced as unverified/disabled
  capabilities rather than enabled behavior.
- Launch/submission draft docs created.

## What Changed

- Added persisted digest history and deterministic digest reports.
- Upgraded Digest UI from client-only Markdown generation to server-backed
  report preview/history.
- Added digest delivery/scheduler status to Settings.
- Added app listing, Devpost, screenshot/video plan, app review/data practices,
  and Wave 9/10 planning docs.

## Branches / Worktrees

- Active branch: `integration/wave9-10-launch-readiness`
- Worktrees: none.

## Files Changed

To be finalized at merge.

## Commands Run

- `npm run type-check` — pass after digest implementation.
- `npm test -- src/server/services/digest.test.ts` — pass.
- `npm run lint` — pass.
- `npm test` — pass, 15 files / 67 tests.
- `npm run build` — pass.
- `npm audit --audit-level=low` — reviewed; exits 1 due existing audit
  findings.
- Static Playwright script against `serve dist/client` — pass for Digest and
  Settings overflow/content checks.

## Test Results

Current targeted/full local checks pass. Final gate still pending after launch
docs and runtime QA.

## Runtime Verification

Pending Wave 9/10 playtest.

## Digest Status

- Manual digest: implemented.
- Markdown export: implemented in UI and report.
- Digest history: implemented with Redis sorted-set history.
- Mod discussion delivery: unverified/disabled.
- Scheduler: unverified/disabled.

## Launch Readiness Status

In progress.

## Screenshots / Demo Assets

- Static artifacts:
  - `output/playwright/wave9-10/digest-static.png`
  - `output/playwright/wave9-10/settings-static.png`
- Static QA result:
  - Digest horizontal overflow: false.
  - Settings horizontal overflow: false.
  - Digest History visible: true.
  - Markdown Export visible: true.
  - Settings scheduler capability visible: true.

## Known Issues

- Redis runtime smoke is still not independently verified in playtest.
- Mod discussion delivery and scheduler are type-discovered but not
  runtime-verified.
- `npm audit --audit-level=low` reports 31 existing dependency vulnerabilities
  (3 low, 27 high, 1 critical). Force remediation would move `hono`, `vite`, or
  Devvit transitive packages outside the current supported range.

## Deferred Items

- Public comment/private message/modmail/native Mod Notes delivery.
- Scheduled digest posting.
- Public publish or Devpost submission.

## Product Decisions

- Manual digest plus Markdown copy remains the safe launch path.
- Delivery/scheduler are capability-reported, not enabled by default.

## Recommended Human Next Steps

Pending final Wave 9/10 completion.
