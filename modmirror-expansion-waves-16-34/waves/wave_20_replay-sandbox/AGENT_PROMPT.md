# Agent Prompt — Wave 20: Replay Sandbox and Safe Simulation

You are implementing Wave 20 of the ModMirror expansion continuation pack.

## Mission

Let teams test proposed policy against historical/synthetic actions before adoption.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Build a replay engine that applies a policy ladder to historical attributed actions or synthetic histories and reports matches/deviations without mutating receipts.

## Required deliverables

- replay service
- API route
- policy UI
- tests
- fixtures

## Acceptance criteria

- policy replay works without live Reddit
- shows recommended action changes
- does not mutate receipts
- tests cover edge cases

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

`docs/expansion-waves/wave-20-replay-sandbox.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
