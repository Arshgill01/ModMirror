# Agent Prompt — Wave 16: Live Context Intake and Content Snapshotting

You are implementing Wave 16 of the ModMirror expansion continuation pack.

## Mission

Capture target post/comment context into stable evidence snapshots.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Build a `contentSnapshots` layer that fetches and normalizes target post/comment context when a moderator opens ModMirror from menu or dashboard. Include target ID, kind, subreddit, permalink, author if available, title/body excerpt if available, createdAt if available, fetchedAt, fetch status, source, privacy metadata. Integrate snapshots into Apply Policy, Case Packet, receipts, and evidence views.

## Required deliverables

- content snapshot schema/types
- server service
- API/menu integration
- tests
- privacy notes

## Acceptance criteria

- post/comment target can produce snapshot
- failed fetch produces truthful degraded snapshot
- snapshots appear in receipts/case packets
- tests cover post/comment/failure

## Testing

Run:
- `npm run type-check`
- `npm run lint`
- relevant unit/integration tests
- full `npm test` when shared schemas/services changed
- `npm run build`

If this wave touches Devvit runtime behavior, attempt runtime verification and record exact status. If not possible, mark it clearly as type/build/static only.

## Required documentation

Add/update:

`docs/expansion-waves/wave-16-context-intake.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
