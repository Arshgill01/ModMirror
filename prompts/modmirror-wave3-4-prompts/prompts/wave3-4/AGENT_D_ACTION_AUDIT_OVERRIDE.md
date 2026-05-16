# AGENT_D_ACTION_AUDIT_OVERRIDE.md

## Role

You own action logging, override audit, and dashboard aggregate audit state.

## Read First

- `AGENTS.md`
- `PLAN.md`
- `RESEARCH.md`
- `docs/DATA_MODEL.md`
- `docs/DECISIONS.md`
- `docs/WAVE3_4_EXECUTION_NOTES.md`

## Goal

Implement safe auditability for Apply Policy decisions.

## Required Data

### Action Event

Store an action event whenever a policy is applied or simulated.

Fields should include:
- id
- subreddit/install context
- mod username if available
- target thing ID if available
- target author if available
- rule ID
- policy ID
- recommended action
- selected action
- delivery mode
- createdAt
- source: live | demo | simulator

### Override Event

If selected action differs from recommended action, require an override reason.

Dropdown values:
- severe_context
- repeat_pattern_not_captured
- user_history_outside_modmirror
- edge_case_mod_discretion
- policy_seems_wrong
- other

Optional free-text note.

Store:
- recommended action,
- selected action,
- reason,
- optional note,
- timestamp.

## Dashboard Aggregate

Add an aggregate override summary:

- total overrides,
- overrides by rule,
- overrides by reason,
- recent override list without unnecessary per-mod blame.

Per-mod breakdowns:
- omit unless strong permission gating is already verified.
- if shown, only to users with strong/manage permissions.

## API

Implement or use endpoints:

- `GET /api/actions`
- `GET /api/overrides`
- `GET /api/overrides/summary`
- service methods for action/override creation.

Follow repo conventions.

## UX Copy

Use neutral language:

- "Policy exception recorded"
- "Override reason"
- "This may indicate policy needs adjustment"

Avoid:
- "Mod violated policy"
- "Non-compliant moderator"
- blame-heavy language.

## Tests

Add tests for:

- action event creation,
- override required when deviating,
- no override required when matching,
- aggregate counts,
- sensitive per-mod data hidden by default.

## Completion Report

Update `TODO.md` with:
- audit functions added,
- endpoints added,
- dashboard summary status,
- privacy limitations.
