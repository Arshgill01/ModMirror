/goal

You are working in the ModMirror repository.

This is Wave 5 only: Governance Core.

Do not implement Wave 6 Case Packets yet.
Do not implement digest/scheduler yet.
Do not implement Calibration Mode.
Do not add AI/LLMs/external services.

Your mission is to execute all Wave 5 prompt files end-to-end, using separate worktrees/branches, integrating them, testing them, merging into the default branch, and pushing if all checks pass.

## Step 0 — Read context first

Read these files before changing code:

- AGENTS.md
- PLAN.md
- TODO.md
- RESEARCH.md
- README.md
- docs/PRODUCT.md
- docs/DECISIONS.md
- docs/DATA_MODEL.md
- docs/DEMO_SCRIPT.md
- docs/SUBMISSION_NOTES.md
- prompts/wave5/README.md
- prompts/wave5/WAVE5_ORCHESTRATOR.md
- prompts/wave5/AGENT_A_POLICY_VERSIONING.md
- prompts/wave5/AGENT_B_POLICY_HEALTH_ENGINE.md
- prompts/wave5/AGENT_C_OVERRIDE_REVIEW_INBOX.md
- prompts/wave5/AGENT_D_GOVERNANCE_DASHBOARD_UI.md
- prompts/wave5/AGENT_E_TESTS_DOCS_RUNTIME.md
- prompts/wave5/MERGE_CHECKLIST.md

Also inspect the current source tree because Wave 0-4 have already been implemented.

## Step 1 — Determine default branch and clean state

Determine whether the default branch is `master` or `main`.

Use:

```bash
git branch --show-current
git status --short
git remote -v
```

If the current branch is not the default branch, switch to the default branch.

If the working tree is dirty, inspect changes. Do not destroy user work. Commit relevant prompt/docs changes if they are intended, or stop and report exact blockers.

Attempt:

```bash
git pull --ff-only
```

If no upstream is configured, document it and continue from local default branch.

## Step 2 — Create Wave 5 worktrees

Create worktrees under `../modmirror-worktrees` unless the repo already uses a different convention.

Suggested branches:

```txt
feat/wave5-policy-versioning
feat/wave5-policy-health-engine
feat/wave5-override-review
feat/wave5-governance-dashboard
test/wave5-docs-runtime
integration/wave5-governance-core
```

Commands should be adapted for `master` vs `main`.

Do not delete existing worktrees unless you are certain they are stale and safe to remove. If a worktree/branch already exists, inspect it and reuse only if appropriate.

## Step 3 — Execute Agent A: Policy Versioning

In worktree `feat/wave5-policy-versioning`, execute:

- prompts/wave5/AGENT_A_POLICY_VERSIONING.md

Implementation requirements:

- immutable policy versions,
- active version pointer,
- policy change events,
- action logs stamped with policy version/snapshot,
- legacy/fallback behavior,
- tests.

Commit granularly.

Suggested commits:

```bash
git commit -m "feat: add policy version data model"
git commit -m "feat: stamp policy actions with active version"
git commit -m "test: cover policy version history"
```

## Step 4 — Execute Agent C: Override Review Inbox

In worktree `feat/wave5-override-review`, execute:

- prompts/wave5/AGENT_C_OVERRIDE_REVIEW_INBOX.md

Implementation requirements:

- override review statuses,
- default unresolved state,
- review update helper/API,
- list/filter overrides,
- tests.

Commit granularly.

Suggested commits:

```bash
git commit -m "feat: add override review state"
git commit -m "feat: add override review endpoints"
git commit -m "test: cover override review transitions"
```

## Step 5 — Execute Agent B: Policy Health Engine

In worktree `feat/wave5-policy-health-engine`, execute:

- prompts/wave5/AGENT_B_POLICY_HEALTH_ENGINE.md

Implementation requirements:

- pure deterministic health scoring,
- statuses stable/watch/at_risk/needs_review/insufficient_data,
- recommendations,
- API/service exposure,
- demo and sparse data support,
- tests.

Commit granularly.

Suggested commits:

```bash
git commit -m "feat: add policy health scoring"
git commit -m "feat: expose policy health summaries"
git commit -m "test: cover policy health statuses"
```

## Step 6 — Execute Agent D: Governance Dashboard UI

In worktree `feat/wave5-governance-dashboard`, execute:

- prompts/wave5/AGENT_D_GOVERNANCE_DASHBOARD_UI.md

Implementation requirements:

- governance overview,
- policy health cards,
- override review inbox UI,
- policy version summary,
- empty states,
- integration with APIs from other branches after merge.

If endpoints are not yet locally available in this branch, add minimal typed placeholders/mocks only if necessary, then reconcile during integration.

Commit granularly.

Suggested commits:

```bash
git commit -m "feat: add governance dashboard shell"
git commit -m "feat: add override review UI"
git commit -m "feat: add policy version summary UI"
```

## Step 7 — Execute Agent E: Tests, Docs, Runtime

In worktree `test/wave5-docs-runtime`, execute:

- prompts/wave5/AGENT_E_TESTS_DOCS_RUNTIME.md

This branch may mostly update docs/tests after integrating knowledge from the other branches. If it needs code changes, keep them small and test-focused.

Commit granularly.

Suggested commits:

```bash
git commit -m "docs: document wave 5 governance loop"
git commit -m "test: add wave 5 integration coverage"
```

## Step 8 — Integration branch

Return to default branch.

Create or switch to:

```txt
integration/wave5-governance-core
```

Merge in this order:

1. `feat/wave5-policy-versioning`
2. `feat/wave5-override-review`
3. `feat/wave5-policy-health-engine`
4. `feat/wave5-governance-dashboard`
5. `test/wave5-docs-runtime`

Resolve conflicts carefully.

Expected conflict zones:

- shared schema/types
- Redis helpers
- policy endpoints
- dashboard API client/types
- docs/DATA_MODEL.md
- TODO.md

Do not accept one side blindly if schemas diverge. Unify the models.

## Step 9 — Integration fixes

After merging branches, do a full integration pass.

Required outcomes:

- policy edit creates a new version,
- active version pointer is correct,
- old versions remain readable,
- Apply Policy stores policy version/snapshot,
- override review statuses work,
- policy health uses action/override data,
- dashboard renders health and inbox,
- demo mode still works,
- sparse data does not crash.

Make additional commits on integration branch if needed.

Suggested commit:

```bash
git commit -m "fix: integrate wave 5 governance flows"
```

## Step 10 — Run checks

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

If any script does not exist, document it.

If `npm run dev` is blocked by Devvit app identity/playtest configuration, do not pretend it passed. Update RESEARCH.md and TODO.md with the exact error and recommended fix.

If checks fail, fix them and rerun until green or until a real external blocker is documented.

## Step 11 — Documentation update

Before merging to default branch, ensure docs reflect final behavior:

- PLAN.md
- TODO.md
- RESEARCH.md if runtime facts changed
- README.md
- docs/PRODUCT.md
- docs/DECISIONS.md
- docs/DATA_MODEL.md
- docs/DEMO_SCRIPT.md
- docs/SUBMISSION_NOTES.md

TODO.md should point to Wave 6: Case Packet / Appeal Context.

## Step 12 — Merge and push

Only if build/typecheck/lint/tests pass, merge integration into default branch.

If default branch is `master`:

```bash
git checkout master
git merge --no-ff integration/wave5-governance-core
git push origin master
```

If default branch is `main`:

```bash
git checkout main
git merge --no-ff integration/wave5-governance-core
git push origin main
```

If remote push is unavailable, document it.

## Step 13 — Final report

Return a final report with:

### What changed

### Branches/worktrees created

### Commands run

### Pass/fail status

### Runtime/playtest status

### Important implementation details

### Open risks

### Recommended Wave 6 starting point

## Definition of Done

Wave 5 is done only when:

- policy version history exists,
- policy edits are immutable,
- action logs include policy version/snapshot,
- override review inbox exists,
- policy health engine exists,
- governance dashboard exposes health/inbox/version data,
- tests/checks pass,
- docs are updated,
- changes are merged into default branch,
- default branch is pushed if remote exists.
