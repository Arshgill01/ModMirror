/goal

You are continuing work on the ModMirror repository after the previous operational-overhaul waves have already been partially or fully executed.

This is a continuation build pass, not a replacement pass and not a submission pass.

## Absolute framing

ModMirror must become a real-world useful moderation product, not merely a polished demo dashboard.

The product north star is:

> A moderator opens a Reddit post/comment, sees the team policy, comparable historical cases, safety constraints, and recommended action, confirms the action, ModMirror executes the safe verified Reddit operation, logs an immutable receipt, and later proves whether policy consistency improved.

You must continue beyond the existing operational-overhaul waves and implement the expansion waves in this folder.

## Mandatory repo-context reload before coding

Before writing any production code, read and index the current repository state. The repo has changed since the previous prompt pack. Do not assume the old state.

Read at least:

- `AGENTS.md`
- `PLAN.md`
- `README.md`
- `TODO.md`
- `RESEARCH.md`
- `TREE.txt`
- `package.json`
- `devvit.json`
- all ExecPlan / execution plan / wave plan / report files under repo root, `docs/`, `prompts/`, `.codex/`, and `scripts/`
- source code under `src/index.ts`, `src/routes/**`, `src/server/services/**`, `src/shared/**`, `src/client/**`
- all tests under `src/**/*.test.ts`
- any prior operational-overhaul spec folder
- current git branch state, recent commits, unmerged worktrees, and open local branches

Create or update:

`docs/expansion-waves/REPO_CONTEXT_RELOAD.md`

It must summarize:
- what prior waves are already implemented,
- what is incomplete,
- what branches/worktrees exist,
- what runtime capabilities are proven vs type-only,
- what code paths are real vs demo fallback,
- what files are most dangerous to modify,
- what this continuation pass will build next.

Do not proceed to implementation until this file exists.

## Build-only boundary

Do not do:
- Devpost submission,
- app listing polish,
- final demo video,
- marketing copy,
- public publish,
- claiming partnerships,
- contacting communities,
- final launch hardening as a submission task.

You may improve product copy only when required for in-app clarity or safety.

## Worktree and branch protocol

Use worktrees and branches. Do not do one giant branch unless the repo is already in a state where worktrees would cause harm.

Suggested branch families:

- `expansion/w16-context-intake`
- `expansion/w17-modqueue-triage`
- `expansion/w18-attribution-calibration`
- `expansion/w19-policy-ratification`
- `expansion/w20-replay-sandbox`
- `expansion/w21-community-health`
- `expansion/w22-policy-impact`
- `expansion/w23-macro-library`
- `expansion/w24-mod-notes`
- `expansion/w25-appeal-modmail`
- `expansion/w26-evidence-board`
- `expansion/w27-incident-mode`
- `expansion/w28-config-portability`
- `expansion/w29-multi-community`
- `expansion/w30-privacy-controls`
- `expansion/w31-mobile-resilience`
- `expansion/w32-synthetic-eval`
- `expansion/w33-observability`
- `expansion/w34-integration`

Use small, reviewable commits. Use PRs if available in the workflow. Keep integration branches explicit.

## Tooling expectations

Use every relevant tool available:
- repo search,
- TypeScript compiler,
- test runner,
- lint,
- build,
- Devvit playtest where possible,
- browser automation / Playwright / screenshots if available,
- sub-agents if available,
- Gemini/Claude/design-review helpers if already configured,
- web search when checking current Devvit/API behavior or external model/API capability.

Do not assume Devvit runtime behavior from typings alone. If behavior is type-only, mark it as type-only and build safe fallback paths.

## Product quality bar

Every wave must improve real product utility. Avoid shallow widgets.

Every wave must answer one of:
- Does this save a moderator time?
- Does this reduce harmful inconsistency?
- Does this make a moderation action safer?
- Does this make a team policy more enforceable?
- Does this produce useful evidence for future review?
- Does this make the app more reliable in real Reddit runtime?

If the answer is no, do not build it.

## Execution target

Implement Waves 16–34 from this spec pack, adapting to the actual repo state after the current operational-overhaul run.

You may merge/split waves if necessary, but document why in:

`docs/expansion-waves/EXECUTION_DECISIONS.md`

At the end, produce:

`docs/expansion-waves/BUILD_REPORT.md`

This is not a submission report. It is a build report:
- implemented features,
- branches/worktrees used,
- tests run,
- runtime proofs obtained,
- known gaps,
- next engineering risks.
