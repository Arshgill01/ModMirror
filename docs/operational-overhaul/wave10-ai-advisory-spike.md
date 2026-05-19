# Wave 10 - AI Advisory Spike

Date: 2026-05-18

Branch: `overhaul/w10-ai-advisory-spike`

Worktree: `/Users/arshdeepsingh/Developer/modmirror-w10-ai-advisory-spike`

## Summary

W10 researched Devvit external fetch and secret-storage support, then added a
disabled-by-default AI advisory layer. The layer is advisory only, requires
deterministic evidence IDs, and cannot decide or execute enforcement.

No live external AI call was made. Runtime proof remains pending.

## What Changed

- Added shared AI advisory types for capability state, advisory kinds,
  deterministic evidence inputs, requests, and responses.
- Added `src/server/services/aiAdvisory.ts` with:
  - capability reporting;
  - disabled/no-provider fallback;
  - mocked-provider generation path for tests;
  - prompt construction that includes supplied evidence IDs;
  - rejection of provider output that does not cite known evidence IDs.
- Added `/api/ai/capabilities` and `/api/ai/advisory`.
- Added Settings-page capability labels for AI advisory and AI enforcement use.
- Added unit tests for default-disabled behavior, mocked provider output,
  rejected uncited output, and prompt evidence inclusion.
- Updated `RESEARCH.md`, `TODO.md`, `CAPABILITY_MATRIX.md`,
  `CURRENT_REPO_TRUTH.md`, `WAVE_STATUS.md`, and this wave report.

## Research Findings

- Devvit Web documentation says server-side code can use `fetch`, while client
  fetch is restricted to app endpoints.
- Devvit HTTP Fetch documentation requires HTTPS and allow-listed domains,
  documents a 30-second timeout, and lists global allow-list domains including
  `api.openai.com` and `generativelanguage.googleapis.com`.
- Devvit secrets documentation describes app-scoped secret settings managed by
  `devvit settings set` and retrieved during invocation.
- Installed typings expose `@devvit/settings` and Devvit Web config schema
  support for HTTP permissions/settings.

## Verification

- `npm install` - passed with the existing 31 audit findings.
- `npm test -- src/server/services/aiAdvisory.test.ts` - passed, 5 tests.
- `npm run type-check` - initially failed on an exact optional property issue
  in the client AI capability state; passed after fixing the state assignment.
- `npm run lint` - passed.
- `npm test` - passed, 22 files and 99 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

## Runtime Status

- No Devvit playtest was run for W10.
- No external AI provider was called.
- No app secret was configured or read.
- AI advisory remains disabled by default and labeled as such in Settings.

## Safety Notes

- No hardcoded keys were added.
- `devvit.json` HTTP permissions were not enabled by this wave.
- Default API behavior returns disabled fallback text instead of calling a
  provider.
- Provider output must cite deterministic evidence IDs supplied in the request.
- Response metadata always states moderator review is required and AI may not
  decide enforcement.

## Integration Notes

- Later runtime verification can replace the injected test provider with a real
  provider adapter only after HTTP permission, provider secret storage, latency,
  failure behavior, and terms/privacy requirements are proven.
- W12 may use the existing capability endpoint to show advisory status in the
  operational UI without enabling generation.
- W13 should include an AI advisory row in the runtime matrix and keep it
  disabled unless playtest proof exists.
