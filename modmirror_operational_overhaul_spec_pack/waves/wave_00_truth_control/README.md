# Wave 00 — Truth Reset, Control Room, and Execution Spine

## Objective

Create the operational-overhaul control layer before product work. This wave prevents another vague wave plan from drifting into premature polish.

## Branch / worktree

Recommended branch: `overhaul/w00-truth-and-control`

## Agents to use

- Repo Audit Agent
- Planning Agent
- QA Baseline Agent
- Docs Agent

## Tasks

1. Create `docs/operational-overhaul/` and seed execution log, current repo truth, active risks, branch map, and wave status board.
2. Run baseline `npm install` if needed, `npm run type-check`, `npm run lint`, `npm test`, and `npm run build`.
3. Record exact failures/warnings without hiding them.
4. Audit `devvit.json`, route list, API surface, and current menu/form endpoints.
5. Create a capability matrix: verified, type/build-only, unverified, disabled.
6. Establish integration branch strategy and create worktrees for critical path waves.

## Deliverables

- `docs/operational-overhaul/EXECUTION_LOG.md`
- `docs/operational-overhaul/CURRENT_REPO_TRUTH.md`
- `docs/operational-overhaul/CAPABILITY_MATRIX.md`
- `docs/operational-overhaul/WAVE_STATUS.md`
- Baseline command results committed.

## Tests / verification

- type-check
- lint
- test
- build

## Constraints

Do not alter product behavior yet except docs/control files. No submission work.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
