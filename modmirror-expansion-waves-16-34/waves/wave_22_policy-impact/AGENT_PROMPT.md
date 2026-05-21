# Agent Prompt — Wave 22: Policy Impact Measurement

You are implementing Wave 22 of the ModMirror expansion continuation pack.

## Mission

Measure whether adopted policies improved consistency.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Use scan history + receipts + policy versions to compute before/after impact per policy version/rule: consistency before adoption, after adoption, override rates, confidence caveats. Insufficient data must say insufficient data.

## Required deliverables

- impact service
- timeline
- before/after UI
- tests

## Acceptance criteria

- impact requires data thresholds
- demo path labeled demo
- impact appears on policy detail
- tests cover insufficient data

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

`docs/expansion-waves/wave-22-policy-impact.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
