---
name: policy-flow
description: Implement or review ModMirror policy ladders, Policy Agreement Flow, Apply Policy action, consistency nudges, override reasons, Redis persistence, and audit events. Use when working on policy services, forms, workflow UX, or enforcement confirmation.
---

# Policy Flow

Use this skill for ModMirror's moderator-facing policy workflow.

## Required Flow

Policy Agreement:

1. Start from drift finding or manual rule selection.
2. Create or edit a rule policy ladder.
3. Store policy in Redis under the subreddit namespace.
4. Provide a no-policy fallback that routes to creation instead of erroring.

Apply Policy:

1. Moderator starts from a post/comment menu action.
2. App captures target ID and fetches author.
3. Moderator chooses rule/policy.
4. App loads policy and recent user/action history.
5. App recommends action.
6. Moderator confirms.
7. App performs only verified stable actions.
8. App logs the decision.

## Policy Shape

Policy steps should support:

- offense count
- window days
- recommended action
- optional message/note template
- whether deviation requires override reason

Keep ban execution conservative. Prefer `temporary_ban_suggested` over automatic bans unless explicitly verified and requested.

## Override Audit

When selected action differs from policy, require one of:

- `severe_context`
- `repeat_pattern_not_captured`
- `user_history_outside_modmirror`
- `edge_case_mod_discretion`
- `policy_seems_wrong`
- `other`

Store override events in Redis with subreddit namespace and minimal necessary data.

## Safety

- Human confirmation is required for meaningful enforcement actions.
- If no policy exists, route to policy creation.
- If delivery behavior is unverified, use `log_only`.
- Do not expose per-mod analytics unless permission gating is verified.
