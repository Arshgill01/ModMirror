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

Operational overhaul W00-W14, Expansion W16-W34, and the post-W34 runtime
proof follow-up are merged on `master`.

Current `master` passed `npm run deploy` on May 21, 2026 and uploaded Devvit
app version `0.0.2` with WebView capability. Treat that as deploy/upload
readiness, not route-level proof for every WebView API path.

The app opens with a compact Reddit inline launch card and can expand into
Reddit's native WebView modal. The dashboard is now organized around moderator
jobs: Act, Scan, Agree, Review, Prove, and Settings.

Implemented product surfaces include target-aware Apply Policy preview,
explicit confirmation and log-only fallback, immutable action receipts, Mirror
Scan history, deep scan depth controls, drift-over-time analytics, policy
proposal/review/adoption, receipt-backed Case Packets, manual Markdown Digest,
disabled-by-default AI advisory, preview-first team delivery, and a runtime
verification matrix.

W13 runtime proof verified the subreddit dashboard launcher and the operational
IA in the desktop expanded WebView on `r/modmirror_dev` playtest `v0.0.1.71`.
Post-W34 runtime proof advanced the safe desktop Reddit WebView paths through
playtest `v0.0.1.120`: safe Redis and Reddit read smokes, post/comment Apply
Policy menu target capture, log-only receipt persistence, receipt-backed
Evidence Boards and Case Packets, Incident Mode receipt tagging, config import
/ export, privacy dry-run controls, response preview receipts, and UI
alignment in fullscreen.

Native Reddit mobile behavior, real Reddit moderation execution, actual
retention deletion, Mod Discussion delivery, scheduler behavior, native Mod
Notes, live modqueue reads, non-mod access checks, and external AI calls remain
disabled or unverified until dedicated runtime proof exists.

Before public publishing, app details page terms and privacy links still need
to be set outside the local CLI flow.

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
