# Agent Prompt — Wave 18: Attribution Calibration and Moderator Feedback

You are implementing Wave 18 of the ModMirror expansion continuation pack.

## Mission

Make rule attribution improve through moderator feedback.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Add calibration records so moderators can correct inferred rules. Use correction signals in future attribution. Preserve inferred/corrected distinction and evidence.

## Required deliverables

- calibration model
- feedback API/UI
- updated attribution engine
- tests

## Acceptance criteria

- moderator can correct inferred rule
- future scans use corrections
- evidence shows inferred/corrected distinction
- synthetic tests prove improvement

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

`docs/expansion-waves/wave-18-attribution-calibration.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
