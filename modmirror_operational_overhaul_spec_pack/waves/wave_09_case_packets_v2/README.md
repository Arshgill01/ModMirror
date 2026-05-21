# Wave 09 — Evidence-Rich Case Packets v2

## Objective

Upgrade Case Packets into serious evidence packets rooted in receipts, policy versions, target snapshots, and comparable cases.

## Branch / worktree

Recommended branch: `overhaul/w09-case-packets-v2`

## Agents to use

- Case Packet Agent
- Evidence Agent
- Frontend Agent
- Test Agent

## Tasks

1. Base packets on ActionReceipts when available.
2. Include target snapshot, policy snapshot, execution result, override context, comparable receipts/actions, and caveats.
3. Pull real target context where safe and available.
4. Add case packet types: appeal_context, internal_review, policy_dispute.
5. Make comparable cases stronger using receipts + scan history + rule/action family/offense bucket.
6. Render Markdown and UI document layout.
7. Clearly label inferred vs verified evidence.

## Deliverables

- Case Packet v2 schema/service.
- Updated APIs.
- Updated UI.
- Tests for receipt-backed packet, missing data, policy-changed-since-action.

## Tests / verification

- type-check
- lint
- test
- build

## Constraints

Case Packets are context, not automated appeal judgments.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
