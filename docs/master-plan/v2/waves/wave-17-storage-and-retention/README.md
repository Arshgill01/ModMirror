# Wave 17 - Storage And Retention

## Objective

Make Redis persistence, index trimming, storage caps, cleanup dry-runs, and
retention labels consistent and safe.

## Build Outcome

Storage behavior should be predictable under bounded envelopes, and cleanup
should never delete real operational records without explicit approval.

## Source Areas

- `src/server/services/redis.ts`
- `src/server/services/scans.ts`
- `src/server/services/receipts.ts`
- `src/server/services/privacyRetention.ts`
- `src/server/services/evidenceBoard.ts`
- `src/server/services/teamDelivery.ts`
- `src/routes/api.ts`
- `src/client/main.ts`

## Implementation Slices

1. Inventory all Redis indexes and detail keys.
2. Verify trim behavior for scans, receipts, overrides, boards, delivery, and
   calibration if added.
3. Add tests for index/detail consistency after trim.
4. Improve cleanup dry-run summaries.
5. Add retention UI labels that distinguish synthetic proof from real deletion.
6. Keep current caps unless larger caps are runtime-tested.
7. Add storage envelope docs if caps change.
8. Ensure namespace safety for demo resets.
9. Do not run destructive cleanup on real records without approval.
10. Update runtime proof backlog if evidence changes.

## Quality Bar

Persistence should be boring, bounded, and reviewable.

## Tests

- Redis service tests
- retention dry-run tests
- trim consistency tests
- namespace tests

## Acceptance Criteria

- Index/detail consistency is tested.
- Retention dry-runs are clear.
- Real deletion remains gated.
- Full validation passes.

