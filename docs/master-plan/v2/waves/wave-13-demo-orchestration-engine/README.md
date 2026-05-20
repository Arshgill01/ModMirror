# Wave 13 - Demo Orchestration Engine

## Objective

Make demo mode deterministic, resettable, and capable of proving the complete
product loop without useful live subreddit data.

## Build Outcome

A single demo reset/start path seeds scan history, drift, policies, target
cases, receipts, overrides, calibration scenarios, review tasks, and evidence.

## Source Areas

- `src/shared/demoData.ts`
- `src/server/services/demoData.ts`
- `src/server/services/scans.ts`
- `src/server/services/policies.ts`
- `src/server/services/receipts.ts`
- `src/server/services/evidenceBoard.ts`
- `src/server/services/calibration.ts`
- `src/routes/api.ts`
- `src/client/main.ts`

## Implementation Slices

1. Inventory existing demo data and reset paths.
2. Define deterministic demo state manifest.
3. Seed canonical Rule 2 drift and stable Rule 3 comparison.
4. Seed at least one active policy, one draft policy, one override, one receipt,
   one case packet/evidence item, one calibration pack, and one review task.
5. Add demo reset route with safe namespace handling.
6. Add UI control in Settings or Command Center.
7. Add "demo story state" checks for missing data.
8. Add tests for deterministic seed output.
9. Ensure demo state is clearly labeled everywhere.
10. Do not touch submission scripts or video plans.

## Quality Bar

Demo mode should be a reliable development and QA environment, not fake
marketing data.

## Tests

- demo manifest tests
- seed/reset tests
- namespace safety tests
- deterministic fixture tests

## Acceptance Criteria

- Resetting demo state produces the same usable product loop every time.
- Demo data covers scan, policy, apply, override, review, and calibration.
- Live data is not overwritten.
- Full validation passes.

