---
name: modmirror-product-guardrails
description: Enforce ModMirror's product positioning, MVP scope, safety boundaries, demo story, and hackathon claim limits. Use before product, UX, copy, data model, or workflow changes that could alter what ModMirror is or promises.
---

# ModMirror Product Guardrails

Use this skill to keep future work aligned with the locked product thesis.

## Core Positioning

- Name: ModMirror.
- Tagline: "Find enforcement drift before your users do."
- Thesis: consistency-first, speed-second.
- Category: Best New Mod Tool.
- Position as a policy consistency layer, moderation governance tool, and guided enforcement workflow.

Do not position ModMirror as a generic queue dashboard, Toolbox clone, strike bot, migrated bot, AI moderator, or automatic enforcement system.

## Locked MVP

Build only these core features until the MVP is stable:

- Mirror Scan
- Policy Agreement Flow
- Apply Policy Action
- Consistency Nudge + Override Audit
- Demo mode

Defer dashboards, analytics, appeal packets, AI classifiers, and cross-subreddit benchmarking unless they directly support the MVP story.

## Safety Rules

- No LLM/AI judging in v1.
- No automatic bans as the default demo.
- Require human confirmation for meaningful enforcement actions.
- Be honest about inferred historical rule attribution.
- Use confidence labels: `high`, `medium`, `low`, `unmatched`.
- Hide or omit per-mod breakdowns unless strong moderator/manage-level permissions are verified.
- Store only the minimum data needed for product value.

## Demo Story

Preserve this arc:

1. A mod team installs ModMirror.
2. Mirror Scan finds enforcement drift.
3. A lead mod creates a rule policy ladder.
4. A new violation appears.
5. Apply Policy recommends the team-aligned action.
6. A stricter/looser choice triggers an override reason.
7. The override is logged so the team can improve policy later.

Central line:

> Your team thought Rule 2 was simple. ModMirror showed that it was not.

## Review Checklist

Before finalizing product changes, verify:

- The change supports consistency, not just speed.
- The UI does not imply inferred labels are certain.
- The workflow keeps moderators in control.
- Demo mode remains clearly labeled.
- Claims are defensible from implemented behavior.
