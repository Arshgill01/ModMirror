# Wave 14 — Integration, Conflict Resolution, and Product Coherence

## Objective

Merge the operational overhaul lanes, resolve conflicts, and make the product coherent without doing submission work.

## Branch / worktree

Recommended branch: `integration/operational-overhaul`

## Agents to use

- Integration Agent
- QA Agent
- Docs Agent
- Frontend Agent

## Tasks

1. Merge wave branches into integration branch in dependency order.
2. Resolve schema/service/UI conflicts.
3. Run whole-repo command suite.
4. Run targeted tests for critical safety paths.
5. Remove dead code and duplicate demo fallbacks that now conflict with real flows.
6. Ensure docs reflect product truth.
7. Open PR(s) back to master with implementation summary and risk notes.

## Deliverables

- Integration branch.
- PR(s).
- Final build-run report for operational overhaul.
- Updated wave status board.

## Tests / verification

- type-check
- lint
- test
- build
- targeted runtime QA if possible

## Constraints

No Devpost/submission/publish work. This is integration only.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
