# AGENT_A_POLICY_DATA_CONTRACTS.md

## Role

You own Wave 3/4 policy data contracts, Redis persistence, and pure recommendation logic.

## Read First

- `AGENTS.md`
- `PLAN.md`
- `RESEARCH.md`
- `docs/DATA_MODEL.md`
- `docs/PRODUCT.md`
- `docs/DECISIONS.md`
- `docs/WAVE3_4_EXECUTION_NOTES.md`

## Goal

Implement the backend/data foundation for policies and recommendations.

## Required Work

### 1. Confirm Existing Structure

Inspect current Wave 2 files. Reuse existing conventions.

Expected areas:

- `src/shared/`
- `src/server/services/`
- existing Redis helpers
- existing scan/attribution/demo types

Do not duplicate incompatible schemas.

### 2. Add/Refine Policy Types

Ensure shared types exist for:

```ts
RulePolicy;
PolicyStep;
PolicyCreateInput;
PolicyUpdateInput;
PolicyRecommendation;
ApplyPolicyContext;
EnforcementAction;
MessageDeliveryMode;
```

Use existing types if already present.

Required action enum should include at least:

```ts
'remove';
'approve';
'warn';
'note';
'temporary_ban_suggested';
'permanent_ban_suggested';
'ignore_reports';
'manual_review';
'log_only';
```

Default delivery mode: `log_only`.

### 3. Implement Policy Persistence Service

Create or update a policy service that supports:

- list policies
- get policy by ID
- get policy by rule ID
- create policy
- update policy
- deactivate/delete policy if simple
- create policy from drift candidate

Use Redis through the existing Redis service/helper.

### 4. Recommendation Logic

Implement pure functions to:

- resolve likely offense count from ModMirror action history,
- choose matching policy step,
- compute recommended action,
- compare selected action with recommendation,
- identify deviation severity if useful.

Keep this deterministic and unit-testable.

### 5. Small Subreddit / No Policy Defaults

Add helpers for:

- no policy exists,
- no scan data exists,
- not enough history exists.

These should return clear states for UI.

## API Endpoints

If the existing architecture uses server routes, add endpoints or service methods for:

- `GET /api/policies`
- `POST /api/policies`
- `GET /api/policies/:id`
- `PUT /api/policies/:id`
- `POST /api/policies/from-drift`

If exact route style differs, follow repo convention.

## Tests

Add unit tests for:

- policy creation validation,
- recommendation by offense count,
- no-policy fallback,
- deviation detection,
- Redis key namespacing if easy.

## Constraints

- Do not build dashboard UI.
- Do not build menu/form UX.
- Do not execute Reddit moderation actions.
- Do not add external services.
- Do not use LLMs.

## Completion Report

Update `TODO.md` with:

- what was implemented,
- files changed,
- tests added,
- any integration notes for other agents.
