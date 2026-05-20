# Wave 03 - Policy Workbench

## Objective

Upgrade Policy Agreement from a basic editor into a real team policy workbench
that turns drift evidence into adopted policy.

## Build Outcome

A lead moderator can start from drift, build a ladder, resolve missing steps,
compare versions, and adopt a policy with an audit trail.

## Source Areas

- `src/server/services/policies.ts`
- `src/server/services/policyRatification.ts`
- `src/server/services/policyHealth.ts`
- `src/server/services/audit.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/shared/schema.ts`

## Implementation Slices

1. Audit current policy editor and ratification flow.
2. Add workbench summary model: active version, draft version, review state,
   missing ladder steps, unresolved overrides, and linked drift.
3. Add starter ladder templates for common rule shapes.
4. Add validation warnings for gaps like no first-offense step or unsafe action
   escalation.
5. Add version compare view for current vs proposed.
6. Link drift cases directly into the policy draft.
7. Keep adoption deterministic and moderator-confirmed.
8. Add tests for validation warnings and version compare.
9. Ensure policy edits never delete history.
10. Update docs only for real behavior changes.

## Quality Bar

This should feel like a working session for a mod team, not a settings form.

## Tests

- policy validation tests
- version history tests
- ratification/adoption tests
- API route tests

## Acceptance Criteria

- A policy can be created from a drift candidate.
- Missing or risky policy gaps are visible.
- Version history stays immutable.
- Adoption state is clear.
- Full validation passes.

