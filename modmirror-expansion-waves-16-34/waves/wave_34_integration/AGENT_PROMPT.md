# Agent Prompt — Wave 34: Integration and Architecture Consolidation

You are implementing Wave 34 of the ModMirror expansion continuation pack.

## Mission

Integrate expansion waves without submission polish.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Merge branches, resolve conflicts, remove duplicate models, fix naming, centralize safety gates, update build-only docs, run full checks. Produce build report only.

## Required deliverables

- merged integration branch
- BUILD_REPORT.md
- architecture notes
- full checks

## Acceptance criteria

- checks pass or gaps documented
- no duplicate dead surfaces
- safety gates centralized
- no submission work

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

`docs/expansion-waves/wave-34-integration.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
