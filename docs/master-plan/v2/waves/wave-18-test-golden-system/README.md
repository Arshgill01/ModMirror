# Wave 18 - Test Golden System

## Objective

Build a high-signal golden fixture and contract test system around the complete
ModMirror product story.

## Build Outcome

Future agents should break tests if they regress Rule 2 drift, policy
recommendations, calibration, receipts, evidence, privacy, or demo orchestration.

## Source Areas

- `src/shared/demoData.ts`
- `src/shared/scoring.ts`
- `src/server/services/attribution.ts`
- `src/server/services/policyHealth.ts`
- `src/server/services/applyPolicy.ts`
- `src/server/services/calibration.ts`
- `src/server/services/casePacket.ts`
- `src/server/services/evidenceBoard.ts`
- `src/server/services/syntheticEval.ts`

## Implementation Slices

1. Define canonical Rule 2 golden story fixture.
2. Add expected outputs for scan attribution and drift.
3. Add expected outputs for policy ladder recommendation.
4. Add expected outputs for override requirement.
5. Add expected outputs for receipt and evidence graph.
6. Add expected outputs for calibration scenario results.
7. Add expected outputs for demo orchestration manifest.
8. Keep fixtures deterministic and reviewable.
9. Avoid brittle UI-copy snapshots.
10. Add a short test guide for future agents.

## Quality Bar

The tests should protect product behavior, not incidental formatting.

## Tests

- golden fixture tests
- contract tests
- synthetic eval tests
- full validation

## Acceptance Criteria

- Core loop has regression tests.
- Demo story has deterministic expected outputs.
- Tests are meaningful and maintainable.
- Full validation passes.

