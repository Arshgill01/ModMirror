# Post-W34 Runtime Smoke Controls

Date: 2026-05-19

Branch: `post34/runtime-smoke-controls`

## Scope

This is a post-W34 build follow-up, not a submission pass. It adds an
authenticated Settings UI for existing safe smoke routes so runtime proof can
be gathered from inside Reddit's Devvit WebView instead of relying on external
curl calls that lack the WebView authorization token.

## What Changed

- Added Settings buttons for:
  - Redis smoke: `POST /api/smoke/redis`
  - Reddit read-only smoke: `POST /api/smoke/reddit`
- Kept both controls explicitly non-destructive in UI copy.
- Displayed pass/fail feedback after each smoke check.
- Reloaded the runtime capability matrix after each smoke check.
- Updated the legacy Redis/Reddit Settings summary cards to read from the
  runtime capability matrix so they do not contradict verified runtime status.

## Runtime Proof

Playtest:

- Command: `npm run dev`
- Devvit URL: `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`
- Versions observed:
  - `v0.0.1.73` for executing the smoke buttons.
  - `v0.0.1.74` for final UI confirmation after the Settings summary card fix.
- Browser: signed-in Zen desktop browser as `u/BrightyBrainiac`.
- Surface: existing `ModMirror policy dashboard` custom post in
  `r/modmirror_dev`.

Verified in Devvit WebView:

- Settings rendered the safe smoke controls.
- Redis smoke completed with the UI message:
  `Redis smoke passed: write/read matched inside Devvit playtest.`
- Reddit read-only smoke completed with the UI message:
  `Reddit read smoke passed: 0 rule(s), 0 removal reason(s), 5 mod log action(s).`
- Runtime capability matrix promoted to `2 runtime`.
- Final `v0.0.1.74` Settings summary cards showed:
  - `Redis status`: `verified runtime`
  - `Reddit source status`: `verified runtime`

## Still Not Verified

- Post/comment Apply Policy menu entrypoints.
- Real target context capture from post/comment menus.
- Log-only Apply Policy receipt creation in Devvit Redis.
- Destructive moderation execution (`remove`, `approve`, `ignoreReports`).
- Native Mod Notes, modmail/mod discussion delivery, scheduler jobs, native
  Reddit mobile app behavior, and non-mod access blocking.

## Commands Run

- `npm install`
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm run dev`

