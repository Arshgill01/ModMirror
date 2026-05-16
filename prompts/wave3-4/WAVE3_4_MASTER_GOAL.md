/goal

You are working in the ModMirror repository.

Your goal is to execute Wave 3 and Wave 4 end-to-end:

- Wave 3: Policy Agreement Flow
- Wave 4: Apply Policy Action

This must produce the first complete ModMirror policy loop:

> Mirror Scan drift candidate → create/edit policy → apply policy to target → show recommendation → nudge on deviation → record override audit.

## Start by Reading

Read these files before doing anything:

- `AGENTS.md`
- `PLAN.md`
- `TODO.md`
- `RESEARCH.md`
- `docs/PRODUCT.md`
- `docs/DECISIONS.md`
- `docs/DATA_MODEL.md`
- `docs/DEMO_SCRIPT.md`
- `docs/SUBMISSION_NOTES.md`
- `docs/WAVE3_4_EXECUTION_NOTES.md`
- `prompts/wave3-4/PREFLIGHT_DEVVIT_IDENTITY_FIX.md`
- `prompts/wave3-4/WAVE3_4_ORCHESTRATOR.md`
- `prompts/wave3-4/AGENT_A_POLICY_DATA_CONTRACTS.md`
- `prompts/wave3-4/AGENT_B_POLICY_DASHBOARD_UI.md`
- `prompts/wave3-4/AGENT_C_APPLY_POLICY_FLOW.md`
- `prompts/wave3-4/AGENT_D_ACTION_AUDIT_OVERRIDE.md`
- `prompts/wave3-4/AGENT_E_TESTS_DOCS_RUNTIME.md`
- `.codex/skills/devvit-research/SKILL.md`
- `.codex/skills/modmirror-product-guardrails/SKILL.md`
- `.codex/skills/wave-execution/SKILL.md`

## Non-negotiable Guardrails

Do not build:

- LLM/AI moderation,
- automatic ban engine,
- generic queue dashboard,
- Toolbox clone,
- appeal packet generator,
- external analytics service,
- cross-subreddit benchmarking.

Preserve:

- consistency-first thesis,
- human-in-the-loop enforcement,
- deterministic policy logic,
- honest confidence states,
- demo mode,
- log_only as safe default delivery mode,
- override reason on deviations,
- aggregate audit not individual blame.

## Step 0 — Confirm Clean Starting Point

Run:

```bash
git checkout master || git checkout main
git status
git log --oneline -5
```

If the repo uses `main`, use `main` everywhere below instead of `master`.

Ensure Wave 2 commit is present. The user reported Wave 2 ended at commit `e5da644` on `master`.

If working tree is dirty:

- inspect changes,
- do not discard user work,
- either commit appropriate prompt/docs changes or document blocker.

## Step 1 — Preflight: Fix Devvit App Identity / Runtime Blocker

Wave 2 local checks passed but `npm run dev` was blocked because the Devvit app identity did not exist or was not bound.

Follow `prompts/wave3-4/PREFLIGHT_DEVVIT_IDENTITY_FIX.md`.

You must:

1. Run:

```bash
npx devvit whoami
npx devvit version || true
npx devvit view --json || npx devvit view || true
cat devvit.json
npx devvit help
npx devvit help init || true
npx devvit help new || true
npx devvit help playtest || true
```

2. Resolve identity using the least destructive supported path.

Important:

- Do not overwrite source files.
- If `npx devvit init` exists and is the CLI-recommended binding command, inspect help first, then run it.
- If using `npx devvit new --here`, ensure it will not destroy the existing repo. Back up/commit first.
- If CLI cannot bind identity safely, document Developer Portal steps and exact blocker.

3. Re-run:

```bash
npm run build
npm test
npm run type-check || true
npm run lint || true
npm run dev
```

4. Update `RESEARCH.md` and `TODO.md` with runtime status.

If runtime remains blocked by an external app identity issue, continue Wave 3/4 implementation only if local checks are green and the blocker is clearly documented.

## Step 2 — Create Wave 3/4 Worktrees

Create/reuse worktrees:

```bash
mkdir -p ../modmirror-worktrees

git worktree add ../modmirror-worktrees/w34-policy-data -b feat/wave3-policy-data-contracts master || true
git worktree add ../modmirror-worktrees/w34-policy-ui -b feat/wave3-policy-dashboard-ui master || true
git worktree add ../modmirror-worktrees/w34-apply-flow -b feat/wave4-apply-policy-flow master || true
git worktree add ../modmirror-worktrees/w34-audit -b feat/wave4-action-audit-override master || true
git worktree add ../modmirror-worktrees/w34-tests-docs -b test/wave3-4-tests-docs master || true
```

If repo uses `main`, replace `master` with `main`.

If branches already exist, inspect and reuse safely. Do not delete worktrees without checking for uncommitted work.

## Step 3 — Execute Each Pass Sequentially

You are one agent controlling the whole wave. Execute each pass one by one, as if they were separate agents.

### Pass A — Policy Data Contracts

In `../modmirror-worktrees/w34-policy-data`, execute:

`prompts/wave3-4/AGENT_A_POLICY_DATA_CONTRACTS.md`

Requirements:

- shared policy types,
- Redis policy persistence,
- recommendation logic,
- no-policy/small-subreddit states,
- tests.

Commit changes on branch:

```bash
git add .
git commit -m "feat: add policy data contracts and recommendation logic"
```

### Pass B — Policy Dashboard UI

In `../modmirror-worktrees/w34-policy-ui`, execute:

`prompts/wave3-4/AGENT_B_POLICY_DASHBOARD_UI.md`

Requirements:

- policy overview,
- create policy from drift candidate,
- manual policy creation,
- policy edit,
- empty policy fallback,
- small subreddit copy,
- demo mode support.

Commit changes:

```bash
git add .
git commit -m "feat: add policy agreement dashboard flow"
```

### Pass C — Action Audit + Override

In `../modmirror-worktrees/w34-audit`, execute:

`prompts/wave3-4/AGENT_D_ACTION_AUDIT_OVERRIDE.md`

Requirements:

- action event model/service,
- override event model/service,
- deviation override reason enforcement,
- aggregate dashboard/API summary,
- tests.

Commit changes:

```bash
git add .
git commit -m "feat: add action audit and override tracking"
```

### Pass D — Apply Policy Flow

In `../modmirror-worktrees/w34-apply-flow`, execute:

`prompts/wave3-4/AGENT_C_APPLY_POLICY_FLOW.md`

Requirements:

- post/comment menu action if verified,
- dashboard simulator fallback if menu is blocked,
- select policy/rule,
- preview recommendation,
- confirm action,
- `log_only` default delivery,
- integrate override flow if selected action deviates,
- tests.

Commit changes:

```bash
git add .
git commit -m "feat: add apply policy flow"
```

### Pass E — Tests, Docs, Runtime

In `../modmirror-worktrees/w34-tests-docs`, execute:

`prompts/wave3-4/AGENT_E_TESTS_DOCS_RUNTIME.md`

Requirements:

- integration tests,
- manual QA checklist,
- docs sync,
- audit vulnerability note,
- runtime verification attempt.

Commit changes:

```bash
git add .
git commit -m "test: add wave 3 4 coverage and docs"
```

## Step 4 — Integrate

Return to main repo.

Create integration branch:

```bash
git checkout master || git checkout main
git checkout -b integration/wave3-4-policy-loop || git checkout integration/wave3-4-policy-loop
```

Merge in order:

```bash
git merge --no-ff feat/wave3-policy-data-contracts
git merge --no-ff feat/wave3-policy-dashboard-ui
git merge --no-ff feat/wave4-action-audit-override
git merge --no-ff feat/wave4-apply-policy-flow
git merge --no-ff test/wave3-4-tests-docs
```

Resolve conflicts carefully.

Conflict priorities:

1. preserve shared schema/service contracts,
2. preserve tests,
3. preserve product guardrails,
4. preserve docs updates,
5. preserve demo mode.

## Step 5 — Verify Integration

Run:

```bash
npm install
npm run build
npm test
npm run type-check || true
npm run lint || true
npx devvit whoami
npm run dev
```

If `npm run dev` is long-running and reaches Playtest ready, record success then stop it with Ctrl+C.

If any command fails:

- fix if within Wave 3/4 scope,
- rerun checks,
- do not merge to master until local checks pass,
- document unresolved runtime-only blockers.

Run audit:

```bash
npm audit || true
```

Do not run `npm audit fix --force`.

Document audit status.

## Step 6 — Update Docs

Ensure these files reflect actual implementation:

- `TODO.md`
- `RESEARCH.md`
- `docs/DATA_MODEL.md`
- `docs/DEMO_SCRIPT.md`
- `docs/SUBMISSION_NOTES.md`
- `docs/WAVE3_4_EXECUTION_NOTES.md`

Add a completion report with:

- summary,
- files changed,
- commands run,
- pass/fail status,
- runtime status,
- open risks,
- next recommended wave.

Commit integration fixes/docs:

```bash
git add .
git commit -m "chore: integrate wave 3 4 policy loop" || true
```

## Step 7 — Merge to Master/Main and Push

Only if checks pass:

```bash
git checkout master || git checkout main
git merge --no-ff integration/wave3-4-policy-loop
git push origin master || git push origin main
```

If checks do not pass:

- do not merge to master/main,
- leave integration branch,
- document exact blocker.

## Definition of Done

Wave 3/4 is complete only when:

- Devvit identity/playtest blocker is fixed or precisely documented.
- Policy creation works.
- Policy editing works.
- Policy list/overview works.
- Policy can be created from drift candidate.
- No-policy fallback works.
- Small-subreddit fallback works.
- Apply Policy preview works.
- Apply Policy confirm works in `log_only` mode.
- Deviating actions require override reason.
- Override events are stored.
- Action events are stored.
- Dashboard shows policy and override state.
- Demo mode supports full loop.
- Tests pass.
- Build passes.
- Typecheck/lint pass or documented with exact non-blocking reason.
- Runtime playtest attempted and documented.
- Master/main pushed only after green checks.

## Final Report

At the end, output:

- what changed,
- commands run,
- pass/fail status,
- runtime playtest status,
- commit hash on master/main if pushed,
- open risks,
- recommended Wave 5 scope.
