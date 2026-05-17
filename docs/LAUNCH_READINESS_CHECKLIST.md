# Launch Readiness Checklist — ModMirror

## Local Checks

- [x] `npm install`
- [x] `npm run build`
- [x] `npm run type-check`
- [x] `npm test`
- [x] `npm run lint`
- [x] `npm audit` reviewed and documented

## Runtime Checks

- [x] Devvit app identity valid.
- [x] Playtest starts.
- [x] Inline card works.
- [x] Expanded dashboard works.
- [x] Command Center works.
- [x] Demo scenario works.
- [x] Live empty state is useful.
- [x] Mirror Scan works or degrades gracefully.
- [ ] Policies create/edit.
- [ ] Apply Policy works.
- [ ] Override review works.
- [ ] Case Packet works.
- [x] Manual Digest works locally and in playtest.
- [x] Markdown copy/export works locally and renders in playtest.
- [x] Runtime Settings shows capability status locally and in playtest.

## Role Checks

- [x] app owner/developer
- [x] subreddit moderator
- [ ] regular user/non-mod if possible

Expected:

- [ ] non-mods cannot access sensitive mod workflows.
- [ ] mod-only actions are hidden or blocked.
- [x] aggregate data is safe.
- [x] per-mod data is gated or omitted.

## Device Checks

- [x] desktop web
- [x] narrow viewport
- [ ] mobile web if possible
- [ ] Reddit mobile app if possible
- [x] dark Reddit UI

## UX Checks

- [x] first screen explains value in < 10 seconds.
- [x] no dead-end empty states.
- [x] demo mode is obvious.
- [x] primary CTAs are clear.
- [x] loading states exist.
- [x] error states are useful.
- [x] copy avoids unsupported claims.
- [x] no generic card-grid AI slop.
- [x] visual hierarchy is strong.

## Data Practices

- [x] stored data documented.
- [x] sensitive data minimized.
- [x] no external services.
- [x] no LLMs.
- [x] no cross-subreddit analytics.
- [x] no automatic punitive actions without human confirmation.
- [x] override data framed as team governance, not surveillance.

## Submission Assets

- [x] README updated for current wave.
- [x] App listing draft complete.
- [x] Devpost draft complete.
- [x] Project impact copy complete.
- [x] Screenshots captured.
- [x] Demo video script complete.
- [x] Known limitations clear.
- [x] Developer feedback notes drafted.
- [x] Final report complete after runtime QA.

## Current Evidence Notes

- Final Wave 9/10 local checks passed:
  - `npm install`
  - `npm run type-check`
  - `npm run lint`
  - `npm run build`
  - `npm test` with 15 files / 67 tests
- Static Playwright QA captured:
  - `output/playwright/wave9-10/digest-static.png`
  - `output/playwright/wave9-10/settings-static.png`
- Static QA reported no horizontal overflow for Digest or Settings, confirmed
  Digest History and Markdown Export are visible, and confirmed Settings shows
  scheduler capability status.
- Runtime playtest reached ready at:
  - URL: `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`
  - Version: `v0.0.1.70`
- Safari/Computer Use runtime QA verified:
  - Inline launch card renders in the Reddit post before dashboard open.
  - Open Dashboard enters the Devvit expanded modal.
  - Devvit viewport dropdown is present and exposes `Mobile`, `Desktop`, and
    `Fullscreen`.
  - Command Center loads as first dashboard screen.
  - ExampleLearning demo scan loads with 60 actions and labeled demo state.
  - Manual Digest generates in playtest, renders Markdown Export, and writes a
    Digest History row.
  - Settings page shows Digest History, Digest mod discussion `unverified`, and
    Digest scheduler `unverified` in playtest.
- Runtime screenshot captured:
  - `output/playwright/wave9-10/runtime-safari-digest-v0.0.1.70.png`
- `npm audit --audit-level=low` reports existing dependency issues: 31
  vulnerabilities (3 low, 27 high, 1 critical). Main remediation paths require
  out-of-range or breaking updates for `hono`, `vite`, and Devvit transitive
  `protobufjs`; no force remediation has been applied in this wave.

## Do Not Do Without Human Confirmation

- [ ] submit Devpost.
- [ ] publish app publicly.
- [ ] contact communities.
- [ ] claim partnerships.
- [ ] enable automatic scheduled posting on a real subreddit.
