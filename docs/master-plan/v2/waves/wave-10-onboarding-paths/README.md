# Wave 10 - Onboarding Paths

## Objective

Create first-class in-app paths for new moderators and existing teams using the
same consistency-first product loop.

## Build Outcome

The app should guide different moderator contexts:

- new mod learning team policy
- lead mod resolving drift
- existing team reviewing exceptions
- small subreddit starting from little data

## Source Areas

- `src/client/main.ts`
- `src/client/styles.css`
- `src/routes/api.ts`
- `src/server/services/config.ts`
- `src/server/services/demoData.ts`
- `src/server/services/calibration.ts`
- `src/server/services/policies.ts`

## Implementation Slices

1. Define onboarding state machine or helper functions.
2. Detect setup states: no scan, scan exists, no policies, policies active,
   unresolved reviews, calibration available.
3. Add role-appropriate next actions without relying on role strings that are
   not runtime-proven.
4. Add small-subreddit path.
5. Add demo reset/start path.
6. Add path into Team Calibration.
7. Add path into Policy Workbench.
8. Add path into Review Room.
9. Add tests for state-to-next-action mapping.
10. Keep text concise and in-product, not marketing copy.

## Quality Bar

The app should feel usable without the creator narrating where to click.

## Tests

- onboarding state tests
- sparse-state tests
- demo-state tests

## Acceptance Criteria

- New install has a clear first action.
- Demo mode has a clear full-loop path.
- Existing data routes to the right next workflow.
- Full validation passes.

