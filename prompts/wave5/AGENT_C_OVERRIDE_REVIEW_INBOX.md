# AGENT_C_OVERRIDE_REVIEW_INBOX.md — Override Review Inbox

## Mission

Turn override logs into reviewable governance signals.

Overrides are not just audit records. They are feedback for improving policy.

## Read First

- AGENTS.md
- PLAN.md
- docs/DATA_MODEL.md
- prompts/wave5/WAVE5_ORCHESTRATOR.md
- current override/action logging implementation

## Required Review Statuses

```txt
unresolved
accepted_exception
policy_needs_update
needs_team_discussion
no_action_needed
```

## Required Fields

Extend override events or add review records with:

```ts
reviewStatus
reviewedBy
reviewedAt
reviewNote
updatedAt
```

If current override events are immutable, store separate review records keyed by override ID.

## Tasks

### 1. Inspect current override storage

Find how Wave 3/4 stores override events.

Do not break existing event schema without migration/fallback.

### 2. Add review status model

New overrides should default to:

```txt
unresolved
```

### 3. Add list/query helpers

Must support:

- list unresolved overrides
- list overrides by rule/policy
- list reviewed overrides
- filter by status if simple
- get override detail

### 4. Add update review helper

Implement review transition:

Input:

```ts
overrideId
reviewStatus
reviewNote?
reviewedBy
```

Behavior:

- update review fields,
- preserve original override reason/action,
- record updatedAt/reviewedAt.

### 5. Add API endpoints

Use current server conventions.

Possible endpoints:

```txt
GET /api/overrides
GET /api/overrides?status=unresolved
POST /api/overrides/:id/review
```

Adapt path names to existing architecture.

### 6. Add dashboard-friendly response

Each override row should include:

- override ID
- rule name
- target type/ID if available
- recommended action
- selected action
- override reason
- createdAt
- review status
- policy version info if available

### 7. Tests

Add tests for:

- new override defaults unresolved
- review status update
- invalid status rejected
- original override fields preserved
- query unresolved overrides

## Acceptance Criteria

- Existing override logging still works.
- Review inbox data exists.
- Review state transitions work.
- Policy health can count unresolved/reviewed overrides.
- No per-mod blame UI required.
