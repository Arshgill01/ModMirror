# Global Acceptance Criteria

The overhaul is not successful unless these are true.

## Product credibility

- No production-facing "smoke test" language remains.
- Demo data is clearly labeled and never presented as live.
- Runtime capabilities are accurately labeled: verified / unverified / disabled / fallback.
- Apply Policy no longer means "just write a Redis log" when execution is enabled and verified.

## Safety

- Every real Reddit action requires explicit moderator confirmation.
- The preview states exactly what Reddit action will be attempted.
- Every execution attempt creates a receipt.
- Failures create receipts too.
- Log-only fallback exists.
- Destructive actions are never default-on without runtime proof.
- Permission checks exist server-side.

## Technical quality

- Shared schema updated and tested.
- Redis keys are namespaced and documented.
- Server routes validate input.
- Client handles errors and partial capability states.
- Tests cover happy paths and safety failure paths.
- Build/typecheck/lint/test pass.

## UX quality

- Product is organized by real moderator jobs, not random dashboard widgets.
- Avoid generic card-grid AI slop.
- Use ledger/timeline/evidence/document layouts where appropriate.
- Mobile/narrow viewport should not break.
- Empty states should guide action but not fake data.

## Research honesty

- Official docs/installed typings/runtime proof trump guesses.
- Web search or installed typings must be used for uncertain Devvit behavior.
- Anything not runtime-verified must remain disabled or behind explicit experimental labels.
