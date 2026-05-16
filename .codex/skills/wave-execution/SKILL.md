---
name: wave-execution
description: Execute ModMirror work in scoped, verifiable waves with planning, small commits, validation, and wave reports. Use when starting, continuing, or completing any named Wave from PLAN.md or a multi-step repository task.
---

# Wave Execution

Use this skill to keep each ModMirror wave reviewable and buildable.

## Start Of Wave

1. Read `AGENTS.md`, `PLAN.md`, `TODO.md`, `RESEARCH.md`, and relevant `docs/`.
2. Check `git status --short --branch`.
3. If the task is large, ambiguous, cross-cutting, or expected to take more than 20 minutes, create or update an ExecPlan following repo guidance.
4. Identify the smallest implementation slice that can validate the approach.

## During Work

- Keep diffs scoped to the wave.
- Prefer existing Devvit Web/Hono/TypeScript patterns.
- Do not start later-wave features unless the current wave requires a small proof.
- Commit meaningful checkpoints instead of one giant commit.
- Preserve unrelated user changes.
- Update `RESEARCH.md` when new platform facts are discovered.
- Update `TODO.md` when done, blocked, or next steps change.
- Update `docs/DECISIONS.md` only when a real product or technical decision changes.

## Validation

Run targeted commands first, then broader checks as appropriate:

```bash
npm run type-check
npm run lint
npm run build
npm test
```

For Devvit runtime work, also run:

```bash
npx devvit whoami
npm run dev
```

Record exact failures. Do not claim playtest or Reddit behavior was verified unless it actually ran.

## End Of Wave Report

End with:

- what changed
- files touched
- commands run
- pass/fail status
- known issues/open risks
- next recommended wave

If the wave is blocked, state the exact command/error and the next unblock step.
