# Wave 2 Merge Checklist

Use this after all Wave 2 branches finish.

## Pre-merge

From repo root:

```bash
git status
git branch --show-current
```

Ensure master/main is clean and current:

```bash
git checkout master
git pull --ff-only
```

Use `main` instead of `master` if needed.

Create integration branch:

```bash
git checkout -b integration/wave2-mirror-scan
```

## Merge Order

```bash
git merge --no-ff feat/wave2-attribution-engine
git merge --no-ff feat/wave2-demo-seed
git merge --no-ff feat/wave2-live-sources
git merge --no-ff feat/wave2-dashboard-scan
git merge --no-ff test/wave2-docs
```

Resolve conflicts carefully.

Schema/shared conflicts should be resolved in favor of the most complete typed contract.

## Verify

Run whatever exists in repo:

```bash
npm install
npm run build
npm test
npm run lint
npm run typecheck
```

If some commands do not exist, document that in `docs/WAVE2_COMPLETION_REPORT.md`.

## Manual Verification

- [ ] Dashboard loads.
- [ ] Demo scan runs.
- [ ] Demo scan shows Rule 2 drift.
- [ ] Live scan attempts gracefully.
- [ ] Confidence breakdown appears.
- [ ] Unmatched actions appear.
- [ ] Empty/small subreddit state is useful.
- [ ] No policy editor is accidentally implemented.
- [ ] No enforcement action is accidentally implemented.

## Final Merge

Once green:

```bash
git checkout master
git merge --no-ff integration/wave2-mirror-scan
git push origin master
```

Use `main` instead of `master` if needed.

## Cleanup Optional

Only after pushed and verified:

```bash
git worktree list
# git worktree remove ../modmirror-wave2-worktrees/<name>
```
