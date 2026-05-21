# Wave 08 — True Multi-Mod Policy Agreement Workflow

## Objective

Make Policy Agreement real: draft/propose/review/adopt/supersede instead of instant one-mod policy CRUD.

## Branch / worktree

Recommended branch: `overhaul/w08-policy-agreement`

## Agents to use

- Schema Agent
- Policy Workflow Agent
- Frontend Agent
- Test Agent

## Tasks

1. Add policy lifecycle states: draft, proposed, under_review, adopted, superseded, archived.
2. Add proposal metadata: proposedBy, proposedAt, rationale, source drift candidate/scan.
3. Add review records: reviewer, decision, note, timestamp.
4. Add adoption rules: manual adopt by authorized moderator; optional approval threshold if feasible.
5. Ensure active policy selection uses adopted policy versions by default.
6. Update UI copy from generic policy editor to agreement workflow.
7. Keep single-mod fallback but label it honestly.

## Deliverables

- Policy lifecycle schema.
- Policy proposal/review/adoption APIs.
- UI for proposing/reviewing/adopting policies.
- Tests for lifecycle transitions and invalid transitions.

## Tests / verification

- type-check
- lint
- test
- build

## Constraints

Do not call it agreement unless review/adoption artifacts exist.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
