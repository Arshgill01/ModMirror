# Wave 12 Operational UI Reframe

Date: 2026-05-18

Branch/worktree:

- `overhaul/w12-operational-ui`
- `/Users/arshdeepsingh/Developer/modmirror-w12-operational-ui`

## What Changed

- Reframed the main dashboard around moderator jobs: Act, Scan, Agree, Review,
  Prove, and Settings.
- Moved Apply Policy into the first-class Act workspace, with target-policy
  preview, confirmation, and the receipt ledger on the same screen.
- Kept Scan focused on scan controls/history, Agree focused on policy decision
  records, Review focused on exceptions/health, and Prove focused on
  before-after consistency, case packets, and manual digest output.
- Added legacy hash handling so old `#command-center`, `#policies`,
  `#case-packets`, and `#digest` links route to the new IA instead of breaking.
- Added receipt-ledger client state and refresh behavior backed by
  `/api/receipts`.
- Added a standalone-static-preview ledger fallback so `dist/client` screenshot
  review does not show a broken ledger when the Hono API is absent.
- Tightened narrow viewport navigation to keep the six operational sections
  scannable.

## Files Touched

- `src/shared/productization.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `docs/operational-overhaul/wave12-operational-ui.md`
- `docs/operational-overhaul/WAVE_STATUS.md`
- `docs/operational-overhaul/EXECUTION_LOG.md`
- `docs/operational-overhaul/CAPABILITY_MATRIX.md`
- `docs/operational-overhaul/CURRENT_REPO_TRUTH.md`
- `TODO.md`

## Verification

Commands run:

- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - passed.
- `npm test -- src/shared/productization.test.ts` - passed, 5 tests.
- `npm run lint` - passed.
- `npm test` - passed, 23 files and 104 tests.
- `npm run build` - passed.
- `git diff --check` - passed.
- `npx vite --host 127.0.0.1 --port 5174` - failed as expected because the
  Devvit Vite plugin only supports build mode in this app shape.
- `npx --yes http-server dist/client -a 127.0.0.1 -p 5174` - served the static
  built client for screenshot review.
- `bash "$PWCLI" open http://127.0.0.1:5174/#act --config output/playwright/w12-operational-ui/desktop.config.json`
  - passed.
- `bash "$PWCLI" click e19` - passed, opened the expanded dashboard from the
  inline launch card.
- `bash "$PWCLI" screenshot --full-page --filename output/playwright/w12-operational-ui/act-desktop.png`
  - passed, captured 1440x1516 desktop proof.
- `bash "$PWCLI" open http://127.0.0.1:5174/#act --config output/playwright/w12-operational-ui/mobile.config.json`
  - passed.
- `bash "$PWCLI" click e19` - passed, opened the mobile/narrow expanded
  dashboard from the inline launch card.
- `bash "$PWCLI" screenshot --full-page --filename output/playwright/w12-operational-ui/act-mobile.png`
  - passed, captured 390x2851 mobile proof.

Artifacts:

- `output/playwright/w12-operational-ui/act-desktop.png`
- `output/playwright/w12-operational-ui/act-mobile.png`

The static screenshot run produced expected browser console 404s for `/api/*`
because only `dist/client` was served. The rendered UI handled those missing
backend routes without showing a receipt-ledger failure.

## Runtime Status

W12 is local build and browser-preview verified only. It did not run Devvit
playtest and did not prove live Reddit menu, Redis, or moderation behavior.

## Remaining Risk

- The new IA needs Devvit WebView runtime proof on desktop and mobile Reddit
  clients.
- The Act page can display receipts from the API, but receipt persistence is
  still locally verified only until W13.
- Old routes are mapped in hash navigation, but external docs/bookmarks should
  be updated after integration.

## Next Wave Notes

W13 should focus on the runtime verification harness and QA matrix rather than
new feature expansion: menu entrypoints, target capture, receipts, scan history,
deep scan behavior, non-mod access, and mobile WebView behavior.
