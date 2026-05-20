# Wave 07 - Policy Simulator

## Objective

Let teams preview how policy ladder changes would classify historical or demo
cases before adoption.

## Build Outcome

A policy draft can be replayed against recent cases to show changed
recommendations, stricter/looser outcomes, insufficient-data warnings, and
cases needing manual review.

## Source Areas

- `src/server/services/policies.ts`
- `src/server/services/applyPolicy.ts`
- `src/server/services/replaySandbox.ts`
- `src/server/services/scans.ts`
- `src/server/services/receipts.ts`
- `src/routes/api.ts`
- `src/client/main.ts`

## Implementation Slices

1. Inspect existing replay sandbox capabilities.
2. Define policy simulation input and result types.
3. Support active policy vs draft policy comparison.
4. Replay against demo cases and persisted receipt/scan cases.
5. Classify result deltas: same, stricter, looser, manual_review,
   insufficient_data.
6. Add summary counts and representative examples.
7. Add warning when attribution confidence is low.
8. Add UI in Policy Workbench.
9. Add tests for deterministic replay outcomes.
10. Do not execute moderation actions from simulator.

## Quality Bar

The simulator is a decision aid, not a predictor and not an AI judge.

## Tests

- replay comparison tests
- low-confidence warning tests
- draft-vs-active policy tests

## Acceptance Criteria

- Draft policy can be simulated without adoption.
- Changed recommendations are visible.
- Low-confidence cases are labeled.
- Full validation passes.

