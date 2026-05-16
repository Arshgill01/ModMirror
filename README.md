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
- Demo seed mode

## Development Status

Wave 0 local scaffold proof.

The repo contains a Devvit Web mod-tool scaffold with non-destructive smoke
surfaces for Redis, Reddit API reads, post/comment menu actions, and form
chaining. Full playtest is currently blocked until `devvit login` is completed.

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
