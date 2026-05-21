# Agent Prompt — Wave 21: Community Health and Consistency Lens

You are implementing Wave 21 of the ModMirror expansion continuation pack.

## Mission

Add aggregate community health signals tied to consistency without blame.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Create aggregate-only metrics: repeat offense trends, unresolved overrides, policy churn, drift stability, appeal/case packet volume, action consistency by rule. Avoid per-mod leaderboards.

## Required deliverables

- health model
- aggregate service
- UI
- privacy guardrails
- tests

## Acceptance criteria

- no per-mod blame
- metrics backed by stored data
- small data states truthful
- tests cover empty/small communities

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

`docs/expansion-waves/wave-21-community-health.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
