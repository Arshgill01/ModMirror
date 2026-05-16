---
name: devvit-playtest-qa
description: Verify ModMirror in Devvit playtest, including login, upload/playtest commands, smoke endpoints, menu actions, forms, Redis, Reddit API reads, runtime logs, and documented blockers. Use whenever behavior must be proven in a real Reddit test subreddit.
---

# Devvit Playtest QA

Use this skill when local build proof is not enough.

## Preflight

Run:

```bash
npx devvit whoami
npm run type-check
npm run lint
npm run build
npm test
```

If `whoami` fails, stop runtime QA and document `devvit login` as the blocker.

## Playtest

Run:

```bash
npm run dev
```

Use a small test subreddit. Capture the exact subreddit name and whether Devvit created a default playtest subreddit.

## Smoke Checklist

Verify and document:

- `/api/health` returns app/subreddit/current-user context.
- `/api/smoke/redis` writes and reads the same value.
- `/api/smoke/reddit` returns current subreddit, current user, rules, removal reasons, and recent mod actions.
- Post menu action appears for moderators.
- Comment menu action appears for moderators.
- Menu actions receive `targetId`.
- First form can open a second form.
- Second form can read target author and write Redis.

## Behavior Tests

Use only safe test content:

- Submit comment to normal post/comment.
- Remove post/comment after comment submission.
- Try comment after removal.
- Try distinguish/sticky on the app comment.
- Try native Mod Note add/read/delete.
- Try modmail conversation if needed.

Do not run destructive tests on real community content.

## Documentation

Update `RESEARCH.md` with redacted runtime samples and exact errors. Update `TODO.md` with remaining blockers.
