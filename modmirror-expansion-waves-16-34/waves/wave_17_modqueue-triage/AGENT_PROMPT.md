# Agent Prompt — Wave 17: Moderator Queue and Report Triage

You are implementing Wave 17 of the ModMirror expansion continuation pack.

## Mission

Explore/build a real modqueue/report triage surface if Devvit APIs support it.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Research current Devvit APIs for modqueue/reports. If supported, build queue ingestion and a triage surface grouped by likely rule/policy, report reason, risk state, and history. If unsupported, build a truthful capability-disabled state and route users to post/comment menu flows.

## Required deliverables

- capability report
- queue adapter or unsupported UI
- triage schema/page
- tests

## Acceptance criteria

- capability status recorded
- no fake queue if unsupported
- supported path has tests
- triage links into Apply Policy

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

`docs/expansion-waves/wave-17-modqueue-triage.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
