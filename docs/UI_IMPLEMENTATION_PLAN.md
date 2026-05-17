# UI Implementation Plan

## Current UI Shape

- `src/client/main.ts` renders the whole app with string templates.
- `src/client/styles.css` contains the current sidebar, tabs, cards, tables,
  forms, governance, and Case Packet styles.
- Existing sections are `Overview`, `Governance`, `Mirror Scan`, `Policies`,
  `Apply Policy`, `Case Packets`, `Overrides`, and `Demo Mode`.
- The app currently renders the full dashboard immediately in the inline
  Reddit post WebView.

## New IA Mapping

| New section | Current source behavior |
|---|---|
| Command Center | Replace `Overview`; summarize scan, policy health, overrides, policies, data mode, last scan, and next action. |
| Scan | Keep Mirror Scan flow, but make empty and demo states action-oriented. |
| Policies | Keep policy list/editor and create-from-drift flow; make no-policy fallback route to setup/action. |
| Review | Replace old `Governance`/`Overrides` split with health cards plus override inbox. |
| Case Packets | Preserve Wave 6 generation/export, upgrade layout to official appeal-context packet. |
| Digest | New manual Markdown digest generation; no scheduler. |
| Settings | New runtime/data status view using health, scan, policy, override, case, delivery, and caveat state. |

## Inline vs Dashboard Behavior

- Initial render shows only a compact inline launch card with tagline, data
  mode, top issue, unresolved override count, active policy count, and Open
  Dashboard.
- Installed Devvit typings expose experimental
  `requestExpandedMode(event, 'default')` from `@devvit/web/client`.
- Open Dashboard will attempt expanded mode when the WebView is inline.
- The app will also reveal the full dashboard in place, so browsers or
  unsupported contexts still work.

## Implementation Risks

- Devvit expanded mode is type-verified locally but not playtest-verified.
- Runtime Redis smoke status is still not proven; Settings must state that
  clearly.
- The client is not componentized; keep helpers small inside `main.ts` rather
  than introducing a framework or dependency.
- Browser screenshot QA depends on whether local playtest or Vite preview can
  run in this environment.

## UI Rules To Preserve

- Use the provided ModMirror design tokens.
- Keep layout compact and operational.
- Demo mode must always be labeled.
- Every empty state must offer an action.
- Do not expose per-mod analytics or imply historical rule attribution is
  perfect.
