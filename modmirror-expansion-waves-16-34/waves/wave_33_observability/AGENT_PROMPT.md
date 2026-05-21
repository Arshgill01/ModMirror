# Agent Prompt — Wave 33: Observability and Runtime Capability Matrix

You are implementing Wave 33 of the ModMirror expansion continuation pack.

## Mission

Make runtime truth visible and auditable.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Build runtime capability matrix: Reddit API, Redis, menus, execution operations, comments, Mod Notes, modmail, AI, scheduler, retention cleanup. Add health events and failure receipts.

## Required deliverables

- capability service
- health events
- settings matrix
- tests

## Acceptance criteria

- settings distinguishes runtime/type/demo
- failures recorded
- capabilities update after tests
- no unsupported claims

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

`docs/expansion-waves/wave-33-observability.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
