# Agent Prompt — Wave 19: Policy Ratification and Team Workflow

You are implementing Wave 19 of the ModMirror expansion continuation pack.

## Mission

Turn policy agreement into real team workflow.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Implement policy lifecycle states: draft, proposed, under_review, adopted, superseded, archived. Add reviewer votes, adoption thresholds, proposal notes, and version promotion. Active adopted policy should be default for Apply Policy.

## Required deliverables

- schema changes
- ratification service
- UI
- tests

## Acceptance criteria

- policy can be proposed/adopted
- unadopted policy not silently active unless configured
- version history preserved
- invalid transitions tested

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

`docs/expansion-waves/wave-19-policy-ratification.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
