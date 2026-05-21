# Agent Prompt — Wave 30: Privacy, Retention, and Deletion Controls

You are implementing Wave 30 of the ModMirror expansion continuation pack.

## Mission

Make data lifecycle real.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Implement retention settings and delete/export controls for scan history, receipts, snapshots, case packets, evidence boards, and AI logs if any. Add cleanup service and settings UI.

## Required deliverables

- retention model
- cleanup service
- settings UI
- export/delete
- tests

## Acceptance criteria

- retention applies
- manual delete works
- policy history protected by default
- cleanup tests

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

`docs/expansion-waves/wave-30-privacy-retention.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
