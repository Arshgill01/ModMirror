# Wave 16 - Runtime Resilience

## Objective

Harden partial failure, offline, fallback, loading, retry, and stale-data states
across the Devvit WebView.

## Build Outcome

When Reddit APIs, Redis, runtime context, or client requests fail, ModMirror
should degrade clearly and keep safe actions available.

## Source Areas

- `src/client/main.ts`
- `src/shared/clientResilience.ts`
- `src/client/mobileResilience.test.ts`
- `src/server/services/runtimeCapabilities.ts`
- `src/routes/api.ts`
- `src/server/services/redis.ts`
- `src/shared/status.ts`

## Implementation Slices

1. Audit current fetch/error handling patterns.
2. Add or improve typed client request states.
3. Add retry controls for safe reads.
4. Add stale-data labels for cached or persisted state.
5. Add clear fallbacks for unavailable runtime context.
6. Add partial persistence warnings where appropriate.
7. Add narrow/mobile resilience checks.
8. Add tests for client resilience helpers.
9. Verify no error path enables unsafe actions.
10. Document remaining platform-specific failures.

## Quality Bar

Runtime problems should look controlled, not broken.

## Tests

- client resilience tests
- route error tests
- mobile/narrow state tests
- full validation

## Acceptance Criteria

- Common API failures produce useful UI states.
- Retry is available only where safe.
- Stale and fallback data are labeled.
- Full validation passes.

