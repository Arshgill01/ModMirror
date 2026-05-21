# Agent Prompt — Wave 28: Configuration Portability and Templates

You are implementing Wave 28 of the ModMirror expansion continuation pack.

## Mission

Allow communities to export/import policies and settings safely.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Build export/import for policies, response templates, non-sensitive settings, and demo/test configurations. Built-in templates are allowed only as clearly labeled starters. Do not export private logs by default.

## Required deliverables

- export service
- import validation
- template format
- UI
- tests

## Acceptance criteria

- private history excluded by default
- schema/version validated
- bad imports fail safely
- migration tests

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

`docs/expansion-waves/wave-28-config-portability.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
