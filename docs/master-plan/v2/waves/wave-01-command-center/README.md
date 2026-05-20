# Wave 01 - Command Center

## Objective

Replace the weak first impression with a quantified Command Center that makes
ModMirror understandable in one glance.

## Build Outcome

The first expanded dashboard surface and inline launch card should answer:

- how consistent is this team right now?
- which rule is the biggest problem?
- what should the moderator do next?
- is this demo data, live data, or mixed?
- how confident is ModMirror in the attribution?

## Source Areas

- `src/client/main.ts`
- `src/client/styles.css`
- `src/routes/api.ts`
- `src/server/services/policyHealth.ts`
- `src/server/services/analytics.ts`
- `src/server/services/scans.ts`
- `src/shared/schema.ts`
- `src/shared/demoData.ts`

## Implementation Slices

1. Audit the current launch card and first dashboard render.
2. Define a Command Center API response if existing health endpoints are not
   enough.
3. Compute an overall consistency score from policy health, drift candidates,
   confidence distribution, unresolved overrides, and sparse-data state.
4. Add rule health rows with status labels: `stable`, `watch`, `at_risk`,
   `needs_review`, and `insufficient_data`.
5. Add a "next best action" model that points to scan, agree, apply, review, or
   calibration.
6. Render the Command Center above secondary navigation.
7. Render a compact version on the inline launch card.
8. Add demo/live/runtime proof labels.
9. Add tests for score thresholds and next-action selection.
10. Update execution log with screenshots or static render evidence if used.

## Quality Bar

This should not feel like a marketing hero. It should feel like a serious
moderation operations surface: dense, legible, useful, and restrained.

## Tests

- targeted policy health tests
- Command Center response tests
- client state helper tests if helpers are added
- full validation commands before completion

## Acceptance Criteria

- A first-time viewer can explain ModMirror's job from the first screen.
- Rule 2 demo drift is visible without clicking into a deep page.
- Sparse live state is useful and not broken-looking.
- Confidence caveats are visible near inferred data.
- No per-mod blame appears.
- Full validation passes.

