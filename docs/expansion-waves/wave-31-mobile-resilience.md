# Wave 31: Mobile And Runtime Resilience

## Summary

Wave 31 improves narrow WebView behavior and degraded runtime handling. The
client now has a shared error taxonomy, timeout-aware API calls, explicit
static-preview notices, clipboard fallback errors, and static/mobile checks for
core workspace layouts.

## What Changed

- Added `src/shared/clientResilience.ts` for client error classification.
- Added actionable messages for:
  - static preview / missing live API responses;
  - API timeouts;
  - network failures;
  - API validation errors;
  - missing or denied clipboard access.
- Wrapped client API calls with a 12 second timeout.
- Routed policy replay and policy lifecycle calls through the same API wrapper.
- Added a runtime resilience banner for static preview and missing Devvit
  WebView signal states.
- Added visible clipboard fallback errors for Case Packet and Digest Markdown
  copy flows.
- Tightened narrow CSS behavior for runtime notices, button text, and wrapped
  content.
- Added static tests for mobile layout guards and error taxonomy behavior.

## Files Changed

- `src/client/main.ts`
- `src/client/styles.css`
- `src/client/mobileResilience.test.ts`
- `src/shared/clientResilience.ts`
- `src/shared/clientResilience.test.ts`
- `TODO.md`
- `RESEARCH.md`
- `docs/expansion-waves/wave-31-mobile-resilience.md`

## Runtime Proof Status

Static/browser verified only.

The built client was served from `dist/client` and checked with Playwright at a
390px viewport. Act, Scan, Review, Prove, and Settings all reported
`documentElement.scrollWidth === window.innerWidth === 390`.

Screenshot artifact:

- `output/playwright/w31/settings-390.png` (ignored local output)

No Devvit playtest or native Reddit mobile verification was run for this wave.

## Commands Run

- `npm install`
- `npm test -- src/shared/clientResilience.test.ts src/client/mobileResilience.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npx vite --host 127.0.0.1 --port 5173` (failed: Devvit Vite plugin supports
  build only)
- `npx --yes http-server dist/client -p 4173 -a 127.0.0.1`
- `sh ~/.codex/skills/playwright/scripts/playwright_cli.sh open http://127.0.0.1:4173`
- `sh ~/.codex/skills/playwright/scripts/playwright_cli.sh resize 390 844`
- Playwright DOM check for Act, Scan, Review, Prove, and Settings scroll width.

## Known Gaps

- Static-client proof does not verify Reddit host chrome, Devvit WebView
  behavior, or native Reddit mobile app behavior.
- The client timeout is local UX protection; it does not prove server-side
  latency characteristics.
- Static preview still produces expected API console errors when no Devvit
  server is present; those are now surfaced in UI as labeled degraded-state
  messages.

## Safety And Privacy Notes

- This wave does not enable any new Reddit moderation action.
- Degraded runtime messages tell moderators to use labeled demo/log-only
  fallback paths rather than treating failed live calls as success.
- Clipboard failures leave Markdown visible for manual copy and do not send
  content anywhere.
