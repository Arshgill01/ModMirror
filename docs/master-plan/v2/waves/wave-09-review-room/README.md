# Wave 09 - Review Room

## Objective

Unify overrides, unresolved exceptions, policy impact, ratification, evidence
boards, and case packets into one Review Room workflow.

## Build Outcome

Moderators can see what needs team attention, triage it, review evidence, mark
items resolved, and turn learnings into policy updates.

## Source Areas

- `src/server/services/overrideReview.ts`
- `src/server/services/policyImpact.ts`
- `src/server/services/policyRatification.ts`
- `src/server/services/evidenceBoard.ts`
- `src/server/services/casePacket.ts`
- `src/routes/api.ts`
- `src/client/main.ts`

## Implementation Slices

1. Audit current Review and Prove pages.
2. Define review task model with source type, severity, status, due signal, and
   linked evidence.
3. Generate tasks from unresolved overrides, at-risk policy health, pending
   ratifications, open evidence boards, and high-drift rules.
4. Add route to list and update review tasks.
5. Add UI filters: unresolved, policy, evidence, calibration, impact.
6. Add action shortcuts: open evidence, update policy, mark reviewed.
7. Preserve aggregate-first visibility.
8. Add tests for task generation and status updates.
9. Avoid per-mod blame surfaces.
10. Record audit events for review decisions when appropriate.

## Quality Bar

Review Room should be the operational close-loop, not another dashboard tab.

## Tests

- review task generation tests
- task status persistence tests
- visibility tests
- route tests

## Acceptance Criteria

- Unresolved overrides appear as review tasks.
- Drift and policy impact can produce review tasks.
- Tasks link to evidence.
- Full validation passes.

