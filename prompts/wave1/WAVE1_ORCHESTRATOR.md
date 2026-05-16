# WAVE 1 ORCHESTRATOR — ModMirror

Use this prompt in the main repo/worktree before launching parallel agents.

## Goal

Coordinate Wave 1: App Skeleton + Data Contracts.

Wave 1 must create the stable internal structure for future implementation, without building the full product.

## Read First

Read:

- AGENTS.md
- PLAN.md
- TODO.md
- RESEARCH.md
- docs/PRODUCT.md
- docs/DECISIONS.md
- docs/DATA_MODEL.md
- docs/DEVVIT_RESEARCH_QUESTIONS.md
- .codex/skills/devvit-research/SKILL.md
- .codex/skills/modmirror-product-guardrails/SKILL.md
- .codex/skills/wave-execution/SKILL.md

## Wave 1 Scope

Build only the skeleton and contracts needed for later waves:

1. Shared TypeScript schemas/constants.
2. Redis key helper and persistence interface.
3. Server route/API shape.
4. Dashboard shell and navigation.
5. Demo mode flag/hook.
6. Health/status endpoint.
7. Documentation updates based on Wave 0.

Do not implement full Mirror Scan, attribution scoring, policy editor, or Apply Policy flow yet.

## Recommended Parallel Agents

Launch these as separate worktrees/branches:

1. Agent A — Shared Contracts
   - Branch: `feat/wave1-shared-contracts`
   - Prompt: `prompts/wave1/AGENT_A_SHARED_CONTRACTS.md`

2. Agent B — Redis/Data Layer
   - Branch: `feat/wave1-redis-data-layer`
   - Prompt: `prompts/wave1/AGENT_B_REDIS_DATA_LAYER.md`

3. Agent C — Dashboard Shell
   - Branch: `feat/wave1-dashboard-shell`
   - Prompt: `prompts/wave1/AGENT_C_DASHBOARD_SHELL.md`

4. Agent D — Docs/Research Sync
   - Branch: `docs/wave1-research-sync`
   - Prompt: `prompts/wave1/AGENT_D_DOCS_RESEARCH_SYNC.md`

## Worktree Commands

Replace `main` with `master` if this repo uses master.

```bash
git status
git branch --show-current

mkdir -p ../modmirror-worktrees

git worktree add ../modmirror-worktrees/w1-shared -b feat/wave1-shared-contracts main
git worktree add ../modmirror-worktrees/w1-redis -b feat/wave1-redis-data-layer main
git worktree add ../modmirror-worktrees/w1-dashboard -b feat/wave1-dashboard-shell main
git worktree add ../modmirror-worktrees/w1-docs -b docs/wave1-research-sync main
```

After each agent finishes:

```bash
git status
npm install
npm run build
```

Then merge in this order:

1. docs/wave1-research-sync
2. feat/wave1-shared-contracts
3. feat/wave1-redis-data-layer
4. feat/wave1-dashboard-shell

```bash
git checkout main
git pull --ff-only

git merge --no-ff docs/wave1-research-sync
git merge --no-ff feat/wave1-shared-contracts
git merge --no-ff feat/wave1-redis-data-layer
git merge --no-ff feat/wave1-dashboard-shell

npm install
npm run build
```

If conflicts happen, prefer:
- shared schemas from Agent A,
- Redis implementation from Agent B,
- UI route/page structure from Agent C,
- RESEARCH/TODO truth from Agent D.

## Wave 1 Definition of Done

Wave 1 is done when:

- Shared schemas exist and compile.
- Redis key helper exists and is used by at least one smoke route/service.
- Server route/API structure exists.
- Dashboard shell loads.
- Health/status endpoint works.
- Demo mode flag/state exists.
- TODO.md is updated for Wave 2.
- RESEARCH.md remains accurate.
- `npm run build` or equivalent passes, or exact blocker is documented.
