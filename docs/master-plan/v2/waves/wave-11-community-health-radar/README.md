# Wave 11 - Community Health Radar

## Objective

Make aggregate community health actionable without turning ModMirror into a
per-moderator surveillance tool.

## Build Outcome

Review surfaces should show team-level signals: repeat patterns, unresolved
overrides, policy churn, drift stability, calibration coverage, and receipt
readiness.

## Source Areas

- `src/server/services/communityHealth.ts`
- `src/server/services/policyHealth.ts`
- `src/server/services/analytics.ts`
- `src/server/services/receipts.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/shared/schema.ts`

## Implementation Slices

1. Inspect existing community health service and UI.
2. Add aggregate metrics for calibration coverage and unresolved review load.
3. Add trend labels from persisted scans and receipts.
4. Add privacy-safe repeat-author buckets without usernames.
5. Add health-to-action mapping: review policy, run calibration, inspect drift,
   collect more data.
6. Add UI module in Review Room and Command Center.
7. Add sparse-data guidance.
8. Add tests for aggregate-only output.
9. Verify no per-mod breakdowns are exposed.
10. Update privacy notes only if behavior changes.

## Quality Bar

This should help teams improve operations, not identify someone to blame.

## Tests

- aggregate metric tests
- privacy/no-username tests
- sparse-state tests
- route tests

## Acceptance Criteria

- Health radar shows aggregate signals only.
- Every signal has a recommended next action.
- Sparse communities get useful guidance.
- Full validation passes.

