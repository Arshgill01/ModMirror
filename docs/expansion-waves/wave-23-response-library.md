# Wave 23: Moderation Response Library

## Summary

Wave 23 adds reusable response templates to policy steps and renders them in
Apply Policy previews. The templates cover warning, removal explanation, mod
note summary, modmail draft, and private-message draft copy.

Delivery remains gated. Confirming Apply Policy does not send comments,
messages, modmail, or native Mod Notes in this wave.

## What Changed

- Added response template schema on `PolicyStep`.
- Added a shared renderer that interpolates known moderation variables, escapes
  supplied values, and marks missing variables explicitly.
- Added policy editor textareas for all response template kinds.
- Added Apply Policy response preview cards.
- Stored gated response previews on action receipts for later review.
- Seeded default and demo policies with labeled log-only templates.
- Added unit coverage for escaping, missing variables, legacy fallback, and
  Apply Policy preview integration.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/shared/responseTemplates.ts`
- `src/shared/responseTemplates.test.ts`
- `src/shared/demoData.ts`
- `src/server/services/applyPolicy.ts`
- `src/server/services/applyPolicy.test.ts`
- `src/server/services/policies.ts`
- `src/server/services/receipts.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `TODO.md`
- `RESEARCH.md`

## Runtime Proof Status

Local/type/test/build verified only.

No Devvit playtest was run for this wave. Redis persistence of receipt-attached
response previews remains unverified in runtime and is tracked in `TODO.md`.

## Commands Run

- `npm install`
- `npm test -- src/shared/responseTemplates.test.ts src/server/services/applyPolicy.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

## Known Gaps

- Template delivery is not implemented and must remain disabled until the
  dedicated delivery waves prove Reddit runtime behavior.
- Template variables are intentionally limited to known target, policy, and
  recommendation fields.
- Existing policies without response templates use legacy template fields or a
  generated fallback preview.

## Safety Notes

- Missing variables render as `[missing variable_name]`.
- Interpolated values are escaped before preview.
- Delivery mode is shown for reviewer context, but `deliveryWillBeAttempted` is
  always false.
- Apply Policy confirmation still requires explicit moderator confirmation and
  keeps live delivery disabled.
