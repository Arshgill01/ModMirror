# Wave 02 - Drift Radar

## Objective

Turn Mirror Scan output into an inspectable Drift Radar that shows why a rule is
drifting and what evidence supports the claim.

## Build Outcome

Moderators should be able to open a rule and see the action spread,
confidence mix, unmatched examples, representative cases, and suggested policy
questions.

## Source Areas

- `src/server/services/mirrorScan.ts`
- `src/server/services/attribution.ts`
- `src/server/services/analytics.ts`
- `src/server/services/comparableCases.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/shared/scoring.ts`
- `src/shared/schema.ts`

## Implementation Slices

1. Inspect current scan detail and analytics routes.
2. Add a drift-detail model per rule bucket.
3. Include action distribution by normalized action.
4. Include confidence distribution and unmatched count.
5. Include representative cases with privacy-safe fields.
6. Add deterministic "why flagged" explanations.
7. Add policy questions generated from action spread, not AI.
8. Add UI drill-down from Command Center and Scan.
9. Add small-subreddit and no-history states.
10. Add tests for drift ranking and explanation generation.

## Quality Bar

Drift Radar must be honest. It can say "likely Rule 2" or "low confidence"; it
must never present inferred labels as fact.

## Tests

- attribution confidence tests
- drift ranking tests
- representative-case privacy tests
- route response tests

## Acceptance Criteria

- Each drift candidate has evidence, confidence, and caveats.
- Rule-level action spread is visible.
- Unmatched data is not hidden.
- Sparse data produces useful guidance.
- Full validation passes.

