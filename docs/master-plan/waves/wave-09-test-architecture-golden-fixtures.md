# Wave 09 - Test Architecture + Golden Fixtures

## Objective

Make future agent changes safer by adding high-signal golden fixtures and
contract tests around ModMirror's deterministic core.

## Source Areas

- `src/shared/demoData.ts`
- `src/shared/scoring.ts`
- `src/server/services/attribution.ts`
- `src/server/services/policyHealth.ts`
- `src/server/services/applyPolicy.ts`
- `src/server/services/casePacket.ts`
- `src/server/services/syntheticEval.ts`

## Deliverables

- Golden fixture for the canonical Rule 2 drift story.
- Contract tests for:
  - attribution confidence
  - policy recommendation
  - policy health score
  - override audit
  - receipt-backed case packet
  - calibration scenario result
- Snapshot-like expected JSON where stable and useful.

## Guardrails

- Do not make brittle tests for cosmetic text.
- Do not encode false certainty for inferred attribution.
- Keep fixtures deterministic and small enough to review.

## Acceptance Criteria

- Tests fail meaningfully when core product behavior regresses.
- `npm test` remains fast enough for agent iteration.
- Full validation commands pass.
