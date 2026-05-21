# Agent Prompt — Wave 26: Collaborative Evidence Board

You are implementing Wave 26 of the ModMirror expansion continuation pack.

## Mission

Create team evidence board for disputed actions and policy reviews.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Build an Evidence Board where receipts, snapshots, overrides, comparables, case packets, and policy changes attach to a review thread with statuses: open, needs_policy_change, accepted_exception, resolved, archived.

## Required deliverables

- evidence board schema
- service
- UI
- links from receipts/case packets
- tests

## Acceptance criteria

- collects evidence from multiple sources
- statuses update
- privacy preserved
- lifecycle tests

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

`docs/expansion-waves/wave-26-evidence-board.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
