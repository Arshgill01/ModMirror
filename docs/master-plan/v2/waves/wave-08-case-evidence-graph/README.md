# Wave 08 - Case Evidence Graph

## Objective

Connect receipts, content snapshots, policy versions, overrides, case packets,
and evidence boards into a coherent evidence graph.

## Build Outcome

Every important decision can be explained through linked records rather than
scattered pages.

## Source Areas

- `src/server/services/receipts.ts`
- `src/server/services/casePacket.ts`
- `src/server/services/evidenceBoard.ts`
- `src/server/services/contentSnapshots.ts`
- `src/server/services/audit.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/shared/schema.ts`

## Implementation Slices

1. Inventory existing ID/reference fields.
2. Define a common evidence reference type if one does not exist.
3. Backfill graph construction from receipts, packets, boards, snapshots, and
   policies.
4. Add route to fetch evidence graph for a target, receipt, or board.
5. Add privacy filtering for sensitive fields.
6. Add UI graph/list view that is readable without visualization gimmicks.
7. Link graph nodes from Review, Prove, and Apply Policy receipts.
8. Add tests for graph consistency and privacy filtering.
9. Handle missing referenced records gracefully.
10. Update runtime labels if graph uses only persisted local data.

## Quality Bar

Evidence Graph should make ModMirror more trustworthy, not more complex.

## Tests

- graph construction tests
- missing-node tests
- privacy filter tests
- route tests

## Acceptance Criteria

- Receipt can link to related policy, packet, board, and snapshot.
- Missing records do not break the view.
- Sensitive fields are filtered.
- Full validation passes.

