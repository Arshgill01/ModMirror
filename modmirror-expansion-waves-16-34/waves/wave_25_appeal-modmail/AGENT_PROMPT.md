# Agent Prompt — Wave 25: Appeal / Modmail Context Integration

You are implementing Wave 25 of the ModMirror expansion continuation pack.

## Mission

Explore modmail/appeal context and safe delivery.

## Required context before coding

Read:
- `docs/expansion-waves/REPO_CONTEXT_RELOAD.md`
- current source files related to this wave
- existing tests
- relevant shared specs under `shared_specs/`
- prior wave outputs if this wave depends on them

If `REPO_CONTEXT_RELOAD.md` does not exist, stop and create it first according to `02_STATE_RELOAD_PROTOCOL.md`.

## Implementation instructions

Research modmail/mod discussion APIs. If safe, allow Case Packet export to a modmail/mod discussion draft or internal note. All delivery preview + confirm. Manual export always works.

## Required deliverables

- capability research
- delivery draft model
- case packet integration
- tests

## Acceptance criteria

- manual path works
- runtime delivery only verified
- receipt/status stored
- no auto-send

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

`docs/expansion-waves/wave-25-appeal-modmail.md`

Include implementation summary, files changed, runtime proof status, tests run, known gaps, and safety/privacy notes.

## Hard boundaries

Do not do submission work, auto-enforce without confirmation, claim unverified runtime behavior, expose per-mod blame analytics, or treat AI output as authoritative.
