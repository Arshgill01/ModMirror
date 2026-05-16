# AGENT_C_APPLY_POLICY_FLOW.md

## Role

You own the Apply Policy flow from post/comment menu action or dashboard fallback simulator.

## Read First

- `AGENTS.md`
- `PLAN.md`
- `RESEARCH.md`
- `docs/PRODUCT.md`
- `docs/DECISIONS.md`
- `docs/WAVE3_4_EXECUTION_NOTES.md`

## Goal

Allow a moderator to apply a configured policy to a target post/comment, see the recommendation, and confirm an action.

## Required Flow

1. Moderator starts Apply Policy.
2. Select rule/policy.
3. App loads policy and target context.
4. App computes recommendation.
5. App shows:
   - selected rule,
   - offense count/context if known,
   - recommended action,
   - message delivery mode,
   - warning if no policy exists.
6. Moderator chooses/accepts action.
7. If action deviates, integrate with override flow from Agent D.
8. Store action event.

## Primary Surface

Use post/comment menu action if Wave 0/RESEARCH.md verified it.

If menu actions remain runtime-blocked:

- build a dashboard Apply Policy simulator that accepts:
  - fake target thing ID,
  - fake author,
  - selected rule,
  - selected action.
- Clearly label simulator/demo mode.

## Empty Policy Fallback

If no policy exists for selected rule:

- route to create policy,
- do not error.

## Message Delivery

Safe default is `log_only`.

If `submitComment` or PM behavior is verified in `RESEARCH.md`, implement as optional modes:

- `public_comment`
- `private_message`
- `log_only`

Do not attempt live removal/comment behavior if not verified.

## Enforcement Safety

- Do not auto-ban.
- Temporary/permanent ban actions should be suggestions/logged actions unless explicitly verified and intentionally enabled.
- Human confirmation required.

## Backend/API

Implement or use endpoints such as:

- `POST /api/apply-policy/preview`
- `POST /api/apply-policy/confirm`

Follow existing repo conventions.

## Tests

Add tests for:

- preview recommendation,
- no-policy fallback,
- log_only confirm,
- missing target context handling,
- integration with deviation detection if available.

## Completion Report

Update `TODO.md` and document:

- menu action status,
- fallback simulator status,
- runtime limitations,
- manual QA steps.
