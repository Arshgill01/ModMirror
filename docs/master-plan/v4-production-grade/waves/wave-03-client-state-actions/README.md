# Wave 03 — Client State And Action Extraction

Status: complete

## Objective

Reduce `src/client/main.ts` risk by extracting shared client API/action logic
without rewriting the dashboard entrypoint.

## Scope

- Add `src/client/state/actions.ts` for common fetch/error handling.
- Move scan API orchestration into a testable async action.
- Move demo reset API orchestration into a testable async action.
- Reuse existing store exports for empty policy/apply form builders.
- Keep rendering and page behavior in `main.ts`.

## Acceptance Evidence

- `fetchApi`, `fetchWithTimeout`, and `normalizeClientError` now live outside
  `main.ts`.
- `runScan` delegates the scan POST, stored-record fetch, and demo fallback to
  `runScanAction`.
- demo reset delegates the reset POST to `resetDemoAction`.
- `src/client/state/actions.test.ts` covers common fetch behavior and async
  scan/demo-reset paths.
- Existing `src/client/state/store.test.ts` continues to cover listener/update
  behavior.
