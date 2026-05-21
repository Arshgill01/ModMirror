# Agent Prompt — Wave 24: Native Mod Notes Integration

You are implementing Wave 24 of the ModMirror expansion continuation pack.

## Mission

Verify and implement Mod Notes where safe.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Research/runtime-test native Mod Notes. If verified, allow Apply Policy to add a mod note after confirmation. If not, keep generated note as copy/log-only. Receipt every attempt.

## Required deliverables

- capability proof
- mod notes service
- apply integration
- receipt status
- tests

## Acceptance criteria

- unverified path disabled
- verified path records status/ID
- failure visible
- fallback tests

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

`docs/expansion-waves/wave-24-mod-notes.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
