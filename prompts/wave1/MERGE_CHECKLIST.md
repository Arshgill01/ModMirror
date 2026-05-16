# WAVE 1 MERGE CHECKLIST

Use this after parallel agents complete.

## Before Merge

```bash
git status
git branch --show-current
npm install
npm run build
```

Check each worktree:

- [ ] Agent A branch builds or has documented blocker.
- [ ] Agent B branch builds or has documented blocker.
- [ ] Agent C branch builds or has documented blocker.
- [ ] Agent D branch has no code conflicts risk.

## Merge Order

Recommended:

1. Docs/research sync
2. Shared contracts
3. Redis/data layer
4. Dashboard shell

```bash
git checkout main
git pull --ff-only

git merge --no-ff docs/wave1-research-sync
git merge --no-ff feat/wave1-shared-contracts
git merge --no-ff feat/wave1-redis-data-layer
git merge --no-ff feat/wave1-dashboard-shell
```

Replace `main` with `master` if needed.

## Conflict Rules

If conflicts happen:

- `RESEARCH.md`: keep the most specific verified Wave 0 facts.
- `TODO.md`: keep merged forward-looking tasks.
- shared schemas: prefer Agent A.
- Redis service logic: prefer Agent B.
- dashboard UI: prefer Agent C.
- product decisions: do not reopen locked decisions.

## Post-merge Checks

```bash
npm install
npm run build
npm test
```

If no tests exist, document that.

## Wave 1 Done Criteria

- [ ] Shared contracts compile.
- [ ] Redis helper/service skeleton exists.
- [ ] Dashboard shell loads.
- [ ] Health/status endpoint exists or placeholder is documented.
- [ ] Demo mode placeholder exists.
- [ ] Docs reflect Wave 0 findings.
- [ ] TODO.md points clearly to Wave 2.
- [ ] Build passes, or exact blocker is documented.

## Final Wave 1 Commit

```bash
git add .
git commit -m "feat: complete Wave 1 app skeleton and data contracts"
```

Only do this if merges were not already committed individually.
