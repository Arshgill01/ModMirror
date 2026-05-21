# Agent Prompt — Wave 23: Moderation Response Library

You are implementing Wave 23 of the ModMirror expansion continuation pack.

## Mission

Create reusable response templates/macros tied to policy steps.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Build per-rule/per-step templates: warning, removal explanation, mod note summary, modmail/private note draft. Connect to Apply Policy preview. Do not send without confirmation.

## Required deliverables

- template schema
- editor
- preview renderer
- apply integration
- tests

## Acceptance criteria

- templates render safely
- missing variables handled
- delivery gated
- escaping/fallback tests

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

`docs/expansion-waves/wave-23-response-library.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
