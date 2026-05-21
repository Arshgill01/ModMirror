# Wave 11 — Mod-Team Delivery Spike

## Objective

Verify mod discussion/modmail/scheduler delivery paths and add preview-first delivery only if safe.

## Branch / worktree

Recommended branch: `overhaul/w11-team-delivery-spike`

## Agents to use

- Runtime Research Agent
- Delivery Agent
- Safety Agent
- Test Agent

## Tasks

1. Research/verify modmail or internal mod discussion APIs.
2. Research/verify scheduler APIs separately.
3. Build delivery capability states: unavailable, unverified, verified_disabled, enabled.
4. Add digest/policy proposal delivery preview, not automatic delivery.
5. Only enable actual delivery after explicit moderator confirmation and runtime proof.
6. Store delivery receipts.
7. Keep manual Markdown copy fallback.

## Deliverables

- Delivery spike report.
- Capability state service.
- Preview-first delivery APIs if viable.
- Delivery receipts if viable.

## Tests / verification

- type-check
- lint
- test
- build
- runtime proof if possible

## Constraints

No accidental user-facing messages. No scheduled posting without opt-in and proof.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
