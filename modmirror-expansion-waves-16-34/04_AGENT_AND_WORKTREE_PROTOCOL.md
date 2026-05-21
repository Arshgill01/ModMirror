# Agent and Worktree Protocol

This is deliberately too large for a five-minute run.

Use multiple worktrees and focused branches when safe.

## Sub-agents

Use sub-agents for:
- Devvit/runtime research,
- architecture review,
- UI critique,
- test design,
- migration review,
- safety/privacy review,
- branch integration review.

Do not give UI agents vague autonomy. Use exact design constraints:
- evidence-first layouts,
- ledgers/timelines/review queues,
- minimal generic card grids,
- clear status labeling,
- no unsupported claims.

## Commit discipline

Use explicit commits like:
- `docs: reload expansion context`
- `feat: add content snapshot model`
- `test: cover content snapshot retention`
- `fix: gate unsafe delivery modes`

## Checks per wave

At minimum:
- `npm run type-check`
- `npm run lint`
- relevant tests
- full tests if touching shared schema/scoring/routes
- `npm run build`

Runtime playtest whenever touching Devvit runtime behavior.
