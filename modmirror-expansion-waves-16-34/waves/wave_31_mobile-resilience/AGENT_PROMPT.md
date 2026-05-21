# Agent Prompt — Wave 31: Mobile and Runtime Resilience

You are implementing Wave 31 of the ModMirror expansion continuation pack.

## Mission

Make essential flows usable in narrow/mobile WebViews and degraded runtime conditions.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Do a mobile/narrow UX pass on Act, Scan, Review, Case Packet, and Settings. Add resilience for fetch failures, clipboard failures, missing Devvit globals, and slow API. Not a screenshot polish pass.

## Required deliverables

- responsive UI
- degraded-state UX
- error taxonomy
- tests/static checks

## Acceptance criteria

- no critical horizontal overflow
- core actions reachable narrow
- errors actionable
- fallbacks labeled

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

`docs/expansion-waves/wave-31-mobile-resilience.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
