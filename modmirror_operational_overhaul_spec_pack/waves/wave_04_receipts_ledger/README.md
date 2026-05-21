# Wave 04 — Action Receipts and Immutable Execution Ledger

## Objective

Turn all policy actions into durable receipts that distinguish real Reddit execution, failed attempts, and log-only events.

## Branch / worktree

Recommended branch: `overhaul/w04-receipts-ledger`

## Agents to use

- Schema Agent
- Redis/Data Agent
- Audit Agent
- Frontend Agent
- Test Agent

## Tasks

1. Design `ActionReceipt` schema with target snapshot, policy snapshot, recommendation, selected action, execution attempt, execution result, override info, moderator, timestamps.
2. Store receipts in Redis sorted sets and per-target indexes.
3. Migrate or adapt current action/override event model without breaking existing tests.
4. Update Apply Policy confirm to write receipt for every confirmed action.
5. Update Review/Case Packet/Digest inputs to consume receipts where possible.
6. Add UI surfaces that show exactly what happened: live action, log-only, failed, skipped.

## Deliverables

- Receipt schema.
- Receipt storage service.
- Receipt list/detail APIs.
- Apply Policy receipt integration.
- Tests for receipt persistence and retrieval.

## Tests / verification

- type-check
- lint
- test
- build

## Constraints

Receipts must be accurate. Never mark a Reddit action as successful unless the execution service returned success.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
