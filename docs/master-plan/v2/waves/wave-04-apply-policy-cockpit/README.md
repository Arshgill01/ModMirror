# Wave 04 - Apply Policy Cockpit

## Objective

Make Apply Policy feel like a complete decision cockpit for a single post or
comment.

## Build Outcome

The moderator sees target context, policy recommendation, history, response
preview, override comparison, execution mode, and receipt preview before
confirming anything.

## Source Areas

- `src/server/services/applyPolicy.ts`
- `src/server/services/targetContext.ts`
- `src/server/services/receipts.ts`
- `src/server/services/moderationExecution.ts`
- `src/server/services/responseTemplates.ts`
- `src/routes/api.ts`
- `src/routes/menu.ts`
- `src/client/main.ts`

## Implementation Slices

1. Audit current Apply Policy menu and Act page.
2. Define a cockpit response model for target, recommendation, caveats,
   execution mode, and receipt preview.
3. Add explicit "why this recommendation" evidence.
4. Add user/action history summary without overexposing personal data.
5. Show response template preview before confirmation.
6. Show override delta when selected action differs from recommendation.
7. Require override reason where policy demands it.
8. Preserve log-only fallback for unverified delivery.
9. Add tests for recommendation evidence and override requirement.
10. Runtime-proof only non-destructive preview/log-only paths unless approved.

## Quality Bar

The cockpit must make the team norm obvious while preserving moderator control.

## Tests

- policy recommendation tests
- target context tests
- receipt preview tests
- override requirement tests

## Acceptance Criteria

- Target-aware preview works for post/comment contexts.
- Recommendation and evidence are shown together.
- Override flow cannot bypass required reason.
- Log-only receipt remains stable.
- Full validation passes.

