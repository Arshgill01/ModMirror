# Agent Prompt — Wave 27: Incident Mode

You are implementing Wave 27 of the ModMirror expansion continuation pack.

## Mission

Add temporary high-signal moderation mode for raids/spam floods/crisis.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Build opt-in Incident Mode with start/end, reason, stricter policy preset suggestions, high-volume triage grouping, and post-incident review. No auto-ban/auto-remove.

## Required deliverables

- incident schema
- UI banner
- policy preset hooks
- post-incident report
- tests

## Acceptance criteria

- explicit and temporary
- receipts tag incident ID
- end/review flow exists
- no silent auto-action

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

`docs/expansion-waves/wave-27-incident-mode.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
