# Wave 28 Execution Log

Date: 2026-05-21

Branch: `codex/wave-28-a11y-performance`

## What Changed

- Added a global reduced-motion CSS guard.
- Added a regression assertion in `src/client/mobileResilience.test.ts`.
- Marked Wave 28 complete in the V4 board.
- Updated TODO, RESEARCH, and the runtime proof backlog to distinguish static
  mobile/browser proof from native Reddit mobile app proof.

## Static Browser Audit

- Built static client preview opened at `http://127.0.0.1:5188/#act`.
- Open Dashboard rendered the Act workspace in the accessibility snapshot.
- First keyboard Tab stops were visible named controls:
  `Act`, `Scan`, `Agree`, `Review`, `Prove`, `Settings`, `System`, `Light`,
  `Dark`, `Load Demo Scenario`, `Run Judge Demo`, `Refresh policies`.
- Unlabeled enabled interactive controls query returned `[]`.
- 390px viewport measurement returned:
  `{"width":390,"scrollWidth":390,"bodyScrollWidth":390,"horizontalOverflow":false}`.
- Static preview logged 25 console errors from unavailable API calls; these were
  expected for static preview and surfaced by the app's static-preview notices.

## Performance Measurements

- `src/client/main.ts`: 332,528 bytes.
- `src/client/styles.css`: 52,621 bytes.
- Built `dist/client/default.js`: 220,466 bytes.
- Built `dist/client/default.css`: 42,126 bytes.
- Built JS+CSS total: 262,592 bytes.
- Gzipped built JS+CSS stream: 61,764 bytes.

## Native Mobile Status

Blocked.

No native Reddit mobile app or device-mirror session was available in this
environment. Native Reddit mobile behavior remains unverified and must not be
claimed from desktop static preview or desktop Reddit host mobile-mode proof.

## Validation

- `npm test -- src/client/mobileResilience.test.ts src/client/render/primitives.test.ts src/shared/productization.test.ts src/shared/responseTemplates.test.ts`
  passed before the reduced-motion patch.
- `npm test -- src/client/mobileResilience.test.ts` passed after the
  reduced-motion patch.
- `npm run build` passed.
- `git diff --check` passed.

## Status

Complete, with native Reddit mobile recorded as blocked/unverified.
