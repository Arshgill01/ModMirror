# DECISIONS.md — Locked Decisions

This file records important product and technical decisions.

## Decision 1: New Mod Tool Category

Status: Locked

We are building for the Best New Mod Tool category, not the Ported Data API App category.

Reason:

- Ported category has permission/ownership constraints.
- New tool route allows a more original product.
- ModMirror is not a port.

## Decision 2: Consistency-first Product Identity

Status: Locked

ModMirror is consistency-first, speed-second.

Primary value:

- detect enforcement drift,
- align team policy,
- guide future enforcement.

Speed is a UX benefit, not the core brand.

## Decision 3: Not a Queue Dashboard

Status: Locked

We will not build a generic modqueue dashboard for MVP.

Reason:

- likely crowded,
- less differentiated,
- weaker winner narrative.

## Decision 4: Not a Toolbox Clone

Status: Locked

We will not pitch ModMirror as a Toolbox replacement.

Reason:

- existing tools already cover usernotes/removal reasons/strike workflows.
- ModMirror's wedge is consistency and policy drift.

## Decision 5: No LLM/AI Judge in v1

Status: Locked

ModMirror will not use LLMs to classify or judge content in MVP.

Reason:

- moderation safety,
- Devvit review risk,
- deterministic behavior is more defensible,
- easier to build and demo in hackathon timeline.

## Decision 6: Hybrid Rule Attribution

Status: Locked

Historical rule attribution will use deterministic matching and confidence scoring.

Sources:

- removal reason title/message,
- subreddit rule title/body,
- mod log action text where available,
- ModMirror-created records.

Confidence:

- high,
- medium,
- low,
- unmatched.

## Decision 7: Dashboard + Forms

Status: Locked

Use a richer dashboard for scan/policy analytics and forms/menu actions for quick enforcement flows.

Reason:

- dashboard supports analysis,
- forms support lightweight action flows.

## Decision 8: Demo Mode Mandatory

Status: Locked

Seeded demo data is required.

Reason:

- judges may not have a rich test subreddit,
- screenshots/video need to show value immediately,
- cold-start must not look empty.

## Decision 9: Human Confirmation Required

Status: Locked

Significant enforcement actions require human confirmation.

Reason:

- safer,
- more moderator-trustworthy,
- avoids black-box automation concerns.

## Decision 10: Visibility

Status: Locked unless research shows impossible.

Default:

- all mods can see aggregate data,
- per-mod breakdowns are gated behind stronger permissions or omitted.

Reason:

- avoid team-surveillance framing.

## Decision 11: Wave 0 Devvit Web Scaffold

Status: Locked unless implementation proves the scaffold is incompatible.

Use the Devvit Web mod-tool scaffold with Hono server routes.

Current reality:

- `src/index.ts` is the server entry.
- Public endpoints mount under `/api`.
- Internal menu/form/trigger endpoints mount under `/internal`.
- The Wave 0 template did not generate a client dashboard entry; Wave 1 must create it deliberately.

Reason:

- Wave 0 build/typecheck proof succeeded with this shape.
- It matches Devvit-native capabilities and avoids external services.

## Decision 12: Local Rule Keys

Status: Locked unless runtime SDK proof discovers stable rule IDs.

Store policy references using a local derived rule key plus subreddit rule metadata such as `shortName`, `priority`, and description snapshots.

Reason:

- The installed Devvit `Rule` type does not expose a stable rule ID.
- Renames/reordering must be handled honestly instead of pretending a stable platform ID exists.

## Decision 13: Message Delivery Default

Status: Locked until playtest verifies comment delivery behavior.

Default message delivery is `log_only`.

Public comments can become the preferred visible warning/removal-message delivery mode only after playtest verifies:

- submitting comments on normal content,
- submitting comments before removal,
- submitting comments after removal,
- distinguishing/stickying the submitted comment where needed.

Reason:

- `submitComment` and `Comment.distinguish` exist in typings, but runtime behavior is not verified.
- Deprecated subreddit private messages must not be used.
