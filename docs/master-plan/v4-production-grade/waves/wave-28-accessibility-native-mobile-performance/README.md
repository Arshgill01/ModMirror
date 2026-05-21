# Wave 28: Accessibility, Native Mobile, And Performance

Status: complete

## Goal

Audit dense workflows for keyboard access, focus order, labels, contrast,
reduced-motion behavior, native Reddit/mobile behavior, and performance.

## Completed Scope

- Verified static built Act workspace keyboard focus order starts with visible
  named controls.
- Verified interactive controls in the static built Act workspace have an
  accessible name.
- Verified a 390px static built viewport has no horizontal overflow.
- Added a global `prefers-reduced-motion: reduce` stylesheet guard and test.
- Measured client bundle and `src/client/main.ts` size.
- Recorded native Reddit mobile as blocked because no native app/device session
  was available in this Codex environment.

## Explicit Non-Scope

This wave did not claim native Reddit mobile app proof. Desktop browser/static
preview checks and prior desktop Reddit host mobile-mode checks are not the same
as a native Reddit app/device run.

## Artifacts

- Static screenshot captured outside git:
  `output/playwright/wave-28-a11y-performance/mobile-act.png`
- Audit:
  `docs/master-plan/v4-production-grade/waves/wave-28-accessibility-native-mobile-performance/execution-log.md`
