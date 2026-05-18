# Wave 01 Report - Entrypoints And Target Context

Created: 2026-05-18

Branch: `overhaul/w01-entrypoints-context`

## Summary

Wave 01 replaces production-facing post/comment smoke menus with real
non-destructive ModMirror policy entrypoints. It adds target context capture and
passes the selected target into the existing Apply Policy dashboard panel. It
does not execute Reddit moderation actions.

## What Changed

- `devvit.json` now exposes post/comment `Apply ModMirror Policy` menu entries.
- Smoke form/menu entries were removed from production Devvit config.
- `src/routes/menu.ts` now opens a target-aware Apply Policy form for posts and
  comments.
- `src/routes/forms.ts` handles the Apply Policy target form and creates a
  dashboard custom post with target params in the URL hash.
- `src/server/services/targetContext.ts` resolves post/comment context using
  installed Devvit Reddit APIs.
- `src/server/services/targetContext.test.ts` covers target type parsing,
  post context, comment context, and unsupported IDs.
- `src/client/main.ts` reads target params from the hash and pre-fills the
  existing Apply Policy form.
- Shared schema/constants now include target context and internal Apply Policy
  route names.

## Commands Run

- `npm install`
- `npm run type-check`
- `npm run lint`
- `npm test -- src/server/services/targetContext.test.ts`
- `npm test`
- `npm run build`
- `rg -n "smoke test|Smoke Test|smokeTarget|smokeChained|smoke-comment|smoke-post|ModMirror smoke|Smoke note" devvit.json src/routes src/shared/constants.ts`

## Pass / Fail Status

PASS locally:

- typecheck passed.
- lint passed.
- targeted target-context tests passed.
- full tests passed, 16 files and 71 tests.
- build passed.
- smoke menu/form language is absent from `devvit.json`, `src/routes`, and
  `src/shared/constants.ts`.

## Runtime Verification

Not performed in this wave.

The following remain runtime-unverified:

- Reddit post/comment menu visibility.
- Apply Policy form rendering and submit behavior.
- Target fetch success/failure shape in playtest.
- Current moderator permission values.
- Dashboard hash behavior inside Reddit's WebView.

## Safety Notes

- W01 performs no Reddit moderation action.
- The form explicitly states that it opens policy guidance only.
- Apply Policy confirm remains `log_only` until later execution and receipt
  waves add safety gates and runtime proof.

## Open Risks

- Form fields may behave differently in Reddit clients than type/build proof
  indicates; W13 should runtime-verify the full path.
- The existing Apply Policy panel still treats this as the simulator/log-only
  flow. W02 must make the preview contract target-aware.

## Next Integration Notes

W02 should extend Apply Policy preview contracts to include target type,
target snapshot, policy version, evidence, and an explicit "what will happen on
confirm" preview.
