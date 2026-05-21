# Wave 05 - Reliability + Storage Envelope

## Objective

Strengthen Redis/storage reliability and failure behavior without raising
product claims beyond proven runtime envelopes.

## Source Areas

- `src/server/services/redis.ts`
- `src/server/services/scans.ts`
- `src/server/services/receipts.ts`
- `src/server/services/audit.ts`
- `src/server/services/runtimeCapabilities.ts`
- storage-related tests
- `docs/operational-overhaul/RUNTIME_PROOF_BACKLOG.md`

## Deliverables

- Review all capped indexes for consistent trim behavior.
- Add regression tests for index/detail consistency after cleanup.
- Add user-facing failure messages for partial storage failures where missing.
- Optional runtime smoke for larger envelope only if explicitly planned and
  cleanup-safe.

## Guardrails

- Do not raise storage caps unless runtime-tested.
- Do not delete real operational records.
- Do not hide partial persistence failures.

## Acceptance Criteria

- Storage tests cover scan/action/override/receipt index consistency.
- Existing runtime-proven caps remain documented.
- Full validation commands pass.
