# Wave 24 - Redis Index Hygiene And Storage Envelope

## Objective

Harden Redis sorted-set index behavior for mutable JSON members while keeping
the currently verified storage caps unchanged.

## Scope

Allowed write set for this wave:

- `src/server/services/redis.ts`
- `src/server/services/redis.test.ts`
- `docs/master-plan/v4-production-grade/waves/wave-24-redis-index-hygiene/*`

Out of scope:

- client UI;
- calibration, Drift Radar, and Policy Simulator;
- runtime proof docs;
- destructive retention or Reddit moderation execution code.

## Plan

1. Inspect current Redis persistence helpers and related read-only call sites.
2. Add shared Redis helpers for JSON sorted-set hygiene:
   - malformed JSON members are treated as stale;
   - duplicate logical records are deduped by stable ID;
   - mutable records can be upserted without leaving old JSON members;
   - mutable records can be deleted by stable ID.
3. Add focused Redis service tests for stale members, compaction,
   update/delete consistency, and current storage caps.
4. Run targeted tests and type-check.

## Storage Envelope

This wave does not raise storage caps. The current locally and runtime-verified
caps remain:

| Item | Cap |
|---|---:|
| scan metadata index | 10 |
| action event index | 500 |
| override event index | 500 |

Larger caps require a separate runtime storage proof before documentation or
product claims are updated.

## Acceptance Criteria

- Tests cover stale sorted-set JSON members.
- Tests cover compaction of duplicate logical records.
- Tests cover update/delete consistency for mutable JSON members.
- Tests pin the current storage caps.
- No destructive cleanup path or unrelated product surface is changed.
