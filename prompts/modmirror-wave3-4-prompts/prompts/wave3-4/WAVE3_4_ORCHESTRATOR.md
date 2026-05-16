# WAVE3_4_ORCHESTRATOR.md

## Mission

Coordinate Wave 3 and Wave 4 implementation:

- Wave 3: Policy Agreement Flow
- Wave 4: Apply Policy Action

Build the complete policy loop:

> drift candidate → policy creation → policy persistence → apply policy → consistency nudge → override audit

## Branch/Worktree Plan

Create worktrees/branches:

```bash
mkdir -p ../modmirror-worktrees

git worktree add ../modmirror-worktrees/w34-policy-data -b feat/wave3-policy-data-contracts master
git worktree add ../modmirror-worktrees/w34-policy-ui -b feat/wave3-policy-dashboard-ui master
git worktree add ../modmirror-worktrees/w34-apply-flow -b feat/wave4-apply-policy-flow master
git worktree add ../modmirror-worktrees/w34-audit -b feat/wave4-action-audit-override master
git worktree add ../modmirror-worktrees/w34-tests-docs -b test/wave3-4-tests-docs master
```

If branches/worktrees already exist, reuse them safely or create `-v2` suffixed names.

## Prompt Mapping

- `w34-policy-data` → `AGENT_A_POLICY_DATA_CONTRACTS.md`
- `w34-policy-ui` → `AGENT_B_POLICY_DASHBOARD_UI.md`
- `w34-apply-flow` → `AGENT_C_APPLY_POLICY_FLOW.md`
- `w34-audit` → `AGENT_D_ACTION_AUDIT_OVERRIDE.md`
- `w34-tests-docs` → `AGENT_E_TESTS_DOCS_RUNTIME.md`

## Recommended Merge Order

Merge into `integration/wave3-4-policy-loop` in this order:

1. `feat/wave3-policy-data-contracts`
2. `feat/wave3-policy-dashboard-ui`
3. `feat/wave4-action-audit-override`
4. `feat/wave4-apply-policy-flow`
5. `test/wave3-4-tests-docs`

Resolve conflicts carefully.

## Verification

Run:

```bash
npm install
npm run build
npm test
npm run type-check || true
npm run lint || true
npm run dev
```

Document runtime result.

## Final Merge

Only after green checks:

```bash
git checkout master
git merge --no-ff integration/wave3-4-policy-loop
git push origin master
```

If checks are not green, do not merge to master. Leave integration branch with notes.
