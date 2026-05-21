# Wave 27 Execution Log

Date: 2026-05-21

Workspace: `/Users/arshdeepsingh/Developer/ModMirror-wave-27-error-recovery`

Branch: `codex/wave-27-error-recovery`

## Scope

Owned write set:

- `src/shared/clientResilience.ts`
- `src/shared/clientResilience.test.ts`
- `docs/master-plan/v4-production-grade/README.md`
- `docs/master-plan/v4-production-grade/waves/wave-27-error-taxonomy-recovery-ux/*`

No server routes, Reddit execution paths, Redis persistence, or runtime proof
claims were changed.

## What Changed

- Added missing V4 error kinds:
  - `subreddit_isolation`
  - `runtime_unavailable`
  - `partial_data`
  - `validation_error`
- Added `title` to every `ClientErrorNotice`.
- Updated `formatClientNotice` so UI strings include the notice title and a
  `Next action:` recovery step.
- Added tests for subreddit isolation, unavailable runtime, partial-data, and
  validation-error classification.

## Validation

Initial validation was blocked because the newly created worktree did not have
local dependencies installed:

```sh
npm test -- src/shared/clientResilience.test.ts
# failed: sh: vitest: command not found

npm run type-check
# failed: missing node_modules/@devvit, vitest, vite, and related types
```

Dependencies were installed in the isolated worktree:

```sh
npm install
```

`npm install` completed and reported existing dependency audit findings
(`32 vulnerabilities`). No dependency changes were intended for this wave, so
the incidental `package-lock.json` change was restored before commit.

After installation, the first focused test run failed because an existing
assertion still expected required-field failures to be generic API errors. The
assertion was updated to the intended Wave 27 behavior:

```sh
npm test -- src/shared/clientResilience.test.ts
# failed once, then passed after updating the validation-error assertion
```

Final validation passed:

```sh
npm test -- src/shared/clientResilience.test.ts
npm run type-check
npm run lint
npm run build
npm test
git diff --check
```

Status: PASS.

## Known Issues / Open Risks

- This wave improves the central string formatter rather than replacing every
  inline error paragraph with a dedicated component. A later component
  extraction wave can turn these notices into structured visual blocks.
- Runtime WebView proof remains blocked under Wave 21 and is not claimed here.
