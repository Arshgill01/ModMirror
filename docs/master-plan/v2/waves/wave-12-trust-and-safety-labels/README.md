# Wave 12 - Trust And Safety Labels

## Objective

Make proof state, confidence, privacy, demo/live source, and disabled capability
status visible wherever they matter.

## Build Outcome

Users should never confuse demo data for live data, inferred attribution for
fact, local proof for runtime proof, or preview-only behavior for execution.

## Source Areas

- `src/shared/status.ts`
- `src/shared/schema.ts`
- `src/server/services/runtimeCapabilities.ts`
- `src/server/services/runtimeVerification.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `docs/operational-overhaul/RUNTIME_VERIFICATION_MATRIX.md`

## Implementation Slices

1. Inventory all current status labels.
2. Define a shared label vocabulary for source, proof, confidence, privacy, and
   capability status.
3. Add UI helpers for labels and caveats.
4. Apply labels to Command Center, Scan, Drift Radar, Apply Policy, Review,
   Calibration, Settings, and Prove.
5. Add disabled-state explanations for unverified delivery/execution paths.
6. Add tests for status mapping helpers.
7. Remove ambiguous text like "works" where only local proof exists.
8. Verify no labels overclaim native mobile or destructive runtime proof.
9. Update docs for durable label vocabulary.
10. Keep labels concise so the UI remains usable.

## Quality Bar

Trust labels should make the product safer and more credible without burying the
workflow in warnings.

## Tests

- status helper tests
- capability mapping tests
- client rendering tests where feasible

## Acceptance Criteria

- Demo/live/proof/confidence states are clear.
- Disabled capabilities explain why they are disabled.
- No unverified platform behavior is claimed.
- Full validation passes.

