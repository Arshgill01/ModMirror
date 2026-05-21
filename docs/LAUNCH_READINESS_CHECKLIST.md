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
- [x] Latest upload/deploy readiness passed for Devvit app version `0.0.2`.
- [x] Inline card works.
- [x] Expanded dashboard works.
- [x] Command Center works.
- [x] Demo scenario works.
- [x] Live empty state is useful.
- [x] Mirror Scan works or degrades gracefully.
- [x] Demo policy creation from drift works in playtest.
- [x] Dashboard Apply Policy simulator works in playtest with `log_only`
      confirmation.
- [x] Override review inbox and policy health work in playtest.
- [x] Demo Case Packet generation and Markdown export work in playtest.
- [x] Manual Digest works locally and in playtest.
- [x] Markdown copy/export works locally and renders in playtest.
- [x] Runtime Settings shows capability status locally and in playtest.
- [ ] Latest `0.0.2` route-level WebView smoke checks after opening an
      authenticated Devvit WebView session.

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
- [x] mobile web static viewport
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
- [x] Draft terms/privacy copy prepared in `docs/TERMS_DRAFT.md` and
      `docs/PRIVACY_POLICY_DRAFT.md`.
- [x] App details handoff prepared in `docs/APP_DETAILS_HANDOFF.md`.
- [ ] Draft terms/privacy copy reviewed and hosted at public links.
- [ ] App details page has public-ready terms and privacy links before publish.

## Current Evidence Notes

- Current `master` dependency-hardening checks passed:
  - `npm run type-check`
  - `npm run lint`
  - `npm run build`
  - `npm test` with 62 files / 263 tests
  - `npm run deploy`, which uploaded Devvit app version `0.0.2`
  - `npx devvit view --json`, which confirmed public API version `0.12.24`,
    build status `1`, and app capabilities `[10, 11]`
- Static Playwright QA captured:
  - `output/playwright/wave9-10/digest-static.png`
  - `output/playwright/wave9-10/settings-static.png`
- Static QA reported no horizontal overflow for Digest or Settings, confirmed
  Digest History and Markdown Export are visible, and confirmed Settings shows
  scheduler capability status.
- Current static mobile viewport QA captured
  `docs/screenshots/submission/mobile-command-center-static.png` at `390px`
  wide after running the judge demo path. Playwright measured
  `innerWidth: 390`, `scrollWidth: 390`, and `hasHorizontalOverflow: false`.
  This is built-client mobile web proof, not native Reddit mobile app proof.
- Earlier runtime playtest reached ready at:
  - URL: `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`
  - Version: `v0.0.1.70`
- Safari/Computer Use runtime QA verified:
  - Inline launch card renders in the Reddit post before dashboard open.
  - Open Dashboard enters the Devvit expanded modal.
  - Devvit viewport dropdown is present and exposes `Mobile`, `Desktop`, and
    `Fullscreen`.
  - Command Center loads as first dashboard screen.
  - ExampleLearning demo scan loads with 60 actions and labeled demo state.
  - Low-effort questions policy creation from drift works in the demo path.
  - Apply Policy preview/confirmation records a `log_only` override.
  - Review shows the override workflow and policy health state.
  - Case Packet generation renders tracked context and Markdown Export.
  - Manual Digest generates in playtest, renders Markdown Export, and writes a
    Digest History row.
  - Settings page shows Digest History, Digest mod discussion `unverified`, and
    Digest scheduler `unverified` in playtest.
- Runtime screenshot captured:
  - `output/playwright/wave9-10/runtime-safari-digest-v0.0.1.70.png`
- `npm audit --omit=dev` still reports 26 Devvit-transitive `protobufjs`
  vulnerabilities after direct Hono/Vite updates and safe `tmp`/`ws` overrides.
  `npm audit fix --force` would downgrade or otherwise break the Devvit package
  chain and has not been applied.
- The latest uploaded version carries WebView capability, but the current CLI
  does not expose a safe local command for terms/privacy links; set them on the
  app details page before public publishing.

## Do Not Do Without Human Confirmation

- [ ] submit Devpost.
- [ ] publish app publicly.
- [ ] contact communities.
- [ ] claim partnerships.
- [ ] enable automatic scheduled posting on a real subreddit.
