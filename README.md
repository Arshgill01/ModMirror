# ModMirror

> Find enforcement drift before your users do.

ModMirror is a Reddit Devvit moderation app that helps mod teams enforce rules consistently.

It scans recent moderation patterns, identifies enforcement drift, helps teams agree on rule policies, and gives moderators live consistency nudges when handling posts or comments.

## Hackathon

Built for the Reddit Mod Tools and Migrated Apps Hackathon.

Category: Best New Mod Tool

## Product Thesis

Most moderation tools help moderators act faster.

ModMirror helps moderator teams act consistently.

## MVP

- Mirror Scan
- Policy Agreement Flow
- Apply Policy Action
- Consistency Nudge + Override Audit
- Governance Core
- Demo seed mode

## Development Status

Wave 7/8 productization and the follow-up visual rescue are merged to
`master`. Wave 9/10 launch-readiness work is active on
`integration/wave9-10-launch-readiness`.

The app now opens with a compact Reddit inline launch card instead of rendering
the full dashboard inside the post. Opening the dashboard uses Reddit's native
expanded WebView modal when available, preserving the Devvit viewport dropdown,
and still has an in-post fallback. The productized Command Center shows scan
status, policy health, unresolved overrides, setup progress, and the
ExampleLearning demo path.

Implemented product surfaces include Mirror Scan, Policy Agreement Flow, Apply
Policy simulator, consistency nudges, aggregate override review, immutable
policy versions, policy health, Case Packets, manual Markdown Digest, and
runtime Settings. Wave 9/10 adds persisted digest history and launch-readiness
materials. Destructive or externally delivered moderation actions remain
disabled by default; Apply Policy records are `log_only` until runtime delivery
behavior is playtest-verified.

## Local Commands

- `npm install`
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm test`
- `npm run dev`

See:

- `AGENTS.md`
- `PLAN.md`
- `TODO.md`
- `RESEARCH.md`
- `docs/PRODUCT.md`
