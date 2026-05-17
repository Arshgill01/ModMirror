# Launch Readiness Checklist — ModMirror

## Local Checks

- [ ] `npm install`
- [x] `npm run build`
- [x] `npm run type-check`
- [x] `npm test`
- [x] `npm run lint`
- [x] `npm audit` reviewed and documented

## Runtime Checks

- [ ] Devvit app identity valid.
- [ ] Playtest starts.
- [ ] Inline card works.
- [ ] Expanded dashboard works.
- [ ] Command Center works.
- [ ] Demo scenario works.
- [ ] Live empty state is useful.
- [ ] Mirror Scan works or degrades gracefully.
- [ ] Policies create/edit.
- [ ] Apply Policy works.
- [ ] Override review works.
- [ ] Case Packet works.
- [x] Manual Digest works locally.
- [x] Markdown copy/export works locally.
- [x] Runtime Settings shows capability status locally.

## Role Checks

- [ ] app owner/developer
- [ ] subreddit moderator
- [ ] regular user/non-mod if possible

Expected:

- [ ] non-mods cannot access sensitive mod workflows.
- [ ] mod-only actions are hidden or blocked.
- [ ] aggregate data is safe.
- [ ] per-mod data is gated or omitted.

## Device Checks

- [ ] desktop web
- [ ] narrow viewport
- [ ] mobile web if possible
- [ ] Reddit mobile app if possible
- [ ] dark Reddit UI

## UX Checks

- [ ] first screen explains value in < 10 seconds.
- [ ] no dead-end empty states.
- [ ] demo mode is obvious.
- [ ] primary CTAs are clear.
- [ ] loading states exist.
- [ ] error states are useful.
- [ ] copy avoids unsupported claims.
- [ ] no generic card-grid AI slop.
- [ ] visual hierarchy is strong.

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
- [ ] Screenshots captured.
- [x] Demo video script complete.
- [x] Known limitations clear.
- [ ] Developer feedback notes drafted.
- [ ] Final report complete after runtime QA.

## Current Evidence Notes

- Local Wave 9 digest slice checks passed:
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
