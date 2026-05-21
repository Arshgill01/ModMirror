# Agent Prompt — Wave 29: Multi-Community Architecture

You are implementing Wave 29 of the ModMirror expansion continuation pack.

## Mission

Strengthen per-subreddit isolation and optional template reuse.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Audit Redis keys and APIs for subreddit isolation. Add guards so one subreddit cannot read another's data. Allow template copying without private logs. Add key-isolation tests.

## Required deliverables

- isolation audit
- key guards
- API permission checks
- tests

## Acceptance criteria

- routes derive/validate subreddit safely
- no cross-subreddit logs leak
- templates copy non-sensitive data only
- isolation tests

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

`docs/expansion-waves/wave-29-multi-community.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
