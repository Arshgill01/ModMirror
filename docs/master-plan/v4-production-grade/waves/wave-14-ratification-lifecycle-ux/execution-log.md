# Wave 14 Execution Log

Date: 2026-05-21

Branch: `codex/wave-14-ratification-lifecycle`

## What Changed

- Added a ratification lifecycle strip to policy cards.
- Made approval thresholds, current approvals, change requests, and adoption
  blockers visible in context.
- Kept quick adoption hidden when disabled by policy settings and added an
  explicit quick-adoption note.
- Added a disabled reviewed-adoption button with the blocking reason when a
  policy is proposed but not ready to adopt.

## Validation

- `npm install` passed; npm reported 32 existing vulnerabilities.
- `git restore package-lock.json || true` ran after install to discard lockfile
  churn.
- `git diff --check` passed.
- `npm run type-check` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `npm test` passed: 60 files, 251 tests.

## Known Issues

- This wave is client presentation only. It does not add new Devvit runtime
  proof.
