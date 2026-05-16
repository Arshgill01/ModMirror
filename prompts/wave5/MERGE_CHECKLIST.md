# MERGE_CHECKLIST.md — Wave 5 Governance Core

Use this checklist before merging Wave 5 into master/main.

## Branches

Expected branches:

- [ ] feat/wave5-policy-versioning
- [ ] feat/wave5-policy-health-engine
- [ ] feat/wave5-override-review
- [ ] feat/wave5-governance-dashboard
- [ ] test/wave5-docs-runtime
- [ ] integration/wave5-governance-core

## Pre-merge

- [ ] Default branch is clean.
- [ ] All Wave 5 branches have committed work.
- [ ] Each branch has a completion report or clear commit messages.
- [ ] No branch includes Wave 6 case packet work.
- [ ] No external service was added.
- [ ] No LLM/AI classifier was added.

## Integration Branch

```bash
git checkout master # or main
git pull --ff-only
git checkout -b integration/wave5-governance-core
```

Merge in recommended order:

```bash
git merge --no-ff feat/wave5-policy-versioning
git merge --no-ff feat/wave5-override-review
git merge --no-ff feat/wave5-policy-health-engine
git merge --no-ff feat/wave5-governance-dashboard
git merge --no-ff test/wave5-docs-runtime
```

Resolve conflicts carefully.

## Required Checks

Run available commands:

```bash
npm install
npm run build
npm run type-check
npm run lint
npm test
npx devvit whoami
npm run dev
```

If a command does not exist or runtime is blocked, document it in the final report.

## Functional Checks

- [ ] Policy edit creates a new version.
- [ ] Old policy version remains readable.
- [ ] Apply Policy actions store active policy version/snapshot.
- [ ] Override review inbox lists unresolved overrides.
- [ ] Override status can be updated.
- [ ] Policy health cards render.
- [ ] Insufficient-data state renders.
- [ ] Demo data still works.
- [ ] No per-mod blame dashboard is introduced.

## Merge to Default Branch

Only after checks pass:

```bash
git checkout master # or main
git merge --no-ff integration/wave5-governance-core
git push origin master # or main
```

## Final Report

Include:

- summary,
- branches created,
- files changed,
- commands run,
- pass/fail status,
- runtime status,
- open risks,
- pushed commit hash.
