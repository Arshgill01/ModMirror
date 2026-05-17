# Wave 9/10 Exec Plan

## Objective

Build the final digest/reporting loop and launch-readiness package without
changing ModMirror's consistency-first, human-in-the-loop product boundary.

## Current Evidence

- Wave 7/8 is merged to `master` at merge commit
  `273316d6d890886593ac2fbfd421ba5d8eb79a3e`.
- `master` passed `npm install`, `npm run type-check`, `npm run lint`,
  `npm run build`, `npm test`, and `npm run dev` to Devvit playtest ready at
  `v0.0.1.68`.
- Wave 9/10 prompt docs are installed in root `docs/`, `prompts/wave9-10/`,
  and `scripts/` on `integration/wave9-10-launch-readiness`.

## Implementation Slices

1. Digest contracts and storage
   - Add digest report, recommendation, delivery, capability, history, and
     settings types.
   - Add Redis keys for digest history and digest settings.
   - Keep manual digest mandatory; keep delivery/scheduler capability honest.

2. Digest engine and API
   - Build a deterministic server digest service from policies, policy health,
     overrides, actions, and last scan metadata.
   - Persist digest history in Redis.
   - Add API routes for generate/history/capabilities/settings.
   - Add focused tests for generation, Markdown, recommendations, and history.

3. Digest UI and settings
   - Rewire the Digest page to server-generated reports.
   - Show summary, rules needing attention, stable rules, unresolved overrides,
     recommendations, copy Markdown, delivery status, and history.
   - Add runtime settings/capability status for mod discussion delivery and
     scheduler.

4. Optional delivery/scheduler research
   - Verify installed SDK typings for modmail/mod discussion and scheduler.
   - If runtime is not verified, keep both unavailable/disabled by default and
     document exact findings in `RESEARCH.md`.

5. Launch hardening and submission assets
   - Update product/data/demo/submission docs.
   - Create app listing draft, Devpost draft, screenshot/video plan, final
     report, and filled launch checklist.
   - Run visual/runtime QA where available.

## Validation Plan

- Targeted digest tests during implementation.
- Full gate before merge: `npm install`, `npm run build`,
  `npm run type-check`, `npm test`, `npm run lint`.
- `npm run dev` playtest if available.
- Screenshot/browser QA for Digest and Settings after UI changes where tooling
  allows.

## Deferred Unless Verified

- Automatic scheduled posting.
- Mod discussion delivery.
- Any non-log-only moderation delivery path.
- Public publishing or Devpost submission.
