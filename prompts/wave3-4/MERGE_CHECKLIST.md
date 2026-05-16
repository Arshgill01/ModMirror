# MERGE_CHECKLIST.md — Wave 3/4

## Before Merge

- [ ] Each worktree branch has committed changes.
- [ ] Each branch updated TODO.md with relevant notes or final integration branch does so.
- [ ] No unrelated formatting churn.
- [ ] No external services added.
- [ ] No LLM/AI features added.
- [ ] No automatic bans added.
- [ ] Message delivery defaults to `log_only`.

## Merge Order

Into `integration/wave3-4-policy-loop`:

1. `feat/wave3-policy-data-contracts`
2. `feat/wave3-policy-dashboard-ui`
3. `feat/wave4-action-audit-override`
4. `feat/wave4-apply-policy-flow`
5. `test/wave3-4-tests-docs`

## Conflict Guidance

If conflicts occur:

- preserve shared schema from policy-data branch unless later branch has necessary additions,
- preserve service names used by tests,
- preserve dashboard integration from policy-ui branch,
- preserve audit requirements from audit branch,
- prefer integration test expectations over untested assumptions.

## Required Checks

```bash
npm install
npm run build
npm test
npm run type-check || true
npm run lint || true
npx devvit whoami
npm run dev
```

## Must Update

- [ ] `TODO.md`
- [ ] `RESEARCH.md`
- [ ] `docs/DATA_MODEL.md`
- [ ] `docs/DEMO_SCRIPT.md`
- [ ] `docs/SUBMISSION_NOTES.md`

## Before Master Merge

- [ ] Build passes.
- [ ] Tests pass.
- [ ] Typecheck passes or known non-blocking limitation documented.
- [ ] Lint passes or known non-blocking limitation documented.
- [ ] Playtest attempted.
- [ ] Runtime status documented.
- [ ] Integration branch reviewed.

## Final Commands

```bash
git checkout master
git merge --no-ff integration/wave3-4-policy-loop
git push origin master
```

If repo uses `main`, replace `master` with `main`.
