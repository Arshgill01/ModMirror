# Wave 02 — Target-Aware Policy Recommendation Core

## Objective

Make policy recommendation target-aware so the app can recommend from real post/comment context rather than dashboard-only simulator state.

## Branch / worktree

Recommended branch: `overhaul/w02-recommendation-core`

## Agents to use

- Schema Agent
- Recommendation Agent
- Policy Agent
- Test Agent

## Tasks

1. Extend shared schema for target-aware policy application requests.
2. Represent target context, target snapshots, selected policy, recommended action, selected action, confidence/evidence, and fallback states.
3. Refactor `previewApplyPolicy` so it can accept real target context and still support simulator/demo mode.
4. Make offense-count logic explicit and document limitations when history is incomplete.
5. Return a preview object that can drive a confirmation UI: what action is recommended, why, evidence, policy version, what will happen if confirmed.
6. Add strict input validation.

## Deliverables

- Target-aware Apply Policy preview contract.
- Updated service implementation.
- Updated API route(s).
- Tests for no-policy, policy-found, deviation, missing target, unsupported target.

## Tests / verification

- type-check
- lint
- test
- build

## Constraints

Do not execute Reddit actions yet. Preview only.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
