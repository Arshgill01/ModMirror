# Wave 17 Execution Log

Date: 2026-05-21

Branch: `codex/wave-17-case-evidence`

## What Changed

- Added receipt-to-Case Packet navigation from the Action Receipt Ledger.
- Added Evidence Board return controls for receipt and Case Packet continuity.
- Added evidence provenance labels instead of raw source enum labels.
- Allowed static/demo Case Packet fallback for demo receipt/action subjects, not
  only the generic demo subject.

## Validation

- `npm install` passed; npm reported 32 existing vulnerabilities.
- `git restore package-lock.json || true` ran after install to discard lockfile
  churn.
- `git diff --check` passed.
- `npm run type-check` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `npm test` passed: 62 test files, 261 tests.

## Visual Proof

- Built assets were served with
  `python3 -m http.server 5181 --bind 127.0.0.1 --directory dist/client`.
- Static browser smoke was run after `npm run build`.
- The built client opened on `http://127.0.0.1:5181/#act`.
- Running the Judge Demo path landed on Prove with the Case Packet, Evidence
  Board, back-navigation controls, and labeled evidence source rows visible.
- The observed evidence source labels included `Receipt-backed`,
  `Demo override`, `Demo case packet`, and `Demo comparable case`.
- The static server was stopped after visual verification.

## Known Issues

- Static smoke proves UI continuity only. It does not prove Devvit Redis
  persistence or authenticated runtime route behavior.
