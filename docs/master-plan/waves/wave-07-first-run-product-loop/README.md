# Wave 07 - First-Run Product Loop

## Objective

Turn the existing features into a guided in-app loop that works without a human
explaining the demo.

## Dependencies

- Wave 01
- Wave 02
- Wave 06

## Deliverables

- First-run state that guides:
  - run or inspect Mirror Scan
  - review drift
  - create/adopt policy
  - try Apply Policy preview
  - review receipt/override
  - run Team Calibration
- Demo mode path that is clearly labeled and complete.
- Live sparse path that gives useful next actions instead of dead ends.
- Tests for first-run state helpers if logic is non-trivial.

## Guardrails

- No submission copy.
- No fake runtime claims.
- No automatic enforcement.

## Acceptance Criteria

- A new moderator can follow the loop from the app UI alone.
- Demo mode and live sparse mode are both coherent.
- Full validation commands pass.
