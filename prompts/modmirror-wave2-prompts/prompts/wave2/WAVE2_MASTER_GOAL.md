/goal

You are working in the ModMirror repository.

Your goal is to execute Wave 2 end-to-end: Mirror Scan + deterministic attribution + demo seed data + dashboard scan UI + tests/docs.

You must execute all Wave 2 prompt files one by one, using separate git worktrees/branches, then create an integration branch, merge everything, verify the build/tests, merge into master, and push if a remote is configured.

Do not stop until Wave 2 is complete, green, and documented, or until a hard external blocker is documented with exact commands/errors.

## Absolute Rules

1. Read all required context first.
2. Do not build beyond Wave 2.
3. Do not implement Policy Agreement Flow yet.
4. Do not implement Apply Policy Action yet.
5. Do not implement Override Audit workflow yet.
6. Do not add LLMs, external AI, or external services.
7. Do not hallucinate Devvit APIs.
8. If RESEARCH.md contradicts this prompt, RESEARCH.md wins.
9. Keep the product consistency-first.
10. Demo seed data is mandatory.
11. Make granular commits.
12. End with a clean integration merge and documented verification.

## Required Reading

Read these before changing files:

- `AGENTS.md`
- `PLAN.md`
- `TODO.md`
- `RESEARCH.md`
- `README.md`
- `docs/PRODUCT.md`
- `docs/DECISIONS.md`
- `docs/DATA_MODEL.md`
- `docs/DEMO_SCRIPT.md`
- `docs/DEVVIT_RESEARCH_QUESTIONS.md`
- any Wave 1 execution notes/completion report files that exist
- `.codex/skills/devvit-research/SKILL.md`
- `.codex/skills/modmirror-product-guardrails/SKILL.md`
- `.codex/skills/wave-execution/SKILL.md`
- `prompts/wave2/WAVE2_ORCHESTRATOR.md`
- `prompts/wave2/AGENT_A_LIVE_SOURCES.md`
- `prompts/wave2/AGENT_B_ATTRIBUTION_ENGINE.md`
- `prompts/wave2/AGENT_C_DEMO_SEED_DATA.md`
- `prompts/wave2/AGENT_D_DASHBOARD_SCAN_UI.md`
- `prompts/wave2/AGENT_E_TESTS_DOCS.md`
- `prompts/wave2/MERGE_CHECKLIST.md`

## Start State Checks

Run:

```bash
git status
git branch --show-current
git remote -v
npm install
```

Determine whether the default branch is `master` or `main`.

Use `master` if it exists, otherwise use `main`.

If there are uncommitted user changes, do not overwrite them. Commit only your own changes or stop with a clear report if safe progress is impossible.

## Worktree Setup

Create a worktree root outside the repo:

```bash
mkdir -p ../modmirror-wave2-worktrees
```

From the clean default branch, create these worktrees:

```bash
git worktree add ../modmirror-wave2-worktrees/w2-attribution -b feat/wave2-attribution-engine <default-branch>
git worktree add ../modmirror-wave2-worktrees/w2-demo -b feat/wave2-demo-seed <default-branch>
git worktree add ../modmirror-wave2-worktrees/w2-live -b feat/wave2-live-sources <default-branch>
git worktree add ../modmirror-wave2-worktrees/w2-dashboard -b feat/wave2-dashboard-scan <default-branch>
git worktree add ../modmirror-wave2-worktrees/w2-tests-docs -b test/wave2-docs <default-branch>
```

Replace `<default-branch>` with `master` or `main`.

If a worktree/branch already exists, inspect it. Reuse it only if it is clearly the intended Wave 2 branch and safe.

## Execution Order

Even though separate worktrees are used, execute in this order to reduce conflicts:

1. Attribution engine
2. Demo seed data
3. Live sources
4. Dashboard scan UI
5. Tests/docs
6. Integration branch merge
7. Final verification
8. Merge to default branch
9. Push if remote exists

## Part 1 — Attribution Engine

Worktree:

```txt
../modmirror-wave2-worktrees/w2-attribution
```

Use prompt:

```txt
prompts/wave2/AGENT_B_ATTRIBUTION_ENGINE.md
```

Implement deterministic attribution as pure/testable code.

Required capabilities:

- text normalization,
- exact rule number matching,
- removal reason title/rule title matching,
- keyword overlap matching,
- confidence labels,
- evidence strings,
- no LLMs.

Commit granularly.

Before leaving this worktree, run available checks such as:

```bash
npm run build
npm test
npm run typecheck
```

If a command does not exist, record that for the completion report.

## Part 2 — Demo Seed Data

Worktree:

```txt
../modmirror-wave2-worktrees/w2-demo
```

Use prompt:

```txt
prompts/wave2/AGENT_C_DEMO_SEED_DATA.md
```

Implement mandatory demo data for `r/ExampleLearning` or equivalent.

Required scenario:

- Rule 1: Be civil
- Rule 2: Low-effort questions
- Rule 3: Self-promotion
- 50-80 actions
- obvious Rule 2 enforcement drift
- some unmatched/noisy actions
- demo output uses the same source/scan shape as live mode

Commit granularly.

Run available checks.

## Part 3 — Live Sources

Worktree:

```txt
../modmirror-wave2-worktrees/w2-live
```

Use prompt:

```txt
prompts/wave2/AGENT_A_LIVE_SOURCES.md
```

Implement the live source adapter using only APIs verified in `RESEARCH.md` or generated typings.

Required sources where verified:

- mod log,
- removal reasons,
- rules.

If any API is not available, do not fake live results. Return warnings and graceful empty values.

Commit granularly.

Run available checks.

## Part 4 — Dashboard Scan UI

Worktree:

```txt
../modmirror-wave2-worktrees/w2-dashboard
```

Use prompt:

```txt
prompts/wave2/AGENT_D_DASHBOARD_SCAN_UI.md
```

Implement the dashboard Mirror Scan UI.

Required UI states:

- initial empty state,
- loading state,
- error state,
- demo data label,
- live scan warnings,
- scan summary,
- confidence breakdown,
- drift candidate cards,
- unmatched count,
- small-subreddit fallback.

Do not implement policy creation yet. Use placeholder/disabled CTA:

> Create policy — coming in Wave 3

Commit granularly.

Run available checks.

## Part 5 — Tests and Docs

Worktree:

```txt
../modmirror-wave2-worktrees/w2-tests-docs
```

Use prompt:

```txt
prompts/wave2/AGENT_E_TESTS_DOCS.md
```

Add or update:

- tests/verification for attribution,
- tests/verification for demo scan,
- `TODO.md`,
- `RESEARCH.md` if new Devvit findings emerged,
- `docs/DATA_MODEL.md` if implemented shapes differ,
- `docs/WAVE2_COMPLETION_REPORT.md`.

This branch may need to wait until the other branches exist or may be finalized during integration. If needed, leave placeholders and complete the report on the integration branch.

Commit granularly.

Run available checks.

## Integration Branch

Return to the main repo.

Create integration branch:

```bash
git checkout <default-branch>
git pull --ff-only || true
git checkout -b integration/wave2-mirror-scan
```

Merge in this order:

```bash
git merge --no-ff feat/wave2-attribution-engine
git merge --no-ff feat/wave2-demo-seed
git merge --no-ff feat/wave2-live-sources
git merge --no-ff feat/wave2-dashboard-scan
git merge --no-ff test/wave2-docs
```

Resolve conflicts carefully.

Conflict resolution rules:

1. Preserve shared schema compatibility.
2. Preserve deterministic attribution behavior.
3. Preserve demo seed mode.
4. Preserve dashboard states.
5. Do not delete docs updates unless they are stale duplicates.
6. If branch implementations conflict, choose the version that is more typed, more tested, and closer to AGENTS.md/RESEARCH.md.

## Final Integration Work

On `integration/wave2-mirror-scan`, wire everything together so the product flow works:

1. Dashboard calls scan endpoint/service.
2. Demo scan runs through real attribution pipeline.
3. Live scan uses live source adapter and handles sparse/failing data gracefully.
4. Scan result shape is shared/typed.
5. Confidence breakdown totals are correct.
6. Drift candidates render in UI.
7. Docs reflect actual implementation.

If the test/docs branch could not complete earlier, finish `docs/WAVE2_COMPLETION_REPORT.md` now.

## Verification

Run all available commands:

```bash
npm install
npm run build
npm test
npm run typecheck
npm run lint
```

If some commands are not defined, document that in `docs/WAVE2_COMPLETION_REPORT.md`.

Also manually verify if possible:

- Dashboard loads.
- Demo scan works.
- Demo scan shows Rule 2 drift.
- Confidence labels appear.
- Unmatched count appears.
- Live scan handles sparse data/warnings.
- No policy editor is implemented.
- No apply-policy enforcement action is implemented.
- No LLM/external API has been added.

## Documentation Updates

Ensure these are updated:

- `TODO.md`
- `RESEARCH.md` if needed
- `docs/DATA_MODEL.md` if needed
- `docs/WAVE2_COMPLETION_REPORT.md`

`docs/WAVE2_COMPLETION_REPORT.md` must include:

```md
# Wave 2 Completion Report

## Summary

## Files Changed

## Commands Run

## Tests / Checks

## Verified Behavior

## Known Issues

## Devvit Findings Added

## Ready for Wave 3?

## Recommended Wave 3 Scope
```

## Final Merge to Default Branch

Only after verification passes or acceptable limitations are clearly documented:

```bash
git checkout <default-branch>
git merge --no-ff integration/wave2-mirror-scan
```

Then run at least:

```bash
npm run build
```

If remote exists, push:

```bash
git push origin <default-branch>
```

## Completion Response

End with a concise report:

1. Branches created
2. Major files changed
3. Features completed
4. Commands run and results
5. Any limitations
6. Whether pushed to remote
7. Exact recommended Wave 3 starting point

Remember: Wave 2 is Mirror Scan + Attribution only. Do not drift into Wave 3.
