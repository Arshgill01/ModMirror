# Wave 01 - Product Health Hook

## Objective

Make ModMirror's value legible immediately inside the product by adding a
deterministic Policy Health Score surface to the launch/dashboard experience.

## Why This Matters

The app already has deep functionality. The weak point is first impression:
judges and moderators should see a number with stakes before they see a system.

## Source Areas

- `src/server/services/policyHealth.ts`
- `src/server/services/analytics.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- relevant tests under `src/server/services/*.test.ts`

## Deliverables

- Health score summary API if the current API is not sufficient.
- Launch card or first dashboard panel showing:
  - overall consistency/health score
  - rule-level status rows
  - drift count
  - confidence caveat for inferred history
  - demo/live label
- Empty/sparse subreddit state that still explains what to do next.
- Tests for score thresholds and insufficient-data handling.

## Guardrails

- Do not imply inferred attribution is certain.
- Do not introduce per-mod blame.
- Do not add AI scoring.
- Do not edit submission artifacts.

## Acceptance Criteria

- A fresh viewer can infer what ModMirror does from the first in-app surface.
- Demo mode shows meaningful Rule 2 drift.
- Sparse live mode does not look broken.
- Full validation commands pass.
