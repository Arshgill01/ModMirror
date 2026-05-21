# Agent Prompt — Wave 32: Synthetic Evaluation Harness

You are implementing Wave 32 of the ModMirror expansion continuation pack.

## Mission

Build a synthetic data generator for drift/policy/evidence evaluation.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Create deterministic synthetic histories: stable rule, high drift, policy improved, small subreddit, noisy attribution, repeated offender, policy version change, incident mode. Use for tests/dev scenarios.

## Required deliverables

- fixture generator
- golden datasets
- evaluation script
- tests

## Acceptance criteria

- datasets deterministic
- drift metrics validated
- policy replay validated
- local tests can run

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

`docs/expansion-waves/wave-32-synthetic-eval.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
