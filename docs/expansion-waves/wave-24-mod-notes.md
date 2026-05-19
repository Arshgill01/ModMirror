# Wave 24: Native Mod Notes Integration

## Summary

Wave 24 adds a gated native Mod Notes path to Apply Policy. Moderators can
choose no Mod Note, log-only receipt storage, or native Mod Note mode. Native
writes remain disabled unless runtime verification flags are set.

## Capability Proof

Evidence checked:

- Official Reddit for Developers docs list `RedditAPIClient.addModNote(options)`
  and the `ModNote` model:
  `https://developers.reddit.com/docs/api/redditapi/classes/RedditAPIClient.RedditAPIClient`
  and `https://developers.reddit.com/docs/api/redditapi/models/classes/ModNote`.
- Installed typings expose `reddit.addModNote(options): Promise<ModNote>` in
  `node_modules/@devvit/reddit/RedditClient.d.ts`.
- Installed typings show native note options in
  `node_modules/@devvit/reddit/models/ModNote.d.ts` and the protobuf JSON type
  documents the 250-character note limit.

Runtime proof was not obtained in this wave. The capability remains type/build
only and native writes are disabled by default.

## What Changed

- Added native Mod Note mode, capability state, status, and receipt schema.
- Added `src/server/services/modNotes.ts` with:
  - log-only fallback;
  - unverified-disabled gate;
  - receipt-required gate;
  - native success result with returned note ID;
  - native failure classification.
- Added Apply Policy confirm integration.
- Added Apply Policy UI control for `none`, `log_only`, and `native`.
- Added receipt rendering for native Mod Note status.
- Added tests for unverified fallback, success, failure, log-only fallback, and
  note truncation.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/server/services/modNotes.ts`
- `src/server/services/modNotes.test.ts`
- `src/server/services/applyPolicy.ts`
- `src/server/services/applyPolicy.test.ts`
- `src/server/services/receipts.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `TODO.md`
- `RESEARCH.md`

## Runtime Proof Status

Type/build/local-test verified only.

No native Mod Note was sent in playtest. Native mode remains blocked unless
both flags are explicitly enabled after runtime proof:

- `MODMIRROR_ENABLE_NATIVE_MOD_NOTES=true`
- `MODMIRROR_NATIVE_MOD_NOTES_RUNTIME_VERIFIED=true`

## Commands Run

- `npm install`
- `npm test -- src/server/services/modNotes.test.ts src/server/services/applyPolicy.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

## Known Gaps

- `reddit.addModNote` permission behavior and returned ID shape still need
  safe playtest verification.
- Native Mod Note readback via `getModNotes` was not implemented in this wave.
- Native labels are omitted for now to avoid inaccurate label assignment.

## Safety Notes

- Native writes require explicit moderator confirmation and `modNoteMode:
  native`.
- Native writes are blocked by default configuration and runtime-proof gates.
- Log-only mode stores the generated note body on the ModMirror receipt only.
- Failed native attempts are recorded with visible status and error metadata.
